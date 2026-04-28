'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { AuthUser, LoginCredentials, SignUpData } from '@/types/auth.types'
import type { UserRole } from '@/types/database.types'
import { AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignUpData) => Promise<void>
  logout: () => Promise<void>
  resetError: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const resetError = useCallback(() => setError(null), [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        throw AppError.fromError(authError, ErrorCodes.AUTH_INVALID_CREDENTIALS)
      }

      if (!data.user) {
        throw new AppError({
          code: ErrorCodes.AUTH_USER_NOT_FOUND,
          message: 'User not found',
          statusCode: 404,
        })
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: (profile?.role as UserRole) || 'employee',
        full_name: profile?.full_name || data.user.user_metadata?.full_name || '',
        phone: profile?.phone || undefined,
      }

      setUser(authUser)
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [router])

  const signup = useCallback(async (data: SignUpData) => {
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name,
          role: data.role || 'employee',
        },
      })

      if (authError) {
        throw AppError.fromError(authError, ErrorCodes.AUTH_INVALID_CREDENTIALS)
      }

      if (!authData.user) {
        throw new AppError({
          code: ErrorCodes.AUTH_USER_NOT_FOUND,
          message: 'Failed to create user',
          statusCode: 500,
        })
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: data.full_name,
        role: data.role || 'employee',
        phone: data.phone,
      })

      if (profileError) {
        throw AppError.fromError(profileError, ErrorCodes.DB_CONSTRAINT_VIOLATION)
      }

      await login({ email: data.email, password: data.password })
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [login])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  return { user, loading, error, login, signup, logout, resetError }
}