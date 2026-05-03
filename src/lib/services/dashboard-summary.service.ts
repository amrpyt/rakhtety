import { clientRepository } from '@/lib/database/repositories/client.repository'
import { employeeRepository } from '@/lib/database/repositories/employee.repository'
import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { ledgerSummaryService } from '@/lib/services/ledger-summary.service'
import type { DashboardAnalyticsSummary } from '@/types/database.types'
import {
  attachWorkflowData,
  buildBottlenecks,
  buildEmployeeWorkloads,
  buildRecentWorkflows,
  countActiveFiles,
  countCompletedThisMonth,
  type WorkflowAnalyticsInput,
} from '@/lib/services/dashboard-analytics'

class DashboardSummaryService {
  async summarizeManagerDashboard(now = new Date()): Promise<DashboardAnalyticsSummary> {
    const [workflows, employees, financialSummary] = await Promise.all([
      workflowRepository.findAll(),
      employeeRepository.findAll(),
      ledgerSummaryService.summarizeOfficeLedger(),
    ])

    const workflowsWithDetails: WorkflowAnalyticsInput[] = await Promise.all(
      workflows.map(async (workflow) => {
        const [client, steps] = await Promise.all([
          clientRepository.findById(workflow.client_id),
          workflowStepRepository.findByWorkflowId(workflow.id),
        ])

        return attachWorkflowData(workflow, client, steps)
      })
    )

    const bottlenecks = buildBottlenecks(workflowsWithDetails, now)

    return {
      active_files: countActiveFiles(workflowsWithDetails),
      completed_this_month: countCompletedThisMonth(workflowsWithDetails, now),
      pending_debt: financialSummary.outstanding_debt,
      bottleneck_count: bottlenecks.length,
      bottlenecks,
      employee_workloads: buildEmployeeWorkloads(employees, workflowsWithDetails, bottlenecks),
      recent_workflows: buildRecentWorkflows(workflowsWithDetails),
    }
  }
}

export const dashboardSummaryService = new DashboardSummaryService()
