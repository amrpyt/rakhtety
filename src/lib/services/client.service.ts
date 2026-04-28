import { clientRepository } from '@/lib/database/repositories/client.repository'
import type { Client, ClientFilter, ClientWithWorkflows } from '@/types/database.types'
import { NotFoundError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'

export interface CreateClientDto {
  name: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
}

export interface UpdateClientDto {
  name?: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
}

export class ClientService {
  async findById(id: string): Promise<Client> {
    const client = await clientRepository.findById(id)
    if (!client) {
      throw new NotFoundError('العميل', id)
    }
    return client
  }

  async findAll(filter?: ClientFilter): Promise<Client[]> {
    return clientRepository.findAll(filter)
  }

  async search(query: string): Promise<Client[]> {
    if (!query || query.trim().length < 2) {
      return []
    }
    return clientRepository.search(query.trim())
  }

  async create(data: CreateClientDto, createdBy: string): Promise<Client> {
    this.validateClientData(data)
    return clientRepository.create({
      ...data,
      created_by: createdBy,
    })
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new NotFoundError('العميل', id)
    }
    return clientRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new NotFoundError('العميل', id)
    }
    await clientRepository.delete(id)
  }

  private validateClientData(data: CreateClientDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('اسم العميل مطلوب')
    }
  }
}

export const clientService = new ClientService()