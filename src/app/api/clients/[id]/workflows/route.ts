import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/server-permissions'
import { getWorkflowStepTemplates } from '@/lib/domain/workflow-templates'
import { getBlockedExcavationReason, domainMessages } from '@/lib/domain/messages'
import type { Workflow, WorkflowType, WorkflowWithSteps } from '@/types/database.types'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'readClients')
  if (permission instanceof NextResponse) return permission

  const { data: workflows, error } = await supabase
    .from('workflows')
    .select('*, steps:workflow_steps(*, assigned_employee:profiles(full_name))')
    .eq('client_id', id)
    .order('created_at', { ascending: true })
    .order('step_order', { referencedTable: 'workflow_steps', ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const records = (workflows || []) as WorkflowWithSteps[]
  const deviceLicense = records.find((workflow) => workflow.type === 'DEVICE_LICENSE') || null
  const excavationPermit = records.find((workflow) => workflow.type === 'EXCAVATION_PERMIT') || null
  const dependency = getExcavationDependency(deviceLicense)

  return NextResponse.json({
    workflows: records,
    deviceLicense,
    excavationPermit,
    deviceLicenseCompleted: deviceLicense?.status === 'completed',
    excavationPermitBlocked: dependency.isBlocked,
    excavationPermitBlockedReason: dependency.reason,
  })
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'manageWorkflows')
  if (permission instanceof NextResponse) return permission

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const type = body.type as WorkflowType | undefined

  if (type !== 'DEVICE_LICENSE' && type !== 'EXCAVATION_PERMIT') {
    return NextResponse.json({ error: 'نوع المسار غير صالح' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: client, error: clientError } = await admin
    .from('clients')
    .select('id')
    .eq('id', id)
    .maybeSingle()

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  if (!client) {
    return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
  }

  const { data: existingWorkflows, error: existingError } = await admin
    .from('workflows')
    .select('*')
    .eq('client_id', id)

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }

  const existing = (existingWorkflows || []) as Workflow[]
  const existingSameType = existing.find((workflow) => workflow.type === type)
  if (existingSameType) {
    return NextResponse.json({ error: 'هذا المسار موجود بالفعل لهذا العميل' }, { status: 409 })
  }

  const dependency = getExcavationDependency(existing.find((workflow) => workflow.type === 'DEVICE_LICENSE') || null)
  if (type === 'EXCAVATION_PERMIT' && dependency.isBlocked) {
    return NextResponse.json({ error: dependency.reason }, { status: 400 })
  }

  const { data: workflow, error: workflowError } = await admin
    .from('workflows')
    .insert({
      client_id: id,
      type,
      status: 'pending',
      assigned_to: user.id,
    })
    .select()
    .single<Workflow>()

  if (workflowError) {
    if (workflowError.code === '23505') {
      return NextResponse.json({ error: 'Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³Ø§Ø± Ù…ÙˆØ¬ÙˆØ¯ Ø¨Ø§Ù„ÙØ¹Ù„ Ù„Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù…ÙŠÙ„' }, { status: 409 })
    }

    return NextResponse.json({ error: workflowError.message }, { status: 500 })
  }

  const steps = getWorkflowStepTemplates(type).map((step, index) => ({
    workflow_id: workflow.id,
    step_order: index + 1,
    name: step.name,
    status: 'pending',
    assigned_to: user.id,
    fees: step.fees,
    profit: step.profit,
  }))

  const { error: stepsError } = await admin.from('workflow_steps').insert(steps)

  if (stepsError) {
    await admin.from('workflows').delete().eq('id', workflow.id)
    return NextResponse.json({ error: stepsError.message }, { status: 500 })
  }

  const { data: workflowWithSteps, error: reloadError } = await admin
    .from('workflows')
    .select('*, steps:workflow_steps(*, assigned_employee:profiles(full_name))')
    .eq('id', workflow.id)
    .order('step_order', { referencedTable: 'workflow_steps', ascending: true })
    .single<WorkflowWithSteps>()

  if (reloadError) {
    return NextResponse.json({ error: reloadError.message }, { status: 500 })
  }

  return NextResponse.json({ workflow: workflowWithSteps }, { status: 201 })
}

function getExcavationDependency(deviceLicense: Workflow | null) {
  if (!deviceLicense) {
    return { isBlocked: true, reason: domainMessages.workflow.deviceLicenseMissing }
  }

  if (deviceLicense.status !== 'completed') {
    return { isBlocked: true, reason: getBlockedExcavationReason(deviceLicense.status) }
  }

  return { isBlocked: false, reason: undefined }
}
