import type {
  Client,
  DashboardBottleneck,
  EmployeeWithProfile,
  EmployeeWorkloadSummary,
  RecentWorkflowSummary,
  Workflow,
  WorkflowStepWithEmployee,
} from '@/types/database.types'

export const BOTTLENECK_THRESHOLD_DAYS = 7

const DAY_IN_MS = 24 * 60 * 60 * 1000
const ACTIVE_STEP_STATUSES = new Set(['in_progress', 'blocked'])

export type WorkflowAnalyticsInput = Workflow & {
  client?: Pick<Client, 'id' | 'name'> | null
  steps?: WorkflowStepWithEmployee[]
}

export function countActiveFiles(workflows: Pick<Workflow, 'status'>[]): number {
  return workflows.filter((workflow) => workflow.status !== 'completed').length
}

export function countCompletedThisMonth(
  workflows: Pick<Workflow, 'status' | 'updated_at'>[],
  now = new Date()
): number {
  return workflows.filter((workflow) => {
    if (workflow.status !== 'completed') return false

    const updatedAt = new Date(workflow.updated_at)
    return updatedAt.getFullYear() === now.getFullYear() && updatedAt.getMonth() === now.getMonth()
  }).length
}

export function getStuckDays(updatedAt: string, now = new Date()): number {
  const updated = new Date(updatedAt)
  if (Number.isNaN(updated.getTime())) return 0

  return Math.max(0, Math.floor((now.getTime() - updated.getTime()) / DAY_IN_MS))
}

export function isBottleneckStep(
  step: Pick<WorkflowStepWithEmployee, 'status' | 'updated_at'>,
  now = new Date(),
  thresholdDays = BOTTLENECK_THRESHOLD_DAYS
): boolean {
  return ACTIVE_STEP_STATUSES.has(step.status) && getStuckDays(step.updated_at, now) >= thresholdDays
}

export function buildBottlenecks(
  workflows: WorkflowAnalyticsInput[],
  now = new Date(),
  thresholdDays = BOTTLENECK_THRESHOLD_DAYS
): DashboardBottleneck[] {
  return workflows
    .flatMap((workflow) =>
      (workflow.steps || [])
        .filter((step) => isBottleneckStep(step, now, thresholdDays))
        .map((step) => ({
          workflow_id: workflow.id,
          workflow_step_id: step.id,
          client_id: workflow.client_id,
          client_name: workflow.client?.name || 'عميل غير معروف',
          workflow_type: workflow.type,
          step_name: step.name,
          step_status: step.status,
          assigned_to: step.assigned_to,
          assigned_employee_name: step.assigned_employee?.full_name || null,
          stuck_days: getStuckDays(step.updated_at, now),
          updated_at: step.updated_at,
        }))
    )
    .sort((a, b) => b.stuck_days - a.stuck_days)
}

export function buildEmployeeWorkloads(
  employees: EmployeeWithProfile[],
  workflows: WorkflowAnalyticsInput[],
  bottlenecks: DashboardBottleneck[]
): EmployeeWorkloadSummary[] {
  return employees.map((employee) => {
    const userId = employee.user_id
    const activeWorkflows = workflows.filter(
      (workflow) => workflow.assigned_to === userId && workflow.status !== 'completed'
    ).length
    const activeSteps = workflows.reduce(
      (count, workflow) =>
        count +
        (workflow.steps || []).filter((step) => step.assigned_to === userId && step.status !== 'completed').length,
      0
    )

    return {
      employee_id: employee.id,
      user_id: userId,
      full_name: employee.profile.full_name,
      active_workflows: activeWorkflows,
      active_steps: activeSteps,
      bottlenecks: bottlenecks.filter((bottleneck) => bottleneck.assigned_to === userId).length,
    }
  })
}

export function buildRecentWorkflows(workflows: WorkflowAnalyticsInput[], limit = 4): RecentWorkflowSummary[] {
  return [...workflows]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit)
    .map((workflow) => ({
      workflow_id: workflow.id,
      client_name: workflow.client?.name || 'عميل غير معروف',
      workflow_type: workflow.type,
      status: workflow.status,
      updated_at: workflow.updated_at,
    }))
}

export function attachWorkflowData(
  workflow: Workflow,
  client: Pick<Client, 'id' | 'name'> | null,
  steps: WorkflowStepWithEmployee[]
): WorkflowAnalyticsInput {
  return {
    ...workflow,
    client,
    steps,
  }
}
