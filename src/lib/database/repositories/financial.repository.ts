import { supabase } from '@/lib/supabase/client'
import type { FinancialEvent, FinancialEventType } from '@/types/database.types'

export interface CreateFinancialEventData {
  workflow_id: string
  workflow_step_id?: string | null
  client_id: string
  type: FinancialEventType
  amount: number
  currency?: string
  payment_method?: string | null
  reference_number?: string | null
  notes?: string | null
  created_by?: string | null
}

export interface IFinancialRepository {
  createEvent(data: CreateFinancialEventData): Promise<FinancialEvent>
  findByWorkflowId(workflowId: string): Promise<FinancialEvent[]>
  findByClientId(clientId: string): Promise<FinancialEvent[]>
  findAll(): Promise<FinancialEvent[]>
}

export class FinancialRepository implements IFinancialRepository {
  private readonly table = 'financial_events'

  async createEvent(data: CreateFinancialEventData): Promise<FinancialEvent> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert({
        ...data,
        currency: data.currency || 'EGP',
        workflow_step_id: data.workflow_step_id || null,
      })
      .select()
      .single()

    if (error) throw error
    return result
  }

  async findByWorkflowId(workflowId: string): Promise<FinancialEvent[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findByClientId(clientId: string): Promise<FinancialEvent[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findAll(): Promise<FinancialEvent[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

export const financialRepository = new FinancialRepository()
