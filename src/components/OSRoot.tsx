"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { BootScreen } from "@/components/boot/BootScreen";
import { Desktop } from "@/components/desktop/Desktop";
import { LockScreen } from "@/components/lock/LockScreen";
import { PowerScreen } from "@/components/lock/PowerScreen";
import { MobileOS } from "@/components/mobile/MobileOS";
import { DesktopProvider } from "@/context/DesktopContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { OverlayProvider } from "@/context/OverlayContext";
import { SessionProvider, useSession } from "@/context/SessionContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { WindowProvider } from "@/context/WindowContext";
import { useIsClient, useIsMobile } from "@/hooks/useMediaQuery";

function DesktopOS() {
  const { phase } = useSession();
  return (
    <WindowProvider>
      <div className="fixed inset-0 bg-black">
        <AnimatePresence>
          {phase === "lock" && <LockScreen key="lock" />}
        </AnimatePresence>
        {phase === "desktop" && <Desktop />}
        {(phase === "sleep" || phase === "off") && <PowerScreen mode={phase} />}
      </div>
    </WindowProvider>
  );
}

function Root() {
  const { phase } = useSession();
  const mobile = useIsMobile();
  useEffect(() => {
    // The server-rendered, crawlable copy of the content is replaced by the interactive OS once it is running.
    document.getElementById("seo-content")?.setAttribute("hidden", "");
  }, []);
  return (
    <>
      <AnimatePresence>{phase === "boot" && <BootScreen key="boot" />}</AnimatePresence>
      {phase !== "boot" && (mobile ? <MobileOS /> : <DesktopOS />)}
    </>
  );
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DesktopProvider>
        <NotificationProvider>
          <SessionProvider>
            <OverlayProvider>
              <MotionConfig reducedMotion="user">{children}</MotionConfig>
            </OverlayProvider>
          </SessionProvider>
        </NotificationProvider>
      </DesktopProvider>
    </ThemeProvider>
  );
}

/** Entry point of the simulated OS. Renders client-side only (after hydration) so time/battery/storage never mismatch. */
export function OSRoot() {
  const client = useIsClient();
  if (!client) return <div className="fixed inset-0 bg-black" aria-hidden="true" />;
  return (
    <Providers>
      <Root />
    </Providers>
  );
}
