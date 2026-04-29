import type { Client, EmployeeWithProfile } from '@/types/database.types'
import type { CreateClientDto } from '@/lib/services/client.service'

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage)
  }

  return payload as T
}

function appendOptionalField(formData: FormData, key: string, value: string | undefined) {
  if (value && value.trim().length > 0) {
    formData.append(key, value)
  }
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

    const formData = new FormData()
    formData.append('name', data.name)
    appendOptionalField(formData, 'phone', data.phone)
    appendOptionalField(formData, 'city', data.city)
    appendOptionalField(formData, 'district', data.district)
    appendOptionalField(formData, 'neighborhood', data.neighborhood)
    appendOptionalField(formData, 'parcel_number', data.parcel_number)

    const documentTypes = files.length > 0 ? files.map(([type]) => type) : data.intake_documents ?? []
    for (const documentType of documentTypes) {
      formData.append('intake_documents', documentType)
    }

    for (const [type, file] of files) {
      formData.append('intake_file_types', type)
      formData.append('intake_files', file)
    }

    const payload = await readJson<{ client: Client }>(
      await fetch('/api/clients', {
        method: 'POST',
        body: formData,
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
}
