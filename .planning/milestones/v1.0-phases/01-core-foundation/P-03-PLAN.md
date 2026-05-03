---
phase: 1
plan: P-03
type: execute
wave: 2
depends_on:
  - P-01
  - P-02
files_modified:
  - src/app/(dashboard)/dashboard/page.tsx
  - src/app/(dashboard)/clients/page.tsx
  - src/app/(dashboard)/clients/[id]/page.tsx
  - src/app/(dashboard)/layout.tsx
  - src/components/ui/Card.tsx
  - src/components/ui/Badge.tsx
  - src/components/ui/Table.tsx
  - src/components/ui/SearchBar.tsx
  - src/components/ui/Tabs.tsx
  - src/components/ui/EmptyState.tsx
  - src/components/ui/LoadingSpinner.tsx
  - src/components/workflow/WorkflowStep.tsx
  - src/components/workflow/WorkflowTimeline.tsx
  - src/components/workflow/WorkflowTabs.tsx
  - src/components/client/ClientCard.tsx
  - src/components/client/ClientTable.tsx
  - src/components/dashboard/KpiCard.tsx
  - src/components/dashboard/KpiGrid.tsx
  - src/lib/services/client.service.ts
  - src/lib/services/workflow.service.ts
  - src/hooks/useClients.ts
  - src/hooks/useWorkflows.ts
autonomous: false
requirements:
  - CRM-01
  - CRM-02
  - CRM-03
  - CRM-04
  - WF-01
  - WF-04
  - WF-05
---

<objective>
Build the CRM core with enterprise modular architecture: client database with search, client list view, client profile view with workflow tabs, and dashboard with KPI cards. Display workflow steps for both Device License and Excavation Permit with status, assigned employee, completion date, and financial info (fees/profit). Uses repository pattern, service layer, and custom hooks for data fetching.
</objective>

<read_first>
- rakhtety-erp-demo.html (clients table: ~700-900, workflow UI: ~905-1070, badge styles: ~226-241, search bar: ~350-380, KPI cards: ~242-320)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-05: workflows table with type column, D-06: separate workflow_steps table)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Component Inventory, Workflow UI section)
- .planning/phases/01-core-foundation/01-RESEARCH.md (Database Schema: clients, workflows, workflow_steps tables)
- .planning/phases/01-core-foundation/P-01-PLAN.md (repository interfaces)
- .planning/phases/01-core-foundation/P-02-PLAN.md (component structure, auth hooks)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - src/components/ui/EmptyState.tsx
</files>
<action>
Create EmptyState component:

```typescript
import React from 'react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const defaultIconPath = 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-4 text-[var(--color-text-faint)]">
          <path d={icon} />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-4 text-[var(--color-text-faint)]">
          <path d={defaultIconPath} />
        </svg>
      )}
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/EmptyState.tsx
grep -q "EmptyState" src/components/ui/EmptyState.tsx
```
</verify>
<acceptance_criteria>
- EmptyState has icon, title, description, action props
- Centered layout with optional action button
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/LoadingSpinner.tsx
</files>
<action>
Create LoadingSpinner component:

```typescript
import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

export function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg
        className={`animate-spin ${sizeClasses[size]} text-[var(--color-primary)]`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      {label && <span className="text-sm text-[var(--color-text-muted)]">{label}</span>}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/LoadingSpinner.tsx
grep -q "LoadingSpinner" src/components/ui/LoadingSpinner.tsx
```
</verify>
<acceptance_criteria>
- LoadingSpinner has size and label props
- Animated spinner icon
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Card.tsx
</files>
<action>
Create Card component with variants:

