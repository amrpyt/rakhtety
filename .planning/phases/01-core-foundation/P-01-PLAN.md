---
phase: 1
plan: P-01
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/schema.sql
  - src/config/database.config.ts
  - src/types/database.types.ts
  - src/types/auth.types.ts
  - src/lib/errors/app-error.class.ts
  - src/lib/errors/error-codes.enum.ts
  - src/lib/database/repositories/profile.repository.ts
  - src/lib/database/repositories/client.repository.ts
  - src/lib/database/repositories/workflow.repository.ts
  - src/lib/database/repositories/workflow-step.repository.ts
  - src/lib/database/repositories/employee.repository.ts
  - src/lib/supabase/client.ts
  - src/lib/supabase/server.ts
  - src/middleware.ts
autonomous: false
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
---

<objective>
Set up Supabase project with authentication, database schema, and enterprise-grade modular architecture. Create the core infrastructure: database tables, Row-Level Security policies, type definitions, error handling system, repository pattern for data access, and Supabase client utilities.
</objective>

<read_first>
- rakhtety-erp-demo.html (CSS tokens: lines 15-87, auth section: ~1400)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-01 through D-10)
- .planning/phases/01-core-foundation/01-RESEARCH.md (Database Schema Approach section, Web Research Findings)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Design System section)
- .planning/research/STACK.md (Next.js 16 + React 19 + Supabase stack)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - src/types/error-codes.enum.ts
</files>
<action>
Create error codes enum for typed error handling:

```typescript
export enum ErrorCodes {
  // Auth errors (1000-1999)
  AUTH_INVALID_CREDENTIALS = 'AUTH_1001',
  AUTH_SESSION_EXPIRED = 'AUTH_1002',
  AUTH_UNAUTHORIZED = 'AUTH_1003',
  AUTH_FORBIDDEN = 'AUTH_1004',
  AUTH_USER_NOT_FOUND = 'AUTH_1005',

  // Database errors (2000-2999)
  DB_CONNECTION_FAILED = 'DB_2001',
  DB_QUERY_FAILED = 'DB_2002',
  DB_CONSTRAINT_VIOLATION = 'DB_2003',
  DB_NOT_FOUND = 'DB_2004',

  // Business logic errors (3000-3999)
  VALIDATION_FAILED = 'VALID_3001',
  RESOURCE_NOT_FOUND = 'RES_3001',
  DUPLICATE_ENTRY = 'RES_3002',
  OPERATION_NOT_ALLOWED = 'RES_3003',

  // Workflow errors (4000-4999)
  WORKFLOW_INVALID_STATE = 'WF_4001',
  WORKFLOW_STEP_LOCKED = 'WF_4002',
  WORKFLOW_DEPENDENCY_NOT_MET = 'WF_4003',
}
```
</action>
<verify>
```bash
test -f src/types/error-codes.enum.ts
grep -q "ErrorCodes" src/types/error-codes.enum.ts
```
</verify>
<acceptance_criteria>
- ErrorCodes enum exported with namespaced categories
- Auth, DB, Business, Workflow error ranges defined
- Error codes follow pattern: CATEGORY_NUMBER
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/errors/app-error.class.ts
</files>
<action>
Create application error class:

```typescript
import { ErrorCodes } from '@/types/error-codes.enum'

export interface AppErrorOptions {
  code: ErrorCodes
  message: string
  statusCode: number
  context?: Record<string, unknown>
  stack?: string
}

export class AppError extends Error {
  public readonly code: ErrorCodes
  public readonly statusCode: number
  public readonly context: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(options: AppErrorOptions) {
    super(options.message)
    this.name = 'AppError'
    this.code = options.code
    this.statusCode = options.statusCode
    this.context = options.context || {}
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: new Date().toISOString(),
    }
  }

  static fromError(error: unknown, fallbackCode: ErrorCodes): AppError {
    if (error instanceof AppError) return error
    return new AppError({
      code: fallbackCode,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
    })
  }
}

export class AuthError extends AppError {
  constructor(code: ErrorCodes, message: string, context?: Record<string, unknown>) {
    super({ code, message, statusCode: 401, context })
    this.name = 'AuthError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super({ code: ErrorCodes.VALIDATION_FAILED, message, statusCode: 400, context })
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super({
      code: ErrorCodes.RESOURCE_NOT_FOUND,
      message: `${resource} not found${identifier ? `: ${identifier}` : ''}`,
      statusCode: 404,
      context: { resource, identifier },
    })
    this.name = 'NotFoundError'
  }
}
```
</action>
<verify>
```bash
test -f src/lib/errors/app-error.class.ts
grep -q "class AppError" src/lib/errors/app-error.class.ts
grep -q "class AuthError" src/lib/errors/app-error.class.ts
```
</verify>
<acceptance_criteria>
- AppError base class with code, statusCode, context properties
- Subclasses: AuthError, ValidationError, NotFoundError
- toJSON method for structured error responses
- fromError static method for error wrapping
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/types/database.types.ts
</files>
<action>
Create database types file with all entity types:

