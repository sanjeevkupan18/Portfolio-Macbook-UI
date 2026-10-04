"use client";

import { useEffect } from "react";
import { useOverlay } from "@/context/OverlayContext";
import { useWindows } from "@/context/WindowContext";

const isEditable = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/**
 * Desktop shortcuts (see src/data/shortcuts.ts). Uses `event.code` so Alt+letter works on macOS.
 * Escape only closes the active window when no overlay/menu/app consumed it and focus isn't in a text field.
 */
export function useGlobalShortcuts(): void {
  const wm = useWindows();
  const { overlay, toggle } = useOverlay();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const active = wm.activeId;
      if (mod && !e.shiftKey && !e.altKey && e.code === "KeyK") {
        e.preventDefault();
        toggle({ type: "spotlight" });
      } else if (mod && e.shiftKey && e.code === "KeyF" && active) {
        e.preventDefault();
        wm.toggleMaximize(active);
      } else if (((mod && !e.shiftKey && e.code === "KeyW") || (e.altKey && !mod && e.code === "KeyW")) && active && !overlay) {
        e.preventDefault();
        wm.closeWindow(active);
      } else if (((mod && !e.shiftKey && e.code === "KeyM") || (e.altKey && !mod && e.code === "KeyM")) && active && !overlay) {
        e.preventDefault();
        wm.minimizeWindow(active);
      } else if (e.key === "Escape" && !e.defaultPrevented && !overlay && active && !isEditable(e.target)) {
        wm.closeWindow(active);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [wm, overlay, toggle]);
}
