import { NextRequest, NextResponse } from 'next/server'
import { summarizeWorkflowLedger } from '@/lib/server-data/financial-summary-query'
import { requirePermission } from '@/lib/auth/server-permissions'
import { createServerClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'readReports')
  if (permission instanceof NextResponse) return permission

  try {
    return NextResponse.json({ summary: await summarizeWorkflowLedger(supabase, id) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load financial summary'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
