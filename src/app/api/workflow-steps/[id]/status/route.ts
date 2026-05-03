import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import type { StepStatus } from '@/types/database.types'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'updateWorkflowSteps')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const status = body.status as StepStatus | undefined
    if (status !== 'in_progress' && status !== 'completed' && status !== 'pending') {
      return NextResponse.json({ error: 'Invalid step status' }, { status: 400 })
    }

    const step = await getFrappeAdapterForRequest(request).updateStepStatus(id, status)
    return NextResponse.json({ step })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update step'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
