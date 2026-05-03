import { dashboardSummaryService } from '@/lib/services/dashboard-summary.service'
import type { DashboardAnalyticsSummary } from '@/types/database.types'

export class DashboardService {
  async getSummary(now = new Date()): Promise<DashboardAnalyticsSummary> {
    return dashboardSummaryService.summarizeManagerDashboard(now)
  }
}

export const dashboardService = new DashboardService()
