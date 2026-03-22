import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, escrow_state, amount_rub, created_at, completed_at, dispute_opened_at,
      listing:listings!transactions_listing_id_fkey(id, title, images),
      buyer:users!transactions_buyer_id_fkey(id, full_name),
      seller:users!transactions_seller_id_fkey(id, full_name)
    `)
    .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data ?? [] })
}
