import { supabase } from '@/lib/supabase/client'
import type { DashboardAlert, DashboardAlertStatus } from '@/types/database.types'

export interface CreateDashboardAlertData {
  workflow_id: string
  workflow_step_id?: string | null
  recipient_id: string
  created_by?: string | null
  type?: string
  message: string
}

export interface IDashboardAlertRepository {
  create(data: CreateDashboardAlertData): Promise<DashboardAlert>
  findByRecipient(recipientId: string, status?: DashboardAlertStatus): Promise<DashboardAlert[]>
  markRead(id: string): Promise<DashboardAlert>
}

export class DashboardAlertRepository implements IDashboardAlertRepository {
  private readonly table = 'dashboard_alerts'

  async create(data: CreateDashboardAlertData): Promise<DashboardAlert> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert({
        ...data,
        workflow_step_id: data.workflow_step_id || null,
        type: data.type || 'bottleneck',
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  async findByRecipient(recipientId: string, status?: DashboardAlertStatus): Promise<DashboardAlert[]> {
    let query = supabase
      .from(this.table)
      .select('*')
      .eq('recipient_id', recipientId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async markRead(id: string): Promise<DashboardAlert> {
    const { data, error } = await supabase
      .from(this.table)
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const dashboardAlertRepository = new DashboardAlertRepository()
