'use client'

import { useState } from 'react'
import Link from 'next/link'
import ListingCard from '@/components/ListingCard'

const mockListings = [
  { id: '1', title: 'iPhone 14 Pro 128GB Space Black', price: 65000, condition: 'like_new', city: 'Москва', category: 'smartphones', images: [], seller: { name: 'Иван И.', verification_tier: 'trusted' as const, successful_transactions: 42 } },
  { id: '2', title: 'Samsung Galaxy S23 256GB', price: 42000, condition: 'good', city: 'Москва', category: 'smartphones', images: [], seller: { name: 'Дмитрий К.', verification_tier: 'enhanced' as const, successful_transactions: 18 } },
  { id: '3', title: 'MacBook Air M2 8GB 256GB', price: 89000, condition: 'like_new', city: 'Санкт-Петербург', category: 'laptops', images: [], seller: { name: 'Алексей П.', verification_tier: 'basic' as const, successful_transactions: 3 } },
  { id: '4', title: 'AirPods Pro 2nd Gen', price: 14500, condition: 'new', city: 'Москва', category: 'accessories', images: [], seller: { name: 'Мария С.', verification_tier: 'trusted' as const, successful_transactions: 67 } },
  { id: '5', title: 'Xiaomi 13 Pro 256GB', price: 38000, condition: 'good', city: 'Москва', category: 'smartphones', images: [], seller: { name: 'Сергей В.', verification_tier: 'enhanced' as const, successful_transactions: 11 } },
]

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
  const [category, setCategory] = useState('all')
  const [condition, setCondition] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [maxPrice, setMaxPrice] = useState('')

  const filtered = mockListings.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'all' && l.category !== category) return false
    if (condition !== 'all' && l.condition !== condition) return false
    if (verifiedOnly && !['enhanced', 'trusted'].includes(l.seller.verification_tier)) return false
    if (maxPrice && l.price > parseInt(maxPrice)) return false
    return true
  })

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
            <p className="text-sm text-gray-500">Найдено объявлений: <span className="font-semibold text-gray-900">{filtered.length}</span></p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Объявления не найдены</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
