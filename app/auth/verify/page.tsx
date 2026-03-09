'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function VerifyPage() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(60)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const p = sessionStorage.getItem('auth_phone')
    if (!p) router.push('/auth')
    else setPhone(p)

    const interval = setInterval(() => {
      setResendTimer(t => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...code]
    next[i] = val.slice(-1)
    setCode(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(d => d)) handleVerify(next.join(''))
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handleVerify = async (otp: string) => {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (err) {
      setError('Неверный код. Попробуйте ещё раз.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } else {
      sessionStorage.removeItem('auth_phone')
      router.push('/dashboard')
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    await supabase.auth.signInWithOtp({ phone })
    setResendTimer(60)
    setCode(['', '', '', '', '', ''])
    inputs.current[0]?.focus()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <Link href="/" className="block text-center font-bold text-xl text-trust-900 mb-8">
          Трастмаркет
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Введите код</h1>
        <p className="text-gray-500 text-sm mb-6">
          Отправили SMS на <span className="font-medium text-gray-700">{phone}</span>
        </p>

        <div className="flex gap-2 justify-center mb-4">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:border-trust-500 focus:ring-2 focus:ring-trust-100 outline-none"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
        {loading && <p className="text-gray-400 text-sm text-center mb-3">Проверяем...</p>}

        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className="w-full text-sm text-trust-600 py-2 disabled:text-gray-400"
        >
          {resendTimer > 0 ? `Отправить повторно через ${resendTimer} с` : 'Отправить код повторно'}
        </button>

        <button
          onClick={() => router.push('/auth')}
          className="w-full text-sm text-gray-400 py-1 hover:text-gray-600"
        >
          Изменить номер
        </button>
      </div>
    </div>
  )
}
