import { KpiGrid } from '@/components/dashboard/KpiGrid'
import type { FinancialDashboardSummary } from '@/types/database.types'

interface FinancialKpiGridProps {
  summary: FinancialDashboardSummary | null
  loading?: boolean
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(value)

export function FinancialKpiGrid({ summary, loading = false }: FinancialKpiGridProps) {
  const fallback = loading ? '...' : formatCurrency(0)

  return (
    <KpiGrid
      items={[
        {
          id: 'fees-collected',
          title: 'إجمالي الرسوم المحصلة',
          value: summary ? formatCurrency(summary.total_fees_collected) : fallback,
          icon: 'file-text',
        },
        {
          id: 'realized-profit',
          title: 'ربح المكتب المحصل',
          value: summary ? formatCurrency(summary.realized_profit) : fallback,
          icon: 'check',
        },
        {
          id: 'outstanding-debt',
          title: 'المديونية المتبقية',
          value: summary ? formatCurrency(summary.outstanding_debt) : fallback,
          icon: 'git-branch',
        },
      ]}
    />
  )
}
