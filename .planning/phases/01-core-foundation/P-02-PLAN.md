---
phase: 1
plan: P-02
type: execute
wave: 1
depends_on:
  - P-01
files_modified:
  - src/app/(auth)/login/page.tsx
  - src/components/ui/Button.tsx
  - src/components/ui/Form.tsx
  - src/components/layout/Sidebar.tsx
  - src/styles/globals.css
autonomous: false
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
---

<objective>
Implement the authentication system with email/password login, session management, role-based access, and the login page UI. Login page styled per UI spec (dark theme, blur backdrop, Arabic).
</objective>

<read_first>
- rakhtety-erp-demo.html (login form section, sidebar section, button styles)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-01: session persists until logout, D-02: no email verification, D-03: login page from demo)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Design System, Color palette, Typography, Component Inventory)
- .planning/phases/01-core-foundation/01-PATTERNS.md (Login form structure)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - src/styles/globals.css
</files>
<action>
Create global CSS with design tokens extracted from demo:

```css
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
  - src/components/ui/Button.tsx
</files>
<action>
Create Button component with all variants:

```tsx
import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'sm' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  secondary: 'bg-[var(--color-surface-offset)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-divider)]',
  ghost: 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)]',
  danger: 'bg-[var(--color-error-light)] text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white'
}

const sizeStyles: Record<ButtonSize, string> = {
  default: 'px-4 py-2 text-sm font-semibold rounded-[var(--radius-md)]',
  sm: 'px-3 py-1 text-xs rounded-[var(--radius-md)]',
  icon: 'w-9 h-9 p-0 flex items-center justify-center rounded-[var(--radius-md)]'
}

export function Button({
  variant = 'primary',
  size = 'default',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center gap-2
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      {...props}
    >
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
grep -q "variant.*danger" src/components/ui/Button.tsx
```
</verify>
<acceptance_criteria>
- Button component accepts variant prop (primary, secondary, ghost, danger)
- Button component accepts size prop (default, sm, icon)
- Primary button uses --color-primary background
- Danger button uses --color-error colors
- RTL gap direction works correctly
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Form.tsx
</files>
<action>
Create Form primitives (FormGroup, Label, Input):

```tsx
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
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
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
    )
  }
)

Input.displayName = 'Input'
```
</action>
<verify>
```bash
test -f src/components/ui/Form.tsx
grep -q "FormGroup" src/components/ui/Form.tsx
grep -q "Label" src/components/ui/Form.tsx
grep -q "Input" src/components/ui/Form.tsx
```
</verify>
<acceptance_criteria>
- FormGroup, Label, Input components exported
- Input has focus ring with primary color
- Input accepts error prop for error styling
- Placeholder text uses faint color
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(auth)/login/page.tsx
</files>
<action>
Create login page with dark theme, blur backdrop:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Input } from '@/components/ui/Form'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin' || profile?.role === 'manager') {
      router.push('/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1a1917 0%, #232220 50%, #1a1917 100%)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="w-full max-w-md p-8 rounded-[var(--radius-2xl)]"
        style={{
          background: 'rgba(26, 25, 23, 0.8)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
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
          <p className="text-sm text-[var(--color-text-muted)]">نظام إدارة التراخيص</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormGroup>
            <Label htmlFor="email" className="text-[var(--color-text-faint)]">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              required
              dir="ltr"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password" className="text-[var(--color-text-faint)]">
              كلمة المرور
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              dir="ltr"
            />
          </FormGroup>

          {error && (
            <div
              className="p-3 rounded-[var(--radius-md)] text-sm"
              style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}
            >
              {error}
            </div>
          )}

          <Button type="submit" className="w-full justify-center" disabled={loading}>
            {loading ? 'جارٍ التحميل...' : 'دخول'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(auth\)/login/page.tsx
grep -q "supabase.auth.signInWithPassword" src/app/\(auth\)/login/page.tsx
grep -q "رخصتي" src/app/\(auth\)/login/page.tsx
grep -q "دخول" src/app/\(auth\)/login/page.tsx
grep -q "backdropFilter" src/app/\(auth\)/login/page.tsx
```
</verify>
<acceptance_criteria>
- Login page has dark themed background with blur effect
- Arabic branding (رخصتي) displayed
- Email/password form fields present
- Supabase auth signInWithPassword called on submit
- Error message displayed on auth failure
- Loading state shown during authentication
- Arabic CTA button text (دخول)
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/layout/Sidebar.tsx
</files>
<action>
Create Sidebar component with navigation:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    section: 'الرئيسية',
    items: [
      { href: '/dashboard', label: 'لوحة التحكم', icon: 'layout-dashboard' },
      { href: '/clients', label: 'ملفات العملاء', icon: 'users' },
      { href: '/workflows', label: 'مسارات العمل', icon: 'git-branch' }
    ]
  },
  {
    section: 'المالية',
    items: [
      { href: '/finance', label: 'الإدارة المالية', icon: 'banknote' }
    ]
  },
  {
    section: 'الإدارة',
    items: [
      { href: '/employees', label: 'الموظفون', icon: 'user-check' }
    ]
  }
]

const iconPaths: Record<string, string> = {
  'layout-dashboard': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  'git-branch': 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  banknote: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M21 12h-4l-3 9L14 3l-3 9H2'
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-[260px] h-screen sticky top-0 overflow-y-auto border-r border-[var(--color-divider)]"
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
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-faint)] px-3 py-2">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href
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
      <div className="p-4 border-t border-[var(--color-divider)] flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          {/* User initials */}
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold">اسم المستخدم</div>
          <div className="text-[10px] text-[var(--color-text-muted)]">مدير</div>
        </div>
      </div>
    </aside>
  )
}
```
</action>
<verify>
```bash
test -f src/components/layout/Sidebar.tsx
grep -q "لوحة التحكم" src/components/layout/Sidebar.tsx
grep -q "ملفات العملاء" src/components/layout/Sidebar.tsx
grep -q "active.*primary-light" src/components/layout/Sidebar.tsx
```
</verify>
<acceptance_criteria>
- Sidebar displays Arabic navigation labels
- Active nav item has primary-light background
- Logo shows رخصتي branding
- Navigation sections grouped (الرئيسية, المالية, الإدارة)
- Sticky positioning on left side
- User footer area present
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Login page renders with dark blur background
2. Auth form submits to Supabase with email/password
3. Session persists in browser (localStorage)
4. Middleware redirects unauthenticated users to /login
5. Sidebar displays correct navigation with Arabic labels
6. Active state shows correct styling on current route
</verification>

<success_criteria>
- /login page displays properly with Arabic branding
- Supabase signInWithPassword authentication works
- Session persists across page refreshes
- Auth-protected routes redirect to /login when unauthenticated
- Sidebar navigation links to correct routes
</success_criteria>

<threat_model>
- **Credential Exposure:** Password transmitted only over HTTPS via Supabase
- **Session Hijacking:** JWT stored securely, HTTPOnly cookies recommended for production
- **Brute Force:** Supabase rate limits auth attempts
- **Mitigation:** Use strong password requirements, enable MFA in production
</threat_model>

---

*P-02: Authentication System*
