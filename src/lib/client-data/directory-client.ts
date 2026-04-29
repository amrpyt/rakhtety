import type { Client, EmployeeWithProfile } from '@/types/database.types'
import type { CreateClientDto } from '@/lib/services/client.service'

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
    const body =
      files.length > 0
        ? (() => {
            const formData = new FormData()
            formData.append('name', data.name)
            formData.append('phone', data.phone || '')
            formData.append('city', data.city || '')
            formData.append('district', data.district || '')
            formData.append('neighborhood', data.neighborhood || '')
            formData.append('parcel_number', data.parcel_number || '')
            for (const [type, file] of files) {
              formData.append(`intake_file_${type}`, file)
            }
            return formData
          })()
        : JSON.stringify(data)

    const payload = await readJson<{ client: Client }>(
      await fetch('/api/clients', {
        method: 'POST',
        ...(files.length > 0 ? {} : { headers: { 'Content-Type': 'application/json' } }),
        body,
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
