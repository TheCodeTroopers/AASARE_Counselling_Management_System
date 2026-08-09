"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CalendarClock,
  Check,
  CheckCheck,
  FileText,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  useNotifications,
  type AppNotification,
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
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, clearAll } =
    useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const displayedList =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="w-80 md:w-96 rounded-2xl border border-border bg-white p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <BellRing className="h-5 w-5 text-primary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </div>
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-500/20">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
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
            All ({notifications.length})
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
            Unread ({unreadCount})
          </button>
        </div>

        {notifications.length > 0 && (
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
                onClick={() => {
                  if (!item.isRead) markAsRead(item.id);
                }}
                className={cn(
                  "group relative flex items-start gap-3 rounded-xl border p-3 transition text-left cursor-pointer",
                  item.isRead
                    ? "border-slate-100 bg-white hover:bg-slate-50/80"
                    : "border-primary/20 bg-secondary/60 hover:bg-secondary",
                )}
              >
                {/* Icon Container */}
                <div className={cn("mt-0.5 shrink-0 rounded-lg p-2", style.bg, style.text)}>
                  <IconComponent className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider rounded-md border px-1.5 py-0.5",
                        style.badgeBg,
                      )}
                    >
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-900 leading-tight">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                </div>

                {/* Action / Unread Indicator */}
                <div className="flex flex-col items-end gap-1.5">
                  {!item.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary" title="Unread" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
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

      {/* Footer Link */}
      <div className="mt-3 border-t border-border pt-2 text-center">
        <Link
          href="/notifications"
          onClick={onClose}
          className="text-xs font-medium text-primary hover:underline"
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
