import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth/server-permissions'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { buildDocumentStoragePath, validateDocumentFile } from '@/lib/services/document-helpers'
import type { WorkflowDocument } from '@/types/database.types'

const BUCKET = 'workflow-documents'

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'uploadWorkflowDocuments')
  if (permission instanceof NextResponse) return permission

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
  const { data: step, error: stepError } = await admin
    .from('workflow_steps')
    .select('id, workflow_id')
    .eq('id', workflowStepId)
    .maybeSingle()

  if (stepError) {
    return NextResponse.json({ error: stepError.message }, { status: 500 })
  }

  if (!step || step.workflow_id !== workflowId) {
    return NextResponse.json({ error: 'الخطوة لا تتبع هذا المسار.' }, { status: 400 })
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
      uploaded_by: permission.user.id,
    })
    .select()
    .single<WorkflowDocument>()

  if (insertError) {
    await admin.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ document })
}
