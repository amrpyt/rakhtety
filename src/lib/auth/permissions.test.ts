import { describe, expect, it } from 'vitest'
import { can, canAccessRoute, type PermissionAction } from '@/lib/auth/permissions'

const fullActions: PermissionAction[] = [
  'readClients',
  'manageClients',
  'manageWorkflows',
  'updateWorkflowSteps',
  'uploadWorkflowDocuments',
  'recordPayments',
  'readReports',
  'readBottleneckAlerts',
  'manageEmployees',
  'manageRoles',
  'manageSettings',
  'emergencyOverride',
  'destructiveDelete',
]

describe('role permissions', () => {
  it('allows admin and manager full operations', () => {
    for (const role of ['admin', 'manager'] as const) {
      for (const action of fullActions) {
        expect(can(role, action)).toBe(true)
      }
    }
  })

  it('allows employee work actions but blocks management and dangerous actions', () => {
    expect(can('employee', 'readClients')).toBe(true)
    expect(can('employee', 'updateWorkflowSteps')).toBe(true)
    expect(can('employee', 'uploadWorkflowDocuments')).toBe(true)
    expect(can('employee', 'recordPayments')).toBe(true)
    expect(can('employee', 'readReports')).toBe(true)

    expect(can('employee', 'manageEmployees')).toBe(false)
    expect(can('employee', 'manageRoles')).toBe(false)
    expect(can('employee', 'manageSettings')).toBe(false)
    expect(can('employee', 'destructiveDelete')).toBe(false)
    expect(can('employee', 'emergencyOverride')).toBe(false)
  })

  it('denies unknown roles and protects employee routes', () => {
    expect(can(undefined, 'manageEmployees')).toBe(false)
    expect(canAccessRoute(undefined, '/amr-dashboard')).toBe(false)
    expect(canAccessRoute('employee', '/amr-dashboard')).toBe(true)
    expect(canAccessRoute('employee', '/clients')).toBe(true)
    expect(canAccessRoute('employee', '/employees')).toBe(false)
    expect(canAccessRoute('admin', '/employees')).toBe(true)
  })
})
