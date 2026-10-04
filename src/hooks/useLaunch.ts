"use client";

import { useEffect, useRef } from "react";
import type { AppLaunch, AppParams } from "@/types/app";

/**
 * Runs `handler` with the launch params on mount and every time the app is launched again
 * (e.g. Spotlight → "Skills → React" while Skills is already open).
 */
export function useLaunch(launch: AppLaunch, handler: (params: AppParams | undefined) => void): void {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    ref.current(launch.params);
  }, [launch.nonce, launch.params]);
}
