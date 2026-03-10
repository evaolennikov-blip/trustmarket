'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.location.hash.includes('access_token')) return

    // Token is in the hash — let Supabase process it
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const next = sessionStorage.getItem('auth_redirect') ?? '/dashboard'
        sessionStorage.removeItem('auth_redirect')
        // Clear the hash then navigate
        window.history.replaceState(null, '', window.location.pathname)
        router.replace(next)
      }
    })
  }, [router])

  return null
}
