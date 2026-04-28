import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { databaseConfig } from '@/config/database.config'

export function createServerClient(): SupabaseClient {
  return createClient(
    databaseConfig.supabaseUrl,
    databaseConfig.supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

export function createServerClientWithSession(accessToken: string): SupabaseClient {
  const client = createServerClient()
  client.auth.setSession({
    access_token: accessToken,
    refresh_token: '',
  })
  return client
}

export { SupabaseClient }