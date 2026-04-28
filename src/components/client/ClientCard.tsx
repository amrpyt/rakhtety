import React from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Client } from '@/types/database.types'

interface ClientCardProps {
  client: Client
  onClick?: () => void
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  const displayPhone = client.phone?.trim() || '—'
  const displayCity = client.city?.trim() || client.area?.trim() || '—'
  const displayParcelNumber = client.parcel_number?.trim() || client.plot_number?.trim() || '—'

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow duration-150 ${onClick ? 'hover:border-[var(--color-primary)]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-sm mb-1">{client.name}</h3>
        </div>
        <Badge variant="default">عميل</Badge>
      </div>

      <div className="text-xs text-[var(--color-text-muted)] space-y-1">
        <p>
          الهاتف: <span dir="ltr">{displayPhone}</span>
        </p>
        <p>المدينة: {displayCity}</p>
        {client.neighborhood && <p>الحي: {client.neighborhood}</p>}
        <p>رقم الملف: {displayParcelNumber}</p>
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--color-divider)]">
        <p className="text-[10px] text-[var(--color-text-faint)]">
          {new Date(client.created_at).toLocaleDateString('ar-EG')}
        </p>
      </div>
    </Card>
  )
}
