import React from 'react'
import { WorkflowStep } from '@/components/workflow/WorkflowStep'
import type { WorkflowStepWithEmployee, StepStatus } from '@/types/database.types'

interface WorkflowTimelineProps {
  steps: WorkflowStepWithEmployee[]
  locked?: boolean
  lockedReason?: string
  onMarkComplete?: (stepId: string) => Promise<void>
  onStart?: (stepId: string) => Promise<void>
}

export function WorkflowTimeline({
  steps,
  locked = false,
  lockedReason,
  onMarkComplete,
  onStart,
}: WorkflowTimelineProps) {
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
          id={step.id}
          workflowId={step.workflow_id}
          name={step.name}
          status={step.status as StepStatus}
          assignedTo={step.assigned_employee?.full_name}
          completedAt={step.completed_at ? new Date(step.completed_at).toLocaleDateString('ar-EG') : undefined}
          fees={step.fees}
          profit={step.profit}
          isLocked={locked}
          lockedReason={lockedReason}
          stepNumber={index + 1}
          canAct={!step.id.startsWith('placeholder-')}
          onMarkComplete={onMarkComplete}
          onStart={onStart}
        />
      ))}
    </div>
  )
}
