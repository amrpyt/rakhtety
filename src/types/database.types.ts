export type UserRole = 'admin' | 'employee' | 'manager'

export type WorkflowType = 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT'

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export interface Profile {
  id: string
  email: string | null
  role: UserRole
  full_name: string
  email: string | null
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
