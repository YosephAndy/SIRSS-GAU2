'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Map, Megaphone, Home, AlertTriangle } from 'lucide-react'

const navItems = [
  { href: '/',             label: 'Inicio',      icon: Home },
  { href: '/schedules',   label: 'Horarios',    icon: CalendarDays },
  { href: '/routes',      label: 'Rutas',       icon: Map },
  { href: '/alerts',      label: 'Alertas',     icon: AlertTriangle },
  { href: '/announcements', label: 'Comunicados', icon: Megaphone },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-stretch justify-around h-16 px-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 px-1 transition-all duration-200 ${
                isActive
                  ? 'text-emerald-500'
                  : 'text-slate-400 active:text-emerald-400'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-50 scale-110' : ''}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-emerald-600' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Safe area padding para celulares con notch/home bar */}
      <div className="h-safe-bottom bg-white/95" />
    </nav>
  )
}
