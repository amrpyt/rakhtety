import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validation/schemas'
import type { AuthSession, AuthUser } from '@/types/auth.types'
import { extractSessionCookie, getFrappeBaseUrl } from '@/lib/frappe-spike/client'

const SESSION_COOKIE = 'rakhtety-session'

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'بيانات الدخول غير صالحة' }, { status: 400 })
    }

    const body = parsed.data
    const baseUrl = getFrappeBaseUrl()
    const loginResponse = await fetch(`${baseUrl}/api/method/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ usr: body.email, pwd: body.password }),
      cache: 'no-store',
    })

    if (!loginResponse.ok) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 })
    }

    const sid = extractSessionCookie(loginResponse.headers.get('set-cookie'))
    const userResponse = await fetch(`${baseUrl}/api/method/rakhtety_frappe.api.current_user`, {
      method: 'GET',
      headers: { cookie: sid },
      cache: 'no-store',
    })
    const payload = (await userResponse.json()) as { message?: AuthUser }

    if (!userResponse.ok || !payload.message) {
      return NextResponse.json({ error: 'Failed to load current user' }, { status: 502 })
    }

    const authUser = payload.message
    const session: AuthSession = {
      user: authUser,
      access_token: sid,
      refresh_token: sid,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    }

    const responseJson = NextResponse.json({ user: authUser }, { status: 200 })
    responseJson.cookies.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(session)), {
      path: '/',
      sameSite: 'lax',
    })

    return responseJson
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
