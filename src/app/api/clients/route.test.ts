import { describe, expect, it } from 'vitest'
import { CLIENT_INTAKE_DOCUMENTS } from '@/lib/domain/workflow-templates'
import { parseClientCreateRequest } from './request-parser'

function createPdfFile(name: string) {
  return new File(['pdf-content'], name, { type: 'application/pdf' })
}

describe('clients API request parsing', () => {
  it('keeps JSON intake document types when files upload separately', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Upload Client',
        intake_documents: CLIENT_INTAKE_DOCUMENTS.filter((item) => item.required).map((item) => item.type),
      }),
    })

    const parsed = await parseClientCreateRequest(request)

    expect(parsed.body.intake_documents).toEqual(
      CLIENT_INTAKE_DOCUMENTS.filter((item) => item.required).map((item) => item.type)
    )
    expect(parsed.intakeFiles.size).toBe(0)
  })

  it('parses multipart client fields and intake files together', async () => {
    const formData = new FormData()
    formData.append('name', 'E2E Upload Client')
    formData.append('phone', '01012345678')
    formData.append('city', 'السادات')
    formData.append('district', '1')
    formData.append('neighborhood', 'اختبار')
    formData.append('parcel_number', 'E2E-1')

    for (const document of CLIENT_INTAKE_DOCUMENTS.filter((item) => item.required)) {
      formData.append('intake_documents', document.type)
      formData.append('intake_file_types', document.type)
      formData.append('intake_files', createPdfFile(`${document.type}.pdf`))
    }

    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      body: formData,
    })

    const parsed = await parseClientCreateRequest(request)

    expect(parsed.body).toMatchObject({
      name: 'E2E Upload Client',
      phone: '01012345678',
      city: 'السادات',
      district: '1',
      neighborhood: 'اختبار',
      parcel_number: 'E2E-1',
    })
    expect([...parsed.intakeFiles.keys()]).toEqual(
      CLIENT_INTAKE_DOCUMENTS.filter((item) => item.required).map((item) => item.type)
    )
  })
})