```typescript
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

const variantStyles = {
  default: 'bg-[var(--color-surface)] border border-[var(--color-border)]',
  outlined: 'border border-[var(--color-border)]',
  elevated: 'bg-[var(--color-surface)] shadow-[var(--shadow-md)]',
}

export function Card({ variant = 'default', padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] ${variantStyles[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  action?: React.ReactNode
}

export function CardHeader({ children, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardTitle({ children, className = '', ...props }: CardTitleProps) {
  return (
    <div className={`text-base font-bold ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardSubtitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardSubtitle({ children, className = '', ...props }: CardSubtitleProps) {
  return (
    <div className={`text-xs text-[var(--color-text-muted)] mt-0.5 ${className}`} {...props}>
      {children}
    </div>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({ children, className = '', ...props }: CardFooterProps) {
  return (
    <div className={`flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-divider)] ${className}`} {...props}>
      {children}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Card.tsx
grep -q "Card" src/components/ui/Card.tsx
grep -q "CardHeader" src/components/ui/Card.tsx
grep -q "CardTitle" src/components/ui/Card.tsx
```
</verify>
<acceptance_criteria>
- Card has default, outlined, elevated variants
- Card with CardHeader, CardTitle, CardSubtitle, CardContent, CardFooter exports
- CardHeader has action slot for buttons
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Badge.tsx
</files>
<action>
Create Badge component with status variants:

```typescript
import React from 'react'

type BadgeVariant = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'success' | 'warning' | 'error' | 'default'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  pending: { bg: 'var(--color-surface-offset)', text: 'var(--color-text-muted)' },
  in_progress: { bg: 'var(--color-primary-light)', text: 'var(--color-primary)' },
  completed: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  blocked: { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
  success: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  error: { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
  default: { bg: 'var(--color-surface-offset)', text: 'var(--color-text-muted)' },
}

export function Badge({ variant = 'default', size = 'md', dot = true, children, className = '', ...props }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
        font-bold rounded-full
        ${className}
      `.trim()}
      style={{ background: styles.bg, color: styles.text }}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export const WorkflowStatusBadge: Record<string, BadgeVariant> = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
  blocked: 'blocked',
}
```
</action>
<verify>
```bash
test -f src/components/ui/Badge.tsx
grep -q "Badge" src/components/ui/Badge.tsx
grep -q "completed" src/components/ui/Badge.tsx
grep -q "pending" src/components/ui/Badge.tsx
```
</verify>
<acceptance_criteria>
- Badge has pending, in_progress, completed, blocked, success, warning, error, default variants
- Completed uses success (green) colors
- In progress uses primary (teal) colors
- Blocked/Error uses error (red) colors
- Dot indicator before text
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Table.tsx
</files>
<action>
Create Table wrapper components:

```typescript
import React from 'react'

interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Table({ children, className = '', ...props }: TableProps) {
  return (
    <div
      className={`overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] ${className}`}
      {...props}
    >
      <table className="w-full">{children}</table>
    </div>
  )
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export function TableHead({ children, className = '', ...props }: TableHeadProps) {
  return (
    <thead className={`bg-[var(--color-surface-offset)] ${className}`} {...props}>
      {children}
    </thead>
  )
}

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export function TableHeader({ children, className = '', ...props }: TableHeaderProps) {
  return (
    <th
      className={`
        px-4 py-3 text-right text-xs font-bold uppercase tracking-wider
        text-[var(--color-text-muted)]
        whitespace-nowrap
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </th>
  )
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

export function TableBody({ children, className = '', ...props }: TableBodyProps) {
  return <tbody className={className} {...props}>{children}</tbody>
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
  onClick?: () => void
}

export function TableRow({ children, onClick, className = '', ...props }: TableRowProps) {
  return (
    <tr
      className={`
        border-t border-[var(--color-border)]
        ${onClick ? 'cursor-pointer hover:bg-[var(--color-surface-offset)]' : ''}
        ${className}
      `.trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  )
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-sm ${className}`} {...props}>
      {children}
    </td>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Table.tsx
grep -q "Table" src/components/ui/Table.tsx
grep -q "TableHead" src/components/ui/Table.tsx
grep -q "TableBody" src/components/ui/Table.tsx
```
</verify>
<acceptance_criteria>
- Table wrapper has overflow-x-auto for horizontal scrolling
- TableHead has surface-offset background
- TableHeader text is uppercase, bold, muted
- TableRow has hover state and optional onClick
- Proper RTL text alignment
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/SearchBar.tsx
</files>
<action>
Create SearchBar component:

```typescript
import React, { useState, useCallback } from 'react'

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch?: (value: string) => void
  onDebouncedSearch?: (value: string) => void
  debounceMs?: number
}

export function SearchBar({
  onSearch,
  onDebouncedSearch,
  debounceMs = 300,
  className = '',
  ...props
}: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      onSearch?.(newValue)

      if (onDebouncedSearch) {
        const timeoutId = setTimeout(() => {
          onDebouncedSearch(newValue)
        }, debounceMs)
        return () => clearTimeout(timeoutId)
      }
    },
    [onSearch, onDebouncedSearch, debounceMs]
  )

  return (
    <div
      className={`
        relative flex items-center gap-2
        px-3 py-2 rounded-[var(--radius-md)]
        bg-[var(--color-surface-offset)]
        border border-[var(--color-border)]
        focus-within:bg-[var(--color-surface)]
        focus-within:border-[var(--color-primary)]
        focus-within:ring-2 focus-within:ring-[var(--color-primary-light)]
        transition-all duration-150
        ${className}
      `}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]"
        value={value}
        onChange={handleChange}
        {...props}
      />
      {value && (
        <button
          onClick={() => {
            setValue('')
            onSearch?.('')
          }}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/SearchBar.tsx
grep -q "SearchBar" src/components/ui/SearchBar.tsx
grep -q "SearchBar" src/components/ui/SearchBar.tsx
```
</verify>
<acceptance_criteria>
- SearchBar has search icon
- Focus state shows primary color ring
- Clear button when value exists
- onSearch and onDebouncedSearch callback options
- Debounce support for API calls
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Tabs.tsx
</files>
<action>
Create Tabs component with controlled state:

```typescript
'use client'

import React, { useState, useCallback } from 'react'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  children?: React.ReactNode
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabClick = useCallback(
    (tabId: string, disabled?: boolean) => {
      if (disabled) return
      setActiveTab(tabId)
      onChange?.(tabId)
    },
    [onChange]
  )

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              disabled={tab.disabled}
              className={`
                px-4 py-2 rounded-[var(--radius-md)]
                text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-divider)]'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {tab.icon && <span className="ml-2">{tab.icon}</span>}
              {tab.label}
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}

interface TabPanelProps {
  id: string
  children: React.ReactNode
}

export function TabPanel({ id, children }: TabPanelProps) {
  return <div data-tab-panel={id}>{children}</div>
}
```
</action>
<verify>
```bash
test -f src/components/ui/Tabs.tsx
grep -q "Tabs" src/components/ui/Tabs.tsx
grep -q "activeTab" src/components/ui/Tabs.tsx
```
</verify>
<acceptance_criteria>
- Tabs accepts Tab[] with id, label, icon, disabled
- Active tab has primary background
- Tab disabled state supported
- TabPanel for content sections
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/dashboard/KpiCard.tsx
</files>
<action>
Create KpiCard component:

```typescript
import React from 'react'
import { Card } from '@/components/ui/Card'

interface KpiCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    positive?: boolean
  }
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function KpiCard({ title, value, change, icon, trend, variant = 'default' }: KpiCardProps) {
  const trendColors = {
    up: 'text-[var(--color-success)]',
    down: 'text-[var(--color-error)]',
    neutral: 'text-[var(--color-text-muted)]',
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${change.positive ? 'text-[var(--color-success)]' : trendColors[trend || 'neutral']}`}>
              {change.positive !== false && change.value > 0 ? '+' : ''}
              {change.value} {change.label}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center"
            style={{ background: 'var(--color-primary-light)' }}
          >
            <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
          </div>
        )}
      </div>
    </Card>
  )
}
```
</action>
<verify>
```bash
test -f src/components/dashboard/KpiCard.tsx
grep -q "KpiCard" src/components/dashboard/KpiCard.tsx
```
</verify>
<acceptance_criteria>
- KpiCard has title, value, change, icon props
- Trend indicator with up/down colors
- Large value display with secondary label
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/dashboard/KpiGrid.tsx
</files>
<action>
Create KpiGrid component:

```typescript
import React from 'react'
import { KpiCard } from '@/components/dashboard/KpiCard'

interface KpiItem {
  id: string
  title: string
  value: string | number
  change?: { value: number; label: string; positive?: boolean }
  icon?: React.ReactNode
}

interface KpiGridProps {
  items: KpiItem[]
}

const iconMap: Record<string, React.ReactNode> = {
  'file-text': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  'git-branch': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
}

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <KpiCard
          key={item.id}
          title={item.title}
          value={item.value}
          change={item.change}
          icon={typeof item.icon === 'string' ? iconMap[item.icon] || null : item.icon}
        />
      ))}
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/dashboard/KpiGrid.tsx
grep -q "KpiGrid" src/components/dashboard/KpiGrid.tsx
```
</verify>
<acceptance_criteria>
- KpiGrid accepts array of KpiItem
- 4 column responsive grid
- Built-in icon map for common icons
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/workflow/WorkflowStep.tsx
</files>
<action>
Create WorkflowStep component:

```typescript
import React from 'react'
import { Badge } from '@/components/ui/Badge'
import type { StepStatus } from '@/types/database.types'

interface WorkflowStepProps {
  name: string
  status: StepStatus
  assignedTo?: string
  completedAt?: string
  fees?: number
  profit?: number
  isLocked?: boolean
  stepNumber?: number
}

const statusConfig: Record<StepStatus, { label: string; variant: 'pending' | 'in_progress' | 'completed' | 'blocked' }> = {
  pending: { label: 'في الانتظار', variant: 'pending' },
  in_progress: { label: 'جاري', variant: 'in_progress' },
  completed: { label: 'مكتمل', variant: 'completed' },
  blocked: { label: 'موقوف', variant: 'blocked' },
}

export function WorkflowStep({
  name,
  status,
  assignedTo,
  completedAt,
  fees,
  profit,
  isLocked = false,
  stepNumber,
}: WorkflowStepProps) {
  const config = statusConfig[status]

  return (
    <div
      className={`
        flex gap-4 p-4 rounded-[var(--radius-lg)]
        border border-[var(--color-border)]
        ${isLocked ? 'opacity-50 pointer-events-none' : ''}
        ${status === 'completed' ? 'bg-[var(--color-success-light)] border-[var(--color-success)]/20' : 'bg-[var(--color-surface)]'}
      `}
    >
      {/* Step Circle */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          flex-shrink-0 text-sm font-bold
          ${status === 'completed' ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-surface-offset)]'}
        `}
      >
        {stepNumber || 1}
      </div>

      {/* Step Body */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{name}</span>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        {assignedTo && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{assignedTo}</span>
            {completedAt && (
              <>
                <span>·</span>
                <span>{completedAt}</span>
              </>
            )}
          </div>
        )}

        {/* Financial Info */}
        {(fees !== undefined || profit !== undefined) && (
          <div className="flex gap-4 mt-2 pt-2 border-t border-[var(--color-border)]">
            {fees !== undefined && fees > 0 && (
              <div className="text-xs">
                <span className="text-[var(--color-text-muted)]">رسوم: </span>
                <span className="font-semibold text-[var(--color-warning)]">
                  {fees.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            )}
            {profit !== undefined && profit > 0 && (
              <div className="text-xs">
                <span className="text-[var(--color-text-muted)]">أتعاب: </span>
                <span className="font-semibold text-[var(--color-success)]">
                  {profit.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            )}
          </div>
        )}

        {/* Lock Indicator */}
        {isLocked && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-[var(--radius-md)] bg-[var(--color-surface-offset)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--color-error)]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs text-[var(--color-text-muted)]">مقفل — يتطلب إنجاز المسار السابق</span>
          </div>
        )}
      </div>
    </div>
  )
}
</action>
<verify>
```bash
test -f src/components/workflow/WorkflowStep.tsx
grep -q "WorkflowStep" src/components/workflow/WorkflowStep.tsx
grep -q "fees.*profit" src/components/workflow/WorkflowStep.tsx
```
</verify>
<acceptance_criteria>
- WorkflowStep shows step name and status badge
- Step number circle
- Financial info shows fees in warning color, profit in success color
- Lock indicator when isLocked=true
- Arabic labels for status (في الانتظار, جاري, مكتمل, موقوف)
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/workflow/WorkflowTimeline.tsx
</files>
<action>
Create WorkflowTimeline component:

```typescript
import React from 'react'
import { WorkflowStep } from '@/components/workflow/WorkflowStep'
import type { WorkflowStepWithEmployee, StepStatus } from '@/types/database.types'

interface WorkflowTimelineProps {
  steps: WorkflowStepWithEmployee[]
  locked?: boolean
}

export function WorkflowTimeline({ steps, locked = false }: WorkflowTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-text-muted)]">
        لا توجد خطوات
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <WorkflowStep
          key={step.id}
          name={step.name}
          status={step.status as StepStatus}
          assignedTo={step.assigned_employee?.full_name}
          completedAt={step.completed_at ? new Date(step.completed_at).toLocaleDateString('ar-EG') : undefined}
          fees={step.fees}
          profit={step.profit}
          isLocked={locked}
          stepNumber={index + 1}
        />
      ))}
    </div>
  )
}
</action>
<verify>
```bash
test -f src/components/workflow/WorkflowTimeline.tsx
grep -q "WorkflowTimeline" src/components/workflow/WorkflowTimeline.tsx
```
</verify>
<acceptance_criteria>
- WorkflowTimeline renders list of WorkflowStep
- locked prop passed to all steps
- Empty state when no steps
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/workflow/WorkflowTabs.tsx
</files>
<action>
Create WorkflowTabs component:

```typescript
'use client'

import React from 'react'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline'
import type { WorkflowWithSteps } from '@/types/database.types'

interface WorkflowTabsProps {
  deviceLicenseWorkflow?: WorkflowWithSteps | null
  excavationPermitWorkflow?: WorkflowWithSteps | null
  deviceLicenseCompleted: boolean
}

const DEVICE_LICENSE_STEPS = [
  'بيان الصلاحية',
  'تقديم المجمعة العشرية للإسكان المميز',
  'تقديم الملف',
  'دفع إذن الرخصة وشراء عقد مخلفات',
  'استلام الرخصة',
]

const EXCAVATION_PERMIT_STEPS = [
  'تقديم واستلام شهادة الإشراف',
  'تقديم واستلام التأمينات',
  'التقديم على العداد الإنشائي',
  'تقديم ودفع واستلام تصريح الحفر',
  'تصريح التعدين',
]

export function WorkflowTabs({ deviceLicenseWorkflow, excavationPermitWorkflow, deviceLicenseCompleted }: WorkflowTabsProps) {
  const tabs = [
    { id: 'device', label: '🏗️ مسار رخصة الجهاز', disabled: false },
    { id: 'excavation', label: '⛏️ مسار تصريح الحفر', disabled: !deviceLicenseCompleted },
  ]

  return (
    <Tabs tabs={tabs}>
      {/* Device License Tab */}
      <TabPanel id="device">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>خطوات رخصة الجهاز</CardTitle>
              <CardSubtitle>المسار الأول · 5 خطوات رئيسية</CardSubtitle>
            </div>
          </CardHeader>
          <WorkflowTimeline
            steps={
              deviceLicenseWorkflow?.steps?.length
                ? deviceLicenseWorkflow.steps
                : DEVICE_LICENSE_STEPS.map((name, i) => ({
                    id: `placeholder-${i}`,
                    workflow_id: deviceLicenseWorkflow?.id || '',
                    step_order: i + 1,
                    name,
                    status: 'pending' as const,
                    assigned_to: null,
                    completed_at: null,
                    fees: 0,
                    profit: 0,
                    created_at: '',
                    updated_at: '',
                  }))
            }
          />
        </Card>
      </TabPanel>

      {/* Excavation Permit Tab */}
      <TabPanel id="excavation">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>خطوات تصريح الحفر</CardTitle>
              <CardSubtitle>المسار الثاني · 5 خطوات</CardSubtitle>
            </div>
          </CardHeader>
          {!deviceLicenseCompleted ? (
            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-error-light)] border border-[var(--color-error)]/20">
              <div className="flex items-center gap-3 text-[var(--color-error)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 flex-shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <div className="font-medium">المسار مقفل</div>
                  <div className="text-sm mt-1 opacity-75">
                    لا يمكن بدء مسار تصريح الحفر قبل اكتمال رخصة الجهاز بالكامل
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <WorkflowTimeline
              steps={
                excavationPermitWorkflow?.steps?.length
                  ? excavationPermitWorkflow.steps
                  : EXCAVATION_PERMIT_STEPS.map((name, i) => ({
                      id: `placeholder-${i}`,
                      workflow_id: excavationPermitWorkflow?.id || '',
                      step_order: i + 1,
                      name,
                      status: 'pending' as const,
                      assigned_to: null,
                      completed_at: null,
                      fees: 0,
                      profit: 0,
                      created_at: '',
                      updated_at: '',
                    }))
              }
            />
          )}
        </Card>
      </TabPanel>
    </Tabs>
  )
}
</action>
<verify>
```bash
test -f src/components/workflow/WorkflowTabs.tsx
grep -q "WorkflowTabs" src/components/workflow/WorkflowTabs.tsx
grep -q "deviceLicenseCompleted" src/components/workflow/WorkflowTabs.tsx
```
</verify>
<acceptance_criteria>
- WorkflowTabs has Device License and Excavation Permit tabs
- Excavation tab disabled until Device License completes
- Shows lock message when Excavation is locked
- Renders WorkflowTimeline for active steps
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/services/client.service.ts
</files>
<action>
Create client service with business logic:

