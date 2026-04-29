import type { Client, EmployeeWithProfile } from '@/types/database.types'
import type { CreateClientDto } from '@/lib/services/client.service'

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }

  return btoa(binary)
}

async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage)
  }

  return payload as T
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
    const intake_documents = files.length > 0
      ? await Promise.all(
          files.map(async ([type, file]) => ({
            type,
            file_name: file.name,
            mime_type: file.type,
            content_base64: await fileToBase64(file),
          }))
        )
      : undefined

    const payload = await readJson<{ client: Client }>(
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          intake_documents: files.length > 0 ? files.map(([type]) => type) : data.intake_documents,
          intake_files: intake_documents,
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
}
