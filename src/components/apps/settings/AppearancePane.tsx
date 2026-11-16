"use client";

import { useState } from "react";
import { Check, Monitor, Moon, Sun, Sparkles, type LucideIcon } from "lucide-react";
import { useDesktop, type Theme } from "@/context/DesktopContext";
import { ACCENTS, useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";
import { wallpapers } from "@/data/wallpapers";
import { cn } from "@/lib/utils";
import { Group, PaneTitle } from "./controls";

const THEMES: { id: Theme; label: string; icon: LucideIcon; preview: string }[] = [
  { id: "light", label: "Light", icon: Sun, preview: "linear-gradient(160deg, #f7f7fa, #dcdce4)" },
  { id: "dark", label: "Dark", icon: Moon, preview: "linear-gradient(160deg, #3a3a42, #17171b)" },
  { id: "system", label: "System", icon: Monitor, preview: "linear-gradient(110deg, #f7f7fa 50%, #17171b 50%)" },
];

export function AppearancePane() {
  const { prefs, setPrefs } = useDesktop();
  const { theme, resolved, accent, setTheme, setAccent } = useTheme();
  const { notify } = useNotifications();
  const [filter, setFilter] = useState<"all" | "scenic" | "abstract">("all");

  const filteredWallpapers = wallpapers.filter((w) => {
    if (filter === "scenic") return w.id === "peaks";
    if (filter === "abstract") return w.id !== "peaks";
    return true;
  });

  return (
    <div>
      <PaneTitle>Appearance</PaneTitle>

      {/* Theme Picker */}
      <Group title="System Theme">
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3 py-3">
          {THEMES.map((t) => {
            const on = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(t.id)}
                className="group flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-[12px] font-medium transition-transform active:scale-95"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-14 w-full place-items-center rounded-xl text-foreground/70 shadow-[0_0_0_0.5px_var(--border)] transition-all group-hover:scale-102",
                    on && "shadow-[0_0_0_2px_var(--accent)] ring-2 ring-accent/30"
                  )}
                  style={{ background: t.preview }}
                >
                  <t.icon className="size-5 text-[#8e8e93]" />
                </span>
                <span className={cn(on ? "font-semibold text-accent" : "text-muted")}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </Group>

      {/* Accent Color Picker */}
      <Group title="Accent Colour">
        <div className="py-3">
          <div role="radiogroup" aria-label="Accent colour" className="flex flex-wrap gap-3">
            {(Object.keys(ACCENTS) as (keyof typeof ACCENTS)[]).map((id) => {
              const on = accent === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={ACCENTS[id].label}
                  title={ACCENTS[id].label}
                  onClick={() => setAccent(id)}
                  className="grid size-9 place-items-center rounded-full transition-transform active:scale-90"
                >
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-white shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)] transition-all hover:scale-110",
                      on &&
                        "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--foreground)] scale-110"
                    )}
                    style={{ background: ACCENTS[id].swatch }}
                  >
                    {on && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Preview of Accent */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-hover/60 p-2.5 text-[12px]">
            <span className="text-muted">Live Preview:</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 font-medium text-accent-fg text-[11px]">
              <Sparkles className="size-3" /> Active Badge
            </span>
            <span className="text-accent font-semibold underline underline-offset-2">
              Hyperlink
            </span>
          </div>
        </div>
      </Group>

      {/* Wallpaper Picker */}
      <section className="mb-5">
        <div className="mb-2 flex flex-col gap-2 px-1 @sm:flex-row @sm:items-center @sm:justify-between">
          <h3 className="text-[12px] font-semibold text-muted">Desktop Wallpaper</h3>
          <div className="flex flex-wrap gap-1 rounded-lg bg-hover p-0.5 text-[11.5px]">
            {(
              [
                { id: "all", label: "All" },
                { id: "abstract", label: "Dynamic & Gradients" },
                { id: "scenic", label: "Scenic Vector" },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                className={cn(
                  "rounded-md px-2 py-0.5 font-medium transition-colors",
                  filter === c.id
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted hover:text-foreground"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div role="radiogroup" aria-label="Wallpaper" className="grid grid-cols-1 gap-3 @xs:grid-cols-2">
          {filteredWallpapers.map((w) => {
            const on = prefs.wallpaperId === w.id;
            return (
              <button
                key={w.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  if (on) return;
                  setPrefs({ wallpaperId: w.id });
                  notify({
                    title: "Wallpaper changed",
                    body: w.name,
                    kind: "success",
                    key: "wallpaper",
                  });
                }}
                className="group flex flex-col gap-1.5 text-left text-[12px] font-medium"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative block aspect-video w-full overflow-hidden rounded-xl shadow-[0_0_0_0.5px_var(--border)] transition-all group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]",
                    on && "shadow-[0_0_0_2.5px_var(--accent)] ring-2 ring-accent/30"
                  )}
                  style={{ background: w[resolved].background }}
                >
                  {on && (
                    <span className="absolute right-2 bottom-2 grid size-5 place-items-center rounded-full bg-accent text-accent-fg shadow-md">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className={cn("px-0.5", on ? "font-semibold text-accent" : "text-foreground")}>
                  {w.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
