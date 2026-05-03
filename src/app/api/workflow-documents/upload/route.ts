import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getPrivilegedFrappeAdapterForRequest } from '@/lib/frappe/adapter'
import { validateDocumentFile } from '@/lib/services/document-helpers'

function parseOptionalAmount(value: FormDataEntryValue | null) {
  if (value === null) return undefined
  const raw = String(value).trim()
  if (!raw) return undefined

  const amount = Number(raw)
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Invalid accounting amount')
  }

  return amount
}

export async function POST(request: NextRequest) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'uploadWorkflowDocuments')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'بيانات المستند غير مكتملة.' }, { status: 400 })
    }
    validateDocumentFile(file)

    let governmentFees: number | undefined
    let officeProfit: number | undefined
    try {
      governmentFees = parseOptionalAmount(formData.get('government_fees'))
      officeProfit = parseOptionalAmount(formData.get('office_profit'))
    } catch {
      return NextResponse.json({ error: 'أرقام المحاسبة يجب أن تكون أرقاماً موجبة أو صفر.' }, { status: 400 })
    }

    const document = await (await getPrivilegedFrappeAdapterForRequest(request)).uploadWorkflowDocument({
      workflow_id: String(formData.get('workflow_id') || ''),
      workflow_step_id: String(formData.get('workflow_step_id') || ''),
      document_type: String(formData.get('document_type') || ''),
      label: String(formData.get('label') || ''),
      file_name: file.name,
      mime_type: file.type || null,
      file_size: file.size,
      government_fees: governmentFees,
      office_profit: officeProfit,
    })
    return NextResponse.json({ document })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
