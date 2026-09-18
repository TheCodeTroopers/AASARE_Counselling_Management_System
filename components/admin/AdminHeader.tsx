"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationDrawer } from "@/components/notifications/notification-drawer";

export default function AdminHeader({
  title = "Dashboard",
  subtitle = "Overview of counselling activity",
  onMobileMenuOpen,
}: {
  title?: string;
  subtitle?: string;
  onMobileMenuOpen?: () => void;
}) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-20 border-b border-admin-border-dark bg-[#fdfaf3]/90 backdrop-blur print:hidden">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden rounded-xl border border-admin-border bg-white p-2 text-admin-primary hover:bg-admin-bg transition-colors cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title block */}
        <div className="min-w-0 flex-1">
          <div className="hidden sm:flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-admin-subtle">
            <span>AASARE</span>
            <span className="text-[#d4b48a]">•</span>
            <span>Admin</span>
          </div>
          <h1 className="font-serif text-lg md:text-2xl text-admin-text leading-tight truncate">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-[#7a5a4a] truncate">{subtitle}</p>
        </div>

        {/* Right-side actions */}
        <div className="ml-auto flex items-center gap-2 md:gap-3 shrink-0">
          {/* Search — hidden on small screens */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-admin-border bg-white px-3 py-2 w-60 xl:w-72">
            <Search className="h-4 w-4 text-admin-subtle shrink-0" />
            <input
              placeholder="Search counsellors, students…"
              className="w-full bg-transparent text-sm text-admin-text outline-none"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-full border border-admin-border bg-white text-admin-primary hover:bg-admin-bg cursor-pointer"
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

          {/* User badge */}
          <div className="flex items-center gap-2 rounded-full border border-admin-border bg-white pl-1 pr-2 py-1">
            <div className="grid h-7 w-7 md:h-8 md:w-8 place-items-center rounded-full bg-admin-primary text-[#f5e9c8] text-xs font-semibold">
              AD
            </div>
            <div className="hidden sm:block leading-tight pr-1">
              <div className="text-xs font-semibold text-admin-text">Admin</div>
              <div className="text-[10px] text-admin-muted">admin@sode-edu.in</div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                toast.success("Signed out successfully");
                router.push("/auth");
              }}
              title="Sign Out"
              className="p-1.5 text-admin-muted hover:text-admin-primary transition-colors cursor-pointer rounded-full hover:bg-admin-bg"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
