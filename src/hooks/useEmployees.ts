import { useState, useCallback, useEffect } from 'react'
import { employeeService, CreateEmployeeDto, UpdateEmployeeDto } from '@/lib/services/employee.service'
import { directoryClient } from '@/lib/client-data/directory-client'
import type { EmployeeWithProfile } from '@/types/database.types'

interface UseEmployeesReturn {
  employees: EmployeeWithProfile[]
  loading: boolean
  error: string | null
  fetchEmployees: () => Promise<void>
  createEmployee: (data: CreateEmployeeDto) => Promise<EmployeeWithProfile>
  updateEmployee: (id: string, data: UpdateEmployeeDto) => Promise<EmployeeWithProfile>
  deleteEmployee: (id: string) => Promise<void>
  deactivateEmployee: (id: string) => Promise<EmployeeWithProfile>
  reactivateEmployee: (id: string) => Promise<EmployeeWithProfile>
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<EmployeeWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEmployees(await directoryClient.listEmployees())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchEmployees()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [fetchEmployees])

  const createEmployee = useCallback(
    async (data: CreateEmployeeDto) => {
      const newEmployee = await directoryClient.createEmployee(data)
      setEmployees((prev) => [newEmployee, ...prev])
      return newEmployee
    },
    []
  )

  const updateEmployee = useCallback(
    async (id: string, data: UpdateEmployeeDto) => {
      const updated = await employeeService.update(id, data)
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
    },
    []
  )

  const deleteEmployee = useCallback(
    async (id: string) => {
      await employeeService.delete(id)
      setEmployees((prev) => prev.filter((e) => e.id !== id))
    },
    []
  )

  const deactivateEmployee = useCallback(
    async (id: string) => {
      const updated = await employeeService.deactivate(id)
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
    },
    []
  )

  const reactivateEmployee = useCallback(
    async (id: string) => {
      const updated = await employeeService.reactivate(id)
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)))
      return updated
    },
    []
  )

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    deactivateEmployee,
    reactivateEmployee,
  }
}
