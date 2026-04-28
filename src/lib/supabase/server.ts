import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

export function createServerClient() {
  const cookieStore = cookies()

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
              ;(cookieStore as any).set(name, value, options)
            })
          } catch {
            // Server components cannot always write cookies.
          }
        },
      },
    }
  )
}
