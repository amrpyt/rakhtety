import { useCallback, useEffect, useState } from 'react'
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
      const response = await fetch('/api/dashboard/summary')
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Failed to load dashboard summary')
      }

      setSummary(payload.summary as DashboardAnalyticsSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل بيانات لوحة التحكم')
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
