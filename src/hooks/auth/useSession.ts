import { useState } from 'react'
import type { AuthSession } from '@/types/auth.types'
import { readLocalSessionCookie } from '@/lib/auth/local-session'

export function useSession() {
  const [session] = useState<AuthSession | null>(() => readLocalSessionCookie())
  const [loading] = useState(false)

  return { session, loading }
}
