import { financialRepository } from '@/lib/database/repositories/financial.repository'
import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { NotFoundError } from '@/lib/errors/app-error.class'
import { domainMessages } from '@/lib/domain/messages'
import type { FinancialDashboardSummary, WorkflowFinancialSummary } from '@/types/database.types'
import {
  calculateRealizedProfit,
  calculateTotalsFromSteps,
  getSignedEventAmount,
} from '@/lib/services/financial-calculations'

class LedgerSummaryService {
  async summarizeWorkflowLedger(workflowId: string): Promise<WorkflowFinancialSummary> {
    const workflow = await workflowRepository.findById(workflowId)
    if (!workflow) {
      throw new NotFoundError(domainMessages.entities.workflow, workflowId)
    }

    const [steps, events] = await Promise.all([
      workflowStepRepository.findByWorkflowId(workflowId),
      financialRepository.findByWorkflowId(workflowId),
    ])

    const totals = calculateTotalsFromSteps(steps)
    const totalPaid = events.reduce((sum, event) => sum + getSignedEventAmount(event), 0)
    const realizedProfit = calculateRealizedProfit(events, totals.planned_profit, totals.total_cost)

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

  async summarizeClientDebt(clientId: string): Promise<number> {
    const workflows = await workflowRepository.findByClientId(clientId)
    const summaries = await Promise.all(workflows.map((workflow) => this.summarizeWorkflowLedger(workflow.id)))
    return summaries.reduce((sum, summary) => sum + summary.outstanding_debt, 0)
  }

  async summarizeOfficeLedger(): Promise<FinancialDashboardSummary> {
    const events = await financialRepository.findAll()
    const workflows = await workflowRepository.findAll()
    const summaries = await Promise.all(workflows.map((workflow) => this.summarizeWorkflowLedger(workflow.id)))

    return {
      total_fees_collected: events.reduce((sum, event) => sum + (event.type === 'payment' ? Number(event.amount) : 0), 0),
      realized_profit: summaries.reduce((sum, summary) => sum + summary.realized_profit, 0),
      outstanding_debt: summaries.reduce((sum, summary) => sum + summary.outstanding_debt, 0),
    }
  }
}

export const ledgerSummaryService = new LedgerSummaryService()
