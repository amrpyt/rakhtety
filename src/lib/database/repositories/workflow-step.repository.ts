import { supabase } from '@/lib/supabase/client'
import type { WorkflowStep, WorkflowStepConfig, WorkflowStepWithEmployee, StepStatus, WorkflowType } from '@/types/database.types'
import { ErrorCodes } from '@/types/error-codes.enum'
import { AppError } from '@/lib/errors/app-error.class'

export interface IWorkflowStepRepository {
  findById(id: string): Promise<WorkflowStep | null>
  findByWorkflowId(workflowId: string): Promise<WorkflowStepWithEmployee[]>
  create(data: CreateWorkflowStepData): Promise<WorkflowStep>
  update(id: string, data: UpdateWorkflowStepData): Promise<WorkflowStep>
  updateStatus(id: string, status: StepStatus, completedAt?: string): Promise<WorkflowStep>
  findConfig(workflowType: WorkflowType, stepName: string): Promise<WorkflowStepConfig | null>
  validateTransition(currentStatus: StepStatus, newStatus: StepStatus): boolean
  delete(id: string): Promise<void>
}

export interface CreateWorkflowStepData {
  workflow_id: string
  step_order: number
  name: string
  assigned_to?: string
  fees?: number
  profit?: number
}

export interface UpdateWorkflowStepData {
  name?: string
  assigned_to?: string
  fees?: number
  profit?: number
}

const VALID_TRANSITIONS: Record<StepStatus, StepStatus[]> = {
  pending: ['in_progress'],
  in_progress: ['completed', 'blocked'],
  blocked: ['in_progress'],
  completed: [],
}

export class WorkflowStepRepository implements IWorkflowStepRepository {
  private readonly table = 'workflow_steps'
  private readonly configTable = 'workflow_step_configs'

  validateTransition(currentStatus: StepStatus, newStatus: StepStatus): boolean {
    if (currentStatus === newStatus) {
      return true
    }

    return VALID_TRANSITIONS[currentStatus].includes(newStatus)
  }

  async findById(id: string): Promise<WorkflowStep | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowStepWithEmployee[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, assigned_employee:profiles(full_name)')
      .eq('workflow_id', workflowId)
      .order('step_order')

    if (error) throw error
    return data || []
  }

  async create(data: CreateWorkflowStepData): Promise<WorkflowStep> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateWorkflowStepData): Promise<WorkflowStep> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateStatus(id: string, status: StepStatus, completedAt?: string): Promise<WorkflowStep> {
    const currentStep = await this.findById(id)
    if (!currentStep) {
      throw new AppError({
        code: ErrorCodes.WORKFLOW_STEP_NOT_FOUND,
        message: 'الخطوة غير موجودة',
        statusCode: 404,
        context: { stepId: id },
      })
    }

    if (!this.validateTransition(currentStep.status, status)) {
      throw new AppError({
        code: ErrorCodes.WORKFLOW_STEP_INVALID_TRANSITION,
        message: this.getTransitionErrorMessage(currentStep.status, status),
        statusCode: 400,
        context: {
          currentStatus: currentStep.status,
          attemptedStatus: status,
          stepId: id,
        },
      })
    }

    const updateData: Partial<WorkflowStep> = { status }
    if (completedAt) {
      updateData.completed_at = completedAt
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.message?.includes('Invalid transition')) {
        throw new AppError({
          code: ErrorCodes.WORKFLOW_STEP_INVALID_TRANSITION,
          message: this.getTransitionErrorMessage(currentStep.status, status),
          statusCode: 400,
          context: {
            currentStatus: currentStep.status,
            attemptedStatus: status,
            stepId: id,
          },
        })
      }

      throw error
    }

    return data
  }

  async findConfig(workflowType: WorkflowType, stepName: string): Promise<WorkflowStepConfig | null> {
    const { data, error } = await supabase
      .from(this.configTable)
      .select('*')
      .eq('workflow_type', workflowType)
      .eq('step_name', stepName)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    return data || null
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }

  private getTransitionErrorMessage(currentStatus: StepStatus, newStatus: StepStatus): string {
    const messages: Partial<Record<`${StepStatus}->${StepStatus}`, string>> = {
      'pending->completed': 'يجب بدء الخطوة أولاً قبل إكمالها',
      'pending->blocked': 'لا يمكن إيقاف خطوة لم تبدأ بعد',
      'blocked->completed': 'يجب فتح الخطوة أولاً قبل إكمالها',
      'blocked->pending': 'لا يمكن إرجاع الخطوة المحظورة إلى الانتظار',
      'completed->pending': 'لا يمكن إعادة خطوة مكتملة إلى الانتظار',
      'completed->in_progress': 'لا يمكن تعديل خطوة مكتملة',
      'completed->blocked': 'لا يمكن إيقاف خطوة مكتملة',
    }

    return messages[`${currentStatus}->${newStatus}`] || `لا يمكن الانتقال من ${currentStatus} إلى ${newStatus}`
  }
}

export const workflowStepRepository = new WorkflowStepRepository()
