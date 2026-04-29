'use client'

import React, { useMemo, useState } from 'react'
import { BottleneckList } from '@/components/dashboard/BottleneckList'
import { EmployeeWorkloadList } from '@/components/dashboard/EmployeeWorkloadList'
import { FinancialKpiGrid } from '@/components/dashboard/FinancialKpiGrid'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/auth/useAuth'
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics'
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard'
import { dashboardAlertService } from '@/lib/services/dashboard-alert.service'
import type { DashboardBottleneck, WorkflowStatus, WorkflowType } from '@/types/database.types'

const formatNumber = (value: number) => new Intl.NumberFormat('ar-EG').format(value)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)

function workflowLabel(type: WorkflowType) {
  return type === 'DEVICE_LICENSE' ? 'رخصة جهاز' : 'تصريح حفر'
}

function statusLabel(status: WorkflowStatus) {
  if (status === 'pending') return 'في الانتظار'
  if (status === 'in_progress') return 'جاري'
  if (status === 'blocked') return 'متوقف'
  return 'مكتمل'
}

function relativeDateLabel(value: string) {
  const diffDays = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000)))
  if (diffDays === 0) return 'اليوم'
  if (diffDays === 1) return 'منذ يوم'
  return `منذ ${formatNumber(diffDays)} يوم`
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { summary, loading, error } = useDashboardAnalytics()
  const { summary: financialSummary, loading: financialLoading } = useFinancialDashboard()
  const [alertingStepId, setAlertingStepId] = useState<string | null>(null)
  const [alertedStepId, setAlertedStepId] = useState<string | null>(null)
  const [alertError, setAlertError] = useState<string | null>(null)

  const kpiItems = useMemo(
    () => [
      {
        id: 'active-files',
        title: 'الملفات النشطة',
        value: loading ? '...' : formatNumber(summary?.active_files ?? 0),
        icon: 'file-text',
      },
      {
        id: 'completed-month',
        title: 'تم هذا الشهر',
        value: loading ? '...' : formatNumber(summary?.completed_this_month ?? 0),
        icon: 'check',
      },
      {
        id: 'pending-debt',
        title: 'مديونية معلقة',
        value: loading ? '...' : formatCurrency(summary?.pending_debt ?? 0),
        icon: 'git-branch',
      },
      {
        id: 'bottlenecks',
        title: 'تعطيلات',
        value: loading ? '...' : formatNumber(summary?.bottleneck_count ?? 0),
        icon: 'users',
      },
    ],
    [loading, summary]
  )

  const handleSendAlert = async (bottleneck: DashboardBottleneck) => {
    setAlertingStepId(bottleneck.workflow_step_id)
    setAlertError(null)

    try {
      await dashboardAlertService.sendBottleneckAlert({
        bottleneck,
        created_by: user?.id || null,
      })
      setAlertedStepId(bottleneck.workflow_step_id)
    } catch (err) {
      setAlertError(err instanceof Error ? err.message : 'تعذر إرسال التنبيه')
    } finally {
      setAlertingStepId(null)
    }
  }

  return (
    <div className="max-w-[1300px] p-6">
      <div className="mb-6">
        <h1 className="mb-1 text-lg font-bold">لوحة التحكم</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          مرحبا، {user?.full_name || 'مستخدم'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {alertError && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
          {alertError}
        </div>
      )}

      <div className="mb-6">
        <KpiGrid items={kpiItems} />
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-base font-bold">المؤشرات المالية</h2>
        <FinancialKpiGrid summary={financialSummary} loading={financialLoading} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <BottleneckList
          bottlenecks={summary?.bottlenecks ?? []}
          loading={loading}
          alertingStepId={alertingStepId}
          alertedStepId={alertedStepId}
          onSendAlert={handleSendAlert}
        />
        <EmployeeWorkloadList workloads={summary?.employee_workloads ?? []} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardSubtitle>آخر المسارات المحدثة</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-[var(--color-text-muted)]">جاري تحميل النشاط...</p>
          ) : (summary?.recent_workflows?.length ?? 0) === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">لا يوجد نشاط حديث حاليا.</p>
          ) : (
            <div className="space-y-3">
              {summary?.recent_workflows.map((workflow) => (
                <div
                  key={workflow.workflow_id}
                  className="flex items-center justify-between border-b border-[var(--color-divider)] py-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-offset)] text-xs font-bold">
                      {workflow.client_name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{workflow.client_name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{workflowLabel(workflow.workflow_type)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-text-faint)]">{relativeDateLabel(workflow.updated_at)}</span>
                    <Badge variant={workflow.status}>{statusLabel(workflow.status)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
