import { createBrowserClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

const createUnavailableSupabase = () =>
  new Proxy(
    {},
    {
      get() {
        throw new Error(
          'Supabase client is disabled. Use the Frappe-backed API path instead.'
        )
      },
    }
  ) as never

export const supabase =
  databaseConfig.supabaseUrl && databaseConfig.supabaseAnonKey
    ? createBrowserClient(databaseConfig.supabaseUrl, databaseConfig.supabaseAnonKey, {
        auth: {
          persistSession: databaseConfig.sessionPersistSession,
          autoRefreshToken: databaseConfig.sessionAutoRefreshToken,
          detectSessionInUrl: databaseConfig.sessionDetectSessionInUrl,
        },
      })
    : createUnavailableSupabase()
