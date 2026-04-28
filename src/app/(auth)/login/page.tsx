import { Suspense } from 'react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="text-center text-sm text-[var(--color-text-muted)]">جارٍ تحميل صفحة الدخول...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
