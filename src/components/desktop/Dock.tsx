"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { AppIcon } from "@/components/system/AppIcon";
import { WindowPreview } from "@/components/windows/WindowPreview";
import { useDesktop, type DockPosition } from "@/context/DesktopContext";
import { useLauncher } from "@/context/LauncherContext";
import { useWindows } from "@/context/WindowContext";
import { apps, appById } from "@/data/apps";
import { registerDockIcon } from "@/lib/dockRegistry";
import { cn } from "@/lib/utils";
import type { AppId } from "@/types/app";
import { ContextMenu, type ContextMenuState } from "./ContextMenu";
import { item, separator } from "./MenuPanel";

const MAX_SCALE = 1.75;
const RANGE = 140;

interface DockIconProps {
  appId: AppId;
  base: number;
  magnify: boolean;
  position: DockPosition;
  pointer: MotionValue<number>;
  onContext: (e: React.MouseEvent, appId: AppId) => void;
}

function DockIcon({ appId, base, magnify, position, pointer, onContext }: DockIconProps) {
  const wm = useWindows();
  const { openApp } = useLauncher();
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const [bounce, setBounce] = useState(0);
  const horizontal = position === "bottom";
  const win = wm.windows.find((w) => w.appId === appId && w.isOpen);

  const distance = useTransform(pointer, (v) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !Number.isFinite(v)) return Infinity;
    return v - (horizontal ? r.left + r.width / 2 : r.top + r.height / 2);
  });
  const target = useTransform(distance, [-RANGE, 0, RANGE], [base, magnify ? base * MAX_SCALE : base, base]);
  const size = useSpring(target, { mass: 0.1, stiffness: 190, damping: 14 });

  useEffect(() => {
    registerDockIcon(appId, ref.current);
    return () => registerDockIcon(appId, null);
  }, [appId]);

  const app = appById[appId];
  const tipPos = position === "bottom" ? "bottom-full mb-7 left-1/2 -translate-x-1/2" : position === "left" ? "left-full ml-3 top-1/2 -translate-y-1/2" : "right-full mr-3 top-1/2 -translate-y-1/2";
  const dotPos = position === "bottom" ? "-bottom-1.5 left-1/2 -translate-x-1/2" : position === "left" ? "-left-1.5 top-1/2 -translate-y-1/2" : "-right-1.5 top-1/2 -translate-y-1/2";

  return (
    <motion.div
      className={cn("relative flex", horizontal ? "items-end justify-center" : position === "left" ? "items-center justify-start" : "items-center justify-end")}
      style={horizontal ? { width: size, height: base } : { width: base, height: size }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)} onPointerLeave={() => setHover(false)}>
      <motion.button
        ref={ref}
        type="button"
        aria-label={win ? (win.isMinimized ? `${app.name} (minimized) — restore` : `Focus ${app.name}`) : `Open ${app.name}`}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => {
          if (!win) {
            setBounce((n) => n + 1);
            setTimeout(() => setBounce(0), 1000);
          }
          openApp(appId);
        }}
        onContextMenu={(e) => onContext(e, appId)}
        animate={bounce ? (horizontal ? { y: [0, -20, 0, -12, 0] } : { x: [0, position === "left" ? 16 : -16, 0] }) : { y: 0, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ width: size, height: size }}
        className="rounded-[22%] outline-offset-4 transition-[filter] active:brightness-90"
      >
        <AppIcon appId={appId} />
      </motion.button>
      {win && <span aria-hidden="true" className={cn("absolute size-1 rounded-full bg-foreground/80", win.isMinimized && "opacity-50", dotPos)} />}
      {hover && (
        <div className={cn("pointer-events-none absolute z-10", tipPos)}>
          {win ? <WindowPreview appId={appId} win={win} /> : <div className="glass glass-panel rounded-lg px-2.5 py-1 text-[12px] font-medium whitespace-nowrap">{app.name}</div>}
        </div>
      )}
    </motion.div>
  );
}

/** Floating glass dock with spring magnification, indicators, previews and context menus. */
export function Dock() {
  const { prefs } = useDesktop();
  const wm = useWindows();
  const { openApp } = useLauncher();
  const { dockPosition: position, dockSize: base, autoHideDock } = prefs;
  const horizontal = position === "bottom";
  const pointer = useMotionValue(Infinity);
  const [revealed, setRevealed] = useState(false);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hidden = autoHideDock && !revealed && !menu;

  useEffect(() => () => clearTimeout(hideTimer.current), []);
  const reveal = () => {
    clearTimeout(hideTimer.current);
    setRevealed(true);
  };
  const scheduleHide = () => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setRevealed(false), 450);
  };

  const onContext = useCallback(
    (e: React.MouseEvent, appId: AppId) => {
      e.preventDefault();
      const win = wm.windows.find((w) => w.appId === appId && w.isOpen);
      setMenu({
        x: e.clientX,
        y: e.clientY - (horizontal ? 110 : 0),
        label: `${appById[appId].name} options`,
        items: [
          { type: "header", label: appById[appId].name },
          item(win ? (win.isMinimized ? "Show" : "Bring to Front") : "Open", () => openApp(appId)),
          ...(win ? [item(win.isMinimized ? "Restore" : "Minimize", () => (win.isMinimized ? wm.restoreWindow(win.id) : wm.minimizeWindow(win.id))), separator, item("Quit", () => wm.closeWindow(win.id))] : []),
        ],
      });
    },
    [wm, openApp, horizontal],
  );

  const place: CSSProperties = horizontal ? { bottom: 8, left: 0, right: 0, justifyContent: "center" } : position === "left" ? { left: 8, top: 28, bottom: 0, alignItems: "center" } : { right: 8, top: 28, bottom: 0, alignItems: "center" };
  const hideTo = horizontal ? { y: base + 60 } : { x: position === "left" ? -(base + 60) : base + 60 };

  return (
    <>
      {autoHideDock && (
        <div aria-hidden="true" className={cn("fixed z-[899]", horizontal ? "inset-x-0 bottom-0 h-1.5" : position === "left" ? "inset-y-0 left-0 w-1.5" : "inset-y-0 right-0 w-1.5")} onPointerEnter={reveal} />
      )}
      <div className="pointer-events-none fixed z-[900] flex" style={place}>
        <motion.nav
          aria-label="Dock"
          role="toolbar"
          aria-orientation={horizontal ? "horizontal" : "vertical"}
          onPointerEnter={reveal}
          onPointerMove={(e) => e.pointerType === "mouse" && pointer.set(horizontal ? e.clientX : e.clientY)}
          onPointerLeave={() => {
            pointer.set(Infinity);
            if (autoHideDock) scheduleHide();
          }}
          onFocus={reveal}
          onBlur={(e) => autoHideDock && !e.currentTarget.contains(e.relatedTarget) && scheduleHide()}
          animate={hidden ? { ...hideTo, opacity: 0 } : { x: 0, y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          style={{ "--kbd-glow": prefs.keyboardBrightness / 100 } as CSSProperties}
          className={cn("glass glass-dock pointer-events-auto flex items-end gap-1.5 rounded-[22px] p-2", !horizontal && "flex-col items-center", hidden && "pointer-events-none")}
          inert={hidden ? true : undefined}
        >
          {apps.filter((a) => a.inDock).map((a) => (
            <DockIcon key={a.id} appId={a.id} base={base} magnify={prefs.dockMagnification} position={position} pointer={pointer} onContext={onContext} />
          ))}
        </motion.nav>
      </div>
      {menu && <ContextMenu menu={menu} onClose={() => setMenu(null)} />}
    </>
  );
}
