'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Страница не найдена</h1>
        <p className="text-gray-500 mb-6">Извините, запрашиваемая страница не существует.</p>
        <Link 
          href="/listings" 
          className="inline-block bg-trust-700 hover:bg-trust-800 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Перейти к объявлениям
        </Link>
      </div>
    </div>
  )
}
