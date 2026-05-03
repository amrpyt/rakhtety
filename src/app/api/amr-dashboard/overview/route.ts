import { NextRequest, NextResponse } from 'next/server'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { buildAmrDashboardOverview } from '@/lib/amr-dashboard/overview'

export async function GET(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })

  try {
    const adapter = getFrappeAdapterForRequest(request)
    const [summary, clients, workflows, employees] = await Promise.all([
      adapter.dashboardSummary(),
      adapter.listClients(),
      adapter.listWorkflowOverview(),
      adapter.listEmployees(),
    ])

    return NextResponse.json({
      overview: buildAmrDashboardOverview({
        user: session.user,
        summary,
        clients,
        workflows,
        employees,
        baseUrlConfigured: Boolean(process.env.FRAPPE_BASE_URL),
      }),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Amr dashboard overview'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
