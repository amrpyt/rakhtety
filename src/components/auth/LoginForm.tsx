'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Input } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Alert'
import type { LoginCredentials } from '@/types/auth.types'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const searchParams = useSearchParams()
  const { login, loading, error, resetError } = useAuth()
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' })
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({})

  function validate(): boolean {
    const errors: Partial<LoginCredentials> = {}

    if (!credentials.email) {
      errors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'البريد الإلكتروني غير صالح'
    }

    if (!credentials.password) {
      errors.password = 'كلمة المرور مطلوبة'
    } else if (credentials.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetError()

    if (!validate()) return

    try {
      const redirectTo = searchParams.get('redirect')
      await login(credentials, redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard')
      onSuccess?.()
    } catch {
      // Error is handled by useAuth
    }
  }

  function handleChange(field: keyof LoginCredentials) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }))
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <Alert variant="error" title="خطأ في تسجيل الدخول">
          {error}
        </Alert>
      )}

      <FormGroup>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={credentials.email}
          onChange={handleChange('email')}
          placeholder="example@domain.com"
          error={validationErrors.email}
          required
          dir="ltr"
          autoComplete="email"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          value={credentials.password}
          onChange={handleChange('password')}
          placeholder="••••••••"
          error={validationErrors.password}
          required
          dir="ltr"
          autoComplete="current-password"
        />
      </FormGroup>

      <Button type="submit" className="w-full justify-center" disabled={loading}>
        {loading ? 'جارٍ التحميل...' : 'دخول'}
      </Button>
    </form>
  )
}
