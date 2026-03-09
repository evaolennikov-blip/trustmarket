import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Сообщения — Трастмаркет',
  description: 'Вся переписка с продавцами и покупателями',
}

export default function MessagesPage() {
  const conversations = [
    {
      id: 'c1',
      otherUser: { id: 'u1', name: 'Иван И.', last_active: 'online', verification_tier: 'trusted' },
      lastMessage: 'Здравствуйте, интересует iPhone 14 Pro',
      timestamp: '14:30',
      unread: true,
      listingTitle: 'iPhone 14 Pro 128GB Space Black',
    },
    {
      id: 'c2',
      otherUser: { id: 'u2', name: 'Анна К.', last_active: 'был 2 часа назад', verification_tier: 'basic' },
      lastMessage: 'Спасибо за оперативную отправку!',
      timestamp: 'Вчера',
      unread: false,
      listingTitle: 'AirPods Pro 2',
    },
  ]

  const activeConversationId = 'c1' // Mock active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId)

  const messages = [
    { id: 'msg1', sender: 'u1', content: 'Здравствуйте, интересует iPhone 14 Pro. Можно ли получить дополнительные фото?', timestamp: '14:30' },
    { id: 'msg2', sender: 'me', content: 'Здравствуйте! Да, конечно, сейчас отправлю. Устройство в идеальном состоянии.', timestamp: '14:35' },
    { id: 'msg3', sender: 'u1', content: 'Отлично, жду!', timestamp: '14:38' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-trust-600 font-medium">
                Профиль
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Мои сообщения</h1>

        <div className="flex bg-white rounded-xl border border-gray-100 min-h-[70vh]">
          {/* Conversation List */}
          <div className="w-80 flex-shrink-0 border-r border-gray-100 p-4 space-y-2">
            {conversations.map((conv) => (
              <Link 
                key={conv.id}
                href={`/messages?conversation=${conv.id}`}
                className={`block p-3 rounded-lg hover:bg-gray-50 ${
                  activeConversationId === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-trust-700 font-bold">{conv.otherUser.name[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{conv.otherUser.name}</span>
                      {conv.unread && <span className="w-2 h-2 bg-accent-500 rounded-full"></span>}
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-trust-700 font-bold">{activeConversation.otherUser.name[0]}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{activeConversation.otherUser.name}</span>
                      <p className="text-sm text-gray-500">{activeConversation.otherUser.last_active}</p>
                    </div>
                  </div>
                  <Link href={`/listings/${activeConversation.listingTitle.includes('iPhone') ? '1' : '2'}`} className="text-sm text-trust-700 hover:underline">
                    Объявление: {activeConversation.listingTitle}
                  </Link>
                </div>

                {/* Message List */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === 'me' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-trust-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}>
                        <p>{message.content}</p>
                        <span className={`block text-xs mt-1 ${
                          message.sender === 'me' ? 'text-trust-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Написать сообщение..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-trust-200 focus:border-trust-500"
                    />
                    <button className="bg-trust-700 hover:bg-trust-800 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                      Отправить
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Внимание: не делитесь личной информацией (номера телефонов, email, ссылки)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Выберите чат из списка
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
