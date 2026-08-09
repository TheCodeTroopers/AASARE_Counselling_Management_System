"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = "appointment" | "case" | "system" | "reminder";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export type NotificationQueryParams = {
  page?: number;
  pageSize?: number;
  readFilter?: "all" | "unread" | "read";
  typeFilter?: string;
  search?: string;
};

interface NotificationContextType {
  allNotifications: AppNotification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const READ_MAP_KEY = "aasare_read_notifs_map_v6";
const CLEARED_MAP_KEY = "aasare_cleared_notifs_map_v6";
const CUSTOM_NOTIFS_KEY = "aasare_custom_notifs_v6";

function formatTimeAgo(dateString: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refreshNotifications = useCallback(async () => {
    try {
      // Clear legacy storage keys containing mock dummy data
      try {
        localStorage.removeItem("aasare_notifications_v1");
        localStorage.removeItem("aasare_notifications_v2");
        localStorage.removeItem("aasare_notifications_v3");
        localStorage.removeItem("aasare_notifications_v4");
        localStorage.removeItem("aasare_notifications_v5");
      } catch {}

      const readStateMap: Record<string, boolean> = JSON.parse(
        localStorage.getItem(READ_MAP_KEY) || "{}",
      );
      const clearedStateMap: Record<string, boolean> = JSON.parse(
        localStorage.getItem(CLEARED_MAP_KEY) || "{}",
      );
      const customNotifs: AppNotification[] = JSON.parse(
        localStorage.getItem(CUSTOM_NOTIFS_KEY) || "[]",
      );

      const { data: userData } = await supabase.auth.getUser();
      let realAppointmentNotifs: AppNotification[] = [];

      if (userData?.user) {
        const { data: realAppointments } = await supabase
          .from("appointments")
          .select("id, counsellor_id, date, slot_time, status, rejection_reason, created_at")
          .order("created_at", { ascending: false })
          .limit(30);

        realAppointmentNotifs = (realAppointments || []).map((apt) => {
          const isApproved = apt.status === "approved";
          const isRejected = apt.status === "rejected";
          const isPending = apt.status === "pending";

          let title = "Appointment Request";
          let type: NotificationType = "appointment";
          let message = `Appointment scheduled for ${apt.date} at ${apt.slot_time}`;

          if (isApproved) {
            title = "Appointment Approved";
            message = `Session for ${apt.date} at ${apt.slot_time} has been approved.`;
          } else if (isRejected) {
            title = "Appointment Declined";
            message = `Session request for ${apt.date} at ${apt.slot_time} was declined. ${
              apt.rejection_reason ? `Reason: ${apt.rejection_reason}` : ""
            }`;
          } else if (isPending) {
            title = "Appointment Pending Approval";
            message = `Appointment request for ${apt.date} at ${apt.slot_time} is awaiting counsellor approval.`;
          }

          const id = `apt-notif-${apt.id}`;
          return {
            id,
            title,
            message,
            type,
            timestamp: formatTimeAgo(apt.created_at),
            isRead: Boolean(readStateMap[id]),
            link: "/my-appointments",
          };
        });
      }

      // Combine real appointments and custom user notifications, filtering cleared items
      const combined = [...realAppointmentNotifs, ...customNotifs].filter(
        (n) => !clearedStateMap[n.id],
      );

      // Apply read state overrides
      const finalNotifs = combined.map((n) => ({
        ...n,
        isRead: readStateMap[n.id] ?? n.isRead,
      }));

      // Deduplicate by ID
      const map = new Map<string, AppNotification>();
      for (const item of finalNotifs) {
        map.set(item.id, item);
      }

      setAllNotifications(Array.from(map.values()));
    } catch (e) {
      console.error("Error loading notifications:", e);
    }
  }, []);

  useEffect(() => {
    refreshNotifications().finally(() => setHydrated(true));
  }, [refreshNotifications]);

  const markAsRead = (id: string) => {
    setAllNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      try {
        const map = JSON.parse(localStorage.getItem(READ_MAP_KEY) || "{}");
        map[id] = true;
        localStorage.setItem(READ_MAP_KEY, JSON.stringify(map));
      } catch {}
      return updated;
    });
  };

  const markAllAsRead = () => {
    setAllNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      try {
        const map: Record<string, boolean> = {};
        for (const n of updated) {
          map[n.id] = true;
        }
        localStorage.setItem(READ_MAP_KEY, JSON.stringify(map));
      } catch {}
      return updated;
    });
  };

  const clearNotification = (id: string) => {
    setAllNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const map = JSON.parse(localStorage.getItem(CLEARED_MAP_KEY) || "{}");
      map[id] = true;
      localStorage.setItem(CLEARED_MAP_KEY, JSON.stringify(map));
    } catch {}
  };

  const clearAll = () => {
    try {
      const map: Record<string, boolean> = {};
      for (const n of allNotifications) {
        map[n.id] = true;
      }
      localStorage.setItem(CLEARED_MAP_KEY, JSON.stringify(map));
      localStorage.removeItem(CUSTOM_NOTIFS_KEY);
    } catch {}
    setAllNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `custom-notif-${Date.now()}`,
      timestamp: "Just now",
      isRead: false,
    };
    setAllNotifications((prev) => [newNotif, ...prev]);
    try {
      const saved: AppNotification[] = JSON.parse(localStorage.getItem(CUSTOM_NOTIFS_KEY) || "[]");
      localStorage.setItem(CUSTOM_NOTIFS_KEY, JSON.stringify([newNotif, ...saved]));
    } catch {}
  };

  return (
    <NotificationContext.Provider
      value={{
        allNotifications,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        addNotification,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(params?: NotificationQueryParams) {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }

  const {
    allNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    addNotification,
    refreshNotifications,
  } = context;

  const {
    page = 1,
    pageSize = 5,
    readFilter = "all",
    typeFilter = "all",
    search = "",
  } = params || {};

  const cleanSearch = search.trim().toLowerCase();

  // 1. Filter notifications by search query first
  const searchMatchedNotifs = useMemo(() => {
    if (!cleanSearch) return allNotifications;
    return allNotifications.filter((n) => {
      const titleText = (n.title || "").toLowerCase();
      const messageText = (n.message || "").toLowerCase();
      const typeText = (n.type || "").toLowerCase();
      return (
        titleText.includes(cleanSearch) ||
        messageText.includes(cleanSearch) ||
        typeText.includes(cleanSearch)
      );
    });
  }, [allNotifications, cleanSearch]);

  // 2. Filter by active category type
  const categoryMatchedNotifs = useMemo(() => {
    if (typeFilter === "all") return searchMatchedNotifs;
    return searchMatchedNotifs.filter((n) => n.type === typeFilter);
  }, [searchMatchedNotifs, typeFilter]);

  // 3. Filter by read status for rendering paginated list
  const filtered = useMemo(() => {
    if (readFilter === "unread") {
      return categoryMatchedNotifs.filter((n) => !n.isRead);
    }
    if (readFilter === "read") {
      return categoryMatchedNotifs.filter((n) => n.isRead);
    }
    return categoryMatchedNotifs;
  }, [categoryMatchedNotifs, readFilter]);

  // Pagination calculation
  const totalMatchingCount = filtered.length;
  const totalPages = Math.ceil(totalMatchingCount / pageSize) || 1;
  const validPage = Math.min(page, totalPages);

  const paginatedNotifications = useMemo(() => {
    const from = (validPage - 1) * pageSize;
    return filtered.slice(from, from + pageSize);
  }, [filtered, validPage, pageSize]);

  // Mathematically precise badge counts for Read Status Pills (scoped to category & search)
  const categoryTotalCount = categoryMatchedNotifs.length;
  const unreadCount = categoryMatchedNotifs.filter((n) => !n.isRead).length;
  const readCount = categoryMatchedNotifs.filter((n) => n.isRead).length;

  // Global counts for top overview cards
  const globalUnreadCount = allNotifications.filter((n) => !n.isRead).length;
  const appointmentCount = allNotifications.filter((n) => n.type === "appointment").length;
  const systemCount = allNotifications.filter((n) => n.type === "system" || n.type === "case").length;

  return {
    notifications: paginatedNotifications,
    allNotifications,
    totalMatchingCount,
    categoryTotalCount,
    totalPages,
    currentPage: validPage,
    pageSize,
    unreadCount,
    readCount,
    globalUnreadCount,
    appointmentCount,
    systemCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    addNotification,
    refreshNotifications,
  };
}
