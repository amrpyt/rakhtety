import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card'
import { FormGroup, Input, Label, Select } from '@/components/ui/Form'
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
  const [amount, setAmount] = useState('')
  const [workflowStepId, setWorkflowStepId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('المبلغ يجب أن يكون أكبر من صفر')
      return
    }

    setError(undefined)
    await onSubmit({
      amount: numericAmount,
      workflow_step_id: workflowStepId || null,
      payment_method: paymentMethod || null,
      reference_number: referenceNumber || null,
      notes: notes || null,
    })

    setAmount('')
    setWorkflowStepId('')
    setPaymentMethod('')
    setReferenceNumber('')
    setNotes('')
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>تسجيل دفعة</CardTitle>
          <CardSubtitle>أضف المبلغ الذي دفعه العميل</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="payment-amount">المبلغ</Label>
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              error={error}
              placeholder="0"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="payment-step">تخصيص الدفعة</Label>
            <Select
              id="payment-step"
              value={workflowStepId}
              onChange={(event) => setWorkflowStepId(event.target.value)}
              placeholder="دفعة على المسار بالكامل"
              options={steps.map((step) => ({ value: step.id, label: step.name }))}
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup>
              <Label htmlFor="payment-method">طريقة الدفع</Label>
              <Input
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                placeholder="نقدي / تحويل"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="payment-reference">رقم المرجع</Label>
              <Input
                id="payment-reference"
                value={referenceNumber}
                onChange={(event) => setReferenceNumber(event.target.value)}
                placeholder="اختياري"
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label htmlFor="payment-notes">ملاحظات</Label>
            <Input
              id="payment-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="اختياري"
            />
          </FormGroup>

          <Button type="submit" loading={loading}>
            حفظ الدفعة
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
