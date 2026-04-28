import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { clientRepository } from '@/lib/database/repositories/client.repository'
import type { Workflow, WorkflowWithSteps, WorkflowStepWithEmployee } from '@/types/database.types'
import { NotFoundError, AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface CreateWorkflowDto {
  client_id: string
  type: 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT'
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

    const existingWorkflows = await workflowRepository.findByClientId(data.client_id)
    if (data.type === 'EXCAVATION_PERMIT') {
      const deviceLicense = existingWorkflows.find((w) => w.type === 'DEVICE_LICENSE')
      if (!deviceLicense || deviceLicense.status !== 'completed') {
        throw new AppError({
          code: ErrorCodes.WORKFLOW_DEPENDENCY_NOT_MET,
          message: 'رخصة الجهاز يجب أن تكتمل أولاً',
          statusCode: 400,
          context: { requiredWorkflow: 'DEVICE_LICENSE' },
        })
      }
    }

    const workflow = await workflowRepository.create(data)

    const steps = await Promise.all(
      stepsData.map((step) =>
        workflowStepRepository.create({
          workflow_id: workflow.id,
          step_order: step.step_order,
          name: step.name,
          assigned_to: step.assigned_to,
          fees: step.fees || 0,
          profit: step.profit || 0,
        })
      )
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

  async checkDependency(clientId: string, workflowType: 'EXCAVATION_PERMIT'): Promise<boolean> {
    const workflows = await workflowRepository.findByClientId(clientId)
    const deviceLicense = workflows.find((w) => w.type === 'DEVICE_LICENSE')
    return deviceLicense?.status === 'completed'
  }
}

export const workflowService = new WorkflowService()