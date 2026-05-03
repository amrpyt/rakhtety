import type { User } from '@supabase/supabase-js'
import type { AuthUser } from '@/types/auth.types'
import type { Profile } from '@/types/database.types'

type SessionUser = Pick<User, 'id' | 'email' | 'user_metadata'>

type ProfileSnapshot = Pick<Profile, 'role' | 'full_name' | 'phone'> | null | undefined

export function toAuthUser(sessionUser: SessionUser, profile?: ProfileSnapshot): AuthUser {
  const metadata = sessionUser.user_metadata as {
    full_name?: string
    phone?: string
  } | undefined

  return {
    id: sessionUser.id,
    email: sessionUser.email ?? '',
    role: profile?.role || 'employee',
    full_name: profile?.full_name || metadata?.full_name || '',
    phone: profile?.phone || metadata?.phone || undefined,
  }
}
