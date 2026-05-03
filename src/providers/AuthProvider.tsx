'use client'

import { useCallback, useState, useSyncExternalStore, createContext, useContext, ReactNode } from 'react'
import type { AuthUser } from '@/types/auth.types'
import { readLocalSessionCookie } from '@/lib/auth/local-session'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

let lastCookieSnapshot = ''
let lastUserSnapshot: AuthUser | null = null

function subscribeToLocalSession(callback: () => void) {
  if (typeof window === 'undefined') return () => undefined

  const timer = window.setTimeout(callback, 0)
  const handleStorage = () => callback()
  window.addEventListener('storage', handleStorage)

  return () => {
    window.clearTimeout(timer)
    window.removeEventListener('storage', handleStorage)
  }
}

function getLocalSessionUserSnapshot() {
  if (typeof document === 'undefined') return null

  const cookieSnapshot = document.cookie
  if (cookieSnapshot === lastCookieSnapshot) return lastUserSnapshot

  lastCookieSnapshot = cookieSnapshot
  lastUserSnapshot = readLocalSessionCookie()?.user ?? null

  return lastUserSnapshot
}

function getServerSessionUserSnapshot() {
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionUser = useSyncExternalStore(
    subscribeToLocalSession,
    getLocalSessionUserSnapshot,
    getServerSessionUserSnapshot,
  )
  const [userOverride, setUserOverride] = useState<AuthUser | null | undefined>(undefined)
  const [loading] = useState(false)
  const user = userOverride === undefined ? sessionUser : userOverride
  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserOverride(nextUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
