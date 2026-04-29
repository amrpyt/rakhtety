import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { DashboardBottleneck } from '@/types/database.types'

interface BottleneckListProps {
  bottlenecks: DashboardBottleneck[]
  loading?: boolean
  alertingStepId?: string | null
  alertedStepId?: string | null
  onSendAlert?: (bottleneck: DashboardBottleneck) => Promise<void>
}

function workflowLabel(type: DashboardBottleneck['workflow_type']) {
  return type === 'DEVICE_LICENSE' ? 'رخصة جهاز' : 'تصريح حفر'
}

export function BottleneckList({
  bottlenecks,
  loading = false,
  alertingStepId,
  alertedStepId,
  onSendAlert,
}: BottleneckListProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>الملفات المتأخرة</CardTitle>
          <CardSubtitle>خطوات متوقفة أكثر من 7 أيام</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">جاري تحميل التعطيلات...</p>
        ) : bottlenecks.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">لا توجد ملفات متأخرة حاليا.</p>
        ) : (
          <div className="space-y-3">
            {bottlenecks.map((bottleneck) => (
              <div
                key={bottleneck.workflow_step_id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-offset)] p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--color-text)]">{bottleneck.client_name}</p>
                      <Badge variant={bottleneck.step_status}>{workflowLabel(bottleneck.workflow_type)}</Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text)]">{bottleneck.step_name}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      المسؤول: {bottleneck.assigned_employee_name || 'غير محدد'} · متوقف منذ {bottleneck.stuck_days} يوم
                    </p>
                  </div>

                  {onSendAlert && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={!bottleneck.assigned_to || alertingStepId === bottleneck.workflow_step_id}
                      loading={alertingStepId === bottleneck.workflow_step_id}
                      onClick={() => onSendAlert(bottleneck)}
                    >
                      {alertedStepId === bottleneck.workflow_step_id ? 'تم التنبيه' : 'إرسال تنبيه'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
