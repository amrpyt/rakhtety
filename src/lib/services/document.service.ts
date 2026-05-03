import { documentRepository } from '@/lib/database/repositories/document.repository'
import { workflowStepRepository } from '@/lib/database/repositories/workflow-step.repository'
import { supabase } from '@/lib/supabase/client'
import { AppError, NotFoundError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'
import type { WorkflowDocument, WorkflowDocumentRequirement } from '@/types/database.types'

export interface UploadWorkflowDocumentInput {
  workflow_id: string
  workflow_step_id: string
  document_type: string
  label: string
  file: File
  uploaded_by?: string | null
}

export interface StepDocumentStatus {
  documents: WorkflowDocument[]
  requirements: WorkflowDocumentRequirement[]
  missingRequired: WorkflowDocumentRequirement[]
  canComplete: boolean
}

const BUCKET = 'workflow-documents'
const DOWNLOAD_URL_TTL_SECONDS = 60

export class DocumentService {
  async uploadDocument(input: UploadWorkflowDocumentInput): Promise<WorkflowDocument> {
    const formData = new FormData()
    formData.append('workflow_id', input.workflow_id)
    formData.append('workflow_step_id', input.workflow_step_id)
    formData.append('document_type', input.document_type)
    formData.append('label', input.label)
    formData.append('file', input.file)

    const response = await fetch('/api/workflow-documents/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.error || 'تعذر رفع المستند')

    return result.document
  }

  async getStepDocumentStatus(stepId: string): Promise<StepDocumentStatus> {
    const step = await workflowStepRepository.findById(stepId)
    if (!step) {
      throw new NotFoundError('الخطوة', stepId)
    }

    const [documents, requirements] = await Promise.all([
      documentRepository.findByStepId(stepId),
      documentRepository.findRequirementsByStepName(step.name),
    ])

    const uploadedTypes = new Set(documents.map((document) => document.document_type))
    const missingRequired = requirements.filter(
      (requirement) => requirement.is_required && !uploadedTypes.has(requirement.document_type)
    )

    return {
      documents,
      requirements,
      missingRequired,
      canComplete: missingRequired.length === 0,
    }
  }

  async createDocumentPreviewUrl(documentId: string): Promise<string> {
    const document = await documentRepository.findById(documentId)
    if (!document) {
      throw new NotFoundError('Workflow document', documentId)
    }

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(
      document.storage_path,
      DOWNLOAD_URL_TTL_SECONDS
    )

    if (error || !data?.signedUrl) {
      throw new AppError({
        code: ErrorCodes.DB_QUERY_FAILED,
        message: 'تعذر إنشاء رابط المعاينة الآمن.',
        statusCode: 500,
        context: {
          documentId,
          storagePath: document.storage_path,
        },
      })
    }

    return data.signedUrl
  }

  async createDocumentDownloadUrl(documentId: string): Promise<string> {
    const document = await documentRepository.findById(documentId)
    if (!document) {
      throw new NotFoundError('Workflow document', documentId)
    }

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(document.storage_path, DOWNLOAD_URL_TTL_SECONDS, {
      download: document.file_name,
    })

    if (error || !data?.signedUrl) {
      throw new AppError({
        code: ErrorCodes.DB_QUERY_FAILED,
        message: 'تعذر إنشاء رابط تحميل آمن لهذا المستند.',
        statusCode: 500,
        context: {
          documentId,
          storagePath: document.storage_path,
        },
      })
    }

    return data.signedUrl
  }

  async assertStepCanComplete(stepId: string): Promise<void> {
    const status = await this.getStepDocumentStatus(stepId)
    if (!status.canComplete) {
      throw new AppError({
        code: ErrorCodes.WORKFLOW_DOCUMENTS_MISSING,
        message: `يجب رفع المستندات المطلوبة أولاً: ${status.missingRequired.map((item) => item.label).join('، ')}`,
        statusCode: 400,
        context: {
          stepId,
          missing: status.missingRequired.map((item) => item.document_type),
        },
      })
    }
  }
}

export const documentService = new DocumentService()
