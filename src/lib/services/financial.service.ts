import { financialRepository, type CreateFinancialEventData } from '@/lib/database/repositories/financial.repository'
import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import type {
  FinancialDashboardSummary,
  FinancialEvent,
  WorkflowFinancialSummary,
} from '@/types/database.types'
import { AppError, NotFoundError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'
import {
  calculateRealizedProfit,
  calculateTotalsFromSteps,
  getSignedEventAmount,
} from '@/lib/services/financial-calculations'

export interface RecordFinancialEventInput {
  workflow_id: string
  workflow_step_id?: string | null
  amount: number
  payment_method?: string | null
  reference_number?: string | null
  notes?: string | null
  created_by?: string | null
}

type FinancialEventWithoutClient = Omit<CreateFinancialEventData, 'client_id'>

export class FinancialService {
  async recordPayment(input: RecordFinancialEventInput): Promise<FinancialEvent> {
    return this.recordEvent({ ...input, type: 'payment' })
  }

  async recordRefund(input: RecordFinancialEventInput): Promise<FinancialEvent> {
    return this.recordEvent({ ...input, type: 'refund' })
  }

  async recordAdjustment(input: RecordFinancialEventInput): Promise<FinancialEvent> {
    return this.recordEvent({ ...input, type: 'adjustment' })
  }

  async calculateWorkflowSummary(workflowId: string): Promise<WorkflowFinancialSummary> {
    const workflow = await workflowRepository.findById(workflowId)
    if (!workflow) {
      throw new NotFoundError('المسار', workflowId)
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

  async calculateClientDebt(clientId: string): Promise<number> {
    const workflows = await workflowRepository.findByClientId(clientId)
    const summaries = await Promise.all(workflows.map((workflow) => this.calculateWorkflowSummary(workflow.id)))
    return summaries.reduce((sum, summary) => sum + summary.outstanding_debt, 0)
  }

  async calculateDashboardSummary(): Promise<FinancialDashboardSummary> {
    const events = await financialRepository.findAll()
    const workflows = await workflowRepository.findAll()
    const summaries = await Promise.all(workflows.map((workflow) => this.calculateWorkflowSummary(workflow.id)))

    return {
      total_fees_collected: events.reduce((sum, event) => sum + (event.type === 'payment' ? Number(event.amount) : 0), 0),
      realized_profit: summaries.reduce((sum, summary) => sum + summary.realized_profit, 0),
      outstanding_debt: summaries.reduce((sum, summary) => sum + summary.outstanding_debt, 0),
    }
  }

  private async recordEvent(data: FinancialEventWithoutClient): Promise<FinancialEvent> {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new AppError({
        code: ErrorCodes.VALIDATION_FAILED,
        message: 'المبلغ يجب أن يكون أكبر من صفر',
        statusCode: 400,
        context: { amount: data.amount },
      })
    }

    const workflow = await workflowRepository.findById(data.workflow_id)
    if (!workflow) {
      throw new NotFoundError('المسار', data.workflow_id)
    }

    return financialRepository.createEvent({
      ...data,
      client_id: workflow.client_id,
      currency: data.currency || 'EGP',
    })
  }
}

export const financialService = new FinancialService()
