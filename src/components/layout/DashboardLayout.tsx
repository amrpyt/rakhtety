import React from 'react'
import { MobileNav, Sidebar } from '@/components/layout/Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="operations-shell flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
      <MobileNav />
    </div>
  )
}
