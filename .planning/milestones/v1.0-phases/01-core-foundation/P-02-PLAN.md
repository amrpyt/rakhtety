---
phase: 1
plan: P-02
type: execute
wave: 1
depends_on:
  - P-01
files_modified:
  - src/app/(auth)/login/page.tsx
  - src/app/(auth)/signup/page.tsx
  - src/components/auth/LoginForm.tsx
  - src/components/auth/SignUpForm.tsx
  - src/components/auth/AuthLayout.tsx
  - src/components/ui/Button.tsx
  - src/components/ui/Form.tsx
  - src/components/ui/Alert.tsx
  - src/components/layout/Sidebar.tsx
  - src/components/layout/DashboardLayout.tsx
  - src/hooks/auth/useAuth.ts
  - src/hooks/auth/useSession.ts
  - src/providers/AuthProvider.tsx
  - src/styles/globals.css
  - src/config/auth.config.ts
autonomous: false
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
---

<objective>
Implement the authentication system with email/password login, session management, role-based access, and the login page UI. Login page styled per UI spec (dark theme, blur backdrop, Arabic). Uses modular architecture with repository pattern, error handling, and React context for auth state management.
</objective>

<read_first>
- rakhtety-erp-demo.html (login form section, sidebar section, button styles)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-01: session persists until logout, D-02: no email verification, D-03: login page from demo)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Design System, Color palette, Typography, Component Inventory)
- .planning/phases/01-core-foundation/01-PATTERNS.md (Login form structure)
- .planning/phases/01-core-foundation/P-01-PLAN.md (repository interfaces, error handling)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - src/config/auth.config.ts
</files>
<action>
Create auth configuration:

```typescript
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
  sessionTimeoutMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  refreshIntervalMs: 5 * 60 * 1000, // 5 minutes
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
```
</action>
<verify>
```bash
test -f src/config/auth.config.ts
grep -q "authConfig" src/config/auth.config.ts
grep -q "protectedRoutes" src/config/auth.config.ts
```
</verify>
<acceptance_criteria>
- AuthConfig interface with all auth settings
- Public/protected routes defined
- Role labels with Arabic translations
- Session timeout configuration
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/styles/globals.css
</files>
<action>
Create global CSS with design tokens extracted from demo:

