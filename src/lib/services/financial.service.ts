import { financialRepository, type CreateFinancialEventData } from '@/lib/database/repositories/financial.repository'
import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { domainMessages } from '@/lib/domain/messages'
import { AppError, NotFoundError } from '@/lib/errors/app-error.class'
import { ledgerSummaryService } from '@/lib/services/ledger-summary.service'
import { ErrorCodes } from '@/types/error-codes.enum'
import type { FinancialDashboardSummary, FinancialEvent, WorkflowFinancialSummary } from '@/types/database.types'

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
    return ledgerSummaryService.summarizeWorkflowLedger(workflowId)
  }

  async calculateClientDebt(clientId: string): Promise<number> {
    return ledgerSummaryService.summarizeClientDebt(clientId)
  }

  async calculateDashboardSummary(): Promise<FinancialDashboardSummary> {
    return ledgerSummaryService.summarizeOfficeLedger()
  }

  private async recordEvent(data: FinancialEventWithoutClient): Promise<FinancialEvent> {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new AppError({
        code: ErrorCodes.VALIDATION_FAILED,
        message: domainMessages.validation.positiveAmountRequired,
        statusCode: 400,
        context: { amount: data.amount },
      })
    }

    const workflow = await workflowRepository.findById(data.workflow_id)
    if (!workflow) {
      throw new NotFoundError(domainMessages.entities.workflow, data.workflow_id)
    }

    return financialRepository.createEvent({
      ...data,
      client_id: workflow.client_id,
      currency: data.currency || 'EGP',
    })
  }
}

export const financialService = new FinancialService()
