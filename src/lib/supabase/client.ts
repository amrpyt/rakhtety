import { createBrowserClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

export const supabase = createBrowserClient(
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
