"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type NotificationType =
  | "order"
  | "inventory"
  | "security"
  | "customer"
  | "system";

export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  createdAt: string;
  type: NotificationType;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "High-Value Order Received",
    message: "Order #ORD-7392 for $1,849.00 from Liam Johnson is awaiting fulfillment review.",
    timestamp: "4m ago",
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    type: "order",
    priority: "high",
    read: false,
    actionUrl: "/orders",
    actionLabel: "Review Order",
  },
  {
    id: "notif-2",
    title: "Critical Low Stock Alert",
    message: "USB-C Fast Charging Hub 100W has only 5 units remaining (reorder point: 15).",
    timestamp: "18m ago",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    type: "inventory",
    priority: "urgent",
    read: false,
    actionUrl: "/inventory",
    actionLabel: "Restock Now",
  },
  {
    id: "notif-3",
    title: "New VIP Customer Tier",
    message: "Sarah Jenkins reached Platinum status with $5,240 lifetime spend.",
    timestamp: "1h ago",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    type: "customer",
    priority: "medium",
    read: false,
    actionUrl: "/customers",
    actionLabel: "View Customer",
  },
  {
    id: "notif-4",
    title: "Staff Sign-in from New Location",
    message: "Successful login for user admin@example.com from IP 192.168.1.104.",
    timestamp: "3h ago",
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    type: "security",
    priority: "medium",
    read: false,
    actionUrl: "/settings",
    actionLabel: "Security Log",
  },
  {
    id: "notif-5",
    title: "Return & Refund Request",
    message: "Customer requested a return on Order #ORD-7389 ('Studio Wireless Headset').",
    timestamp: "5h ago",
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    type: "order",
    priority: "high",
    read: true,
    actionUrl: "/orders",
    actionLabel: "Process Return",
  },
  {
    id: "notif-6",
    title: "Multi-Channel Catalog Synchronized",
    message: "1,420 SKUs successfully synchronized across 3 active sales channels.",
    timestamp: "1d ago",
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    type: "system",
    priority: "low",
    read: true,
    actionUrl: "/channels",
    actionLabel: "Channel Status",
  },
  {
    id: "notif-7",
    title: "Out of Stock: Smartwatch Series 7",
    message: "Stock has depleted to 0 units in Regional Fulfillment Center B.",
    timestamp: "2d ago",
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    type: "inventory",
    priority: "urgent",
    read: true,
    actionUrl: "/inventory",
    actionLabel: "Manage Stock",
  },
];

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, "id" | "createdAt" | "timestamp" | "read">) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const STORAGE_KEY = "voltmart_admin_notifications_v1";

let memoryNotifications: NotificationItem[] | null = null;
const listeners = new Set<() => void>();

function getNotificationsSnapshot(): NotificationItem[] {
  if (memoryNotifications !== null) return memoryNotifications;
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryNotifications = parsed;
        return memoryNotifications;
      }
    }
  } catch {
    // Ignore parse errors
  }
  memoryNotifications = INITIAL_NOTIFICATIONS;
  return memoryNotifications;
}

function setStoreNotifications(next: NotificationItem[]) {
  memoryNotifications = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        memoryNotifications = JSON.parse(e.newValue);
        callback();
      } catch {}
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => INITIAL_NOTIFICATIONS;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const notifications = useSyncExternalStore(
    subscribe,
    getNotificationsSnapshot,
    getServerSnapshot
  );

  const markAsRead = useCallback(
    (id: string) => {
      setStoreNotifications(
        notifications.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
    },
    [notifications]
  );

  const markAsUnread = useCallback(
    (id: string) => {
      setStoreNotifications(
        notifications.map((item) => (item.id === id ? { ...item, read: false } : item))
      );
    },
    [notifications]
  );

  const markAllAsRead = useCallback(() => {
    setStoreNotifications(notifications.map((item) => ({ ...item, read: true })));
  }, [notifications]);

  const deleteNotification = useCallback(
    (id: string) => {
      setStoreNotifications(notifications.filter((item) => item.id !== id));
    },
    [notifications]
  );

  const clearAll = useCallback(() => {
    setStoreNotifications([]);
  }, []);

  const addNotification = useCallback(
    (item: Omit<NotificationItem, "id" | "createdAt" | "timestamp" | "read">) => {
      const newItem: NotificationItem = {
        ...item,
        id: `notif-${Date.now()}`,
        timestamp: "Just now",
        createdAt: new Date().toISOString(),
        read: false,
      };
      setStoreNotifications([newItem, ...notifications]);
    },
    [notifications]
  );

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
