import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'

function requireEmployeeManagement(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageEmployees')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })
  return null
}

export async function PATCH(request: NextRequest) {
  const permission = requireEmployeeManagement(request)
  if (permission) return permission
  return NextResponse.json({ error: 'Employee editing is managed in Frappe during this migration step' }, { status: 501 })
}

export async function DELETE(request: NextRequest) {
  const permission = requireEmployeeManagement(request)
  if (permission) return permission
  return NextResponse.json({ error: 'Employee deletion is managed in Frappe during this migration step' }, { status: 501 })
}
