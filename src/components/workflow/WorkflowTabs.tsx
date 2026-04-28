'use client'

import React from 'react'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import type { WorkflowWithSteps } from '@/types/database.types'

interface WorkflowTabsProps {
  deviceLicenseWorkflow?: WorkflowWithSteps | null
  excavationPermitWorkflow?: WorkflowWithSteps | null
  deviceLicenseCompleted: boolean
}

const DEVICE_LICENSE_STEPS = [
  'بيان الصلاحية',
  'تقديم المجمعة العشرية للإسكان المميز',
  'تقديم الملف',
  'دفع إذن الرخصة وشراء عقد مخلفات',
  'استلام الرخصة',
]

const EXCAVATION_PERMIT_STEPS = [
  'تقديم واستلام شهادة الإشراف',
  'تقديم واستلام التأمينات',
  'التقديم على العداد الإنشائي',
  'تقديم ودفع واستلام تصريح الحفر',
  'تصريح التعدين',
]

export function WorkflowTabs({ deviceLicenseWorkflow, excavationPermitWorkflow, deviceLicenseCompleted }: WorkflowTabsProps) {
  const tabs = [
    { id: 'device', label: '🏗️ مسار رخصة الجهاز', disabled: false },
    { id: 'excavation', label: '⛏️ مسار تصريح الحفر', disabled: !deviceLicenseCompleted },
  ]

  return (
    <Tabs tabs={tabs}>
      <TabPanel id="device">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>خطوات رخصة الجهاز</CardTitle>
              <CardSubtitle>المسار الأول · 5 خطوات رئيسية</CardSubtitle>
            </div>
          </CardHeader>
          <WorkflowTimeline
            steps={
              deviceLicenseWorkflow?.steps?.length
                ? deviceLicenseWorkflow.steps
                : DEVICE_LICENSE_STEPS.map((name, i) => ({
                    id: `placeholder-${i}`,
                    workflow_id: deviceLicenseWorkflow?.id || '',
                    step_order: i + 1,
                    name,
                    status: 'pending' as const,
                    assigned_to: null,
                    completed_at: null,
                    fees: 0,
                    profit: 0,
                    created_at: '',
                    updated_at: '',
                  }))
            }
          />
        </Card>
      </TabPanel>

      <TabPanel id="excavation">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>خطوات تصريح الحفر</CardTitle>
              <CardSubtitle>المسار الثاني · 5 خطوات</CardSubtitle>
            </div>
          </CardHeader>
          {!deviceLicenseCompleted ? (
            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-error-light)] border border-[var(--color-error)]/20">
              <div className="flex items-center gap-3 text-[var(--color-error)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 flex-shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <div className="font-medium">المسار مقفل</div>
                  <div className="text-sm mt-1 opacity-75">
                    لا يمكن بدء مسار تصريح الحفر قبل اكتمال رخصة الجهاز بالكامل
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <WorkflowTimeline
              steps={
                excavationPermitWorkflow?.steps?.length
                  ? excavationPermitWorkflow.steps
                  : EXCAVATION_PERMIT_STEPS.map((name, i) => ({
                      id: `placeholder-${i}`,
                      workflow_id: excavationPermitWorkflow?.id || '',
                      step_order: i + 1,
                      name,
                      status: 'pending' as const,
                      assigned_to: null,
                      completed_at: null,
                      fees: 0,
                      profit: 0,
                      created_at: '',
                      updated_at: '',
                    }))
              }
            />
          )}
        </Card>
      </TabPanel>
    </Tabs>
  )
}