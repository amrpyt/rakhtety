import { supabase } from '@/lib/supabase/client'
import type { WorkflowStep, WorkflowStepWithEmployee, StepStatus } from '@/types/database.types'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface IWorkflowStepRepository {
  findById(id: string): Promise<WorkflowStep | null>
  findByWorkflowId(workflowId: string): Promise<WorkflowStepWithEmployee[]>
  create(data: CreateWorkflowStepData): Promise<WorkflowStep>
  update(id: string, data: UpdateWorkflowStepData): Promise<WorkflowStep>
  updateStatus(id: string, status: StepStatus, completedAt?: string): Promise<WorkflowStep>
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

export class WorkflowStepRepository implements IWorkflowStepRepository {
  private readonly table = 'workflow_steps'

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

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }
}

export const workflowStepRepository = new WorkflowStepRepository()