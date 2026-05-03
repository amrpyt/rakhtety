import type { WorkflowDocument, WorkflowDocumentRequirement } from '@/types/database.types'

export interface UploadWorkflowDocumentInput {
  workflow_id: string
  workflow_step_id: string
  document_type: string
  label: string
  file: File
  government_fees?: number
  office_profit?: number
  uploaded_by?: string | null
}

export interface StepDocumentStatus {
  documents: WorkflowDocument[]
  requirements: WorkflowDocumentRequirement[]
  missingRequired: WorkflowDocumentRequirement[]
  canComplete: boolean
}

export const documentService = {
  async uploadDocument(input: UploadWorkflowDocumentInput): Promise<WorkflowDocument> {
    const formData = new FormData()
    formData.append('workflow_id', input.workflow_id)
    formData.append('workflow_step_id', input.workflow_step_id)
    formData.append('document_type', input.document_type)
    formData.append('label', input.label)
    formData.append('file', input.file)
    if (input.government_fees !== undefined) formData.append('government_fees', String(input.government_fees))
    if (input.office_profit !== undefined) formData.append('office_profit', String(input.office_profit))

    const response = await fetch('/api/workflow-documents/upload', {
      method: 'POST',
      body: formData,
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'تعذر رفع المستند')
    return payload.document
  },

  async getStepDocumentStatus(stepId: string): Promise<StepDocumentStatus> {
    void stepId
    return {
      documents: [],
      requirements: [],
      missingRequired: [],
      canComplete: true,
    }
  },

  async createDocumentPreviewUrl(documentId: string): Promise<string> {
    return `/api/workflow-documents/${encodeURIComponent(documentId)}`
  },

  async createDocumentDownloadUrl(documentId: string): Promise<string> {
    return `/api/workflow-documents/${encodeURIComponent(documentId)}`
  },

  async assertStepCanComplete(stepId: string): Promise<void> {
    void stepId
  },
}
