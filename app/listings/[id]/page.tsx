import Link from 'next/link'
import VerifiedBadge from '@/components/VerifiedBadge'
import EscrowStatus from '@/components/EscrowStatus'

export function generateStaticParams() {
  return ["1","2","3","4","5"].map(id => ({ id }))
}

type VerificationTier = 'trusted' | 'enhanced' | 'basic' | 'none'

interface Listing {
  id: string
  title: string
  price: number
  condition: 'new' | 'like_new' | 'good' | 'fair'
  city: string
  description: string
  category: string
  images: string[]
  seller: {
    id: string
    name: string
    verification_tier: VerificationTier
    successful_transactions: number
    rating: number
    member_since: string
  }
}

const listings: Listing[] = [
  {
    id: '1',
    title: 'iPhone 14 Pro 128GB Space Black',
    price: 65000,
    condition: 'like_new',
    city: 'Москва',
    description: 'Продаю iPhone 14 Pro в отличном состоянии. Использовал 6 месяцев, всегда в чехле. Батарея 94%, полная комплектация. Причина продажи — переход на Android.',
    category: 'smartphones',
    images: ['/placeholder.jpg'],
    seller: {
      id: '1',
      name: 'Иван И.',
      verification_tier: 'trusted',
      successful_transactions: 45,
      rating: 98,
      member_since: 'Январь 2023'
    }
  },
  {
    id: '2',
    title: 'Samsung Galaxy S23 Ultra 256GB',
    price: 72000,
    condition: 'good',
    city: 'Москва',
    description: 'Отличный смартфон, использовался аккуратно. Есть небольшие следы использования на корпусе. В комплекте чехол и зарядка.',
    category: 'smartphones',
    images: ['/placeholder.jpg'],
    seller: {
      id: '2',
      name: 'Алексей П.',
      verification_tier: 'enhanced',
      successful_transactions: 12,
      rating: 92,
      member_since: 'Март 2024'
    }
  },
  {
    id: '3',
    title: 'iPhone 13 128GB Blue',
    price: 42000,
    condition: 'good',
    city: 'Санкт-Петербург',
    description: 'Хороший iPhone 13 в рабочем состоянии. Небольшие царапины на экране не влияют на использование. Отправлю по России.',
    category: 'smartphones',
    images: ['/placeholder.jpg'],
    seller: {
      id: '3',
      name: 'Мария С.',
      verification_tier: 'basic',
      successful_transactions: 3,
      rating: 85,
      member_since: 'Декабрь 2025'
    }
  },
  {
    id: '4',
    title: 'MacBook Air M2 256GB',
    price: 90000,
    condition: 'like_new',
    city: 'Москва',
    description: 'Новый ноутбук, использовался пару раз. Идеальное состояние, полная комплектация. гарантия до 2025 года.',
    category: 'laptops',
    images: ['/placeholder.jpg'],
    seller: {
      id: '1',
      name: 'Иван И.',
      verification_tier: 'trusted',
      successful_transactions: 45,
      rating: 98,
      member_since: 'Январь 2023'
    }
  },
  {
    id: '5',
    title: 'iPad Pro 12.9" M1 256GB',
    price: 75000,
    condition: 'new',
    city: 'Москва',
    description: 'Новый iPad Pro в запечатанной коробке. Купил по ошибке, решил продать. Официальная гарантия Apple.',
    category: 'tablets',
    images: ['/placeholder.jpg'],
    seller: {
      id: '4',
      name: 'Дмитрий К.',
      verification_tier: 'trusted',
      successful_transactions: 67,
      rating: 99,
      member_since: 'Июнь 2022'
    }
  },
]

const conditionLabels = {
  new: 'Новое',
  like_new: 'Как новое',
  good: 'Хорошее',
  fair: 'Удовлетворительное'
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = listings.find(l => l.id === params.id)

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Объявление не найдено</h1>
          <Link href="/listings" className="text-trust-700 hover:underline">К объявлениям</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Anti-scam warning */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <p className="text-sm text-yellow-800 text-center">
            ⚠️ Никогда не переводите деньги вне платформы
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Описание</h2>
              <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Продавец</h2>
              <Link href={`/sellers/${listing.seller.id}`} className="block hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-trust-100 rounded-full flex items-center justify-center">
                    <span className="text-trust-700 font-bold text-xl">{listing.seller.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{listing.seller.name}</span>
                      <VerifiedBadge tier={listing.seller.verification_tier} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {listing.seller.successful_transactions} сделок · {listing.seller.rating}% рейтинг
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Right column - sticky price card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  listing.condition === 'new' ? 'bg-green-100 text-green-700' :
                  listing.condition === 'like_new' ? 'bg-trust-100 text-trust-700' :
                  listing.condition === 'good' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {conditionLabels[listing.condition]}
                </span>
                <span className="text-sm text-gray-500">📍 {listing.city}</span>
              </div>

              <p className="text-3xl font-bold text-trust-700 mb-6">
                {listing.price.toLocaleString('ru-RU')} ₽
              </p>

              <button className="w-full bg-trust-700 hover:bg-trust-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors mb-4">
                Купить через эскроу
              </button>

              <div className="flex items-start gap-2 text-sm text-gray-500">
                <span>💳</span>
                <p>Деньги хранятся в эскроу до получения товара</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <EscrowStatus state="held" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
