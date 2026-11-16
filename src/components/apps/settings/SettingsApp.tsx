"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Battery,
  Bell,
  Dock,
  Hand,
  Info,
  Keyboard,
  Monitor,
  Palette,
  Search,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { AppProps } from "@/types/app";
import { portfolio } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { useLaunch } from "@/hooks/useLaunch";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { AppearancePane } from "./AppearancePane";
import { DockPane } from "./DockPane";
import { DisplaysPane } from "./DisplaysPane";
import { SoundPane } from "./SoundPane";
import { BatteryPane } from "./BatteryPane";
import { NotificationsPane } from "./NotificationsPane";
import { PrivacyPane } from "./PrivacyPane";
import { KeyboardPane } from "./KeyboardPane";
import { AboutPane } from "./AboutPane";

export type PaneId =
  | "appearance"
  | "dock"
  | "displays"
  | "sound"
  | "battery"
  | "notifications"
  | "privacy"
  | "keyboard"
  | "about";

interface PaneConfig {
  id: PaneId;
  label: string;
  icon: LucideIcon;
  color: string;
  section: "Personalization" | "Hardware & Signals" | "System & Security";
  keywords: string;
  render: () => ReactNode;
}

const PANES: PaneConfig[] = [
  // Personalization
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    color: "#5e5ce6",
    section: "Personalization",
    keywords: "theme dark light system accent colour color wallpaper background",
    render: () => <AppearancePane />,
  },
  {
    id: "dock",
    label: "Desktop & Dock",
    icon: Dock,
    color: "#0a84ff",
    section: "Personalization",
    keywords: "dock size magnification auto hide desktop icons widgets clock 24 hour",
    render: () => <DockPane />,
  },

  // Hardware & Signals
  {
    id: "displays",
    label: "Displays",
    icon: Monitor,
    color: "#30b0c7",
    section: "Hardware & Signals",
    keywords: "displays monitor brightness screen true tone night shift resolution retina scale promotion",
    render: () => <DisplaysPane />,
  },
  {
    id: "sound",
    label: "Sound",
    icon: Volume2,
    color: "#ff9f0a",
    section: "Hardware & Signals",
    keywords: "sound audio volume mute effects alert chime speaker ping boop submarine glass",
    render: () => <SoundPane />,
  },
  {
    id: "battery",
    label: "Battery",
    icon: Battery,
    color: "#34c759",
    section: "Hardware & Signals",
    keywords: "battery power charging energy health low power mode percentage runtime ac adapter",
    render: () => <BatteryPane />,
  },

  // System & Security
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    color: "#ff453a",
    section: "System & Security",
    keywords: "notifications banners alerts sound test focus",
    render: () => <NotificationsPane />,
  },
  {
    id: "keyboard",
    label: "Keyboard",
    icon: Keyboard,
    color: "#8e8e93",
    section: "System & Security",
    keywords: "keyboard shortcuts hotkeys keys tester command option ctrl esc spotlight",
    render: () => <KeyboardPane />,
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    icon: Hand,
    color: "#30a14e",
    section: "System & Security",
    keywords: "privacy data reset local storage clear messages cookies session",
    render: () => <PrivacyPane />,
  },
  {
    id: "about",
    label: "About",
    icon: Info,
    color: "#636366",
    section: "System & Security",
    keywords: "about mac specs apple silicon m3 max memory storage cpu nextjs react version serial sanjeev",
    render: () => <AboutPane />,
  },
];

const isPane = (s: string | undefined): s is PaneId => PANES.some((p) => p.id === s);

const SECTIONS: ("Personalization" | "Hardware & Signals" | "System & Security")[] = [
  "Personalization",
  "Hardware & Signals",
  "System & Security",
];

