import React from 'react'
import { DocumentUploadPanel } from '@/components/documents/DocumentUploadPanel'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { StepStatus } from '@/types/database.types'

interface WorkflowStepProps {
  id: string
  workflowId: string
  name: string
  status: StepStatus
  assignedTo?: string
  completedAt?: string
  fees?: number
  profit?: number
  isLocked?: boolean
  lockedReason?: string
  stepNumber?: number
  canAct?: boolean
  onMarkComplete?: (stepId: string) => Promise<void>
  onStart?: (stepId: string) => Promise<void>
}

const statusConfig: Record<StepStatus, { label: string; variant: 'pending' | 'in_progress' | 'completed' | 'blocked' }> = {
  pending: { label: 'في الانتظار', variant: 'pending' },
  in_progress: { label: 'جاري', variant: 'in_progress' },
  completed: { label: 'مكتمل', variant: 'completed' },
  blocked: { label: 'موقوف', variant: 'blocked' },
}

export function WorkflowStep({
  id,
  workflowId,
  name,
  status,
  assignedTo,
  completedAt,
  fees,
  profit,
  isLocked = false,
  lockedReason,
  stepNumber,
  canAct = true,
  onMarkComplete,
  onStart,
}: WorkflowStepProps) {
  const config = statusConfig[status]
  const showStart = canAct && !isLocked && status === 'pending' && onStart
  const showComplete = canAct && !isLocked && status === 'in_progress' && onMarkComplete

  return (
    <div
      className={`
        flex gap-4 p-4 rounded-[var(--radius-lg)]
        border border-[var(--color-border)]
        ${isLocked ? 'opacity-50' : ''}
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="font-semibold break-words">{name}</span>
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
          <div className="flex flex-wrap gap-4 mt-2 pt-2 border-t border-[var(--color-border)]">
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
            <span className="text-xs text-[var(--color-text-muted)]">
              {lockedReason || 'مقفل — يتطلب إنجاز المسار السابق'}
            </span>
          </div>
        )}

        {(showStart || showComplete) && (
          <div className="flex justify-end gap-2 mt-4">
            {showStart && (
              <Button size="sm" onClick={() => onStart(id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                بدء التنفيذ
              </Button>
            )}
            {showComplete && (
              <Button size="sm" onClick={() => onMarkComplete(id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                إكمال
              </Button>
            )}
          </div>
        )}

        {workflowId && !id.startsWith('placeholder-') && (
          <DocumentUploadPanel workflowId={workflowId} stepId={id} disabled={isLocked} />
        )}
      </div>
    </div>
  )
}
