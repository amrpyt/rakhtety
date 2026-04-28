'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/ui/SearchBar'
import { ClientCard } from '@/components/client/ClientCard'
import { ClientTable } from '@/components/client/ClientTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useClients } from '@/hooks/useClients'
import { Button } from '@/components/ui/Button'
import { Tabs, TabPanel } from '@/components/ui/Tabs'

export default function ClientsPage() {
  const router = useRouter()
  const {
    clients,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
  } = useClients()

  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')

  const displayedClients = searchQuery.length >= 2 ? searchResults : clients

  const tabs = [
    { id: 'card', label: 'عرض البطاقات' },
    { id: 'table', label: 'عرض الجدول' },
  ]

  return (
    <div className="p-6 max-w-[1300px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold">ملفات العملاء</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {clients.length} عميل
          </p>
        </div>
        <Button>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة عميل
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <SearchBar
          placeholder="بحث عن عميل..."
          value={searchQuery}
          onSearch={setSearchQuery}
          onDebouncedSearch={(q) => setSearchQuery(q)}
          className="flex-1 max-w-md"
        />
        <Tabs
          tabs={tabs}
          defaultTab={viewMode}
          onChange={(id) => setViewMode(id as 'card' | 'table')}
        />
      </div>

      {loading && (
        <div className="py-12">
          <LoadingSpinner label="جارٍ تحميل العملاء..." />
        </div>
      )}

      {error && (
        <EmptyState
          icon="M12 9v2m0 4h.01 M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          title="حدث خطأ"
          description={error}
        />
      )}

      {!loading && !error && displayedClients.length === 0 && (
        <EmptyState
          icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 11l2 2 4-4"
          title="لا يوجد عملاء"
          description={searchQuery ? 'لا توجد نتائج للبحث' : 'أضف أول عميل للبدء'}
          action={{
            label: 'إضافة عميل',
            onClick: () => {},
          }}
        />
      )}

      {!loading && !error && displayedClients.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => router.push(`/clients/${client.id}`)}
            />
          ))}
        </div>
      )}

      {!loading && !error && displayedClients.length > 0 && viewMode === 'table' && (
        <ClientTable
          clients={displayedClients}
          onRowClick={(client) => router.push(`/clients/${client.id}`)}
        />
      )}
    </div>
  )
}
