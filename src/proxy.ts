import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { canAccessRoute } from '@/lib/auth/permissions'
import { createServerClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

const PUBLIC_ROUTES = ['/login', '/signup']
const PROTECTED_ROUTES = ['/dashboard', '/clients', '/workflows', '/employees', '/finance', '/settings']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (!isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  const { cookiesToSet, user } = await updateSession(request)

  const applyCookies = (response: NextResponse) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })
    return response
  }

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return applyCookies(NextResponse.redirect(redirectUrl))
  }

  if (isProtectedRoute && user) {
    const supabase = createServerClient(databaseConfig.supabaseUrl, databaseConfig.supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // updateSession already collected refreshed cookies for the response.
        },
      },
    })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()

    const role = profile?.role || user.user_metadata?.role
    if (!canAccessRoute(role, pathname)) {
      return applyCookies(NextResponse.redirect(new URL('/dashboard', request.url)))
    }
  }

  if (pathname.startsWith('/login') && user) {
    return applyCookies(NextResponse.redirect(new URL('/dashboard', request.url)))
  }

  return applyCookies(NextResponse.next())
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
