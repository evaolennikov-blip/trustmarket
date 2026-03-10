'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    const finish = () => {
      const next = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
      sessionStorage.removeItem('auth_redirect')
      // Full navigation so server middleware sees the freshly set session cookie
      window.location.href = next
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) window.location.href = '/auth'
        else finish()
      })
      return
    }

    // Fallback: implicit flow (hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish()
      else window.location.href = '/auth'
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-trust-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Входим в аккаунт...</p>
      </div>
    </div>
  )
}
