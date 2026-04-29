import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { CLIENT_INTAKE_DOCUMENTS } from '@/lib/domain/workflow-templates'
import { buildClientIntakeStoragePath, validateDocumentFile } from '@/lib/services/document-helpers'

const BUCKET = 'workflow-documents'

type Params = { params: Promise<{ id: string }> }

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) return error.message
  return fallback
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id: clientId } = await params
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً.' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'تعذر قراءة ملف المستند. ارفع ملفاً واحداً فقط بصيغة PDF أو صورة.' },
        { status: 400 }
      )
    }

    const documentType = String(formData.get('document_type') || '')
    const file = formData.get('file')
    const template = CLIENT_INTAKE_DOCUMENTS.find((document) => document.type === documentType)

    if (!template || !(file instanceof File)) {
      return NextResponse.json({ error: 'بيانات المستند غير مكتملة.' }, { status: 400 })
    }

    validateDocumentFile(file)

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

    const canUpload = profile?.role === 'admin' || profile?.role === 'manager' || client.created_by === user.id
    if (!canUpload) {
      return NextResponse.json({ error: 'ليس لديك صلاحية رفع مستند لهذا العميل.' }, { status: 403 })
    }

    const admin = createAdminClient()
    const storagePath = buildClientIntakeStoragePath(clientId, documentType, file.name)
    const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { error: insertError } = await admin.from('client_intake_documents').insert({
      client_id: clientId,
      document_type: documentType,
      label: template.label,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      file_size: file.size,
      uploaded_by: user.id,
    })

    if (insertError) {
      await admin.storage.from(BUCKET).remove([storagePath])
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'تعذر رفع المستند.') }, { status: 500 })
  }
}
