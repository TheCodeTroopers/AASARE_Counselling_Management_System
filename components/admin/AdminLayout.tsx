"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

const routeMeta = {
  "/admin": {
    title: "Dashboard",
    subtitle: "Overview of counselling activity",
  },
  "/admin/counsellors": {
    title: "Manage Counsellors",
    subtitle: "Invite, edit, and review faculty counsellors.",
  },
  "/admin/schedules": {
    title: "View Schedules",
    subtitle: "Weekly overview of counsellor availability and bookings.",
  },
  "/admin/appointments": {
    title: "Appointments",
    subtitle: "Review all counselling sessions across the cell.",
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "Configure institute, profile, notifications, and preferences.",
  },
} as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activePath = pathname === "/admin/dashboard" ? "/admin" : pathname;
  const meta = routeMeta[activePath as keyof typeof routeMeta] ?? routeMeta["/admin"];

  return (
    <div className="min-h-screen bg-[#fdfaf3] text-[#3b1219] flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminHeader title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
