'use client'

import React from 'react'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { Card, CardHeader, CardTitle, CardSubtitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/auth/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  const kpiItems = [
    {
      id: 'clients',
      title: 'إجمالي العملاء',
      value: '24',
      change: { value: 3, label: 'هذا الشهر' },
      icon: 'users',
    },
    {
      id: 'workflows',
      title: 'مسارات العمل النشطة',
      value: '18',
      change: { value: 5, label: 'هذا الأسبوع' },
      icon: 'git-branch',
    },
    {
      id: 'completed',
      title: 'تم الإنجاز',
      value: '156',
      change: { value: 12, label: 'هذا الشهر', positive: true },
      icon: 'check',
    },
    {
      id: 'pending',
      title: 'في الانتظار',
      value: '8',
      change: { value: -2, label: 'عن الشهر الماضي', positive: false },
      icon: 'file-text',
    },
  ]

  const recentWorkflows = [
    { client: 'أحمد محمد', type: 'DEVICE_LICENSE', status: 'in_progress', updatedAt: 'منذ ساعة' },
    { client: 'فاطمة علي', type: 'EXCAVATION_PERMIT', status: 'pending', updatedAt: 'منذ 3 ساعات' },
    { client: 'خالد سليم', type: 'DEVICE_LICENSE', status: 'completed', updatedAt: 'منذ يوم' },
    { client: 'نورة أحمد', type: 'DEVICE_LICENSE', status: 'in_progress', updatedAt: 'منذ يومين' },
  ]

  return (
    <div className="p-6 max-w-[1300px]">
      <div className="mb-6">
        <h1 className="text-lg font-bold mb-1">لوحة التحكم</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          مرحباً، {user?.full_name || 'مستخدم'}
        </p>
      </div>

      <div className="mb-6">
        <KpiGrid items={kpiItems} />
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardSubtitle>آخر المسارات المحدثة</CardSubtitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentWorkflows.map((workflow, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-[var(--color-divider)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-surface-offset)] flex items-center justify-center text-xs font-bold">
                    {workflow.client[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{workflow.client}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {workflow.type === 'DEVICE_LICENSE' ? 'رخصة جهاز' : 'تصريح حفر'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--color-text-faint)]">{workflow.updatedAt}</span>
                  <Badge variant={workflow.status as 'pending' | 'in_progress' | 'completed'}>
                    {workflow.status === 'pending' ? 'في الانتظار' : workflow.status === 'in_progress' ? 'جاري' : 'مكتمل'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}