export function SettingsApp({ launch }: AppProps) {
  const reduced = usePrefersReducedMotion();
  const [pane, setPane] = useState<PaneId>("appearance");
  const [search, setSearch] = useState("");
  /** Narrow layout only: true when the detail pane is pushed over the list. */
  const [pushed, setPushed] = useState(false);

  // Mobile history navigation: allow hardware back button to return to settings menu
  useEffect(() => {
    if (!pushed) return;
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches) return;
    let popped = false;
    window.history.pushState({ type: "settings-pane", paneId: pane }, "");

    const onPopState = () => {
      popped = true;
      setPushed(false);
    };

    window.addEventListener("popstate", onPopState, { once: true });
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (!popped && window.history.state?.type === "settings-pane") {
        window.history.back();
      }
    };
  }, [pushed, pane]);

  useLaunch(launch, (params) => {
    const s = params?.section === "wallpaper" ? "appearance" : params?.section;
    if (isPane(s)) {
      setPane(s);
      setPushed(true);
    }
  });

  const filteredPanes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PANES;
    return PANES.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.keywords.toLowerCase().includes(q)
    );
  }, [search]);

  const current = PANES.find((p) => p.id === pane) ?? PANES[0]!;

  return (
    <div className="@container flex h-full min-h-0 flex-row bg-background">
      <nav
        aria-label="Settings"
        className={cn(
          "glass glass-sidebar mac-scroll min-h-0 w-full shrink-0 flex-col border-border p-3 @2xl:flex @2xl:w-64 @2xl:border-r @2xl:p-3",
          pushed ? "hidden" : "flex"
        )}
      >
        {/* macOS Apple Account Profile Header */}
        <button
          type="button"
          onClick={() => {
            setPane("about");
            setPushed(true);
          }}
          className="mb-3 flex w-full items-center gap-3 rounded-xl bg-surface/70 p-2.5 text-left shadow-[0_0_0_0.5px_var(--border)] transition-all hover:bg-hover hover:shadow-xs active:scale-98"
        >
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-border shadow-xs">
            <Avatar size={44} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {portfolio.profile.name}
            </p>
            <p className="truncate text-[11px] text-muted">
              Apple Account · Dev Station
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
        </button>

        {/* Live Search Input */}
        <div className="relative mb-3">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search settings…"
            className="h-8 w-full rounded-lg bg-surface/80 pl-8 pr-7 text-[12.5px] text-foreground placeholder:text-muted/70 shadow-[0_0_0_0.5px_var(--border)] outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--accent)]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Settings Navigation Sections */}
        <div className="flex flex-col gap-3">
          {SECTIONS.map((sectionName) => {
            const sectionPanes = filteredPanes.filter((p) => p.section === sectionName);
            if (sectionPanes.length === 0) return null;

            return (
              <div key={sectionName}>
                <h2 className="mb-1 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted/80">
                  {sectionName}
                </h2>
                <ul className="flex flex-col gap-0.5 overflow-hidden rounded-xl bg-surface/50 shadow-[0_0_0_0.5px_var(--border)] @2xl:bg-transparent @2xl:shadow-none">
                  {sectionPanes.map((p) => {
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
                          className={cn(
                            "relative flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13.5px] transition-colors @2xl:min-h-8.5 @2xl:text-[13px]",
                            on ? "@2xl:text-accent-fg" : "hover:bg-hover text-foreground"
                          )}
                        >
                          {on && (
                            <motion.div
                              layoutId="settings-active"
                              className="absolute inset-0 hidden rounded-lg bg-accent shadow-xs @2xl:block"
                              transition={
                                reduced
                                  ? { duration: 0 }
                                  : { type: "spring", stiffness: 420, damping: 32 }
                              }
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className="relative z-10 grid size-6 shrink-0 place-items-center rounded-md text-white shadow-xs"
                            style={{ background: p.color }}
                          >
                            <p.icon className="size-3.5" />
                          </span>
                          <span className="relative z-10 flex-1 font-medium truncate">
                            {p.label}
                          </span>
                          <ChevronRight
                            className="relative z-10 size-4 text-muted @2xl:hidden"
                            aria-hidden="true"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          {filteredPanes.length === 0 && (
            <div className="px-3 py-6 text-center text-[12px] text-muted">
              No settings found for &quot;{search}&quot;.
            </div>
          )}
        </div>
      </nav>

      {/* Main Detail Area */}
      <main
        className={cn(
          "min-h-0 min-w-0 flex-1 flex-col @2xl:flex",
          pushed ? "flex" : "hidden"
        )}
      >
        <div className="flex h-11 shrink-0 items-center border-b border-border px-2 @2xl:hidden">
          <button
            type="button"
            onClick={() => setPushed(false)}
            className="inline-flex min-h-9 items-center gap-0.5 rounded-lg px-2 text-[14px] font-medium text-accent hover:bg-hover"
          >
            <ChevronLeft className="size-5" aria-hidden="true" /> Settings
          </button>
          <span className="flex-1 pr-16 text-center text-[14px] font-semibold text-foreground">
            {current.label}
          </span>
        </div>
        <div className="mac-scroll min-h-0 flex-1">
          <div className="mx-auto max-w-2xl p-4 @lg:p-6">{current.render()}</div>
        </div>
      </main>
    </div>
  );
}
