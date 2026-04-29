import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card'
import type { EmployeeWorkloadSummary } from '@/types/database.types'

interface EmployeeWorkloadListProps {
  workloads: EmployeeWorkloadSummary[]
  loading?: boolean
}

export function EmployeeWorkloadList({ workloads, loading = false }: EmployeeWorkloadListProps) {
  const visibleWorkloads = [...workloads].sort(
    (a, b) => b.active_workflows + b.active_steps - (a.active_workflows + a.active_steps)
  )

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>ضغط الموظفين</CardTitle>
          <CardSubtitle>المسارات والخطوات المفتوحة لكل موظف</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">جاري تحميل ضغط العمل...</p>
        ) : visibleWorkloads.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">لا يوجد موظفون نشطون حاليا.</p>
        ) : (
          <div className="space-y-3">
            {visibleWorkloads.map((employee) => (
              <div
                key={employee.employee_id}
                className="grid grid-cols-1 gap-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-offset)] p-3 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-semibold text-[var(--color-text)]">{employee.full_name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {employee.active_workflows} مسار نشط · {employee.active_steps} خطوة مفتوحة
                  </p>
                </div>
                <div className="text-sm font-semibold text-[var(--color-error)]">
                  {employee.bottlenecks} تعطيل
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
