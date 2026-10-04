"use client";

import { Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  active: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}

const dot = "grid size-3 place-items-center rounded-full text-black/60 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)] transition-colors";

/** Red / yellow / green traffic lights. Glyphs appear when the group is hovered or focused. */
export function WindowControls({ active, maximized, onClose, onMinimize, onToggleMaximize }: Props) {
  const color = (c: string) => (active ? c : "bg-[color-mix(in_srgb,var(--foreground)_22%,transparent)]");
  return (
    <div className="group flex items-center gap-2 px-1 py-2" role="group" aria-label="Window controls" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <button type="button" aria-label="Close window" onClick={onClose} className={cn(dot, color("bg-[#ff5f57]"))}>
        <X className="size-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" strokeWidth={3.5} aria-hidden="true" />
      </button>
      <button type="button" aria-label="Minimize window" onClick={onMinimize} className={cn(dot, color("bg-[#febc2e]"))}>
        <Minus className="size-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" strokeWidth={3.5} aria-hidden="true" />
      </button>
      <button type="button" aria-label={maximized ? "Restore window size" : "Maximize window"} onClick={onToggleMaximize} className={cn(dot, color("bg-[#28c840]"))}>
        <Plus className="size-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" strokeWidth={3.5} aria-hidden="true" />
      </button>
    </div>
  );
}
