"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CalendarClock,
  CheckCheck,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  useNotifications,
  type NotificationType,
} from "@/hooks/use-notifications";
import { cn } from "@/utils/cn";

const ICON_MAP: Record<NotificationType, typeof BellRing> = {
  appointment: CalendarClock,
  case: FileText,
  system: ShieldCheck,
  reminder: BellRing,
};

const COLOR_MAP: Record<NotificationType, { bg: string; text: string; badgeBg: string }> = {
  appointment: {
    bg: "bg-amber-500/10",
    text: "text-amber-700",
    badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
  },
  case: {
    bg: "bg-primary/10",
    text: "text-primary",
    badgeBg: "bg-primary/10 text-primary border-primary/20",
  },
  system: {
    bg: "bg-blue-500/10",
    text: "text-blue-700",
    badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
  },
  reminder: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

export function NotificationDrawer({ onClose }: { onClose?: () => void }) {
  const { allNotifications, globalUnreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } =
    useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const displayedList =
    filter === "unread" ? allNotifications.filter((n) => !n.isRead) : allNotifications;

  const totalCount = allNotifications.length;

  return (
    <div className="w-80 md:w-96 rounded-2xl border border-border bg-white p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BellRing className="h-5 w-5 text-primary" />
            {globalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </div>
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          {globalUnreadCount > 0 && (
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-500/20">
              {globalUnreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {globalUnreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-primary cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark read</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-medium">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-lg px-3 py-1 transition cursor-pointer",
              filter === "all"
                ? "bg-white text-primary shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-lg px-3 py-1 transition cursor-pointer",
              filter === "unread"
                ? "bg-white text-primary shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            Unread ({globalUnreadCount})
          </button>
        </div>

        {totalCount > 0 && (
          <button
            onClick={clearAll}
            title="Clear all notifications"
            className="text-[11px] font-medium text-slate-400 transition hover:text-rose-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Notification Items List */}
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {displayedList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
          </div>
        ) : (
          displayedList.map((item) => {
            const IconComponent = ICON_MAP[item.type] || BellRing;
            const style = COLOR_MAP[item.type] || COLOR_MAP.reminder;

            return (
              <div
                key={item.id}
                className={cn(
                  "group flex items-start justify-between gap-3 rounded-xl border p-3 transition",
                  item.isRead
                    ? "border-slate-100 bg-white hover:border-slate-200"
                    : "border-primary/20 bg-secondary/30 hover:bg-secondary/50",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className={cn("mt-0.5 shrink-0 rounded-lg p-2", style.bg)}>
                    <IconComponent className={cn("h-4 w-4", style.text)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                      {!item.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-snug">{item.message}</p>
                    <span className="mt-1 block text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition cursor-pointer"
                      title="Mark read"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => clearNotification(item.id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link to Notifications Page */}
      <div className="mt-3 border-t border-border pt-2 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-primary transition hover:underline"
        >
          View all activity logs →
        </Link>
      </div>
    </div>
  );
}
