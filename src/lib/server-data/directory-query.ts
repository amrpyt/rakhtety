import type { SupabaseClient } from '@supabase/supabase-js'
import type { Client, EmployeeWithProfile } from '@/types/database.types'
import type { CreateClientDto } from '@/lib/services/client.service'

export async function listClients(supabase: SupabaseClient, search?: string): Promise<Client[]> {
  let query = supabase.from('clients').select('*')

  if (search && search.length >= 2) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%,parcel_number.ilike.%${search}%`
    )
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50)
  if (error) throw error
  return (data || []) as Client[]
}

export async function createClient(
  supabase: SupabaseClient,
  data: CreateClientDto,
  createdBy: string | null
): Promise<Client> {
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      city: data.city?.trim() || null,
      district: data.district?.trim() || null,
      neighborhood: data.neighborhood?.trim() || null,
      parcel_number: data.parcel_number?.trim() || null,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw error
  return client as Client
}

export async function listEmployees(supabase: SupabaseClient): Promise<EmployeeWithProfile[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*, profile:profiles(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as EmployeeWithProfile[]
}
