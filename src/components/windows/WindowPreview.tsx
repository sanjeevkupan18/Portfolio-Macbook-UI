"use client";

import { AppIcon } from "@/components/system/AppIcon";
import { appById } from "@/data/apps";
import { cn } from "@/lib/utils";
import type { AppId } from "@/types/app";
import type { WindowState } from "@/types/window";

const PREVIEW_W = 188;

/** Dock hover card: a miniature of the open window (or just the app name when it isn't open). */
export function WindowPreview({ appId, win }: { appId: AppId; win?: WindowState }) {
  const app = appById[appId];
  const open = !!win?.isOpen;
  const ratio = open && win ? clamp01(win.size.height / win.size.width) : 0.62;
  const h = Math.round(PREVIEW_W * ratio);
  return (
    <div className="glass glass-panel os-chrome rounded-xl p-2 text-center">
      {open ? (
        <>
          <div className="relative mx-auto overflow-hidden rounded-md bg-background shadow-[0_0_0_0.5px_var(--border)]" style={{ width: PREVIEW_W, height: h }} aria-hidden="true">
            <div className="flex h-3.5 items-center gap-1 border-b border-border bg-surface-2 px-1.5">
              <i className="size-1.5 rounded-full bg-[#ff5f57]" /><i className="size-1.5 rounded-full bg-[#febc2e]" /><i className="size-1.5 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex h-[calc(100%-14px)]">
              <div className="w-1/4 space-y-1 border-r border-border bg-surface-2 p-1.5">{[0, 1, 2, 3].map((i) => <div key={i} className={cn("h-1 rounded-full bg-foreground/15", i === 0 && "bg-accent/60")} />)}</div>
              <div className="flex-1 space-y-1.5 p-2">
                <div className="h-2 w-1/2 rounded-full bg-foreground/25" />
                <div className="h-1 w-full rounded-full bg-foreground/10" /><div className="h-1 w-5/6 rounded-full bg-foreground/10" /><div className="h-1 w-2/3 rounded-full bg-foreground/10" />
                <div className="mt-2 h-6 rounded-md" style={{ background: `linear-gradient(135deg, ${app.gradient[0]}, ${app.gradient[1]})`, opacity: 0.85 }} />
              </div>
            </div>
          </div>
          <p className="mt-1.5 text-[12px] font-medium">{app.name}{win?.isMinimized && <span className="text-muted"> · Minimized</span>}</p>
        </>
      ) : (
        <div className="flex items-center gap-2 px-1.5 py-0.5"><AppIcon appId={appId} size={22} /><span className="text-[12px] font-medium whitespace-nowrap">{app.name}</span></div>
      )}
    </div>
  );
}

const clamp01 = (n: number) => Math.min(0.9, Math.max(0.4, n));
