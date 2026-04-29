import { describe, expect, it, vi } from 'vitest'
import { buildDocumentStoragePath, validateDocumentFile } from './document-helpers'

describe('document service helpers', () => {
  it('accepts supported document files within the size limit', () => {
    const file = new File(['pdf-content'], 'permit.pdf', { type: 'application/pdf' })

    expect(() => validateDocumentFile(file)).not.toThrow()
  })

  it('rejects files with unsupported extensions', () => {
    const file = new File(['notes'], 'notes.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    expect(() => validateDocumentFile(file)).toThrow('مسموح فقط بملفات PDF أو JPG أو JPEG أو PNG')
  })

  it('rejects oversized files', () => {
    const file = new File(['large'], 'plan.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 })

    expect(() => validateDocumentFile(file)).toThrow('الحد الأقصى 10 ميجابايت')
  })

  it('builds storage paths under workflow and step folders', () => {
    const randomUuid = vi.spyOn(crypto, 'randomUUID').mockReturnValue('uuid-123')

    expect(buildDocumentStoragePath('workflow-1', 'step-2', 'scan.PNG')).toBe('workflow-1/step-2/uuid-123.png')

    randomUuid.mockRestore()
  })
})
