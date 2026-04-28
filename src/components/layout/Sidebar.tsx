'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/auth/useAuth'
import { roleLabels } from '@/config/auth.config'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface NavSection {
  section: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    section: 'الرئيسية',
    items: [
      { href: '/dashboard', label: 'لوحة التحكم', icon: 'layout-dashboard' },
      { href: '/clients', label: 'ملفات العملاء', icon: 'users' },
      { href: '/workflows', label: 'مسارات العمل', icon: 'git-branch' },
    ],
  },
  {
    section: 'المالية',
    items: [{ href: '/finance', label: 'الإدارة المالية', icon: 'banknote' }],
  },
  {
    section: 'الإدارة',
    items: [{ href: '/employees', label: 'الموظفون', icon: 'user-check' }],
  },
]

const iconPaths: Record<string, string> = {
  'layout-dashboard': 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  'git-branch': 'M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9',
  banknote: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M21 12h-4l-3 9L14 3l-3 9H2',
  'user-check': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 11l2 2 4-4',
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2) || ''

  const roleLabel = user?.role ? roleLabels[user.role]?.ar || user.role : ''

  return (
    <aside
      className="w-[260px] h-screen sticky top-0 overflow-y-auto border-l border-[var(--color-divider)]"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="p-5 pb-4 flex items-center gap-3 border-b border-[var(--color-divider)]">
        <div
          className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
          style={{ background: 'var(--color-primary)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <div className="font-bold text-[var(--color-text)]">رخصتي</div>
          <div className="text-xs text-[var(--color-text-muted)]">نظام إدارة التراخيص</div>
        </div>
      </div>

      <nav className="p-4 flex-1">
        {navSections.map((section) => (
          <div key={section.section} className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-faint)] px-3 py-2">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)]
                    text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)]'
                    }
                  `}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d={iconPaths[item.icon]} />
                  </svg>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-divider)]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {initials || '?'}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold truncate">{user?.full_name || 'مستخدم'}</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)] transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
          </svg>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}