import type { Client, EmployeeWithProfile } from '@/types/database.types'
import type { CreateClientDto } from '@/lib/services/client.service'

const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage)
  }

  return payload as T
}

function getFileExtension(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() || '' : ''
}

function validateIntakeFile(file: File) {
  const extension = getFileExtension(file.name)

  if (!extension || !ALLOWED_DOCUMENT_EXTENSIONS.includes(extension)) {
    throw new Error('مسموح فقط بملفات PDF أو JPG أو JPEG أو PNG.')
  }

  if (!file.type || !ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
    throw new Error('نوع الملف غير مسموح. ارفع ملف PDF أو صورة.')
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    throw new Error('حجم الملف كبير. الحد الأقصى 10 ميجابايت.')
  }
}

async function uploadClientIntakeDocument(clientId: string, documentType: string, file: File) {
  validateIntakeFile(file)

  const formData = new FormData()
  formData.append('document_type', documentType)
  formData.append('file', file)

  await readJson(
    await fetch(`/api/clients/${clientId}/intake-documents/upload`, {
      method: 'POST',
      body: formData,
    }),
    'Failed to upload client document'
  )
}

export const directoryClient = {
  async listClients(): Promise<Client[]> {
    const payload = await readJson<{ clients: Client[] }>(
      await fetch('/api/clients'),
      'Failed to fetch clients'
    )
    return payload.clients
  },

  async searchClients(query: string): Promise<Client[]> {
    const payload = await readJson<{ clients: Client[] }>(
      await fetch(`/api/clients?q=${encodeURIComponent(query)}`),
      'Failed to search clients'
    )
    return payload.clients
  },

  async createClient(data: CreateClientDto, intakeFiles?: Record<string, File>): Promise<Client> {
    const files = intakeFiles ? Object.entries(intakeFiles).filter(([, file]) => file) : []
    const documentTypes = files.length > 0 ? files.map(([type]) => type) : data.intake_documents ?? []

    for (const [, file] of files) {
      validateIntakeFile(file)
    }

    const payload = await readJson<{ client: Client }>(
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          intake_documents: documentTypes,
        }),
      }),
      'Failed to create client'
    )

    for (const [type, file] of files) {
      await uploadClientIntakeDocument(payload.client.id, type, file)
    }

    return payload.client
  },

  async listEmployees(): Promise<EmployeeWithProfile[]> {
    const payload = await readJson<{ employees: EmployeeWithProfile[] }>(
      await fetch('/api/employees'),
      'Failed to fetch employees'
    )
    return payload.employees
  },
}
