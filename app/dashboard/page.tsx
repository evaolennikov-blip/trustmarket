'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { getUserProfile, getMyListings, type UserProfile, type MyListing } from '@/lib/users'

type Tab = 'listings' | 'transactions'

const tierLabel: Record<string, string> = {
  trusted: 'Проверенный',
  enhanced: 'Верифицирован',
  basic: 'Базовый',
  none: 'Новый',
}

const tierClass: Record<string, string> = {
  trusted: 'bg-accent-100 text-accent-700',
  enhanced: 'bg-trust-100 text-trust-700',
  basic: 'bg-gray-100 text-gray-600',
  none: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<string, string> = {
  approved: 'Одобрено',
  pending: 'На модерации',
  draft: 'Черновик',
  rejected: 'Отклонено',
  sold: 'Продано',
  expired: 'Истекло',
  removed: 'Удалено',
}

const statusClass: Record<string, string> = {
  approved: 'bg-accent-100 text-accent-700',
  pending: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-500',
  rejected: 'bg-red-100 text-red-700',
  sold: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-400',
  removed: 'bg-gray-100 text-gray-400',
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<MyListing[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('listings')
  const [submitted] = useState(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('submitted') === '1'
  )

  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    Promise.all([getUserProfile(user.id), getMyListings(user.id)]).then(([p, l]) => {
      setProfile(p)
      setListings(l)
      setDataLoading(false)
    })
  }, [user])

  if (authLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Загрузка...</div>
  )

  const accountAge = profile
    ? (() => {
        const months = Math.floor((Date.now() - new Date(profile.account_created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
        if (months < 1) return 'менее месяца'
        if (months < 12) return `${months} мес.`
        return `${Math.floor(months / 12)} г.`
      })()
    : null

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? '—'
  const tier = profile?.verification_tier ?? 'none'

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
            <div className="flex items-center gap-4">
              <Link href="/listings" className="text-gray-600 hover:text-trust-600 font-medium text-sm">Объявления</Link>
              <Link href="/sell" className="bg-trust-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-800 transition">
                + Продать
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {submitted && (
          <div className="mb-6 bg-green-50 border border-green-100 rounded-xl p-4 text-green-800 text-sm">
            Объявление отправлено на модерацию. Обычно занимает 15–30 минут.
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Мой профиль</h1>

        {/* Profile card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          {dataLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-trust-700 font-bold text-2xl">{displayName[0].toUpperCase()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierClass[tier]}`}>
                      {tier === 'trusted' && '✓ '}{tierLabel[tier]}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  {accountAge && <p className="text-gray-400 text-xs mt-0.5">На платформе {accountAge}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-xs text-trust-600">Успешных сделок</p>
                  <p className="text-xl font-bold text-trust-900">{profile?.successful_transactions ?? 0}</p>
                </div>
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-xs text-trust-600">Объявлений</p>
                  <p className="text-xl font-bold text-trust-900">{listings.length}</p>
                </div>
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-xs text-trust-600">Активных</p>
                  <p className="text-xl font-bold text-trust-900">{listings.filter(l => l.status === 'approved').length}</p>
                </div>
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-xs text-trust-600">Уровень</p>
                  <p className="text-sm font-bold text-trust-900 mt-1">{tierLabel[tier]}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="flex border-b border-gray-100">
            {([['listings', 'Мои объявления'], ['transactions', 'Сделки']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-6 py-3 text-sm font-medium transition border-b-2 ${
                  tab === key ? 'text-trust-700 border-trust-700' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'listings' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Мои объявления</h3>
                  <Link href="/sell" className="text-sm text-trust-600 hover:text-trust-800 font-medium">+ Добавить</Link>
                </div>
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">У вас нет объявлений</p>
                    <Link href="/sell" className="bg-trust-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-trust-800 transition">
                      Подать первое объявление
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listings.map(listing => (
                      <div key={listing.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <div className="min-w-0">
                          <Link href={`/listings/${listing.id}`}
                            className="font-medium text-gray-900 hover:text-trust-600 truncate block">
                            {listing.title}
                          </Link>
                          <p className="text-sm text-gray-500">{listing.price_rub.toLocaleString('ru-RU')} ₽</p>
                        </div>
                        <span className={`ml-4 flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass[listing.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {statusLabel[listing.status] ?? listing.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'transactions' && (
              <div className="text-center py-12 text-gray-400">
                <p>Сделки появятся здесь после первой покупки или продажи</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
