import type {
  Client,
  DashboardAnalyticsSummary,
  EmployeeWithProfile,
  WorkflowOverviewItem,
} from '@/types/database.types'
import type { AuthUser } from '@/types/auth.types'
import packageJson from '../../../package.json'

export interface AmrDashboardOverview {
  generatedAt: string
  user: AuthUser
  source: {
    backend: 'Frappe'
    mode: 'privileged-server-read'
    baseUrlConfigured: boolean
  }
  software: {
    appName: string
    version: string
    packageManager: string
    nextVersion: string
    reactVersion: string
    nodeEnv: string
    env: Array<{
      name: string
      configured: boolean
      purpose: string
    }>
    apiMethods: Array<{
      name: string
      purpose: string
    }>
    healthChecks: Array<{
      label: string
      status: 'pass' | 'warn'
      detail: string
    }>
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
    software: {
      appName: packageJson.name,
      version: packageJson.version,
      packageManager: packageJson.packageManager,
      nextVersion: packageJson.dependencies.next,
      reactVersion: packageJson.dependencies.react,
      nodeEnv: process.env.NODE_ENV || 'development',
      env: [
        {
          name: 'FRAPPE_BASE_URL',
          configured: input.baseUrlConfigured,
          purpose: 'عنوان Frappe backend',
        },
        {
          name: 'FRAPPE_USERNAME',
          configured: Boolean(process.env.FRAPPE_USERNAME),
          purpose: 'يوزر السيرفر اللي بيقرأ من Frappe',
        },
        {
          name: 'FRAPPE_PASSWORD',
          configured: Boolean(process.env.FRAPPE_PASSWORD),
          purpose: 'باسورد يوزر السيرفر',
        },
      ],
      apiMethods: [
        { name: 'rakhtety_frappe.api.dashboard_summary', purpose: 'أرقام لوحة التحكم' },
        { name: 'rakhtety_frappe.api.list_clients', purpose: 'قائمة العملاء' },
        { name: 'rakhtety_frappe.api.list_workflow_overview', purpose: 'طابور المسارات' },
        { name: 'rakhtety_frappe.api.list_employees', purpose: 'قائمة الموظفين' },
      ],
      healthChecks: [
        {
          label: 'Frappe connection',
          status: input.baseUrlConfigured ? 'pass' : 'warn',
          detail: input.baseUrlConfigured ? 'backend URL configured' : 'missing FRAPPE_BASE_URL',
        },
        {
          label: 'Workflow data',
          status: input.workflows.length > 0 ? 'pass' : 'warn',
          detail: `${input.workflows.length} workflows loaded`,
        },
        {
          label: 'Client data',
          status: input.clients.length > 0 ? 'pass' : 'warn',
          detail: `${input.clients.length} clients loaded`,
        },
        {
          label: 'Employee data',
          status: input.employees.length > 0 ? 'pass' : 'warn',
          detail: `${input.employees.length} employees loaded`,
        },
      ],
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