```typescript
import { clientRepository } from '@/lib/database/repositories/client.repository'
import type { Client, ClientFilter, ClientWithWorkflows } from '@/types/database.types'
import { NotFoundError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface CreateClientDto {
  name: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
}

export interface UpdateClientDto {
  name?: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
}

export class ClientService {
  async findById(id: string): Promise<Client> {
    const client = await clientRepository.findById(id)
    if (!client) {
      throw new NotFoundError('العميل', id)
    }
    return client
  }

  async findAll(filter?: ClientFilter): Promise<Client[]> {
    return clientRepository.findAll(filter)
  }

  async search(query: string): Promise<Client[]> {
    if (!query || query.trim().length < 2) {
      return []
    }
    return clientRepository.search(query.trim())
  }

  async create(data: CreateClientDto, createdBy: string): Promise<Client> {
    this.validateClientData(data)
    return clientRepository.create({
      ...data,
      created_by: createdBy,
    })
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new NotFoundError('العميل', id)
    }
    return clientRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new NotFoundError('العميل', id)
    }
    await clientRepository.delete(id)
  }

  private validateClientData(data: CreateClientDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('اسم العميل مطلوب')
    }
  }
}

export const clientService = new ClientService()
```
</action>
<verify>
```bash
test -f src/lib/services/client.service.ts
grep -q "ClientService" src/lib/services/client.service.ts
```
</verify>
<acceptance_criteria>
- ClientService wraps repository with business logic
- Validation before create/update
- NotFoundError for missing clients
- Singleton exported
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/services/workflow.service.ts
</files>
<action>
Create workflow service:

