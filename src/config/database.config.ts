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
  get supabaseUrl() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    if (!url) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
    }
    return url
  },

  get supabaseAnonKey() {
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
    if (!key) {
      throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required')
    }
    return key
  },

  get supabaseServiceRoleKey() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    if (!key) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
    }
    return key
  },

  supabaseAuthCookieName: 'sb-auth-token',
  sessionPersistSession: true,
  sessionAutoRefreshToken: true,
  sessionDetectSessionInUrl: true,
}

export type { DatabaseConfig as Config }
