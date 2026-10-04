"use client";

import { useDesktop } from "@/context/DesktopContext";
import { useTheme } from "@/context/ThemeContext";
import { wallpaperById } from "@/data/wallpapers";

/** Resolved wallpaper variant (CSS background + tone) for the current theme. */
export function useWallpaper() {
  const { prefs } = useDesktop();
  const { resolved } = useTheme();
  return wallpaperById(prefs.wallpaperId)[resolved];
}
