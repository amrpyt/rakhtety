import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const PUBLIC_ROUTES = ['/login', '/signup', '/api/auth']
const PROTECTED_ROUTES = ['/dashboard', '/clients', '/workflows', '/employees', '/settings']

export async function middleware(request: NextRequest) {
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

  if (pathname.startsWith('/login') && user) {
    return applyCookies(NextResponse.redirect(new URL('/dashboard', request.url)))
  }

  return applyCookies(NextResponse.next())
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
