"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { clamp } from "@/lib/utils";
import { MenuPanel, type MenuItem } from "./MenuPanel";

export interface ContextMenuState { x: number; y: number; items: MenuItem[]; label: string }

/** Fixed-position context menu; closes on outside press, Escape, blur or resize. */
export function ContextMenu({ menu, onClose }: { menu: ContextMenuState; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: menu.x, y: menu.y });

  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: clamp(menu.x, 4, window.innerWidth - r.width - 4), y: clamp(menu.y, 32, window.innerHeight - r.height - 4) });
  }, [menu.x, menu.y]);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("pointerdown", down, true);
    window.addEventListener("keydown", key, true);
    window.addEventListener("blur", onClose);
    window.addEventListener("resize", onClose);
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
    return () => {
      document.removeEventListener("pointerdown", down, true);
      window.removeEventListener("keydown", key, true);
      window.removeEventListener("blur", onClose);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  return (
    <div ref={ref} className="fixed z-[2500]" style={{ left: pos.x, top: pos.y }} onContextMenu={(e) => e.preventDefault()}>
      <MenuPanel items={menu.items} label={menu.label} onClose={onClose} />
    </div>
  );
}
