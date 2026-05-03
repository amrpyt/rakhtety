import type { FinancialDashboardSummary, FinancialEvent, WorkflowFinancialSummary } from '@/types/database.types'
import type { RecordFinancialEventInput } from '@/types/directory.types'

export type { RecordFinancialEventInput }

export const financialService = {
  async recordPayment(input: RecordFinancialEventInput): Promise<FinancialEvent> {
    void input
    throw new Error('Recording payments is managed in Frappe during this migration step')
  },

  async calculateWorkflowSummary(workflowId: string): Promise<WorkflowFinancialSummary> {
    const response = await fetch(`/api/workflows/${workflowId}/financial-summary`)
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Failed to load financial summary')
    return payload.summary
  },

  async calculateDashboardSummary(): Promise<FinancialDashboardSummary> {
    const response = await fetch('/api/dashboard/summary')
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Failed to load financial dashboard')
    return {
      total_fees_collected: 0,
      realized_profit: 0,
      outstanding_debt: payload.summary?.pending_debt || 0,
    }
  },
}
