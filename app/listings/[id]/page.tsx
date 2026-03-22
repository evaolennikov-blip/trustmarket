import Link from 'next/link'
import { notFound } from 'next/navigation'
import VerifiedBadge from '@/components/VerifiedBadge'
import BuyButton from '@/components/BuyButton'
import { supabase } from '@/lib/supabase'

interface SellerData {
  full_name: string
  verification_tier: 'none' | 'basic' | 'enhanced' | 'trusted'
  successful_transactions: number
}

interface ListingData {
  id: string
  title: string
  price_rub: number
  condition: 'new' | 'like_new' | 'good' | 'fair'
  city: string
  description: string
  category: string
  images: string[]
  seller_id: string
  seller: SellerData
}

export async function generateStaticParams() {
  const { data } = await supabase
    .from('listings')
    .select('id')
    .eq('status', 'approved')
  return (data ?? []).map(l => ({ id: l.id }))
}

const conditionLabels = {
  new: 'Новое',
  like_new: 'Как новое',
  good: 'Хорошее',
  fair: 'Удовлетворительное',
}

const conditionColors = {
  new: 'bg-green-100 text-green-700',
  like_new: 'bg-trust-100 text-trust-700',
  good: 'bg-yellow-100 text-yellow-700',
  fair: 'bg-gray-100 text-gray-700',
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      id, title, price_rub, condition, city, description, category, images, seller_id,
      seller:users!listings_seller_id_fkey(full_name, verification_tier, successful_transactions)
    `)
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (error || !data) notFound()

  const listing = data as unknown as ListingData
  const condition = listing.condition

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-trust-900">Трастмаркет</Link>
          <div className="flex items-center gap-4">
            <Link href="/listings" className="text-gray-600 hover:text-trust-600 text-sm font-medium">Объявления</Link>
            <Link href="/sell" className="bg-trust-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-800 transition">+ Продать</Link>
          </div>
        </div>
      </div>

      {/* Anti-scam */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center">
          <p className="text-sm text-yellow-800">Никогда не переводите деньги вне платформы</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/listings" className="hover:text-trust-700">Объявления</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {listing.images.length > 0 ? (
                <img src={listing.images[0]} alt={listing.title} className="w-full aspect-square object-cover" />
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Описание</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{listing.description}</p>
            </div>

            {/* Seller */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Продавец</h2>
              <Link href={`/sellers/${listing.seller_id}`} className="flex items-center gap-4 hover:bg-gray-50 rounded-xl p-3 -m-3 transition">
                <div className="w-14 h-14 bg-trust-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-trust-700 font-bold text-xl">
                    {listing.seller.full_name?.[0] ?? '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{listing.seller.full_name}</span>
                    <VerifiedBadge tier={listing.seller.verification_tier} />
                  </div>
                  <p className="text-sm text-gray-500">{listing.seller.successful_transactions} сделок</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right — price card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-4">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{listing.title}</h1>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${conditionColors[condition]}`}>
                  {conditionLabels[condition]}
                </span>
                <span className="text-sm text-gray-500">📍 {listing.city}</span>
              </div>

              <p className="text-3xl font-bold text-trust-700">
                {listing.price_rub.toLocaleString('ru-RU')} ₽
              </p>

              <BuyButton listingId={listing.id} />

              <Link
                href={`/messages?seller=${listing.seller_id}&listing=${listing.id}`}
                className="block w-full text-center border border-trust-300 text-trust-700 hover:bg-trust-50 font-semibold py-3 rounded-xl transition"
              >
                Написать продавцу
              </Link>

              <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
                <span className="text-base">💳</span>
                <p>Деньги хранятся в эскроу до подтверждения получения</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
