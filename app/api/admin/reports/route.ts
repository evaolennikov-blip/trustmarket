import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('is_admin, is_moderator')
    .eq('id', session.user.id)
    .single()

  if (!user?.is_admin && !user?.is_moderator) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('listing_reports')
    .select(`
      id,
      reason,
      description,
      status,
      created_at,
      listing:listings!listing_reports_listing_id_fkey (
        id,
        title
      ),
      reporter:users!listing_reports_reporter_id_fkey (
        id,
        full_name
      )
    `)
    .in('status', ['pending', 'investigating'])
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
