"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { motion, type Variants } from "motion/react";
import { appComponents } from "@/components/apps/registry";
import { MENUBAR_HEIGHT, useDesktop } from "@/context/DesktopContext";
import { useWindows } from "@/context/WindowContext";
import { appById } from "@/data/apps";
import { getDockIconRect } from "@/lib/dockRegistry";
import { clamp } from "@/lib/utils";
import type { WindowState } from "@/types/window";
import { WindowHeader } from "./WindowHeader";

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const EDGES: { edge: Edge; cls: string; cursor: string }[] = [
  { edge: "n", cls: "top-0 left-3 right-3 h-1.5", cursor: "ns-resize" },
  { edge: "s", cls: "bottom-0 left-3 right-3 h-1.5", cursor: "ns-resize" },
  { edge: "e", cls: "right-0 top-3 bottom-3 w-1.5", cursor: "ew-resize" },
  { edge: "w", cls: "left-0 top-3 bottom-3 w-1.5", cursor: "ew-resize" },
  { edge: "ne", cls: "top-0 right-0 size-3", cursor: "nesw-resize" },
  { edge: "nw", cls: "top-0 left-0 size-3", cursor: "nwse-resize" },
  { edge: "se", cls: "bottom-0 right-0 size-3", cursor: "nwse-resize" },
  { edge: "sw", cls: "bottom-0 left-0 size-3", cursor: "nesw-resize" },
];

function setBodySelect(on: boolean) {
  document.body.style.userSelect = on ? "none" : "";
}

interface MinCtx { appId: WindowState["appId"]; cx: number; cy: number }

const variants: Variants = {
  // Flies to / from the app's dock icon (falls back to a soft scale when the icon isn't found).
  min: ({ appId, cx, cy }: MinCtx) => {
    const r = getDockIconRect(appId);
    return { opacity: 0, scale: 0.12, x: r ? r.x + r.width / 2 - cx : 0, y: r ? r.y + r.height / 2 - cy : 80, transitionEnd: { visibility: "hidden" as const } };
  },
  show: { opacity: 1, scale: 1, x: 0, y: 0, visibility: "visible" as const },
};

export function Window({ win }: { win: WindowState }) {
  const wm = useWindows();
  const { workArea } = useDesktop();
  const def = appById[win.appId];
  const App = appComponents[win.appId];
  const active = wm.activeId === win.id;
  const shellRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const prevMax = useRef(win.isMaximized);
  const animTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Take keyboard focus when launched / re-launched so keyboard users land in the window.
  useEffect(() => {
    if (win.launch.nonce > 0) shellRef.current?.focus({ preventScroll: true });
  }, [win.launch.nonce]);

  // Briefly enable bounds transitions for maximize/restore (never while dragging).
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    if (prevMax.current !== win.isMaximized) {
      prevMax.current = win.isMaximized;
      el.classList.add("win-animating");
      clearTimeout(animTimer.current);
      animTimer.current = setTimeout(() => el.classList.remove("win-animating"), 320);
    }
    return () => clearTimeout(animTimer.current);
  }, [win.isMaximized]);

  const bounds = win.isMaximized
    ? { left: workArea.left, top: workArea.top, width: `calc(100% - ${workArea.left + workArea.right}px)`, height: `calc(100% - ${workArea.top + workArea.bottom}px)` }
    : { left: win.position.x, top: win.position.y, width: win.size.width, height: win.size.height };

  const setInteracting = (on: boolean) => {
    if (bodyRef.current) bodyRef.current.style.pointerEvents = on ? "none" : "";
    setBodySelect(on);
  };

  const startDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || win.isMaximized || !shellRef.current) return;
    const el = shellRef.current;
    const header = e.currentTarget;
    header.setPointerCapture(e.pointerId);
    const start = { px: e.clientX, py: e.clientY, x: win.position.x, y: win.position.y };
    let next = { x: start.x, y: start.y };
    setInteracting(true);
    const move = (ev: globalThis.PointerEvent) => {
      next = {
        x: clamp(start.x + ev.clientX - start.px, 120 - win.size.width, window.innerWidth - 120),
        y: clamp(start.y + ev.clientY - start.py, MENUBAR_HEIGHT, window.innerHeight - 48),
      };
      el.style.left = `${next.x}px`;
      el.style.top = `${next.y}px`;
    };
    const up = () => {
      header.removeEventListener("pointermove", move);
      header.removeEventListener("pointerup", up);
      header.removeEventListener("pointercancel", up);
      setInteracting(false);
      wm.moveWindow(win.id, next);
    };
    header.addEventListener("pointermove", move);
    header.addEventListener("pointerup", up);
    header.addEventListener("pointercancel", up);
  };

  const startResize = (edge: Edge) => (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !shellRef.current) return;
    e.stopPropagation();
    const el = shellRef.current;
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const s = { px: e.clientX, py: e.clientY, ...win.position, ...win.size };
    let next = { x: s.x, y: s.y, width: s.width, height: s.height };
    setInteracting(true);
    const move = (ev: globalThis.PointerEvent) => {
      const dx = ev.clientX - s.px;
      const dy = ev.clientY - s.py;
      let { x, y, width, height } = s;
      if (edge.includes("e")) width = clamp(s.width + dx, def.minSize.width, window.innerWidth - s.x);
      if (edge.includes("s")) height = clamp(s.height + dy, def.minSize.height, window.innerHeight - s.y);
      if (edge.includes("w")) {
        width = clamp(s.width - dx, def.minSize.width, s.x + s.width);
        x = s.x + s.width - width;
      }
      if (edge.includes("n")) {
        height = clamp(s.height - dy, def.minSize.height, s.y + s.height - MENUBAR_HEIGHT);
        y = s.y + s.height - height;
      }
      next = { x, y, width, height };
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      setInteracting(false);
      wm.resizeWindow(win.id, next);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  const cx = win.isMaximized ? window.innerWidth / 2 : win.position.x + win.size.width / 2;
  const cy = win.isMaximized ? window.innerHeight / 2 : win.position.y + win.size.height / 2;

  return (
    <motion.div
      ref={shellRef}
      role="region"
      aria-label={`${def.name} window`}
      tabIndex={-1}
      data-window={win.appId}
      custom={{ appId: win.appId, cx, cy } satisfies MinCtx}
      variants={variants}
      initial="min"
      animate={win.isMinimized ? "min" : "show"}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16, ease: "easeOut" } }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.9 }}
      onPointerDownCapture={() => !active && wm.focusWindow(win.id)}
      className="pointer-events-auto absolute flex flex-col outline-none"
      style={{ ...bounds, zIndex: win.zIndex }}
      aria-hidden={win.isMinimized ? true : undefined}
      inert={win.isMinimized ? true : undefined}
    >
      <div data-inactive={!active} className="glass glass-window flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
        <WindowHeader
          appId={win.appId}
          active={active}
          maximized={win.isMaximized}
          onPointerDown={startDrag}
          onClose={() => wm.closeWindow(win.id)}
          onMinimize={() => wm.minimizeWindow(win.id)}
          onToggleMaximize={() => wm.toggleMaximize(win.id)}
        />
        <div ref={bodyRef} className="@container relative min-h-0 flex-1 overflow-hidden bg-background">
          <App launch={win.launch} />
        </div>
      </div>
      {!win.isMaximized && EDGES.map(({ edge, cls, cursor }) => <div key={edge} aria-hidden="true" onPointerDown={startResize(edge)} className={`absolute z-10 touch-none ${cls}`} style={{ cursor }} />)}
    </motion.div>
  );
}
