import type {
  Client,
  DashboardAnalyticsSummary,
  EmployeeWithProfile,
  WorkflowOverviewItem,
} from '@/types/database.types'
import type { AuthUser } from '@/types/auth.types'

export interface AmrDashboardOverview {
  generatedAt: string
  user: AuthUser
  source: {
    backend: 'Frappe'
    mode: 'privileged-server-read'
    baseUrlConfigured: boolean
  }
  summary: DashboardAnalyticsSummary
  clients: Client[]
  workflows: WorkflowOverviewItem[]
  employees: EmployeeWithProfile[]
  totals: {
    clients: number
    workflows: number
    activeWorkflows: number
    completedWorkflows: number
    blockedWorkflows: number
    stuckWorkflows: number
    employees: number
    activeEmployees: number
    outstandingDebt: number
  }
  realRoutes: Array<{
    href: string
    label: string
    purpose: string
  }>
}

interface BuildAmrOverviewInput {
  generatedAt?: string
  user: AuthUser
  summary: DashboardAnalyticsSummary
  clients: Client[]
  workflows: WorkflowOverviewItem[]
  employees: EmployeeWithProfile[]
  baseUrlConfigured: boolean
}

export function buildAmrDashboardOverview(input: BuildAmrOverviewInput): AmrDashboardOverview {
  const activeWorkflows = input.workflows.filter((workflow) =>
    ['pending', 'in_progress', 'blocked'].includes(workflow.workflow_status)
  ).length

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    user: input.user,
    source: {
      backend: 'Frappe',
      mode: 'privileged-server-read',
      baseUrlConfigured: input.baseUrlConfigured,
    },
    summary: input.summary,
    clients: input.clients,
    workflows: input.workflows,
    employees: input.employees,
    totals: {
      clients: input.clients.length,
      workflows: input.workflows.length,
      activeWorkflows,
      completedWorkflows: input.workflows.filter((workflow) => workflow.workflow_status === 'completed').length,
      blockedWorkflows: input.workflows.filter((workflow) => workflow.workflow_status === 'blocked').length,
      stuckWorkflows: input.workflows.filter((workflow) => workflow.is_stuck).length,
      employees: input.employees.length,
      activeEmployees: input.employees.filter((employee) => employee.is_active).length,
      outstandingDebt: input.workflows.reduce((sum, workflow) => sum + workflow.outstanding_debt, 0),
    },
    realRoutes: [
      { href: '/dashboard', label: 'لوحة التحكم', purpose: 'ملخص المكتب اليومي' },
      { href: '/clients', label: 'العملاء', purpose: 'ملفات العملاء والبحث' },
      { href: '/workflows', label: 'مسارات العمل', purpose: 'الطابور التشغيلي' },
      { href: '/finance', label: 'المالية', purpose: 'المديونيات والربح' },
      { href: '/employees', label: 'الموظفين', purpose: 'الفريق والصلاحيات' },
      { href: '/amr-dashboard', label: 'لوحة عمرو', purpose: 'رؤية هندسية شاملة' },
    ],
  }
}
