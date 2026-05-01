'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { WorkflowOverviewItem, WorkflowStatus, WorkflowType } from '@/types/database.types'

type QueueFilter = 'all' | 'active' | 'stuck' | 'completed' | 'device' | 'excavation'

const filters: Array<{ id: QueueFilter; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'نشط' },
  { id: 'stuck', label: 'متعطل' },
  { id: 'completed', label: 'مكتمل' },
  { id: 'device', label: 'رخصة الجهاز' },
  { id: 'excavation', label: 'تصريح الحفر' },
]

const formatNumber = (value: number) => new Intl.NumberFormat('ar-EG').format(value)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)

function workflowLabel(type: WorkflowType) {
  return type === 'DEVICE_LICENSE' ? 'رخصة الجهاز' : 'تصريح الحفر'
}

function statusLabel(status: WorkflowStatus) {
  if (status === 'pending') return 'في الانتظار'
  if (status === 'in_progress') return 'جاري'
  if (status === 'blocked') return 'متوقف'
  return 'مكتمل'
}

function relativeDateLabel(value: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000)))
  if (days === 0) return 'اليوم'
  if (days === 1) return 'منذ يوم'
  return `منذ ${formatNumber(days)} يوم`
}

function filterWorkflow(workflow: WorkflowOverviewItem, filter: QueueFilter) {
  if (filter === 'active') return workflow.workflow_status === 'pending' || workflow.workflow_status === 'in_progress'
  if (filter === 'stuck') return workflow.is_stuck
  if (filter === 'completed') return workflow.workflow_status === 'completed'
  if (filter === 'device') return workflow.workflow_type === 'DEVICE_LICENSE'
  if (filter === 'excavation') return workflow.workflow_type === 'EXCAVATION_PERMIT'
  return true
}

export default function WorkflowsPage() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<WorkflowOverviewItem[]>([])
  const [filter, setFilter] = useState<QueueFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadWorkflows() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/workflows/overview')
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'تعذر تحميل مسارات العمل')
        }

        if (active) {
          setWorkflows(payload.workflows || [])
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'تعذر تحميل مسارات العمل')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadWorkflows()

    return () => {
      active = false
    }
  }, [])

  const filteredWorkflows = useMemo(
    () => workflows.filter((workflow) => filterWorkflow(workflow, filter)),
    [filter, workflows]
  )

  const activeCount = workflows.filter((workflow) => workflow.workflow_status !== 'completed').length
  const stuckCount = workflows.filter((workflow) => workflow.is_stuck).length
  const debtTotal = workflows.reduce((sum, workflow) => sum + workflow.outstanding_debt, 0)

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">مسارات العمل</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          طابور المكتب اليومي: كل ملف، مساره الحالي، الموظف المسؤول، والمديونية.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-bold text-[var(--color-text-muted)]">مسارات نشطة</p>
          <p className="mt-2 text-2xl font-black text-[var(--color-text)]">{loading ? '...' : formatNumber(activeCount)}</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-bold text-[var(--color-text-muted)]">تعطيلات</p>
          <p className="mt-2 text-2xl font-black text-[var(--color-text)]">{loading ? '...' : formatNumber(stuckCount)}</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-bold text-[var(--color-text-muted)]">مديونية المسارات</p>
          <p className="mt-2 text-2xl font-black text-[var(--color-text)]">{loading ? '...' : formatCurrency(debtTotal)}</p>
        </div>
      </div>

      <Card className="paper-card">
        <CardHeader>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>لوحة مسارات المكتب</CardTitle>
              <CardSubtitle>اضغط على أي ملف لفتح صفحة العميل وتنفيذ الخطوات هناك.</CardSubtitle>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-[var(--radius-md)] border px-3 py-1.5 text-xs font-bold transition-colors ${
                    filter === item.id
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                      : 'border-[var(--color-border)] bg-white text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">جاري تحميل مسارات المكتب...</p>
          ) : workflows.length === 0 ? (
            <EmptyState
              icon="M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9"
              title="لا توجد مسارات نشطة بعد"
              description="افتح ملف عميل وابدأ رخصة الجهاز أو تصريح الحفر، وبعدها سيظهر هنا طابور المكتب."
            />
          ) : filteredWorkflows.length === 0 ? (
            <EmptyState
              icon="M4 6h16M4 12h16M4 18h7"
              title="لا توجد نتائج لهذا الفلتر"
              description="جرّب فلترًا آخر أو افتح كل المسارات."
            />
          ) : (
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)]">
              <div className="hidden grid-cols-[1.35fr_0.95fr_1.25fr_0.9fr_0.75fr_0.8fr_0.75fr] gap-3 bg-[var(--color-surface-offset)] px-4 py-3 text-xs font-black text-[var(--color-text-muted)] lg:grid">
                <span>العميل</span>
                <span>المسار</span>
                <span>الخطوة الحالية</span>
                <span>الموظف</span>
                <span>آخر تحديث</span>
                <span>المديونية</span>
                <span>فتح</span>
              </div>
              <div className="divide-y divide-[var(--color-divider)]">
                {filteredWorkflows.map((workflow) => (
                  <div
                    key={workflow.workflow_id}
                    className="grid gap-3 bg-white/82 px-4 py-4 lg:grid-cols-[1.35fr_0.95fr_1.25fr_0.9fr_0.75fr_0.8fr_0.75fr] lg:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[var(--color-text)]">{workflow.client_name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {workflow.parcel_number || workflow.client_phone || workflow.city || 'لا توجد بيانات إضافية'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={workflow.workflow_status}>{statusLabel(workflow.workflow_status)}</Badge>
                      <span className="text-xs font-bold text-[var(--color-text)]">{workflowLabel(workflow.workflow_type)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{workflow.current_step_name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {workflow.is_stuck
                          ? `متعطل منذ ${formatNumber(workflow.days_stuck)} يوم`
                          : workflow.days_stuck > 0
                          ? `مفتوح منذ ${formatNumber(workflow.days_stuck)} يوم`
                          : 'محدث اليوم'}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">{workflow.assigned_employee_name || 'غير محدد'}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{relativeDateLabel(workflow.updated_at)}</p>
                    <p className="text-sm font-black text-[var(--color-text)]">{formatCurrency(workflow.outstanding_debt)}</p>
                    <Button type="button" size="sm" variant="secondary" onClick={() => router.push(`/clients/${workflow.client_id}`)}>
                      فتح الملف
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
