---
phase: 1
plan: P-04
type: execute
wave: 2
depends_on:
  - P-01
files_modified:
  - src/app/(dashboard)/employees/page.tsx
  - src/components/ui/Avatar.tsx
autonomous: false
requirements:
  - EMP-01
  - EMP-02
---

<objective>
Implement employee management UI with CRUD operations and workflow assignment capabilities. Display employee cards with role, position, workload stats, and status badges. Admins can add/edit/delete employees.
</objective>

<read_first>
- rakhtety-erp-demo.html (employees section: ~1251-1283)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-07: role-based RLS policies)
- .planning/phases/01-core-foundation/01-RESEARCH.md (employees table schema, RLS policies)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Component Inventory: Avatar, Badge)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - src/components/ui/Avatar.tsx
</files>
<action>
Create Avatar component:

```tsx
import React from 'react'

interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
}

export function Avatar({ initials, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full
        flex items-center justify-center
        font-bold text-white
        flex-shrink-0
        ${className}
      `.trim()}
      style={{ background: 'var(--color-primary)' }}
    >
      {initials.slice(0, 2)}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Avatar.tsx
grep -q "Avatar" src/components/ui/Avatar.tsx
grep -q "rounded-full" src/components/ui/Avatar.tsx
```
</verify>
<acceptance_criteria>
- Avatar shows user initials
- Supports sm, md, lg sizes
- Uses primary color background
- Rounded-full for circular shape
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(dashboard)/employees/page.tsx
</files>
<action>
Create employees management page:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { FormGroup, Label, Input } from '@/components/ui/Form'

interface Employee {
  id: string
  user_id: string
  position: string
  is_active: boolean
  profile: {
    full_name: string
    role: 'admin' | 'employee' | 'manager'
    phone: string
  }
  assigned_workflows_count?: number
}

const roleLabels: Record<string, { label: string; variant: 'default' | 'in_progress' | 'completed' }> = {
  admin: { label: 'مدير', variant: 'completed' },
  manager: { label: 'مدير', variant: 'completed' },
  employee: { label: 'موظف', variant: 'in_progress' }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    role: 'employee' as 'admin' | 'employee' | 'manager'
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        profile:profiles(id, full_name, role, phone)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Fetch assigned workflow counts
      const employeesWithCounts = await Promise.all(
        data.map(async (emp) => {
          const { count } = await supabase
            .from('workflows')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_to', emp.user_id)

          return {
            ...emp,
            assigned_workflows_count: count || 0
          }
        })
      )
      setEmployees(employeesWithCounts)
    }
    setLoading(false)
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: formData.email,
      password: 'temp-password-123',
      email_confirm: true,
      user_metadata: { full_name: formData.full_name }
    })

    if (authError || !authData.user) {
      alert('حدث خطأ في إنشاء المستخدم')
      return
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: formData.full_name,
      phone: formData.phone,
      role: formData.role
    })

    if (profileError) {
      alert('حدث خطأ في إنشاء الملف الشخصي')
      return
    }

    // Create employee record
    const { error: employeeError } = await supabase.from('employees').insert({
      user_id: authData.user.id,
      position: formData.position,
      is_active: true
    })

    if (employeeError) {
      alert('حدث خطأ في إنشاء بيانات الموظف')
      return
    }

    setShowAddModal(false)
    setFormData({ full_name: '', email: '', phone: '', position: '', role: 'employee' })
    fetchEmployees()
  }

  async function handleDeleteEmployee(employee: Employee) {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employee.id)

    if (error) {
      alert('حدث خطأ في حذف الموظف')
      return
    }

    fetchEmployees()
  }

  function handleEditClick(employee: Employee) {
    setSelectedEmployee(employee)
    setFormData({
      full_name: employee.profile.full_name,
      email: '',
      phone: employee.profile.phone || '',
      position: employee.position,
      role: employee.profile.role
    })
    setShowEditModal(true)
  }

  return (
    <div className="p-6 max-w-[1300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">إدارة الموظفين</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة موظف
        </Button>
      </div>

      {/* Employee Cards */}
      {loading ? (
        <div className="text-center text-[var(--color-text-muted)] py-8">جارٍ التحميل...</div>
      ) : employees.length === 0 ? (
        <Card className="text-center py-8">
          <div className="text-[var(--color-text-muted)]">لا يوجد موظفون</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((employee) => {
            const roleInfo = roleLabels[employee.profile.role] || roleLabels.employee
            const initials = employee.profile.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)

            return (
              <Card key={employee.id} className="text-center">
                <Avatar initials={initials} size="lg" className="mx-auto mb-3" />

                <div className="font-bold mb-1">{employee.profile.full_name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mb-3">
                  {employee.position || 'بدون وظيفة'}
                </div>

                <div className="flex justify-center gap-2 flex-wrap mb-3">
                  <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                  {employee.is_active ? (
                    <Badge variant="completed">نشط</Badge>
                  ) : (
                    <Badge variant="blocked">غير نشط</Badge>
                  )}
                </div>

                <div className="flex justify-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>{employee.assigned_workflows_count || 0} ملفات</span>
                </div>

                {/* Admin Actions */}
                <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[var(--color-divider)]">
                  <Button variant="secondary" size="sm" onClick={() => handleEditClick(employee)}>
                    تعديل
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteEmployee(employee)}>
                    حذف
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <Dialog open onOpenChange={setShowAddModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة موظف جديد</DialogTitle>
              <DialogDescription>أدخل بيانات الموظف الجديد</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <FormGroup>
                <Label htmlFor="full_name">الاسم الكامل</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  dir="ltr"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  dir="ltr"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="position">الوظيفة</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="role">الدور</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]"
                >
                  <option value="employee">موظف</option>
                  <option value="manager">مدير</option>
                  <option value="admin">مدير النظام</option>
                </select>
              </FormGroup>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </Button>
                <Button type="submit">إضافة</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/employees/page.tsx
grep -q "employees" src/app/\(dashboard\)/employees/page.tsx
grep -q "إضافة موظف" src/app/\(dashboard\)/employees/page.tsx
grep -q "handleDeleteEmployee" src/app/\(dashboard\)/employees/page.tsx
```
</verify>
<acceptance_criteria>
- Employee cards display with avatar, name, position, role badge
- Active/inactive status shown
- Assigned workflow count displayed
- Add employee button opens modal with form
- Edit and delete buttons available (EMP-01)
- Role selection dropdown (admin, employee, manager) (AUTH-02)
- Form validation on required fields
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Employee list displays as card grid
2. Add employee modal creates new auth user + profile + employee record
3. Edit employee updates profile information
4. Delete employee removes employee record
5. Role badge shows correct Arabic label
6. Workflow assignment count fetched and displayed
</verification>

<success_criteria>
- /employees page displays employee cards with avatars
- Add employee creates Supabase auth user, profile, and employee record
- Edit updates employee profile and role
- Delete removes employee record
- Role-based badges display correctly (admin, manager, employee)
</success_criteria>

<threat_model>
- **Privilege Escalation:** Only admins can manage employees (RLS policy enforced)
- **Data Integrity:** Deleting employee should reassign or handle their workflows
- **Mitigation:** Check workflow assignments before deletion, reassign or block deletion
</threat_model>

---

*P-04: Employee Management*
