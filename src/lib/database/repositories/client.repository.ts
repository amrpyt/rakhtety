import { supabase } from '@/lib/supabase/client'
import type { Client, ClientFilter } from '@/types/database.types'

export interface IClientRepository {
  findById(id: string): Promise<Client | null>
  findAll(filter?: ClientFilter): Promise<Client[]>
  create(data: CreateClientData): Promise<Client>
  update(id: string, data: UpdateClientData): Promise<Client>
  delete(id: string): Promise<void>
  search(query: string, limit?: number): Promise<Client[]>
}

export interface CreateClientData {
  name: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
  created_by?: string
}

export interface UpdateClientData {
  name?: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  parcel_number?: string
}

export class ClientRepository implements IClientRepository {
  private readonly table = 'clients'

  async findById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async findAll(filter?: ClientFilter): Promise<Client[]> {
    let query = supabase.from(this.table).select('*')

    if (filter?.city) {
      query = query.eq('city', filter.city)
    }

    if (filter?.created_by) {
      query = query.eq('created_by', filter.created_by)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async create(data: CreateClientData): Promise<Client> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateClientData): Promise<Client> {
    const { data: result, error } = await supabase
      .from(this.table)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq('id', id)
    if (error) throw error
  }

  async search(query: string, limit = 50): Promise<Client[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%,parcel_number.ilike.%${query}%`)
      .limit(limit)

    if (error) throw error
    return data || []
  }
}

export const clientRepository = new ClientRepository()
