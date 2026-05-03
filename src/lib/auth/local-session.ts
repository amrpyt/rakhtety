import type { AuthSession, AuthUser } from '@/types/auth.types'

const SESSION_COOKIE = 'rakhtety-session'

function decodeCookieValue(value: string) {
  let decoded = value
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const next = decodeURIComponent(decoded)
    if (next === decoded) return decoded
    decoded = next
  }
  return decoded
}

export function readLocalSessionCookie(): AuthSession | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.split('; ').find((part) => part.startsWith(`${SESSION_COOKIE}=`))
  if (!match) return null

  const raw = decodeCookieValue(match.split('=').slice(1).join('='))
  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function writeLocalSessionCookie(session: AuthSession | null) {
  if (typeof document === 'undefined') return

  if (!session) {
    document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0`
    return
  }

  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(session))}; Path=/; SameSite=Lax`
}

export function toLocalAuthUser(user: AuthUser): AuthUser {
  return user
}
