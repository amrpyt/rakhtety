import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/hooks/auth/useAuth'
import { workflowService } from '@/lib/services/workflow.service'
import type { StepStatus, WorkflowWithSteps } from '@/types/database.types'

interface UseWorkflowsReturn {
  deviceLicense: WorkflowWithSteps | null
  excavationPermit: WorkflowWithSteps | null
  deviceLicenseCompleted: boolean
  excavationPermitBlocked: boolean
  excavationPermitBlockedReason?: string
  loading: boolean
  error: string | null
  fetchWorkflows: (clientId: string) => Promise<void>
  createWorkflow: (type: WorkflowWithSteps['type']) => Promise<void>
  updateStepStatus: (stepId: string, status: Extract<StepStatus, 'in_progress' | 'completed'>) => Promise<void>
  emergencyCompleteStep: (stepId: string, reason: string) => Promise<void>
  moveStepBack: (stepId: string, reason: string) => Promise<void>
}

export function useWorkflows(clientId?: string): UseWorkflowsReturn {
  const { user } = useAuth()
  const actorId = user?.id || null
  const [deviceLicense, setDeviceLicense] = useState<WorkflowWithSteps | null>(null)
  const [excavationPermit, setExcavationPermit] = useState<WorkflowWithSteps | null>(null)
  const [deviceLicenseCompleted, setDeviceLicenseCompleted] = useState(false)
  const [excavationPermitBlocked, setExcavationPermitBlocked] = useState(false)
  const [excavationPermitBlockedReason, setExcavationPermitBlockedReason] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflows = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/clients/${id}/workflows`)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to fetch workflows')
      }

      setDeviceLicense(payload.deviceLicense)
      setExcavationPermit(payload.excavationPermit)
      setDeviceLicenseCompleted(payload.deviceLicenseCompleted)
      setExcavationPermitBlocked(payload.excavationPermitBlocked)
      setExcavationPermitBlockedReason(payload.excavationPermitBlockedReason)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }, [])

  const createWorkflow = useCallback(
    async (type: WorkflowWithSteps['type']) => {
      if (!clientId) return

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/clients/${clientId}/workflows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        })
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to create workflow')
        }

        await fetchWorkflows(clientId)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create workflow'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [clientId, fetchWorkflows]
  )

  const updateStepStatus = useCallback(
    async (stepId: string, status: Extract<StepStatus, 'in_progress' | 'completed'>) => {
      try {
        setLoading(true)
        setError(null)
        await workflowService.updateStepStatus(stepId, status)
        if (clientId) {
          await fetchWorkflows(clientId)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update step'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [clientId, fetchWorkflows]
  )

  const emergencyCompleteStep = useCallback(
    async (stepId: string, reason: string) => {
      try {
        setLoading(true)
        setError(null)
        await workflowService.emergencyCompleteStep(stepId, { reason, actorId })
        if (clientId) {
          await fetchWorkflows(clientId)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to emergency complete step'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [actorId, clientId, fetchWorkflows]
  )

  const moveStepBack = useCallback(
    async (stepId: string, reason: string) => {
      try {
        setLoading(true)
        setError(null)
        await workflowService.moveStepBack(stepId, { reason, actorId })
        if (clientId) {
          await fetchWorkflows(clientId)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to move step back'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [actorId, clientId, fetchWorkflows]
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (clientId) {
        void fetchWorkflows(clientId)
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [clientId, fetchWorkflows])

  return {
    deviceLicense,
    excavationPermit,
    deviceLicenseCompleted,
    excavationPermitBlocked,
    excavationPermitBlockedReason,
    loading,
    error,
    fetchWorkflows,
    createWorkflow,
    updateStepStatus,
    emergencyCompleteStep,
    moveStepBack,
  }
}
