---
phase: 1
plan: P-03
type: execute
wave: 2
depends_on:
  - P-01
files_modified:
  - src/app/(dashboard)/clients/page.tsx
  - src/app/(dashboard)/clients/[id]/page.tsx
  - src/components/ui/Card.tsx
  - src/components/ui/Badge.tsx
  - src/components/ui/Table.tsx
  - src/components/ui/SearchBar.tsx
  - src/components/ui/Tabs.tsx
  - src/components/workflow/WorkflowStep.tsx
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
Build the CRM core: client database with search, client list view, and client profile view with workflow tabs. Display workflow steps for both Device License and Excavation Permit with status, assigned employee, completion date, and financial info (fees/profit). This is UI-only skeleton in Phase 1.
</objective>

<read_first>
- rakhtety-erp-demo.html (clients table: ~700-900, workflow UI: ~905-1070, badge styles: ~226-241, search bar: ~350-380)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-05: workflows table with type column, D-06: separate workflow_steps table)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Component Inventory, Workflow UI section)
- .planning/phases/01-core-foundation/01-RESEARCH.md (Database Schema: clients, workflows, workflow_steps tables)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - src/components/ui/Card.tsx
</files>
<action>
Create Card component:

```tsx
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-[var(--color-surface)]
        border border-[var(--color-border)]
        rounded-[var(--radius-xl)]
        p-5
        shadow-[var(--shadow-sm)]
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      {children}
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
- Card component has rounded-xl with surface background and border
- CardHeader exports flexbox with justify-between
- CardTitle has text-base font-bold styling
- Shadow uses CSS variable --shadow-sm
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Badge.tsx
</files>
<action>
Create Badge component with status variants:

```tsx
import React from 'react'

type BadgeVariant = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'default'

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)]',
  in_progress: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
  completed: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  blocked: 'bg-[var(--color-error-light)] text-[var(--color-error)]',
  default: 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)]'
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: React.ReactNode
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-0.5 rounded-full
        text-[10px] font-bold
        ${variantStyles[variant]}
        ${className}
      `.trim()}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/Badge.tsx
grep -q "completed" src/components/ui/Badge.tsx
grep -q "pending" src/components/ui/Badge.tsx
grep -q "in_progress" src/components/ui/Badge.tsx
```
</verify>
<acceptance_criteria>
- Badge has pending, in_progress, completed, blocked variants
- Completed uses --color-success (green)
- In progress uses --color-primary (teal)
- Blocked/Error uses --color-error (red)
- Dot indicator before text
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Table.tsx
</files>
<action>
Create Table wrapper component:

```tsx
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

export function TableHead({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`bg-[var(--color-surface-offset)] ${className}`} {...props}>
      {children}
    </thead>
  )
}

export function TableHeader({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
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

export function TableBody({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props}>{children}</tbody>
}

export function TableRow({ children, className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={`border-t border-[var(--color-border)] hover:bg-[var(--color-surface-offset)] ${className}`} {...props}>
      {children}
    </tr>
  )
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
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
grep -q "TableHead" src/components/ui/Table.tsx
grep -q "TableBody" src/components/ui/Table.tsx
grep -q "overflow-x-auto" src/components/ui/Table.tsx
```
</verify>
<acceptance_criteria>
- Table wrapper has overflow-x-auto for horizontal scrolling
- TableHead has surface-offset background
- TableHeader text is uppercase, bold, muted
- TableRow has hover state
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

```tsx
import React from 'react'

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
}

export function SearchBar({ onSearch, className = '', ...props }: SearchBarProps) {
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
        className="w-4 h-4 text-[var(--color-text-muted)]"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        className="flex-1 bg-transparent outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)]"
        onChange={(e) => onSearch?.(e.target.value)}
        {...props}
      />
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/ui/SearchBar.tsx
grep -q "SearchBar" src/components/ui/SearchBar.tsx
grep -q "placeholder" src/components/ui/SearchBar.tsx
```
</verify>
<acceptance_criteria>
- SearchBar has search icon
- Focus state shows primary color ring
- Placeholder text support
- onSearch callback prop
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/ui/Tabs.tsx
</files>
<action>
Create Tabs component for Device License / Excavation Permit:

