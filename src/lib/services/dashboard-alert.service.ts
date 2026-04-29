import {
  dashboardAlertRepository,
  type CreateDashboardAlertData,
} from '@/lib/database/repositories/dashboard-alert.repository'
import { profileRepository } from '@/lib/database/repositories/profile.repository'
import { NotFoundError, AppError } from '@/lib/errors/app-error.class'
import { ErrorCodes } from '@/types/error-codes.enum'
import type { DashboardAlert, DashboardBottleneck } from '@/types/database.types'

export interface SendBottleneckAlertInput {
  bottleneck: DashboardBottleneck
  created_by?: string | null
}

export class DashboardAlertService {
  async sendBottleneckAlert(input: SendBottleneckAlertInput): Promise<DashboardAlert> {
    if (!input.bottleneck.assigned_to) {
      throw new AppError({
        code: ErrorCodes.VALIDATION_FAILED,
        message: 'لا يمكن إرسال تنبيه قبل تحديد الموظف المسؤول.',
        statusCode: 400,
        context: { workflow_step_id: input.bottleneck.workflow_step_id },
      })
    }

    const recipient = await profileRepository.findById(input.bottleneck.assigned_to)
    if (!recipient) {
      throw new NotFoundError('الموظف المسؤول', input.bottleneck.assigned_to)
    }

    const data: CreateDashboardAlertData = {
      workflow_id: input.bottleneck.workflow_id,
      workflow_step_id: input.bottleneck.workflow_step_id,
      recipient_id: input.bottleneck.assigned_to,
      created_by: input.created_by || null,
      type: 'bottleneck',
      message: `تنبيه: ملف ${input.bottleneck.client_name} متوقف عند خطوة ${input.bottleneck.step_name} منذ ${input.bottleneck.stuck_days} يوم.`,
    }

    return dashboardAlertRepository.create(data)
  }

  async findUnreadForUser(userId: string): Promise<DashboardAlert[]> {
    return dashboardAlertRepository.findByRecipient(userId, 'unread')
  }
}

export const dashboardAlertService = new DashboardAlertService()
