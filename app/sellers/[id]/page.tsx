import Link from 'next/link'
import VerifiedBadge from '@/components/VerifiedBadge'
import ListingCard from '@/components/ListingCard'

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ]
}

type VerificationTier = 'trusted' | 'enhanced' | 'basic'

interface Seller {
  id: string
  name: string
  verification_tier: VerificationTier
  successful_transactions: number
  rating: number
  member_since: string
  bio: string
  city: string
  listings: {
    id: string
    title: string
    price: number
    condition: string
    city: string
    images: string[]
    seller: {
      name: string
      verification_tier: VerificationTier
      successful_transactions: number
    }
  }[]
}

const sellers: Seller[] = [
  {
    id: '1',
    name: 'Иван И.',
    verification_tier: 'trusted',
    successful_transactions: 45,
    rating: 98,
    member_since: 'Январь 2023',
    bio: 'Продаю только проверенную технику. Все устройства проходят мою личную проверку перед продажей. Предпочитаю честные сделки и довольных покупателей.',
    city: 'Москва',
    listings: [
      { id: '101', title: 'iPhone 14 Pro 128GB Space Black', price: 65000, condition: 'like_new', city: 'Москва', images: [], seller: { name: 'Иван И.', verification_tier: 'trusted', successful_transactions: 45 } },
      { id: '102', title: 'MacBook Air M2 256GB', price: 90000, condition: 'good', city: 'Москва', images: [], seller: { name: 'Иван И.', verification_tier: 'trusted', successful_transactions: 45 } },
    ]
  },
  {
    id: '2',
    name: 'Алексей П.',
    verification_tier: 'enhanced',
    successful_transactions: 12,
    rating: 92,
    member_since: 'Март 2024',
    bio: 'Специализируюсь на продаже смартфонов Samsung и Apple. Всегда готов ответить на вопросы о товаре.',
    city: 'Москва',
    listings: [
      { id: '201', title: 'Samsung Galaxy S23 Ultra 256GB', price: 72000, condition: 'like_new', city: 'Москва', images: [], seller: { name: 'Алексей П.', verification_tier: 'enhanced', successful_transactions: 12 } },
    ]
  },
  {
    id: '3',
    name: 'Мария С.',
    verification_tier: 'basic',
    successful_transactions: 3,
    rating: 85,
    member_since: 'Декабрь 2025',
    bio: 'Продаю технику из-за рубежа. Новая в упаковке.',
    city: 'Санкт-Петербург',
    listings: [
      { id: '301', title: 'iPhone 15 128GB Blue', price: 75000, condition: 'new', city: 'Санкт-Петербург', images: [], seller: { name: 'Мария С.', verification_tier: 'basic', successful_transactions: 3 } },
    ]
  },
  {
    id: '4',
    name: 'Дмитрий К.',
    verification_tier: 'trusted',
    successful_transactions: 67,
    rating: 99,
    member_since: 'Июнь 2022',
    bio: 'Профессиональный продавец электроники с 2019 года. Гарантия на все товары. Доставка по всей России.',
    city: 'Москва',
    listings: [
      { id: '401', title: 'iPad Pro 12.9" M2 256GB', price: 85000, condition: 'like_new', city: 'Москва', images: [], seller: { name: 'Дмитрий К.', verification_tier: 'trusted', successful_transactions: 67 } },
      { id: '402', title: 'Apple Watch Ultra 2', price: 55000, condition: 'new', city: 'Москва', images: [], seller: { name: 'Дмитрий К.', verification_tier: 'trusted', successful_transactions: 67 } },
    ]
  },
  {
    id: '5',
    name: 'Елена В.',
    verification_tier: 'enhanced',
    successful_transactions: 18,
    rating: 90,
    member_since: 'Сентябрь 2023',
    bio: 'Продаю б/у технику в отличном состоянии. Фотографирую каждый товар лично.',
    city: 'Казань',
    listings: []
  },
]

export default function SellerPage({ params }: { params: { id: string } }) {
  const seller = sellers.find(s => s.id === params.id)

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Продавец не найден</h1>
          <Link href="/" className="text-trust-700 hover:underline">На главную</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <div className="flex items-center gap-4">
              <Link href="/listings" className="text-gray-600 hover:text-trust-600 font-medium">
                Объявления
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-trust-700 font-bold text-3xl">{seller.name[0]}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                <VerifiedBadge tier={seller.verification_tier} />
              </div>
              
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                <span>На платформе с {seller.member_since}</span>
                <span>📍 {seller.city}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-sm text-trust-600">Сделок</p>
                  <p className="text-xl font-bold text-trust-900">{seller.successful_transactions}</p>
                </div>
                <div className="bg-trust-50 rounded-lg p-3">
                  <p className="text-sm text-trust-600">Рейтинг</p>
                  <p className="text-xl font-bold text-trust-900">{seller.rating}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {seller.bio && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 mb-2">О себе</h2>
              <p className="text-gray-700">{seller.bio}</p>
            </div>
          )}
        </div>

        {/* Listings */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Объявления продавца</h2>
        {seller.listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {seller.listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500">У этого продавца пока нет объявлений</p>
          </div>
        )}
      </div>
    </div>
  )
}
