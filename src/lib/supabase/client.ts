import { createClient } from '@supabase/supabase-js'
import { databaseConfig } from '@/config/database.config'

export const supabase = createClient(
  databaseConfig.supabaseUrl,
  databaseConfig.supabaseAnonKey,
  {
    auth: {
      persistSession: databaseConfig.sessionPersistSession,
      autoRefreshToken: databaseConfig.sessionAutoRefreshToken,
      detectSessionInUrl: databaseConfig.sessionDetectSessionInUrl,
    },
  }
)