'use client';

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Bell, LayoutGrid, Moon, Search, Sun } from 'lucide-react';
import { COUNSELLOR_NAV_ITEMS } from '@/constants/navigation';
import { cn } from '@/utils/cn';
import { NotificationDrawer } from '@/components/notifications/notification-drawer';

export function CounsellorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={cn('min-h-screen transition-colors', isDark ? 'bg-slate-950 text-slate-100' : 'bg-background text-slate-900')}>
      <div className="flex min-h-screen">
        <aside className={cn('hidden w-80 border-r p-6 lg:block', isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/90')}>
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-primary p-3 text-white shadow-soft">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>AASARE</p>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Counsellor Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {COUNSELLOR_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '#' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary text-white shadow-soft'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className={cn('sticky top-0 z-20 border-b backdrop-blur', isDark ? 'border-slate-800 bg-slate-950/85' : 'border-slate-200 bg-white/85')}>
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-xl p-2 lg:hidden', isDark ? 'bg-slate-800' : 'bg-slate-100')}>
                  <span className="text-sm font-bold text-primary">A</span>
                </div>
                <div>
                  <p className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Dr. Meera Sharma</p>
                  <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Thursday, 16 July 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={cn('hidden items-center rounded-xl border px-3 py-2 md:flex', isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50')}>
                  <Search className={cn('mr-2 h-4 w-4', isDark ? 'text-slate-400' : 'text-slate-400')} />
                  <input className={cn('bg-transparent text-sm outline-none', isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-900')} placeholder="Search" />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((current) => !current)}
                    className={cn('rounded-xl border p-2 transition', isDark ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary')}
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                  {showNotifications ? (
                    <div className="absolute right-0 top-12 w-80">
                      <NotificationDrawer />
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => setIsDark((current) => !current)}
                  className={cn('rounded-xl border p-2 transition', isDark ? 'border-slate-800 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary')}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
