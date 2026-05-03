import React from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuthContext } from './AuthProvider'
import type { AuthSession } from '@/types/auth.types'

function UserProbe() {
  const { user } = useAuthContext()

  return <span>{user?.email ?? 'no-user'}</span>
}

describe('AuthProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps initial server-rendered markup independent from browser session cookies', () => {
    const session: AuthSession = {
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        role: 'admin',
        full_name: 'Admin User',
        position: 'Admin',
      },
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_at: 1893456000,
    }

    vi.stubGlobal('document', {
      cookie: `rakhtety-session=${encodeURIComponent(JSON.stringify(session))}`,
    })

    const html = renderToString(
      <AuthProvider>
        <UserProbe />
      </AuthProvider>,
    )

    expect(html).toContain('no-user')
    expect(html).not.toContain(session.user.email)
  })
})
