import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createPayment } from '@/lib/yookassa'

const PLATFORM_FEE_PERCENT = 0.03

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id
  const body = await request.json()
  const { listing_id } = body as { listing_id: string }

  if (!listing_id) {
    return NextResponse.json({ error: 'listing_id required' }, { status: 400 })
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, price_rub, seller_id, status')
    .eq('id', listing_id)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }
  if (listing.status !== 'approved') {
    return NextResponse.json({ error: 'Listing is not available' }, { status: 400 })
  }
  if (listing.seller_id === uid) {
    return NextResponse.json({ error: 'Cannot buy your own listing' }, { status: 400 })
  }

  // Check no existing active transaction
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('listing_id', listing_id)
    .in('escrow_state', ['pending', 'held'])
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Transaction already in progress for this listing' }, { status: 409 })
  }

  const platform_fee_rub = Math.round(listing.price_rub * PLATFORM_FEE_PERCENT)

  const { data: txn, error: txnError } = await supabase
    .from('transactions')
    .insert({
      listing_id,
      buyer_id: uid,
      seller_id: listing.seller_id,
      amount_rub: listing.price_rub,
      platform_fee_rub,
      escrow_state: 'pending',
    })
    .select('id')
    .single()

  if (txnError || !txn) {
    return NextResponse.json({ error: txnError?.message ?? 'Failed to create transaction' }, { status: 500 })
  }

  const origin = request.headers.get('origin') ?? 'https://trustmarket-sigma.vercel.app'
  const returnUrl = `${origin}/dashboard?txn=${txn.id}&status=paid`

  try {
    const payment = await createPayment({
      amount_rub: listing.price_rub,
      description: `Покупка: ${listing.title}`,
      return_url: returnUrl,
      idempotency_key: txn.id,
      metadata: { transaction_id: txn.id, listing_id, buyer_id: uid },
    })

    await supabase
      .from('transactions')
      .update({ payment_id: payment.id })
      .eq('id', txn.id)

    return NextResponse.json({
      data: {
        transaction_id: txn.id,
        payment_id: payment.id,
        confirmation_url: payment.confirmation?.confirmation_url,
      },
    })
  } catch (err) {
    await supabase.from('transactions').delete().eq('id', txn.id)
    const message = err instanceof Error ? err.message : 'Payment creation failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