```typescript
// Enums
export type UserRole = 'admin' | 'employee' | 'manager'

export type WorkflowType = 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT'

export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

// Entities
export interface Profile {
  id: string
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

// Relations
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

// Database filter types
export interface ProfileFilter {
  id?: string
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
```
</action>
<verify>
```bash
test -f src/types/database.types.ts
grep -q "export interface Profile" src/types/database.types.ts
grep -q "export type UserRole" src/types/database.types.ts
```
</verify>
<acceptance_criteria>
- All entity interfaces exported (Profile, Client, Workflow, WorkflowStep, Employee)
- Enums for UserRole, WorkflowType, WorkflowStatus, StepStatus
- Relation interfaces with joined data (EmployeeWithProfile, WorkflowWithSteps)
- Filter interfaces for query options
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/types/auth.types.ts
</files>
<action>
Create auth types file:

```typescript
export interface AuthUser {
  id: string
  email: string
  role: import('./database.types').UserRole
  full_name: string
  phone?: string
}

export interface AuthSession {
  user: AuthUser
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  phone?: string
  role?: 'admin' | 'employee' | 'manager'
}
```
</action>
<verify>
```bash
test -f src/types/auth.types.ts
grep -q "AuthUser" src/types/auth.types.ts
grep -q "LoginCredentials" src/types/auth.types.ts
```
</verify>
<acceptance_criteria>
- AuthUser interface with role from database types
- AuthSession with tokens
- LoginCredentials and SignUpData interfaces
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/config/database.config.ts
</files>
<action>
Create database configuration file:

```typescript
export interface DatabaseConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey: string
  supabaseAuthCookieName: string
  sessionPersistSession: boolean
  sessionAutoRefreshToken: boolean
  sessionDetectSessionInUrl: boolean
}

export const databaseConfig: DatabaseConfig = {
  get supabaseUrl() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
    }
    return url
  },

  get supabaseAnonKey() {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!key) {
      throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required')
    }
    return key
  },

  get supabaseServiceRoleKey() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
    }
    return key
  },

  supabaseAuthCookieName: 'sb-auth-token',
  sessionPersistSession: true,
  sessionAutoRefreshToken: true,
  sessionDetectSessionInUrl: true,
}

export type { DatabaseConfig as Config }
```
</action>
<verify>
```bash
test -f src/config/database.config.ts
grep -q "databaseConfig" src/config/database.config.ts
grep -q "NEXT_PUBLIC_SUPABASE_URL" src/config/database.config.ts
```
</verify>
<acceptance_criteria>
- DatabaseConfig interface with proper types
- Lazy evaluation of env vars with error messages
- Export databaseConfig singleton
- Cookie name and session options configurable
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/database/repositories/profile.repository.ts
</files>
<action>
Create repository interface and implementations:

