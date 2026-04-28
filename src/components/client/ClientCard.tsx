import React from 'react'
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Client } from '@/types/database.types'

interface ClientCardProps {
  client: Client
  onClick?: () => void
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow duration-150 ${onClick ? 'hover:border-[var(--color-primary)]' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-sm mb-1">{client.name}</h3>
          {client.phone && (
            <p className="text-xs text-[var(--color-text-muted)]">{client.phone}</p>
          )}
        </div>
        <Badge variant="default">عميل</Badge>
      </div>

      {(client.city || client.neighborhood || client.parcel_number) && (
        <div className="text-xs text-[var(--color-text-muted)] space-y-1">
          {client.city && <p>المدينة: {client.city}</p>}
          {client.neighborhood && <p>الحي: {client.neighborhood}</p>}
          {client.parcel_number && <p>رقم الملف: {client.parcel_number}</p>}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-[var(--color-divider)]">
        <p className="text-[10px] text-[var(--color-text-faint)]">
          {new Date(client.created_at).toLocaleDateString('ar-EG')}
        </p>
      </div>
    </Card>
  )
}