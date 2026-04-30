'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { FormGroup, Label, Select } from '@/components/ui/Form'
import { useDocuments } from '@/hooks/useDocuments'
import { documentService } from '@/lib/services/document.service'
import { documentUploadSchema, type DocumentUploadFormData } from '@/lib/validation/schemas'
import type { WorkflowDocument } from '@/types/database.types'

interface DocumentUploadPanelProps {
  workflowId: string
  stepId: string
  disabled?: boolean
}

export function DocumentUploadPanel({ workflowId, stepId, disabled = false }: DocumentUploadPanelProps) {
  const { status, loading, error, uploadDocument, getDocumentDownloadUrl } = useDocuments(workflowId, stepId)
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<{
    url: string
    fileName: string
    mimeType: string | null
  } | null>(null)

  const requirementOptions =
    status?.requirements.map((requirement) => ({
      value: requirement.document_type,
      label: `${requirement.label}${requirement.is_required ? ' *' : ''}`,
    })) || []

  const options = requirementOptions.length > 0
    ? requirementOptions
    : [{ value: 'general_document', label: 'مستند عام' }]

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      document_type: options[0]?.value || 'general_document',
    },
  })

  const handleUpload = async (data: DocumentUploadFormData) => {
    const documentLabel = options.find((option) => option.value === data.document_type)?.label.replace(' *', '') || 'مستند عام'

    await uploadDocument({
      file: data.file,
      document_type: data.document_type,
      label: documentLabel,
    })

    reset({ document_type: options[0]?.value || 'general_document' })
  }

  const handleOpenDocument = async (documentId: string) => {
    setOpeningDocumentId(documentId)

    try {
      const signedUrl = await getDocumentDownloadUrl(documentId)
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setOpeningDocumentId(null)
    }
  }

  const handlePreviewDocument = async (document: WorkflowDocument) => {
    setOpeningDocumentId(document.id)

    try {
      const signedUrl = await documentService.createDocumentPreviewUrl(document.id)
      setPreviewDocument({
        url: signedUrl,
        fileName: document.file_name,
        mimeType: document.mime_type,
      })
    } finally {
      setOpeningDocumentId(null)
    }
  }

  const formatUploadedAt = (value: string) =>
    new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))

  const isImagePreview = (document: { fileName: string; mimeType: string | null }) =>
    document.mimeType?.startsWith('image/') || /\.(png|jpe?g)$/i.test(document.fileName)

  const isPdfPreview = (document: { fileName: string; mimeType: string | null }) =>
    document.mimeType === 'application/pdf' || /\.pdf$/i.test(document.fileName)

  return (
    <div className="mt-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/80 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">المستندات</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {status?.canComplete
              ? 'تم رفع كل المستندات المطلوبة.'
              : 'ارفع هنا مستند هذه الخطوة فقط. لا تعيد رفع مستندات العميل الأساسية التي تم رفعها وقت إضافة العميل.'}
          </p>
        </div>
        {status?.missingRequired?.length ? (
          <span className="text-xs font-semibold text-[var(--color-error)]">ناقص: {status.missingRequired.length}</span>
        ) : null}
      </div>

      {status?.missingRequired?.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {status.missingRequired.map((requirement) => (
            <span
              key={requirement.id}
              className="rounded-full bg-[var(--color-error-light)] px-2 py-1 text-xs text-[var(--color-error)]"
            >
              {requirement.label}
            </span>
          ))}
        </div>
      ) : null}

      {status?.documents?.length ? (
        <ul className="mb-3 space-y-2 text-xs text-[var(--color-text-muted)]">
          {status.documents.map((document) => (
            <li key={document.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/80 p-2">
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-text)]">{document.label}</p>
                <p className="truncate">{document.file_name}</p>
                <p>تم الرفع: {formatUploadedAt(document.uploaded_at)}</p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  loading={openingDocumentId === document.id}
                  onClick={() => handlePreviewDocument(document)}
                >
                  معاينة
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  loading={openingDocumentId === document.id}
                  onClick={() => handleOpenDocument(document.id)}
                >
                  تحميل
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <form className="grid grid-cols-1 gap-2 rounded-[var(--radius-lg)] bg-white/64 p-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit(handleUpload)} noValidate>
        <FormGroup>
          <Label htmlFor={`document-type-${stepId}`}>نوع المستند</Label>
          <Select
            id={`document-type-${stepId}`}
            options={options}
            disabled={disabled || loading}
            error={errors.document_type?.message}
            {...register('document_type')}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor={`document-file-${stepId}`}>الملف</Label>
          <Controller
            control={control}
            name="file"
            render={({ field: { onChange, ref } }) => (
              <input
                id={`document-file-${stepId}`}
                ref={ref}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) => onChange(event.target.files?.[0])}
                disabled={disabled || loading}
                className="text-sm"
              />
            )}
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">المسموح: PDF و JPG و PNG حتى 10 ميجابايت.</p>
          {errors.file?.message && <p className="text-xs text-[var(--color-error)]">{errors.file.message}</p>}
        </FormGroup>

        <div className="flex items-end">
          <Button size="sm" type="submit" loading={loading} disabled={disabled}>
            رفع
          </Button>
        </div>
      </form>

      {error && <p className="mt-2 text-xs text-[var(--color-error)]">{error}</p>}

      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] p-3">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--color-text)]">معاينة المستند</p>
                <p className="truncate text-xs text-[var(--color-text-muted)]">{previewDocument.fileName}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewDocument(null)}>
                إغلاق
              </Button>
            </div>
            <div className="min-h-[60vh] overflow-auto p-3">
              {isImagePreview(previewDocument) ? (
                <img
                  src={previewDocument.url}
                  alt={previewDocument.fileName}
                  className="mx-auto max-h-[70vh] max-w-full rounded-[var(--radius-md)] object-contain"
                />
              ) : isPdfPreview(previewDocument) ? (
                <iframe
                  src={previewDocument.url}
                  title={previewDocument.fileName}
                  className="h-[70vh] w-full rounded-[var(--radius-md)] border border-[var(--color-border)]"
                />
              ) : (
                <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--color-text-muted)]">
                  لا يمكن معاينة هذا النوع من الملفات داخل الصفحة.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