```typescript
import { supabase } from '@/lib/supabase/client'
import type { Profile, ProfileFilter, UserRole } from '@/types/database.types'
import { NotFoundError } from '@/lib/errors/app-error.class'

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>
  findByEmail(email: string): Promise<Profile | null>
  create(data: CreateProfileData): Promise<Profile>
  update(id: string, data: UpdateProfileData): Promise<Profile>
  delete(id: string): Promise<void>
  findAll(filter?: ProfileFilter): Promise<Profile[]>
}

export interface CreateProfileData {
  id: string
  full_name: string
  role: UserRole
  phone?: string
}

export interface UpdateProfileData {
  full_name?: string
  role?: UserRole
  phone?: string
}

export class ProfileRepository implements IProfileRepository {
  private readonly table = 'profiles'

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async create(data: CreateProfileData): Promise<Profile> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateProfileData): Promise<Profile> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async findAll(filter?: ProfileFilter): Promise<Profile[]> {
    let query = supabase.from(this.table).select('*')

    if (filter?.role) {
      query = query.eq('role', filter.role)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }
}

export const profileRepository = new ProfileRepository()
```
</action>
<verify>
```bash
test -f src/lib/database/repositories/profile.repository.ts
grep -q "class ProfileRepository" src/lib/database/repositories/profile.repository.ts
grep -q "IProfileRepository" src/lib/database/repositories/profile.repository.ts
```
</verify>
<acceptance_criteria>
- IProfileRepository interface defines all CRUD methods
- ProfileRepository class implements the interface
- Singleton instance exported
- Type-safe create/update data interfaces
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/database/repositories/client.repository.ts
</files>
<action>
Create client repository:

```typescript
import { supabase } from '@/lib/supabase/client'
import type { Client, ClientFilter, ClientWithWorkflows } from '@/types/database.types'

export interface IClientRepository {
  findById(id: string): Promise<Client | null>
  findAll(filter?: ClientFilter): Promise<Client[]>
  create(data: CreateClientData): Promise<Client>
  update(id: string, data: UpdateClientData): Promise<Client>
  delete(id: string): Promise<void>
  search(query: string, limit?: number): Promise<Client[]>
}

export interface CreateClientData {
  name: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
  created_by?: string
}

export interface UpdateClientData {
  name?: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
}

export class ClientRepository implements IClientRepository {
  private readonly table = 'clients'

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findAll(filter?: ClientFilter): Promise<Client[]> {
    let query = supabase.from(this.table).select('*')

    if (filter?.city) {
      query = query.eq('city', filter.city)
    }

    if (filter?.created_by) {
      query = query.eq('created_by', filter.created_by)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async create(data: CreateClientData): Promise<Client> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateClientData): Promise<Client> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }

  async search(query: string, limit = 50): Promise<Client[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,parcel_number.ilike.%${query}%`)
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

export const clientRepository = new ClientRepository()
```
</action>
<verify>
```bash
test -f src/lib/database/repositories/client.repository.ts
grep -q "class ClientRepository" src/lib/database/repositories/client.repository.ts
```
</verify>
<acceptance_criteria>
- IClientRepository interface with search capability
- ClientRepository implements interface
- Search uses ilike for partial matching
- Singleton exported
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/database/repositories/workflow.repository.ts
</files>
<action>
Create workflow repository:

```typescript
import { supabase } from '@/lib/supabase/client'
import type { Workflow, WorkflowFilter, WorkflowWithSteps, WorkflowStepWithEmployee } from '@/types/database.types'
import { ErrorCodes } from '@/types/error-codes.enum'
import { AppError } from '@/lib/errors/app-error.class'

export interface IWorkflowRepository {
  findById(id: string): Promise<Workflow | null>
  findByClientId(clientId: string): Promise<Workflow[]>
  findAll(filter?: WorkflowFilter): Promise<Workflow[]>
  create(data: CreateWorkflowData): Promise<Workflow>
  update(id: string, data: UpdateWorkflowData): Promise<Workflow>
  updateStatus(id: string, status: Workflow['status']): Promise<Workflow>
  delete(id: string): Promise<void>
  getWithSteps(id: string): Promise<WorkflowWithSteps | null>
}

export interface CreateWorkflowData {
  client_id: string
  type: Workflow['type']
  assigned_to?: string
}

export interface UpdateWorkflowData {
  assigned_to?: string
  status?: Workflow['status']
}

export class WorkflowRepository implements IWorkflowRepository {
  private readonly table = 'workflows'
  private readonly stepsTable = 'workflow_steps'

  async findById(id: string): Promise<Workflow | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findByClientId(clientId: string): Promise<Workflow[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('client_id', clientId)

    if (error) throw error
    return data || []
  }

