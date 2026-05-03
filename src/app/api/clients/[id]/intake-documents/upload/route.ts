import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { validateDocumentFile } from '@/lib/services/document-helpers'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'manageClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Document file is required' }, { status: 400 })
    validateDocumentFile(file)

    const document = await getFrappeAdapterForRequest(request).uploadClientIntakeDocumentFile(file, {
      client_id: id,
      document_type: String(formData.get('document_type') || 'Intake Document'),
      label: String(formData.get('label') || ''),
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
    })
    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload intake document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
