import type { DashboardAlert, DashboardBottleneck } from '@/types/database.types'

export interface SendBottleneckAlertInput {
  bottleneck: DashboardBottleneck
  created_by?: string | null
}

export const dashboardAlertService = {
  async sendBottleneckAlert(input: SendBottleneckAlertInput): Promise<DashboardAlert> {
    return {
      id: `frappe-alert-${input.bottleneck.workflow_step_id}`,
      workflow_id: input.bottleneck.workflow_id,
      workflow_step_id: input.bottleneck.workflow_step_id,
      recipient_id: input.bottleneck.assigned_to || '',
      created_by: input.created_by || null,
      type: 'bottleneck',
      message: `تنبيه: ملف ${input.bottleneck.client_name} متوقف عند ${input.bottleneck.step_name}.`,
      status: 'unread',
      created_at: new Date().toISOString(),
      read_at: null,
    }
  },

  async findUnreadForUser(): Promise<DashboardAlert[]> {
    return []
  },
}
