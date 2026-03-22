'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface OtherUser {
  id: string
  full_name: string
  verification_tier: string
}

interface Conversation {
  conversation_id: string
  other_user: OtherUser
  listing: { id: string; title: string } | null
  last_message: string
  created_at: string
  is_unread: boolean
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  is_read: boolean
  flagged_for_review: boolean
}

export default function MessagesView() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [myId, setMyId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // New conversation params from listing detail page
  const newReceiverId = searchParams.get('seller')
  const newListingId = searchParams.get('listing')
  const initConvId = searchParams.get('conv')

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setMyId(session.user.id)
    })
  }, [])

  // Load conversations
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true)
    const res = await fetch('/api/messages')
    if (res.ok) {
      const { data } = await res.json()
      setConversations(data ?? [])
    }
    setLoadingConvs(false)
  }, [])

  useEffect(() => { loadConversations() }, [loadConversations])

  // Load messages for active conversation
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true)
    const res = await fetch(`/api/messages/${convId}`)
    if (res.ok) {
      const { data } = await res.json()
      setMessages(data ?? [])
      // Mark conversation as read in UI
      setConversations(prev => prev.map(c =>
        c.conversation_id === convId ? { ...c, is_unread: false } : c
      ))
    }
    setLoadingMsgs(false)
  }, [])

  // Handle conv selection (URL or click)
  useEffect(() => {
    const targetConvId = initConvId
    if (targetConvId && conversations.length > 0) {
      const conv = conversations.find(c => c.conversation_id === targetConvId)
      if (conv) {
        setActiveConvId(targetConvId)
        setActiveConv(conv)
        loadMessages(targetConvId)
      }
    } else if (!activeConvId && conversations.length > 0 && !newReceiverId) {
      // Auto-select first conversation
      const first = conversations[0]
      setActiveConvId(first.conversation_id)
      setActiveConv(first)
      loadMessages(first.conversation_id)
    }
  }, [conversations, initConvId, newReceiverId, activeConvId, loadMessages])

  // Realtime subscription for new messages
  useEffect(() => {
    if (!activeConvId || !myId) return

    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConvId, myId])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectConversation = (conv: Conversation) => {
    setActiveConvId(conv.conversation_id)
    setActiveConv(conv)
    setMessages([])
    loadMessages(conv.conversation_id)
    router.replace(`/messages?conv=${conv.conversation_id}`)
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return

    // Determine receiver + conversation context
    let receiverId: string
    let listingId: string | null
    let convId: string | undefined

    if (activeConv && myId) {
      receiverId = activeConv.other_user.id
      listingId = activeConv.listing?.id ?? null
      convId = activeConv.conversation_id
    } else if (newReceiverId) {
      receiverId = newReceiverId
      listingId = newListingId
      convId = undefined
    } else {
      return
    }

    setSending(true)
    const content = input.trim()
    setInput('')

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: receiverId, listing_id: listingId, content, conversation_id: convId }),
    })

    if (res.ok) {
      const { data } = await res.json()
      // If this was a new conversation, reload convs and navigate to it
      if (!activeConv) {
        await loadConversations()
        router.replace(`/messages?conv=${data.conversation_id}`)
      }
    } else {
      setInput(content) // restore on error
    }

    setSending(false)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const isNewConversation = !activeConv && newReceiverId

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-trust-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-trust-900">Трастмаркет</span>
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-trust-600 font-medium">Профиль</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Мои сообщения</h1>

        <div className="flex bg-white rounded-xl border border-gray-100 min-h-[70vh]">
          {/* Conversation List */}
          <div className="w-80 flex-shrink-0 border-r border-gray-100 p-4 space-y-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Нет переписок</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversation_id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition ${
                    activeConvId === conv.conversation_id ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-trust-700 font-bold text-sm">
                        {conv.other_user.full_name?.[0] ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 text-sm truncate">{conv.other_user.full_name}</span>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                          {conv.is_unread && <span className="w-2 h-2 bg-accent-500 rounded-full" />}
                          <span className="text-xs text-gray-400">{formatTime(conv.created_at)}</span>
                        </div>
                      </div>
                      {conv.listing && (
                        <p className="text-xs text-trust-600 truncate">{conv.listing.title}</p>
                      )}
                      <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {(activeConv || isNewConversation) ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-trust-700 font-bold">
                        {(activeConv?.other_user.full_name ?? '?')[0]}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {activeConv?.other_user.full_name ?? 'Новый чат'}
                    </span>
                  </div>
                  {(activeConv?.listing || newListingId) && (
                    <Link
                      href={`/listings/${activeConv?.listing?.id ?? newListingId}`}
                      className="text-sm text-trust-700 hover:underline truncate max-w-xs"
                    >
                      {activeConv?.listing?.title ?? 'Объявление'}
                    </Link>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Загрузка...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Начните переписку
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === myId
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-sm px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-trust-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                              {msg.flagged_for_review && (
                                <span className="text-xs opacity-70">⚠</span>
                              )}
                              <span className={`text-xs ${isMe ? 'text-trust-200' : 'text-gray-400'}`}>
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Написать сообщение..."
                      disabled={sending}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-trust-200 focus:border-trust-500 outline-none disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !input.trim()}
                      className="bg-trust-700 hover:bg-trust-800 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                      {sending ? '...' : 'Отправить'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Не передавайте личные данные — телефоны, email, внешние ссылки
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Выберите чат из списка
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
