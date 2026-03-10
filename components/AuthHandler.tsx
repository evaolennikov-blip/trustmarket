'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.location.hash.includes('access_token')) return

    const redirect = () => {
      const next = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
      sessionStorage.removeItem('auth_redirect')
      window.history.replaceState(null, '', window.location.pathname)
      router.replace(next)
    }

    // Try immediately — session may already be parsed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirect()
    })

    // Also listen for SIGNED_IN in case hash processing is async
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) redirect()
    })

    return () => subscription.unsubscribe()
  }, [router])

  return null
}
