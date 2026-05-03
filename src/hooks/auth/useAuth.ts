'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser, LoginCredentials, SignUpData } from '@/types/auth.types'
import { useAuthContext } from '@/providers/AuthProvider'
import { AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials, redirectTo?: string) => Promise<void>
  signup: (data: SignUpData, redirectTo?: string) => Promise<void>
  logout: () => Promise<void>
  resetError: () => void
}

export function useAuth(): UseAuthReturn {
  const { user, setUser } = useAuthContext()
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loading = actionLoading

  const resetError = useCallback(() => setError(null), [])

  const normalizeRedirect = useCallback((redirectTo?: string) => {
    if (redirectTo && redirectTo.startsWith('/')) {
      return redirectTo
    }

    return '/dashboard'
  }, [])

  const login = useCallback(async (credentials: LoginCredentials, redirectTo?: string) => {
    setActionLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | {
            user?: AuthUser
            session?: {
              access_token: string
              refresh_token: string
              expires_at: number
            }
            error?: string
          }
        | null

      if (!response.ok) {
        throw new AppError({
          code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
          message: payload?.error || 'Login failed',
          statusCode: response.status,
        })
      }

      if (!payload?.user) {
        throw new AppError({
          code: ErrorCodes.AUTH_USER_NOT_FOUND,
          message: 'User not found',
          statusCode: 404,
        })
      }

      setUser(payload.user)
      router.push(normalizeRedirect(redirectTo))
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setActionLoading(false)
    }
  }, [normalizeRedirect, router, setUser])

  const signup = useCallback(async (data: SignUpData, redirectTo?: string) => {
    setActionLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          role: 'employee',
        }),
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null

      if (!response.ok) {
        throw new AppError({
          code: response.status === 409 ? ErrorCodes.DB_CONSTRAINT_VIOLATION : ErrorCodes.AUTH_INVALID_CREDENTIALS,
          message: payload?.error || 'Signup failed',
          statusCode: response.status,
        })
      }

      await login({ email: data.email, password: data.password }, redirectTo)
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setActionLoading(false)
    }
  }, [login])

  const logout = useCallback(async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error || 'Logout failed')
      }

      setUser(null)
      router.push('/login')
    } finally {
      setActionLoading(false)
    }
  }, [router, setUser])

  return { user, loading, error, login, signup, logout, resetError }
}
