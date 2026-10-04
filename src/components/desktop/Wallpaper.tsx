"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useWallpaper } from "@/hooks/useWallpaper";

/** Full-screen wallpaper with a very subtle pointer parallax (disabled for reduced motion / touch). */
export function Wallpaper({ onPointerDown }: { onPointerDown?: () => void }) {
  const wp = useWallpaper();
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 60, damping: 20 });
  const y = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set((e.clientX / window.innerWidth - 0.5) * -14);
      my.set((e.clientY / window.innerHeight - 0.5) * -10);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, mx, my]);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-black" onPointerDown={onPointerDown}>
      <motion.div
        className="wallpaper-layer absolute -inset-6"
        style={{ "--wallpaper-background": wp.background, x, y } as unknown as React.CSSProperties}
      />
    </div>
  );
}
