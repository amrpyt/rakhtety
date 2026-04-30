import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { summarizeWorkflowLedger } from '@/lib/server-data/financial-summary-query'
import { requirePermission } from '@/lib/auth/server-permissions'
import type { WorkflowWithSteps } from '@/types/database.types'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'readReports')
  if (permission instanceof NextResponse) return permission

  const [{ data: client, error: clientError }, { data: workflows, error: workflowsError }] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('workflows')
      .select('*, steps:workflow_steps(*, assigned_employee:profiles(full_name))')
      .eq('client_id', id)
      .order('created_at', { ascending: true })
      .order('step_order', { referencedTable: 'workflow_steps', ascending: true }),
  ])

  if (clientError || workflowsError) {
    return NextResponse.json({ error: clientError?.message || workflowsError?.message }, { status: 500 })
  }

  if (!client) {
    return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
  }

  const workflowRecords = (workflows || []) as WorkflowWithSteps[]
  const summaries = Object.fromEntries(
    await Promise.all(
      workflowRecords.map(async (workflow) => {
        const summary = await summarizeWorkflowLedger(supabase, workflow.id)
        return [workflow.id, summary] as const
      })
    )
  )

  return NextResponse.json({ client, workflows: workflowRecords, summaries })
}
