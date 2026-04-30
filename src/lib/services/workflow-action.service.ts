import { workflowActionLogRepository } from '@/lib/database/repositories/workflow-action-log.repository'
import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { documentService } from '@/lib/services/document.service'
import { can } from '@/lib/auth/permissions'
import { AppError, NotFoundError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'
import { domainMessages } from '@/lib/domain/messages'
import type {
  StepStatus,
  WorkflowActionType,
  WorkflowStepWithEmployee,
} from '@/types/database.types'

export type WorkflowStepAction = 'start' | 'complete' | 'emergency_complete' | 'move_back'

export interface ApplyWorkflowStepActionInput {
  stepId: string
  action: WorkflowStepAction
  reason?: string
  actorId?: string | null
}

interface SupabaseErrorLike {
  code?: string
  message?: string
}

class WorkflowActionService {
  async apply(input: ApplyWorkflowStepActionInput): Promise<WorkflowStepWithEmployee> {
    const step = await this.getStep(input.stepId)

    if (input.action === 'start') {
      return this.updateAndReload(step.id, 'in_progress')
    }

    if (input.action === 'complete') {
      this.assertCompletable(step, 'complete')
      await documentService.assertStepCanComplete(step.id)
      return this.updateAndReload(step.id, 'completed', new Date().toISOString())
    }

    if (input.action === 'emergency_complete') {
      this.assertReason(input.reason, domainMessages.validation.emergencyReasonRequired, step.id, input.actorId)
      await this.assertActorCanOverride(input.actorId)
      this.assertCompletable(step, 'emergency_complete')
      await this.assertDocumentsBestEffort(step.id)
      const updatedStep = await this.updateAndReload(step.id, 'completed', new Date().toISOString())
      await this.logBestEffort(updatedStep, 'emergency_complete', input.reason!, input.actorId)
      return updatedStep
    }

    this.assertReason(input.reason, domainMessages.validation.moveBackReasonRequired, step.id, input.actorId)
    await this.assertActorCanOverride(input.actorId)
    const previousStatus: Partial<Record<StepStatus, StepStatus>> = {
      completed: 'in_progress',
      in_progress: 'pending',
    }
    const nextStatus = previousStatus[step.status]

    if (!nextStatus) {
      throw new AppError({
        code: ErrorCodes.WORKFLOW_STEP_INVALID_TRANSITION,
        message: domainMessages.workflow.invalidMoveBack,
        statusCode: 400,
        context: { stepId: step.id, currentStatus: step.status },
      })
    }

    const updatedStep = await this.updateAndReload(step.id, nextStatus, null)
    await this.logBestEffort(updatedStep, 'move_back', input.reason!, input.actorId)
    return updatedStep
  }

  private async getStep(stepId: string): Promise<WorkflowStepWithEmployee> {
    const step = await workflowStepRepository.findById(stepId)
    if (!step) {
      throw new NotFoundError(domainMessages.entities.workflowStep, stepId)
    }
    return step
  }

  private assertCompletable(step: WorkflowStepWithEmployee, action: WorkflowStepAction): void {
    if (step.status === 'in_progress') return

    throw new AppError({
      code: ErrorCodes.WORKFLOW_STEP_INVALID_TRANSITION,
      message:
        action === 'emergency_complete'
          ? domainMessages.workflow.stepMustStartBeforeEmergencyComplete
          : domainMessages.workflow.stepMustStartBeforeComplete,
      statusCode: 400,
      context: { stepId: step.id, currentStatus: step.status, attemptedAction: action },
    })
  }

  private assertReason(reason: string | undefined, message: string, stepId: string, actorId?: string | null): void {
    if (reason?.trim()) return

    throw new AppError({
      code: ErrorCodes.VALIDATION_FAILED,
      message,
      statusCode: 400,
      context: { stepId, actorId: actorId || null },
    })
  }

  private async assertDocumentsBestEffort(stepId: string): Promise<void> {
    try {
      await documentService.assertStepCanComplete(stepId)
    } catch (error) {
      if (!(error instanceof AppError) || error.code !== ErrorCodes.WORKFLOW_DOCUMENTS_MISSING) {
        throw error
      }
    }
  }

  private async assertActorCanOverride(actorId?: string | null): Promise<void> {
    if (!actorId) {
      throw new AppError({
        code: ErrorCodes.OPERATION_NOT_ALLOWED,
        message: 'هذا الإجراء متاح للمدير فقط.',
        statusCode: 403,
      })
    }

    const { supabase } = await import('@/lib/supabase/client')
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', actorId)
      .maybeSingle()

    if (error) throw error

    if (!can(profile?.role, 'emergencyOverride')) {
      throw new AppError({
        code: ErrorCodes.OPERATION_NOT_ALLOWED,
        message: 'هذا الإجراء متاح للمدير فقط.',
        statusCode: 403,
        context: { actorId },
      })
    }
  }

  private async updateAndReload(
    stepId: string,
    status: StepStatus,
    completedAt?: string | null
  ): Promise<WorkflowStepWithEmployee> {
    const updatedStep = await workflowStepRepository.updateStatus(stepId, status, completedAt)
    await this.syncWorkflowStatus(updatedStep.workflow_id)

    const workflowSteps = await workflowStepRepository.findByWorkflowId(updatedStep.workflow_id)
    return workflowSteps.find((workflowStep) => workflowStep.id === updatedStep.id) || updatedStep
  }

  private async syncWorkflowStatus(workflowId: string): Promise<void> {
    const workflow = await workflowRepository.findById(workflowId)
    if (!workflow) return

    const steps = await workflowStepRepository.findByWorkflowId(workflowId)
    if (steps.length === 0) return

    const nextStatus = steps.every((step) => step.status === 'completed')
      ? 'completed'
      : steps.some((step) => step.status === 'in_progress' || step.status === 'completed')
      ? 'in_progress'
      : workflow.status

    if (nextStatus !== workflow.status) {
      await workflowRepository.updateStatus(workflowId, nextStatus)
    }
  }

  private async logBestEffort(
    step: WorkflowStepWithEmployee,
    action: WorkflowActionType,
    reason: string,
    actorId?: string | null
  ): Promise<void> {
    try {
      await workflowActionLogRepository.create({
        workflow_id: step.workflow_id,
        workflow_step_id: step.id,
        action,
        reason: reason.trim(),
        actor_id: actorId || null,
      })
    } catch (error) {
      const supabaseError = error as SupabaseErrorLike
      if (supabaseError.code === 'PGRST205') {
        console.warn('workflow_action_logs table is missing; skipping audit log until migration 009 is applied')
        return
      }

      throw error
    }
  }
}

export const workflowActionService = new WorkflowActionService()
