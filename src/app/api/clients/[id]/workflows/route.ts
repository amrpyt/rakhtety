import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import type { WorkflowType, WorkflowWithSteps } from '@/types/database.types'
import { getBlockedExcavationReason, domainMessages } from '@/lib/domain/messages'

type Params = { params: Promise<{ id: string }> }

function getExcavationDependency(deviceLicense: WorkflowWithSteps | null) {
  if (!deviceLicense) return { isBlocked: true, reason: domainMessages.workflow.deviceLicenseMissing }
  if (deviceLicense.status !== 'completed') return { isBlocked: true, reason: getBlockedExcavationReason(deviceLicense.status) }
  return { isBlocked: false, reason: undefined }
}

export async function GET(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'readClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    return NextResponse.json(await getFrappeAdapterForRequest(request).listClientWorkflows(id))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch workflows'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageWorkflows')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const type = body.type as WorkflowType | undefined
    if (type !== 'DEVICE_LICENSE' && type !== 'EXCAVATION_PERMIT') {
      return NextResponse.json({ error: 'نوع المسار غير صالح' }, { status: 400 })
    }

    const adapter = getFrappeAdapterForRequest(request)
    const existing = await adapter.listClientWorkflows(id)
    const dependency = getExcavationDependency(existing.deviceLicense)
    if (type === 'EXCAVATION_PERMIT' && dependency.isBlocked) {
      return NextResponse.json({ error: dependency.reason }, { status: 400 })
    }

    const workflow = await adapter.createWorkflow(id, type)
    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create workflow'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
