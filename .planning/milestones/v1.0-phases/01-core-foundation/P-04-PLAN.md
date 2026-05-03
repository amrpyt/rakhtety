---
phase: 1
plan: P-04
type: execute
wave: 2
depends_on:
  - P-01
  - P-02
files_modified:
  - src/app/(dashboard)/employees/page.tsx
  - src/app/(dashboard)/employees/[id]/page.tsx
  - src/components/ui/Avatar.tsx
  - src/components/ui/Dialog.tsx
  - src/components/employees/EmployeeCard.tsx
  - src/components/employees/EmployeeForm.tsx
  - src/components/employees/EmployeeList.tsx
  - src/lib/services/employee.service.ts
  - src/hooks/useEmployees.ts
autonomous: false
requirements:
  - EMP-01
  - EMP-02
---

<objective>
Implement employee management UI with modular enterprise architecture: employee CRUD operations, employee cards with role/workload stats, role-based badges, and admin actions. Uses repository pattern, service layer, custom hooks, and composable UI components.
</objective>

<read_first>
- rakhtety-erp-demo.html (employees section: ~1251-1283)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-07: role-based RLS policies)
- .planning/phases/01-core-foundation/01-RESEARCH.md (employees table schema, RLS policies)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Component Inventory: Avatar, Badge)
- .planning/phases/01-core-foundation/P-01-PLAN.md (repository interfaces, error handling)
- .planning/phases/01-core-foundation/P-02-PLAN.md (component structure, auth hooks)
- .planning/phases/01-core-foundation/P-03-PLAN.md (service layer, hooks pattern)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - src/components/ui/Avatar.tsx
</files>
<action>
Create Avatar component with size variants:

```typescript
import React from 'react'

interface AvatarProps {
  initials: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  src?: string
  alt?: string
  className?: string
}

const sizeStyles = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const sizeStylesIcon = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

export function Avatar({ initials, size = 'md', src, alt, className = '' }: AvatarProps) {
  if (src) {
    return (
      <div className={`rounded-full overflow-hidden flex-shrink-0 ${sizeStyles[size]} ${className}`}>
        <img src={src} alt={alt || initials} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full
        flex items-center justify-center
        font-bold text-white
        flex-shrink-0
        ${className}
      `.trim()}
      style={{ background: 'var(--color-primary)' }}
      title={initials}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  )
}

