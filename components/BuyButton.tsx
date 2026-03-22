'use client'

import { useState } from 'react'

interface BuyButtonProps {
  listingId: string
}

export default function BuyButton({ listingId }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Ошибка при создании сделки')
        return
      }
      if (json.data?.confirmation_url) {
        window.location.href = json.data.confirmation_url
      }
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-trust-700 hover:bg-trust-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition"
      >
        {loading ? 'Создание сделки...' : 'Купить через эскроу'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
