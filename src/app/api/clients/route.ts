import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { clientCreateSchema } from '@/lib/validation/schemas'
import { parseClientCreateRequest } from './request-parser'

function requireRole(request: NextRequest, action: Parameters<typeof can>[1]) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, action)) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })
  return null
}

export async function GET(request: NextRequest) {
  const permission = requireRole(request, 'readClients')
  if (permission) return permission

  try {
    const search = request.nextUrl.searchParams.get('q')?.trim()
    const clients = await getFrappeAdapterForRequest(request).listClients(search)
    return NextResponse.json({ clients })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch clients'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const permission = requireRole(request, 'manageClients')
  if (permission) return permission

  try {
    const { body } = await parseClientCreateRequest(request)
    const parsed = clientCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'بيانات العميل غير صالحة' }, { status: 400 })
    }

    const client = await getFrappeAdapterForRequest(request).createClient(parsed.data)
    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