```tsx
'use client'

import React, { useState } from 'react'

interface Tab {
  id: string
  label: string
  icon?: string
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  children?: React.ReactNode
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  function handleTabClick(tabId: string) {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                px-4 py-2 rounded-[var(--radius-md)]
                text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-offset)] text-[var(--color-text-muted)] hover:bg-[var(--color-divider)]'
                }
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

export function TabPanel({ id, children, isActive }: { id: string; children: React.ReactNode; isActive: boolean }) {
  if (!isActive) return null
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
- Tabs component accepts array of tabs with id and label
- Active tab has primary background
- Inactive tabs have muted background
- TabPanel shows/hides based on activeTab
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/components/workflow/WorkflowStep.tsx
</files>
<action>
Create WorkflowStep component:

```tsx
import React from 'react'
import { Badge } from '@/components/ui/Badge'

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

interface WorkflowStepProps {
  name: string
  status: StepStatus
  assignedTo?: string
  completedAt?: string
  fees?: number
  profit?: number
  isLocked?: boolean
}

const statusConfig: Record<StepStatus, { label: string; variant: 'pending' | 'in_progress' | 'completed' | 'blocked' }> = {
  pending: { label: 'في الانتظار', variant: 'pending' },
  in_progress: { label: 'جاري', variant: 'in_progress' },
  completed: { label: 'مكتمل', variant: 'completed' },
  blocked: { label: 'موقوف', variant: 'blocked' }
}

export function WorkflowStep({
  name,
  status,
  assignedTo,
  completedAt,
  fees,
  profit,
  isLocked = false
}: WorkflowStepProps) {
  const config = statusConfig[status]

  return (
    <div
      className={`
        flex gap-4 p-4 rounded-[var(--radius-lg)]
        border border-[var(--color-border)]
        ${isLocked ? 'opacity-50 pointer-events-none' : ''}
        ${status === 'completed' ? 'bg-[var(--color-success-light)]' : 'bg-[var(--color-surface)]'}
      `}
    >
      {/* Step Circle */}
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center
          flex-shrink-0
          ${status === 'completed' ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-surface-offset)]'}
        `}
      >
        {status === 'completed' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : status === 'in_progress' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : null}
      </div>

      {/* Step Body */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm">{name}</span>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        {assignedTo && (
          <div className="text-xs text-[var(--color-text-muted)] mb-2">
            {status === 'completed' && completedAt ? `${completedAt} · ` : ''}
            {assignedTo}
          </div>
        )}

        {/* Financial Info */}
        {(fees !== undefined || profit !== undefined) && (
          <div className="flex gap-4 mt-2">
            {fees !== undefined && fees > 0 && (
              <div className="text-xs">
                <span className="text-[var(--color-text-muted)]">رسوم: </span>
                <span className="font-semibold text-[var(--color-warning)]">{fees.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}
            {profit !== undefined && profit > 0 && (
              <div className="text-xs">
                <span className="text-[var(--color-text-muted)]">أتعاب: </span>
                <span className="font-semibold text-[var(--color-success)]">{profit.toLocaleString('ar-EG')} ج.م</span>
              </div>
            )}
          </div>
        )}

        {/* Lock Icon for Dependency */}
        {isLocked && (
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-error)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>مقفل — يتطلب إنجاز المسار السابق</span>
          </div>
        )}
      </div>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/components/workflow/WorkflowStep.tsx
grep -q "WorkflowStep" src/components/workflow/WorkflowStep.tsx
grep -q "fees.*profit" src/components/workflow/WorkflowStep.tsx
grep -q "completed.*success" src/components/workflow/WorkflowStep.tsx
```
</verify>
<acceptance_criteria>
- WorkflowStep shows step name and status badge
- Completed steps have checkmark icon in success-colored circle
- Financial info shows fees in warning color, profit in success color
- Lock icon and message when isLocked=true
- Arabic labels for status (في الانتظار, جاري, مكتمل, موقوف)
- Arabic number formatting for financial amounts
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/app/(dashboard)/clients/page.tsx
</files>
<action>
Create client list page with search:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { SearchBar } from '@/components/ui/SearchBar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  phone: string
  city: string
  district: string
  parcel_number: string
  created_at: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setClients(data)
      }
      setLoading(false)
    }

    fetchClients()
  }, [])

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase()
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.parcel_number?.toLowerCase().includes(query)
    )
  })

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
      </div>

      {/* Table */}
      <Card>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[var(--color-text-muted)]">
                  جارٍ التحميل...
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[var(--color-text-muted)]">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Link href={`/clients/${client.id}`} className="font-semibold hover:text-[var(--color-primary)]">
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell dir="ltr">{client.phone || '-'}</TableCell>
                  <TableCell>{client.city || '-'}</TableCell>
                  <TableCell>{client.district || '-'}</TableCell>
                  <TableCell dir="ltr">{client.parcel_number || '-'}</TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleDateString('ar-EG')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/clients/page.tsx
