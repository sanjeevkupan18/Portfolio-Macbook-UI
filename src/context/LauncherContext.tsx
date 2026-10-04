"use client";

import { createContext, useContext } from "react";
import type { AppId, AppParams } from "@/types/app";

export interface Launcher {
  /** Opens (or focuses / restores) an app. Desktop → window, mobile → full-screen app. */
  openApp: (appId: AppId, params?: AppParams) => void;
}

export const LauncherContext = createContext<Launcher | null>(null);

export function useLauncher(): Launcher {
  const ctx = useContext(LauncherContext);
  if (!ctx) throw new Error("useLauncher must be used inside a desktop or mobile shell");
  return ctx;
}
