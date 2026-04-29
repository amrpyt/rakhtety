'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WorkflowTabs } from '@/components/workflow/WorkflowTabs'
import { FinancialSummaryCard } from '@/components/financial/FinancialSummaryCard'
import { PaymentForm } from '@/components/financial/PaymentForm'
import { useFinancials } from '@/hooks/useFinancials'
import { useWorkflows } from '@/hooks/useWorkflows'
import type { Client, ClientIntakeDocument } from '@/types/database.types'

type ClientDetail = Client & {
  intake_documents?: ClientIntakeDocument[]
}

function ClientWorkGuide() {
  const steps = [
    'مستندات إضافة العميل محفوظة بالفعل في ملف العميل. لا ترفعها مرة ثانية إلا لو الملف ناقص أو غير واضح.',
    'ابدأ من مسار رخصة الجهاز. هذا هو المسار الأساسي لهذا العميل.',
    'اضغط "بدء التنفيذ" على أول خطوة عندما يبدأ الموظف شغلها فعلاً.',
    'ارفع داخل الخطوة فقط المستند الجديد الخاص بهذه الخطوة، مثل إيصال تقديم أو موافقة أو رخصة مستلمة.',
    'بعد انتهاء الشغل والمستندات، اضغط "إكمال" لنقل الخطوة للحالة المكتملة.',
    'لا تبدأ تصريح الحفر إلا بعد اكتمال رخصة الجهاز بالكامل. النظام سيقفل الحفر تلقائياً قبل ذلك.',
  ]

  return (
    <Card className="mb-6 border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30">
      <CardHeader>
        <div>
          <CardTitle>ماذا يحدث بعد إضافة العميل؟</CardTitle>
          <CardSubtitle>اتبع هذه الخطوات بالترتيب حتى لا يختلط شغل رخصة الجهاز مع تصريح الحفر.</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm">
            <p className="font-bold">قاعدة مهمة</p>
            <p className="mt-2 text-[var(--color-text-muted)]">
              هذا البرنامج معمول كدفتر متابعة للموظفين. مستندات إضافة العميل هي ملف البداية. مستندات الخطوات
              هي أوراق جديدة تظهر أثناء الشغل. الموظف لا يكرر الرفع؛ هو يرفع فقط الورق الناقص أو الناتج من الخطوة.
            </p>
            <div className="mt-4 grid gap-2 text-xs">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-offset)] p-2">
                <strong>بدء التنفيذ:</strong> يعني أن الموظف بدأ يشتغل على الخطوة.
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-offset)] p-2">
                <strong>إكمال:</strong> يعني أن الخطوة خلصت ومستنداتها سليمة.
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-offset)] p-2">
                <strong>تجاوز طارئ:</strong> يستخدم فقط لو المدير قرر إكمال خطوة رغم وجود نقص، ويجب كتابة السبب.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ClientIntakeDocumentsCard({ documents }: { documents: ClientIntakeDocument[] }) {
  return (
    <Card className="mb-6 border-[var(--color-success)]/20 bg-[var(--color-success-light)]/30">
      <CardHeader>
        <div>
          <CardTitle>مستندات العميل الأساسية</CardTitle>
          <CardSubtitle>
            هذه هي الملفات التي تم رفعها وقت إضافة العميل. اعتبرها ملف البداية، ولا ترفعها مرة أخرى داخل الخطوات.
          </CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm"
              >
                <p className="font-semibold">{document.label}</p>
                <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">{document.file_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-muted)]">
            لا توجد مستندات أساسية محفوظة لهذا العميل حتى الآن. لو العميل سلّم الورق، ارفعه من شاشة إضافة العميل أو من تحديث الملف لاحقاً.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    deviceLicense,
    excavationPermit,
    deviceLicenseCompleted,
    excavationPermitBlocked,
    excavationPermitBlockedReason,
    loading: workflowsLoading,
    error: workflowError,
    createWorkflow,
    updateStepStatus,
    emergencyCompleteStep,
    moveStepBack,
  } = useWorkflows(clientId)

  const activeWorkflow = deviceLicense || excavationPermit
  const {
    summary: financialSummary,
    loading: financialLoading,
    error: financialError,
    recordPayment,
  } = useFinancials(activeWorkflow?.id)

  useEffect(() => {
    async function loadClient() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/clients/${clientId}`)
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load client')
        }

        setClient(payload.client as ClientDetail)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client')
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [clientId])

  if (loading || workflowsLoading) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
        <LoadingSpinner label="جارٍ تحميل بيانات العميل..." />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
        <EmptyState
          icon="M12 9v2m0 4h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          title="حدث خطأ"
          description={error || 'العميل غير موجود'}
          action={{
            label: 'العودة للقائمة',
            onClick: () => router.push('/clients'),
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button variant="ghost" onClick={() => router.push('/clients')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
          العودة
        </Button>
        <Button variant="secondary" onClick={() => router.push(`/clients/${clientId}/report`)}>
          تقرير PDF
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{client.name}</CardTitle>
              <CardSubtitle>معلومات العميل</CardSubtitle>
            </div>
            <Button variant="secondary">تعديل</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">الهاتف</p>
                <p dir="ltr">{client.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">المدينة</p>
                <p>{client.city || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">الحي</p>
                <p>{client.neighborhood || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">رقم الملف</p>
                <p>{client.parcel_number || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص المسارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">رخصة الجهاز</span>
                <Badge variant={deviceLicense?.status === 'completed' ? 'completed' : deviceLicense ? 'in_progress' : 'pending'}>
                  {deviceLicense?.status === 'completed' ? 'مكتمل' : deviceLicense ? 'جاري' : 'لم يبدآ'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">تصريح الحفر</span>
                <Badge
                  variant={excavationPermit?.status === 'completed' ? 'completed' : excavationPermit ? 'in_progress' : 'pending'}
                  aria-disabled={!deviceLicenseCompleted}
                  className={!deviceLicenseCompleted ? 'opacity-60' : ''}
                >
                  {!deviceLicenseCompleted ? 'مقفل' : excavationPermit?.status === 'completed' ? 'مكتمل' : excavationPermit ? 'جاري' : 'لم يبدآ'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClientWorkGuide />

      <ClientIntakeDocumentsCard documents={client.intake_documents || []} />

      <WorkflowTabs
        deviceLicenseWorkflow={deviceLicense}
        excavationPermitWorkflow={excavationPermit}
        deviceLicenseCompleted={deviceLicenseCompleted}
        excavationPermitBlocked={excavationPermitBlocked}
        excavationPermitBlockedReason={excavationPermitBlockedReason}
        onMarkComplete={(stepId) => updateStepStatus(stepId, 'completed')}
        onStart={(stepId) => updateStepStatus(stepId, 'in_progress')}
        onEmergencyComplete={emergencyCompleteStep}
        onMoveBack={moveStepBack}
        onCreateWorkflow={createWorkflow}
      />
      {workflowError && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
          {workflowError}
        </p>
      )}

      {activeWorkflow && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          <FinancialSummaryCard summary={financialSummary} loading={financialLoading} />
          <div>
            <PaymentForm
              steps={activeWorkflow.steps}
              loading={financialLoading}
              onSubmit={recordPayment}
            />
            {financialError && (
              <p className="text-sm text-[var(--color-error)] mt-2">{financialError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
