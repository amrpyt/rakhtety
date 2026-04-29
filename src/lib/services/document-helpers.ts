import { ValidationError } from '@/lib/errors/app-error.class'

const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const
const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'] as const

function getFileExtension(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() || '' : ''
}

export function validateDocumentFile(file: File) {
  const extension = getFileExtension(file.name)

  if (!extension || !ALLOWED_DOCUMENT_EXTENSIONS.includes(extension as (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number])) {
    throw new ValidationError('مسموح فقط بملفات PDF أو JPG أو JPEG أو PNG لمستندات الخطوات.', {
      fileName: file.name,
      allowedExtensions: ALLOWED_DOCUMENT_EXTENSIONS,
    })
  }

  if (!file.type || !ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number])) {
    throw new ValidationError('نوع الملف غير مسموح. ارفع ملف PDF أو صورة.', {
      fileName: file.name,
      mimeType: file.type || null,
      allowedMimeTypes: ALLOWED_DOCUMENT_MIME_TYPES,
    })
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    throw new ValidationError('حجم المستند كبير. الحد الأقصى 10 ميجابايت.', {
      fileName: file.name,
      fileSize: file.size,
      maxFileSize: MAX_DOCUMENT_FILE_SIZE,
    })
  }
}

export function buildDocumentStoragePath(workflowId: string, workflowStepId: string, fileName: string) {
  const extension = getFileExtension(fileName) || 'file'
  return `${workflowId}/${workflowStepId}/${crypto.randomUUID()}.${extension}`
}
