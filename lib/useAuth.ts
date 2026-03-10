'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth(redirectIfUnauthenticated = true) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (!session && redirectIfUnauthenticated) {
        sessionStorage.setItem('auth_redirect', window.location.pathname)
        router.push('/auth')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session && redirectIfUnauthenticated) {
        sessionStorage.setItem('auth_redirect', window.location.pathname)
        router.push('/auth')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, redirectIfUnauthenticated])

  return { user, loading }
}
