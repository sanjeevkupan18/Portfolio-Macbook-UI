"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { ChevronUp } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useDesktop } from "@/context/DesktopContext";
import { useSession } from "@/context/SessionContext";
import { portfolio } from "@/data/portfolio";
import { useNow } from "@/hooks/useNow";
import { clockParts, MobileStatusBar } from "./MobileStatusBar";
import { MobileWallpaper } from "./MobileWallpaper";
import { useWallpaper } from "@/hooks/useWallpaper";

const UNLOCK_DISTANCE = 120;
const UNLOCK_VELOCITY = 500;

function greeting(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** iOS-style lock screen. Drag up (or tap / Enter / Space) to unlock. */
export function MobileLock() {
  const { unlock } = useSession();
  const { prefs } = useDesktop();
  const now = useNow(1000);
  const tone = useWallpaper().tone;
  const reduce = useReducedMotion();
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-260, 0], [0.15, 1]);
  const { time, ampm } = clockParts(now, prefs.clock24);
  const d = now ? new Date(now) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        unlock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlock]);

  const onDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y < -UNLOCK_DISTANCE || info.velocity.y < -UNLOCK_VELOCITY) unlock();
  };

  return (
    <motion.div
      role="region"
      aria-label="Lock screen"
      className={`os-chrome absolute inset-0 z-50 overflow-hidden ${tone === "light" ? "text-neutral-900" : "text-white"}`}
      exit={{ opacity: 0, transition: { duration: reduce ? 0.15 : 0.3 } }}
    >
      <MobileWallpaper />
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      <MobileStatusBar className="relative" />

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDragEnd={onDragEnd}
        style={{ y, opacity, touchAction: "none" }}
        className="absolute inset-0 flex flex-col items-center px-8"
      >
        <div className="mt-[calc(env(safe-area-inset-top)+4.5rem)] flex flex-col items-center text-center">
          <p className="text-[18px] font-medium opacity-90">{d ? d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : " "}</p>
          <h1 className="mt-1 flex items-baseline gap-2 text-[88px] font-semibold leading-none tracking-tight tabular-nums">
            {time}
            {ampm && <span className="text-[22px] font-medium opacity-80">{ampm}</span>}
          </h1>
        </div>

        <div className="glass glass-widget mt-10 flex w-full max-w-sm items-center gap-3 rounded-[24px] p-3.5 text-foreground">
          <Avatar size={48} />
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold">{portfolio.profile.name}</p>
            <p className="truncate text-[13px] text-muted">{d ? `${greeting(d.getHours())}, ${portfolio.profile.firstName}` : portfolio.profile.role}</p>
          </div>
        </div>

        <div className="mt-auto flex flex-col items-center gap-2" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}>
          <button
            type="button"
            onClick={unlock}
            autoFocus
            aria-label="Tap to unlock"
            className="flex min-h-11 flex-col items-center rounded-full px-6 py-1 text-[15px] font-medium"
          >
            <ChevronUp className="h-5 w-5 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
            <span>Swipe up to unlock</span>
            <span className="text-[12px] opacity-75">or tap / press Enter</span>
          </button>
          <span aria-hidden="true" className="mt-1 h-[5px] w-36 rounded-full bg-current opacity-80" />
        </div>
      </motion.div>
    </motion.div>
  );
}
