'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Input, Select } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Alert'
import { sanitizePhoneInput, signupSchema, type SignupFormData } from '@/lib/validation/schemas'

interface SignUpFormProps {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signup, loading, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'employee',
    },
  })

  async function onSubmit(formData: SignupFormData) {
    resetError()

    try {
      await signup(formData)
      onSuccess?.()
    } catch {
      // Error is handled by useAuth.
    }
  }

  const roleOptions = [
    { value: 'employee', label: 'موظف' },
    { value: 'manager', label: 'مدير' },
    { value: 'admin', label: 'مدير النظام' },
  ]

  const phoneField = register('phone')

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as SignupFormData))} className="space-y-5" noValidate>
      {error && (
        <Alert variant="error" title="خطأ في التسجيل">
          {error}
        </Alert>
      )}

      <FormGroup>
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="أحمد محمد"
          error={errors.full_name?.message}
          required
          {...register('full_name')}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@domain.com"
          error={errors.email?.message}
          required
          dir="ltr"
          autoComplete="email"
          {...register('email')}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="01xxxxxxxxx"
          dir="ltr"
          error={errors.phone?.message}
          {...phoneField}
          onChange={(event) => {
            event.target.value = sanitizePhoneInput(event.target.value)
            phoneField.onChange(event)
          }}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          required
          dir="ltr"
          autoComplete="new-password"
          {...register('password')}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="role">الدور</Label>
        <Select id="role" error={errors.role?.message} options={roleOptions} {...register('role')} />
      </FormGroup>

      <Button type="submit" className="w-full justify-center" disabled={loading} loading={loading}>
        {loading ? 'جاري التسجيل...' : 'تسجيل'}
      </Button>
    </form>
  )
}
