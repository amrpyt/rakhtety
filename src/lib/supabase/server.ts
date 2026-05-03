import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

export async function createServerClient() {
  if (!databaseConfig.supabaseUrl || !databaseConfig.supabaseAnonKey) {
    return {
      auth: {
        async signInWithPassword() {
          throw new Error('Supabase server client is disabled')
        },
        async signOut() {
          return { error: null }
        },
        async getUser() {
          return { data: { user: null }, error: null }
        },
      },
      from() {
        throw new Error('Supabase server client is disabled')
      },
    } as never
  }

  const cookieStore = await cookies()

  return createSupabaseServerClient(
    databaseConfig.supabaseUrl,
    databaseConfig.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server components cannot always write cookies.
          }
        },
      },
    }
  )
}
