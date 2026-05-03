import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/server-permissions'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'readClients')
  if (permission instanceof NextResponse) return permission

  const { data, error } = await supabase
    .from('clients')
    .select('*, intake_documents:client_intake_documents(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 })
  }

  return NextResponse.json({ client: data })
}
