import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'

export async function GET(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'readClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const summary = await getFrappeAdapterForRequest(request).dashboardSummary()
    return NextResponse.json({ summary })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
