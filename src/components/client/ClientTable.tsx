'use client'

import React from 'react'
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import type { Client } from '@/types/database.types'

interface ClientTableProps {
  clients: Client[]
  onRowClick?: (client: Client) => void
}

export function ClientTable({ clients, onRowClick }: ClientTableProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>الاسم</TableHeader>
          <TableHeader>الهاتف</TableHeader>
          <TableHeader>المدينة</TableHeader>
          <TableHeader>الحي</TableHeader>
          <TableHeader>رقم الملف</TableHeader>
          <TableHeader>تاريخ الإنشاء</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id} onClick={() => onRowClick?.(client)}>
            <TableCell>
              <div className="font-medium">{client.name}</div>
            </TableCell>
            <TableCell>
              <span dir="ltr">{client.phone || '-'}</span>
            </TableCell>
            <TableCell>{client.city || '-'}</TableCell>
            <TableCell>{client.neighborhood || '-'}</TableCell>
            <TableCell>
              {client.parcel_number ? (
                <Badge variant="default">{client.parcel_number}</Badge>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              <span className="text-[var(--color-text-muted)]">
                {new Date(client.created_at).toLocaleDateString('ar-EG')}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}