import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { clientRepository } from '@/lib/database/repositories/client.repository'
import { documentService } from '@/lib/services/document.service'
import type {
  StepStatus,
  Workflow,
  WorkflowStepWithEmployee,
  WorkflowType,
  WorkflowWithSteps,
} from '@/types/database.types'
import { NotFoundError, AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface CreateWorkflowDto {
  client_id: string
  type: WorkflowType
  assigned_to?: string
}

export interface CreateWorkflowStepsDto {
  workflow_id: string
  steps: Array<{
    step_order: number
    name: string
    assigned_to?: string
    fees?: number
    profit?: number
  }>
}

export interface WorkflowDependencyStatus {
  isBlocked: boolean
  reason?: string
  blockingWorkflow?: WorkflowType
  blockingWorkflowStatus?: Workflow['status']
}

export class WorkflowService {
  async findById(id: string): Promise<Workflow | null> {
    return workflowRepository.findById(id)
  }

  async findByClientId(clientId: string): Promise<Workflow[]> {
    return workflowRepository.findByClientId(clientId)
  }

  async getWithSteps(id: string): Promise<WorkflowWithSteps> {
    const workflow = await workflowRepository.getWithSteps(id)
    if (!workflow) {
      throw new NotFoundError('المسار', id)
    }
    return workflow
  }

  async createWithSteps(data: CreateWorkflowDto, stepsData: CreateWorkflowStepsDto['steps']): Promise<WorkflowWithSteps> {
    const existingClient = await clientRepository.findById(data.client_id)
    if (!existingClient) {
      throw new NotFoundError('العميل', data.client_id)
    }

    if (data.type === 'EXCAVATION_PERMIT') {
      const dependencyStatus = await this.checkDependency(data.client_id)
      if (dependencyStatus.isBlocked) {
        throw new AppError({
          code: ErrorCodes.WORKFLOW_DEPENDENCY_NOT_MET,
          message: dependencyStatus.reason || 'رخصة الجهاز يجب أن تكتمل أولاً',
          statusCode: 400,
          context: {
            requiredWorkflow: dependencyStatus.blockingWorkflow,
            currentStatus: dependencyStatus.blockingWorkflowStatus,
          },
        })
      }
    }

    const workflow = await workflowRepository.create(data)

    const steps = await Promise.all(
      stepsData.map((step) => this.createStepWithConfig(workflow.type, workflow.id, step))
    )

    return {
      ...workflow,
      steps,
    }
  }

  async updateStatus(id: string, status: Workflow['status']): Promise<Workflow> {
    const workflow = await workflowRepository.findById(id)
    if (!workflow) {
      throw new NotFoundError('المسار', id)
    }
    return workflowRepository.updateStatus(id, status)
  }

  async updateStepStatus(
    stepId: string,
    status: Extract<StepStatus, 'in_progress' | 'completed'>
  ): Promise<WorkflowStepWithEmployee> {
    const step = await workflowStepRepository.findById(stepId)
    if (!step) {
      throw new NotFoundError('الخطوة', stepId)
    }

    if (status === 'completed' && step.status !== 'in_progress') {
      throw new AppError({
        code: ErrorCodes.WORKFLOW_STEP_INVALID_TRANSITION,
        message: 'لا يمكن إكمال خطوة لم تبدأ بعد',
        statusCode: 400,
        context: { stepId, currentStatus: step.status, attemptedStatus: status },
      })
    }

    if (status === 'completed') {
      await documentService.assertStepCanComplete(stepId)
    }

    const completedAt = status === 'completed' ? new Date().toISOString() : undefined
    const updatedStep = await workflowStepRepository.updateStatus(stepId, status, completedAt)
    await this.syncWorkflowStatusAfterStepUpdate(updatedStep.workflow_id)

    const workflowSteps = await workflowStepRepository.findByWorkflowId(updatedStep.workflow_id)
    return workflowSteps.find((workflowStep) => workflowStep.id === updatedStep.id) || updatedStep
  }

  async checkDependency(clientId: string): Promise<WorkflowDependencyStatus> {
    const workflows = await workflowRepository.findByClientId(clientId)
    const deviceLicense = workflows.find((workflow) => workflow.type === 'DEVICE_LICENSE')

    if (!deviceLicense) {
      return {
        isBlocked: true,
        reason: 'رخصة الجهاز غير موجودة — يجب إنشاء رخصة الجهاز أولاً',
        blockingWorkflow: 'DEVICE_LICENSE',
      }
    }

    if (deviceLicense.status !== 'completed') {
      const statusText: Record<Workflow['status'], string> = {
        pending: 'في الانتظار',
        in_progress: 'جاري التنفيذ',
        completed: 'مكتملة',
        blocked: 'محظورة',
      }

      return {
        isBlocked: true,
        reason: `رخصة الجهاز ${statusText[deviceLicense.status]} — يجب اكتمالها أولاً`,
        blockingWorkflow: 'DEVICE_LICENSE',
        blockingWorkflowStatus: deviceLicense.status,
      }
    }

    return { isBlocked: false }
  }

  async getStepsWithDependencyStatus(clientId: string, workflowType: WorkflowType): Promise<{
    steps: WorkflowStepWithEmployee[]
    isBlocked: boolean
    reason?: string
  }> {
    if (workflowType === 'EXCAVATION_PERMIT') {
      const dependencyStatus = await this.checkDependency(clientId)
      if (dependencyStatus.isBlocked) {
        return {
          steps: [],
          isBlocked: true,
          reason: dependencyStatus.reason,
        }
      }
    }

    const workflows = await workflowRepository.findByClientId(clientId)
    const workflow = workflows.find((item) => item.type === workflowType)
    if (!workflow) {
      return { steps: [], isBlocked: false }
    }

    return {
      steps: await workflowStepRepository.findByWorkflowId(workflow.id),
      isBlocked: false,
    }
  }

  private async createStepWithConfig(
    workflowType: WorkflowType,
    workflowId: string,
    step: CreateWorkflowStepsDto['steps'][number]
  ): Promise<WorkflowStepWithEmployee> {
    const config = await workflowStepRepository.findConfig(workflowType, step.name)

    return workflowStepRepository.create({
      workflow_id: workflowId,
      step_order: step.step_order,
      name: step.name,
      assigned_to: step.assigned_to,
      fees: step.fees ?? config?.government_fee ?? 0,
      profit: step.profit ?? config?.office_profit ?? 0,
    })
  }

  private async syncWorkflowStatusAfterStepUpdate(workflowId: string): Promise<void> {
    const workflow = await workflowRepository.findById(workflowId)
    if (!workflow) return

    const steps = await workflowStepRepository.findByWorkflowId(workflowId)
    if (steps.length === 0) return

    const nextStatus: Workflow['status'] = steps.every((step) => step.status === 'completed')
      ? 'completed'
      : steps.some((step) => step.status === 'in_progress' || step.status === 'completed')
      ? 'in_progress'
      : workflow.status

    if (nextStatus !== workflow.status) {
      await workflowRepository.updateStatus(workflowId, nextStatus)
    }
  }
}

export const workflowService = new WorkflowService()
