import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Мой профиль — Трастмаркет',
  description: 'Управление объявлениями, сделками и сообщениями',
}

export default function DashboardPage() {
  const user = {
    id: 'user-1',
    name: 'Иван И.',
    email: 'ivan@example.com',
    verification_tier: 'trusted' as 'trusted' | 'enhanced' | 'basic' | 'none',
    successful_transactions: 45,
    rating: 98,
    account_age: '2 года',
  }

  const activeListings = [
    {
      id: '1',
      title: 'iPhone 14 Pro 128GB Space Black',
      price: 65000,
      status: 'approved',
      created_at: '2026-03-05',
    },
    {
      id: '4',
      title: 'MacBook Air M2 256GB',
      price: 90000,
      status: 'pending',
      created_at: '2026-03-01',
    },
  ]

  const transactions = [
    {
      id: 't1',
      listingTitle: 'iPhone 13 mini 128GB',
      buyerName: 'Пётр П.',
      sellerName: 'Иван И.',
      amount: 40000,
      status: 'held',
      role: 'seller'
    },
    {
      id: 't2',
      listingTitle: 'AirPods Pro 2',
      buyerName: 'Иван И.',
      sellerName: 'Анна К.',
      amount: 20000,
      status: 'released',
      role: 'buyer'
    },
  ]

  const messages = [
    { id: 'm1', sender: 'Пётр П.', content: 'Здравствуйте, интересует iPhone 14 Pro', timestamp: '14:30', unread: true },
    { id: 'm2', sender: 'Модератор', content: 'Ваше объявление одобрено', timestamp: '10:15', unread: false },
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
              <Link href="/listings" className="text-gray-600 hover:text-trust-600 font-medium">
                Объявления
              </Link>
              <Link href="/sell" className="text-gray-600 hover:text-trust-600 font-medium">
                Продать
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Мой профиль</h1>

        {/* User Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-trust-700 font-bold text-2xl">{user.name[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.verification_tier === 'trusted' ? 'bg-accent-100 text-accent-700' :
                  'bg-trust-100 text-trust-700'
                }`}>
                  {user.verification_tier === 'trusted' ? '✓ Проверенный' : 'Верифицирован'}
                </span>
              </div>
              <p className="text-gray-500 text-sm">На платформе {user.account_age}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <dt className="text-gray-500">Успешных сделок</dt>
              <dd className="font-medium text-accent-600">{user.successful_transactions}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Рейтинг</dt>
              <dd className="font-medium text-accent-600">{user.rating}%</dd>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex border-b border-gray-100">
            <button className="px-6 py-3 text-sm font-medium text-trust-700 border-b-2 border-trust-700">
              Мои объявления
            </button>
            <button className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-trust-600 hover:border-b-2 hover:border-trust-100">
              Мои сделки
            </button>
            <button className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-trust-600 hover:border-b-2 hover:border-trust-100">
              Сообщения
            </button>
          </div>

          <div className="p-6">
            {/* Active Listings Tab Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Активные объявления</h3>
              <div className="space-y-4">
                {activeListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <Link href={`/listings/${listing.id}`} className="font-medium text-gray-900 hover:text-trust-600">
                        {listing.title}
                      </Link>
                      <p className="text-sm text-gray-500">{listing.price.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      listing.status === 'approved' ? 'bg-accent-100 text-accent-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {listing.status === 'approved' ? 'Одобрено' : 'На модерации'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Tab Content (placeholder) */}
            {/* <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Мои сделки</h3>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900">{tx.listingTitle}</p>
                      <p className="text-sm text-gray-500">{tx.amount.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === 'released' ? 'bg-accent-100 text-accent-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status === 'released' ? 'Завершена' : 'В процессе'}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Messages Tab Content (placeholder) */}
            {/* <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Мои сообщения</h3>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-gray-900">{msg.sender}</p>
                      <p className="text-sm text-gray-500">{msg.content}</p>
                    </div>
                    {msg.unread && <span className="w-2 h-2 bg-trust-500 rounded-full"></span>}
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
