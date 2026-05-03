import { NextRequest, NextResponse } from 'next/server'
import { readServerSession } from '@/lib/auth/server-session'
import { buildMonitorSnapshot } from '@/lib/amr-dashboard/log-monitor'

export async function GET(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })

  const limit = Number(request.nextUrl.searchParams.get('limit') || 200)

  try {
    const snapshot = await buildMonitorSnapshot({ limit })
    return NextResponse.json({ snapshot })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load monitor logs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
