"use client";

import { useEffect, useRef } from "react";
import { FolderOpen, Search } from "lucide-react";
import { AppIcon } from "@/components/system/AppIcon";
import { Avatar } from "@/components/ui/Avatar";
import { useDesktop } from "@/context/DesktopContext";
import { useLauncher } from "@/context/LauncherContext";
import { useNotifications } from "@/context/NotificationContext";
import { useOverlay } from "@/context/OverlayContext";
import { apps } from "@/data/apps";
import { portfolio } from "@/data/portfolio";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import { MobileDock } from "./MobileDock";
import { MobileStatusBar, BatteryGlyph, clockParts } from "./MobileStatusBar";
import { MobileWallpaper } from "./MobileWallpaper";
import { useWallpaper } from "@/hooks/useWallpaper";

const widgetBase = "glass glass-widget flex min-h-[112px] flex-col rounded-[22px] p-3.5 text-left text-foreground";

function DateWidget({ now }: { now: number }) {
  const d = now ? new Date(now) : null;
  return (
    <div className={widgetBase} role="group" aria-label="Date">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-danger">{d ? d.toLocaleDateString(undefined, { weekday: "long" }) : " "}</span>
      <span className="mt-0.5 text-[44px] font-light leading-none tabular-nums">{d ? d.getDate() : "--"}</span>
      <span className="mt-auto text-[12px] text-muted">{d ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : " "}</span>
    </div>
  );
}

function ClockWidget({ now, clock24 }: { now: number; clock24: boolean }) {
  const { time, ampm } = clockParts(now, clock24);
  return (
    <div className={widgetBase} role="group" aria-label="Clock">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Clock</span>
      <span className="mt-1 text-[38px] font-light leading-none tabular-nums">{time}</span>
      <span className="mt-auto text-[12px] text-muted">{ampm || "24-hour"}</span>
    </div>
  );
}

function BatteryWidget({ level, charging }: { level: number; charging: boolean }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className={widgetBase} role="group" aria-label={`Battery ${level} percent${charging ? ", charging" : ""}`}>
      <span className="text-[12px] font-semibold uppercase tracking-wide text-muted">Battery</span>
      <div className="mt-auto flex items-center gap-3">
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="7" />
          <circle
            cx="32" cy="32" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
            className={level <= 20 && !charging ? "stroke-danger" : "stroke-success"}
            strokeDasharray={c} strokeDashoffset={c * (1 - level / 100)} transform="rotate(-90 32 32)"
          />
          <text x="32" y="36" textAnchor="middle" className="fill-current text-[14px] font-semibold">{level}</text>
        </svg>
        <div className="flex flex-col gap-1 text-[12px] text-muted">
          <BatteryGlyph level={level} charging={charging} className="text-foreground" />
          <span>{charging ? "Charging" : "On battery"}</span>
        </div>
      </div>
    </div>
  );
}

export function MobileHome() {
  const { prefs, battery } = useDesktop();
  const { openApp } = useLauncher();
  const overlay = useOverlay();
  const { notify } = useNotifications();
  const now = useNow(1000);
  const tone = useWallpaper().tone;
  const welcomed = useRef(false);

  useEffect(() => {
    if (welcomed.current) return;
    welcomed.current = true;
    notify({ title: "Welcome back!", body: `Great to see you, nice to have you here.`, key: "welcome", kind: "success", appId: "about" });
  }, [notify]);

  const w = prefs.widgets;
  const showWidgets = prefs.showWidgets;
  const projects = portfolio.projects;
  const latest = projects[0];
  const labelColor = tone === "light" ? "text-neutral-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.4)]" : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]";

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <MobileWallpaper />
      <MobileStatusBar />

      <div className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        {showWidgets && (
          <section aria-label="Widgets" className="grid grid-cols-2 gap-3">
            {w.date && <DateWidget now={now} />}
            {w.clock && <ClockWidget now={now} clock24={prefs.clock24} />}
            {w.battery && <BatteryWidget level={battery.level} charging={battery.charging} />}
            {w.projects && (
              <button type="button" onClick={() => openApp("projects")} aria-label={`Projects: ${projects.length} total. Open Projects`} className={cn(widgetBase, "active:scale-[0.98] transition-transform")}>
                <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-muted">
                  <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" /> Projects
                </span>
                <span className="mt-1 text-[38px] font-light leading-none tabular-nums">{projects.length}</span>
                {latest && <span className="mt-auto line-clamp-2 text-[12px] font-medium leading-tight">{latest.name}</span>}
              </button>
            )}
            {w.profile && (
              <button type="button" onClick={() => openApp("about")} aria-label={`${portfolio.profile.name}, ${portfolio.profile.role}. Open About`} className={cn(widgetBase, "col-span-2 flex-row items-center gap-3 active:scale-[0.99] transition-transform")}>
                <Avatar size={52} />
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold">{portfolio.profile.name}</span>
                  <span className="block truncate text-[13px] text-muted">{portfolio.profile.role}</span>
                  <span className="block truncate text-[12px] text-muted">{portfolio.profile.location}</span>
                </span>
              </button>
            )}
          </section>
        )}

        <section aria-label="Apps" className="mt-6 grid grid-cols-4 gap-x-2 gap-y-5">
          {apps.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => openApp(a.id)}
              aria-label={`Open ${a.name}`}
              className="os-chrome group flex flex-col items-center gap-1.5 rounded-xl py-0.5"
            >
              <span className="block h-[60px] w-[60px] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5)] transition-transform group-active:scale-90" style={{ borderRadius: 13.5 }}>
                <AppIcon appId={a.id} />
              </span>
              <span className={cn("max-w-full truncate text-[11.5px] font-medium leading-none", labelColor)}>{a.name}</span>
            </button>
          ))}
        </section>
      </div>

      <div className="relative z-10 flex shrink-0 flex-col">
        <button
          type="button"
          onClick={() => overlay.open({ type: "spotlight" })}
          aria-label="Search"
          className="glass glass-dock os-chrome mx-auto mb-3 flex min-h-9 items-center gap-1.5 rounded-full px-5 text-[13px] font-medium text-foreground"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" /> Search
        </button>
        <MobileDock />
      </div>
    </div>
  );
}
