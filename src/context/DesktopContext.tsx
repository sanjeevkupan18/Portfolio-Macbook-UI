"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { defaultWallpaperId } from "@/data/wallpapers";
import { createPersistedStore } from "@/lib/persisted-store";
import { storage } from "@/lib/storage";
import { batteryStore, type BatteryState } from "@/lib/battery";

export type Theme = "light" | "dark" | "system";
export type AccentId = "blue" | "purple" | "pink" | "red" | "orange" | "green" | "graphite";
export type DockPosition = "bottom" | "left" | "right";
export type WidgetId = "date" | "clock" | "battery" | "profile" | "projects";

export interface DesktopFolder { id: string; name: string }

export interface Prefs {
  theme: Theme;
  accent: AccentId;
  wallpaperId: string;
  dockPosition: DockPosition;
  /** Base icon size in px */
  dockSize: number;
  dockMagnification: boolean;
  autoHideDock: boolean;
  notificationsEnabled: boolean;
  soundEffects: boolean;
  clock24: boolean;
  showWidgets: boolean;
  widgets: Record<WidgetId, boolean>;
  showDesktopIcons: boolean;
  folders: DesktopFolder[];
  // simulated system controls
  wifi: boolean;
  bluetooth: boolean;
  airdrop: boolean;
  focus: boolean;
  /** 0.35–1 */
  brightness: number;
  /** 0–100 */
  keyboardBrightness: number;
  /** 0–100 */
  volume: number;
}

export const defaultPrefs: Prefs = {
  theme: "system",
  accent: "blue",
  wallpaperId: defaultWallpaperId,
  dockPosition: "bottom",
  dockSize: 56,
  dockMagnification: true,
  autoHideDock: false,
  notificationsEnabled: true,
  soundEffects: true,
  clock24: false,
  showWidgets: true,
  widgets: { date: true, clock: true, battery: true, profile: true, projects: true },
  showDesktopIcons: true,
  folders: [],
  wifi: true,
  bluetooth: true,
  airdrop: false,
  focus: false,
  brightness: 1,
  keyboardBrightness: 45,
  volume: 40,
};

export const PREFS_KEY = "prefs";
export const prefsStore = createPersistedStore<Prefs>(PREFS_KEY, defaultPrefs);

export const MENUBAR_HEIGHT = 28;

export interface WorkArea { top: number; left: number; right: number; bottom: number }

/** Space reserved by the dock when it's not auto-hidden (px). */
export function workAreaFor(prefs: Pick<Prefs, "dockPosition" | "dockSize" | "autoHideDock">): WorkArea {
  const dock = prefs.autoHideDock ? 0 : prefs.dockSize + 40;
  return {
    top: MENUBAR_HEIGHT,
    left: prefs.dockPosition === "left" ? dock : 0,
    right: prefs.dockPosition === "right" ? dock : 0,
    bottom: prefs.dockPosition === "bottom" ? dock : 0,
  };
}

interface DesktopContextValue {
  prefs: Prefs;
  setPrefs: (patch: Partial<Prefs> | ((prev: Prefs) => Partial<Prefs>)) => void;
  /** Reset every preference to defaults and clear persisted desktop data. */
  resetAll: () => void;
  battery: BatteryState;
  workArea: WorkArea;
  /** Bumps when the user chooses "Refresh" from the desktop context menu. */
  refreshKey: number;
  refreshDesktop: () => void;
}

const DesktopContext = createContext<DesktopContextValue | null>(null);

export function DesktopProvider({ children }: { children: ReactNode }) {
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot, prefsStore.getServerSnapshot);
  const battery = useSyncExternalStore(batteryStore.subscribe, batteryStore.getSnapshot, batteryStore.getServerSnapshot);
  const [refreshKey, setRefreshKey] = useState(0);

  const resetAll = useCallback(() => {
    prefsStore.reset();
    storage.clearAll();
  }, []);
  const refreshDesktop = useCallback(() => setRefreshKey((k) => k + 1), []);

  const value = useMemo<DesktopContextValue>(
    () => ({ prefs, setPrefs: prefsStore.set, resetAll, battery, workArea: workAreaFor(prefs), refreshKey, refreshDesktop }),
    [prefs, battery, resetAll, refreshKey, refreshDesktop],
  );
  return <DesktopContext.Provider value={value}>{children}</DesktopContext.Provider>;
}

export function useDesktop(): DesktopContextValue {
  const ctx = useContext(DesktopContext);
  if (!ctx) throw new Error("useDesktop must be used inside <DesktopProvider>");
  return ctx;
}
