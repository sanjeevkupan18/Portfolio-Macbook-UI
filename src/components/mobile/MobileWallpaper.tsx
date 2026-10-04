"use client";

import { useWallpaper } from "@/hooks/useWallpaper";

/** Full-bleed wallpaper layer (parent must be positioned). */
export function MobileWallpaper() {
  const wp = useWallpaper();
  return (
    <div
      aria-hidden="true"
      className="wallpaper-layer wallpaper-layer-center absolute inset-0"
      style={{ "--wallpaper-background": wp.background } as React.CSSProperties}
    />
  );
}
