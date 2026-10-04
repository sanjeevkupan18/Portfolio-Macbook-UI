"use client";

import { motion, useReducedMotion } from "motion/react";
import { Battery, BatteryCharging } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { SocialIcon } from "@/components/system/SocialIcon";
import { useDesktop } from "@/context/DesktopContext";
import { useLauncher } from "@/context/LauncherContext";
import { portfolio } from "@/data/portfolio";
import { useNow } from "@/hooks/useNow";
import { batteryStatusLabel } from "@/lib/battery";
import { cn } from "@/lib/utils";

const shell = "glass glass-widget os-chrome rounded-[22px] p-3.5 text-left text-foreground";

function Enter({ i, children, className }: { i: number; children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: reduce ? 0 : 0.08 * i, type: "spring", stiffness: 260, damping: 26 }}>
      {children}
    </motion.div>
  );
}

function DateWidget() {
  const now = useNow(60_000);
  const d = new Date(now);
  return (
    <div className={cn(shell, "flex h-full flex-col justify-between")} role="group" aria-label="Date">
      <p className="text-[12px] font-bold tracking-wide text-danger uppercase">{d.toLocaleDateString(undefined, { weekday: "long" })}</p>
      <p className="text-[44px] leading-none font-light tabular-nums">{String(d.getDate()).padStart(2, "0")}</p>
      <p className="text-[13px] text-muted">{d.toLocaleDateString(undefined, { month: "long" })}</p>
    </div>
  );
}

function ClockWidget() {
  const { prefs, setPrefs } = useDesktop();
  const now = useNow(1000);
  const d = new Date(now);
  const s = d.getSeconds();
  const m = d.getMinutes() + s / 60;
  const h = (d.getHours() % 12) + m / 60;
  const hand = (deg: number, len: number, w: number, color: string) => (
    <line x1="50" y1="50" x2="50" y2={50 - len} stroke={color} strokeWidth={w} strokeLinecap="round" transform={`rotate(${deg} 50 50)`} />
  );
  return (
    <button type="button" onClick={() => setPrefs({ clock24: !prefs.clock24 })} aria-label={`Clock ${d.toLocaleTimeString(undefined, { hour12: !prefs.clock24 })}. Switch to ${prefs.clock24 ? "12" : "24"}-hour format`} className={cn(shell, "flex h-full w-full flex-col items-center justify-between")}>
      <svg viewBox="0 0 100 100" className="size-[84px]" aria-hidden="true">
        <circle cx="50" cy="50" r="47" fill="color-mix(in srgb, var(--surface) 70%, transparent)" stroke="var(--border)" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1="50" y1="6" x2="50" y2={i % 3 === 0 ? 13 : 10} stroke="var(--muted)" strokeWidth={i % 3 === 0 ? 2 : 1} transform={`rotate(${i * 30} 50 50)`} />)}
        {hand(h * 30, 24, 3.2, "var(--foreground)")}
        {hand(m * 6, 34, 2.4, "var(--foreground)")}
        {hand(s * 6, 38, 1.2, "var(--danger)")}
        <circle cx="50" cy="50" r="2.6" fill="var(--danger)" />
      </svg>
      <span className="text-[13px] font-medium tabular-nums">{d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: !prefs.clock24 })}</span>
    </button>
  );
}

function BatteryWidget() {
  const { battery } = useDesktop();
  const Icon = battery.charging ? BatteryCharging : Battery;
  const low = battery.level <= 20 && !battery.charging;
  return (
    <div className={cn(shell, "flex h-full flex-col justify-between")} role="group" aria-label={`Battery ${battery.level} percent`}>
      <div className="flex items-center justify-between"><p className="text-[12px] font-semibold text-muted">Battery</p><Icon className="size-4 text-muted" aria-hidden="true" /></div>
      <p className="text-[34px] leading-none font-light tabular-nums">{battery.level}%</p>
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--foreground)_14%,transparent)]"><div className={cn("h-full rounded-full transition-[width] duration-700", low ? "bg-danger" : "bg-success")} style={{ width: `${battery.level}%` }} /></div>
        <p className="mt-1 text-[11px] text-muted">{batteryStatusLabel(battery)} · simulated</p>
      </div>
    </div>
  );
}

function ProfileWidget() {
  const { openApp } = useLauncher();
  const p = portfolio.profile;
  return (
    <button type="button" onClick={() => openApp("about")} aria-label={`${p.name}, ${p.role}. Open About`} className={cn(shell, "flex h-full w-full items-center gap-3 hover:brightness-105")}>
      <Avatar size={52} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold">{p.name}</span>
        <span className="block truncate text-[12px] font-medium text-accent">{p.role}</span>
        <span className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-muted">{p.shortBio}</span>
      </span>
    </button>
  );
}

function ProjectsWidget() {
  const { openApp } = useLauncher();
  const latest = portfolio.projects[0];
  return (
    <button type="button" onClick={() => openApp("projects", latest ? { projectId: latest.id } : undefined)} aria-label={`${portfolio.projects.length} projects. Latest: ${latest?.name ?? "none"}. Open Projects`} className={cn(shell, "flex h-full w-full flex-col justify-between hover:brightness-105")}>
      <div className="flex items-center justify-between"><p className="text-[12px] font-semibold text-muted">Projects</p><SocialIcon id="github" className="size-4 text-muted" /></div>
      <p className="text-[34px] leading-none font-light tabular-nums">{portfolio.projects.length}</p>
      <p className="truncate text-[11px] text-muted">Latest: <span className="font-medium text-foreground">{latest?.name}</span></p>
    </button>
  );
}

/** Desktop widgets (top-right). Hidden below 1024px where windows need the room. */
export function DesktopWidgets() {
  const { prefs, workArea, refreshKey } = useDesktop();
  if (!prefs.showWidgets) return null;
  const w = prefs.widgets;
  return (
    <section key={refreshKey} aria-label="Widgets" className="absolute z-10 grid w-[312px] grid-cols-2 auto-rows-[148px] gap-3 max-lg:hidden" style={{ top: workArea.top + 12, right: workArea.right + 16 }}>
      {w.date && <Enter i={0}><DateWidget /></Enter>}
      {w.clock && <Enter i={1}><ClockWidget /></Enter>}
      {w.battery && <Enter i={2}><BatteryWidget /></Enter>}
      {w.projects && <Enter i={3}><ProjectsWidget /></Enter>}
      {w.profile && <Enter i={4} className="col-span-2 !h-[100px]"><ProfileWidget /></Enter>}
    </section>
  );
}
