'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SearchBar } from '@/components/ui/SearchBar'
import { ClientCard } from '@/components/client/ClientCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/auth/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { FormGroup, Input, Label } from '@/components/ui/Form'
import { useClients } from '@/hooks/useClients'
import { can } from '@/lib/auth/permissions'
import { CLIENT_INTAKE_DOCUMENTS } from '@/lib/domain/workflow-templates'
import { clientCreateSchema, sanitizePhoneInput, type ClientCreateFormData } from '@/lib/validation/schemas'

const emptyForm: ClientCreateFormData = {
  name: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  parcel_number: '',
  intake_documents: [],
}

export default function ClientsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    clients,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    createClient,
  } = useClients()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [intakeFiles, setIntakeFiles] = useState<Record<string, File>>({})
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(clientCreateSchema),
    defaultValues: emptyForm,
  })

  const hasSearch = searchQuery.trim().length >= 2
  const displayedClients = hasSearch ? searchResults : clients
  const canManageClients = can(user?.role, 'manageClients')

  const phoneField = register('phone')
  const requiredDocumentCount = CLIENT_INTAKE_DOCUMENTS.filter((document) => document.required).length
  const uploadedDocumentCount = Object.keys(intakeFiles).length

  const updateIntakeFile = (type: string, file?: File) => {
    setIntakeFiles((current) => {
      const next = { ...current }
      if (file) {
        next[type] = file
      } else {
        delete next[type]
      }
      setValue('intake_documents', Object.keys(next), { shouldDirty: true, shouldValidate: true })
      return next
    })
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    reset(emptyForm)
    setIntakeFiles({})
    setFormError(null)
    setSaving(false)
  }

  const handleCreateClient = async (data: ClientCreateFormData) => {
    setSaving(true)
    setFormError(null)

    try {
      const client = await createClient(data, intakeFiles)
      closeDialog()
      router.push(`/clients/${client.id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'تعذر إضافة العميل')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="client-hero mb-6 rounded-[var(--radius-2xl)] p-5 sm:p-6 lg:p-7">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[var(--color-primary)] shadow-sm">
              غرفة ملفات العملاء
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">ملفات العملاء</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
              ابحث عن ملف، افتحه، أو أضف عميل جديد. لا تختار طريقة عرض؛ الصفحة تعرض الملفات ككروت عمل واضحة.
            </p>
          </div>
          <div className="rounded-[var(--radius-2xl)] border border-white/70 bg-white/72 p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs font-bold text-[var(--color-text-muted)]">إجمالي الملفات</p>
            <p className="mt-1 text-3xl font-black">{clients.length}</p>
            <p className="text-xs text-[var(--color-text-muted)]">عميل مسجل</p>
          </div>
        </div>
      </div>

      <div className="paper-card mb-6 rounded-[var(--radius-2xl)] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-black">المطلوب هنا</h2>
            <p className="text-sm text-[var(--color-text-muted)]">اكتب اسم العميل أو رقم الملف. لو العميل جديد، اضغط إضافة عميل.</p>
          </div>
          {canManageClients && <Button className="w-full sm:w-auto" onClick={() => setShowAddDialog(true)}>
            + إضافة عميل
          </Button>}
        </div>
        <div className="mt-4">
          <SearchBar
            placeholder="ابحث بالاسم، رقم الملف، المدينة، أو الهاتف..."
            value={searchQuery}
            onSearch={setSearchQuery}
            className="w-full"
          />
          {hasSearch && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              النتائج الحالية: {displayedClients.length}
            </p>
          )}
        </div>
      </div>

      {loading && (
        <div className="py-12">
          <LoadingSpinner label="جاري تحميل العملاء..." />
        </div>
      )}

      {error && (
        <EmptyState
          icon="M12 9v2m0 4h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          title="حدث خطأ"
          description={error}
        />
      )}

      {!loading && !error && displayedClients.length === 0 && (
        <EmptyState
          icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0 0 0 8 M17 11l2 2 4-4"
          title={hasSearch ? 'لا توجد نتائج' : 'لا يوجد عملاء'}
          description={
            hasSearch || !canManageClients
              ? 'جرّب البحث باسم العميل، رقم الملف، المدينة، أو الهاتف.'
              : 'اضغط إضافة عميل لإدخال أول ملف.'
          }
          action={
            hasSearch || !canManageClients
              ? undefined
              : {
                  label: 'إضافة عميل',
                  onClick: () => setShowAddDialog(true),
                }
          }
        />
      )}

      {!loading && !error && displayedClients.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayedClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              href={`/clients/${client.id}`}
            />
          ))}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={(open) => (open ? setShowAddDialog(true) : closeDialog())}>
        <form onSubmit={handleSubmit((data) => handleCreateClient(data as ClientCreateFormData))} noValidate>
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات الملف وارفع مستندات البداية مرة واحدة. بعد الحفظ ستظهر داخل ملف العميل.
            </DialogDescription>
          </DialogHeader>

          <DialogContent className="space-y-4">
            {formError && (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
                {formError}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <FormGroup>
                <Label htmlFor="client-name">اسم العميل *</Label>
                <Input id="client-name" error={errors.name?.message} {...register('name')} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="client-phone">رقم الهاتف</Label>
                <Input
                  id="client-phone"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  error={errors.phone?.message}
                  {...phoneField}
                  onChange={(event) => {
                    event.target.value = sanitizePhoneInput(event.target.value)
                    phoneField.onChange(event)
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="client-city">المدينة</Label>
                <Input id="client-city" error={errors.city?.message} {...register('city')} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="client-neighborhood">الحي / المنطقة</Label>
                <Input id="client-neighborhood" error={errors.neighborhood?.message} {...register('neighborhood')} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="client-district">رقم المجاورة</Label>
                <Input id="client-district" error={errors.district?.message} {...register('district')} />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="client-parcel">رقم القطعة / الملف</Label>
                <Input id="client-parcel" error={errors.parcel_number?.message} {...register('parcel_number')} />
              </FormGroup>
            </div>

            <div>
              <div className="mb-3 rounded-[var(--radius-xl)] border border-[var(--color-primary)]/15 bg-[var(--color-primary-light)]/50 p-3">
                <h3 className="text-sm font-bold">مستندات البداية</h3>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  المطلوب {requiredDocumentCount} ملفات أساسية. المرفوع الآن: {uploadedDocumentCount}.
                </p>
              </div>
              <div className="grid gap-2">
                {CLIENT_INTAKE_DOCUMENTS.map((document) => (
                  <label
                    key={document.type}
                    className="flex flex-col gap-2 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/80 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>
                      {document.label}
                      {!document.required && (
                        <span className="text-[var(--color-text-muted)]"> — اختياري</span>
                      )}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      onChange={(event) => updateIntakeFile(document.type, event.target.files?.[0])}
                      className="max-w-[220px] text-xs"
                    />
                  </label>
                ))}
              </div>
              {errors.intake_documents?.message && (
                <p className="mt-2 text-xs text-[var(--color-error)]">{errors.intake_documents.message}</p>
              )}
            </div>
          </DialogContent>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeDialog}>
              إلغاء
            </Button>
            <Button type="submit" loading={saving}>
              حفظ العميل
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}
