'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SearchBar } from '@/components/ui/SearchBar'
import { ClientCard } from '@/components/client/ClientCard'
import { ClientTable } from '@/components/client/ClientTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
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
  const {
    clients,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    createClient,
  } = useClients()

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
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

  const tabs = [
    { id: 'card', label: 'عرض البطاقات' },
    { id: 'table', label: 'عرض الجدول' },
  ]
  const phoneField = register('phone')

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
    <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">ملفات العملاء</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {clients.length} عميل مسجل
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setShowAddDialog(true)}>
          +
          إضافة عميل
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          placeholder="ابحث بالاسم، رقم الملف، المدينة، أو الهاتف..."
          value={searchQuery}
          onSearch={setSearchQuery}
          className="w-full lg:max-w-xl"
        />
        <Tabs
          tabs={tabs}
          defaultTab={viewMode}
          onChange={(id) => setViewMode(id as 'card' | 'table')}
        />
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
            hasSearch
              ? 'جرّب البحث باسم العميل، رقم الملف، المدينة، أو الهاتف.'
              : 'اضغط إضافة عميل لإدخال أول ملف.'
          }
          action={
            hasSearch
              ? undefined
              : {
                  label: 'إضافة عميل',
                  onClick: () => setShowAddDialog(true),
                }
          }
        />
      )}

      {!loading && !error && displayedClients.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {displayedClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => router.push(`/clients/${client.id}`)}
            />
          ))}
        </div>
      )}

      {!loading && !error && displayedClients.length > 0 && viewMode === 'table' && (
        <ClientTable
          clients={displayedClients}
          onRowClick={(client) => router.push(`/clients/${client.id}`)}
        />
      )}

      <Dialog open={showAddDialog} onOpenChange={(open) => (open ? setShowAddDialog(true) : closeDialog())}>
        <form onSubmit={handleSubmit((data) => handleCreateClient(data as ClientCreateFormData))} noValidate>
          <DialogHeader>
            <DialogTitle>إضافة عميل جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات الملف، ثم أكد وجود المستندات الأساسية قبل الحفظ.
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
              <h3 className="mb-2 text-sm font-bold">المستندات الأساسية</h3>
              <div className="grid gap-2">
                {CLIENT_INTAKE_DOCUMENTS.map((document) => (
                  <label
                    key={document.type}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-offset)] px-3 py-2 text-sm"
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
