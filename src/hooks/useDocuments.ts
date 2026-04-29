import { useCallback, useEffect, useState } from 'react'
import { documentService, type StepDocumentStatus } from '@/lib/services/document.service'

interface UseDocumentsReturn {
  status: StepDocumentStatus | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  uploadDocument: (input: { file: File; document_type: string; label: string }) => Promise<void>
  getDocumentDownloadUrl: (documentId: string) => Promise<string>
}

export function useDocuments(workflowId?: string, stepId?: string): UseDocumentsReturn {
  const [status, setStatus] = useState<StepDocumentStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!stepId) {
      setStatus(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      setStatus(await documentService.getStepDocumentStatus(stepId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تحميل المستندات')
    } finally {
      setLoading(false)
    }
  }, [stepId])

  const uploadDocument = useCallback(
    async (input: { file: File; document_type: string; label: string }) => {
      if (!workflowId || !stepId) return

      setLoading(true)
      setError(null)
      try {
        await documentService.uploadDocument({
          workflow_id: workflowId,
          workflow_step_id: stepId,
          document_type: input.document_type,
          label: input.label,
          file: input.file,
        })
        await refresh()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'تعذر رفع المستند'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [refresh, stepId, workflowId]
  )

  const getDocumentDownloadUrl = useCallback(async (documentId: string) => {
    return documentService.createDocumentDownloadUrl(documentId)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { status, loading, error, refresh, uploadDocument, getDocumentDownloadUrl }
}
