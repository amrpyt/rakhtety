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

function CurrentTaskPanel({
  deviceLicense,
  deviceLicenseCompleted,
  onCreateWorkflow,
}: {
  deviceLicense?: ReturnType<typeof useWorkflows>['deviceLicense']
  deviceLicenseCompleted: boolean
  onCreateWorkflow: (type: 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT') => Promise<void>
}) {
  const currentStep = deviceLicense?.steps?.find((step) => step.status === 'in_progress' || step.status === 'pending')

  let title = 'افتح مسار رخصة الجهاز'
  let description = 'هذا العميل له ملف، لكن خطوات رخصة الجهاز لم تبدأ بعد.'
  let actionLabel = 'فتح مسار رخصة الجهاز'
  let action: (() => void) | undefined = () => void onCreateWorkflow('DEVICE_LICENSE')

  if (deviceLicenseCompleted) {
    title = 'رخصة الجهاز مكتملة'
    description = 'المسار الأول انتهى. يمكن متابعة تصريح الحفر من تبويب تصريح الحفر.'
    actionLabel = ''
    action = undefined
  } else if (currentStep) {
    title = currentStep.status === 'in_progress' ? `أكمل: ${currentStep.name}` : `ابدأ: ${currentStep.name}`
    description = currentStep.status === 'in_progress'
      ? 'راجع مستندات هذه الخطوة، ارفع المطلوب فقط، ثم اضغط إكمال.'
      : 'اضغط بدء التنفيذ داخل كارت الخطوة. بعدها سيظهر رفع المستندات الخاص بها.'
    actionLabel = ''
    action = undefined
  }

  return (
    <div className="mb-6 rounded-[var(--radius-2xl)] border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/70 p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">المطلوب الآن</p>
          <h2 className="mt-1 text-xl font-black text-[var(--color-text)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
        </div>
        {action && (
          <Button type="button" onClick={action}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

function ClientWorkGuide() {
  const [open, setOpen] = useState(false)
  const steps = [
    'مستندات إضافة العميل محفوظة بالفعل في ملف العميل. لا ترفعها مرة ثانية إلا لو الملف ناقص أو غير واضح.',
    'ابدأ من مسار رخصة الجهاز. هذا هو المسار الأساسي لهذا العميل.',
    'اضغط "بدء التنفيذ" على أول خطوة عندما يبدأ الموظف شغلها فعلاً.',
    'ارفع داخل الخطوة فقط المستند الجديد الخاص بهذه الخطوة، مثل إيصال تقديم أو موافقة أو رخصة مستلمة.',
    'بعد انتهاء الشغل والمستندات، اضغط "إكمال" لنقل الخطوة للحالة المكتملة.',
    'لا تبدأ تصريح الحفر إلا بعد اكتمال رخصة الجهاز بالكامل. النظام سيقفل الحفر تلقائياً قبل ذلك.',
  ]

  return (
    <Card className="paper-card mb-6">
      <CardHeader
        action={
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? 'إخفاء التعليمات' : 'عرض التعليمات'}
          </Button>
        }
      >
        <div>
          <CardTitle>دليل التشغيل السريع</CardTitle>
          <CardSubtitle>مختصر: الملف الأساسي محفوظ، والشغل الحقيقي يتم خطوة بخطوة.</CardSubtitle>
        </div>
      </CardHeader>
      {open && <CardContent>
        <div className="grid gap-4 lg:grid-cols-[1.55fr_0.95fr]">
          <ol className="grid gap-2 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/70 p-3 text-sm shadow-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-gold)]/30 bg-[var(--color-gold-light)] p-4 text-sm">
            <p className="font-bold text-[var(--color-warning)]">قاعدة المكتب</p>
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
      </CardContent>}
    </Card>
  )
}

function ClientIntakeDocumentsCard({ documents }: { documents: ClientIntakeDocument[] }) {
  const params = useParams()
  const clientId = params.id as string
  const [open, setOpen] = useState(false)
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<{
    url: string
    fileName: string
    mimeType: string | null
  } | null>(null)

  const getSignedUrl = async (documentId: string, download = false) => {
    const response = await fetch(
      `/api/clients/${clientId}/intake-documents/${documentId}/signed-url${download ? '?download=1' : ''}`
    )
    const payload = await response.json()

    if (!response.ok) {
      throw new Error(payload.error || 'تعذر فتح المستند')
    }

    return payload.signedUrl as string
  }

  const handlePreviewDocument = async (document: ClientIntakeDocument) => {
    setOpeningDocumentId(document.id)
    setDocumentError(null)

    try {
      const signedUrl = await getSignedUrl(document.id)
      setPreviewDocument({
        url: signedUrl,
        fileName: document.file_name,
        mimeType: document.mime_type,
      })
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'تعذر فتح المستند')
    } finally {
      setOpeningDocumentId(null)
    }
  }

  const handleDownloadDocument = async (document: ClientIntakeDocument) => {
    setOpeningDocumentId(document.id)
    setDocumentError(null)

    try {
      const signedUrl = await getSignedUrl(document.id, true)
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setDocumentError(err instanceof Error ? err.message : 'تعذر تحميل المستند')
    } finally {
      setOpeningDocumentId(null)
    }
  }

  const isImagePreview = (document: { fileName: string; mimeType: string | null }) =>
    document.mimeType?.startsWith('image/') || /\.(png|jpe?g)$/i.test(document.fileName)

  const isPdfPreview = (document: { fileName: string; mimeType: string | null }) =>
    document.mimeType === 'application/pdf' || /\.pdf$/i.test(document.fileName)

  return (
    <Card className="paper-card mb-6">
      <CardHeader
        action={
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? 'إخفاء المستندات' : 'عرض المستندات'}
          </Button>
        }
      >
        <div>
          <CardTitle>معرض مستندات العميل الأساسية</CardTitle>
          <CardSubtitle>
            {documents.length} مستند محفوظ. افتح المعرض عند الحاجة فقط.
          </CardSubtitle>
        </div>
      </CardHeader>
      {open && <CardContent>
        {documentError && (
          <div className="mb-3 rounded-[var(--radius-md)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
            {documentError}
          </div>
        )}
        {documents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <div
                key={document.id}
                className="group flex min-h-36 flex-col justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 p-4 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-gold)]/60 hover:shadow-[var(--shadow-card)]"
              >
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-gold-light)] text-[var(--color-gold)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold">{document.label}</p>
                    <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">{document.file_name}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    loading={openingDocumentId === document.id}
                    onClick={() => handlePreviewDocument(document)}
                  >
                    معاينة
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    loading={openingDocumentId === document.id}
                    onClick={() => handleDownloadDocument(document)}
                  >
                    تحميل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text-muted)]">
            لا توجد مستندات أساسية محفوظة لهذا العميل حتى الآن. لو العميل سلّم الورق، ارفعه من شاشة إضافة العميل أو من تحديث الملف لاحقاً.
          </div>
        )}
      </CardContent>}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] p-3">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-text)]">معاينة المستند الأساسي</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{previewDocument.fileName}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewDocument(null)}>
                إغلاق
              </Button>
            </div>
            <div className="min-h-[60vh] overflow-auto p-3">
              {isImagePreview(previewDocument) ? (
                <img
                  src={previewDocument.url}
                  alt={previewDocument.fileName}
                  className="mx-auto max-h-[70vh] max-w-full rounded-[var(--radius-md)] object-contain"
                />
              ) : isPdfPreview(previewDocument) ? (
                <iframe
                  src={previewDocument.url}
                  title={previewDocument.fileName}
                  className="h-[70vh] w-full rounded-[var(--radius-md)] border border-[var(--color-border)]"
                />
              ) : (
                <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--color-text-muted)]">
                  لا يمكن معاينة هذا النوع من الملفات داخل الصفحة. استخدم زر تحميل لفتحه.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientDetail | null>(null)
  const [showFinance, setShowFinance] = useState(false)
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
    <div className="mx-auto w-full max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => router.push('/clients')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
          العودة
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => router.push(`/clients/${clientId}/report`)}>
            تقرير PDF
          </Button>
          <Button variant="primary">تعديل بيانات العميل</Button>
        </div>
      </div>

      <div className="client-hero mb-6 rounded-[var(--radius-2xl)] p-5 sm:p-6 lg:p-7">
        <div className="relative grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[var(--color-primary)] shadow-sm">
              ملف عميل نشط
            </div>
            <h1 className="text-3xl font-black leading-tight text-[var(--color-text)] sm:text-4xl">{client.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
              صفحة متابعة واحدة للبيانات، المستندات، المسارات، والمدفوعات. ابدأ من الملف الأساسي ثم نفّذ خطوات رخصة الجهاز.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['الهاتف', client.phone || '-', 'ltr'],
                ['المدينة', client.city || '-', 'rtl'],
                ['الحي / المنطقة', client.neighborhood || '-', 'rtl'],
                ['رقم الملف', client.parcel_number || '-', 'rtl'],
              ].map(([label, value, dir]) => (
                <div key={label} className="rounded-[var(--radius-xl)] border border-white/70 bg-white/66 p-3 shadow-sm">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-faint)]">{label}</p>
                  <p className="font-bold" dir={dir}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-white/70 bg-white/72 p-4 shadow-[var(--shadow-card)]">
            <p className="mb-3 text-sm font-black">حالة الملف الآن</p>
            <div className="space-y-3">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">رخصة الجهاز</span>
                  <Badge variant={deviceLicense?.status === 'completed' ? 'completed' : deviceLicense ? 'in_progress' : 'pending'}>
                    {deviceLicense?.status === 'completed' ? 'مكتمل' : deviceLicense ? 'جاري' : 'لم يبدأ'}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">المسار الأساسي. لا يبدأ تصريح الحفر قبله.</p>
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">تصريح الحفر</span>
                  <Badge
                    variant={excavationPermit?.status === 'completed' ? 'completed' : excavationPermit ? 'in_progress' : 'blocked'}
                    aria-disabled={!deviceLicenseCompleted}
                    className={!deviceLicenseCompleted ? 'opacity-75' : ''}
                  >
                    {!deviceLicenseCompleted ? 'مقفل' : excavationPermit?.status === 'completed' ? 'مكتمل' : excavationPermit ? 'جاري' : 'لم يبدأ'}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {!deviceLicenseCompleted ? 'مقفول تلقائياً حتى اكتمال رخصة الجهاز.' : 'جاهز للبدء بعد اكتمال المسار الأول.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CurrentTaskPanel
        deviceLicense={deviceLicense}
        deviceLicenseCompleted={deviceLicenseCompleted}
        onCreateWorkflow={createWorkflow}
      />

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
        <div className="mt-6">
          <div className="paper-card rounded-[var(--radius-2xl)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-black">المالية</h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  للمدير أو الموظف المسؤول عن التحصيل. مخفية حتى لا تزحم خطوات التنفيذ.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => setShowFinance((value) => !value)}>
                {showFinance ? 'إخفاء المالية' : 'عرض المالية'}
              </Button>
            </div>
          </div>

          {showFinance && (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
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
      )}
    </div>
  )
}
