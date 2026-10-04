"use client";

import { Wifi, WifiOff, Zap } from "lucide-react";
import { useDesktop } from "@/context/DesktopContext";
import { useOverlay } from "@/context/OverlayContext";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import { useWallpaper } from "@/hooks/useWallpaper";

/** Formats a timestamp as clock parts. `ampm` is empty in 24h mode. */
export function clockParts(now: number, clock24: boolean): { time: string; ampm: string } {
  if (!now) return { time: "--:--", ampm: "" };
  const d = new Date(now);
  if (clock24) {
    return { time: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`, ampm: "" };
  }
  const h = d.getHours() % 12 || 12;
  return { time: `${h}:${String(d.getMinutes()).padStart(2, "0")}`, ampm: d.getHours() < 12 ? "AM" : "PM" };
}

export function BatteryGlyph({ level, charging, className }: { level: number; charging: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex items-center", className)}>
      <span className="relative inline-block h-[12px] w-[24px] rounded-[4px] p-[1.5px] shadow-[0_0_0_1px_currentColor] [--tw-shadow-color:currentColor]">
        <span
          className={cn("block h-full rounded-[2.5px]", level <= 20 && !charging ? "bg-red-500" : "bg-current")}
          style={{ width: `${Math.max(6, level)}%` }}
        />
        {charging && (
          <Zap className="absolute inset-0 m-auto h-[9px] w-[9px] fill-white text-neutral-900 mix-blend-normal" strokeWidth={2.5} />
        )}
      </span>
      <span className="ml-[1px] h-[4.5px] w-[1.5px] rounded-r-full bg-current opacity-60" />
    </span>
  );
}

function SignalBars() {
  return (
    <span aria-hidden="true" className="flex h-[11px] items-end gap-[2px]">
      {[4, 6, 8.5, 11].map((h, i) => (
        <span key={i} className="w-[3px] rounded-[1px] bg-current" style={{ height: h }} />
      ))}
    </span>
  );
}

/** iPhone-style status bar: time on the left, signal / Wi-Fi / battery cluster (opens Control Center) on the right. */
export function MobileStatusBar({ className }: { className?: string }) {
  const { prefs, battery } = useDesktop();
  const overlay = useOverlay();
  const now = useNow(1000);
  const tone = useWallpaper().tone;
  const { time } = clockParts(now, prefs.clock24);

  return (
    <div
      className={cn(
        "os-chrome relative z-20 flex h-11 shrink-0 items-center justify-between px-6 text-[15px] font-semibold",
        tone === "light" ? "text-neutral-900" : "text-white",
        className,
      )}
      style={{ paddingTop: "env(safe-area-inset-top)", height: "calc(2.75rem + env(safe-area-inset-top))" }}
    >
      <button
        type="button"
        aria-label={`${time}. Open notifications`}
        onClick={() => overlay.open({ type: "notificationCenter" })}
        className="-ml-2 min-h-9 rounded-full px-2 tabular-nums"
      >
        {time}
      </button>
      <button
        type="button"
        aria-label={`Open Control Center. Battery ${battery.level} percent${battery.charging ? ", charging" : ""}. Wi-Fi ${prefs.wifi ? "on" : "off"}.`}
        onClick={() => overlay.open({ type: "controlCenter" })}
        className="-mr-2 flex min-h-9 items-center gap-1.5 rounded-full px-2"
      >
        <SignalBars />
        {prefs.wifi ? <Wifi className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" /> : <WifiOff className="h-4 w-4 opacity-70" strokeWidth={2.5} aria-hidden="true" />}
        <span className="text-[12px] tabular-nums">{battery.level}%</span>
        <BatteryGlyph level={battery.level} charging={battery.charging} />
      </button>
    </div>
  );
}
