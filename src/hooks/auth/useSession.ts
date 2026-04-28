import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { AuthSession } from '@/types/auth.types'

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: (session.user.user_metadata?.role as 'admin' | 'employee' | 'manager') || 'employee',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone,
          },
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at || 0,
        })
      } else {
        setSession(null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: (session.user.user_metadata?.role as 'admin' | 'employee' | 'manager') || 'employee',
            full_name: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone,
          },
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at || 0,
        })
      } else {
        setSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}