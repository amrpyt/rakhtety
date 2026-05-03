import { z } from 'zod'
import { CLIENT_INTAKE_DOCUMENTS } from '@/lib/domain/workflow-templates'

const roleSchema = z.enum(['admin', 'employee', 'manager'], {
  message: 'الدور غير صالح',
})

const optionalText = z
  .string()
  .transform((value) => value.trim())
  .optional()
  .or(z.literal('').transform(() => undefined))

const requiredText = (message: string) => z.string().trim().min(1, message)

const normalizeEgyptianPhone = (value: string | undefined) => {
  if (!value) return undefined

  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('20') && digits.length === 12) {
    return `0${digits.slice(2)}`
  }

  return digits
}

export const sanitizePhoneInput = (value: string) => {
  const trimmed = value.trimStart()
  const hasPlusPrefix = trimmed.startsWith('+')
  const cleaned = trimmed.replace(/[^\d\s+]/g, '').replace(/(?!^)\+/g, '')

  return hasPlusPrefix ? `+${cleaned.replace(/^\++/, '')}` : cleaned.replace(/\+/g, '')
}

const phoneSchema = z
  .string()
  .transform((value) => normalizeEgyptianPhone(value.trim()))
  .optional()
  .or(z.literal('').transform(() => undefined))
  .refine(
    (value) => !value || /^01\d{9}$/.test(value),
    'رقم الهاتف يجب أن يكون 11 رقم مصري، ويمكن كتابته بمسافات أو +20'
  )

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة').min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export const signupSchema = z.object({
  full_name: requiredText('الاسم مطلوب'),
  email: z.string().trim().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صالح'),
  phone: phoneSchema,
  password: z.string().min(1, 'كلمة المرور مطلوبة').min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: roleSchema.default('employee'),
})

export const clientCreateSchema = z.object({
  name: requiredText('اسم العميل مطلوب'),
  phone: phoneSchema,
  city: optionalText,
  district: optionalText,
  neighborhood: optionalText,
  parcel_number: optionalText,
  intake_documents: z.array(z.string()).default([]),
}).superRefine((value, context) => {
  const uploaded = new Set(value.intake_documents)

  for (const document of CLIENT_INTAKE_DOCUMENTS) {
    if (document.required && !uploaded.has(document.type)) {
      context.addIssue({
        code: 'custom',
        path: ['intake_documents'],
        message: `يجب تأكيد مستند: ${document.label}`,
      })
    }
  }
})

const employeeBaseSchema = z.object({
  full_name: requiredText('الاسم مطلوب'),
  phone: phoneSchema,
  position: optionalText,
  role: roleSchema,
})

export const employeeCreateSchema = employeeBaseSchema.extend({
  email: z.string().trim().min(1, 'البريد الإلكتروني مطلوب').email('البريد الإلكتروني غير صالح'),
})

export const employeeUpdateSchema = employeeBaseSchema

export const paymentSchema = z.object({
  amount: z.coerce.number({ message: 'المبلغ مطلوب' }).positive('المبلغ يجب أن يكون أكبر من صفر'),
  workflow_step_id: optionalText.nullish(),
  payment_method: optionalText.nullish(),
  reference_number: optionalText.nullish(),
  notes: optionalText.nullish(),
})

export const documentUploadSchema = z.object({
  document_type: requiredText('نوع المستند مطلوب'),
  file: z
    .instanceof(File, { message: 'الملف مطلوب' })
    .refine((file) => file.size > 0, 'الملف مطلوب')
    .refine((file) => file.size <= 10 * 1024 * 1024, 'حجم الملف يجب ألا يتجاوز 10 ميجابايت')
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type),
      'المسموح فقط PDF أو JPG أو PNG'
    ),
})

export const workflowReasonSchema = z.object({
  reason: requiredText('سبب الإجراء مطلوب').min(5, 'اكتب سبب واضح من 5 أحرف على الأقل'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ClientCreateFormData = z.infer<typeof clientCreateSchema>
export type EmployeeCreateFormData = z.infer<typeof employeeCreateSchema>
export type EmployeeUpdateFormData = z.infer<typeof employeeUpdateSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>
export type WorkflowReasonFormData = z.infer<typeof workflowReasonSchema>
