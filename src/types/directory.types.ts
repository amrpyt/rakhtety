import type { UserRole } from '@/types/database.types'

export interface CreateClientDto {
  name: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
  intake_documents?: string[]
}

export interface UpdateClientDto {
  name?: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
}

export interface CreateEmployeeDto {
  email: string
  password: string
  full_name: string
  phone?: string
  role: UserRole
  position?: string
}

export interface UpdateEmployeeDto {
  full_name?: string
  phone?: string
  role?: UserRole
  position?: string
  is_active?: boolean
}

export interface RecordFinancialEventInput {
  workflow_id: string
  workflow_step_id?: string | null
  amount: number
  payment_method?: string | null
  reference_number?: string | null
  notes?: string | null
  created_by?: string | null
}
