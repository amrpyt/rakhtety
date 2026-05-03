import { NextRequest } from 'next/server'
import type { AuthSession } from '@/types/auth.types'

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

export function readServerSession(request: NextRequest): AuthSession | null {
  const raw = request.cookies.get(SESSION_COOKIE)?.value
  if (!raw) return null

  try {
    return JSON.parse(decodeCookieValue(raw)) as AuthSession
  } catch {
    return null
  }
}
