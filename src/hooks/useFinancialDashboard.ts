import { useCallback, useEffect, useState } from 'react'
import { financialService } from '@/lib/services/financial.service'
import type { FinancialDashboardSummary } from '@/types/database.types'

interface UseFinancialDashboardReturn {
  summary: FinancialDashboardSummary | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useFinancialDashboard(): UseFinancialDashboardReturn {
  const [summary, setSummary] = useState<FinancialDashboardSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSummary(await financialService.calculateDashboardSummary())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void refresh()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [refresh])

  return { summary, loading, error, refresh }
}
