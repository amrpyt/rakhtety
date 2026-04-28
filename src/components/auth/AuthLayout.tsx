import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

const overviewStats = [
  { value: '24', label: 'عميل' },
  { value: '18', label: 'مسار نشط' },
  { value: '156', label: 'خطوة مكتملة' },
]

function BrandMark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-6 w-6">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold leading-tight text-[var(--color-text)]">رخصتي</h1>
        <p className="text-sm text-[var(--color-text-muted)]">نظام إدارة التراخيص</p>
      </div>
    </div>
  )
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-overview">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                'linear-gradient(140deg, rgba(1,105,111,0.12) 0%, rgba(247,246,242,0.96) 42%, rgba(180,83,9,0.12) 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />

          <BrandMark className="relative z-10" />

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-white/70 px-4 py-2 text-xs font-semibold text-[var(--color-primary)] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
              بيئة عمل آمنة
            </div>
            <h2 className="max-w-lg text-4xl font-bold leading-[1.35] text-[var(--color-text)]">
              ادخل لمتابعة ملفات العملاء ومسارات التراخيص.
            </h2>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {overviewStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--radius-md)] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur"
                >
                  <p className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/70 p-4 text-sm shadow-sm backdrop-blur">
            <span className="font-semibold text-[var(--color-text)]">ترتيب المسارات محمي</span>
            <span className="text-[var(--color-text-muted)]">رخصة الجهاز أولاً، ثم تصريح الحفر</span>
          </div>
        </section>

        <main className="auth-main">
          <div className="auth-card-shell">
            <BrandMark className="auth-mobile-brand" />

            <div className="auth-card">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
