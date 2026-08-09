"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "New Appointment Request",
    message: "Student Aarav Nair requested a counselling session for Tomorrow at 10:00 AM.",
    type: "appointment",
    timestamp: "10 mins ago",
    isRead: false,
    link: "/dashboard",
  },
  {
    id: "notif-2",
    title: "Case Sheet Updated",
    message: "Draft case sheet for CASE-001042 was updated with new session notes.",
    type: "case",
    timestamp: "45 mins ago",
    isRead: false,
    link: "/case-management",
  },
  {
    id: "notif-3",
    title: "Appointment Approved",
    message: "Session with Ananya Rao confirmed for Friday at 2:00 PM.",
    type: "appointment",
    timestamp: "2 hours ago",
    isRead: true,
    link: "/dashboard",
  },
  {
    id: "notif-4",
    title: "Google Drive Sync Completed",
    message: "Encrypted backup of confidential case files finished successfully.",
    type: "system",
    timestamp: "5 hours ago",
    isRead: true,
    link: "/google-drive",
  },
  {
    id: "notif-5",
    title: "Weekly Slot Reminder",
    message: "Please review and set your available consultation slots for next week.",
    type: "reminder",
    timestamp: "1 day ago",
    isRead: true,
    link: "/slots",
  },
];

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = "aasare_notifications_v1";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } catch {
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      } catch (e) {
        console.error("Failed to save notifications to localStorage", e);
      }
    }
  }, [notifications, hydrated]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addNotification = (notif: Omit<AppNotification, "id" | "timestamp" | "isRead">) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: "Just now",
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
