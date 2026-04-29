import { useCallback, useEffect, useState } from 'react'
import { dashboardService } from '@/lib/services/dashboard.service'
import type { DashboardAnalyticsSummary } from '@/types/database.types'

interface UseDashboardAnalyticsReturn {
  summary: DashboardAnalyticsSummary | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useDashboardAnalytics(): UseDashboardAnalyticsReturn {
  const [summary, setSummary] = useState<DashboardAnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setSummary(await dashboardService.getSummary())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل بيانات لوحة التحكم')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { summary, loading, error, refresh }
}
