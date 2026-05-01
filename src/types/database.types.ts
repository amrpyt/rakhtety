export type UserRole = 'admin' | 'employee' | 'manager'

export type WorkflowType = 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT'

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export type FinancialEventType = 'payment' | 'refund' | 'adjustment'

export type DashboardAlertStatus = 'unread' | 'read'

export type WorkflowActionType = 'emergency_complete' | 'move_back'

export interface Profile {
  id: string
  email: string | null
  role: UserRole
  full_name: string
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  phone: string | null
  city: string | null
  district: string | null
  neighborhood: string | null
  parcel_number: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  area?: string | null
  plot_number?: string | null
  notes?: string | null
}

export interface Workflow {
  id: string
  client_id: string
  type: WorkflowType
  status: WorkflowStatus
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface WorkflowStep {
  id: string
  workflow_id: string
  step_order: number
  name: string
  status: StepStatus
  assigned_to: string | null
  completed_at: string | null
  fees: number
  profit: number
  created_at: string
  updated_at: string
}

export interface WorkflowStepConfig {
  id: string
  step_name: string
  workflow_type: WorkflowType
  government_fee: number
  office_profit: number
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FinancialEvent {
  id: string
  workflow_id: string
  workflow_step_id: string | null
  client_id: string
  type: FinancialEventType
  amount: number
  currency: string
  payment_method: string | null
  reference_number: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface WorkflowFinancialSummary {
  workflow_id: string
  total_cost: number
  total_fees: number
  planned_profit: number
  total_paid: number
  realized_profit: number
  outstanding_debt: number
}

export interface FinancialDashboardSummary {
  total_fees_collected: number
  realized_profit: number
  outstanding_debt: number
}

export interface DashboardBottleneck {
  workflow_id: string
  workflow_step_id: string
  client_id: string
  client_name: string
  workflow_type: WorkflowType
  step_name: string
  step_status: StepStatus
  assigned_to: string | null
  assigned_employee_name: string | null
  stuck_days: number
  updated_at: string
}

export interface EmployeeWorkloadSummary {
  employee_id: string
  user_id: string
  full_name: string
  active_workflows: number
  active_steps: number
  bottlenecks: number
}

export interface RecentWorkflowSummary {
  workflow_id: string
  client_name: string
  workflow_type: WorkflowType
  status: WorkflowStatus
  updated_at: string
}

export interface DashboardAnalyticsSummary {
  active_files: number
  completed_this_month: number
  pending_debt: number
  bottleneck_count: number
  bottlenecks: DashboardBottleneck[]
  employee_workloads: EmployeeWorkloadSummary[]
  recent_workflows: RecentWorkflowSummary[]
}

export interface WorkflowOverviewItem {
  workflow_id: string
  client_id: string
  client_name: string
  client_phone: string | null
  parcel_number: string | null
  city: string | null
  workflow_type: WorkflowType
  workflow_status: WorkflowStatus
  current_step_name: string
  current_step_status: StepStatus | null
  assigned_employee_name: string | null
  updated_at: string
  days_stuck: number
  is_stuck: boolean
  outstanding_debt: number
}

export interface DashboardAlert {
  id: string
  workflow_id: string
  workflow_step_id: string | null
  recipient_id: string
  created_by: string | null
  type: string
  message: string
  status: DashboardAlertStatus
  created_at: string
  read_at: string | null
}

export interface WorkflowActionLog {
  id: string
  workflow_id: string
  workflow_step_id: string
  action: WorkflowActionType
  reason: string
  actor_id: string | null
  created_at: string
}

export interface WorkflowDocumentRequirement {
  id: string
  step_name: string
  document_type: string
  label: string
  is_required: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkflowDocument {
  id: string
  workflow_id: string
  workflow_step_id: string
  document_type: string
  label: string
  file_name: string
  storage_path: string
  mime_type: string | null
  file_size: number | null
  uploaded_by: string | null
  uploaded_at: string
}

export interface ClientIntakeDocument {
  id: string
  client_id: string
  document_type: string
  label: string
  file_name: string
  storage_path: string
  mime_type: string | null
  file_size: number | null
  uploaded_by: string | null
  uploaded_at: string
}

export interface Employee {
  id: string
  user_id: string
  position: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmployeeWithProfile extends Employee {
  profile: Profile
}

export interface WorkflowStepWithEmployee extends WorkflowStep {
  assigned_employee?: Pick<Profile, 'full_name'>
}

export interface WorkflowWithSteps extends Workflow {
  steps: WorkflowStepWithEmployee[]
  client?: Client
  assigned_employee?: Pick<Profile, 'full_name'>
}

export interface ClientWithWorkflows extends Client {
  workflows: WorkflowWithSteps[]
}

export interface ProfileFilter {
  id?: string
  email?: string
  role?: UserRole
}

export interface ClientFilter {
  search?: string
  city?: string
  created_by?: string
}

export interface WorkflowFilter {
  client_id?: string
  type?: WorkflowType
  status?: WorkflowStatus
  assigned_to?: string
}
