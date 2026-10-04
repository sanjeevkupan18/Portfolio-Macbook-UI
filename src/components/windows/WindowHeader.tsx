"use client";

import type { PointerEvent } from "react";
import { AppIcon } from "@/components/system/AppIcon";
import { appById } from "@/data/apps";
import { cn } from "@/lib/utils";
import type { AppId } from "@/types/app";
import { WindowControls } from "./WindowControls";

interface Props {
  appId: AppId;
  active: boolean;
  maximized: boolean;
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}

/** Title bar: drag handle (pointer down), double-click toggles maximize. */
export function WindowHeader({ appId, active, maximized, onPointerDown, onClose, onMinimize, onToggleMaximize }: Props) {
  const app = appById[appId];
  return (
    <div
      onPointerDown={onPointerDown}
      onDoubleClick={onToggleMaximize}
      className={cn("os-chrome relative flex h-10 shrink-0 touch-none items-center border-b border-border px-3", maximized ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
    >
      <WindowControls active={active} maximized={maximized} onClose={onClose} onMinimize={onMinimize} onToggleMaximize={onToggleMaximize} />
      <div className={cn("pointer-events-none absolute inset-x-24 flex items-center justify-center gap-1.5 text-[13px] font-semibold", !active && "opacity-55")}>
        <AppIcon appId={appId} size={16} />
        <h2 className="truncate">{app.name}</h2>
      </div>
    </div>
  );
}
