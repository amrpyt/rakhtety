import { execFile } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const LOG_LINE_LIMIT = 500
const ERROR_PATTERN = /error|exception|traceback|failed|fatal|unhandled|warning|warn/i

export interface MonitorLogLine {
  source: 'frontend' | 'backend'
  stream: string
  line: string
  isError: boolean
}

export interface MonitorSnapshot {
  generatedAt: string
  frontend: MonitorLogLine[]
  backend: MonitorLogLine[]
  errors: MonitorLogLine[]
  meta: {
    frontendFiles: string[]
    backendContainer: string
    limit: number
  }
}

function clampLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) return 200
  return Math.max(20, Math.min(LOG_LINE_LIMIT, limit))
}

function tailLines(text: string, limit: number) {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-limit)
}

function toLogLines(source: MonitorLogLine['source'], stream: string, lines: string[]): MonitorLogLine[] {
  return lines.map((line) => ({
    source,
    stream,
    line,
    isError: ERROR_PATTERN.test(line),
  }))
}

export function readFrontendLogs(cwd: string, limit?: number): MonitorLogLine[] {
  const safeLimit = clampLimit(limit)
  const files = existsSync(cwd)
    ? readdirSync(cwd)
        .filter((name) => /^next.*\.(out|err)\.log$|^dev-server\.(out|err)\.log$/.test(name))
        .map((name) => join(cwd, name))
        .filter((path) => existsSync(path))
        .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)
        .slice(0, 6)
    : []

  return files.flatMap((path) => {
    const lines = tailLines(readFileSync(path, 'utf8'), Math.ceil(safeLimit / Math.max(files.length, 1)))
    return toLogLines('frontend', basename(path), lines)
  })
}

export async function readBackendLogs(containerName: string, limit?: number): Promise<MonitorLogLine[]> {
  const safeLimit = clampLimit(limit)

  try {
    const { stdout, stderr } = await execFileAsync('docker', ['logs', `--tail=${safeLimit}`, containerName], {
      timeout: 8000,
      maxBuffer: 1024 * 1024 * 2,
    })

    return [
      ...toLogLines('backend', `${containerName}:stdout`, tailLines(stdout, safeLimit)),
      ...toLogLines('backend', `${containerName}:stderr`, tailLines(stderr, safeLimit)),
    ]
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read backend logs'
    return toLogLines('backend', `${containerName}:docker`, [message])
  }
}

export async function buildMonitorSnapshot(input?: {
  cwd?: string
  backendContainer?: string
  limit?: number
}): Promise<MonitorSnapshot> {
  const cwd = input?.cwd ?? process.cwd()
  const backendContainer = input?.backendContainer ?? process.env.FRAPPE_DOCKER_CONTAINER ?? 'rakhtety-live-backend'
  const limit = clampLimit(input?.limit)
  const frontend = readFrontendLogs(cwd, limit)
  const backend = await readBackendLogs(backendContainer, limit)
  const errors = [...frontend, ...backend].filter((line) => line.isError).slice(-limit)

  return {
    generatedAt: new Date().toISOString(),
    frontend,
    backend,
    errors,
    meta: {
      frontendFiles: [...new Set(frontend.map((line) => line.stream))],
      backendContainer,
      limit,
    },
  }
}
