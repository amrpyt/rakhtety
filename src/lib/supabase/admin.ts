import { createClient } from '@supabase/supabase-js'
import { databaseConfig } from '@/config/database.config'

export function createAdminClient() {
  if (!databaseConfig.supabaseUrl || !databaseConfig.supabaseServiceRoleKey) {
    return {
      from() {
        throw new Error('Supabase admin client is disabled')
      },
      storage: {
        from() {
          throw new Error('Supabase admin client is disabled')
        },
      },
    } as never
  }

  return createClient(
    databaseConfig.supabaseUrl,
    databaseConfig.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
