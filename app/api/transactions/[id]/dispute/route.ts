import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id
  const txnId = params.id
  const body = await request.json()
  const { reason } = body as { reason?: string }

  const { data: txn, error } = await supabase
    .from('transactions')
    .select('id, buyer_id, escrow_state')
    .eq('id', txnId)
    .single()

  if (error || !txn) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (txn.buyer_id !== uid) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (txn.escrow_state !== 'held') {
    return NextResponse.json({ error: `Cannot dispute: state is ${txn.escrow_state}` }, { status: 400 })
  }

  // Keep funds held, mark dispute opened
  await supabase
    .from('transactions')
    .update({
      dispute_reason: reason ?? null,
      dispute_opened_at: new Date().toISOString(),
    })
    .eq('id', txnId)

  return NextResponse.json({ data: { escrow_state: 'held', disputed: true } })
}
