import { supabase } from '@/lib/supabase/client'
import type { Workflow, WorkflowFilter, WorkflowWithSteps } from '@/types/database.types'

export interface IWorkflowRepository {
  findById(id: string): Promise<Workflow | null>
  findByClientId(clientId: string): Promise<Workflow[]>
  findAll(filter?: WorkflowFilter): Promise<Workflow[]>
  create(data: CreateWorkflowData): Promise<Workflow>
  update(id: string, data: UpdateWorkflowData): Promise<Workflow>
  updateStatus(id: string, status: Workflow['status']): Promise<Workflow>
  delete(id: string): Promise<void>
  getWithSteps(id: string): Promise<WorkflowWithSteps | null>
}

export interface CreateWorkflowData {
  client_id: string
  type: Workflow['type']
  assigned_to?: string
}

export interface UpdateWorkflowData {
  assigned_to?: string
  status?: Workflow['status']
}

export class WorkflowRepository implements IWorkflowRepository {
  private readonly table = 'workflows'
  private readonly stepsTable = 'workflow_steps'

  async findById(id: string): Promise<Workflow | null> {
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

  async findByClientId(clientId: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('client_id', clientId)

    if (error) throw error
    return data || []
  }

  async findAll(filter?: WorkflowFilter): Promise<Workflow[]> {
    let query = supabase.from(this.table).select('*')

    if (filter?.client_id) {
      query = query.eq('client_id', filter.client_id)
    }
    if (filter?.type) {
      query = query.eq('type', filter.type)
    }
    if (filter?.status) {
      query = query.eq('status', filter.status)
    }
    if (filter?.assigned_to) {
      query = query.eq('assigned_to', filter.assigned_to)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async create(data: CreateWorkflowData): Promise<Workflow> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateWorkflowData): Promise<Workflow> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateStatus(id: string, status: Workflow['status']): Promise<Workflow> {
    return this.update(id, { status })
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }

  async getWithSteps(id: string): Promise<WorkflowWithSteps | null> {
    const workflow = await this.findById(id)
    if (!workflow) return null

    const { data: steps, error } = await supabase
      .from(this.stepsTable)
      .select('*, assigned_employee:profiles(full_name)')
      .eq('workflow_id', id)
      .order('step_order')

    if (error) throw error

    return {
      ...workflow,
      steps: steps || [],
    }
  }
}

export const workflowRepository = new WorkflowRepository()
