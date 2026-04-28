import React from 'react'

type BadgeVariant = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'success' | 'warning' | 'error' | 'default'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  dot?: boolean
  children: React.ReactNode
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  pending: { bg: 'var(--color-surface-offset)', text: 'var(--color-text-muted)' },
  in_progress: { bg: 'var(--color-primary-light)', text: 'var(--color-primary)' },
  completed: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  blocked: { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
  success: { bg: 'var(--color-success-light)', text: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-light)', text: 'var(--color-warning)' },
  error: { bg: 'var(--color-error-light)', text: 'var(--color-error)' },
  default: { bg: 'var(--color-surface-offset)', text: 'var(--color-text-muted)' },
}

export function Badge({ variant = 'default', size = 'md', dot = true, children, className = '', ...props }: BadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'}
        font-bold rounded-full
        ${className}
      `.trim()}
      style={{ background: styles.bg, color: styles.text }}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export const WorkflowStatusBadge: Record<string, BadgeVariant> = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
  blocked: 'blocked',
}