"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDesktop } from "@/context/DesktopContext";
import { playPing } from "@/lib/sound";
import type { AppId } from "@/types/app";

export type NotificationKind = "info" | "success" | "error";

export interface AppNotification {
  id: string;
  key?: string;
  title: string;
  body?: string;
  kind: NotificationKind;
  appId?: AppId;
  createdAt: number;
}

export interface NotifyInput {
  title: string;
  body?: string;
  kind?: NotificationKind;
  appId?: AppId;
  /** Collapses duplicates: a notification with the same key is ignored while one is visible. */
  key?: string;
  /** ms before auto-dismiss (default 4500) */
  duration?: number;
}

interface NotificationContextValue {
  toasts: AppNotification[];
  history: AppNotification[];
  notify: (input: NotifyInput) => void;
  dismiss: (id: string) => void;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const MAX_TOASTS = 4;
const MAX_HISTORY = 30;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { prefs } = useDesktop();
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [history, setHistory] = useState<AppNotification[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const counter = useRef(0);
  const prefsRef = useRef(prefs);
  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((list) => list.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (input: NotifyInput) => {
      const p = prefsRef.current;
      const item: AppNotification = {
        id: `n${++counter.current}`,
        key: input.key,
        title: input.title,
        body: input.body,
        kind: input.kind ?? "info",
        appId: input.appId,
        createdAt: Date.now(),
      };
      setHistory((h) => (input.key && h[0]?.key === input.key && item.createdAt - h[0].createdAt < 2000 ? h : [item, ...h].slice(0, MAX_HISTORY)));
      // Focus mode and the "notifications off" setting keep banners (and sounds) quiet; errors always show.
      const quiet = (!p.notificationsEnabled || p.focus) && item.kind !== "error";
      if (quiet) return;
      setToasts((list) => {
        if (input.key && list.some((n) => n.key === input.key)) return list;
        return [item, ...list].slice(0, MAX_TOASTS);
      });
      if (p.soundEffects) playPing(p.volume);
      timers.current.set(item.id, setTimeout(() => dismiss(item.id), input.duration ?? 4500));
    },
    [dismiss],
  );

  const clearHistory = useCallback(() => setHistory([]), []);
  const value = useMemo(() => ({ toasts, history, notify, dismiss, clearHistory }), [toasts, history, notify, dismiss, clearHistory]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
