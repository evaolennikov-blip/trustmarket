import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhookBody } from '@/lib/yookassa'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// YooKassa IP ranges (https://yookassa.ru/developers/using-api/webhooks)
const YK_IP_PREFIXES = ['185.71.76.', '185.71.77.', '77.75.153.', '77.75.154.', '77.75.156.', '77.75.157.', '2a02:5180:']

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  const allowed = YK_IP_PREFIXES.some(p => ip.startsWith(p))
  if (!allowed && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  if (!verifyWebhookBody(body)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { type, object: payment } = body
  const txnId = payment.metadata?.transaction_id
  if (!txnId) return NextResponse.json({ ok: true })

  if (type === 'payment.waiting_for_capture') {
    // Funds are authorized and held
    await supabase
      .from('transactions')
      .update({ escrow_state: 'held', payment_id: payment.id, paid_at: new Date().toISOString() })
      .eq('id', txnId)
      .eq('escrow_state', 'pending')
  }

  if (type === 'payment.succeeded') {
    // Captured — mark as released (funds to seller)
    const { data: txn } = await supabase
      .from('transactions')
      .select('listing_id')
      .eq('id', txnId)
      .single()

    await supabase
      .from('transactions')
      .update({ escrow_state: 'released', completed_at: new Date().toISOString() })
      .eq('id', txnId)

    if (txn) {
      await supabase.from('listings').update({ status: 'sold' }).eq('id', txn.listing_id)
    }
  }

  if (type === 'payment.canceled') {
    await supabase
      .from('transactions')
      .update({ escrow_state: 'cancelled' })
      .eq('id', txnId)
  }

  return NextResponse.json({ ok: true })
}
