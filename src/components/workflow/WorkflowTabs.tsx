'use client'

import React from 'react'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import { getWorkflowStepTemplates } from '@/lib/domain/workflow-templates'
import type { WorkflowWithSteps } from '@/types/database.types'

interface WorkflowTabsProps {
  deviceLicenseWorkflow?: WorkflowWithSteps | null
  excavationPermitWorkflow?: WorkflowWithSteps | null
  deviceLicenseCompleted: boolean
  excavationPermitBlocked?: boolean
  excavationPermitBlockedReason?: string
  onMarkComplete?: (stepId: string) => Promise<void>
  onStart?: (stepId: string) => Promise<void>
  onEmergencyComplete?: (stepId: string, reason: string) => Promise<void>
  onMoveBack?: (stepId: string, reason: string) => Promise<void>
  onCreateWorkflow?: (type: WorkflowWithSteps['type']) => Promise<void>
}

const DEVICE_LICENSE_STEPS = getWorkflowStepTemplates('DEVICE_LICENSE')
const EXCAVATION_PERMIT_STEPS = getWorkflowStepTemplates('EXCAVATION_PERMIT')

export function WorkflowTabs({
  deviceLicenseWorkflow,
  excavationPermitWorkflow,
  deviceLicenseCompleted,
  excavationPermitBlocked = !deviceLicenseCompleted,
  excavationPermitBlockedReason,
  onMarkComplete,
  onStart,
  onEmergencyComplete,
  onMoveBack,
  onCreateWorkflow,
}: WorkflowTabsProps) {
  const tabs = [
    { id: 'device', label: 'مسار رخصة الجهاز', disabled: false },
    { id: 'excavation', label: 'مسار تصريح الحفر', disabled: excavationPermitBlocked },
  ]

  return (
    <Tabs tabs={tabs}>
      <TabPanel id="device">
        <Card className="paper-card">
          <CardHeader>
            <div>
              <CardTitle>لوحة تنفيذ رخصة الجهاز</CardTitle>
              <CardSubtitle>
                {DEVICE_LICENSE_STEPS.length} خطوات. ركّز على أول خطوة غير مكتملة فقط.
              </CardSubtitle>
            </div>
          </CardHeader>
          <div className="mb-4 rounded-[var(--radius-xl)] border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/60 p-4 text-sm text-[var(--color-text-muted)]">
            هذا هو مسار التشغيل الأساسي. لما يخلص بالكامل، تصريح الحفر يفتح تلقائياً. كل كارت تحت يمثل خطوة واحدة فقط.
          </div>
          {!deviceLicenseWorkflow && onCreateWorkflow && (
            <div className="mb-4 flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-primary)]/20 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-[var(--color-text)]">لم يتم فتح مسار رخصة الجهاز بعد</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  اضغط الزر لإنشاء خطوات رخصة الجهاز الحقيقية لهذا العميل، وبعدها سيظهر زر بدء التنفيذ داخل أول خطوة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCreateWorkflow?.('DEVICE_LICENSE')}
                className="rounded-[var(--radius-xl)] bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-[var(--color-primary-hover)]"
              >
                فتح مسار رخصة الجهاز
              </button>
            </div>
          )}
          <WorkflowTimeline
            steps={
              deviceLicenseWorkflow?.steps?.length
                ? deviceLicenseWorkflow.steps
                : DEVICE_LICENSE_STEPS.map((step, i) => ({
                    id: `placeholder-device-${i}`,
                    workflow_id: deviceLicenseWorkflow?.id || '',
                    step_order: i + 1,
                    name: step.name,
                    status: 'pending' as const,
                    assigned_to: null,
                    completed_at: null,
                    fees: step.fees,
                    profit: step.profit,
                    created_at: '',
                    updated_at: '',
                  }))
            }
            onMarkComplete={onMarkComplete}
            onStart={onStart}
            onEmergencyComplete={onEmergencyComplete}
            onMoveBack={onMoveBack}
          />
        </Card>
      </TabPanel>

      <TabPanel id="excavation">
        <Card className="paper-card">
          <CardHeader>
            <div>
              <CardTitle>لوحة تنفيذ تصريح الحفر</CardTitle>
              <CardSubtitle>
                {EXCAVATION_PERMIT_STEPS.length} خطوات. هذا المسار يظل مقفلاً حتى تكتمل رخصة الجهاز.
              </CardSubtitle>
            </div>
          </CardHeader>
          {excavationPermitBlocked && (
            <div className="mb-4 rounded-[var(--radius-xl)] border border-[var(--color-error)]/20 bg-[var(--color-error-light)] p-4">
              <div className="flex items-center gap-3 text-[var(--color-error)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 flex-shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <div className="font-medium">المسار مقفل</div>
                  <div className="text-sm mt-1 opacity-75">
                    {excavationPermitBlockedReason || 'لا يمكن بدء تصريح الحفر قبل اكتمال رخصة الجهاز بالكامل'}
                  </div>
                </div>
              </div>
            </div>
          )}
          {!excavationPermitBlocked && !excavationPermitWorkflow && onCreateWorkflow && (
            <div className="mb-4 flex flex-col gap-3 rounded-[var(--radius-xl)] border border-[var(--color-primary)]/20 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-[var(--color-text)]">لم يتم فتح مسار تصريح الحفر بعد</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  رخصة الجهاز مكتملة. اضغط الزر لإنشاء خطوات تصريح الحفر الحقيقية لهذا العميل.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCreateWorkflow?.('EXCAVATION_PERMIT')}
                className="rounded-[var(--radius-xl)] bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-[var(--color-primary-hover)]"
              >
                فتح مسار تصريح الحفر
              </button>
            </div>
          )}
          <WorkflowTimeline
            steps={
              excavationPermitWorkflow?.steps?.length
                ? excavationPermitWorkflow.steps
                : EXCAVATION_PERMIT_STEPS.map((step, i) => ({
                    id: `placeholder-excavation-${i}`,
                    workflow_id: excavationPermitWorkflow?.id || '',
                    step_order: i + 1,
                    name: step.name,
                    status: excavationPermitBlocked ? 'blocked' as const : 'pending' as const,
                    assigned_to: null,
                    completed_at: null,
                    fees: step.fees,
                    profit: step.profit,
                    created_at: '',
                    updated_at: '',
                  }))
            }
            locked={excavationPermitBlocked}
            lockedReason={excavationPermitBlockedReason}
            onMarkComplete={onMarkComplete}
            onStart={onStart}
            onEmergencyComplete={onEmergencyComplete}
            onMoveBack={onMoveBack}
          />
        </Card>
      </TabPanel>
    </Tabs>
  )
}