```typescript
import { workflowRepository } from '@/lib/database/repositories/workflow.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { clientRepository } from '@/lib/database/repositories/client.repository'
import type { Workflow, WorkflowWithSteps, WorkflowStepWithEmployee } from '@/types/database.types'
import { NotFoundError, AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface CreateWorkflowDto {
  client_id: string
  type: 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT'
  assigned_to?: string
}

export interface CreateWorkflowStepsDto {
  workflow_id: string
  steps: Array<{
    step_order: number
    name: string
    assigned_to?: string
    fees?: number
    profit?: number
  }>
}

export class WorkflowService {
  async findById(id: string): Promise<Workflow | null> {
    return workflowRepository.findById(id)
  }

  async findByClientId(clientId: string): Promise<Workflow[]> {
    return workflowRepository.findByClientId(clientId)
  }

  async getWithSteps(id: string): Promise<WorkflowWithSteps> {
    const workflow = await workflowRepository.getWithSteps(id)
    if (!workflow) {
      throw new NotFoundError('المسار', id)
    }
    return workflow
  }

  async createWithSteps(data: CreateWorkflowDto, stepsData: CreateWorkflowStepsDto['steps']): Promise<WorkflowWithSteps> {
    const existingClient = await clientRepository.findById(data.client_id)
    if (!existingClient) {
      throw new NotFoundError('العميل', data.client_id)
    }

    const existingWorkflows = await workflowRepository.findByClientId(data.client_id)
    if (data.type === 'EXCAVATION_PERMIT') {
      const deviceLicense = existingWorkflows.find((w) => w.type === 'DEVICE_LICENSE')
      if (!deviceLicense || deviceLicense.status !== 'completed') {
        throw new AppError({
          code: ErrorCodes.WORKFLOW_DEPENDENCY_NOT_MET,
          message: 'رخصة الجهاز يجب أن تكتمل أولاً',
          statusCode: 400,
          context: { requiredWorkflow: 'DEVICE_LICENSE' },
        })
      }
    }

    const workflow = await workflowRepository.create(data)

    const steps = await Promise.all(
      stepsData.map((step) =>
        workflowStepRepository.create({
          workflow_id: workflow.id,
          step_order: step.step_order,
          name: step.name,
          assigned_to: step.assigned_to,
          fees: step.fees || 0,
          profit: step.profit || 0,
        })
      )
    )

    return {
      ...workflow,
      steps,
    }
  }

  async updateStatus(id: string, status: Workflow['status']): Promise<Workflow> {
    const workflow = await workflowRepository.findById(id)
    if (!workflow) {
      throw new NotFoundError('المسار', id)
    }
    return workflowRepository.updateStatus(id, status)
  }

  async checkDependency(clientId: string, workflowType: 'EXCAVATION_PERMIT'): Promise<boolean> {
    const workflows = await workflowRepository.findByClientId(clientId)
    const deviceLicense = workflows.find((w) => w.type === 'DEVICE_LICENSE')
    return deviceLicense?.status === 'completed'
  }
}

export const workflowService = new WorkflowService()
```
</action>
<verify>
```bash
test -f src/lib/services/workflow.service.ts
grep -q "WorkflowService" src/lib/services/workflow.service.ts
grep -q "checkDependency" src/lib/services/workflow.service.ts
```
</verify>
<acceptance_criteria>
- WorkflowService wraps repositories with business logic
- createWithSteps creates workflow and steps in transaction-like manner
- checkDependency validates EXCAVATION_PERMIT requires DEVICE_LICENSE completed
- NotFoundError and AppError for error handling
- Singleton exported
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/hooks/useClients.ts
</files>
<action>
Create useClients hook:

