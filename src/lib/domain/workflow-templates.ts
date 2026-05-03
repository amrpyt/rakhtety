import type { WorkflowType } from '@/types/database.types'

export interface WorkflowStepTemplate {
  name: string
  fees: number
  profit: number
}

export const CLIENT_INTAKE_DOCUMENTS = [
  { type: 'handover_minutes', label: 'صورة محضر الاستلام', required: true },
  { type: 'id_card', label: 'صورة البطاقة', required: true },
  { type: 'power_of_attorney', label: 'توكيل', required: true },
  { type: 'engineering_certificate', label: 'شهادة هندسية', required: true },
  { type: 'measurement_sheet', label: 'كشف قياس', required: true },
  { type: 'receipt_optional', label: 'صورة إيصال - اختياري لحالات التعلية', required: false },
] as const

export const WORKFLOW_STEP_TEMPLATES: Record<WorkflowType, WorkflowStepTemplate[]> = {
  DEVICE_LICENSE: [
    { name: 'بيان الصلاحية', fees: 150, profit: 50 },
    { name: 'تقديم المجمعة العشرية للإسكان المميز', fees: 300, profit: 100 },
    { name: 'استلام المجمعة العشرية للإسكان المميز', fees: 0, profit: 50 },
    { name: 'تقديم ملف رخصة الجهاز', fees: 200, profit: 75 },
    { name: 'دفع إذن الرخصة', fees: 500, profit: 100 },
    { name: 'شراء عقد مخلفات', fees: 250, profit: 50 },
    { name: 'استلام رخصة الجهاز', fees: 100, profit: 50 },
  ],
  EXCAVATION_PERMIT: [
    { name: 'تقديم شهادة الإشراف', fees: 150, profit: 50 },
    { name: 'استلام شهادة الإشراف', fees: 50, profit: 25 },
    { name: 'تقديم التأمينات الاجتماعية', fees: 250, profit: 75 },
    { name: 'استلام وثيقة التأمينات الاجتماعية', fees: 100, profit: 50 },
    { name: 'التقديم على العداد الإنشائي', fees: 200, profit: 60 },
    { name: 'استلام موافقة العداد الإنشائي', fees: 50, profit: 20 },
    { name: 'تقديم تصريح الحفر', fees: 200, profit: 75 },
    { name: 'دفع رسوم تصريح الحفر', fees: 600, profit: 125 },
    { name: 'استلام تصريح الحفر', fees: 100, profit: 50 },
    { name: 'تقديم تصريح التعدين', fees: 200, profit: 75 },
    { name: 'دفع رسوم تصريح التعدين', fees: 800, profit: 150 },
    { name: 'متابعة معاينة الجيش', fees: 0, profit: 100 },
    { name: 'استلام تصريح التعدين', fees: 100, profit: 50 },
  ],
}

export function getWorkflowStepTemplates(type: WorkflowType): WorkflowStepTemplate[] {
  return WORKFLOW_STEP_TEMPLATES[type]
}
