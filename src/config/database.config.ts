export interface DatabaseConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey: string
  supabaseAuthCookieName: string
  sessionPersistSession: boolean
  sessionAutoRefreshToken: boolean
  sessionDetectSessionInUrl: boolean
}

export const databaseConfig: DatabaseConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '',

  supabaseAuthCookieName: 'sb-auth-token',
  sessionPersistSession: true,
  sessionAutoRefreshToken: true,
  sessionDetectSessionInUrl: true,
}

export type { DatabaseConfig as Config }
