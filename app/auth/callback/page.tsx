'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase automatically processes the #access_token hash on getSession()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const next = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
        sessionStorage.removeItem('auth_redirect')
        router.replace(next)
      } else {
        router.replace('/auth')
      }
    })

    // Also listen for the SIGNED_IN event which fires when hash is processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const next = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
        sessionStorage.removeItem('auth_redirect')
        router.replace(next)
      }
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
