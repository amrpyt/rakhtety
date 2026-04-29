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
  updateStepStatus: (stepId: string, status: Extract<StepStatus, 'in_progress' | 'completed'>) => Promise<void>
  emergencyCompleteStep: (stepId: string, reason: string) => Promise<void>
  moveStepBack: (stepId: string, reason: string) => Promise<void>
}

export function useWorkflows(clientId?: string): UseWorkflowsReturn {
  const { user } = useAuth()
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
      const workflows = await workflowService.findByClientId(id)
      const device = workflows.find((w) => w.type === 'DEVICE_LICENSE') || null
      const excavation = workflows.find((w) => w.type === 'EXCAVATION_PERMIT') || null

      if (device) {
        const deviceWithSteps = await workflowService.getWithSteps(device.id)
        setDeviceLicense(deviceWithSteps)
        setDeviceLicenseCompleted(deviceWithSteps.status === 'completed')
      } else {
        setDeviceLicense(null)
        setDeviceLicenseCompleted(false)
      }

      const dependencyStatus = await workflowService.checkDependency(id)
      setExcavationPermitBlocked(dependencyStatus.isBlocked)
      setExcavationPermitBlockedReason(dependencyStatus.reason)

      if (excavation) {
        const excavationWithSteps = await workflowService.getWithSteps(excavation.id)
        setExcavationPermit(excavationWithSteps)
      } else {
        setExcavationPermit(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }, [])

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
        await workflowService.emergencyCompleteStep(stepId, { reason, actorId: user?.id || null })
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
    [clientId, fetchWorkflows, user?.id]
  )

  const moveStepBack = useCallback(
    async (stepId: string, reason: string) => {
      try {
        setLoading(true)
        setError(null)
        await workflowService.moveStepBack(stepId, { reason, actorId: user?.id || null })
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
    [clientId, fetchWorkflows, user?.id]
  )

  useEffect(() => {
    if (clientId) {
      fetchWorkflows(clientId)
    }
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
    updateStepStatus,
    emergencyCompleteStep,
    moveStepBack,
  }
}
