import { NextRequest, NextResponse } from 'next/server'
import { canAccessRoute } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'

const PUBLIC_ROUTES = ['/login', '/signup']
const PROTECTED_ROUTES = ['/dashboard', '/clients', '/workflows', '/employees', '/finance', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (!isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }

  const session = readServerSession(request)
  const user = session?.user ?? null

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isProtectedRoute && user && !canAccessRoute(user.role, pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
