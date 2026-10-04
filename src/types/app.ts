import type { ComponentType } from "react";

export type AppId = "home" | "about" | "skills" | "projects" | "contact" | "resume" | "settings" | "admin";

/** Optional deep-link payload passed when launching an app (Spotlight, CTAs, widgets…). */
export interface AppParams {
  query?: string;
  projectId?: string;
  section?: string;
}

/** A launch request. `nonce` changes on every launch so already-open apps can react to it. */
export interface AppLaunch {
  params?: AppParams;
  nonce: number;
}

export interface AppProps {
  launch: AppLaunch;
}

export interface AppDefinition {
  id: AppId;
  name: string;
  /** Lucide icon name (resolved in components/system/AppIcon). */
  icon: string;
  /** Tailwind-free gradient used for the squircle icon background. */
  gradient: [string, string];
  description: string;
  keywords: string[];
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  /** Shown in the dock + mobile dock */
  inDock: boolean;
  inMobileDock: boolean;
}

export type AppComponent = ComponentType<AppProps>;
