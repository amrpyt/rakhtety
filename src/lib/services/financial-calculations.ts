import type { FinancialEvent, WorkflowStep } from '@/types/database.types'

interface StepTotals {
  total_cost: number
  total_fees: number
  planned_profit: number
}

export function calculateTotalsFromSteps(steps: Pick<WorkflowStep, 'fees' | 'profit'>[]): StepTotals {
  return steps.reduce(
    (totals, step) => ({
      total_cost: totals.total_cost + Number(step.fees ?? 0) + Number(step.profit ?? 0),
      total_fees: totals.total_fees + Number(step.fees ?? 0),
      planned_profit: totals.planned_profit + Number(step.profit ?? 0),
    }),
    { total_cost: 0, total_fees: 0, planned_profit: 0 }
  )
}

export function getSignedEventAmount(event: Pick<FinancialEvent, 'type' | 'amount'>): number {
  if (event.type === 'refund') return -Number(event.amount)
  return Number(event.amount)
}

export function calculateRealizedProfit(
  events: Pick<FinancialEvent, 'type' | 'amount'>[],
  plannedProfit: number,
  totalCost: number
): number {
  if (plannedProfit <= 0 || totalCost <= 0) return 0

  const paidTotal = events.reduce((sum, event) => sum + getSignedEventAmount(event), 0)
  const profitRatio = plannedProfit / totalCost
  const realized = paidTotal * profitRatio

  return Math.max(0, Math.min(plannedProfit, realized))
}
