import type { NextRequest } from 'next/server'
import { validateDocumentFile } from '@/lib/services/document-helpers'

interface IntakeFilePayload {
  type: string
  file_name: string
  mime_type: string
  content_base64: string
}

interface ParsedClientCreateRequest {
  body: Record<string, unknown>
  intakeFiles: Map<string, File>
}

type ClientCreateRequestReader = Pick<NextRequest, 'headers' | 'formData' | 'json'>

export async function parseClientCreateRequest(request: ClientCreateRequestReader): Promise<ParsedClientCreateRequest> {
  const intakeFiles = new Map<string, File>()
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const fileTypes = formData.getAll('intake_file_types').map((value) => String(value))
    const files = formData
      .getAll('intake_files')
      .filter((value): value is File => value instanceof File)

    files.forEach((file, index) => {
      const type = fileTypes[index]
      if (!type) return

      validateDocumentFile(file)
      intakeFiles.set(type, file)
    })

    return {
      body: {
        name: formData.get('name'),
        phone: formData.get('phone'),
        city: formData.get('city'),
        district: formData.get('district'),
        neighborhood: formData.get('neighborhood'),
        parcel_number: formData.get('parcel_number'),
      },
      intakeFiles,
    }
  }

  const body = await request.json()
  const rawIntakeFiles = Array.isArray(body.intake_files)
    ? (body.intake_files as IntakeFilePayload[])
    : []

  for (const payload of rawIntakeFiles) {
    const fileBytes = Uint8Array.from(atob(payload.content_base64), (character) => character.charCodeAt(0))
    const file = new File([fileBytes], payload.file_name, { type: payload.mime_type })

    if (file.size > 0) {
      validateDocumentFile(file)
      intakeFiles.set(payload.type, file)
    }
  }

  return { body, intakeFiles }
}
