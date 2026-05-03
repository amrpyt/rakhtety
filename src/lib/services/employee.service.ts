import { directoryClient } from '@/lib/client-data/directory-client'
import type { Employee, EmployeeWithProfile } from '@/types/database.types'
import type { CreateEmployeeDto, UpdateEmployeeDto } from '@/types/directory.types'

export type { CreateEmployeeDto, UpdateEmployeeDto }

export const employeeService = {
  async findById(id: string): Promise<EmployeeWithProfile> {
    const employees = await directoryClient.listEmployees()
    const employee = employees.find((item) => item.id === id)
    if (!employee) throw new Error('الموظف غير موجود')
    return employee
  },

  async findByUserId(userId: string): Promise<Employee | null> {
    const employees = await directoryClient.listEmployees()
    return employees.find((item) => item.user_id === userId) || null
  },

  findAll(): Promise<EmployeeWithProfile[]> {
    return directoryClient.listEmployees()
  },

  create(data: CreateEmployeeDto): Promise<EmployeeWithProfile> {
    return directoryClient.createEmployee(data)
  },

  update(id: string, data: UpdateEmployeeDto): Promise<EmployeeWithProfile> {
    return directoryClient.updateEmployee(id, data)
  },

  deactivate(id: string): Promise<EmployeeWithProfile> {
    return directoryClient.updateEmployee(id, { is_active: false })
  },

  reactivate(id: string): Promise<EmployeeWithProfile> {
    return directoryClient.updateEmployee(id, { is_active: true })
  },

  delete(id: string): Promise<void> {
    return directoryClient.deleteEmployee(id)
  },

  async getWorkflowStats(userId: string): Promise<{ active: number; completed: number; blocked: number }> {
    void userId
    return { active: 0, completed: 0, blocked: 0 }
  },
}
