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