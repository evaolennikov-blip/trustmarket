'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'
import { getListings, type Listing } from '@/lib/listings'

const categories = [
  { id: 'all', label: 'Все категории' },
  { id: 'smartphones', label: 'Смартфоны' },
  { id: 'laptops', label: 'Ноутбуки' },
  { id: 'accessories', label: 'Аксессуары' },
  { id: 'tablets', label: 'Планшеты' },
  { id: 'gaming', label: 'Игровые' },
]

const conditions = [
  { id: 'all', label: 'Любое' },
  { id: 'new', label: 'Новое' },
  { id: 'like_new', label: 'Как новое' },
  { id: 'good', label: 'Хорошее' },
  { id: 'fair', label: 'Удовлетворительное' },
]

export default function ListingsPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [condition, setCondition] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  useEffect(() => {
    setLoading(true)
    setError('')
    getListings({
      category,
      condition,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      verifiedOnly,
      search: debouncedSearch,
    })
      .then(data => {
        setListings(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Не удалось загрузить объявления')
        setLoading(false)
      })
  }, [debouncedSearch, category, condition, verifiedOnly, maxPrice])

  // Map Supabase listing to ListingCard shape
  const mapped = listings.map(l => ({
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-trust-900">Трастмаркет</Link>
          <Link href="/sell" className="bg-trust-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-800 transition">
            + Подать объявление
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <input
            type="text"
            placeholder="Поиск по объявлениям..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar filters */}
        <aside className="w-60 flex-shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Категория</h3>
            <div className="space-y-1">
              {categories.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === c.id ? 'bg-trust-100 text-trust-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Состояние</h3>
            <div className="space-y-1">
              {conditions.map(c => (
                <button key={c.id} onClick={() => setCondition(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${condition === c.id ? 'bg-trust-100 text-trust-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Цена до (₽)</h3>
            <input type="number" placeholder="100 000" value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-trust-500" />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-trust-600" />
              <span className="text-sm text-gray-700">Только проверенные продавцы</span>
            </label>
          </div>
        </aside>

        {/* Listings grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Найдено объявлений: <span className="font-semibold text-gray-900">{loading ? '...' : mapped.length}</span>
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-400">{error}</div>
          ) : mapped.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Объявления не найдены</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapped.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
