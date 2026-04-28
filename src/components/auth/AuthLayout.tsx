import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #1a1917 0%, #232220 50%, #1a1917 100%)',
      }}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'rgba(26, 25, 23, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-[var(--color-border)]">
          <div
            className="w-16 h-16 rounded-[var(--radius-xl)] flex items-center justify-center mb-4"
            style={{ background: 'var(--color-primary)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-8 h-8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">رخصتي</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            نظام إدارة التراخيص
          </p>
        </div>

        <div className="p-8">{children}</div>
      </div>
    </div>
  )
}