grep -q "supabase.from('clients')" src/app/\(dashboard\)/clients/page.tsx
grep -q "بحث" src/app/\(dashboard\)/clients/page.tsx
grep -q "إضافة عميل" src/app/\(dashboard\)/clients/page.tsx
```
</verify>
<acceptance_criteria>
- Client list page displays table of clients
- Search filters by name, phone, parcel number (CRM-02)
- Add client button present (CRM-01)
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

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { Tabs, TabPanel } from '@/components/ui/Tabs'
import { WorkflowStep } from '@/components/workflow/WorkflowStep'
import { Badge } from '@/components/ui/Badge'

interface Client {
  id: string
  name: string
  phone: string
  city: string
  district: string
  neighborhood: string
  parcel_number: string
}

interface Workflow {
  id: string
  type: 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT'
  status: string
  assigned_to: string
}

interface WorkflowStepData {
  id: string
  step_order: number
  name: string
  status: string
  completed_at: string | null
  fees: number
  profit: number
  assigned_to: string
  assigned_employee?: { full_name: string }
}

const DEVICE_LICENSE_STEPS = [
  'بيان الصلاحية',
  'تقديم المجمعة العشرية للإسكان المميز',
  'تقديم الملف',
  'دفع إذن الرخصة وشراء عقد مخلفات',
  'استلام الرخصة'
]

const EXCAVATION_PERMIT_STEPS = [
  'تقديم واستلام شهادة الإشراف',
  'تقديم واستلام التأمينات',
  'التقديم على العداد الإنشائي',
  'تقديم ودفع واستلام تصريح الحفر',
  'تصريح التعدين'
]

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [workflowSteps, setWorkflowSteps] = useState<Record<string, WorkflowStepData[]>>({})
  const [loading, setLoading] = useState(true)
  const [deviceLicenseCompleted, setDeviceLicenseCompleted] = useState(false)

  useEffect(() => {
    async function fetchData() {
      // Fetch client
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      setClient(clientData)

      // Fetch workflows
      const { data: workflowData } = await supabase
        .from('workflows')
        .select('*')
        .eq('client_id', clientId)

      setWorkflows(workflowData || [])

      // Check if device license is completed
      const deviceWorkflow = (workflowData || []).find((w) => w.type === 'DEVICE_LICENSE')
      if (deviceWorkflow) {
        const { data: steps } = await supabase
          .from('workflow_steps')
          .select('*, assigned_employee:profiles(full_name)')
          .eq('workflow_id', deviceWorkflow.id)
          .order('step_order')

        setWorkflowSteps((prev) => ({ ...prev, [deviceWorkflow.id]: steps || [] }))
        setDeviceLicenseCompleted(deviceWorkflow.status === 'completed')
      }

      setLoading(false)
    }

    fetchData()
  }, [clientId])

  if (loading) {
    return <div className="p-6">جارٍ التحميل...</div>
  }

  if (!client) {
    return <div className="p-6">العميل غير موجود</div>
  }

  return (
    <div className="p-6 max-w-[1300px]">
      {/* Client Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold mb-1">{client.name}</h1>
        <div className="flex gap-2 text-sm text-[var(--color-text-muted)]">
          <span>{client.city}</span>
          <span>—</span>
          <span>{client.district}</span>
          <span>—</span>
          <span>قطعة {client.parcel_number}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'device', label: '🏗️ مسار رخصة الجهاز' },
          { id: 'excavation', label: '⛏️ مسار تصريح الحفر' }
        ]}
      >
        {/* Device License Tab */}
        <TabPanel id="device" isActive={true}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>خطوات رخصة الجهاز</CardTitle>
                <CardSubtitle>المسار الأول · 5 خطوات رئيسية</CardSubtitle>
              </div>
            </CardHeader>
            <div className="flex flex-col gap-3">
              {DEVICE_LICENSE_STEPS.map((stepName, index) => {
                const workflow = workflows.find((w) => w.type === 'DEVICE_LICENSE')
                const stepData = workflowSteps[workflow?.id]?.[index]
                const status = stepData?.status || 'pending'

                return (
                  <WorkflowStep
                    key={stepName}
                    name={stepName}
                    status={status as any}
                    assignedTo={stepData?.assigned_employee?.full_name}
                    completedAt={stepData?.completed_at ? new Date(stepData.completed_at).toLocaleDateString('ar-EG') : undefined}
                    fees={stepData?.fees}
                    profit={stepData?.profit}
                  />
                )
              })}
            </div>
          </Card>
        </TabPanel>

        {/* Excavation Permit Tab */}
        <TabPanel id="excavation" isActive={true}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>خطوات تصريح الحفر</CardTitle>
                <CardSubtitle>المسار الثاني · 5 خطوات</CardSubtitle>
              </div>
            </CardHeader>
            {!deviceLicenseCompleted ? (
              <div
                className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-error-light)] border border-[var(--color-error)]"
                style={{ opacity: 0.5 }}
              >
                <div className="flex items-center gap-2 text-[var(--color-error)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="font-medium">لا يمكن بدء مسار تصريح الحفر قبل اكتمال رخصة الجهاز بالكامل</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {EXCAVATION_PERMIT_STEPS.map((stepName, index) => {
                  return (
                    <WorkflowStep
                      key={stepName}
                      name={stepName}
                      status="pending"
                      isLocked={false}
                    />
                  )
                })}
              </div>
            )}
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  )
}
```
</action>
<verify>
```bash
test -f src/app/\(dashboard\)/clients/\[id\]/page.tsx
grep -q "DEVICE_LICENSE" src/app/\(dashboard\)/clients/\[id\]/page.tsx
grep -q "EXCAVATION_PERMIT" src/app/\(dashboard\)/clients/\[id\]/page.tsx
grep -q "deviceLicenseCompleted" src/app/\(dashboard\)/clients/\[id\]/page.tsx
```
</verify>
<acceptance_criteria>
- Client profile shows client details (CRM-03)
- Two tabs: Device License (5 steps) and Excavation Permit (5 steps) (WF-01)
- Each step shows status badge, assigned employee, completion date (WF-04)
- Each step shows fees and profit amounts (WF-05)
- Excavation Permit locked until Device License completed (D-03: dependency)
- Lock message displayed in Arabic when Excavation Permit is locked
</acceptance_criteria>
</task>

</tasks>

<verification>
1. Client list page displays with search functionality
2. Client profile shows all address fields
3. Workflow tabs switch between Device License and Excavation Permit
4. Workflow steps display with correct status styling
5. Fees shown in warning color, profit in success color
6. Dependency lock shown when Device License not completed
</verification>

<success_criteria>
- /clients page shows searchable client list
- /clients/[id] shows client profile with workflow tabs
- Both workflows show 5 steps each with correct Arabic names
- Step status badges display correctly
- Financial amounts display in Arabic formatting
- Excavation Permit tab shows lock when Device License incomplete
</success_criteria>

<threat_model>
- **Data Exposure:** RLS policies must prevent employees from viewing unassigned client workflows
- **Search Injection:** Supabasefts query sanitization prevents injection
- **Mitigation:** Test RLS with different user roles before production
</threat_model>

---

*P-03: CRM Core*
