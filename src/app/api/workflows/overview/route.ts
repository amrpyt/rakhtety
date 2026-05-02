import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth/server-permissions'
import { createServerClient } from '@/lib/supabase/server'
import { getSignedEventAmount } from '@/lib/services/financial-calculations'
import type {
  Client,
  FinancialEvent,
  StepStatus,
  Workflow,
  WorkflowOverviewItem,
  WorkflowStatus,
  WorkflowStepWithEmployee,
  WorkflowType,
} from '@/types/database.types'

type WorkflowRecord = Workflow & {
  client: Pick<Client, 'id' | 'name' | 'phone' | 'parcel_number' | 'city'> | null
  assigned_employee?: { full_name: string | null } | null
  steps?: WorkflowStepWithEmployee[]
}

const STUCK_AFTER_DAYS = 7

function daysSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000)))
}

function pickCurrentStep(steps: WorkflowStepWithEmployee[]) {
  return (
    steps.find((step) => step.status === 'in_progress' || step.status === 'blocked') ||
    steps.find((step) => step.status === 'pending') ||
    steps.at(-1) ||
    null
  )
}

function buildDebt(workflowId: string, steps: WorkflowStepWithEmployee[], events: FinancialEvent[]) {
  const totalCost = steps.reduce((sum, step) => sum + Number(step.fees || 0) + Number(step.profit || 0), 0)
  const totalPaid = events
    .filter((event) => event.workflow_id === workflowId)
    .reduce((sum, event) => sum + getSignedEventAmount(event), 0)

  return Math.max(0, totalCost - totalPaid)
}

export async function GET() {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'readClients')
  if (permission instanceof NextResponse) return permission
  const isEmployee = permission.profile.role === 'employee'

  try {
    let query = supabase
      .from('workflows')
      .select(`
        *,
        client:clients(id, name, phone, parcel_number, city),
        assigned_employee:profiles(full_name),
        steps:workflow_steps(*, assigned_employee:profiles(full_name))
      `)
      .order('updated_at', { ascending: false })
      .limit(100)

    if (isEmployee) {
      query = query.eq('assigned_to', permission.user.id)
    }

    const { data: workflows, error: workflowsError } = await query

    if (workflowsError) {
      return NextResponse.json({ error: workflowsError.message }, { status: 500 })
    }

    const records = ((workflows || []) as unknown as WorkflowRecord[]).map((workflow) => ({
      ...workflow,
      steps: [...(workflow.steps || [])].sort((a, b) => a.step_order - b.step_order),
    }))
    const workflowIds = records.map((workflow) => workflow.id)

    const { data: events, error: eventsError } = workflowIds.length
      ? await supabase.from('financial_events').select('*').in('workflow_id', workflowIds)
      : { data: [], error: null }

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 })
    }

    const financialEvents = (events || []) as FinancialEvent[]
    const items: WorkflowOverviewItem[] = records.map((workflow) => {
      const currentStep = pickCurrentStep(workflow.steps || [])
      const lastTouched = currentStep?.updated_at || workflow.updated_at
      const daysStuck = currentStep && currentStep.status !== 'completed' ? daysSince(lastTouched) : 0
      const assignedName =
        currentStep?.assigned_employee?.full_name ||
        workflow.assigned_employee?.full_name ||
        null

      return {
        workflow_id: workflow.id,
        client_id: workflow.client_id,
        client_name: workflow.client?.name || 'عميل بدون اسم',
        client_phone: workflow.client?.phone || null,
        parcel_number: workflow.client?.parcel_number || null,
        city: workflow.client?.city || null,
        workflow_type: workflow.type as WorkflowType,
        workflow_status: workflow.status as WorkflowStatus,
        current_step_name: currentStep?.name || 'لا توجد خطوات',
        current_step_status: (currentStep?.status as StepStatus | undefined) || null,
        assigned_employee_name: assignedName,
        updated_at: workflow.updated_at,
        days_stuck: daysStuck,
        is_stuck: Boolean(currentStep && currentStep.status !== 'completed' && daysStuck >= STUCK_AFTER_DAYS),
        outstanding_debt: buildDebt(workflow.id, workflow.steps || [], financialEvents),
      }
    })

    return NextResponse.json({ workflows: items })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load workflow overview'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
