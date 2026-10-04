"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, Ellipsis, Home, Moon, Search, SlidersHorizontal, Sun } from "lucide-react";
import { appComponents } from "@/components/apps/registry";
import { useOverlay } from "@/context/OverlayContext";
import { useTheme } from "@/context/ThemeContext";
import { appById } from "@/data/apps";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import type { AppId, AppLaunch } from "@/types/app";
import { MobileStatusBar } from "./MobileStatusBar";

interface MobileAppProps {
  appId: AppId;
  launch: AppLaunch;
  onClose: () => void;
}

/** Full-screen app with an iOS-style navigation bar, edge-swipe back and a home indicator. */
export function MobileApp({ appId, launch, onClose }: MobileAppProps) {
  const reduce = useReducedMotion();
  const { open } = useOverlay();
  const { resolved, setTheme } = useTheme();
  const def = appById[appId];
  const App = appComponents[appId];
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const swipe = useRef<{ x: number; id: number } | null>(null);

  useOutsideClick(menuRef, () => setMenu(false), menu);
  useEffect(() => {
    titleRef.current?.focus();
  }, [appId]);

  const menuItem = "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[14px] hover:bg-hover";

  return (
    <motion.div
      className="fixed inset-0 z-30 flex flex-col bg-background will-change-transform"
      initial={reduce ? { opacity: 0 } : { x: "100%" }}
      animate={reduce ? { opacity: 1 } : { x: 0 }}
      exit={reduce ? { opacity: 0 } : { x: "100%" }}
      transition={reduce ? { duration: 0.16, ease: "easeOut" } : { duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !e.defaultPrevented) {
          e.preventDefault();
          if (menu) setMenu(false);
          else onClose();
        }
      }}
    >
      <div className="glass glass-menu relative z-10 shrink-0">
        <MobileStatusBar className="text-foreground" />
        <div className="relative flex h-11 items-center justify-between px-2">
          <button type="button" onClick={onClose} aria-label="Back to Home Screen" className="flex h-11 items-center gap-0.5 rounded-lg pr-3 pl-1 text-[16px] text-accent">
            <ChevronLeft className="size-6" aria-hidden="true" />Home
          </button>
          <h1 ref={titleRef} tabIndex={-1} className="pointer-events-none absolute inset-x-0 text-center text-[16px] font-semibold outline-none">{def.name}</h1>
          <div ref={menuRef} className="relative">
            <button type="button" onClick={() => setMenu((m) => !m)} aria-label="App menu" aria-haspopup="menu" aria-expanded={menu} className="grid size-11 place-items-center rounded-lg text-accent">
              <Ellipsis className="size-6" aria-hidden="true" />
            </button>
            {menu && (
              <div role="menu" className="glass glass-panel absolute top-11 right-0 z-20 w-56 overflow-hidden rounded-2xl py-1">
                <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); onClose(); }}><Home className="size-4" aria-hidden="true" />Home Screen</button>
                <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); open({ type: "spotlight" }); }}><Search className="size-4" aria-hidden="true" />Search</button>
                <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); setTheme(resolved === "dark" ? "light" : "dark"); }}>
                  {resolved === "dark" ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}{resolved === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
                <button role="menuitem" className={menuItem} onClick={() => { setMenu(false); open({ type: "controlCenter" }); }}><SlidersHorizontal className="size-4" aria-hidden="true" />Control Center</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="@container relative min-h-0 flex-1 overflow-hidden bg-background">
        <App launch={launch} />
      </main>

      <button type="button" onClick={onClose} aria-label="Go to Home Screen" className="grid h-6 shrink-0 place-items-center bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <span className="h-1 w-32 rounded-full bg-foreground/70" />
      </button>

      {/* Left-edge swipe → back */}
      <div
        aria-hidden="true"
        className="absolute top-24 bottom-10 left-0 z-20 w-5 touch-pan-y"
        onPointerDown={(e) => {
          swipe.current = { x: e.clientX, id: e.pointerId };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerUp={(e) => {
          if (swipe.current && e.clientX - swipe.current.x > 80) onClose();
          swipe.current = null;
        }}
        onPointerCancel={() => {
          swipe.current = null;
        }}
      />
    </motion.div>
  );
}
