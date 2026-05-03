import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'

export async function POST(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  return NextResponse.json(
    { error: 'Intake document upload is managed in Frappe during this migration step' },
    { status: 501 }
  )
}
