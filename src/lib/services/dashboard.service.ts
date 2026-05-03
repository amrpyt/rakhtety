import { dashboardSummaryService } from '@/lib/services/dashboard-summary.service'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DashboardAnalyticsSummary } from '@/types/database.types'

export class DashboardService {
  async getSummary(supabase: SupabaseClient, now = new Date()): Promise<DashboardAnalyticsSummary> {
    return dashboardSummaryService.summarizeManagerDashboard(supabase, now)
  }
}

export const dashboardService = new DashboardService()
