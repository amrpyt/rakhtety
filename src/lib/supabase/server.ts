import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

export async function createServerClient() {
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
