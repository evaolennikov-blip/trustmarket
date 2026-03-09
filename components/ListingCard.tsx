import Link from 'next/link'

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    condition: string;
    city: string;
    images: string[];
    seller: {
      name: string;
      verification_tier: 'trusted' | 'enhanced' | 'basic' | 'none';
      successful_transactions: number;
    };
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const conditionText = {
    'new': 'Новый',
    'like_new': 'Как новый',
    'good': 'Хорошее',
    'fair': 'Удовлетворительное',
    'for_parts': 'На запчасти',
  }[listing.condition] || listing.condition

  return (
    <Link href={`/listings/${listing.id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-gray-100 relative">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {/* Verification badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              listing.seller.verification_tier === 'trusted' ? 'bg-accent-100 text-accent-700' :
              listing.seller.verification_tier === 'enhanced' ? 'bg-trust-100 text-trust-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {listing.seller.verification_tier === 'trusted' && '✓'}
              {listing.seller.verification_tier === 'enhanced' && '●'}
              {listing.seller.verification_tier === 'basic' && '○'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-trust-600 transition-colors line-clamp-1">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {conditionText}
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-trust-700">
              {listing.price.toLocaleString('ru-RU')} ₽
            </span>
            <span className="text-sm text-gray-500">{listing.city}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <span className={`${
              listing.seller.verification_tier === 'trusted' ? 'text-accent-600' :
              listing.seller.verification_tier === 'enhanced' ? 'text-trust-600' :
              'text-gray-500'
            }`}>
              {listing.seller.name}
            </span>
            <span>•</span>
            <span>{listing.seller.successful_transactions} сделок</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