```typescript
import { useState, useCallback, useEffect } from 'react'
import { clientService, CreateClientDto, UpdateClientDto } from '@/lib/services/client.service'
import type { Client } from '@/types/database.types'

interface UseClientsReturn {
  clients: Client[]
  loading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: Client[]
  isSearching: boolean
  fetchClients: () => Promise<void>
  createClient: (data: CreateClientDto) => Promise<Client>
  updateClient: (id: string, data: UpdateClientDto) => Promise<Client>
  deleteClient: (id: string) => Promise<void>
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await clientService.findAll()
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await clientService.search(query)
      setSearchResults(results)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => search(searchQuery), 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, search])

  const createClient = useCallback(
    async (data: CreateClientDto) => {
      const newClient = await clientService.create(data, 'current-user-id')
      setClients((prev) => [newClient, ...prev])
      return newClient
    },
    []
  )

  const updateClient = useCallback(async (id: string, data: UpdateClientDto) => {
    const updated = await clientService.update(id, data)
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    await clientService.delete(id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return {
    clients,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  }
}
```
</action>
<verify>
```bash
test -f src/hooks/useClients.ts
grep -q "useClients" src/hooks/useClients.ts
grep -q "createClient" src/hooks/useClients.ts
```
</verify>
<acceptance_criteria>
- useClients hook manages client state
- search with debounce (300ms)
- CRUD operations sync local state
- Loading and error states
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/hooks/useWorkflows.ts
</files>
<action>
Create useWorkflows hook:

```typescript
import { useState, useCallback, useEffect } from 'react'
import { workflowService } from '@/lib/services/workflow.service'
import type { WorkflowWithSteps } from '@/types/database.types'

interface UseWorkflowsReturn {
  deviceLicense: WorkflowWithSteps | null
  excavationPermit: WorkflowWithSteps | null
  deviceLicenseCompleted: boolean
  loading: boolean
  error: string | null
  fetchWorkflows: (clientId: string) => Promise<void>
}

export function useWorkflows(clientId?: string): UseWorkflowsReturn {
  const [deviceLicense, setDeviceLicense] = useState<WorkflowWithSteps | null>(null)
  const [excavationPermit, setExcavationPermit] = useState<WorkflowWithSteps | null>(null)
  const [deviceLicenseCompleted, setDeviceLicenseCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflows = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const workflows = await workflowService.findByClientId(id)
      const device = workflows.find((w) => w.type === 'DEVICE_LICENSE') || null
      const excavation = workflows.find((w) => w.type === 'EXCAVATION_PERMIT') || null

      if (device) {
        const deviceWithSteps = await workflowService.getWithSteps(device.id)
        setDeviceLicense(deviceWithSteps)
        setDeviceLicenseCompleted(device.status === 'completed')
      } else {
        setDeviceLicense(null)
        setDeviceLicenseCompleted(false)
      }

      if (excavation) {
        const excavationWithSteps = await workflowService.getWithSteps(excavation.id)
        setExcavationPermit(excavationWithSteps)
      } else {
        setExcavationPermit(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (clientId) {
      fetchWorkflows(clientId)
    }
  }, [clientId, fetchWorkflows])

  return {
    deviceLicense,
    excavationPermit,
    deviceLicenseCompleted,
    loading,
    error,
    fetchWorkflows,
  }
}
```
</action>
<verify>
```bash
test -f src/hooks/useWorkflows.ts
grep -q "useWorkflows" src/hooks/useWorkflows.ts
```
</verify>
<acceptance_criteria>
- useWorkflows hook manages workflow state for a client
- Fetches device license and excavation permit workflows
- Tracks deviceLicenseCompleted for locking
- Loading and error states
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(dashboard)/layout.tsx
</files>
<action>
Create dashboard layout:

