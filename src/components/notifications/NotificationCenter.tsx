"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { AppIcon } from "@/components/system/AppIcon";
import { useLauncher } from "@/context/LauncherContext";
import { useNotifications, type AppNotification } from "@/context/NotificationContext";
import { useOverlay } from "@/context/OverlayContext";
import { appById } from "@/data/apps";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useNow } from "@/hooks/useNow";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/lib/utils";

function KindIcon({ n }: { n: AppNotification }) {
  if (n.appId) return <AppIcon appId={n.appId} size={36} />;
  const cls = "size-5";
  const Icon = n.kind === "success" ? CheckCircle2 : n.kind === "error" ? AlertCircle : Info;
  const tone = n.kind === "success" ? "text-success" : n.kind === "error" ? "text-danger" : "text-accent";
  return <span aria-hidden="true" className={cn("grid size-9 shrink-0 place-items-center rounded-[9px] bg-surface-2 shadow-[0_0_0_0.5px_var(--border)]", tone)}><Icon className={cls} /></span>;
}

function relative(ms: number, now: number): string {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 10) return "now";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

/** Top-right macOS-style banners (top-center on phones). */
export function NotificationToasts() {
  const { toasts, dismiss } = useNotifications();
  const { openApp } = useLauncher();
  const mobile = useIsMobile();
  const reduce = useReducedMotion();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cn("pointer-events-none fixed z-[1400] flex flex-col gap-2", mobile ? "inset-x-3 top-[calc(env(safe-area-inset-top)+8px)]" : "top-9 right-3 w-[340px]")}
    >
      <AnimatePresence initial={false}>
        {toasts.map((n) => (
          <motion.div
            key={n.id}
            layout={!reduce}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 60, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            role={n.kind === "error" ? "alert" : "status"}
            className="glass glass-panel os-chrome pointer-events-auto group relative flex items-start gap-3 rounded-2xl p-3 pr-9"
          >
            <KindIcon n={n} />
            <button
              type="button"
              disabled={!n.appId}
              onClick={() => { if (n.appId) { openApp(n.appId); dismiss(n.id); } }}
              className="min-w-0 flex-1 text-left disabled:cursor-default"
              aria-label={n.appId ? `${n.title}. Open ${appById[n.appId].name}` : undefined}
            >
              <span className="block truncate text-[13px] font-semibold">{n.title}</span>
              {n.body && <span className="mt-0.5 line-clamp-2 block text-[12px] text-muted">{n.body}</span>}
            </button>
            <button type="button" onClick={() => dismiss(n.id)} aria-label={`Dismiss notification: ${n.title}`} className="absolute top-2 right-2 grid size-6 place-items-center rounded-full text-muted opacity-70 hover:bg-hover hover:opacity-100 focus-visible:opacity-100">
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function MonthCalendar({ now }: { now: number }) {
  const d = new Date(now);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array.from({ length: first }, () => 0), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <section aria-label="Calendar" className="rounded-2xl bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] p-3 shadow-[0_0_0_0.5px_var(--border)]">
      <p className="mb-1.5 text-[13px] font-semibold">{d.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]" role="grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((w, i) => <span key={i} className="text-muted" role="columnheader">{w}</span>)}
        {cells.map((c, i) => (
          <span key={i} role="gridcell" aria-current={c === d.getDate() ? "date" : undefined} className={cn("mx-auto grid size-6 place-items-center rounded-full", c === d.getDate() && "bg-accent font-semibold text-accent-fg")}>{c || ""}</span>
        ))}
      </div>
    </section>
  );
}

/** History panel opened from the menu-bar clock. */
export function NotificationCenterPanel() {
  const { overlay, close } = useOverlay();
  const { history, clearHistory } = useNotifications();
  const { openApp } = useLauncher();
  const reduce = useReducedMotion();
  const now = useNow(30_000);
  const ref = useRef<HTMLDivElement>(null);
  const open = overlay?.type === "notificationCenter";
  useOutsideClick(ref, (e) => {
    if (!(e.target as Element).closest("[data-overlay-trigger]")) close();
  }, open);
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          ref={ref}
          aria-label="Notification Center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: 30 }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="glass glass-panel os-chrome fixed top-8 right-2 bottom-2 z-[1500] flex w-[360px] max-w-[calc(100vw-16px)] flex-col gap-3 rounded-3xl p-3"
        >
          <MonthCalendar now={now} />
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[14px] font-semibold">Notifications</h2>
            <button type="button" onClick={clearHistory} disabled={history.length === 0} className="rounded-md px-2 py-0.5 text-[12px] text-accent hover:bg-hover disabled:text-muted disabled:opacity-60">Clear All</button>
          </div>
          <ul className="mac-scroll min-h-0 flex-1 space-y-2">
            {history.length === 0 && <li className="grid h-full place-items-center py-10 text-[13px] text-muted">No Notifications</li>}
            {history.map((n) => (
              <li key={n.id} className="flex items-start gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] p-3 shadow-[0_0_0_0.5px_var(--border)]">
                <KindIcon n={n} />
                <button type="button" disabled={!n.appId} onClick={() => { if (n.appId) { close(); openApp(n.appId); } }} className="min-w-0 flex-1 text-left disabled:cursor-default">
                  <span className="flex items-baseline justify-between gap-2"><span className="truncate text-[13px] font-semibold">{n.title}</span><span className="shrink-0 text-[11px] text-muted">{relative(n.createdAt, now)}</span></span>
                  {n.body && <span className="mt-0.5 block text-[12px] text-muted">{n.body}</span>}
                </button>
              </li>
            ))}
          </ul>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
