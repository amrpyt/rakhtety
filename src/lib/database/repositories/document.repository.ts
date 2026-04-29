import { supabase } from '@/lib/supabase/client'
import type { WorkflowDocument, WorkflowDocumentRequirement } from '@/types/database.types'

export interface CreateWorkflowDocumentData {
  workflow_id: string
  workflow_step_id: string
  document_type: string
  label: string
  file_name: string
  storage_path: string
  mime_type?: string | null
  file_size?: number | null
  uploaded_by?: string | null
}

export interface IDocumentRepository {
  create(data: CreateWorkflowDocumentData): Promise<WorkflowDocument>
  findById(id: string): Promise<WorkflowDocument | null>
  findByStepId(stepId: string): Promise<WorkflowDocument[]>
  findByWorkflowId(workflowId: string): Promise<WorkflowDocument[]>
  findRequirementsByStepName(stepName: string): Promise<WorkflowDocumentRequirement[]>
  delete(id: string): Promise<void>
}

export class DocumentRepository implements IDocumentRepository {
  private readonly documentsTable = 'workflow_documents'
  private readonly requirementsTable = 'workflow_document_requirements'

  async create(data: CreateWorkflowDocumentData): Promise<WorkflowDocument> {
    const { data: result, error } = await supabase
      .from(this.documentsTable)
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async findById(id: string): Promise<WorkflowDocument | null> {
    const { data, error } = await supabase.from(this.documentsTable).select('*').eq('id', id).maybeSingle()

    if (error) throw error
    return data
  }

  async findByStepId(stepId: string): Promise<WorkflowDocument[]> {
    const { data, error } = await supabase
      .from(this.documentsTable)
      .select('*')
      .eq('workflow_step_id', stepId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findByWorkflowId(workflowId: string): Promise<WorkflowDocument[]> {
    const { data, error } = await supabase
      .from(this.documentsTable)
      .select('*')
      .eq('workflow_id', workflowId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findRequirementsByStepName(stepName: string): Promise<WorkflowDocumentRequirement[]> {
    const { data, error } = await supabase
      .from(this.requirementsTable)
      .select('*')
      .eq('step_name', stepName)
      .eq('is_active', true)
      .order('is_required', { ascending: false })

    if (error) throw error
    return data || []
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(this.documentsTable).delete().eq('id', id)
    if (error) throw error
  }
}

export const documentRepository = new DocumentRepository()
