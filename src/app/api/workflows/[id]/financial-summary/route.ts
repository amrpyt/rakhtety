import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getPrivilegedFrappeAdapterForRequest } from '@/lib/frappe/adapter'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'readReports')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const summary = await (await getPrivilegedFrappeAdapterForRequest(request)).workflowFinancialSummary(id)
    return NextResponse.json({ summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load financial summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
