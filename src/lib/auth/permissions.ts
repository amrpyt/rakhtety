import type { UserRole } from '@/types/database.types'

export type PermissionAction =
  | 'readClients'
  | 'manageClients'
  | 'manageWorkflows'
  | 'updateWorkflowSteps'
  | 'uploadWorkflowDocuments'
  | 'recordPayments'
  | 'readReports'
  | 'readBottleneckAlerts'
  | 'manageEmployees'
  | 'manageRoles'
  | 'manageSettings'
  | 'emergencyOverride'
  | 'destructiveDelete'

type PermissionMatrix = Record<UserRole, Record<PermissionAction, boolean>>

const fullAccess: Record<PermissionAction, boolean> = {
  readClients: true,
  manageClients: true,
  manageWorkflows: true,
  updateWorkflowSteps: true,
  uploadWorkflowDocuments: true,
  recordPayments: true,
  readReports: true,
  readBottleneckAlerts: true,
  manageEmployees: true,
  manageRoles: true,
  manageSettings: true,
  emergencyOverride: true,
  destructiveDelete: true,
}

export const rolePermissions: PermissionMatrix = {
  admin: fullAccess,
  manager: fullAccess,
  employee: {
    readClients: true,
    manageClients: false,
    manageWorkflows: false,
    updateWorkflowSteps: true,
    uploadWorkflowDocuments: true,
    recordPayments: true,
    readReports: true,
    readBottleneckAlerts: false,
    manageEmployees: false,
    manageRoles: false,
    manageSettings: false,
    emergencyOverride: false,
    destructiveDelete: false,
  },
}

export function can(role: UserRole | null | undefined, action: PermissionAction): boolean {
  if (!role) return false
  return rolePermissions[role]?.[action] ?? false
}

export function canAccessRoute(role: UserRole | null | undefined, pathname: string): boolean {
  if (pathname.startsWith('/amr-dashboard')) return Boolean(role)
  if (pathname.startsWith('/employees')) return can(role, 'manageEmployees')
  if (pathname.startsWith('/settings')) return can(role, 'manageSettings')
  if (pathname.startsWith('/clients')) return can(role, 'readClients')
  if (pathname.startsWith('/workflows')) return can(role, 'readClients')
  if (pathname.startsWith('/finance')) return can(role, 'recordPayments')
  if (pathname.startsWith('/dashboard')) return Boolean(role)
  return true
}
