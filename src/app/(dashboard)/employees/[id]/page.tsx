'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { roleLabels } from '@/config/auth.config'
import { employeeService } from '@/lib/services/employee.service'
import type { EmployeeWithProfile } from '@/types/database.types'

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [employee, setEmployee] = useState<EmployeeWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ active: 0, completed: 0, blocked: 0 })

  useEffect(() => {
    employeeService
      .findById(employeeId)
      .then(async (emp) => {
        setEmployee(emp)
        const workflowStats = await employeeService.getWorkflowStats(emp.user_id)
        setStats(workflowStats)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load employee'))
      .finally(() => setLoading(false))
  }, [employeeId])

  if (loading) {
    return (
      <div className="p-6 max-w-[1300px]">
        <LoadingSpinner label="جارٍ تحميل بيانات الموظف..." />
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="p-6 max-w-[1300px]">
        <EmptyState
          icon="M12 9v2m0 4h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          title="حدث خطأ"
          description={error || 'الموظف غير موجود'}
          action={{
            label: 'العودة للقائمة',
            onClick: () => router.push('/employees'),
          }}
        />
      </div>
    )
  }

  const initials = employee.profile.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  const roleInfo = roleLabels[employee.profile.role] || { label: employee.profile.role, ar: employee.profile.role }

  return (
    <div className="p-6 max-w-[1300px]">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push('/employees')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
          العودة
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar initials={initials} size="xl" />
              <div>
                <CardTitle>{employee.profile.full_name}</CardTitle>
                <CardSubtitle>{employee.position || 'بدون وظيفة'}</CardSubtitle>
              </div>
            </div>
            <Button variant="secondary">تعديل</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">البريد الإلكتروني</p>
                <p dir="ltr">{employee.profile.email || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">الهاتف</p>
                <p dir="ltr">{employee.profile.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">الدور</p>
                <Badge variant={roleInfo.label === 'Admin' ? 'completed' : 'in_progress'}>
                  {roleInfo.ar}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">الحالة</p>
                <Badge variant={employee.is_active ? 'completed' : 'blocked'}>
                  {employee.is_active ? 'نشط' : 'غير نشط'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات المسارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">نشط</span>
                <Badge variant="in_progress">{stats.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">مكتمل</span>
                <Badge variant="completed">{stats.completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">موقوف</span>
                <Badge variant="blocked">{stats.blocked}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}