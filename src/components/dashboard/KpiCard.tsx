import React from 'react'
import { Card } from '@/components/ui/Card'

interface KpiCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
    positive?: boolean
  }
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function KpiCard({ title, value, change, icon, trend, variant = 'default' }: KpiCardProps) {
  const trendColors = {
    up: 'text-[var(--color-success)]',
    down: 'text-[var(--color-error)]',
    neutral: 'text-[var(--color-text-muted)]',
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
          {change && (
            <p className={`text-xs mt-2 ${change.positive !== false && change.value > 0 ? 'text-[var(--color-success)]' : trendColors[trend || 'neutral']}`}>
              {change.positive !== false && change.value > 0 ? '+' : ''}
              {change.value} {change.label}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center"
            style={{ background: 'var(--color-primary-light)' }}
          >
            <div style={{ color: 'var(--color-primary)' }}>{icon}</div>
          </div>
        )}
      </div>
    </Card>
  )
}