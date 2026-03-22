'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Seller {
  id: string
  full_name: string
  email: string
  verification_tier: string
  successful_transactions: number
}

interface PendingListing {
  id: string
  title: string
  description: string
  price_rub: number
  category: string
  condition: string
  city: string
  images: string[]
  created_at: string
  moderation_notes: string | null
  seller: Seller
}

interface Report {
  id: string
  reason: string
  description: string | null
  status: string
  created_at: string
  listing: { id: string; title: string } | null
  reporter: { id: string; full_name: string } | null
}

export default function AdminView() {
  const [listings, setListings] = useState<PendingListing[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [listingsRes, reportsRes] = await Promise.all([
        fetch('/api/admin/listings'),
        fetch('/api/admin/reports'),
      ])

      if (listingsRes.status === 403 || reportsRes.status === 403) {
        setError('Доступ запрещён. Требуются права администратора.')
        return
      }

      const listingsData = await listingsRes.json()
      const reportsData = await reportsRes.json()

      if (!listingsRes.ok) throw new Error(listingsData.error)
      if (!reportsRes.ok) throw new Error(reportsData.error)

      setListings(listingsData.data ?? [])
      setReports(reportsData.data ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const moderateListing = async (id: string, action: 'approve' | 'reject', notes?: string) => {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setProcessing(null)
    }
  }

  const conditionLabel: Record<string, string> = {
    new: 'Новое', like_new: 'Как новое', good: 'Хорошее',
    fair: 'Удовлетворительное', for_parts: 'На запчасти',
  }

  const tierColor: Record<string, string> = {
    trusted: 'text-accent-600', enhanced: 'text-trust-600',
    basic: 'text-gray-500', none: 'text-gray-400',
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
      Загрузка...
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-trust-600 hover:underline">
          Вернуться в профиль
        </Link>
      </div>
    </div>
  )

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
            <Link href="/dashboard" className="text-gray-600 hover:text-trust-600 font-medium">
              Профиль
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Админ панель</h1>
          <button
            onClick={fetchData}
            className="text-sm text-trust-600 hover:text-trust-700 font-medium"
          >
            Обновить
          </button>
        </div>

        {/* Pending Listings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Объявления на модерации
            {listings.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-sm font-medium px-2 py-0.5 rounded-full">
                {listings.length}
              </span>
            )}
          </h2>

          {listings.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет объявлений на модерации</p>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      {listing.images?.[0] && (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-medium text-gray-900 hover:text-trust-600 block truncate"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {listing.price_rub.toLocaleString('ru-RU')} ₽ · {conditionLabel[listing.condition] ?? listing.condition} · {listing.city}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="text-gray-500">Продавец: </span>
                          <span className={`font-medium ${tierColor[listing.seller.verification_tier] ?? 'text-gray-600'}`}>
                            {listing.seller.full_name}
                          </span>
                          <span className="text-gray-400 ml-1">({listing.seller.verification_tier})</span>
                        </p>
                        {listing.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{listing.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => moderateListing(listing.id, 'approve')}
                        disabled={processing === listing.id}
                        className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        {processing === listing.id ? '...' : 'Одобрить'}
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Причина отклонения (необязательно):') ?? undefined
                          moderateListing(listing.id, 'reject', notes)
                        }}
                        disabled={processing === listing.id}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Жалобы
            {reports.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-sm font-medium px-2 py-0.5 rounded-full">
                {reports.length}
              </span>
            )}
          </h2>

          {reports.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет активных жалоб</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {report.listing ? (
                        <Link href={`/listings/${report.listing.id}`} className="hover:text-trust-600">
                          {report.listing.title}
                        </Link>
                      ) : 'Жалоба на пользователя'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Причина: {report.reason}
                      {report.reporter && ` · От: ${report.reporter.full_name}`}
                    </p>
                    {report.description && (
                      <p className="text-xs text-gray-400 mt-1">{report.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Статус: <span className="font-medium">{report.status}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
