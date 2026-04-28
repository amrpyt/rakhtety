import { createClient } from '@supabase/supabase-js'
import { databaseConfig } from '@/config/database.config'

export function createAdminClient() {
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
