"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { appById } from "@/data/apps";
import { MENUBAR_HEIGHT, useDesktop } from "@/context/DesktopContext";
import { clamp } from "@/lib/utils";
import { storage } from "@/lib/storage";
import type { AppId, AppParams } from "@/types/app";
import type { Bounds, Point, WindowState } from "@/types/window";

const Z_BASE = 100;
const Z_MAX = 800; // windows must stay below the dock (z-900) and menu bar
const STORAGE_KEY = "windows";

interface State {
  windows: WindowState[];
  z: number;
  activeId: string | null;
  recents: AppId[];
}

type Action =
  | { type: "open"; appId: AppId; params?: AppParams; bounds: Bounds }
  | { type: "close"; id: string }
  | { type: "closeAll" }
  | { type: "minimize"; id: string }
  | { type: "restore"; id: string }
  | { type: "toggleMaximize"; id: string }
  | { type: "focus"; id: string }
  | { type: "blurAll" }
  | { type: "move"; id: string; position: Point }
  | { type: "resize"; id: string; bounds: Bounds }
  | { type: "clamp"; viewport: { width: number; height: number } };

function topVisible(windows: WindowState[], excludeId?: string): string | null {
  const open = windows.filter((w) => w.isOpen && !w.isMinimized && w.id !== excludeId);
  if (open.length === 0) return null;
  return open.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).id;
}

/** Brings a window to the front; re-ranks all windows if the counter nears the ceiling. */
function bringToFront(state: State, id: string): State {
  let z = state.z + 1;
  let windows = state.windows.map((w) => (w.id === id ? { ...w, zIndex: z } : w));
  if (z > Z_MAX) {
    const ranked = [...windows].sort((a, b) => a.zIndex - b.zIndex);
    windows = windows.map((w) => ({ ...w, zIndex: Z_BASE + ranked.findIndex((r) => r.id === w.id) }));
    z = Z_BASE + windows.length;
  }
  return { ...state, windows, z, activeId: id };
}

function patch(state: State, id: string, change: Partial<WindowState>): State {
  return { ...state, windows: state.windows.map((w) => (w.id === id ? { ...w, ...change } : w)) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      const existing = state.windows.find((w) => w.id === action.appId);
      const recents = [action.appId, ...state.recents.filter((r) => r !== action.appId)].slice(0, 6);
      if (existing) {
        const next = patch(state, existing.id, {
          isOpen: true,
          isMinimized: false,
          launch: { params: action.params, nonce: existing.launch.nonce + 1 },
          ...(existing.isOpen ? {} : { position: { x: action.bounds.x, y: action.bounds.y }, size: { width: action.bounds.width, height: action.bounds.height }, isMaximized: false }),
        });
        return bringToFront({ ...next, recents }, existing.id);
      }
      const win: WindowState = {
        id: action.appId,
        appId: action.appId,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: state.z,
        position: { x: action.bounds.x, y: action.bounds.y },
        size: { width: action.bounds.width, height: action.bounds.height },
        launch: { params: action.params, nonce: 1 },
      };
      return bringToFront({ ...state, windows: [...state.windows, win], recents }, win.id);
    }
    case "close": {
      const next = patch(state, action.id, { isOpen: false, isMinimized: false, isMaximized: false });
      return { ...next, activeId: state.activeId === action.id ? topVisible(next.windows) : state.activeId };
    }
    case "closeAll":
      return { ...state, windows: state.windows.map((w) => ({ ...w, isOpen: false, isMinimized: false, isMaximized: false })), activeId: null };
    case "minimize": {
      const next = patch(state, action.id, { isMinimized: true });
      return { ...next, activeId: state.activeId === action.id ? topVisible(next.windows) : state.activeId };
    }
    case "restore":
      return bringToFront(patch(state, action.id, { isMinimized: false, isOpen: true }), action.id);
    case "toggleMaximize": {
      const w = state.windows.find((x) => x.id === action.id);
      if (!w) return state;
      return bringToFront(patch(state, action.id, { isMaximized: !w.isMaximized, isMinimized: false }), action.id);
    }
    case "focus":
      return state.activeId === action.id ? state : bringToFront(state, action.id);
    case "blurAll":
      return state.activeId === null ? state : { ...state, activeId: null };
    case "move":
      return patch(state, action.id, { position: action.position });
    case "resize":
      return patch(state, action.id, { position: { x: action.bounds.x, y: action.bounds.y }, size: { width: action.bounds.width, height: action.bounds.height } });
    case "clamp":
      return {
        ...state,
        windows: state.windows.map((w) => {
          const width = Math.min(w.size.width, action.viewport.width);
          const height = Math.min(w.size.height, action.viewport.height - MENUBAR_HEIGHT);
          return {
            ...w,
            size: { width, height },
            position: {
              x: clamp(w.position.x, 0, action.viewport.width - width),
              y: clamp(w.position.y, MENUBAR_HEIGHT, action.viewport.height - Math.min(height, 80)),
            },
          };
        }),
      };
  }
}

