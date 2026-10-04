"use client";

import { apps, appById } from "@/data/apps";
import { AppIcon } from "@/components/system/AppIcon";
import { useLauncher } from "@/context/LauncherContext";

/** Floating glass dock with the apps flagged `inMobileDock`. */
export function MobileDock() {
  const { openApp } = useLauncher();
  const dockApps = apps.filter((a) => a.inMobileDock);
  return (
    <nav
      aria-label="Dock"
      className="glass glass-dock os-chrome mx-4 flex items-center justify-around rounded-[32px] px-3 py-3"
      style={{ marginBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      {dockApps.map((a) => (
        <button
          key={a.id}
          type="button"
          aria-label={`Open ${appById[a.id].name}`}
          onClick={() => openApp(a.id)}
          className="rounded-[16px] transition-transform active:scale-90"
        >
          <AppIcon appId={a.id} size={58} className="shadow-[0_4px_12px_-4px_rgba(0,0,0,0.45)]" />
        </button>
      ))}
    </nav>
  );
}
