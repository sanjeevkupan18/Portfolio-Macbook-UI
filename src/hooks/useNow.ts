"use client";

import { useSyncExternalStore } from "react";

const subscribers = new Map<number, (cb: () => void) => () => void>();

function subscribeFor(intervalMs: number) {
  let sub = subscribers.get(intervalMs);
  if (!sub) {
    sub = (cb) => {
      const id = setInterval(cb, intervalMs);
      return () => clearInterval(id);
    };
    subscribers.set(intervalMs, sub);
  }
  return sub;
}

/** Current time (ms) refreshed every `intervalMs`; 0 on the server. */
export function useNow(intervalMs = 1000): number {
  return useSyncExternalStore(
    subscribeFor(intervalMs),
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}
