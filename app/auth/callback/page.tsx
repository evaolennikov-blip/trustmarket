'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    const finish = () => {
      const next = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
      sessionStorage.removeItem('auth_redirect')
      router.replace(next)
    }

    if (code) {
      // PKCE flow
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) router.replace('/auth')
        else finish()
      })
      return
    }

    // Implicit flow (hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish()
      else router.replace('/auth')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) finish()
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-trust-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Входим в аккаунт...</p>
      </div>
    </div>
  )
}
