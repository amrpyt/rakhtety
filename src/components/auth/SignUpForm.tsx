'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Input, Select } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Alert'
import type { SignUpData } from '@/types/auth.types'

interface SignUpFormProps {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const router = useRouter()
  const { signup, loading, error, resetError } = useAuth()
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'employee',
  })
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof SignUpData, string>>>({})

  function validate(): boolean {
    const errors: Partial<Record<keyof SignUpData, string>> = {}

    if (!formData.full_name.trim()) {
      errors.full_name = 'الاسم مطلوب'
    }

    if (!formData.email) {
      errors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'البريد الإلكتروني غير صالح'
    }

    if (!formData.password) {
      errors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 6) {
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
      await signup(formData)
      onSuccess?.()
    } catch {
      // Error is handled by useAuth
    }
  }

  function handleChange(field: keyof SignUpData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  const roleOptions = [
    { value: 'employee', label: 'موظف' },
    { value: 'manager', label: 'مدير' },
    { value: 'admin', label: 'مدير النظام' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          value={formData.full_name}
          onChange={handleChange('full_name')}
          placeholder="أحمد محمد"
          error={validationErrors.full_name}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="example@domain.com"
          error={validationErrors.email}
          required
          dir="ltr"
          autoComplete="email"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange('phone')}
          placeholder="01xxxxxxxxx"
          dir="ltr"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          placeholder="••••••••"
          error={validationErrors.password}
          required
          dir="ltr"
          autoComplete="new-password"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="role">الدور</Label>
        <Select
          id="role"
          value={formData.role || 'employee'}
          onChange={handleChange('role')}
          options={roleOptions}
        />
      </FormGroup>

      <Button type="submit" className="w-full justify-center" disabled={loading}>
        {loading ? 'جارٍ التسجيل...' : 'تسجيل'}
      </Button>
    </form>
  )
}