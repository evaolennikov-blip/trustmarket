'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) {
      setError('Введите корректный email')
      return
    }
    setLoading(true)
    const redirectTo = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (!err) sessionStorage.setItem('auth_redirect', redirectTo)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      sessionStorage.setItem('auth_email', email)
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
        <p className="text-gray-500 text-sm mb-6">Введите email — пришлём ссылку для входа</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-trust-700 text-white py-3 rounded-xl font-semibold hover:bg-trust-800 transition disabled:opacity-50"
          >
            {loading ? 'Отправляем...' : 'Получить ссылку для входа'}
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
