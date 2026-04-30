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
      className="hidden h-screen w-[284px] shrink-0 overflow-y-auto border-l border-white/10 text-white lg:sticky lg:top-0 lg:block"
      style={{
        background:
          'radial-gradient(circle at top, rgba(216, 162, 61, 0.2), transparent 16rem), linear-gradient(180deg, var(--shell-sidebar) 0%, var(--shell-sidebar-2) 100%)',
      }}
    >
      <div className="flex items-center gap-3 border-b border-white/10 p-5 pb-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--shell-accent), #f4d28a)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#102321" strokeWidth="2.5" className="h-5 w-5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <div>
          <div className="text-lg font-bold">رخصتي</div>
          <div className="text-xs text-white/60">غرفة عمليات التراخيص</div>
        </div>
      </div>

      <nav className="p-4 flex-1">
        {navSections.map((section) => (
          <div key={section.section} className="mb-4">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex min-h-11 items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2
                    text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-white text-[var(--shell-sidebar)] shadow-lg'
                      : 'text-white/66 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0">
                    <path d={iconPaths[item.icon]} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[var(--shell-sidebar)]"
            style={{ background: 'var(--shell-accent)' }}
          >
            {initials || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{user?.full_name || 'مستخدم'}</div>
            <div className="text-[10px] text-white/50">{roleLabel}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-sm text-white/62 transition-all duration-150 hover:bg-white/10 hover:text-white"
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

export function MobileNav() {
  const pathname = usePathname()
  const flatItems = navSections.flatMap((section) => section.items)

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[var(--radius-xl)] border border-white/15 bg-[var(--shell-sidebar)] p-2 text-white shadow-2xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {flatItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-1 py-2 text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'bg-white text-[var(--shell-sidebar)]'
                  : 'text-white/62'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d={iconPaths[item.icon]} />
              </svg>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
