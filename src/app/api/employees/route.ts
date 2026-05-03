import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { employeeCreateSchema } from '@/lib/validation/schemas'

export async function GET(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageEmployees')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const employees = await getFrappeAdapterForRequest(request).listEmployees()
    return NextResponse.json({ employees })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch employees'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageEmployees')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const parsed = employeeCreateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid employee data' }, { status: 400 })
    }

    const employee = await getFrappeAdapterForRequest(request).createEmployee(parsed.data)
    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create employee'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