```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Colors */
  --color-bg: #f7f6f2;
  --color-surface: #f9f8f5;
  --color-surface-2: #fbfbf9;
  --color-surface-offset: #f0ede8;
  --color-divider: #dcd9d5;
  --color-border: #d4d1ca;
  --color-text: #28251d;
  --color-text-muted: #6b6860;
  --color-text-faint: #b0aea9;
  --color-primary: #01696f;
  --color-primary-hover: #0c4e54;
  --color-primary-light: #e8f4f4;
  --color-success: #437a22;
  --color-success-light: #eaf3e3;
  --color-warning: #964219;
  --color-warning-light: #fdf0e8;
  --color-error: #b91c1c;
  --color-error-light: #fef2f2;
  --color-gold: #b45309;
  --color-gold-light: #fffbeb;
  --color-blue: #1d4ed8;
  --color-blue-light: #eff6ff;
  --color-purple: #7c3aed;
  --color-purple-light: #f5f3ff;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Typography */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.75vw, 1.5rem);
  --text-xl: clamp(1.5rem, 1.2rem + 1.25vw, 2.25rem);
  --font-body: 'Cairo', 'Segoe UI', sans-serif;

  /* Layout */
  --sidebar-w: 260px;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.25rem;
  --radius-full: 9999px;

  /* Transitions */
  --transition: 180ms cubic-bezier(0.16, 1, 0.3, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  direction: rtl;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}

/* Focus styles */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```
</action>
<verify>
```bash
test -f src/styles/globals.css
grep -q "--color-primary: #01696f" src/styles/globals.css
grep -q "direction: rtl" src/styles/globals.css
grep -q "'Cairo'" src/styles/globals.css
```
</verify>
<acceptance_criteria>
- CSS custom properties match demo exactly for primary colors (#01696f)
- RTL direction set on html
- Cairo font loaded and applied
- All spacing tokens present (space-1 through space-16)
- Transition timing defined
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Alert.tsx
</files>
<action>
Create Alert component for error/success/info messages:

```typescript
import React from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  info: {
    bg: 'var(--color-blue-light)',
    border: 'var(--color-blue)',
    text: 'var(--color-blue)',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  success: {
    bg: 'var(--color-success-light)',
    border: 'var(--color-success)',
    text: 'var(--color-success)',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg: 'var(--color-warning-light)',
    border: 'var(--color-warning)',
    text: 'var(--color-warning)',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  error: {
    bg: 'var(--color-error-light)',
    border: 'var(--color-error)',
    text: 'var(--color-error)',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
}

export function Alert({ variant = 'info', title, children, className = '', ...props }: AlertProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`flex gap-3 p-3 rounded-[var(--radius-md)] ${className}`}
      style={{
        background: styles.bg,
        borderRight: `3px solid ${styles.border}`,
        color: styles.text,
      }}
      {...props}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 flex-shrink-0 mt-0.5">
        <path d={styles.icon} />
      </svg>
      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Alert.tsx
grep -q "Alert" src/components/ui/Alert.tsx
grep -q "variant.*success" src/components/ui/Alert.tsx
```
</verify>
<acceptance_criteria>
- Alert has info, success, warning, error variants
- Uses border-right for RTL-friendly styling
- Icon and content layout
- Title optional
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Button.tsx
</files>
<action>
Create Button component with all variants:

```typescript
import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'default' | 'sm' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  secondary: 'bg-[var(--color-surface-offset)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-divider)]',
  ghost: 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)]',
  danger: 'bg-[var(--color-error-light)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white',
}

const sizeStyles: Record<ButtonSize, string> = {
  default: 'px-4 py-2 text-sm font-semibold rounded-[var(--radius-md)]',
  sm: 'px-3 py-1 text-xs rounded-[var(--radius-md)]',
  icon: 'w-9 h-9 p-0 flex items-center justify-center rounded-[var(--radius-md)]',
}

export function Button({
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Button.tsx
grep -q "variant.*primary" src/components/ui/Button.tsx
grep -q "variant.*secondary" src/components/ui/Button.tsx
grep -q "loading" src/components/ui/Button.tsx
```
</verify>
<acceptance_criteria>
- Button component accepts variant prop (primary, secondary, ghost, danger)
- Button component accepts size prop (default, sm, icon)
- Primary button uses --color-primary background
- Danger button uses --color-error colors
- Loading state with spinner
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Form.tsx
</files>
<action>
Create Form primitives (FormGroup, Label, Input, Select):

```typescript
import React from 'react'

interface FormGroupProps {
  children: React.ReactNode
  className?: string
}

export function FormGroup({ children, className = '' }: FormGroupProps) {
  return <div className={`flex flex-col gap-1.5 ${className}`}>{children}</div>
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`text-sm font-medium text-[var(--color-text-muted)] ${className}`}
      {...props}
    >
      {children}
    </label>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, helperText, className = '', ...props }, ref) => {
    return (
      <>
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-surface)]
            text-[var(--color-text)]
            text-sm
            placeholder:text-[var(--color-text-faint)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : ''}
            ${className}
          `.trim()}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-error)] mt-1">{error}</span>}
        {helperText && !error && <span className="text-xs text-[var(--color-text-muted)] mt-1">{helperText}</span>}
      </>
    )
  }
)

Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <>
        <select
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-[var(--radius-md)]
            border border-[var(--color-border)]
            bg-[var(--color-surface)]
            text-[var(--color-text)]
            text-sm
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : ''}
            ${className}
          `.trim()}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[var(--color-error)] mt-1">{error}</span>}
      </>
    )
  }
)

Select.displayName = 'Select'
```
</action>
<verify>
```bash
test -f src/components/ui/Form.tsx
grep -q "FormGroup" src/components/ui/Form.tsx
grep -q "Label" src/components/ui/Form.tsx
grep -q "Input" src/components/ui/Form.tsx
grep -q "Select" src/components/ui/Form.tsx
```
</verify>
<acceptance_criteria>
- FormGroup, Label, Input, Select components exported
- Input has error prop for validation error display
- Select has options array and placeholder
- Focus ring with primary color
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/hooks/auth/useAuth.ts
</files>
<action>
Create useAuth hook for authentication state and methods:

