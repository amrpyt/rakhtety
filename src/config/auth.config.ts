export interface AuthConfig {
  cookieName: string
  sessionTimeoutMs: number
  refreshIntervalMs: number
  protectedRoutes: string[]
  publicRoutes: string[]
  redirectAfterLogin: Record<string, string>
  defaultRedirect: string
}

export const authConfig: AuthConfig = {
  cookieName: 'sb-auth-token',
  sessionTimeoutMs: 7 * 24 * 60 * 60 * 1000,
  refreshIntervalMs: 5 * 60 * 1000,
  protectedRoutes: ['/dashboard', '/clients', '/workflows', '/employees', '/settings'],
  publicRoutes: ['/login', '/signup', '/api/auth'],
  redirectAfterLogin: {
    admin: '/dashboard',
    manager: '/dashboard',
    employee: '/dashboard',
  },
  defaultRedirect: '/dashboard',
}

export const roleLabels: Record<string, { label: string; ar: string }> = {
  admin: { label: 'Admin', ar: 'مدير النظام' },
  manager: { label: 'Manager', ar: 'مدير' },
  employee: { label: 'Employee', ar: 'موظف' },
}