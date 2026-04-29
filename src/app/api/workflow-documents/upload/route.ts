import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { buildDocumentStoragePath, validateDocumentFile } from '@/lib/services/document-helpers'
import type { WorkflowDocument } from '@/types/database.types'

const BUCKET = 'workflow-documents'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً.' }, { status: 401 })
  }

  const formData = await request.formData()
  const workflowId = String(formData.get('workflow_id') || '')
  const workflowStepId = String(formData.get('workflow_step_id') || '')
  const documentType = String(formData.get('document_type') || '')
  const label = String(formData.get('label') || '')
  const file = formData.get('file')

  if (!workflowId || !workflowStepId || !documentType || !label || !(file instanceof File)) {
    return NextResponse.json({ error: 'بيانات المستند غير مكتملة.' }, { status: 400 })
  }

  validateDocumentFile(file)

  const admin = createAdminClient()
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { data: workflow, error: workflowError } = await admin
    .from('workflows')
    .select('assigned_to')
    .eq('id', workflowId)
    .maybeSingle()

  if (workflowError) {
    return NextResponse.json({ error: workflowError.message }, { status: 500 })
  }

  const canUpload = profile?.role === 'admin' || profile?.role === 'manager' || workflow?.assigned_to === user.id
  if (!canUpload) {
    return NextResponse.json({ error: 'ليس لديك صلاحية رفع مستند لهذا المسار.' }, { status: 403 })
  }

  const storagePath = buildDocumentStoragePath(workflowId, workflowStepId, file.name)
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const { data: document, error: insertError } = await admin
    .from('workflow_documents')
    .insert({
      workflow_id: workflowId,
      workflow_step_id: workflowStepId,
      document_type: documentType,
      label,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      file_size: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single<WorkflowDocument>()

  if (insertError) {
    await admin.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ document })
}
