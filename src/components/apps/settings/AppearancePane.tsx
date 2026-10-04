"use client";

import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
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

  return (
    <div>
      <PaneTitle>Appearance</PaneTitle>

      <Group title="Theme">
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
                className="flex flex-col items-center gap-1.5 rounded-xl p-1.5 text-[12px] font-medium"
              >
                <span
                  aria-hidden="true"
                  className={cn("grid h-14 w-full place-items-center rounded-lg text-foreground/70 shadow-[0_0_0_0.5px_var(--border)] transition-shadow", on && "shadow-[0_0_0_2px_var(--accent)]")}
                  style={{ background: t.preview }}
                >
                  <t.icon className="size-5 text-[#8e8e93]" />
                </span>
                <span className={cn(on && "text-accent")}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Accent colour">
        <div role="radiogroup" aria-label="Accent colour" className="flex flex-wrap gap-3 py-3">
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
                className="grid size-9 place-items-center rounded-full"
              >
                <span className={cn("grid size-6 place-items-center rounded-full text-white shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)] transition-shadow", on && "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--foreground)]")} style={{ background: ACCENTS[id].swatch }}>
                  {on && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </Group>

      <section className="mb-5">
        <h3 className="mb-1.5 px-1 text-[12px] font-semibold text-muted">Wallpaper</h3>
        <div role="radiogroup" aria-label="Wallpaper" className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
          {wallpapers.map((w) => {
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
                  notify({ title: "Wallpaper changed", body: w.name, kind: "success", key: "wallpaper" });
                }}
                className="flex flex-col gap-1.5 text-left text-[12px] font-medium"
              >
                <span
                  aria-hidden="true"
                  className={cn("relative block aspect-video w-full rounded-lg shadow-[0_0_0_0.5px_var(--border)] transition-shadow", on && "shadow-[0_0_0_2.5px_var(--accent)]")}
                  style={{ background: w[resolved].background }}
                >
                  {on && <span className="absolute right-1.5 bottom-1.5 grid size-5 place-items-center rounded-full bg-accent text-accent-fg"><Check className="size-3" strokeWidth={3} /></span>}
                </span>
                <span className={cn("px-0.5", on && "text-accent")}>{w.name}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
