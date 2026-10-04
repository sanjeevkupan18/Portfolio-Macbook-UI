"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ControlCenter } from "@/components/control-center/ControlCenter";
import { NotificationCenterPanel, NotificationToasts } from "@/components/notifications/NotificationCenter";
import { Spotlight } from "@/components/spotlight/Spotlight";
import { SystemDialogs } from "@/components/system/SystemDialogs";
import { WindowManager } from "@/components/windows/WindowManager";
import { useDesktop } from "@/context/DesktopContext";
import { LauncherContext, type Launcher } from "@/context/LauncherContext";
import { useNotifications } from "@/context/NotificationContext";
import { useOverlay } from "@/context/OverlayContext";
import { useWindows } from "@/context/WindowContext";
import { portfolio } from "@/data/portfolio";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { storage } from "@/lib/storage";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import { DesktopIcons } from "./DesktopIcons";
import { DesktopWidgets } from "./DesktopWidgets";
import { Dock } from "./Dock";
import { item, separator } from "./MenuPanel";
import { MenuBar } from "./MenuBar";
import { Wallpaper } from "./Wallpaper";

/** The macOS-like desktop: wallpaper, menu bar, icons, widgets, windows, dock and system overlays. */
export function Desktop() {
  const wm = useWindows();
  const { openApp } = wm;
  const { prefs, setPrefs, refreshDesktop } = useDesktop();
  const { notify } = useNotifications();
  const { open } = useOverlay();
  const reduce = useReducedMotion();
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const launcher = useMemo<Launcher>(() => ({ openApp }), [openApp]);
  const welcomed = useRef(false);

  useGlobalShortcuts();

  // Welcome notification + first-visit Home window (once per mount, StrictMode-safe).
  useEffect(() => {
    if (welcomed.current) return;
    welcomed.current = true;
    notify({ title: "Welcome back!", body: `${portfolio.profile.name}'s portfolio is ready.`, key: "welcome" });
    if (!storage.get<boolean>("visited", false)) {
      storage.set("visited", true);
      if (!wm.windows.some((w) => w.isOpen)) openApp("home");
    }
  }, [notify, openApp, wm.windows]);

  const closeMenu = useCallback(() => setMenu(null), []);
  const newFolder = () => {
    const id = `f${Date.now()}`;
    setPrefs((p) => ({ folders: [...p.folders, { id, name: "untitled folder" }], showDesktopIcons: true }));
    setRenamingId(id);
  };

  return (
    <LauncherContext.Provider value={launcher}>
      <motion.div
        className="fixed inset-0 overflow-hidden text-foreground"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenu({
            x: e.clientX,
            y: e.clientY,
            label: "Desktop options",
            items: [
              item("New Folder", newFolder),
              separator,
              item("Get Info", () => open({ type: "about" })),
              item("Change Wallpaper…", () => openApp("settings", { section: "wallpaper" })),
              separator,
              item("Refresh", () => refreshDesktop()),
            ],
          });
        }}
      >
        <Wallpaper onPointerDown={() => wm.blurAll()} />
        <DesktopIcons renamingId={renamingId} setRenamingId={setRenamingId} onContextMenu={setMenu} />
        <DesktopWidgets />
        <WindowManager />
        <MenuBar />
        <Dock />
        <ControlCenter />
        <NotificationCenterPanel />
        <Spotlight />
        <SystemDialogs />
        <NotificationToasts />
        {menu && <ContextMenu menu={menu} onClose={closeMenu} />}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] bg-black" style={{ opacity: Math.max(0, (1 - prefs.brightness) * 0.65) }} />
      </motion.div>
    </LauncherContext.Provider>
  );
}
