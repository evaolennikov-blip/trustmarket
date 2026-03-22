import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const body = await request.json()
  const { action, notes } = body as { action: 'approve' | 'reject'; notes?: string }

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  const { data, error } = await supabase
    .from('listings')
    .update({
      status: newStatus,
      moderated_by: session.user.id,
      moderated_at: new Date().toISOString(),
      ...(notes ? { moderation_notes: notes } : {}),
    })
    .eq('id', params.id)
    .select('id, status')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
