import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readFrontendLogs } from './log-monitor'

describe('readFrontendLogs', () => {
  it('reads recent frontend log lines and marks errors', () => {
    const dir = join(process.cwd(), '.tmp-log-monitor-test')
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'next-dev.err.log'), 'ready\nError: failed request\n')

    const logs = readFrontendLogs(dir, 20)

    expect(logs.map((entry) => entry.line)).toContain('Error: failed request')
    expect(logs.find((entry) => entry.line.includes('failed'))?.isError).toBe(true)
  })
})
