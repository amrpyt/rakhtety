import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { paymentSchema } from '@/lib/validation/schemas'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'recordPayments')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const parsed = paymentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid payment data' }, { status: 400 })
    }

    const event = await getFrappeAdapterForRequest(request).recordPayment({
      ...parsed.data,
      workflow_id: id,
    })
    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
