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
    const response = await fetch(`/api/workflow-steps/${encodeURIComponent(stepId)}/documents`)
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'تعذر تحميل مستندات الخطوة')
    return payload.status
  },

  async createDocumentPreviewUrl(documentId: string): Promise<string> {
    const response = await fetch(`/api/workflow-documents/${encodeURIComponent(documentId)}/signed-url`)
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'تعذر فتح المستند')
    return payload.signedUrl
  },

  async createDocumentDownloadUrl(documentId: string): Promise<string> {
    const response = await fetch(`/api/workflow-documents/${encodeURIComponent(documentId)}/signed-url?download=1`)
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.error || 'تعذر تحميل المستند')
    return payload.signedUrl
  },

  async assertStepCanComplete(stepId: string): Promise<void> {
    const status = await this.getStepDocumentStatus(stepId)
    if (!status.canComplete) throw new Error('يجب رفع المستند المطلوب قبل إكمال الخطوة')
  },
}
