"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { prefsStore, type AccentId, type Theme } from "@/context/DesktopContext";

export const ACCENTS: Record<AccentId, { label: string; swatch: string }> = {
  blue: { label: "Blue", swatch: "#0a84ff" },
  purple: { label: "Purple", swatch: "#bf5af2" },
  pink: { label: "Pink", swatch: "#ff375f" },
  red: { label: "Red", swatch: "#ff453a" },
  orange: { label: "Orange", swatch: "#ff9f0a" },
  green: { label: "Green", swatch: "#30d158" },
  graphite: { label: "Graphite", swatch: "#8e8e93" },
};

const DARK_QUERY = "(prefers-color-scheme: dark)";
const subscribeSystem = (cb: () => void) => {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const systemIsDark = () => window.matchMedia(DARK_QUERY).matches;

interface ThemeContextValue {
  theme: Theme;
  resolved: "light" | "dark";
  accent: AccentId;
  setTheme: (t: Theme) => void;
  setAccent: (a: AccentId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const prefs = useSyncExternalStore(prefsStore.subscribe, prefsStore.getSnapshot, prefsStore.getServerSnapshot);
  const systemDark = useSyncExternalStore(subscribeSystem, systemIsDark, () => false);
  const resolved: "light" | "dark" = prefs.theme === "system" ? (systemDark ? "dark" : "light") : prefs.theme;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.accent = prefs.accent;
    root.style.colorScheme = resolved;
  }, [resolved, prefs.accent]);

  const setTheme = useCallback((theme: Theme) => prefsStore.set({ theme }), []);
  const setAccent = useCallback((accent: AccentId) => prefsStore.set({ accent }), []);

  const value = useMemo(() => ({ theme: prefs.theme, resolved, accent: prefs.accent, setTheme, setAccent }), [prefs.theme, resolved, prefs.accent, setTheme, setAccent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
