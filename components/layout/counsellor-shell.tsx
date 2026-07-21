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
    <div className={cn('min-h-screen transition-colors duration-300', isDark ? 'bg-[#22111b] text-[#fdf8f4]' : 'bg-background text-text')}>
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-[#a76f87]/30 bg-[#6D214F] p-6 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-[#F8F3EE] p-3 text-[#6D214F] shadow-soft">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AASARE</p>
              <p className="text-sm text-[#f6e7db]">Counsellor Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {COUNSELLOR_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '#' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300',
                    isActive
                      ? 'bg-[#F8F3EE] text-[#6D214F] shadow-soft'
                      : 'text-white/90 hover:bg-white/12 hover:text-white',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-[#E8DDD5] bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#F8F3EE] p-2 lg:hidden">
                  <span className="text-sm font-bold text-[#6D214F]">A</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#6D214F]">Dr. Meera Sharma</p>
                  <p className="text-sm text-[#6E6E6E]">Thursday, 16 July 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center rounded-2xl border border-[#E8DDD5] bg-[#F8F3EE] px-3 py-2 md:flex">
                  <Search className="mr-2 h-4 w-4 text-[#6E6E6E]" />
                  <input className="bg-transparent text-sm text-[#2F2F2F] outline-none placeholder:text-[#6E6E6E]" placeholder="Search" />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((current) => !current)}
                    className="rounded-2xl border border-[#E8DDD5] bg-white p-2 text-[#6D214F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
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
                  className="rounded-2xl border border-[#E8DDD5] bg-white p-2 text-[#6D214F] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
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