```typescript
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { AuthUser, LoginCredentials, SignUpData } from '@/types/auth.types'
import type { UserRole } from '@/types/database.types'
import { AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignUpData) => Promise<void>
  logout: () => Promise<void>
  resetError: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const resetError = useCallback(() => setError(null), [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError) {
        throw AppError.fromError(authError, ErrorCodes.AUTH_INVALID_CREDENTIALS)
      }

      if (!data.user) {
        throw new AppError({
          code: ErrorCodes.AUTH_USER_NOT_FOUND,
          message: 'User not found',
          statusCode: 404,
        })
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: (profile?.role as UserRole) || 'employee',
        full_name: profile?.full_name || data.user.user_metadata?.full_name || '',
        phone: profile?.phone || undefined,
      }

      setUser(authUser)
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [router])

  const signup = useCallback(async (data: SignUpData) => {
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.full_name,
          role: data.role || 'employee',
        },
      })

      if (authError) {
        throw AppError.fromError(authError, ErrorCodes.AUTH_INVALID_CREDENTIALS)
      }

      if (!authData.user) {
        throw new AppError({
          code: ErrorCodes.AUTH_USER_NOT_FOUND,
          message: 'Failed to create user',
          statusCode: 500,
        })
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: data.full_name,
        role: data.role || 'employee',
        phone: data.phone,
      })

      if (profileError) {
        throw AppError.fromError(profileError, ErrorCodes.DB_CONSTRAINT_VIOLATION)
      }

      await login({ email: data.email, password: data.password })
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [login])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  return { user, loading, error, login, signup, logout, resetError }
}
```
</action>
<verify>
```bash
test -f src/hooks/auth/useAuth.ts
grep -q "useAuth" src/hooks/auth/useAuth.ts
grep -q "login" src/hooks/auth/useAuth.ts
grep -q "logout" src/hooks/auth/useAuth.ts
```
</verify>
<acceptance_criteria>
- useAuth hook returns user, loading, error, login, signup, logout, resetError
- login uses Supabase auth with profile fetch
- signup creates auth user + profile record
- logout clears user and redirects
- Uses AppError for error handling
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/auth/AuthLayout.tsx
</files>
<action>
Create AuthLayout component for login/signup pages:

```typescript
import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1917 0%, #232220 50%, #1a1917 100%)',
      }}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'rgba(26, 25, 23, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-[var(--color-border)]">
          <div
            className="w-16 h-16 rounded-[var(--radius-xl)] flex items-center justify-center mb-4"
            style={{ background: 'var(--color-primary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-8 h-8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">رخصتي</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            نظام إدارة التراخيص
          </p>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/auth/AuthLayout.tsx
grep -q "AuthLayout" src/components/auth/AuthLayout.tsx
grep -q "رخصتي" src/components/auth/AuthLayout.tsx
```
</verify>
<acceptance_criteria>
- Dark themed container with blur backdrop
- Logo and branding section
- Accepts children for form content
- RTL-aware layout
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/auth/LoginForm.tsx
</files>
<action>
Create LoginForm component:

```typescript
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Input } from '@/components/ui/Form'
import { Alert } from '@/components/ui/Alert'
import type { LoginCredentials } from '@/types/auth.types'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()
  const { login, loading, error, resetError } = useAuth()
  const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '' })
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({})

  function validate(): boolean {
    const errors: Partial<LoginCredentials> = {}

    if (!credentials.email) {
      errors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'البريد الإلكتروني غير صالح'
    }

    if (!credentials.password) {
      errors.password = 'كلمة المرور مطلوبة'
    } else if (credentials.password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    resetError()

    if (!validate()) return

    try {
      await login(credentials)
      onSuccess?.()
    } catch {
      // Error is handled by useAuth
    }
  }

  function handleChange(field: keyof LoginCredentials) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }))
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="error" title="خطأ في تسجيل الدخول">
          {error}
        </Alert>
      )}

      <FormGroup>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={credentials.email}
          onChange={handleChange('email')}
          placeholder="example@domain.com"
          error={validationErrors.email}
          required
          dir="ltr"
          autoComplete="email"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          value={credentials.password}
          onChange={handleChange('password')}
          placeholder="••••••••"
          error={validationErrors.password}
          required
          dir="ltr"
          autoComplete="current-password"
        />
      </FormGroup>

      <Button type="submit" className="w-full justify-center" disabled={loading}>
        {loading ? 'جارٍ التحميل...' : 'دخول'}
      </Button>
    </form>
  )
}
```
</action>
<verify>
```bash
test -f src/components/auth/LoginForm.tsx
grep -q "LoginForm" src/components/auth/LoginForm.tsx
grep -q "supabase.auth.signInWithPassword" src/components/auth/LoginForm.tsx
grep -q "دخول" src/components/auth/LoginForm.tsx
```
</verify>
<acceptance_criteria>
- LoginForm has email and password inputs with validation
- Error messages displayed with Alert component
- Loading state shown during authentication
- Arabic CTA button text (دخول)
- RTL input direction for email fields
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(auth)/login/page.tsx
</files>
<action>
Create login page:

