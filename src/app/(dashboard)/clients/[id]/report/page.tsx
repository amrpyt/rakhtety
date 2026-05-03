'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Client, WorkflowFinancialSummary, WorkflowWithSteps } from '@/types/database.types'

const workflowLabels: Record<string, string> = {
  DEVICE_LICENSE: 'رخصة الجهاز',
  EXCAVATION_PERMIT: 'تصريح الحفر',
}

const statusLabels: Record<string, string> = {
  pending: 'في الانتظار',
  in_progress: 'جاري',
  completed: 'مكتمل',
  blocked: 'موقوف',
}

function money(value: number) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)
}

function dateTime(value?: string | null) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function ClientReportPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [workflows, setWorkflows] = useState<WorkflowWithSteps[]>([])
  const [summaries, setSummaries] = useState<Record<string, WorkflowFinancialSummary>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReport() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/clients/${clientId}/report`)
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'تعذر تحميل التقرير')
        }

        setClient(payload.client as Client)
        setWorkflows(payload.workflows as WorkflowWithSteps[])
        setSummaries(payload.summaries as Record<string, WorkflowFinancialSummary>)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'تعذر تحميل التقرير')
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [clientId])

  const totals = useMemo(
    () =>
      Object.values(summaries).reduce(
        (sum, item) => ({
          total_cost: sum.total_cost + item.total_cost,
          total_paid: sum.total_paid + item.total_paid,
          outstanding_debt: sum.outstanding_debt + item.outstanding_debt,
          planned_profit: sum.planned_profit + item.planned_profit,
          realized_profit: sum.realized_profit + item.realized_profit,
        }),
        {
          total_cost: 0,
          total_paid: 0,
          outstanding_debt: 0,
          planned_profit: 0,
          realized_profit: 0,
        }
      ),
    [summaries]
  )

  if (loading) {
    return (
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <LoadingSpinner label="جاري تجهيز التقرير..." />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <EmptyState
          icon="M12 9v2m0 4h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          title="تعذر تحميل التقرير"
          description={error || 'العميل غير موجود'}
          action={{ label: 'العودة', onClick: () => router.push(`/clients/${clientId}`) }}
        />
      </div>
    )
  }

  return (
    <main className="report-page min-h-screen bg-white px-4 py-5 text-[#1f2933] sm:px-6 lg:px-8">
      <div className="report-toolbar mx-auto mb-4 flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => router.push(`/clients/${clientId}`)}>
          العودة
        </Button>
        <Button onClick={() => window.print()}>
          طباعة / حفظ PDF
        </Button>
      </div>

      <article className="mx-auto max-w-5xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <header className="mb-8 border-b border-[var(--color-border)] pb-5">
          <p className="text-sm font-semibold text-[var(--color-primary)]">رخصتي</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">تقرير ملف العميل</h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                تاريخ الإصدار: {dateTime(new Date().toISOString())}
              </p>
            </div>
            <div className="text-right text-sm text-[var(--color-text-muted)] sm:text-left">
              <p>رقم الملف: {client.parcel_number || '-'}</p>
              <p>المدينة: {client.city || '-'}</p>
            </div>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">بيانات العميل</h2>
          <div className="grid grid-cols-1 gap-3 rounded-[var(--radius-md)] bg-[#f8fafc] p-4 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">الاسم:</span> {client.name}</p>
            <p><span className="font-semibold">الهاتف:</span> <span dir="ltr">{client.phone || '-'}</span></p>
            <p><span className="font-semibold">الحي:</span> {client.neighborhood || '-'}</p>
            <p><span className="font-semibold">المنطقة:</span> {client.district || '-'}</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">الملخص المالي</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <ReportMetric label="إجمالي التكلفة" value={money(totals.total_cost)} />
            <ReportMetric label="المدفوع" value={money(totals.total_paid)} />
            <ReportMetric label="المتبقي" value={money(totals.outstanding_debt)} />
            <ReportMetric label="الربح المتوقع" value={money(totals.planned_profit)} />
            <ReportMetric label="الربح المحصل" value={money(totals.realized_profit)} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold">حالة المسارات</h2>
          <div className="space-y-5">
            {workflows.map((workflow) => {
              const summary = summaries[workflow.id]

              return (
                <div key={workflow.id} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{workflowLabels[workflow.type] || workflow.type}</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">الحالة: {statusLabels[workflow.status]}</p>
                    </div>
                    {summary && (
                      <p className="text-sm font-semibold text-[var(--color-primary)]">
                        المتبقي: {money(summary.outstanding_debt)}
                      </p>
                    )}
                  </div>

                  <ol className="space-y-2">
                    {workflow.steps.map((step) => (
                      <li key={step.id} className="grid grid-cols-[auto_1fr] gap-3 rounded-[var(--radius-md)] bg-[#f8fafc] p-3 text-sm sm:grid-cols-[auto_1fr_auto] sm:items-center">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white font-bold">
                          {step.status === 'completed' ? '✓' : step.step_order}
                        </span>
                        <div>
                          <p className="font-semibold">{step.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">اكتمل: {dateTime(step.completed_at)}</p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold">
                          {statusLabels[step.status]}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )
            })}
          </div>
        </section>
      </article>
    </main>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[#f8fafc] p-3">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  )
}
