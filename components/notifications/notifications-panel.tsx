"use client";

import { useState } from "react";
import {
  Bell,
  BellRing,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Filter,
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
  const [search, setSearch] = useState("");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const {
    notifications,
    allNotifications,
    totalMatchingCount,
    categoryTotalCount,
    totalPages,
    currentPage: validPage,
    unreadCount,
    readCount,
    globalUnreadCount,
    appointmentCount,
    systemCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications({
    page: currentPage,
    pageSize,
    readFilter,
    typeFilter: selectedType,
    search,
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
              <p className="font-serif text-2xl font-bold text-slate-900">{allNotifications.length}</p>
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
              <p className="font-serif text-2xl font-bold text-rose-600">{globalUnreadCount}</p>
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
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search notifications by keyword…"
              className="w-full rounded-xl border border-border bg-secondary/50 py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {globalUnreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-secondary hover:text-primary cursor-pointer"
              >
                <CheckCheck className="h-4 w-4 text-emerald-600" /> Mark all read
              </button>
            )}
            {allNotifications.length > 0 && (
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Read / Unread Status Filter + Category Pills */}
        <div className="mb-6 space-y-3 border-b border-border pb-4">
          {/* Read Status Query Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
              <Filter className="h-3.5 w-3.5" /> Read Status:
            </span>
            {[
              { id: "all", label: "All Status", count: categoryTotalCount },
              { id: "unread", label: "Unread", count: unreadCount },
              { id: "read", label: "Read History", count: readCount },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setReadFilter(st.id as "all" | "unread" | "read");
                  setCurrentPage(1);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold transition cursor-pointer",
                  readFilter === st.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                <span>{st.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    readFilter === st.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700",
                  )}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Category Type Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: "all", label: "All Categories", count: allNotifications.length },
              { id: "appointment", label: "Appointments", count: appointmentCount },
              {
                id: "case",
                label: "Case Updates",
                count: allNotifications.filter((n) => n.type === "case").length,
              },
              {
                id: "system",
                label: "System & Security",
                count: systemCount,
              },
              {
                id: "reminder",
                label: "Reminders",
                count: allNotifications.filter((n) => n.type === "reminder").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedType(tab.id);
                  setCurrentPage(1);
                }}
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
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No notifications found</p>
              <p className="mt-1 text-xs text-slate-500">
                {search || readFilter !== "all" || selectedType !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Your notifications list is empty"}
              </p>
            </div>
          ) : (
            notifications.map((item) => {
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

        {/* Pagination Controls */}
        {totalMatchingCount > 0 && (
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Range Text + Page Size Selector */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>
                Showing <strong className="text-slate-900">{(validPage - 1) * pageSize + 1}</strong> –{" "}
                <strong className="text-slate-900">
                  {Math.min(validPage * pageSize, totalMatchingCount)}
                </strong>{" "}
                of <strong className="text-slate-900">{totalMatchingCount}</strong> alerts
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-slate-500">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>

              <span className="text-xs font-semibold text-slate-700">
                Page {validPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
