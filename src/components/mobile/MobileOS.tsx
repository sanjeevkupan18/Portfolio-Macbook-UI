"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ControlCenter } from "@/components/control-center/ControlCenter";
import { NotificationToasts } from "@/components/notifications/NotificationCenter";
import { Spotlight } from "@/components/spotlight/Spotlight";
import { SystemDialogs } from "@/components/system/SystemDialogs";
import { useDesktop } from "@/context/DesktopContext";
import { LauncherContext, type Launcher } from "@/context/LauncherContext";
import { useOverlay } from "@/context/OverlayContext";
import { useSession } from "@/context/SessionContext";
import type { AppId, AppLaunch, AppParams } from "@/types/app";
import { MobileApp } from "./MobileApp";
import { MobileHome } from "./MobileHome";
import { MobileLock } from "./MobileLock";

interface Nav { appId: AppId; launch: AppLaunch }

/** iPhone-style experience used below 768px: lock screen → home screen → full-screen apps. */
export function MobileOS() {
  const { phase, wake, powerOn } = useSession();
  const { prefs } = useDesktop();
  const { toggle, overlay, close: closeOverlay } = useOverlay();
  const reduce = useReducedMotion();
  const [nav, setNav] = useState<Nav | null>(null);

  // Initialize root history state and handle mobile back button navigation
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.history.state || !window.history.state.type) {
      window.history.replaceState({ type: "mobile-home" }, "");
    }

    const onPopState = (e: PopStateEvent) => {
      const state = e.state as { type?: string; appId?: AppId; params?: AppParams } | null;
      if (!state || state.type === "mobile-home") {
        setNav(null);
      } else if (state.type === "mobile-app" && state.appId) {
        setNav({ appId: state.appId, launch: { params: state.params, nonce: 1 } });
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openApp = useCallback((appId: AppId, params?: AppParams) => {
    setNav((prev) => {
      const isSameApp = prev?.appId === appId;
      const nextNonce = (isSameApp ? prev.launch.nonce : 0) + 1;
      if (!isSameApp && typeof window !== "undefined") {
        window.history.pushState({ type: "mobile-app", appId, params }, "");
      }
      return { appId, launch: { params, nonce: nextNonce } };
    });
  }, []);

  const closeApp = useCallback(() => {
    if (typeof window !== "undefined" && window.history.state?.type === "mobile-app") {
      window.history.back();
    } else {
      setNav(null);
    }
  }, []);

  // Track overlays (Spotlight, Control Center, Dialogs) in history so back button dismisses overlay first
  useEffect(() => {
    if (!overlay) return;
    let popped = false;
    window.history.pushState({ type: "mobile-overlay", overlay: overlay.type }, "");

    const onPopState = () => {
      popped = true;
      closeOverlay();
    };

    window.addEventListener("popstate", onPopState, { once: true });
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (!popped && window.history.state?.type === "mobile-overlay") {
        window.history.back();
      }
    };
  }, [overlay, closeOverlay]);

  const launcher = useMemo<Launcher>(() => ({ openApp }), [openApp]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle({ type: "spotlight" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const dark = phase === "sleep" || phase === "off";
  return (
    <LauncherContext.Provider value={launcher}>
      <div className="fixed inset-0 overflow-hidden bg-black text-foreground">
        {phase === "lock" && <MobileLock />}
        {phase === "desktop" && (
          <>
            <motion.div
              className="absolute inset-0 will-change-transform"
              animate={nav && !reduce ? { x: "-22%", scale: 0.96, opacity: 0.6 } : { x: 0, scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0.16, ease: "easeOut" } : { duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
              aria-hidden={nav ? true : undefined}
              inert={nav ? true : undefined}
            >
              <MobileHome />
            </motion.div>
            <AnimatePresence>{nav && <MobileApp key={nav.appId} appId={nav.appId} launch={nav.launch} onClose={closeApp} />}</AnimatePresence>
          </>
        )}
        {dark && (
          <button
            type="button"
            className="absolute inset-0 z-50 grid place-items-center bg-black text-[13px] text-white/50"
            onClick={() => (phase === "sleep" ? wake() : powerOn())}
            aria-label={phase === "sleep" ? "Wake screen" : "Power on"}
          >
            Tap to {phase === "sleep" ? "wake" : "power on"}
          </button>
        )}
        <ControlCenter />
        <Spotlight />
        <SystemDialogs />
        <NotificationToasts />
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] bg-black" style={{ opacity: Math.max(0, (1 - prefs.brightness) * 0.65) }} />
      </div>
    </LauncherContext.Provider>
  );
}
