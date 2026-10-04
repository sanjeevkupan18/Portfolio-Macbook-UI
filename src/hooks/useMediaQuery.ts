"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

/** Phone layout: narrow screens, or a phone held in landscape (short + touch). */
export const MOBILE_QUERY = "(max-width: 767px), (max-height: 500px) and (pointer: coarse)";
export const useIsMobile = (): boolean => useMediaQuery(MOBILE_QUERY);
export const usePrefersReducedMotion = (): boolean => useMediaQuery("(prefers-reduced-motion: reduce)");

/** True only on the client after hydration. Lets the whole OS render client-side without mismatches. */
export function useIsClient(): boolean {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}
