import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient, listClients } from '@/lib/server-data/directory-query'
import { buildClientIntakeStoragePath, validateDocumentFile } from '@/lib/services/document-helpers'
import { createServerClient } from '@/lib/supabase/server'
import { CLIENT_INTAKE_DOCUMENTS } from '@/lib/domain/workflow-templates'
import { clientCreateSchema } from '@/lib/validation/schemas'

const BUCKET = 'workflow-documents'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return fallback
}

const getErrorStatus = (error: unknown): number | null => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code
    if (code === '42501') {
      return 403
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const search = request.nextUrl.searchParams.get('q')?.trim()

  try {
    return NextResponse.json({ clients: await listClients(supabase, search) })
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to fetch clients')
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    const isMultipart = contentType.includes('multipart/form-data')
    const formData = isMultipart ? await request.formData() : null
    const intakeFiles = new Map<string, File>()

    if (formData) {
      for (const document of CLIENT_INTAKE_DOCUMENTS) {
        const file = formData.get(`intake_file_${document.type}`)
        if (file instanceof File && file.size > 0) {
          validateDocumentFile(file)
          intakeFiles.set(document.type, file)
        }
      }
    }

    const input = formData
      ? {
          name: String(formData.get('name') || ''),
          phone: String(formData.get('phone') || ''),
          city: String(formData.get('city') || ''),
          district: String(formData.get('district') || ''),
          neighborhood: String(formData.get('neighborhood') || ''),
          parcel_number: String(formData.get('parcel_number') || ''),
          intake_documents: Array.from(intakeFiles.keys()),
        }
      : await request.json()

    const parsed = clientCreateSchema.safeParse(input)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات العميل غير صالحة' },
        { status: 400 }
      )
    }

    const client = await createClient(supabase, parsed.data, user.id)

    if (formData && intakeFiles.size > 0) {
      const admin = createAdminClient()
      const uploadedPaths: string[] = []

      try {
        for (const document of CLIENT_INTAKE_DOCUMENTS) {
          const file = intakeFiles.get(document.type)
          if (!file) continue

          const storagePath = buildClientIntakeStoragePath(client.id, document.type, file.name)
          const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

          if (uploadError) throw uploadError
          uploadedPaths.push(storagePath)

          const { error: insertError } = await admin.from('client_intake_documents').insert({
            client_id: client.id,
            document_type: document.type,
            label: document.label,
            file_name: file.name,
            storage_path: storagePath,
            mime_type: file.type || null,
            file_size: file.size,
            uploaded_by: user.id,
          })

          if (insertError) throw insertError
        }
      } catch (error) {
        if (uploadedPaths.length > 0) {
          await admin.storage.from(BUCKET).remove(uploadedPaths)
        }
        await admin.from('clients').delete().eq('id', client.id)
        throw error
      }
    }

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to create client')
    const status = getErrorStatus(error) ?? 500
    return NextResponse.json({ error: message }, { status })
  }
}
