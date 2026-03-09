'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('7') || digits.startsWith('8')) {
      return '+7' + digits.slice(1, 11)
    }
    return '+7' + digits.slice(0, 10)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const formatted = formatPhone(phone)
    if (formatted.length < 12) {
      setError('Введите корректный номер телефона')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatted })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      sessionStorage.setItem('auth_phone', formatted)
      router.push('/auth/verify')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <Link href="/" className="block text-center font-bold text-xl text-trust-900 mb-8">
          Трастмаркет
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Войти или зарегистрироваться</h1>
        <p className="text-gray-500 text-sm mb-6">Введите номер телефона — пришлём код подтверждения</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
            <input
              type="tel"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none text-lg"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-trust-700 text-white py-3 rounded-xl font-semibold hover:bg-trust-800 transition disabled:opacity-50"
          >
            {loading ? 'Отправляем...' : 'Получить код'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Продолжая, вы соглашаетесь с{' '}
          <Link href="#" className="underline">условиями использования</Link>
        </p>
      </div>
    </div>
  )
}
