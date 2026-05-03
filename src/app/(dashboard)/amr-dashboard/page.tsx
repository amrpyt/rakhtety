'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Code2,
  Database,
  FileJson,
  FileText,
  GitBranch,
  RefreshCw,
  Server,
  Settings2,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { AmrDashboardOverview } from '@/lib/amr-dashboard/overview'
import type { WorkflowStatus, WorkflowType } from '@/types/database.types'

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AmrDashboardPage() {
  const [overview, setOverview] = useState<AmrDashboardOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    setRefreshing(true)
    setError(null)

    try {
      const response = await fetch('/api/amr-dashboard/overview', { cache: 'no-store' })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'تعذر تحميل لوحة عمرو')
      }

      setOverview(payload.overview)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل لوحة عمرو')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const task = Promise.resolve().then(loadOverview)
    void task
  }, [loadOverview])

  const kpis = useMemo(() => {
    if (!overview) return []

    return [
      { label: 'عملاء', value: formatNumber(overview.totals.clients), icon: Users },
      { label: 'مسارات', value: formatNumber(overview.totals.workflows), icon: GitBranch },
      { label: 'شغال الآن', value: formatNumber(overview.totals.activeWorkflows), icon: FileText },
      { label: 'متأخر', value: formatNumber(overview.totals.stuckWorkflows), icon: AlertTriangle },
      { label: 'مديونية', value: formatCurrency(overview.totals.outstandingDebt), icon: Banknote },
      { label: 'موظفين نشطين', value: formatNumber(overview.totals.activeEmployees), icon: Users },
    ]
  }, [overview])

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-text)]">لوحة عمرو الهندسية</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            مكان واحد يشوف العملاء والمسارات والفلوس والموظفين ومصدر البيانات الحقيقي.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={loadOverview} disabled={refreshing}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {refreshing ? 'بيحدث...' : 'تحديث'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-text-muted)]">
          جاري تحميل كل حاجة من Frappe...
        </div>
      ) : overview ? (
        <>
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-black text-[var(--color-text-muted)]">
                <Database className="h-4 w-4" aria-hidden="true" />
                مصدر البيانات
              </div>
              <p className="mt-2 text-lg font-black">Frappe فقط</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {overview.source.baseUrlConfigured ? 'FRAPPE_BASE_URL موجود' : 'FRAPPE_BASE_URL غير موجود'}
              </p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <p className="text-xs font-black text-[var(--color-text-muted)]">المستخدم الحالي</p>
              <p className="mt-2 truncate text-lg font-black">{overview.user.full_name}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{overview.user.email}</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <p className="text-xs font-black text-[var(--color-text-muted)]">قراءة السيرفر</p>
              <p className="mt-2 text-lg font-black">Privileged Frappe</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">يعني الصفحة بتسأل السيرفر، والسيرفر يسأل Frappe.</p>
            </div>
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <p className="text-xs font-black text-[var(--color-text-muted)]">آخر تحديث</p>
              <p className="mt-2 text-lg font-black">{formatDateTime(overview.generatedAt)}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">بيانات حية من صفحات التطبيق.</p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {kpis.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black text-[var(--color-text-muted)]">{item.label}</p>
                    <Icon className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  </div>
                  <p className="mt-3 truncate text-2xl font-black text-[var(--color-text)]">{item.value}</p>
                </div>
              )
            })}
          </div>

          <div className="mb-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <h2 className="text-base font-black">تفاصيل السوفت وير</h2>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">الحاجات اللي بتقول التطبيق مبني بإيه وشغال إزاي.</p>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {[
                  ['App', overview.software.appName],
                  ['Version', overview.software.version],
                  ['Package manager', overview.software.packageManager],
                  ['Next.js', overview.software.nextVersion],
                  ['React', overview.software.reactVersion],
                  ['NODE_ENV', overview.software.nodeEnv],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3">
                    <p className="text-xs font-black text-[var(--color-text-muted)]">{label}</p>
                    <p className="mt-1 break-words font-mono text-sm font-bold text-[var(--color-text)]">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <h2 className="text-base font-black">صحة الباك إند</h2>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">فحوصات بسيطة: هل الداتا وصلت؟ هل الإعدادات موجودة؟</p>
              </div>
              <div className="grid gap-3 p-4 md:grid-cols-2">
                {overview.software.healthChecks.map((check) => (
                  <div key={check.label} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black">{check.label}</p>
                      <Badge variant={check.status === 'pass' ? 'success' : 'warning'}>
                        {check.status === 'pass' ? 'PASS' : 'WARN'}
                      </Badge>
                    </div>
                    <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">{check.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mb-5 grid gap-5 xl:grid-cols-2">
            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <h2 className="text-base font-black">Frappe API methods</h2>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">دي أسماء الدوال اللي Next.js بيناديها في Frappe.</p>
              </div>
              <div className="divide-y divide-[var(--color-divider)]">
                {overview.software.apiMethods.map((method) => (
                  <div key={method.name} className="p-4">
                    <p className="break-words font-mono text-sm font-black text-[var(--color-text)]">{method.name}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{method.purpose}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                  <h2 className="text-base font-black">Environment</h2>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">مش بنعرض الأسرار نفسها، بس بنقول موجودة ولا لأ.</p>
              </div>
              <div className="divide-y divide-[var(--color-divider)]">
                {overview.software.env.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="break-words font-mono text-sm font-black">{item.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{item.purpose}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs font-black">
                      <CheckCircle2
                        className={`h-4 w-4 ${item.configured ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}
                        aria-hidden="true"
                      />
                      {item.configured ? 'موجود' : 'ناقص'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mb-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <h2 className="text-base font-black">المسارات الحقيقية</h2>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">أول 12 مسار من Frappe.</p>
              </div>
              <div className="divide-y divide-[var(--color-divider)]">
                {overview.workflows.slice(0, 12).map((workflow) => (
                  <div key={workflow.workflow_id} className="grid gap-3 p-4 lg:grid-cols-[1.2fr_0.9fr_1.2fr_0.8fr_auto] lg:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{workflow.client_name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {workflow.parcel_number || workflow.client_phone || workflow.city || 'بدون بيانات إضافية'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={workflow.workflow_status}>{statusLabel(workflow.workflow_status)}</Badge>
                      <span className="text-xs font-bold">{workflowLabel(workflow.workflow_type)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{workflow.current_step_name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {workflow.assigned_employee_name || 'غير محدد'} · {formatNumber(workflow.days_stuck)} يوم
                      </p>
                    </div>
                    <p className="text-sm font-black">{formatCurrency(workflow.outstanding_debt)}</p>
                    <Link
                      href={`/clients/${workflow.client_id}`}
                      className="text-sm font-black text-[var(--color-primary)] hover:underline"
                    >
                      فتح الملف
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <h2 className="text-base font-black">صفحات التطبيق</h2>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">روابط حقيقية، مفيش spikes.</p>
              </div>
              <div className="divide-y divide-[var(--color-divider)]">
                {overview.realRoutes.map((route) => (
                  <Link key={route.href} href={route.href} className="block p-4 hover:bg-[var(--color-surface-offset)]">
                    <p className="text-sm font-black">{route.label}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{route.purpose}</p>
                    <p className="mt-2 text-xs font-bold text-[var(--color-primary)]">{route.href}</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <h2 className="text-base font-black">العملاء</h2>
              </div>
              <div className="divide-y divide-[var(--color-divider)]">
                {overview.clients.slice(0, 8).map((client) => (
                  <Link key={client.id} href={`/clients/${client.id}`} className="block p-4 hover:bg-[var(--color-surface-offset)]">
                    <p className="truncate text-sm font-black">{client.name}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {client.phone || 'بدون تليفون'} · {client.city || 'بدون مدينة'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <h2 className="text-base font-black">الموظفين</h2>
              </div>
              <div className="divide-y divide-[var(--color-divider)]">
                {overview.employees.slice(0, 8).map((employee) => (
                  <div key={employee.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-black">{employee.profile.full_name}</p>
                      <Badge variant={employee.is_active ? 'completed' : 'pending'}>
                        {employee.is_active ? 'نشط' : 'متوقف'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {employee.profile.role} · {employee.position || 'بدون وظيفة'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white shadow-sm">
              <div className="border-b border-[var(--color-divider)] p-4">
                <h2 className="text-base font-black">ملاحظات مهندس</h2>
              </div>
              <div className="space-y-3 p-4 text-sm text-[var(--color-text-muted)]">
                <p>البيانات هنا جاية من Frappe، مش Supabase.</p>
                <p>الصفحة بتعرض صفحات التطبيق الحقيقية فقط.</p>
                <p>لو صفحة الموظفين مقفولة لموظف عادي، ده طبيعي لأنها صلاحيات إدارة.</p>
                <p>الرقم المهم بسرعة: {formatNumber(overview.summary.bottleneck_count)} تعطيل و {formatCurrency(overview.summary.pending_debt)} مديونية معلقة.</p>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  )
}
