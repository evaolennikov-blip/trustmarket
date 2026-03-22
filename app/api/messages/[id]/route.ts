import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// GET /api/messages/[conversationId] — fetch all messages in a conversation
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id
  const { id: conversationId } = params

  // RLS ensures only sender/receiver can read — no extra check needed
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, receiver_id, content, created_at, is_read, contains_phone, contains_email, contains_external_links, flagged_for_review')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Verify user is actually a party (belt + suspenders)
  const isParty = (data ?? []).some(m => m.sender_id === uid || m.receiver_id === uid)
  if (data && data.length > 0 && !isParty) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Mark unread messages as read
  const unreadIds = (data ?? [])
    .filter(m => m.receiver_id === uid && !m.is_read)
    .map(m => m.id)

  if (unreadIds.length > 0) {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', unreadIds)
  }

  return NextResponse.json({ data })
}
