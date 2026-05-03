'use client'

import Link from 'next/link'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Input } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Alert'
import { loginSchema, type LoginFormData } from '@/lib/validation/schemas'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const searchParams = useSearchParams()
  const { login, loading, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(credentials: LoginFormData) {
    resetError()

    try {
      const redirectTo = searchParams.get('redirect')
      await login(credentials, redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard')
      onSuccess?.()
    } catch {
      // useAuth owns the visible error message.
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-primary-light)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
          دخول الموظفين
        </div>
        <h2 className="text-2xl font-bold leading-tight text-[var(--color-text)]">مرحباً بك من جديد</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          سجل الدخول لإدارة العملاء، المسارات، والمهام اليومية من مكان واحد.
        </p>
      </div>

      {error && (
        <Alert variant="error" title="خطأ في تسجيل الدخول">
          {error}
        </Alert>
      )}

      <div className="space-y-4">
        <FormGroup>
          <Label htmlFor="email" className="text-[var(--color-text)]">
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@domain.com"
            error={errors.email?.message}
            required
            dir="ltr"
            autoComplete="email"
            className="h-12 bg-white text-left"
            {...register('email')}
          />
        </FormGroup>

        <FormGroup>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-[var(--color-text)]">
              كلمة المرور
            </Label>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">6 أحرف على الأقل</span>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            dir="ltr"
            autoComplete="current-password"
            className="h-12 bg-white text-left"
            {...register('password')}
          />
        </FormGroup>
      </div>

      <Button type="submit" className="h-12 w-full justify-center text-base" disabled={loading} loading={loading}>
        {loading ? 'جاري الدخول...' : 'دخول إلى النظام'}
      </Button>

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[var(--color-text-muted)]">ليس لديك حساب؟</span>
        <Link href="/signup" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
          إنشاء حساب جديد
        </Link>
      </div>
    </form>
  )
}
