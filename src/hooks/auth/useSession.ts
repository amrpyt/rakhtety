import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { AuthSession } from '@/types/auth.types'
import { toAuthUser } from '@/lib/auth/auth-user'

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const syncSession = async (supabaseSession: Session | null) => {
      if (!mounted) {
        return
      }

      if (!supabaseSession?.user) {
        setSession(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseSession.user.id)
        .maybeSingle()

      if (!mounted) {
        return
      }

      setSession({
        user: toAuthUser(supabaseSession.user, profile),
        access_token: supabaseSession.access_token,
        refresh_token: supabaseSession.refresh_token,
        expires_at: supabaseSession.expires_at || 0,
      })
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      void syncSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      void syncSession(supabaseSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}
