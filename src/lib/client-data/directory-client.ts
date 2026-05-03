import type { Client, EmployeeWithProfile } from '@/types/database.types'
import type { CreateClientDto } from '@/lib/services/client.service'
import type { CreateEmployeeDto, UpdateEmployeeDto } from '@/lib/services/employee.service'

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

function buildClientCreateFormData(data: CreateClientDto, files: [string, File][]) {
  const formData = new FormData()
  formData.append('name', data.name)

  if (data.phone) formData.append('phone', data.phone)
  if (data.city) formData.append('city', data.city)
  if (data.district) formData.append('district', data.district)
  if (data.neighborhood) formData.append('neighborhood', data.neighborhood)
  if (data.parcel_number) formData.append('parcel_number', data.parcel_number)

  for (const [type, file] of files) {
    formData.append('intake_documents', type)
    formData.append('intake_file_types', type)
    formData.append('intake_files', file)
  }

  return formData
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

    if (files.length > 0) {
      const payload = await readJson<{ client: Client }>(
        await fetch('/api/clients', {
          method: 'POST',
          body: buildClientCreateFormData(data, files),
        }),
        'Failed to create client'
      )

      return payload.client
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

    return payload.client
  },

  async listEmployees(): Promise<EmployeeWithProfile[]> {
    const payload = await readJson<{ employees: EmployeeWithProfile[] }>(
      await fetch('/api/employees'),
      'Failed to fetch employees'
    )
    return payload.employees
  },

  async createEmployee(data: CreateEmployeeDto): Promise<EmployeeWithProfile> {
    const payload = await readJson<{ employee: EmployeeWithProfile }>(
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      'Failed to create employee'
    )
    return payload.employee
  },

  async updateEmployee(id: string, data: UpdateEmployeeDto): Promise<EmployeeWithProfile> {
    const payload = await readJson<{ employee: EmployeeWithProfile }>(
      await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      'Failed to update employee'
    )
    return payload.employee
  },

  async deleteEmployee(id: string): Promise<void> {
    await readJson<{ ok: true }>(
      await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      }),
      'Failed to delete employee'
    )
  },
}
