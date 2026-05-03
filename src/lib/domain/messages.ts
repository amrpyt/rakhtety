import type { WorkflowStatus } from '@/types/database.types'

export const domainMessages = {
  entities: {
    client: 'العميل',
    workflow: 'المسار',
    workflowStep: 'الخطوة',
    employee: 'الموظف',
    unknownClient: 'عميل غير معروف',
  },
  validation: {
    clientNameRequired: 'اسم العميل مطلوب',
    positiveAmountRequired: 'المبلغ يجب أن يكون أكبر من صفر',
    emergencyReasonRequired: 'سبب التجاوز الطارئ مطلوب',
    moveBackReasonRequired: 'سبب الرجوع مطلوب',
  },
  workflow: {
    deviceLicenseMustComplete: 'رخصة الجهاز يجب أن تكتمل أولاً',
    deviceLicenseMissing: 'رخصة الجهاز غير موجودة - يجب إنشاء رخصة الجهاز أولاً',
    stepMustStartBeforeComplete: 'لا يمكن إكمال خطوة لم تبدأ بعد',
    stepMustStartBeforeEmergencyComplete: 'يجب بدء الخطوة أولاً قبل التجاوز الطارئ',
    invalidMoveBack: 'لا يمكن الرجوع من حالة هذه الخطوة',
    status: {
      pending: 'في الانتظار',
      in_progress: 'جاري التنفيذ',
      completed: 'مكتملة',
      blocked: 'محظورة',
    } satisfies Record<WorkflowStatus, string>,
  },
}

export function getBlockedExcavationReason(status: WorkflowStatus): string {
  return `رخصة الجهاز ${domainMessages.workflow.status[status]} - يجب اكتمالها أولاً`
}
