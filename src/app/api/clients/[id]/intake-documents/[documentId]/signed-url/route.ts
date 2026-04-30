import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import type { ClientIntakeDocument } from '@/types/database.types'

const BUCKET = 'workflow-documents'
const SIGNED_URL_TTL_SECONDS = 60

type Params = { params: Promise<{ id: string; documentId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id: clientId, documentId } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً.' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('created_by')
    .eq('id', clientId)
    .maybeSingle()

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 })
  }

  if (!client) {
    return NextResponse.json({ error: 'العميل غير موجود.' }, { status: 404 })
  }

  const canView = profile?.role === 'admin' || profile?.role === 'manager' || client.created_by === user.id
  if (!canView) {
    return NextResponse.json({ error: 'ليس لديك صلاحية عرض مستندات هذا العميل.' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data: document, error: documentError } = await admin
    .from('client_intake_documents')
    .select('*')
    .eq('id', documentId)
    .eq('client_id', clientId)
    .maybeSingle<ClientIntakeDocument>()

  if (documentError) {
    return NextResponse.json({ error: documentError.message }, { status: 500 })
  }

  if (!document) {
    return NextResponse.json({ error: 'المستند غير موجود.' }, { status: 404 })
  }

  const isDownload = request.nextUrl.searchParams.get('download') === '1'
  const { data, error } = await admin.storage.from(BUCKET).createSignedUrl(
    document.storage_path,
    SIGNED_URL_TTL_SECONDS,
    isDownload ? { download: document.file_name } : undefined
  )

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'تعذر إنشاء رابط آمن لهذا المستند.' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: data.signedUrl })
}
