import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createRefund } from '@/lib/yookassa'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: me } = await supabase
    .from('users')
    .select('is_admin, is_moderator')
    .eq('id', session.user.id)
    .single()

  if (!me?.is_admin && !me?.is_moderator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const txnId = params.id

  const { data: txn, error } = await supabase
    .from('transactions')
    .select('id, payment_id, amount_rub, escrow_state, listing_id, dispute_opened_at')
    .eq('id', txnId)
    .single()

  if (error || !txn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (txn.escrow_state !== 'held') {
    return NextResponse.json({ error: `Cannot refund: state is ${txn.escrow_state}` }, { status: 400 })
  }

  try {
    await createRefund(txn.payment_id, txn.amount_rub)

    await supabase
      .from('transactions')
      .update({ escrow_state: 'refunded' })
      .eq('id', txnId)

    await supabase.from('listings').update({ status: 'approved' }).eq('id', txn.listing_id)

    return NextResponse.json({ data: { escrow_state: 'refunded' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refund failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
