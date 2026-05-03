import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getPrivilegedFrappeAdapterForRequest } from '@/lib/frappe/adapter'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'readClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const client = await (await getPrivilegedFrappeAdapterForRequest(request)).getClient(id)
    return NextResponse.json({ client })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
