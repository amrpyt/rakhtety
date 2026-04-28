import React from 'react'
import { WorkflowStep } from '@/components/workflow/WorkflowStep'
import type { WorkflowStepWithEmployee, StepStatus } from '@/types/database.types'

interface WorkflowTimelineProps {
  steps: WorkflowStepWithEmployee[]
  locked?: boolean
}

export function WorkflowTimeline({ steps, locked = false }: WorkflowTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-text-muted)]">
        لا توجد خطوات
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <WorkflowStep
          key={step.id}
          name={step.name}
          status={step.status as StepStatus}
          assignedTo={step.assigned_employee?.full_name}
          completedAt={step.completed_at ? new Date(step.completed_at).toLocaleDateString('ar-EG') : undefined}
          fees={step.fees}
          profit={step.profit}
          isLocked={locked}
          stepNumber={index + 1}
        />
      ))}
    </div>
  )
}