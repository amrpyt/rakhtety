import { describe, expect, it } from 'vitest'
import { POST } from './route'

describe('signup API', () => {
  it('blocks public self-signup', async () => {
    const response = await POST()
    const payload = await response.json()

    expect(response.status).toBe(403)
    expect(payload.error).toContain('admin-only')
  })
})
