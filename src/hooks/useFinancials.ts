import { useCallback, useEffect, useState } from 'react'
import { financialService, type RecordFinancialEventInput } from '@/lib/services/financial.service'
import type { WorkflowFinancialSummary } from '@/types/database.types'

interface UseFinancialsReturn {
  summary: WorkflowFinancialSummary | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  recordPayment: (input: Omit<RecordFinancialEventInput, 'workflow_id'>) => Promise<void>
}

export function useFinancials(workflowId?: string): UseFinancialsReturn {
  const [summary, setSummary] = useState<WorkflowFinancialSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!workflowId) {
      setSummary(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/workflows/${workflowId}/financial-summary`)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load financial summary')
      }

      setSummary(payload.summary as WorkflowFinancialSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial summary')
    } finally {
      setLoading(false)
    }
  }, [workflowId])

  const recordPayment = useCallback(
    async (input: Omit<RecordFinancialEventInput, 'workflow_id'>) => {
      if (!workflowId) return

      setLoading(true)
      setError(null)
      try {
        await financialService.recordPayment({ ...input, workflow_id: workflowId })
        await refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to record payment'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refresh, workflowId]
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  return { summary, loading, error, refresh, recordPayment }
}
