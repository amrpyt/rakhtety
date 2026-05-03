import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Client } from '@/types/database.types'

interface ClientCardProps {
  client: Client
  onClick?: () => void
}

const emptyValue = '—'

export function ClientCard({ client, onClick }: ClientCardProps) {
  const displayPhone = client.phone?.trim() || emptyValue
  const displayCity = client.city?.trim() || client.area?.trim() || emptyValue
  const displayParcelNumber = client.parcel_number?.trim() || client.plot_number?.trim() || emptyValue

  const content = (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black">{client.name}</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            أُنشئ في {new Date(client.created_at).toLocaleDateString('ar-EG')}
          </p>
        </div>
        <Badge variant="default">ملف</Badge>
      </div>

      <div className="grid gap-2 text-sm text-[var(--color-text-muted)]">
        <p className="flex items-center justify-between gap-3">
          <span>الهاتف</span>
          <span className="font-medium text-[var(--color-text)]" dir="ltr">
            {displayPhone}
          </span>
        </p>
        <p className="flex items-center justify-between gap-3">
          <span>المدينة</span>
          <span className="font-medium text-[var(--color-text)]">{displayCity}</span>
        </p>
        {client.neighborhood && (
          <p className="flex items-center justify-between gap-3">
            <span>الحي</span>
            <span className="font-medium text-[var(--color-text)]">{client.neighborhood}</span>
          </p>
        )}
        <p className="flex items-center justify-between gap-3">
          <span>رقم الملف</span>
          <span className="font-medium text-[var(--color-text)]">{displayParcelNumber}</span>
        </p>
      </div>
    </>
  )

  const className = `paper-card w-full text-right transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] ${onClick ? 'cursor-pointer hover:border-[var(--color-primary)]' : ''}`

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    )
  }

  return <Card className={className}>{content}</Card>
}