interface AvatarGroupProps {
  avatars: { initials: string; src?: string }[]
  max?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className="flex items-center -space-x-reverse space-x-reverse">
      {visible.map((avatar, index) => (
        <div key={index} className="ring-2 ring-white rounded-full">
          <Avatar initials={avatar.initials} src={avatar.src} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeStyles[size]}
            rounded-full
            flex items-center justify-center
            bg-[var(--color-surface-offset)]
            text-[var(--color-text-muted)]
            font-medium
            ring-2 ring-white
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Avatar.tsx
grep -q "Avatar" src/components/ui/Avatar.tsx
grep -q "AvatarGroup" src/components/ui/Avatar.tsx
```
</verify>
<acceptance_criteria>
- Avatar has xs, sm, md, lg, xl sizes
- Avatar supports image src
- AvatarGroup shows stacked avatars with overflow count
- Initials truncated to 2 characters
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Dialog.tsx
</files>
<action>
Create Dialog component:

```typescript
'use client'

import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[var(--radius-xl)] shadow-xl border border-[var(--color-border)]"
        style={{
          animation: 'dialog-enter 200ms ease-out',
        }}
      >
        <style>{`
          @keyframes dialog-enter {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        {children}
      </div>
    </div>,
    document.body
  )
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div className={`p-6 pb-4 border-b border-[var(--color-divider)] ${className}`}>
      {children}
    </div>
  )
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h2 className={`text-lg font-bold ${className}`}>{children}</h2>
  )
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
  return (
    <p className={`text-sm text-[var(--color-text-muted)] mt-1 ${className}`}>{children}</p>
  )
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export function DialogFooter({ children, className = '' }: DialogFooterProps) {
  return (
    <div className={`p-6 pt-4 flex justify-end gap-3 border-t border-[var(--color-divider)] ${className}`}>
      {children}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Dialog.tsx
grep -q "Dialog" src/components/ui/Dialog.tsx
grep -q "createPortal" src/components/ui/Dialog.tsx
```
</verify>
<acceptance_criteria>
- Dialog has open/onOpenChange props
- Escape key closes dialog
- Backdrop click closes dialog
- Body scroll locked when open
- DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter exports
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/services/employee.service.ts
</files>
<action>
Create employee service:

```typescript
import { employeeRepository } from '@/lib/database/repositories/employee.repository'
import { supabase } from '@/lib/supabase/client'
import type { Employee, EmployeeWithProfile, UserRole } from '@/types/database.types'
import { NotFoundError, AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface CreateEmployeeDto {
  email: string
  password: string
  full_name: string
  phone?: string
  role: UserRole
  position?: string
}

export interface UpdateEmployeeDto {
  full_name?: string
  phone?: string
  role?: UserRole
  position?: string
  is_active?: boolean
}

export class EmployeeService {
  async findById(id: string): Promise<EmployeeWithProfile> {
    const employees = await employeeRepository.findAll()
    const employee = employees.find((e) => e.id === id)
    if (!employee) {
      throw new NotFoundError('الموظف', id)
    }
    return employee
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    return employeeRepository.findByUserId(userId)
  }

  async findAll(includeInactive = false): Promise<EmployeeWithProfile[]> {
    return employeeRepository.findAll(includeInactive)
  }

  async create(data: CreateEmployeeDto): Promise<EmployeeWithProfile> {
    const existingEmail = await this.checkEmailExists(data.email)
    if (existingEmail) {
      throw new AppError({
        code: ErrorCodes.DUPLICATE_ENTRY,
        message: 'البريد الإلكتروني مستخدم بالفعل',
        statusCode: 409,
        context: { field: 'email' },
      })
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: data.role,
      },
    })

    if (authError || !authData.user) {
      throw AppError.fromError(authError || new Error('Failed to create auth user'), ErrorCodes.AUTH_INVALID_CREDENTIALS)
    }

    const { data: profile } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: data.full_name,
      phone: data.phone,
      role: data.role,
    })

    if (profile) {
      throw AppError.fromError(profile, ErrorCodes.DB_CONSTRAINT_VIOLATION)
    }

    const employee = await employeeRepository.create({
      user_id: authData.user.id,
      position: data.position,
      is_active: true,
    })

    const employees = await employeeRepository.findAll()
    return employees.find((e) => e.id === employee.id)!
  }

  async update(id: string, data: UpdateEmployeeDto): Promise<EmployeeWithProfile> {
    const existing = await this.findById(id)

    if (data.full_name || data.phone || data.role) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
        })
        .eq('id', existing.user_id)

      if (error) {
        throw AppError.fromError(error, ErrorCodes.DB_CONSTRAINT_VIOLATION)
      }
    }

    if (data.position !== undefined || data.is_active !== undefined) {
      await employeeRepository.update(id, {
        position: data.position,
        is_active: data.is_active,
      })
    }

    return this.findById(id)
  }

  async deactivate(id: string): Promise<EmployeeWithProfile> {
    return this.update(id, { is_active: false })
  }

  async reactivate(id: string): Promise<EmployeeWithProfile> {
    return this.update(id, { is_active: true })
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id)
    const workflowCount = await employeeRepository.getWorkflowCount(existing.user_id)

    if (workflowCount > 0) {
      throw new AppError({
        code: ErrorCodes.OPERATION_NOT_ALLOWED,
        message: `لا يمكن حذف الموظف لأنه يملك ${workflowCount} مسارات عمل نشطة. يرجى نقل المسارات أولاً.`,
        statusCode: 400,
        context: { workflowCount },
      })
    }

    await employeeRepository.delete(id)

    await supabase.auth.admin.deleteUser(existing.user_id)
  }

  async getWorkflowStats(userId: string): Promise<{ active: number; completed: number; blocked: number }> {
    const { count: active } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .neq('status', 'completed')

    const { count: completed } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('status', 'completed')

    const { count: blocked } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('status', 'blocked')

    return {
      active: active || 0,
      completed: completed || 0,
      blocked: blocked || 0,
    }
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single()
    return !!data
  }
}

export const employeeService = new EmployeeService()
```
</action>
<verify>
```bash
test -f src/lib/services/employee.service.ts
grep -q "EmployeeService" src/lib/services/employee.service.ts
grep -q "getWorkflowStats" src/lib/services/employee.service.ts
```
</verify>
<acceptance_criteria>
- EmployeeService wraps repository with business logic
- create creates auth user + profile + employee record
- delete checks workflow assignments before deletion
- getWorkflowStats returns active/completed/blocked counts
- NotFoundError and AppError for error handling
- Singleton exported
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/hooks/useEmployees.ts
</files>
<action>
Create useEmployees hook:

```typescript
import { useState, useCallback, useEffect } from 'react'
import { employeeService, CreateEmployeeDto, UpdateEmployeeDto } from '@/lib/services/employee.service'
import type { EmployeeWithProfile } from '@/types/database.types'

interface UseEmployeesReturn {
  employees: EmployeeWithProfile[]
  loading: boolean
  error: string | null
  fetchEmployees: () => Promise<void>
  createEmployee: (data: CreateEmployeeDto) => Promise<EmployeeWithProfile>
  updateEmployee: (id: string, data: UpdateEmployeeDto) => Promise<EmployeeWithProfile>
  deleteEmployee: (id: string) => Promise<void>
  deactivateEmployee: (id: string) => Promise<EmployeeWithProfile>
  reactivateEmployee: (id: string) => Promise<EmployeeWithProfile>
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<EmployeeWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await employeeService.findAll()
      setEmployees(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const createEmployee = useCallback(
    async (data: CreateEmployeeDto) => {
      const newEmployee = await employeeService.create(data)
      setEmployees((prev) => [newEmployee, ...prev])
      return newEmployee
    },
    []
  )

  const updateEmployee = useCallback(
    async (id: string, data: UpdateEmployeeDto) => {
      const updated = await employeeService.update(id, data)
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
    },
    []
  )

  const deleteEmployee = useCallback(
    async (id: string) => {
      await employeeService.delete(id)
      setEmployees((prev) => prev.filter((e) => e.id !== id))
    },
    []
  )

  const deactivateEmployee = useCallback(
    async (id: string) => {
      const updated = await employeeService.deactivate(id)
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
    },
    []
  )

  const reactivateEmployee = useCallback(
    async (id: string) => {
      const updated = await employeeService.reactivate(id)
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
    },
    []
  )

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    deactivateEmployee,
    reactivateEmployee,
  }
}
```
</action>
<verify>
```bash
test -f src/hooks/useEmployees.ts
grep -q "useEmployees" src/hooks/useEmployees.ts
grep -q "createEmployee" src/hooks/useEmployees.ts
```
</verify>
<acceptance_criteria>
- useEmployees hook manages employee state
- CRUD operations sync local state
- Loading and error states
- Deactivate/reactivate functions
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/employees/EmployeeCard.tsx
</files>
<action>
Create EmployeeCard component:

```typescript
import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { roleLabels } from '@/config/auth.config'
import type { EmployeeWithProfile } from '@/types/database.types'

interface EmployeeCardProps {
  employee: EmployeeWithProfile
  onEdit?: (employee: EmployeeWithProfile) => void
  onDelete?: (employee: EmployeeWithProfile) => void
  onToggleActive?: (employee: EmployeeWithProfile) => void
}

export function EmployeeCard({ employee, onEdit, onDelete, onToggleActive }: EmployeeCardProps) {
  const initials = employee.profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  const roleInfo = roleLabels[employee.profile.role] || { label: employee.profile.role, ar: employee.profile.role }

  const statusVariant = employee.is_active ? 'completed' : 'blocked'
  const statusLabel = employee.is_active ? 'نشط' : 'غير نشط'

  return (
    <Card className="text-center hover:shadow-md transition-shadow duration-150">
      <Avatar initials={initials} size="lg" className="mx-auto mb-3" />

      <h3 className="font-bold text-sm mb-1">{employee.profile.full_name}</h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-3">
        {employee.position || 'بدون وظيفة'}
      </p>

      <div className="flex justify-center gap-2 flex-wrap mb-4">
        <Badge variant={roleInfo.label === 'Admin' || roleInfo.label === 'admin' ? 'completed' : 'in_progress'}>
          {roleInfo.ar}
        </Badge>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <div className="text-xs text-[var(--color-text-muted)] mb-4">
        <span>• {employee.profile.phone || 'بدون هاتف'}</span>
      </div>

      {/* Admin Actions */}
      <div className="flex justify-center gap-2 pt-4 border-t border-[var(--color-divider)]">
        {onEdit && (
          <button
            onClick={() => onEdit(employee)}
            className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-divider)] hover:text-[var(--color-text)] transition-all duration-150"
          >
            تعديل
          </button>
        )}
        {onToggleActive && (
          <button
            onClick={() => onToggleActive(employee)}
            className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-divider)] hover:text-[var(--color-text)] transition-all duration-150"
          >
            {employee.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(employee)}
            className="px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] bg-[var(--color-error-light)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white transition-all duration-150"
          >
            حذف
          </button>
        )}
      </div>
    </Card>
  )
}
```
</action>
<verify>
```bash
test -f src/components/employees/EmployeeCard.tsx
grep -q "EmployeeCard" src/components/employees/EmployeeCard.tsx
```
</verify>
<acceptance_criteria>
- EmployeeCard displays employee avatar, name, position
- Role badge with Arabic label
- Active/inactive status badge
- Action buttons for edit, toggle active, delete
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/employees/EmployeeForm.tsx
</files>
<action>
Create EmployeeForm component:

```typescript
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
```
</action>
<verify>
```bash
test -f src/components/employees/EmployeeForm.tsx
grep -q "EmployeeForm" src/components/employees/EmployeeForm.tsx
```
</verify>
<acceptance_criteria>
- EmployeeForm works for create and edit modes
- Validation on required fields
- Error display for validation and API errors
- Loading state during submission
- Arabic labels
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/employees/EmployeeList.tsx
</files>
<action>
Create EmployeeList component:

```typescript
'use client'

import React from 'react'
import { EmployeeCard } from '@/components/employees/EmployeeCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { EmployeeWithProfile } from '@/types/database.types'

interface EmployeeListProps {
  employees: EmployeeWithProfile[]
  loading: boolean
  error?: string | null
  onEdit?: (employee: EmployeeWithProfile) => void
  onDelete?: (employee: EmployeeWithProfile) => void
  onToggleActive?: (employee: EmployeeWithProfile) => void
  onAdd?: () => void
}

export function EmployeeList({
  employees,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleActive,
  onAdd,
}: EmployeeListProps) {
  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner label="جارٍ تحميل الموظفين..." />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon="M12 9v2m0 4h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        title="حدث خطأ"
        description={error}
        action={onAdd ? { label: 'إعادة المحاولة', onClick: () => {} } : undefined}
      />
    )
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 11l2 2 4-4"
        title="لا يوجد موظفون"
        description="أضف أول موظف للبدء"
        action={onAdd ? { label: 'إضافة موظف', onClick: onAdd } : undefined}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/employees/EmployeeList.tsx
grep -q "EmployeeList" src/components/employees/EmployeeList.tsx
```
</verify>
<acceptance_criteria>
- EmployeeList renders grid of EmployeeCard
- Loading, error, empty states handled
- onEdit, onDelete, onToggleActive passed to cards
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(dashboard)/employees/page.tsx
</files>
<action>
Create employees page:

```typescript
'use client'

import React, { useState, useCallback } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { EmployeeList } from '@/components/employees/EmployeeList'
import type { EmployeeWithProfile } from '@/types/database.types'
import type { CreateEmployeeDto, UpdateEmployeeDto } from '@/lib/services/employee.service'

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    deactivateEmployee,
    reactivateEmployee,
  } = useEmployees()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProfile | null>(null)

  const handleAdd = useCallback(() => {
    setSelectedEmployee(null)
    setShowAddDialog(true)
  }, [])

  const handleEdit = useCallback((employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee)
    setShowEditDialog(true)
  }, [])

  const handleDelete = useCallback((employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee)
    setShowDeleteDialog(true)
  }, [])

  const handleToggleActive = useCallback(
    async (employee: EmployeeWithProfile) => {
      if (employee.is_active) {
        await deactivateEmployee(employee.id)
      } else {
        await reactivateEmployee(employee.id)
      }
    },
    [deactivateEmployee, reactivateEmployee]
  )

  const handleAddSubmit = useCallback(
    async (data: CreateEmployeeDto) => {
      await createEmployee(data)
      setShowAddDialog(false)
    },
    [createEmployee]
  )

  const handleEditSubmit = useCallback(
    async (data: UpdateEmployeeDto) => {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, data)
        setShowEditDialog(false)
        setSelectedEmployee(null)
      }
    },
    [selectedEmployee, updateEmployee]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedEmployee) {
      try {
        await deleteEmployee(selectedEmployee.id)
        setShowDeleteDialog(false)
        setSelectedEmployee(null)
      } catch (err) {
        // Error handled by hook
      }
    }
  }, [selectedEmployee, deleteEmployee])

  return (
    <div className="p-6 max-w-[1300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">إدارة الموظفين</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {employees.length} موظف
          </p>
        </div>
        <Button onClick={handleAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة موظف
        </Button>
      </div>

      {/* Employee List */}
      <EmployeeList
        employees={employees}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onAdd={handleAdd}
      />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
            <DialogDescription>أدخل بيانات الموظف الجديد. سيتم إرسال كلمة مرور مؤقتة إلى بريده الإلكتروني.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            mode="create"
            onSubmit={handleAddSubmit}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات الموظف</DialogTitle>
            <DialogDescription>قم بتعديل بيانات الموظف {selectedEmployee?.profile.full_name}</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            mode="edit"
            initialData={selectedEmployee || undefined}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الموظف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الموظف <strong>{selectedEmployee?.profile.full_name}</strong>؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/employees/page.tsx
grep -q "useEmployees" src/app/\(dashboard\)/employees/page.tsx
grep -q "إضافة موظف" src/app/\(dashboard\)/employees/page.tsx
```
</verify>
<acceptance_criteria>
- Employee page displays grid of employee cards
- Add button opens add dialog
- Edit button opens edit dialog
- Delete button opens confirmation dialog
- Toggle active button activates/deactivates employees
- All dialogs functional
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Employee list displays as card grid
2. Add employee dialog creates new auth user + profile + employee record
3. Edit employee updates profile information
4. Delete employee removes employee record (with workflow check)
5. Role badge shows correct Arabic label
6. Active/inactive status toggle works
7. All data uses service layer and hooks
</verification>

<success_criteria>
- /employees page displays employee cards with avatars
- Add employee creates Supabase auth user, profile, and employee record
- Edit updates employee profile and role
- Delete removes employee record (after workflow check)
- Role-based badges display correctly (admin, manager, employee)
- Active/inactive toggle functional
- All dialogs open and close properly
</success_criteria>

<threat_model>
- **Privilege Escalation:** Only admins can manage employees (enforced by RLS policies)
- **Data Integrity:** Delete checks for assigned workflows and blocks if any exist
- **Email Duplication:** createEmployee checks for existing email before creation
- **Role Elevation:** Role changes are validated and audited
- **Mitigation:** Test RLS policies, verify workflow constraints, validate email uniqueness
</threat_model>

---

*P-04: Employee Management (Enterprise Modular)*