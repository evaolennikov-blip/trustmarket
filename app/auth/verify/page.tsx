'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function VerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [timer, setTimer] = useState(60)

  useEffect(() => {
    const e = sessionStorage.getItem('auth_email')
    if (!e) router.push('/auth')
    else setEmail(e)

    const interval = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(interval)
  }, [router])

  const handleResend = async () => {
    if (timer > 0) return
    setResending(true)
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setResending(false)
    setResent(true)
    setTimer(60)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8 text-center">
        <Link href="/" className="block font-bold text-xl text-trust-900 mb-8">
          Трастмаркет
        </Link>

        <div className="w-16 h-16 bg-trust-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-trust-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Проверьте почту</h1>
        <p className="text-gray-500 text-sm mb-1">Отправили ссылку для входа на</p>
        <p className="font-medium text-gray-800 mb-6">{email}</p>

        <p className="text-xs text-gray-400 mb-6">
          Нажмите на ссылку в письме — и вы войдёте автоматически. Проверьте папку «Спам», если письмо не пришло.
        </p>

        {resent && (
          <p className="text-green-600 text-sm mb-3">Письмо отправлено повторно</p>
        )}

        <button
          onClick={handleResend}
          disabled={timer > 0 || resending}
          className="w-full text-sm text-trust-600 py-2 disabled:text-gray-400"
        >
          {timer > 0 ? `Отправить повторно через ${timer} с` : resending ? 'Отправляем...' : 'Отправить повторно'}
        </button>

        <button
          onClick={() => router.push('/auth')}
          className="w-full text-sm text-gray-400 py-1 hover:text-gray-600"
        >
          Изменить email
        </button>
      </div>
    </div>
  )
}