function init(): State {
  const stored = storage.get<{ windows?: WindowState[]; recents?: AppId[] }>(STORAGE_KEY, {});
  const valid = (stored.windows ?? []).filter((w) => w && w.appId in appById && w.size?.width > 0 && w.position);
  const windows = valid.map((w, i) => ({ ...w, id: w.appId, zIndex: Z_BASE + i, launch: { nonce: 0, params: undefined } }));
  const open = windows.filter((w) => w.isOpen && !w.isMinimized);
  return {
    windows,
    z: Z_BASE + windows.length,
    activeId: open.length ? open[open.length - 1]!.id : null,
    recents: (stored.recents ?? []).filter((r) => r in appById),
  };
}

interface WindowContextValue {
  windows: WindowState[];
  activeId: string | null;
  recents: AppId[];
  getWindow: (appId: AppId) => WindowState | undefined;
  openApp: (appId: AppId, params?: AppParams) => void;
  closeWindow: (id: string) => void;
  closeAll: () => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  blurAll: () => void;
  moveWindow: (id: string, position: Point) => void;
  resizeWindow: (id: string, bounds: Bounds) => void;
}

const WindowContext = createContext<WindowContextValue | null>(null);

export function WindowProvider({ children }: { children: ReactNode }) {
  const { workArea } = useDesktop();
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // Remember open apps, positions and sizes (never anything sensitive).
  useEffect(() => {
    storage.set(STORAGE_KEY, { windows: state.windows.map((w) => ({ ...w, launch: undefined })), recents: state.recents });
  }, [state.windows, state.recents]);

  // Keep windows reachable when the viewport shrinks (tablet rotation, browser resize).
  useEffect(() => {
    const onResize = () => dispatch({ type: "clamp", viewport: { width: window.innerWidth, height: window.innerHeight } });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const openCount = state.windows.filter((w) => w.isOpen).length;
  const openApp = useCallback(
    (appId: AppId, params?: AppParams) => {
      const def = appById[appId];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const availW = vw - workArea.left - workArea.right;
      const availH = vh - workArea.top - workArea.bottom;
      const width = clamp(def.defaultSize.width, Math.min(def.minSize.width, availW - 16), availW - 24);
      const height = clamp(def.defaultSize.height, Math.min(def.minSize.height, availH - 16), availH - 24);
      const n = openCount % 6;
      const x = clamp(workArea.left + (availW - width) / 2 + (n - 2.5) * 26, workArea.left, vw - workArea.right - width);
      const y = clamp(workArea.top + (availH - height) / 2 + (n - 2.5) * 22 - 6, workArea.top, vh - workArea.bottom - height);
      dispatch({ type: "open", appId, params, bounds: { x, y, width, height } });
    },
    [workArea, openCount],
  );

  const value = useMemo<WindowContextValue>(
    () => ({
      windows: state.windows,
      activeId: state.activeId,
      recents: state.recents,
      getWindow: (appId) => state.windows.find((w) => w.appId === appId && w.isOpen),
      openApp,
      closeWindow: (id) => dispatch({ type: "close", id }),
      closeAll: () => dispatch({ type: "closeAll" }),
      minimizeWindow: (id) => dispatch({ type: "minimize", id }),
      restoreWindow: (id) => dispatch({ type: "restore", id }),
      toggleMaximize: (id) => dispatch({ type: "toggleMaximize", id }),
      focusWindow: (id) => dispatch({ type: "focus", id }),
      blurAll: () => dispatch({ type: "blurAll" }),
      moveWindow: (id, position) => dispatch({ type: "move", id, position }),
      resizeWindow: (id, bounds) => dispatch({ type: "resize", id, bounds }),
    }),
    [state, openApp],
  );

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>;
}

export function useWindows(): WindowContextValue {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error("useWindows must be used inside <WindowProvider>");
  return ctx;
}

/** Returns null on the phone layout (no window manager there). */
export function useOptionalWindows(): WindowContextValue | null {
  return useContext(WindowContext);
}
