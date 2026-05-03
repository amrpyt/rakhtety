import { describe, expect, it } from 'vitest'
import type {
  Client,
  DashboardAnalyticsSummary,
  EmployeeWithProfile,
  WorkflowOverviewItem,
} from '@/types/database.types'
import { buildAmrDashboardOverview } from './overview'

const summary: DashboardAnalyticsSummary = {
  active_files: 2,
  completed_this_month: 1,
  pending_debt: 300,
  bottleneck_count: 1,
  bottlenecks: [],
  employee_workloads: [],
  recent_workflows: [],
}

const clients = [
  {
    id: 'client-1',
    name: 'Local Client',
    phone: '010',
    city: 'السادات',
    district: null,
    neighborhood: null,
    parcel_number: 'P-1',
    created_by: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
] satisfies Client[]

const workflows = [
  {
    workflow_id: 'workflow-1',
    client_id: 'client-1',
    client_name: 'Local Client',
    client_phone: '010',
    parcel_number: 'P-1',
    city: 'السادات',
    workflow_type: 'DEVICE_LICENSE',
    workflow_status: 'in_progress',
    current_step_name: 'بيان الصلاحية',
    current_step_status: 'in_progress',
    assigned_employee_name: 'Amr',
    updated_at: '2026-01-01',
    days_stuck: 4,
    is_stuck: true,
    outstanding_debt: 300,
  },
] satisfies WorkflowOverviewItem[]

const employees = [
  {
    id: 'employee-1',
    user_id: 'user-1',
    position: 'Engineer',
    is_active: true,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    profile: {
      id: 'user-1',
      email: 'amr@example.com',
      role: 'admin',
      full_name: 'Amr',
      phone: null,
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    },
  },
] satisfies EmployeeWithProfile[]

describe('buildAmrDashboardOverview', () => {
  it('counts the whole real app surface from Frappe data', () => {
    const overview = buildAmrDashboardOverview({
      generatedAt: '2026-05-04T00:00:00.000Z',
      user: {
        id: 'user-1',
        email: 'amr@example.com',
        role: 'admin',
        full_name: 'Amr',
      },
      summary,
      clients,
      workflows,
      employees,
      baseUrlConfigured: true,
    })

    expect(overview.source.backend).toBe('Frappe')
    expect(overview.totals).toMatchObject({
      clients: 1,
      workflows: 1,
      activeWorkflows: 1,
      stuckWorkflows: 1,
      employees: 1,
      activeEmployees: 1,
      outstandingDebt: 300,
    })
    expect(overview.realRoutes.map((route) => route.href)).toContain('/amr-dashboard')
  })
})
