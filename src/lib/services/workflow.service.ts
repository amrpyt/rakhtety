import type { StepStatus } from '@/types/database.types'

export interface EmergencyStepActionInput {
  reason: string
  actorId?: string | null
}

async function patchStepStatus(stepId: string, status: StepStatus) {
  const response = await fetch(`/api/workflow-steps/${stepId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'Failed to update step')
  return payload.step
}

export const workflowService = {
  updateStepStatus(stepId: string, status: Extract<StepStatus, 'in_progress' | 'completed'>) {
    return patchStepStatus(stepId, status)
  },

  emergencyCompleteStep(stepId: string, input: EmergencyStepActionInput) {
    void input
    return patchStepStatus(stepId, 'completed')
  },

  moveStepBack(stepId: string, input: EmergencyStepActionInput) {
    void input
    return patchStepStatus(stepId, 'pending')
  },
}
