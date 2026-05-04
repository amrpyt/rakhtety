import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const appRoot = path.resolve(__dirname)
const pageRoot = path.join(appRoot, 'rakhtety', 'page')

function readText(relativePath: string) {
  return readFileSync(path.join(appRoot, relativePath), 'utf8')
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T
}

describe('Rakhtety Frappe Desk metadata', () => {
  it('keeps every custom Desk Page JSON in source control with the expected Arabic titles', () => {
    const expectedPages = [
      ['rakhtety_command_center/rakhtety_command_center.json', 'rakhtety-command-center', 'مكتب رخصتي'],
      ['rakhtety_clients/rakhtety_clients.json', 'rakhtety-clients', 'ملفات العملاء'],
      ['rakhtety_workflows/rakhtety_workflows.json', 'rakhtety-workflows', 'الفلو والخطوات'],
      ['rakhtety_finance/rakhtety_finance.json', 'rakhtety-finance', 'الحسابات'],
      ['rakhtety_employees/rakhtety_employees.json', 'rakhtety-employees', 'الموظفين'],
      ['rakhtety_documents/rakhtety_documents.json', 'rakhtety-documents', 'المستندات'],
    ] as const

    for (const [relativePath, pageName, title] of expectedPages) {
      const page = readJson<{ name: string; page_name: string; title: string }>(
        path.join('rakhtety', 'page', relativePath),
      )

      expect(page.name).toBe(pageName)
      expect(page.page_name).toBe(pageName)
      expect(page.title).toBe(title)
    }
  })

  it('keeps the old financial route as a real alias to the current finance page', () => {
    const aliasJson = path.join(pageRoot, 'rakhtety_financial', 'rakhtety_financial.json')
    const aliasJs = path.join(pageRoot, 'rakhtety_financial', 'rakhtety_financial.js')

    expect(existsSync(aliasJson)).toBe(true)
    expect(existsSync(aliasJs)).toBe(true)

    const page = JSON.parse(readFileSync(aliasJson, 'utf8')) as { name: string; page_name: string; title: string }
    const script = readFileSync(aliasJs, 'utf8')

    expect(page.name).toBe('rakhtety-financial')
    expect(page.page_name).toBe('rakhtety-financial')
    expect(page.title).toBe('الحسابات')
    expect(script).toContain('frappe.set_route("rakhtety-finance")')
  })

  it('runs Desk metadata setup during install, patching, and migrate', () => {
    const hooks = readText('hooks.py')
    const patches = readText('patches.txt')
    const metadataPatch = readText('patches/v0_0_1/create_v16_desk_metadata.py')

    expect(hooks).toContain('after_install = "rakhtety_frappe.install.after_install"')
    expect(hooks).toContain('after_migrate = ["rakhtety_frappe.patches.v0_0_1.create_v16_desk_metadata.execute"]')
    expect(patches).toContain('rakhtety_frappe.patches.v0_0_1.create_v16_desk_metadata')
    expect(metadataPatch).toContain('"standard": 1')
    expect(metadataPatch).toContain('get_valid_columns')
  })

  it('formats finance event timestamps for people instead of showing raw ISO strings', () => {
    const sectionsScript = readText(path.join('public', 'rakhtety', 'desk_sections.js'))

    expect(sectionsScript).toContain('function formatDateTime(value)')
    expect(sectionsScript).toContain('new Intl.DateTimeFormat("ar-EG"')
    expect(sectionsScript).toContain('hour12: true')
    expect(sectionsScript).toContain('cell(formatDateTime(event.created_at))')
  })

  it('bumps Rakhtety Desk shared script cache keys after the date-format change', () => {
    const pages = readdirSync(pageRoot)
      .filter((entry) => entry.startsWith('rakhtety_') && entry !== 'rakhtety_financial')
      .map((entry) => path.join('rakhtety', 'page', entry, `${entry}.js`))

    for (const pageScriptPath of pages) {
      expect(readText(pageScriptPath)).toContain('desk_sections.js?v=date-format-20260504')
    }
  })

  it('does not keep broken Arabic encoding markers in Rakhtety Desk metadata source files', () => {
    const roots = [
      path.join(appRoot, 'patches', 'v0_0_1'),
      path.join(appRoot, 'rakhtety', 'page'),
      path.join(appRoot, 'public', 'rakhtety'),
    ]
    const files = roots.flatMap((root) => listFiles(root))
    const brokenEncoding = /[ØÙÃÂ�]|â(?![a-z])/u

    for (const file of files) {
      if (!/\.(json|js|py|css|csv)$/.test(file)) continue
      expect(readFileSync(file, 'utf8'), file).not.toMatch(brokenEncoding)
    }
  })
})

function listFiles(root: string): string[] {
  if (!existsSync(root)) return []

  return readdirSync(root).flatMap((entry) => {
    const absolutePath = path.join(root, entry)
    const stat = statSync(absolutePath)

    return stat.isDirectory() ? listFiles(absolutePath) : absolutePath
  })
}