  async findAll(filter?: WorkflowFilter): Promise<Workflow[]> {
    let query = supabase.from(this.table).select('*')

    if (filter?.client_id) {
      query = query.eq('client_id', filter.client_id)
    }
    if (filter?.type) {
      query = query.eq('type', filter.type)
    }
    if (filter?.status) {
      query = query.eq('status', filter.status)
    }
    if (filter?.assigned_to) {
      query = query.eq('assigned_to', filter.assigned_to)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async create(data: CreateWorkflowData): Promise<Workflow> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateWorkflowData): Promise<Workflow> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateStatus(id: string, status: Workflow['status']): Promise<Workflow> {
    return this.update(id, { status })
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }

  async getWithSteps(id: string): Promise<WorkflowWithSteps | null> {
    const workflow = await this.findById(id)
    if (!workflow) return null

    const { data: steps, error } = await supabase
      .from(this.stepsTable)
      .select('*, assigned_employee:profiles(full_name)')
      .eq('workflow_id', id)
      .order('step_order')

    if (error) throw error

    return {
      ...workflow,
      steps: steps || [],
    }
  }
}

export const workflowRepository = new WorkflowRepository()
```
</action>
<verify>
```bash
test -f src/lib/database/repositories/workflow.repository.ts
grep -q "class WorkflowRepository" src/lib/database/repositories/workflow.repository.ts
grep -q "getWithSteps" src/lib/database/repositories/workflow.repository.ts
```
</verify>
<acceptance_criteria>
- IWorkflowRepository interface with workflow operations
- getWithSteps returns workflow with joined steps and employee data
- updateStatus convenience method
- Singleton exported
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/database/repositories/workflow-step.repository.ts
</files>
<action>
Create workflow step repository:

```typescript
import { supabase } from '@/lib/supabase/client'
import type { WorkflowStep, WorkflowStepWithEmployee, StepStatus } from '@/types/database.types'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface IWorkflowStepRepository {
  findById(id: string): Promise<WorkflowStep | null>
  findByWorkflowId(workflowId: string): Promise<WorkflowStepWithEmployee[]>
  create(data: CreateWorkflowStepData): Promise<WorkflowStep>
  update(id: string, data: UpdateWorkflowStepData): Promise<WorkflowStep>
  updateStatus(id: string, status: StepStatus, completedAt?: string): Promise<WorkflowStep>
  delete(id: string): Promise<void>
}

export interface CreateWorkflowStepData {
  workflow_id: string
  step_order: number
  name: string
  assigned_to?: string
  fees?: number
  profit?: number
}

export interface UpdateWorkflowStepData {
  name?: string
  assigned_to?: string
  fees?: number
  profit?: number
}

export class WorkflowStepRepository implements IWorkflowStepRepository {
  private readonly table = 'workflow_steps'

  async findById(id: string): Promise<WorkflowStep | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowStepWithEmployee[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*, assigned_employee:profiles(full_name)')
      .eq('workflow_id', workflowId)
      .order('step_order')

    if (error) throw error
    return data || []
  }

  async create(data: CreateWorkflowStepData): Promise<WorkflowStep> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateWorkflowStepData): Promise<WorkflowStep> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateStatus(id: string, status: StepStatus, completedAt?: string): Promise<WorkflowStep> {
    const updateData: Partial<WorkflowStep> = { status }
    if (completedAt) {
      updateData.completed_at = completedAt
    }

    const { data, error } = await supabase
      .from(this.table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }
}

export const workflowStepRepository = new WorkflowStepRepository()
```
</action>
<verify>
```bash
test -f src/lib/database/repositories/workflow-step.repository.ts
grep -q "class WorkflowStepRepository" src/lib/database/repositories/workflow-step.repository.ts
```
</verify>
<acceptance_criteria>
- IWorkflowStepRepository interface
- WorkflowStepRepository implements interface
- updateStatus with optional completedAt timestamp
- Singleton exported
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/database/repositories/employee.repository.ts
</files>
<action>
Create employee repository:

```typescript
import { supabase } from '@/lib/supabase/client'
import type { Employee, EmployeeWithProfile, UserRole } from '@/types/database.types'

export interface IEmployeeRepository {
  findById(id: string): Promise<Employee | null>
  findByUserId(userId: string): Promise<Employee | null>
  findAll(includeInactive?: boolean): Promise<EmployeeWithProfile[]>
  create(data: CreateEmployeeData): Promise<Employee>
  update(id: string, data: UpdateEmployeeData): Promise<Employee>
  updateStatus(id: string, isActive: boolean): Promise<Employee>
  delete(id: string): Promise<void>
  getWorkflowCount(employeeUserId: string): Promise<number>
}

export interface CreateEmployeeData {
  user_id: string
  position?: string
  is_active?: boolean
}

export interface UpdateEmployeeData {
  position?: string
  is_active?: boolean
}

export class EmployeeRepository implements IEmployeeRepository {
  private readonly table = 'employees'

