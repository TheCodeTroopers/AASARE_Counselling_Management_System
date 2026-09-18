"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { X } from "lucide-react";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessagesSquare,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const nav: Array<{ label: string; href: string; icon: typeof LayoutDashboard }> = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Manage Counsellors", href: "/admin/counsellors", icon: Users },
  { label: "View Schedules", href: "/admin/schedules", icon: CalendarDays },
  { label: "Appointments", href: "/admin/appointments", icon: MessagesSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-admin-border">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-admin-primary text-[#f5e9c8] font-serif text-sm">
            A
          </div>
          <div className="leading-tight">
            <div className="font-serif text-admin-text text-lg tracking-wide">AASARE</div>
            <div className="text-[10px] tracking-[0.18em] text-admin-muted uppercase">
              Admin Console
            </div>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden rounded-full p-1.5 text-admin-muted hover:bg-admin-bg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-medium tracking-[0.18em] text-admin-subtle uppercase">
          Overview
        </div>
        {nav.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href as never}
              onClick={onClose}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-admin-primary text-admin-bg shadow-sm shadow-admin-primary/20"
                  : "text-[#4a2b30] hover:bg-[#f1e5d1]",
              ].join(" ")}
            >
              <Icon
                className={["h-4 w-4", active ? "text-[#f5d78a]" : "text-[#8a5a63]"].join(" ")}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-2xl border border-admin-border bg-white/70 p-4">
          <div className="flex items-center gap-2 text-admin-primary">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide">Private &amp; Confidential</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#7a5a4a]">
            Administrative actions are logged. Handle counsellor and student data with care.
          </p>
          <button
            onClick={async () => {
              await signOut();
              toast.success("Signed out successfully");
              router.push("/auth");
            }}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-admin-border bg-white px-3 py-1.5 text-xs font-medium text-[#4a2b30] hover:bg-admin-bg cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-admin-border bg-[#fbf6ee] print:hidden">
        <SidebarContent />
      </aside>

      {/* Mobile drawer — slides in from left */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-admin-border bg-[#fbf6ee] shadow-2xl transition-transform duration-300 lg:hidden print:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Mobile admin navigation"
      >
        <SidebarContent />
      </aside>
    </>
  );
}
