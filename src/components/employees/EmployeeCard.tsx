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
    <Card className="text-center transition-shadow duration-150 hover:shadow-md">
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

      <div className="flex flex-wrap justify-center gap-2 border-t border-[var(--color-divider)] pt-4">
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
