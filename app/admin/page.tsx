import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Админ панель — Трастмаркет',
  description: 'Модерация объявлений и пользователей',
}

export default function AdminPage() {
  const pendingListings = [
    {
      id: 'list-p1',
      title: 'Продам MacBook Pro M1 256GB',
      seller: { name: 'Олег И.', id: 'u3', verification_tier: 'basic' },
      created_at: '2026-03-08',
      reason_for_pending: 'Ожидает проверки фото верификации',
    },
    {
      id: 'list-p2',
      title: 'Продам iPhone 13 64GB',
      seller: { name: 'Светлана В.', id: 'u4', verification_tier: 'none' },
      created_at: '2026-03-07',
      reason_for_pending: 'Проверка паспортных данных',
    },
  ]

  const reports = [
    {
      id: 'rep1',
      listingTitle: 'iPhone 14 Pro 128GB Space Black',
      reporter: 'Антон К.',
      reason: 'Мошенничество',
      status: 'pending',
      created_at: '2026-03-09',
    },
    {
      id: 'rep2',
      reporter: 'Модератор 1',
      reason: 'Личные данные в чате',
      status: 'investigating',
      created_at: '2026-03-08',
    },
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Админ панель</h1>

        {/* Pending Listings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Объявления на модерации</h2>
          <div className="space-y-4">
            {pendingListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <Link href={`/listings/${listing.id}`} className="font-medium text-gray-900 hover:text-trust-600">
                    {listing.title}
                  </Link>
                  <p className="text-sm text-gray-500">Продавец: {listing.seller.name} ({listing.seller.verification_tier})</p>
                  <p className="text-xs text-gray-400 mt-1">Причина: {listing.reason_for_pending}</p>
                </div>
                <div className="flex gap-2">
                  <button className="bg-accent-500 hover:bg-accent-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Одобрить
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Жалобы</h2>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="font-medium text-gray-900">Жалоба на: {report.listingTitle || report.reporter}</p>
                  <p className="text-sm text-gray-500">Причина: {report.reason}</p>
                  <p className="text-xs text-gray-400 mt-1">Статус: {report.status}</p>
                </div>
                <button className="bg-trust-700 hover:bg-trust-800 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Рассмотреть
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
