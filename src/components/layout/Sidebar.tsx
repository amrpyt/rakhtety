'use client'

import Link from 'next/link'
import {
  Banknote,
  GitBranch,
  Home,
  LayoutDashboard,
  LogOut,
  MonitorCog,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { canAccessRoute } from '@/lib/auth/permissions'
import { useAuth } from '@/hooks/auth/useAuth'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface NavSection {
  section: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    section: 'الرئيسية',
    items: [
      { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
      { href: '/amr-dashboard', label: 'لوحة عمرو', icon: MonitorCog },
      { href: '/clients', label: 'ملفات العملاء', icon: Users },
      { href: '/workflows', label: 'مسارات العمل', icon: GitBranch },
    ],
  },
  {
    section: 'المالية',
    items: [{ href: '/finance', label: 'الإدارة المالية', icon: Banknote }],
  },
  {
    section: 'الإدارة',
    items: [{ href: '/employees', label: 'الموظفون', icon: UserCheck }],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessRoute(user?.role, item.href)),
    }))
    .filter((section) => section.items.length > 0)

  const initials =
    user?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2) || ''

  const profileSubtitle = user?.position?.trim() || 'بدون مسمى وظيفي'

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
          <Home className="h-5 w-5 text-[#102321]" strokeWidth={2.5} aria-hidden="true" />
        </div>
        <div>
          <div className="text-lg font-bold">رخصتي</div>
          <div className="text-xs text-white/60">غرفة عمليات التراخيص</div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {visibleSections.map((section) => (
          <div key={section.section} className="mb-4">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/38">
              {section.section}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex min-h-11 items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2
                    text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? 'bg-white text-[var(--shell-sidebar)] shadow-lg'
                        : 'text-white/66 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[var(--shell-sidebar)]"
            style={{ background: 'var(--shell-accent)' }}
          >
            {initials || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{user?.full_name || 'مستخدم'}</div>
            <div className="truncate text-[10px] text-white/50">{profileSubtitle}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] px-3 py-2 text-sm text-white/62 transition-all duration-150 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const flatItems = navSections
    .flatMap((section) => section.items)
    .filter((item) => canAccessRoute(user?.role, item.href))

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[var(--radius-xl)] border border-white/15 bg-[var(--shell-sidebar)] p-2 text-white shadow-2xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {flatItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-1 py-2 text-[10px] font-semibold transition-colors ${
                isActive ? 'bg-white text-[var(--shell-sidebar)]' : 'text-white/62'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
