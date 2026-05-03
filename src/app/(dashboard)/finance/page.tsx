'use client'

import { FinancialKpiGrid } from '@/components/dashboard/FinancialKpiGrid'
import { Card, CardContent, CardHeader, CardSubtitle, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useFinancialDashboard } from '@/hooks/useFinancialDashboard'

export default function FinancePage() {
  const { summary, loading, error } = useFinancialDashboard()

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold">الإدارة المالية</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          الرسوم، أتعاب المكتب، والمديونية المتبقية على العملاء.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="mb-6">
        <FinancialKpiGrid summary={summary} loading={loading} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>تفاصيل التحصيل</CardTitle>
            <CardSubtitle>افتح ملف عميل لإضافة دفعة أو مراجعة المديونية.</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M21 12h-4l-3 9L14 3l-3 9H2"
            title="التفاصيل داخل ملفات العملاء"
            description="كل دفعة مرتبطة بملف وخطوة، لذلك تظهر التفاصيل الكاملة من صفحة العميل."
          />
        </CardContent>
      </Card>
    </div>
  )
}
