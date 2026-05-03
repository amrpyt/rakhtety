import { directoryClient } from '@/lib/client-data/directory-client'
import type { Client } from '@/types/database.types'
import type { CreateClientDto, UpdateClientDto } from '@/types/directory.types'

export type { CreateClientDto, UpdateClientDto }

export const clientService = {
  async findById(id: string): Promise<Client> {
    const response = await fetch(`/api/clients/${id}`)
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'Failed to fetch client')
    return payload.client
  },

  findAll(): Promise<Client[]> {
    return directoryClient.listClients()
  },

  search(query: string): Promise<Client[]> {
    return directoryClient.searchClients(query)
  },

  create(data: CreateClientDto): Promise<Client> {
    return directoryClient.createClient(data)
  },

  update(id: string, data: UpdateClientDto): Promise<Client> {
    return directoryClient.updateClient(id, data)
  },

  delete(id: string): Promise<void> {
    return directoryClient.deleteClient(id)
  },
}