```typescript
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/layout.tsx
grep -q "DashboardLayout" src/app/\(dashboard\)/layout.tsx
```
</verify>
<acceptance_criteria>
- Dashboard layout wraps children with DashboardLayout component
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(dashboard)/dashboard/page.tsx
</files>
<action>
Create dashboard page with KPIs:

```typescript
'use client'

import React from 'react'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/auth/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  const kpiItems = [
    {
      id: 'clients',
      title: 'إجمالي العملاء',
      value: '24',
      change: { value: 3, label: 'هذا الشهر' },
      icon: 'users',
    },
    {
      id: 'workflows',
      title: 'مسارات العمل النشطة',
      value: '18',
      change: { value: 5, label: 'هذا الأسبوع' },
      icon: 'git-branch',
    },
    {
      id: 'completed',
      title: 'تم الإنجاز',
      value: '156',
      change: { value: 12, label: 'هذا الشهر', positive: true },
      icon: 'check',
    },
    {
      id: 'pending',
      title: 'في الانتظار',
      value: '8',
      change: { value: -2, label: 'عن الشهر الماضي', positive: false },
      icon: 'file-text',
    },
  ]

  const recentWorkflows = [
    { client: 'أحمد محمد', type: 'DEVICE_LICENSE', status: 'in_progress', updatedAt: 'منذ ساعة' },
    { client: 'فاطمة علي', type: 'EXCAVATION_PERMIT', status: 'pending', updatedAt: 'منذ 3 ساعات' },
    { client: 'خالد سليم', type: 'DEVICE_LICENSE', status: 'completed', updatedAt: 'منذ يوم' },
    { client: 'نورة أحمد', type: 'DEVICE_LICENSE', status: 'in_progress', updatedAt: 'منذ يومين' },
  ]

  return (
    <div className="p-6 max-w-[1300px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold mb-1">لوحة التحكم</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          مرحباً، {user?.full_name || 'مستخدم'}
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-6">
        <KpiGrid items={kpiItems} />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardSubtitle>آخر المسارات المحدثة</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWorkflows.map((workflow, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-[var(--color-divider)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface-offset)] flex items-center justify-center text-xs font-bold">
                    {workflow.client[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{workflow.client}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {workflow.type === 'DEVICE_LICENSE' ? 'رخصة جهاز' : 'تصريح حفر'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-faint)]">{workflow.updatedAt}</span>
                  <Badge variant={workflow.status as 'pending' | 'in_progress' | 'completed'}>
                    {workflow.status === 'pending' ? 'في الانتظار' : workflow.status === 'in_progress' ? 'جاري' : 'مكتمل'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/dashboard/page.tsx
grep -q "KpiGrid" src/app/\(dashboard\)/dashboard/page.tsx
grep -q "لوحة التحكم" src/app/\(dashboard\)/dashboard/page.tsx
```
</verify>
<acceptance_criteria>
- Dashboard shows welcome message with user name
- KpiGrid with 4 KPI cards
- Recent activity list with status badges
- Arabic labels throughout
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(dashboard)/clients/page.tsx
</files>
<action>
Create clients list page:

