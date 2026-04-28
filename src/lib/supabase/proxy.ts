import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { databaseConfig } from '@/config/database.config'

type CookieToSet = {
  name: string
  value: string
  options?: any
}

export async function updateSession(request: NextRequest) {
  const cookiesToSet: CookieToSet[] = []

  const supabase = createServerClient(
    databaseConfig.supabaseUrl,
    databaseConfig.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            cookiesToSet.push({ name, value, options })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { cookiesToSet, user }
}
