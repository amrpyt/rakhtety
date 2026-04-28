import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

const PUBLIC_ROUTES = ['/login', '/signup', '/api/auth']
const PROTECTED_ROUTES = ['/dashboard', '/clients', '/workflows', '/employees', '/settings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (!isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const response = NextResponse.next()

  if (session) {
    response.headers.set('x-user-id', session.user.id)
    response.headers.set('x-user-role', (session.user.user_metadata as { role?: string }).role || 'employee')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}