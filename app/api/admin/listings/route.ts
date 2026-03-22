import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify admin/moderator
  const { data: user } = await supabase
    .from('users')
    .select('is_admin, is_moderator')
    .eq('id', session.user.id)
    .single()

  if (!user?.is_admin && !user?.is_moderator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      description,
      price_rub,
      category,
      condition,
      city,
      images,
      created_at,
      moderation_notes,
      seller:users!listings_seller_id_fkey (
        id,
        full_name,
        email,
        verification_tier,
        successful_transactions
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
