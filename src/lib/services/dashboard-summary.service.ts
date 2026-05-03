import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Client,
  DashboardAnalyticsSummary,
  EmployeeWithProfile,
  FinancialEvent,
  Workflow,
  WorkflowFinancialSummary,
  WorkflowStepWithEmployee,
} from '@/types/database.types'
import {
  attachWorkflowData,
  buildBottlenecks,
  buildEmployeeWorkloads,
  buildRecentWorkflows,
  countActiveFiles,
  countCompletedThisMonth,
  type WorkflowAnalyticsInput,
} from '@/lib/services/dashboard-analytics'
import {
  calculateRealizedProfit,
  calculateTotalsFromSteps,
  getSignedEventAmount,
} from '@/lib/services/financial-calculations'

async function selectAll<T>(supabase: SupabaseClient, table: string, select = '*'): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(select)
  if (error) throw error
  return (data || []) as T[]
}

async function summarizeWorkflowLedger(
  workflow: Workflow,
  steps: WorkflowStepWithEmployee[],
  events: FinancialEvent[]
): Promise<WorkflowFinancialSummary> {
  const workflowEvents = events.filter((event) => event.workflow_id === workflow.id)
  const totals = calculateTotalsFromSteps(steps)
  const totalPaid = workflowEvents.reduce((sum, event) => sum + getSignedEventAmount(event), 0)
  const realizedProfit = calculateRealizedProfit(workflowEvents, totals.planned_profit, totals.total_cost)

  return {
    workflow_id: workflow.id,
    total_cost: totals.total_cost,
    total_fees: totals.total_fees,
    planned_profit: totals.planned_profit,
    total_paid: totalPaid,
    realized_profit: realizedProfit,
    outstanding_debt: Math.max(0, totals.total_cost - totalPaid),
  }
}

class DashboardSummaryService {
  async summarizeManagerDashboard(supabase: SupabaseClient, now = new Date()): Promise<DashboardAnalyticsSummary> {
    const [workflows, employees, clients, steps, events] = await Promise.all([
      selectAll<Workflow>(supabase, 'workflows'),
      selectAll<EmployeeWithProfile>(supabase, 'employees', '*, profile:profiles(*)'),
      selectAll<Client>(supabase, 'clients'),
      selectAll<WorkflowStepWithEmployee>(supabase, 'workflow_steps', '*, assigned_employee:profiles(full_name)'),
      selectAll<FinancialEvent>(supabase, 'financial_events'),
    ])

    const activeEmployees = employees.filter((employee) => employee.is_active)
    const workflowsWithDetails: WorkflowAnalyticsInput[] = workflows.map((workflow) =>
      attachWorkflowData(
        workflow,
        clients.find((client) => client.id === workflow.client_id) || null,
        steps
          .filter((step) => step.workflow_id === workflow.id)
          .sort((a, b) => a.step_order - b.step_order)
      )
    )
    const summaries = await Promise.all(
      workflows.map((workflow) =>
        summarizeWorkflowLedger(
          workflow,
          steps.filter((step) => step.workflow_id === workflow.id),
          events
        )
      )
    )
    const outstandingDebt = summaries.reduce((sum, summary) => sum + summary.outstanding_debt, 0)

    const bottlenecks = buildBottlenecks(workflowsWithDetails, now)

    return {
      active_files: countActiveFiles(workflowsWithDetails),
      completed_this_month: countCompletedThisMonth(workflowsWithDetails, now),
      pending_debt: outstandingDebt,
      bottleneck_count: bottlenecks.length,
      bottlenecks,
      employee_workloads: buildEmployeeWorkloads(activeEmployees, workflowsWithDetails, bottlenecks),
      recent_workflows: buildRecentWorkflows(workflowsWithDetails),
    }
  }
}

export const dashboardSummaryService = new DashboardSummaryService()
