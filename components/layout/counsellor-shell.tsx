"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, LayoutGrid, Moon, Search, Sun } from "lucide-react";
import { COUNSELLOR_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/utils/cn";
import { NotificationDrawer } from "@/components/notifications/notification-drawer";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function CounsellorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const counsellorName = profile?.full_name || user?.email || "Counsellor";
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark ? "bg-[#22111b] text-[#fdf8f4]" : "bg-background text-text",
      )}
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-[#a76f87]/30 bg-primary p-6 lg:block print:hidden">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-secondary p-3 text-primary shadow-soft">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AASARE</p>
              <p className="text-sm text-[#f6e7db]">Counsellor Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {COUNSELLOR_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href));

              if (item.label === "Logout") {
                return (
                  <button
                    key={item.label}
                    onClick={async () => {
                      await signOut();
                      toast.success("Signed out");
                      router.push("/auth");
                    }}
                    className={cn(
                      "flex w-full items-center rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 cursor-pointer",
                      "text-white/90 hover:bg-white/12 hover:text-white",
                    )}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-secondary text-primary shadow-soft"
                      : "text-white/90 hover:bg-white/12 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur print:hidden">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-secondary p-2 lg:hidden">
                  <span className="text-sm font-bold text-primary">A</span>
                </div>
                <div>
                  <p
                    className={cn(
                      "text-lg font-semibold",
                      isDark ? "text-white" : "text-slate-900",
                    )}
                  >
                    {counsellorName}
                  </p>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                    {todayFormatted}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center rounded-2xl border border-border bg-secondary px-3 py-2 md:flex">
                  <Search className="mr-2 h-4 w-4 text-text-secondary" />
                  <input
                    className="bg-transparent text-sm outline-none placeholder:text-text-secondary"
                    placeholder="Search"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications((current) => !current)}
                    className="relative rounded-2xl border border-border bg-white p-2 text-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications ? (
                    <div className="absolute right-0 top-12 z-50">
                      <NotificationDrawer onClose={() => setShowNotifications(false)} />
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => setIsDark((current) => !current)}
                  className="rounded-2xl border border-border bg-white p-2 text-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
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
