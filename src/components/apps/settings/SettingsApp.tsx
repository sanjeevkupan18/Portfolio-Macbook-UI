"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Bell, Dock, Hand, Info, Keyboard, Palette, type LucideIcon } from "lucide-react";
import type { AppProps } from "@/types/app";
import { cn } from "@/lib/utils";
import { useLaunch } from "@/hooks/useLaunch";
import { AppearancePane } from "./AppearancePane";
import { DockPane } from "./DockPane";
import { NotificationsPane } from "./NotificationsPane";
import { PrivacyPane } from "./PrivacyPane";
import { KeyboardPane } from "./KeyboardPane";
import { AboutPane } from "./AboutPane";

type PaneId = "appearance" | "dock" | "notifications" | "privacy" | "keyboard" | "about";

const PANES: { id: PaneId; label: string; icon: LucideIcon; color: string; render: () => ReactNode }[] = [
  { id: "appearance", label: "Appearance", icon: Palette, color: "#5e5ce6", render: () => <AppearancePane /> },
  { id: "dock", label: "Desktop & Dock", icon: Dock, color: "#0a84ff", render: () => <DockPane /> },
  { id: "notifications", label: "Notifications", icon: Bell, color: "#ff453a", render: () => <NotificationsPane /> },
  { id: "privacy", label: "Privacy", icon: Hand, color: "#30a14e", render: () => <PrivacyPane /> },
  { id: "keyboard", label: "Keyboard", icon: Keyboard, color: "#8e8e93", render: () => <KeyboardPane /> },
  { id: "about", label: "About", icon: Info, color: "#636366", render: () => <AboutPane /> },
];

const isPane = (s: string | undefined): s is PaneId => PANES.some((p) => p.id === s);

export function SettingsApp({ launch }: AppProps) {
  const [pane, setPane] = useState<PaneId>("appearance");
  /** Narrow layout only: true when the detail pane is pushed over the list. */
  const [pushed, setPushed] = useState(false);

  useLaunch(launch, (params) => {
    const s = params?.section === "wallpaper" ? "appearance" : params?.section;
    if (isPane(s)) {
      setPane(s);
      setPushed(true);
    }
  });

  const current = PANES.find((p) => p.id === pane) ?? PANES[0]!;

  return (
    <div className="@container flex h-full min-h-0 flex-row bg-background">
      <nav aria-label="Settings" className={cn("glass glass-sidebar mac-scroll min-h-0 w-full shrink-0 flex-col gap-0.5 border-border p-3 @2xl:flex @2xl:w-56 @2xl:border-r @2xl:p-2.5", pushed ? "hidden" : "flex")}>
        <h1 className="mb-2 px-1 text-[22px] font-semibold tracking-tight @2xl:sr-only">Settings</h1>
        <ul className="flex flex-col gap-0.5 max-@2xl:gap-px max-@2xl:overflow-hidden max-@2xl:rounded-xl max-@2xl:bg-surface max-@2xl:shadow-[0_0_0_0.5px_var(--border)]">
          {PANES.map((p) => {
            const on = pane === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPane(p.id);
                    setPushed(true);
                  }}
                  aria-current={on ? "page" : undefined}
                  className={cn("flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[14px] transition-colors @2xl:min-h-9 @2xl:text-[13px]", on ? "@2xl:bg-accent @2xl:text-accent-fg" : "hover:bg-hover")}
                >
                  <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-md text-white @2xl:size-6" style={{ background: p.color }}>
                    <p.icon className="size-4 @2xl:size-3.5" />
                  </span>
                  <span className="flex-1">{p.label}</span>
                  <ChevronRight className="size-4 text-muted @2xl:hidden" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <main className={cn("min-h-0 min-w-0 flex-1 flex-col @2xl:flex", pushed ? "flex" : "hidden")}>
        <div className="flex h-11 shrink-0 items-center border-b border-border px-2 @2xl:hidden">
          <button type="button" onClick={() => setPushed(false)} className="inline-flex min-h-9 items-center gap-0.5 rounded-lg px-2 text-[14px] text-accent hover:bg-hover">
            <ChevronLeft className="size-5" aria-hidden="true" /> Settings
          </button>
          <span className="flex-1 pr-16 text-center text-[14px] font-semibold">{current.label}</span>
        </div>
        <div className="mac-scroll min-h-0 flex-1">
          <div className="mx-auto max-w-2xl p-4 @lg:p-6">{current.render()}</div>
        </div>
      </main>
    </div>
  );
}
