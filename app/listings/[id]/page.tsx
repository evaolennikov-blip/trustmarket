import { Metadata } from 'next'
import Link from 'next/link'

export function generateStaticParams() {
  return ["1","2","3","4","5"].map(id => ({ id }))
}


interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'iPhone 14 Pro — Трастмаркет',
    description: 'Купить iPhone 14 Pro без мошенников',
  }
}

export default function ListingDetailPage({ params }: Props) {
  // Mock data - replace with Supabase query
  const listing = {
    id: params.id,
    title: 'iPhone 14 Pro 128GB Space Black',
    description: `Продаю iPhone 14 Pro в отличном состоянии. 
    
Использовал 6 месяцев, всегда в чехле и с защитным стеклом.
Полная комплектация: оригинальная коробка, зарядка, кабель, наклейки.
 
Состояние: как новый, без царапин и сколов.
Батарея: 94% здоровья.
 
Причина продажи: перехожу на Android.
 
Пересылка по России возможна через СДЭК или Boxberry.
Самовывоз: м. Арбатская, м. Пушкинская.`,
    price: 65000,
    condition: 'like_new',
    category: 'smartphones',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    city: 'Москва',
    views: 234,
    favorites: 12,
    images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
    seller: {
      id: '1',
      name: 'Иван И.',
      verification_tier: 'trusted',
      successful_transactions: 45,
      rating: 98,
      account_age: '2 года',
      last_active: 'online',
      registered: '2024-01-15'
    },
    created_at: '2026-03-05'
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
              <Link href="/sell" className="text-gray-600 hover:text-trust-600 font-medium">
                Продать
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
              <div className="aspect-square bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span>Основное фото</span>
                </div>
                {/* Image gallery would go here */}
              </div>
              <div className="flex gap-2 p-2 overflow-x-auto">
                {[1, 2, 3].map((i) => (
                  <button key={i} className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 border-2 border-trust-500">
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                  <p className="text-gray-500 mt-1"> {listing.brand} {listing.model}</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <p className="text-3xl font-bold text-trust-700 mt-4">
                {listing.price.toLocaleString('ru-RU')} ₽
              </p>
              <div className="flex gap-4 mt-4 text-sm text-gray-500">
                <span>{listing.views} просмотров</span>
                <span>{listing.favorites} в избранном</span>
                <span>Опубликовано {listing.created_at}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Описание</h2>
              <div className="whitespace-pre-line text-gray-700">
                {listing.description}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Характеристики</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Категория</dt>
                  <dd className="font-medium text-gray-900">Смартфоны</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Состояние</dt>
                  <dd className="font-medium text-gray-900">Как новый</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Город</dt>
                  <dd className="font-medium text-gray-900">{listing.city}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Buy / Contact Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-24">
              <p className="text-3xl font-bold text-trust-700 mb-4">
                {listing.price.toLocaleString('ru-RU')} ₽
              </p>
              
              <div className="space-y-3">
                <button className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                  Купить безопасно
                </button>
                <button className="w-full bg-trust-700 hover:bg-trust-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                  Написать продавцу
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Деньги хранятся в эскроу до подтверждения получения товара
              </p>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Продавец</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-trust-100 rounded-full flex items-center justify-center">
                  <span className="text-trust-700 font-bold text-lg">{listing.seller.name[0]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{listing.seller.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      listing.seller.verification_tier === 'trusted' ? 'bg-accent-100 text-accent-700' :
                      'bg-trust-100 text-trust-700'
                    }`}>
                      {listing.seller.verification_tier === 'trusted' ? '✓ Проверенный' : 'Верифицирован'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{listing.seller.last_active}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Сделок успешно</span>
                  <span className="font-medium text-accent-600">{listing.seller.successful_transactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Рейтинг</span>
                  <span className="font-medium text-accent-600">{listing.seller.rating}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">На платформе</span>
                  <span className="font-medium text-gray-900">{listing.seller.account_age}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href={`/messages/new?user=${listing.seller.id}`} className="block w-full text-center text-trust-700 font-medium hover:text-trust-800">
                  Показать контакт
                </Link>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-trust-50 rounded-xl p-4 border border-trust-100">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-trust-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-trust-900 text-sm">Защита покупателя</p>
                  <p className="text-xs text-trust-700 mt-1">Деньги в эскроу до подтверждения</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
