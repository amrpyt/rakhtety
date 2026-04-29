import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card'
import type { WorkflowFinancialSummary } from '@/types/database.types'

interface FinancialSummaryCardProps {
  summary: WorkflowFinancialSummary | null
  loading?: boolean
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)

export function FinancialSummaryCard({ summary, loading = false }: FinancialSummaryCardProps) {
  const items = [
    { label: 'إجمالي التكلفة', value: summary?.total_cost ?? 0 },
    { label: 'إجمالي المدفوع', value: summary?.total_paid ?? 0 },
    { label: 'المديونية المتبقية', value: summary?.outstanding_debt ?? 0 },
    { label: 'الربح المتوقع', value: summary?.planned_profit ?? 0 },
    { label: 'الربح المحصل', value: summary?.realized_profit ?? 0 },
  ]

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>الملخص المالي</CardTitle>
          <CardSubtitle>التكلفة والمدفوع والمتبقي</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-[var(--radius-lg)] bg-[var(--color-surface-offset)] p-3">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">{item.label}</p>
              <p className="font-bold text-[var(--color-text)]">
                {loading ? '...' : formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
