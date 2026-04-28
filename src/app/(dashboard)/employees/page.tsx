'use client'

import React, { useState, useCallback } from 'react'
import { useEmployees } from '@/hooks/useEmployees'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/Dialog'
import { EmployeeForm } from '@/components/employees/EmployeeForm'
import { EmployeeList } from '@/components/employees/EmployeeList'
import type { EmployeeWithProfile } from '@/types/database.types'
import type { CreateEmployeeDto, UpdateEmployeeDto } from '@/lib/services/employee.service'

export default function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    deactivateEmployee,
    reactivateEmployee,
  } = useEmployees()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProfile | null>(null)

  const handleAdd = useCallback(() => {
    setSelectedEmployee(null)
    setShowAddDialog(true)
  }, [])

  const handleEdit = useCallback((employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee)
    setShowEditDialog(true)
  }, [])

  const handleDelete = useCallback((employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee)
    setShowDeleteDialog(true)
  }, [])

  const handleToggleActive = useCallback(
    async (employee: EmployeeWithProfile) => {
      if (employee.is_active) {
        await deactivateEmployee(employee.id)
      } else {
        await reactivateEmployee(employee.id)
      }
    },
    [deactivateEmployee, reactivateEmployee]
  )

  const handleAddSubmit = useCallback(
    async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
      await createEmployee(data as CreateEmployeeDto)
      setShowAddDialog(false)
    },
    [createEmployee]
  )

  const handleEditSubmit = useCallback(
    async (data: CreateEmployeeDto | UpdateEmployeeDto) => {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, data as UpdateEmployeeDto)
        setShowEditDialog(false)
        setSelectedEmployee(null)
      }
    },
    [selectedEmployee, updateEmployee]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (selectedEmployee) {
      try {
        await deleteEmployee(selectedEmployee.id)
        setShowDeleteDialog(false)
        setSelectedEmployee(null)
      } catch (err) {
        // Error handled by hook
      }
    }
  }, [selectedEmployee, deleteEmployee])

  return (
    <div className="p-6 max-w-[1300px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">إدارة الموظفين</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {employees.length} موظف
          </p>
        </div>
        <Button onClick={handleAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة موظف
        </Button>
      </div>

      <EmployeeList
        employees={employees}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onAdd={handleAdd}
      />

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
            <DialogDescription>أدخل بيانات الموظف الجديد. سيتم إرسال كلمة مرور مؤقتة إلى بريده الإلكتروني.</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            mode="create"
            onSubmit={handleAddSubmit}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات الموظف</DialogTitle>
            <DialogDescription>قم بتعديل بيانات الموظف {selectedEmployee?.profile.full_name}</DialogDescription>
          </DialogHeader>
          <EmployeeForm
            mode="edit"
            initialData={selectedEmployee || undefined}
            onSubmit={handleEditSubmit}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الموظف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الموظف <strong>{selectedEmployee?.profile.full_name}</strong>؟
              لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
