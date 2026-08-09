"use client";

import { useState } from "react";
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  FileText,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useNotifications, type NotificationType } from "@/hooks/use-notifications";
import { SectionCard } from "@/components/common/section-card";
import { cn } from "@/utils/cn";

const ICON_MAP: Record<NotificationType, typeof BellRing> = {
  appointment: CalendarClock,
  case: FileText,
  system: ShieldCheck,
  reminder: BellRing,
};

const COLOR_MAP: Record<NotificationType, { bg: string; text: string; badgeBg: string }> = {
  appointment: {
    bg: "bg-amber-500/10 text-amber-700",
    text: "text-amber-800",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
  },
  case: {
    bg: "bg-primary/10 text-primary",
    text: "text-primary",
    badgeBg: "bg-primary/10 text-primary border-primary/20",
  },
  system: {
    bg: "bg-blue-500/10 text-blue-700",
    text: "text-blue-800",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
  },
  reminder: {
    bg: "bg-emerald-500/10 text-emerald-700",
    text: "text-emerald-800",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

export function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } =
    useNotifications();

  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const appointmentCount = notifications.filter((n) => n.type === "appointment").length;
  const systemCount = notifications.filter((n) => n.type === "system" || n.type === "case").length;

  const filtered = notifications.filter((n) => {
    if (selectedType !== "all" && n.type !== selectedType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Alerts
              </p>
              <p className="font-serif text-2xl font-bold text-slate-900">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-600">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Unread
              </p>
              <p className="font-serif text-2xl font-bold text-rose-600">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-600">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Appointments
              </p>
              <p className="font-serif text-2xl font-bold text-slate-900">{appointmentCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                System & Cases
              </p>
              <p className="font-serif text-2xl font-bold text-slate-900">{systemCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Notifications Card */}
      <SectionCard
        title="Notifications & Activity Log"
        subtitle="Manage counselling alerts, appointment requests, and system updates."
      >
        {/* Controls & Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications by keyword…"
              className="w-full rounded-xl border border-border bg-secondary/50 py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-secondary hover:text-primary cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
          {[
            { id: "all", label: "All Notifications", count: notifications.length },
            { id: "appointment", label: "Appointments", count: appointmentCount },
            {
              id: "case",
              label: "Case Updates",
              count: notifications.filter((n) => n.type === "case").length,
            },
            {
              id: "system",
              label: "System & Security",
              count: notifications.filter((n) => n.type === "system").length,
            },
            {
              id: "reminder",
              label: "Reminders",
              count: notifications.filter((n) => n.type === "reminder").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer",
                selectedType === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "bg-secondary text-slate-700 hover:bg-border",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                  selectedType === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-800",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No notifications found</p>
              <p className="mt-1 text-xs text-slate-500">
                {search ? "Try clearing your search query" : "Your notifications list is empty"}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const IconComponent = ICON_MAP[item.type] || BellRing;
              const style = COLOR_MAP[item.type] || COLOR_MAP.reminder;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between",
                    item.isRead
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : "border-primary/30 bg-secondary/40 hover:bg-secondary",
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={cn("mt-0.5 shrink-0 rounded-xl p-2.5", style.bg)}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            style.badgeBg,
                          )}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-500">{item.timestamp}</span>
                        {!item.isRead && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            New
                          </span>
                        )}
                      </div>
                      <h4 className="mt-1 font-semibold text-slate-900">{item.title}</h4>
                      <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!item.isRead && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 hover:text-primary cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Mark read</span>
                      </button>
                    )}
                    <button
                      onClick={() => clearNotification(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </div>
  );
}