```typescript
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(auth\)/login/page.tsx
grep -q "AuthLayout" src/app/\(auth\)/login/page.tsx
grep -q "LoginForm" src/app/\(auth\)/login/page.tsx
```
</verify>
<acceptance_criteria>
- Login page uses AuthLayout and LoginForm
- Simple composition of components
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/layout/Sidebar.tsx
</files>
<action>
Create Sidebar component with navigation:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import { roleLabels } from '@/config/auth.config'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface NavSection {
  section: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    section: 'الرئيسية',
    items: [
      { href: '/dashboard', label: 'لوحة التحكم', icon: 'layout-dashboard' },
      { href: '/clients', label: 'ملفات العملاء', icon: 'users' },
      { href: '/workflows', label: 'مسارات العمل', icon: 'git-branch' },
    ],
  },
  {
    section: 'المالية',
    items: [{ href: '/finance', label: 'الإدارة المالية', icon: 'banknote' }],
  },
  {
    section: 'الإدارة',
    items: [{ href: '/employees', label: 'الموظفون', icon: 'user-check' }],
  },
]

const iconPaths: Record<string, string> = {
  'layout-dashboard': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  'git-branch': 'M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9',
  banknote: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M21 12h-4l-3 9L14 3l-3 9H2',
  'user-check': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 11l2 2 4-4',
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2) || ''

  const roleLabel = user?.role ? roleLabels[user.role]?.ar || user.role : ''

  return (
    <aside
      className="w-[260px] h-screen sticky top-0 overflow-y-auto border-l border-[var(--color-divider)]"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Logo */}
      <div className="p-5 pb-4 flex items-center gap-3 border-b border-[var(--color-divider)]">
        <div
          className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-[var(--color-text)]">رخصتي</div>
          <div className="text-xs text-[var(--color-text-muted)]">نظام إدارة التراخيص</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        {navSections.map((section) => (
          <div key={section.section} className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-faint)] px-3 py-2">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]
                    text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)]'
                    }
                  `}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d={iconPaths[item.icon]} />
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[var(--color-divider)]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {initials || '?'}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold truncate">{user?.full_name || 'مستخدم'}</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)] transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
```
</action>
<verify>
```bash
test -f src/components/layout/Sidebar.tsx
grep -q "Sidebar" src/components/layout/Sidebar.tsx
grep -q "لوحة التحكم" src/components/layout/Sidebar.tsx
grep -q "تسجيل الخروج" src/components/layout/Sidebar.tsx
```
</verify>
<acceptance_criteria>
- Sidebar displays Arabic navigation labels
- Active nav item has primary-light background
- Logo shows رخصتي branding
- Navigation sections grouped (الرئيسية, المالية, الإدارة)
- User section with initials, name, role
- Logout button with icon
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/layout/DashboardLayout.tsx
</files>
<action>
Create DashboardLayout component:

```typescript
import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[var(--color-bg)]">{children}</main>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/layout/DashboardLayout.tsx
grep -q "DashboardLayout" src/components/layout/DashboardLayout.tsx
grep -q "Sidebar" src/components/layout/DashboardLayout.tsx
```
</verify>
<acceptance_criteria>
- DashboardLayout wraps Sidebar and children
- Flex layout with sidebar and main content
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Login page renders with dark blur background
2. LoginForm validates inputs and shows errors
3. Auth form submits to Supabase with email/password
4. Session persists in browser (localStorage)
5. Middleware redirects unauthenticated users to /login
6. Sidebar displays correct navigation with Arabic labels
7. Active state shows correct styling on current route
8. Logout button works and redirects to login
</verification>

<success_criteria>
- /login page displays properly with Arabic branding
- Supabase signInWithPassword authentication works
- Session persists across page refreshes
- Auth-protected routes redirect to /login when unauthenticated
- Sidebar navigation links to correct routes
- Logout clears session and redirects
</success_criteria>

<threat_model>
- **Credential Exposure:** Password transmitted only over HTTPS via Supabase
- **Session Hijacking:** JWT stored securely, HTTPOnly cookies recommended for production
- **Brute Force:** Supabase rate limits auth attempts
- **Validation Bypass:** Client-side validation may be bypassed, server-side checks required
- **Mitigation:** Use strong password requirements, enable MFA in production, validate all inputs server-side
</threat_model>

---

*P-02: Authentication System (Enterprise Modular)*