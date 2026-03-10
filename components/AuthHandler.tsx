'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const code = new URLSearchParams(window.location.search).get('code')
    const hasHash = window.location.hash.includes('access_token')

    if (!code && !hasHash) return

    const redirect = () => {
      const next = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
      sessionStorage.removeItem('auth_redirect')
      window.history.replaceState(null, '', window.location.pathname)
      router.replace(next)
    }

    if (code) {
      // PKCE flow — exchange code for session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) redirect()
      })
      return
    }

    // Implicit flow — session in hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirect()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) redirect()
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
