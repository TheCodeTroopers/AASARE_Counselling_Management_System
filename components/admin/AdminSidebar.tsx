"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-[#e9dfd0] bg-[#fbf6ee]">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#e9dfd0]">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#6b1e2b] text-[#f5e9c8] font-serif text-sm">
          A
        </div>
        <div className="leading-tight">
          <div className="font-serif text-[#3b1219] text-lg tracking-wide">AASARE</div>
          <div className="text-[10px] tracking-[0.18em] text-[#8a6a55] uppercase">
            Admin Console
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-medium tracking-[0.18em] text-[#a08a76] uppercase">
          Overview
        </div>
        {nav.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href as never}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[#6b1e2b] text-[#faf3e2] shadow-sm shadow-[#6b1e2b]/20"
                  : "text-[#4a2b30] hover:bg-[#f1e5d1]",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-4 w-4",
                  active ? "text-[#f5d78a]" : "text-[#8a5a63]",
                ].join(" ")}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-2xl border border-[#e9dfd0] bg-white/70 p-4">
          <div className="flex items-center gap-2 text-[#6b1e2b]">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide">
              Private & Confidential
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#7a5a4a]">
            Administrative actions are logged. Handle counsellor and student data with care.
          </p>
          <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e9dfd0] bg-white px-3 py-1.5 text-xs font-medium text-[#4a2b30] hover:bg-[#faf3e2]">
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
