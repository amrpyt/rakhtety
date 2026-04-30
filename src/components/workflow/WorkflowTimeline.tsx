import React from 'react'
import { WorkflowStep } from '@/components/workflow/WorkflowStep'
import type { WorkflowStepWithEmployee, StepStatus } from '@/types/database.types'

interface WorkflowTimelineProps {
  steps: WorkflowStepWithEmployee[]
  locked?: boolean
  lockedReason?: string
  onMarkComplete?: (stepId: string) => Promise<void>
  onStart?: (stepId: string) => Promise<void>
  onEmergencyComplete?: (stepId: string, reason: string) => Promise<void>
  onMoveBack?: (stepId: string, reason: string) => Promise<void>
}

export function WorkflowTimeline({
  steps,
  locked = false,
  lockedReason,
  onMarkComplete,
  onStart,
  onEmergencyComplete,
  onMoveBack,
}: WorkflowTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-text-muted)]">
        لا توجد خطوات
      </div>
    )
  }

  const currentIndex = locked
    ? -1
    : steps.findIndex((step) => step.status === 'in_progress' || step.status === 'pending')

  return (
    <div className="relative flex flex-col gap-3">
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
          canAct={!step.id.startsWith('placeholder-') && index === currentIndex}
          isCurrentStep={index === currentIndex}
          isExpanded={index === currentIndex || step.status === 'in_progress'}
          onMarkComplete={onMarkComplete}
          onStart={onStart}
          onEmergencyComplete={onEmergencyComplete}
          onMoveBack={onMoveBack}
        />
      ))}
    </div>
  )
}
