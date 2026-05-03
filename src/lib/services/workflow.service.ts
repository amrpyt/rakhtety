import { clientRepository } from '@/lib/database/repositories/client.repository'
import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { domainMessages, getBlockedExcavationReason } from '@/lib/domain/messages'
import { getWorkflowStepTemplates } from '@/lib/domain/workflow-templates'
import { AppError, NotFoundError } from '@/lib/errors/app-error.class'
import { workflowActionService } from '@/lib/services/workflow-action.service'
import { ErrorCodes } from '@/types/error-codes.enum'
import type {
  StepStatus,
  Workflow,
  WorkflowStepWithEmployee,
  WorkflowType,
  WorkflowWithSteps,
} from '@/types/database.types'

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

export interface EmergencyStepActionInput {
  reason: string
  actorId?: string | null
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
      throw new NotFoundError(domainMessages.entities.workflow, id)
    }
    return workflow
  }

  async createWithSteps(data: CreateWorkflowDto, stepsData: CreateWorkflowStepsDto['steps']): Promise<WorkflowWithSteps> {
    const existingClient = await clientRepository.findById(data.client_id)
    if (!existingClient) {
      throw new NotFoundError(domainMessages.entities.client, data.client_id)
    }

    if (data.type === 'EXCAVATION_PERMIT') {
      const dependencyStatus = await this.checkDependency(data.client_id)
      if (dependencyStatus.isBlocked) {
        throw new AppError({
          code: ErrorCodes.WORKFLOW_DEPENDENCY_NOT_MET,
          message: dependencyStatus.reason || domainMessages.workflow.deviceLicenseMustComplete,
          statusCode: 400,
          context: {
            requiredWorkflow: dependencyStatus.blockingWorkflow,
            currentStatus: dependencyStatus.blockingWorkflowStatus,
          },
        })
      }
    }

    const workflow = await workflowRepository.create(data)
    const requestedSteps = stepsData.length
      ? stepsData
      : getWorkflowStepTemplates(workflow.type).map((step, index) => ({
          step_order: index + 1,
          name: step.name,
          fees: step.fees,
          profit: step.profit,
          assigned_to: data.assigned_to,
        }))

    const steps = await Promise.all(
      requestedSteps.map((step) => this.createStepWithConfig(workflow.type, workflow.id, step))
    )

    return {
      ...workflow,
      steps,
    }
  }

  async updateStatus(id: string, status: Workflow['status']): Promise<Workflow> {
    const workflow = await workflowRepository.findById(id)
    if (!workflow) {
      throw new NotFoundError(domainMessages.entities.workflow, id)
    }
    return workflowRepository.updateStatus(id, status)
  }

  async updateStepStatus(
    stepId: string,
    status: Extract<StepStatus, 'in_progress' | 'completed'>
  ): Promise<WorkflowStepWithEmployee> {
    return workflowActionService.apply({
      stepId,
      action: status === 'in_progress' ? 'start' : 'complete',
    })
  }

  async emergencyCompleteStep(
    stepId: string,
    input: EmergencyStepActionInput
  ): Promise<WorkflowStepWithEmployee> {
    return workflowActionService.apply({
      stepId,
      action: 'emergency_complete',
      reason: input.reason,
      actorId: input.actorId,
    })
  }

  async moveStepBack(
    stepId: string,
    input: EmergencyStepActionInput
  ): Promise<WorkflowStepWithEmployee> {
    return workflowActionService.apply({
      stepId,
      action: 'move_back',
      reason: input.reason,
      actorId: input.actorId,
    })
  }

  async checkDependency(clientId: string): Promise<WorkflowDependencyStatus> {
    const workflows = await workflowRepository.findByClientId(clientId)
    const deviceLicense = workflows.find((workflow) => workflow.type === 'DEVICE_LICENSE')

    if (!deviceLicense) {
      return {
        isBlocked: true,
        reason: domainMessages.workflow.deviceLicenseMissing,
        blockingWorkflow: 'DEVICE_LICENSE',
      }
    }

    if (deviceLicense.status !== 'completed') {
      return {
        isBlocked: true,
        reason: getBlockedExcavationReason(deviceLicense.status),
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
}

export const workflowService = new WorkflowService()
