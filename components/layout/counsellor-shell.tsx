"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, LayoutGrid, Search, Menu, X, LogOut } from "lucide-react";
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
  const [globalSearch, setGlobalSearch] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const counsellorName = profile?.full_name || user?.email || "Counsellor";
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /** Shared nav list used in both desktop sidebar and mobile drawer */
  const NavList = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="space-y-2">
      {COUNSELLOR_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href));

        if (item.label === "Logout") {
          return (
            <button
              key={item.label}
              onClick={async () => {
                onLinkClick?.();
                await signOut();
                toast.success("Signed out");
                router.push("/auth");
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300 cursor-pointer",
                "text-white/90 hover:bg-white/12 hover:text-white",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-300",
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
  );

  return (
    <div className="min-h-screen bg-background text-text transition-colors duration-300">
      {/* Mobile nav backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-[#a76f87]/30 bg-primary p-6 lg:block print:hidden">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-secondary p-3 text-primary shadow-soft">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">AASARE</p>
              <p className="text-sm text-[#f6e7db]">Counsellor Panel</p>
            </div>
          </div>
          <NavList />
        </aside>

        {/* Mobile sidebar drawer */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-y-auto bg-primary p-6 shadow-2xl transition-transform duration-300 lg:hidden print:hidden",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Mobile counsellor navigation"
        >
          {/* Drawer header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-secondary p-2.5 text-primary shadow-soft">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">AASARE</p>
                <p className="text-xs text-[#f6e7db]">Counsellor Panel</p>
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="rounded-full p-1.5 text-white/70 hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavList onLinkClick={() => setMobileNavOpen(false)} />
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur print:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-4">
              <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                  onClick={() => setMobileNavOpen(true)}
                  className="lg:hidden rounded-2xl bg-secondary p-2 text-primary transition hover:bg-secondary/80"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <p className="text-base font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-none">
                    {counsellorName}
                  </p>
                  <p className="hidden sm:block text-sm text-slate-500">{todayFormatted}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:gap-3">
                {/* Search — hidden on small screens */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (globalSearch.trim()) {
                      router.push(
                        `/case-management?search=${encodeURIComponent(globalSearch.trim())}` as any,
                      );
                    }
                  }}
                  className="hidden items-center rounded-2xl border border-border bg-secondary px-3 py-2 md:flex focus-within:ring-2 focus-within:ring-primary/40"
                >
                  <Search className="mr-2 h-4 w-4 text-text-secondary shrink-0" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="bg-transparent text-sm outline-none placeholder:text-text-secondary w-44 lg:w-60"
                    placeholder="Search cases, students, USN..."
                  />
                </form>

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
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
