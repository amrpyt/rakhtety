import { useState, useCallback, useEffect } from 'react'
import { workflowService } from '@/lib/services/workflow.service'
import type { WorkflowWithSteps } from '@/types/database.types'

interface UseWorkflowsReturn {
  deviceLicense: WorkflowWithSteps | null
  excavationPermit: WorkflowWithSteps | null
  deviceLicenseCompleted: boolean
  loading: boolean
  error: string | null
  fetchWorkflows: (clientId: string) => Promise<void>
}

export function useWorkflows(clientId?: string): UseWorkflowsReturn {
  const [deviceLicense, setDeviceLicense] = useState<WorkflowWithSteps | null>(null)
  const [excavationPermit, setExcavationPermit] = useState<WorkflowWithSteps | null>(null)
  const [deviceLicenseCompleted, setDeviceLicenseCompleted] = useState(false)
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
        setDeviceLicenseCompleted(device.status === 'completed')
      } else {
        setDeviceLicense(null)
        setDeviceLicenseCompleted(false)
      }

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

  useEffect(() => {
    if (clientId) {
      fetchWorkflows(clientId)
    }
  }, [clientId, fetchWorkflows])

  return {
    deviceLicense,
    excavationPermit,
    deviceLicenseCompleted,
    loading,
    error,
    fetchWorkflows,
  }
}