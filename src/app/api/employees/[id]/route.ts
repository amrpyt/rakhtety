import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { employeeUpdateSchema } from '@/lib/validation/schemas'
import { z } from 'zod'

function requireEmployeeManagement(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageEmployees')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })
  return null
}

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const permission = requireEmployeeManagement(request)
  if (permission) return permission

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = employeeUpdateSchema.partial().extend({ is_active: z.boolean().optional() }).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid employee data' }, { status: 400 })
    }

    const employee = await getFrappeAdapterForRequest(request).updateEmployee(id, parsed.data)
    return NextResponse.json({ employee })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update employee'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const permission = requireEmployeeManagement(request)
  if (permission) return permission

  try {
    const { id } = await params
    const employee = await getFrappeAdapterForRequest(request).deleteEmployee(id)
    return NextResponse.json({ employee, ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete employee'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
