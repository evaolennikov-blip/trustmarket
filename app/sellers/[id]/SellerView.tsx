'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import VerifiedBadge from '@/components/VerifiedBadge'
import ListingCard from '@/components/ListingCard'
import { getSellerProfile, getSellerListings, type UserProfile } from '@/lib/users'
import type { Listing } from '@/lib/listings'

const tierLabel: Record<string, string> = {
  trusted: 'Проверенный продавец',
  enhanced: 'Верифицирован',
  basic: 'Базовый',
  none: 'Новый',
}

function accountAgeLabel(createdAt: string): string {
  const months = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return 'менее месяца'
  if (months < 12) return `${months} мес.`
  return `${Math.floor(months / 12)} г.`
}

export default function SellerView({ id }: { id: string }) {
  const [seller, setSeller] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([getSellerProfile(id), getSellerListings(id)]).then(([p, l]) => {
      if (!p) setNotFound(true)
      setSeller(p)
      setListings(l)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Загрузка...</div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Продавец не найден</h1>
        <Link href="/" className="text-trust-700 hover:underline">На главную</Link>
      </div>
    </div>
  )

  const displayName = seller!.full_name ?? 'Продавец'
  const tier = seller!.verification_tier

  const mappedListings = listings.map(l => ({
    id: l.id,
    title: l.title,
    price: l.price_rub,
    condition: l.condition,
    city: l.city,
    category: l.category,
    images: l.images,
    seller: {
      name: l.seller.full_name,
      verification_tier: l.seller.verification_tier,
      successful_transactions: l.seller.successful_transactions,
    },
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-trust-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-trust-900">Трастмаркет</span>
            </Link>
            <Link href="/listings" className="text-gray-600 hover:text-trust-600 font-medium text-sm">Объявления</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-trust-700 font-bold text-3xl">{displayName[0].toUpperCase()}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                <VerifiedBadge tier={tier} />
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span>{tierLabel[tier]}</span>
                <span>На платформе {accountAgeLabel(seller!.account_created_at)}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-xs text-trust-600">Сделок</p>
                  <p className="text-xl font-bold text-trust-900">{seller!.successful_transactions}</p>
                </div>
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-xs text-trust-600">Объявлений</p>
                  <p className="text-xl font-bold text-trust-900">{listings.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Объявления продавца</h2>
        {mappedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mappedListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500">У этого продавца пока нет активных объявлений</p>
          </div>
        )}
      </div>
    </div>
  )
}
