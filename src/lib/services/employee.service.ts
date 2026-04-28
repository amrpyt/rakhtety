import { employeeRepository } from '@/lib/database/repositories/employee.repository'
import { supabase } from '@/lib/supabase/client'
import type { Employee, EmployeeWithProfile, UserRole } from '@/types/database.types'
import { NotFoundError, AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface CreateEmployeeDto {
  email: string
  password: string
  full_name: string
  phone?: string
  role: UserRole
  position?: string
}

export interface UpdateEmployeeDto {
  full_name?: string
  phone?: string
  role?: UserRole
  position?: string
  is_active?: boolean
}

export class EmployeeService {
  async findById(id: string): Promise<EmployeeWithProfile> {
    const employees = await employeeRepository.findAll()
    const employee = employees.find((e) => e.id === id)
    if (!employee) {
      throw new NotFoundError('الموظف', id)
    }
    return employee
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    return employeeRepository.findByUserId(userId)
  }

  async findAll(includeInactive = false): Promise<EmployeeWithProfile[]> {
    return employeeRepository.findAll(includeInactive)
  }

  async create(data: CreateEmployeeDto): Promise<EmployeeWithProfile> {
    const existingEmail = await this.checkEmailExists(data.email)
    if (existingEmail) {
      throw new AppError({
        code: ErrorCodes.DUPLICATE_ENTRY,
        message: 'البريد الإلكتروني مستخدم بالفعل',
        statusCode: 409,
        context: { field: 'email' },
      })
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: data.role,
      },
    })

    if (authError || !authData.user) {
      throw AppError.fromError(authError || new Error('Failed to create auth user'), ErrorCodes.AUTH_INVALID_CREDENTIALS)
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    })

    if (profileError) {
      throw AppError.fromError(profileError, ErrorCodes.DB_CONSTRAINT_VIOLATION)
    }

    const employee = await employeeRepository.create({
      user_id: authData.user.id,
      position: data.position,
      is_active: true,
    })

    const employees = await employeeRepository.findAll()
    return employees.find((e) => e.id === employee.id)!
  }

  async update(id: string, data: UpdateEmployeeDto): Promise<EmployeeWithProfile> {
    const existing = await this.findById(id)

    if (data.full_name || data.phone || data.role) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          role: data.role,
        })
        .eq('id', existing.user_id)

      if (error) {
        throw AppError.fromError(error, ErrorCodes.DB_CONSTRAINT_VIOLATION)
      }
    }

    if (data.position !== undefined || data.is_active !== undefined) {
      await employeeRepository.update(id, {
        position: data.position,
        is_active: data.is_active,
      })
    }

    return this.findById(id)
  }

  async deactivate(id: string): Promise<EmployeeWithProfile> {
    return this.update(id, { is_active: false })
  }

  async reactivate(id: string): Promise<EmployeeWithProfile> {
    return this.update(id, { is_active: true })
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id)
    const workflowCount = await employeeRepository.getWorkflowCount(existing.user_id)

    if (workflowCount > 0) {
      throw new AppError({
        code: ErrorCodes.OPERATION_NOT_ALLOWED,
        message: `لا يمكن حذف الموظف لأنه يملك ${workflowCount} مسارات عمل نشطة. يرجى نقل المسارات أولاً.`,
        statusCode: 400,
        context: { workflowCount },
      })
    }

    await employeeRepository.delete(id)

    await supabase.auth.admin.deleteUser(existing.user_id)
  }

  async getWorkflowStats(userId: string): Promise<{ active: number; completed: number; blocked: number }> {
    const { count: active } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .neq('status', 'completed')

    const { count: completed } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('status', 'completed')

    const { count: blocked } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', userId)
      .eq('status', 'blocked')

    return {
      active: active || 0,
      completed: completed || 0,
      blocked: blocked || 0,
    }
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    const { data } = await supabase.from('profiles').select('id').eq('email', email).single()
    return !!data
  }
}

export const employeeService = new EmployeeService()