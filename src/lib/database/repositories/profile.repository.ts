import { supabase } from '@/lib/supabase/client'
import type { Profile, ProfileFilter, UserRole } from '@/types/database.types'

export interface IProfileRepository {
  findById(id: string): Promise<Profile | null>
  findByEmail(email: string): Promise<Profile | null>
  create(data: CreateProfileData): Promise<Profile>
  update(id: string, data: UpdateProfileData): Promise<Profile>
  delete(id: string): Promise<void>
  findAll(filter?: ProfileFilter): Promise<Profile[]>
}

export interface CreateProfileData {
  id: string
  email: string
  full_name: string
  role: UserRole
  email?: string
  phone?: string
}

export interface UpdateProfileData {
  email?: string
  full_name?: string
  role?: UserRole
  email?: string
  phone?: string
}

export class ProfileRepository implements IProfileRepository {
  private readonly table = 'profiles'

  async findById(id: string): Promise<Profile | null> {
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

  async findByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  }

  async create(data: CreateProfileData): Promise<Profile> {
    const { data: result, error } = await supabase
      .from(this.table)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async update(id: string, data: UpdateProfileData): Promise<Profile> {
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
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async findAll(filter?: ProfileFilter): Promise<Profile[]> {
    let query = supabase.from(this.table).select('*')

    if (filter?.email) {
      query = query.eq('email', filter.email)
    }

    if (filter?.role) {
      query = query.eq('role', filter.role)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }
}

export const profileRepository = new ProfileRepository()
