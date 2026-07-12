import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { notificationBus, notificationsService } from "@/services/notifications.service";
import type { Notification } from "@/types";

interface NotificationsContextValue {
  notifications: Notification[];
  unread: number;
  push: (n: Notification) => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    notificationsService.list().then(setNotifications);
    notificationBus.startSimulation();
    const unsub = notificationBus.subscribe((n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 100));
    });
    return () => {
      unsub();
      notificationBus.stop();
    };
  }, []);

  const push = (n: Notification) => notificationBus.emit(n);

  const markRead = async (id: string) => {
    await notificationsService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    await notificationsService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unread = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({ notifications, unread, push, markRead, markAllRead }),
    [notifications, unread]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
