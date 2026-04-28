import type { Metadata } from 'next'
import '@/styles/globals.css'
import { AuthProvider } from '@/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'رخصتي',
  description: 'نظام إدارة تراخيص المكاتب الهندسية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
