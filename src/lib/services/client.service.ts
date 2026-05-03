import { clientRepository } from '@/lib/database/repositories/client.repository'
import { domainMessages } from '@/lib/domain/messages'
import { CLIENT_INTAKE_DOCUMENTS } from '@/lib/domain/workflow-templates'
import { NotFoundError } from '@/lib/errors/app-error.class'
import type { Client, ClientFilter } from '@/types/database.types'

export interface CreateClientDto {
  name: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
  intake_documents?: string[]
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
      throw new NotFoundError(domainMessages.entities.client, id)
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
    const clientData = { ...data }
    delete clientData.intake_documents
    return clientRepository.create({
      ...clientData,
      created_by: createdBy,
    })
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    await this.findById(id)
    return clientRepository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    await this.findById(id)
    await clientRepository.delete(id)
  }

  private validateClientData(data: CreateClientDto): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error(domainMessages.validation.clientNameRequired)
    }

    if (data.intake_documents) {
      const uploaded = new Set(data.intake_documents)
      const missing = CLIENT_INTAKE_DOCUMENTS
        .filter((document) => document.required && !uploaded.has(document.type))
        .map((document) => document.label)

      if (missing.length > 0) {
        throw new Error(`لا يمكن تسجيل العميل قبل رفع المستندات الأساسية: ${missing.join('، ')}`)
      }
    }
  }
}

export const clientService = new ClientService()
