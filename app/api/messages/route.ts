import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { analyzeContent } from '@/lib/content-filter'

// GET /api/messages — list conversations for current user
export async function GET() {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id

  // Get latest message per conversation_id
  const { data: rows, error } = await supabase
    .from('messages')
    .select('conversation_id, sender_id, receiver_id, content, created_at, listing_id, is_read')
    .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Deduplicate: keep only the latest message per conversation
  const seen = new Set<string>()
  const latest = (rows ?? []).filter(r => {
    if (seen.has(r.conversation_id)) return false
    seen.add(r.conversation_id)
    return true
  })

  // Collect other user IDs and listing IDs
  const otherUserIds = Array.from(new Set(latest.map(r => r.sender_id === uid ? r.receiver_id : r.sender_id)))
  const listingIds = Array.from(new Set(latest.map(r => r.listing_id).filter(Boolean)))

  const [usersRes, listingsRes] = await Promise.all([
    otherUserIds.length
      ? supabase.from('users').select('id, full_name, verification_tier').in('id', otherUserIds)
      : Promise.resolve({ data: [] }),
    listingIds.length
      ? supabase.from('listings').select('id, title').in('id', listingIds)
      : Promise.resolve({ data: [] }),
  ])

  const usersMap = Object.fromEntries((usersRes.data ?? []).map(u => [u.id, u]))
  const listingsMap = Object.fromEntries((listingsRes.data ?? []).map(l => [l.id, l]))

  const conversations = latest.map(r => {
    const otherUserId = r.sender_id === uid ? r.receiver_id : r.sender_id
    return {
      conversation_id: r.conversation_id,
      other_user: usersMap[otherUserId] ?? { id: otherUserId, full_name: 'Пользователь', verification_tier: 'none' },
      listing: r.listing_id ? listingsMap[r.listing_id] ?? null : null,
      last_message: r.content,
      created_at: r.created_at,
      is_unread: !r.is_read && r.receiver_id === uid,
    }
  })

  return NextResponse.json({ data: conversations })
}

// POST /api/messages — send a message
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const uid = session.user.id
  const body = await request.json()
  const { receiver_id, listing_id, content, conversation_id } = body as {
    receiver_id: string
    listing_id: string
    content: string
    conversation_id?: string
  }

  if (!receiver_id || !content?.trim()) {
    return NextResponse.json({ error: 'receiver_id and content are required' }, { status: 400 })
  }
  if (receiver_id === uid) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  // Determine conversation_id: reuse existing or generate new
  let convId = conversation_id
  if (!convId) {
    const { data: existing } = await supabase
      .from('messages')
      .select('conversation_id')
      .or(
        `and(sender_id.eq.${uid},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${uid})`
      )
      .eq('listing_id', listing_id)
      .limit(1)
      .single()

    convId = existing?.conversation_id ?? crypto.randomUUID()
  }

  const flags = analyzeContent(content)

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: convId,
      sender_id: uid,
      receiver_id,
      listing_id: listing_id || null,
      content: content.trim(),
      ...flags,
    })
    .select('id, conversation_id, sender_id, content, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, flags })
}
