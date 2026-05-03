'use client'

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { FormGroup, Input, Label, Select } from '@/components/ui/Form'
import type { CreateEmployeeDto, UpdateEmployeeDto } from '@/lib/services/employee.service'
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  sanitizePhoneInput,
  type EmployeeCreateFormData,
  type EmployeeUpdateFormData,
} from '@/lib/validation/schemas'

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

type EmployeeFormData = EmployeeCreateFormData | EmployeeUpdateFormData

export function EmployeeForm({ mode, initialData, onSubmit, onCancel }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(mode === 'create' ? employeeCreateSchema : employeeUpdateSchema),
    defaultValues: {
      full_name: initialData?.profile?.full_name || '',
      email: '',
      password: '',
      phone: initialData?.profile?.phone || '',
      position: initialData?.position || '',
      role: initialData?.profile?.role || 'employee',
    } as EmployeeFormData,
  })

  const phoneField = register('phone')
  const roleOptions = [
    { value: 'employee', label: 'موظف' },
    { value: 'manager', label: 'مدير' },
    { value: 'admin', label: 'مدير النظام' },
  ]

  const submit = useCallback(
    async (formData: EmployeeFormData) => {
      setApiError(null)
      setLoading(true)

      try {
        if (mode === 'create') {
          const createData = formData as EmployeeCreateFormData
          await onSubmit({
            email: createData.email,
            password: createData.password,
            full_name: createData.full_name,
            phone: createData.phone || undefined,
            role: createData.role,
            position: createData.position || undefined,
          } as CreateEmployeeDto)
        } else {
          const updateData = formData as EmployeeUpdateFormData
          await onSubmit({
            full_name: updateData.full_name,
            phone: updateData.phone || undefined,
            role: updateData.role,
            position: updateData.position || undefined,
          } as UpdateEmployeeDto)
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'حدث خطأ')
      } finally {
        setLoading(false)
      }
    },
    [mode, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      {apiError && (
        <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-error-light)] text-[var(--color-error)] text-sm">
          {apiError}
        </div>
      )}

      <FormGroup>
        <Label htmlFor="full_name">الاسم الكامل</Label>
        <Input id="full_name" error={errors.full_name?.message} required {...register('full_name')} />
      </FormGroup>

      {mode === 'create' && (
        <FormGroup>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            error={'email' in errors ? errors.email?.message : undefined}
            required
            dir="ltr"
            {...register('email' as keyof EmployeeFormData)}
          />
        </FormGroup>
      )}

      {mode === 'create' && (
        <FormGroup>
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            error={'password' in errors ? errors.password?.message : undefined}
            required
            dir="ltr"
            {...register('password' as keyof EmployeeFormData)}
          />
        </FormGroup>
      )}

      <FormGroup>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          error={errors.phone?.message}
          dir="ltr"
          {...phoneField}
          onChange={(event) => {
            event.target.value = sanitizePhoneInput(event.target.value)
            phoneField.onChange(event)
          }}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="position">الوظيفة</Label>
        <Input id="position" error={errors.position?.message} {...register('position')} />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="role">الدور</Label>
        <Select id="role" error={errors.role?.message} options={roleOptions} {...register('role')} />
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
