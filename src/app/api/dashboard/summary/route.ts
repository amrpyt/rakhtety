import { NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth/server-permissions'
import { dashboardService } from '@/lib/services/dashboard.service'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'readClients')
  if (permission instanceof NextResponse) return permission

  try {
    return NextResponse.json({ summary: await dashboardService.getSummary() })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
