import type { SupabaseClient } from '@supabase/supabase-js'
import {
  calculateRealizedProfit,
  calculateTotalsFromSteps,
  getSignedEventAmount,
} from '@/lib/services/financial-calculations'
import type { FinancialDashboardSummary, FinancialEvent, Workflow, WorkflowFinancialSummary, WorkflowStep } from '@/types/database.types'

export async function summarizeWorkflowLedger(
  supabase: SupabaseClient,
  workflowId: string
): Promise<WorkflowFinancialSummary> {
  const [{ data: workflow, error: workflowError }, { data: steps, error: stepsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase.from('workflows').select('*').eq('id', workflowId).maybeSingle(),
      supabase.from('workflow_steps').select('*').eq('workflow_id', workflowId),
      supabase.from('financial_events').select('*').eq('workflow_id', workflowId),
    ])

  if (workflowError || stepsError || eventsError) {
    throw workflowError || stepsError || eventsError
  }

  if (!workflow) {
    throw new Error('المسار غير موجود')
  }

  const totals = calculateTotalsFromSteps((steps || []) as WorkflowStep[])
  const financialEvents = (events || []) as FinancialEvent[]
  const totalPaid = financialEvents.reduce((sum, event) => sum + getSignedEventAmount(event), 0)
  const realizedProfit = calculateRealizedProfit(financialEvents, totals.planned_profit, totals.total_cost)

  return {
    workflow_id: workflowId,
    total_cost: totals.total_cost,
    total_fees: totals.total_fees,
    planned_profit: totals.planned_profit,
    total_paid: totalPaid,
    realized_profit: realizedProfit,
    outstanding_debt: Math.max(0, totals.total_cost - totalPaid),
  }
}

export async function summarizeOfficeLedger(supabase: SupabaseClient): Promise<FinancialDashboardSummary> {
  const [{ data: events, error: eventsError }, { data: workflows, error: workflowsError }] = await Promise.all([
    supabase.from('financial_events').select('*'),
    supabase.from('workflows').select('*'),
  ])

  if (eventsError || workflowsError) {
    throw eventsError || workflowsError
  }

  const summaries = await Promise.all(
    ((workflows || []) as Workflow[]).map((workflow) => summarizeWorkflowLedger(supabase, workflow.id))
  )
  const financialEvents = (events || []) as FinancialEvent[]

  return {
    total_fees_collected: financialEvents.reduce((sum, event) => sum + (event.type === 'payment' ? Number(event.amount) : 0), 0),
    realized_profit: summaries.reduce((sum, summary) => sum + summary.realized_profit, 0),
    outstanding_debt: summaries.reduce((sum, summary) => sum + summary.outstanding_debt, 0),
  }
}
