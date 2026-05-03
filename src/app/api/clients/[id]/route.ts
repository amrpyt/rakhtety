import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { z } from 'zod'

type Params = { params: Promise<{ id: string }> }

const clientUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  parcel_number: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'readClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const client = await getFrappeAdapterForRequest(request).getClient(id)
    return NextResponse.json({ client })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const parsed = clientUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid client data' }, { status: 400 })
    }

    const client = await getFrappeAdapterForRequest(request).updateClient(id, parsed.data)
    return NextResponse.json({ client })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'destructiveDelete')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    await getFrappeAdapterForRequest(request).deleteClient(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete client'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
