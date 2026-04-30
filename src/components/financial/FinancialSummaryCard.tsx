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
    <Card className="paper-card">
      <CardHeader>
        <div>
          <CardTitle>الموقف المالي</CardTitle>
          <CardSubtitle>صورة سريعة: المطلوب، المدفوع، والمتبقي</CardSubtitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-white/78 p-4 shadow-sm">
              <p className="mb-1 text-xs font-bold text-[var(--color-text-muted)]">{item.label}</p>
              <p className="text-lg font-black text-[var(--color-text)]">
                {loading ? '...' : formatCurrency(item.value)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