  async findById(id: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findByUserId(userId: string): Promise<Employee | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findAll(includeInactive = false): Promise<EmployeeWithProfile[]> {
    let query = supabase
      .from(this.table)
      .select('*, profile:profiles(*)')

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async create(data: CreateEmployeeData): Promise<Employee> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert({ ...data, is_active: data.is_active ?? true })
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateEmployeeData): Promise<Employee> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateStatus(id: string, isActive: boolean): Promise<Employee> {
    return this.update(id, { is_active: isActive })
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }

  async getWorkflowCount(employeeUserId: string): Promise<number> {
    const { count, error } = await supabase
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', employeeUserId)

    if (error) throw error
    return count || 0
  }
}

export const employeeRepository = new EmployeeRepository()
```
</action>
<verify>
```bash
test -f src/lib/database/repositories/employee.repository.ts
grep -q "class EmployeeRepository" src/lib/database/repositories/employee.repository.ts
grep -q "getWorkflowCount" src/lib/database/repositories/employee.repository.ts
```
</verify>
<acceptance_criteria>
- IEmployeeRepository interface
- EmployeeRepository implements interface
- findAll with profile join
- getWorkflowCount returns assigned workflow count
- Singleton exported
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - supabase/schema.sql
</files>
<action>
Create Supabase schema with all tables and RLS policies:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'manager')) DEFAULT 'employee',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table (CRM)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  district TEXT,
  neighborhood TEXT,
  parcel_number TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TYPE workflow_type AS ENUM ('DEVICE_LICENSE', 'EXCAVATION_PERMIT');
CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type workflow_type NOT NULL,
  status workflow_status DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow steps table
CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');

CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  status step_status DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  fees NUMERIC(10,2) DEFAULT 0,
  profit NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX idx_workflows_client_id ON workflows(client_id);
CREATE INDEX idx_workflows_assigned_to ON workflows(assigned_to);
CREATE INDEX idx_clients_created_by ON clients(created_by);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (TO authenticated prevents anonymous access)
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for clients
CREATE POLICY "clients_select" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients_insert" ON clients FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "clients_update" ON clients FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "clients_delete" ON clients FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for workflows
CREATE POLICY "workflows_select" ON workflows FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  OR assigned_to = auth.uid()
);
CREATE POLICY "workflows_insert" ON workflows FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "workflows_update" ON workflows FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  OR assigned_to = auth.uid()
);
CREATE POLICY "workflows_delete" ON workflows FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for workflow_steps
CREATE POLICY "workflow_steps_select" ON workflow_steps FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM workflows w
    WHERE w.id = workflow_id AND (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
      OR w.assigned_to = auth.uid()
    )
  )
);
CREATE POLICY "workflow_steps_update" ON workflow_steps FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM workflows w
    WHERE w.id = workflow_id AND (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
      OR w.assigned_to = auth.uid()
    )
  )
);

-- RLS Policies for employees
CREATE POLICY "employees_select" ON employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "employees_insert" ON employees FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "employees_update" ON employees FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "employees_delete" ON employees FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_steps;
```
</action>
<verify>
```bash
test -f supabase/schema.sql
grep -q "CREATE TABLE profiles" supabase/schema.sql
grep -q "CREATE TABLE clients" supabase/schema.sql
grep -q "CREATE TABLE workflows" supabase/schema.sql
grep -q "CREATE TABLE workflow_steps" supabase/schema.sql
grep -q "CREATE TABLE employees" supabase/schema.sql
grep -q "ALTER TABLE.*ENABLE ROW LEVEL SECURITY" supabase/schema.sql
grep -q "TO authenticated" supabase/schema.sql
grep -q "CREATE INDEX" supabase/schema.sql
```
</verify>
<acceptance_criteria>
- All 5 tables created with proper foreign keys
- RLS enabled on all tables
- All policies use `TO authenticated` clause (security best practice)
- Performance indexes created
- Enum types for role, workflow_type, workflow_status, step_status
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/supabase/client.ts
</files>
<action>
Create client-side Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js'
import { databaseConfig } from '@/config/database.config'

export const supabase = createClient(
  databaseConfig.supabaseUrl,
  databaseConfig.supabaseAnonKey,
  {
    auth: {
      persistSession: databaseConfig.sessionPersistSession,
      autoRefreshToken: databaseConfig.sessionAutoRefreshToken,
      detectSessionInUrl: databaseConfig.sessionDetectSessionInUrl,
    },
  }
)
```
</action>
<verify>
```bash
test -f src/lib/supabase/client.ts
grep -q "createClient" src/lib/supabase/client.ts
grep -q "databaseConfig" src/lib/supabase/client.ts
```
</verify>
<acceptance_criteria>
- Uses databaseConfig for all settings
- Session persistence enabled
- Named export 'supabase'
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/supabase/server.ts
</files>
<action>
Create server-side Supabase client:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { databaseConfig } from '@/config/database.config'

export function createServerClient(): SupabaseClient {
  return createClient(
    databaseConfig.supabaseUrl,
    databaseConfig.supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

export function createServerClientWithSession(accessToken: string): SupabaseClient {
  const client = createServerClient()
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: '',
  })
  return client
}

export { SupabaseClient }
```
</action>
<verify>
```bash
test -f src/lib/supabase/server.ts
grep -q "createServerClient" src/lib/supabase/server.ts
grep -q "SUPABASE_SERVICE_ROLE_KEY" src/lib/supabase/server.ts
```
</verify>
<acceptance_criteria>
- createServerClient function exported
- Uses SUPABASE_SERVICE_ROLE_KEY (not anon key)
- Session persistence disabled
- createServerClientWithSession for authenticated requests
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/middleware.ts
</files>
<action>
Create Next.js middleware for auth protection:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@lib/supabase/server'
import type { Database } from '@/types/database.types'

const PUBLIC_ROUTES = ['/login', '/signup', '/api/auth']
const PROTECTED_ROUTES = ['/dashboard', '/clients', '/workflows', '/employees', '/settings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (!isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const response = NextResponse.next()

  if (session) {
    response.headers.set('x-user-id', session.user.id)
    response.headers.set('x-user-role', (session.user.user_metadata as { role?: string }).role || 'employee')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```
</action>
<verify>
```bash
test -f src/middleware.ts
grep -q "getSession" src/middleware.ts
grep -q "matcher" src/middleware.ts
grep -q "x-user-id" src/middleware.ts
```
</verify>
<acceptance_criteria>
- middleware.ts exports default middleware function
- Protects dashboard routes requiring authentication
- Redirects unauthenticated users to /login with redirect param
- Redirects authenticated users away from /login
- Passes user context via headers
- Matcher excludes static assets
</acceptance_criteria>
</task>

</tasks>

<verification>
1. All database types exported from @/types/database.types
2. All repositories implement their interfaces
3. RLS policies use TO authenticated clause
4. Middleware protects all dashboard routes
5. Supabase clients configured correctly for client/server
</verification>

<success_criteria>
- src/types/error-codes.enum.ts with ErrorCodes enum
- src/lib/errors/app-error.class.ts with AppError and subclasses
- src/types/database.types.ts with all entity types
- src/types/auth.types.ts with auth types
- src/config/database.config.ts with databaseConfig
- src/lib/database/repositories/*.ts (5 repository files)
- supabase/schema.sql with all tables and RLS policies
- src/lib/supabase/client.ts client-side supabase
- src/lib/supabase/server.ts server-side supabase
- src/middleware.ts auth middleware
</success_criteria>

<threat_model>
- **Data Exposure:** RLS policies use `TO authenticated` to prevent anonymous access. Employees can only see assigned workflows.
- **Auth Bypass:** Middleware validates JWT on every protected route. User context passed via headers for downstream use.
- **Role Escalation:** Only admins can manage employees, update clients, delete records. Enforced at RLS level.
- **Performance:** Indexes on workflow_steps(workflow_id), workflows(client_id), workflows(assigned_to) prevent RLS query degradation (0.1ms → 11s trap).
- **Mitigation:** Test RLS policies with different role users before production. Use explain analyze to verify index usage.
</threat_model>

---

*P-01: Supabase Project Setup (Enterprise Modular)*