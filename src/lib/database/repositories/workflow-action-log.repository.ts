import { supabase } from '@/lib/supabase/client'
import type { WorkflowActionLog, WorkflowActionType } from '@/types/database.types'

export interface CreateWorkflowActionLogData {
  workflow_id: string
  workflow_step_id: string
  action: WorkflowActionType
  reason: string
  actor_id?: string | null
}

export class WorkflowActionLogRepository {
  private readonly table = 'workflow_action_logs'

  async create(data: CreateWorkflowActionLogData): Promise<WorkflowActionLog> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }
}

export const workflowActionLogRepository = new WorkflowActionLogRepository()
