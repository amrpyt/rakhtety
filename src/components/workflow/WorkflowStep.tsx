import React from 'react'
import { Badge } from '@/components/ui/Badge'
import type { StepStatus } from '@/types/database.types'

interface WorkflowStepProps {
  name: string
  status: StepStatus
  assignedTo?: string
  completedAt?: string
  fees?: number
  profit?: number
  isLocked?: boolean
  stepNumber?: number
}

const statusConfig: Record<StepStatus, { label: string; variant: 'pending' | 'in_progress' | 'completed' | 'blocked' }> = {
  pending: { label: 'في الانتظار', variant: 'pending' },
  in_progress: { label: 'جاري', variant: 'in_progress' },
  completed: { label: 'مكتمل', variant: 'completed' },
  blocked: { label: 'موقوف', variant: 'blocked' },
}

export function WorkflowStep({
  name,
  status,
  assignedTo,
  completedAt,
  fees,
  profit,
  isLocked = false,
  stepNumber,
}: WorkflowStepProps) {
  const config = statusConfig[status]

  return (
    <div
      className={`
        flex gap-4 p-4 rounded-[var(--radius-lg)]
        border border-[var(--color-border)]
        ${isLocked ? 'opacity-50 pointer-events-none' : ''}
        ${status === 'completed' ? 'bg-[var(--color-success-light)] border-[var(--color-success)]/20' : 'bg-[var(--color-surface)]'}
      `}
    >
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          flex-shrink-0 text-sm font-bold
          ${status === 'completed' ? 'bg-[var(--color-success)] text-white' : 'bg-[var(--color-surface-offset)]'}
        `}
      >
        {stepNumber || 1}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{name}</span>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        {assignedTo && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{assignedTo}</span>
            {completedAt && (
              <>
                <span>·</span>
                <span>{completedAt}</span>
              </>
            )}
          </div>
        )}

        {(fees !== undefined || profit !== undefined) && (
          <div className="flex gap-4 mt-2 pt-2 border-t border-[var(--color-border)]">
            {fees !== undefined && fees > 0 && (
              <div className="text-xs">
                <span className="text-[var(--color-text-muted)]">رسوم: </span>
                <span className="font-semibold text-[var(--color-warning)]">
                  {fees.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            )}
            {profit !== undefined && profit > 0 && (
              <div className="text-xs">
                <span className="text-[var(--color-text-muted)]">أتعاب: </span>
                <span className="font-semibold text-[var(--color-success)]">
                  {profit.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
            )}
          </div>
        )}

        {isLocked && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-[var(--radius-md)] bg-[var(--color-surface-offset)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-[var(--color-error)]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs text-[var(--color-text-muted)]">مقفل — يتطلب إنجاز المسار السابق</span>
          </div>
        )}
      </div>
    </div>
  )
}