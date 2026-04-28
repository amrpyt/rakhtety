import { supabase } from '@/lib/supabase/client'
import type { Employee, EmployeeWithProfile, UserRole } from '@/types/database.types'

export interface IEmployeeRepository {
  findById(id: string): Promise<Employee | null>
  findByUserId(userId: string): Promise<Employee | null>
  findAll(includeInactive?: boolean): Promise<EmployeeWithProfile[]>
  create(data: CreateEmployeeData): Promise<Employee>
  update(id: string, data: UpdateEmployeeData): Promise<Employee>
  updateStatus(id: string, isActive: boolean): Promise<Employee>
  delete(id: string): Promise<void>
  getWorkflowCount(employeeUserId: string): Promise<number>
}

export interface CreateEmployeeData {
  user_id: string
  position?: string
  is_active?: boolean
}

export interface UpdateEmployeeData {
  position?: string
  is_active?: boolean
}

export class EmployeeRepository implements IEmployeeRepository {
  private readonly table = 'employees'

  async findById(id: string): Promise<Employee | null> {
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

  async findByUserId(userId: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findAll(includeInactive = false): Promise<EmployeeWithProfile[]> {
    let query = supabase
      .from(this.table)
      .select('*, profile:profiles(*)')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async create(data: CreateEmployeeData): Promise<Employee> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert({ ...data, is_active: data.is_active ?? true })
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateEmployeeData): Promise<Employee> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateStatus(id: string, isActive: boolean): Promise<Employee> {
    return this.update(id, { is_active: isActive })
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }

  async getWorkflowCount(employeeUserId: string): Promise<number> {
    const { count, error } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', employeeUserId)

    if (error) throw error
    return count || 0
  }
}

export const employeeRepository = new EmployeeRepository()