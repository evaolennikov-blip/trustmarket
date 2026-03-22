import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { capturePayment } from '@/lib/yookassa'

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id
  const txnId = params.id

  const { data: txn, error } = await supabase
    .from('transactions')
    .select('id, buyer_id, amount_rub, payment_id, escrow_state')
    .eq('id', txnId)
    .single()

  if (error || !txn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (txn.buyer_id !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (txn.escrow_state !== 'held') {
    return NextResponse.json({ error: `Cannot confirm: state is ${txn.escrow_state}` }, { status: 400 })
  }

  try {
    await capturePayment(txn.payment_id, txn.amount_rub)
    // Optimistic update; webhook will also fire payment.succeeded
    await supabase
      .from('transactions')
      .update({ escrow_state: 'released', completed_at: new Date().toISOString() })
      .eq('id', txnId)

    return NextResponse.json({ data: { escrow_state: 'released' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Capture failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
