export interface AuthUser {
  id: string
  email: string
  role: import('./database.types').UserRole
  full_name: string
  phone?: string
  position?: string | null
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
