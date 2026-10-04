"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ConfirmAction = "restart" | "shutdown" | "logout";
export type Overlay =
  | { type: "spotlight" }
  | { type: "controlCenter" }
  | { type: "notificationCenter" }
  | { type: "about" }
  | { type: "shortcuts" }
  | { type: "forceQuit" }
  | { type: "confirm"; action: ConfirmAction };

interface OverlayContextValue {
  overlay: Overlay | null;
  open: (o: Overlay) => void;
  close: () => void;
  toggle: (o: Overlay) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

/** Only one system overlay (Spotlight, Control Center, dialogs…) is open at a time, like macOS. */
export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const open = useCallback((o: Overlay) => setOverlay(o), []);
  const close = useCallback(() => setOverlay(null), []);
  const toggle = useCallback((o: Overlay) => setOverlay((cur) => (cur?.type === o.type ? null : o)), []);
  // Escape closes the open overlay first (capture phase + preventDefault so the window-level shortcut doesn't also act).
  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOverlay(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [overlay]);

  const value = useMemo(() => ({ overlay, open, close, toggle }), [overlay, open, close, toggle]);
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used inside <OverlayProvider>");
  return ctx;
}
