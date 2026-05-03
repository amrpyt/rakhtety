import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { callFrappeMethod } from '@/lib/frappe-spike/client'
import type { DashboardAnalyticsSummary } from '@/types/database.types'

interface ClientWorkflowPayload {
  message?: {
    workflows?: Array<{
      name: string
      status: string
      workflow_type: string
      client_name?: string
      modified?: string
    }>
  }
}

const emptySummary: DashboardAnalyticsSummary = {
  active_files: 0,
  completed_this_month: 0,
  pending_debt: 0,
  bottleneck_count: 0,
  bottlenecks: [],
  employee_workloads: [],
  recent_workflows: [],
}

export async function GET(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) {
    return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  }

  if (!can(session.user.role, 'readClients')) {
    return NextResponse.json({ error: 'Missing permission' }, { status: 403 })
  }

  try {
    const { payload } = await callFrappeMethod<ClientWorkflowPayload>('rakhtety_frappe.api.get_client_workflow', {
      client: 'Local Client',
    })
    const workflows = payload.message?.workflows || []
    const summary: DashboardAnalyticsSummary = {
      ...emptySummary,
      active_files: workflows.filter((workflow) => workflow.status !== 'completed').length,
      completed_this_month: workflows.filter((workflow) => workflow.status === 'completed').length,
      recent_workflows: workflows.slice(0, 5).map((workflow) => ({
        workflow_id: workflow.name,
        client_name: workflow.client_name || 'Local Client',
        workflow_type: workflow.workflow_type === 'DEVICE_LICENSE' ? 'DEVICE_LICENSE' : 'EXCAVATION_PERMIT',
        status: workflow.status === 'completed' ? 'completed' : workflow.status === 'blocked' ? 'blocked' : 'in_progress',
        updated_at: workflow.modified || new Date().toISOString(),
      })),
    }

    return NextResponse.json({ summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
