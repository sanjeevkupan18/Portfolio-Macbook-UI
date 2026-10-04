"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type MenuItem =
  | { type: "item"; label: string; shortcut?: string; onSelect?: () => void; disabled?: boolean; checked?: boolean; submenu?: MenuItem[] }
  | { type: "separator" }
  | { type: "header"; label: string };

export const item = (label: string, onSelect?: () => void, extra: Partial<Extract<MenuItem, { type: "item" }>> = {}): MenuItem => ({ type: "item", label, onSelect, ...extra });
export const separator: MenuItem = { type: "separator" };

interface MenuPanelProps {
  items: MenuItem[];
  label: string;
  onClose: () => void;
  className?: string;
}

/** macOS-style menu list used by the menu bar, dock and desktop context menus. */
export function MenuPanel({ items, label, onClose, className }: MenuPanelProps) {
  const [openSub, setOpenSub] = useState<number | null>(null);
  return (
    <div role="menu" aria-label={label} className={cn("glass glass-panel os-chrome min-w-[220px] rounded-xl p-1 text-[13px] text-foreground", className)}>
      {items.map((it, i) => {
        if (it.type === "separator") return <div key={i} role="separator" className="mx-2 my-1 h-px bg-border" />;
        if (it.type === "header") return <p key={i} className="px-3 pt-1.5 pb-0.5 text-[11px] font-semibold text-muted">{it.label}</p>;
        const hasSub = !!it.submenu;
        return (
          <div key={i} className="relative" onPointerEnter={() => setOpenSub(hasSub ? i : null)}>
            <button
              type="button"
              role="menuitem"
              aria-haspopup={hasSub ? "menu" : undefined}
              aria-expanded={hasSub ? openSub === i : undefined}
              disabled={it.disabled}
              onClick={() => {
                if (hasSub) return setOpenSub(i);
                onClose();
                it.onSelect?.();
              }}
              onKeyDown={(e) => {
                if (hasSub && e.key === "ArrowRight") { e.preventDefault(); setOpenSub(i); }
                if (hasSub && e.key === "ArrowLeft") setOpenSub(null);
              }}
              className="relative flex w-full items-center gap-2 rounded-md py-[5px] pr-3 pl-6 text-left hover:bg-accent hover:text-accent-fg focus-visible:bg-accent focus-visible:text-accent-fg focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
            >
              {it.checked && <Check className="absolute left-2 size-3.5" aria-hidden="true" />}
              <span className="min-w-0 flex-1 truncate">{it.label}</span>
              {it.shortcut && <span className="ml-4 text-[12px] opacity-60">{it.shortcut}</span>}
              {hasSub && <ChevronRight className="size-3.5 opacity-70" aria-hidden="true" />}
            </button>
            {hasSub && openSub === i && it.submenu && (
              <MenuPanel items={it.submenu} label={it.label} onClose={onClose} className="absolute top-[-5px] left-full ml-0.5" />
            )}
          </div>
        );
      })}
    </div>
  );
}
