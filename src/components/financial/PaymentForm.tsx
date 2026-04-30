import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card'
import { FormGroup, Input, Label, Select } from '@/components/ui/Form'
import { paymentSchema, type PaymentFormData } from '@/lib/validation/schemas'
import type { WorkflowStepWithEmployee } from '@/types/database.types'

interface PaymentFormProps {
  steps?: WorkflowStepWithEmployee[]
  loading?: boolean
  onSubmit: (data: {
    amount: number
    workflow_step_id?: string | null
    payment_method?: string | null
    reference_number?: string | null
    notes?: string | null
  }) => Promise<void>
}

export function PaymentForm({ steps = [], loading = false, onSubmit }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      workflow_step_id: '',
      payment_method: '',
      reference_number: '',
      notes: '',
    },
  })

  const submit = async (data: PaymentFormData) => {
    await onSubmit({
      amount: data.amount,
      workflow_step_id: data.workflow_step_id || null,
      payment_method: data.payment_method || null,
      reference_number: data.reference_number || null,
      notes: data.notes || null,
    })

    reset()
  }

  return (
    <Card className="paper-card">
      <CardHeader>
        <div>
          <CardTitle>تسجيل دفعة</CardTitle>
          <CardSubtitle>سجّل مبلغ جديد بدون الخروج من ملف العميل.</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/70 p-4" onSubmit={handleSubmit((data) => submit(data as PaymentFormData))} noValidate>
          <FormGroup>
            <Label htmlFor="payment-amount">المبلغ</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              error={errors.amount?.message}
              placeholder="0"
              {...register('amount')}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="payment-step">تخصيص الدفعة</Label>
            <Select
              id="payment-step"
              placeholder="دفعة على المسار بالكامل"
              options={steps.map((step) => ({ value: step.id, label: step.name }))}
              error={errors.workflow_step_id?.message}
              {...register('workflow_step_id')}
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup>
              <Label htmlFor="payment-method">طريقة الدفع</Label>
              <Input
                id="payment-method"
                placeholder="نقدي / تحويل"
                error={errors.payment_method?.message}
                {...register('payment_method')}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="payment-reference">رقم المرجع</Label>
              <Input
                id="payment-reference"
                placeholder="اختياري"
                error={errors.reference_number?.message}
                {...register('reference_number')}
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor="payment-notes">ملاحظات</Label>
            <Input
              id="payment-notes"
              placeholder="اختياري"
              error={errors.notes?.message}
              {...register('notes')}
            />
          </FormGroup>

          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            حفظ الدفعة
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
