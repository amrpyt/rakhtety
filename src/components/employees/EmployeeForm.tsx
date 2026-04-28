'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Input, Select } from '@/components/ui/Form'
import type { CreateEmployeeDto, UpdateEmployeeDto } from '@/lib/services/employee.service'

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<EmployeeWithProfile>
  onSubmit: (data: CreateEmployeeDto | UpdateEmployeeDto) => Promise<void>
  onCancel: () => void
}

interface EmployeeWithProfile {
  id: string
  user_id: string
  position: string | null
  is_active: boolean
  profile: {
    full_name: string
    role: 'admin' | 'employee' | 'manager'
    phone: string | null
  }
}

export function EmployeeForm({ mode, initialData, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState({
    full_name: initialData?.profile?.full_name || '',
    email: mode === 'create' ? '' : undefined,
    phone: initialData?.profile?.phone || '',
    position: initialData?.position || '',
    role: (initialData?.profile?.role as 'admin' | 'employee' | 'manager') || 'employee',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const roleOptions = [
    { value: 'employee', label: 'موظف' },
    { value: 'manager', label: 'مدير' },
    { value: 'admin', label: 'مدير النظام' },
  ]

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'الاسم مطلوب'
    }

    if (mode === 'create' && !formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (mode === 'create' && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, mode])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setApiError(null)

      if (!validate()) return

      setLoading(true)
      try {
        if (mode === 'create') {
          await onSubmit({
            email: formData.email!,
            password: 'temp-password-123',
            full_name: formData.full_name,
            phone: formData.phone || undefined,
            role: formData.role,
            position: formData.position || undefined,
          } as CreateEmployeeDto)
        } else {
          await onSubmit({
            full_name: formData.full_name,
            phone: formData.phone || undefined,
            role: formData.role,
            position: formData.position || undefined,
          } as UpdateEmployeeDto)
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'حدث خطأ')
      } finally {
        setLoading(false)
      }
    }, [formData, mode, onSubmit, validate])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error-light)] text-[var(--color-error)] text-sm">
          {apiError}
        </div>
      )}

      <FormGroup>
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={handleChange('full_name')}
          error={errors.full_name}
          required
        />
      </FormGroup>

      {mode === 'create' && (
        <FormGroup>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={handleChange('email')}
            error={errors.email}
            required
            dir="ltr"
          />
        </FormGroup>
      )}

      <FormGroup>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={handleChange('phone')}
          dir="ltr"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="position">الوظيفة</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={handleChange('position')}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="role">الدور</Label>
        <Select
          id="role"
          value={formData.role}
          onChange={handleChange('role')}
          options={roleOptions}
        />
      </FormGroup>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" type="button" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" loading={loading}>
          {mode === 'create' ? 'إضافة' : 'حفظ التغييرات'}
        </Button>
      </div>
    </form>
  )
}