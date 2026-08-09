"use client";

import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationDrawer } from "@/components/notifications/notification-drawer";

export default function AdminHeader({
  title = "Dashboard",
  subtitle = "Overview of counselling activity",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-20 border-b border-admin-border-dark bg-[#fdfaf3]/90 backdrop-blur print:hidden">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-admin-subtle">
            <span>AASARE</span>
            <span className="text-[#d4b48a]">•</span>
            <span>Admin</span>
          </div>
          <h1 className="font-serif text-2xl text-admin-text leading-tight">{title}</h1>
          <p className="text-xs text-[#7a5a4a]">{subtitle}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-admin-border bg-white px-3 py-2 w-72">
            <Search className="h-4 w-4 text-admin-subtle" />
            <input
              placeholder="Search counsellors, students, sessions…"
              className="w-full bg-transparent text-sm text-admin-text outline-none"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-admin-border bg-white text-admin-primary hover:bg-admin-bg cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 z-50">
                <NotificationDrawer onClose={() => setShowNotifications(false)} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-full border border-admin-border bg-white pl-1 pr-3 py-1">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-admin-primary text-[#f5e9c8] text-xs font-semibold">
              AD
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-semibold text-admin-text">Admin</div>
              <div className="text-[10px] text-admin-muted">admin@sode-edu.in</div>
            </div>
            <ChevronDown className="h-4 w-4 text-admin-muted" />
          </div>
        </div>
      </div>
    </header>
  );
}
