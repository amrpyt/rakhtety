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
import { clientService } from '@/lib/services/client.service'
import type { Client } from '@/types/database.types'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
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
    updateStepStatus,
  } = useWorkflows(clientId)

  const activeWorkflow = deviceLicense || excavationPermit
  const {
    summary: financialSummary,
    loading: financialLoading,
    error: financialError,
    recordPayment,
  } = useFinancials(activeWorkflow?.id)

  useEffect(() => {
    clientService
      .findById(clientId)
      .then(setClient)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load client'))
      .finally(() => setLoading(false))
  }, [clientId])

  if (loading || workflowsLoading) {
    return (
      <div className="p-6 max-w-[1300px]">
        <LoadingSpinner label="جارٍ تحميل بيانات العميل..." />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="p-6 max-w-[1300px]">
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
    <div className="p-6 max-w-[1300px]">
      <div className="flex items-center gap-4 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>{client.name}</CardTitle>
              <CardSubtitle>معلومات العميل</CardSubtitle>
            </div>
            <Button variant="secondary">تعديل</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">رخصة الجهاز</span>
                <Badge variant={deviceLicense?.status === 'completed' ? 'completed' : deviceLicense ? 'in_progress' : 'pending'}>
                  {deviceLicense?.status === 'completed' ? 'مكتمل' : deviceLicense ? 'جاري' : 'لم يبدآ'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
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

      <WorkflowTabs
        deviceLicenseWorkflow={deviceLicense}
        excavationPermitWorkflow={excavationPermit}
        deviceLicenseCompleted={deviceLicenseCompleted}
        excavationPermitBlocked={excavationPermitBlocked}
        excavationPermitBlockedReason={excavationPermitBlockedReason}
        onMarkComplete={(stepId) => updateStepStatus(stepId, 'completed')}
        onStart={(stepId) => updateStepStatus(stepId, 'in_progress')}
      />
      {workflowError && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
          {workflowError}
        </p>
      )}

      {activeWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