```typescript
'use client'

import React from 'react'
import Link from 'next/link'
import { useClients } from '@/hooks/useClients'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function ClientsPage() {
  const {
    clients,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
  } = useClients()

  const displayClients = searchQuery.length >= 2 ? searchResults : clients

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-error-light)] text-[var(--color-error)]">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1300px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">ملفات العملاء</h1>
        <Button>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة عميل
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar
          placeholder="بحث بالاسم أو الهاتف أو رقم القطعة..."
          value={searchQuery}
          onSearch={setSearchQuery}
        />
        {isSearching && (
          <div className="mt-2 text-xs text-[var(--color-text-muted)]">جارٍ البحث...</div>
        )}
      </div>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner label="جارٍ تحميل العملاء..." />
          </div>
        ) : displayClients.length === 0 ? (
          <EmptyState
            icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8"
            title="لا يوجد عملاء"
            description={searchQuery ? 'لم يتم العثور على نتائج للبحث' : 'أضف أول عميل للبدء'}
            action={searchQuery ? undefined : {
              label: 'إضافة عميل',
              onClick: () => {},
            }}
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>الاسم</TableHeader>
                <TableHeader>الهاتف</TableHeader>
                <TableHeader>المدينة</TableHeader>
                <TableHeader>المنطقة</TableHeader>
                <TableHeader>رقم القطعة</TableHeader>
                <TableHeader>تاريخ الإنشاء</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayClients.map((client) => (
                <TableRow key={client.id} onClick={() => {}}>
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell dir="ltr">{client.phone || '-'}</TableCell>
                  <TableCell>{client.city || '-'}</TableCell>
                  <TableCell>{client.district || '-'}</TableCell>
                  <TableCell dir="ltr">{client.parcel_number || '-'}</TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleDateString('ar-EG')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/clients/page.tsx
grep -q "useClients" src/app/\(dashboard\)/clients/page.tsx
grep -q "بحث" src/app/\(dashboard\)/clients/page.tsx
```
</verify>
<acceptance_criteria>
- Client list page displays table of clients
- Search filters by name, phone, parcel number (debounced 300ms)
- Add client button present
- Click on client name navigates to profile page
- Empty state when no results
- Loading state while fetching
- Arabic labels throughout
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(dashboard)/clients/[id]/page.tsx
</files>
<action>
Create client profile page with workflow tabs:

```typescript
'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { clientService } from '@/lib/services/client.service'
import { useWorkflows } from '@/hooks/useWorkflows'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { WorkflowTabs } from '@/components/workflow/WorkflowTabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Client } from '@/types/database.types'

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    deviceLicense,
    excavationPermit,
    deviceLicenseCompleted,
    loading: workflowsLoading,
    fetchWorkflows,
  } = useWorkflows(clientId)

  useEffect(() => {
    async function loadClient() {
      try {
        const data = await clientService.findById(clientId)
        setClient(data)
        await fetchWorkflows(clientId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client')
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [clientId, fetchWorkflows])

  if (loading || workflowsLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner label="جارٍ تحميل بيانات العميل..." />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <EmptyState
          icon="M12 9v2m0 4h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          title="العميل غير موجود"
          description={error || 'لم يتم العثور على بيانات العميل'}
          action={{
            label: 'العودة للقائمة',
            onClick: () => {},
          }}
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1300px]">
      {/* Client Header */}
      <Card className="mb-6">
        <CardHeader>
          <div>
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <CardSubtitle>
              {[
                client.city,
                client.district,
                client.parcel_number ? `قطعة ${client.parcel_number}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </CardSubtitle>
          </div>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[var(--color-divider)]">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">الهاتف</p>
            <p className="text-sm font-medium" dir="ltr">{client.phone || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">المدينة</p>
            <p className="text-sm font-medium">{client.city || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">المنطقة</p>
            <p className="text-sm font-medium">{client.district || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">رقم القطعة</p>
            <p className="text-sm font-medium" dir="ltr">{client.parcel_number || '-'}</p>
          </div>
        </div>
      </Card>

      {/* Workflow Tabs */}
      <WorkflowTabs
        deviceLicenseWorkflow={deviceLicense}
        excavationPermitWorkflow={excavationPermit}
        deviceLicenseCompleted={deviceLicenseCompleted}
      />
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/clients/\[id\]/page.tsx
grep -q "WorkflowTabs" src/app/\(dashboard\)/clients/\[id\]/page.tsx
grep -q "deviceLicenseCompleted" src/app/\(dashboard\)/clients/\[id\]/page.tsx
```
</verify>
<acceptance_criteria>
- Client profile shows client details
- WorkflowTabs with Device License and Excavation Permit
- Client info grid shows phone, city, district, parcel
- Empty state when client not found
- Loading state while fetching
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Client list page displays with search functionality (debounced)
2. Client profile shows all address fields
3. Workflow tabs switch between Device License and Excavation Permit
4. Workflow steps display with correct status styling
5. Fees shown in warning color, profit in success color
6. Dependency lock shown when Device License not completed
7. Dashboard shows KPI cards with activity
8. All components use modular structure
</verification>

<success_criteria>
- /dashboard page shows KPIs and recent activity
- /clients page shows searchable client list
- /clients/[id] shows client profile with workflow tabs
- Both workflows show 5 steps each with correct Arabic names
- Step status badges display correctly
- Financial amounts display in Arabic formatting
- Excavation Permit tab shows lock when Device License incomplete
- All data fetching uses hooks and services
</success_criteria>

<threat_model>
- **Data Exposure:** RLS policies prevent employees from viewing unassigned client workflows. Service layer validates access.
- **Search Injection:** Supabase `ilike` query sanitization prevents injection. Minimum 2 character search requirement.
- **Dependency Bypass:** WorkflowService.checkDependency validates EXCAVATION_PERMIT requires DEVICE_LICENSE completed.
- **Mitigation:** Test RLS with different user roles before production. Validate all service inputs.
</threat_model>

---

*P-03: CRM Core + Workflow UI (Enterprise Modular)*