"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Calls `onOutside` for pointer-downs outside `ref`. Pass `active=false` to detach. */
export function useOutsideClick(ref: RefObject<HTMLElement | null>, onOutside: (e: PointerEvent) => void, active = true): void {
  const cb = useRef(onOutside);
  useEffect(() => {
    cb.current = onOutside;
  });
  useEffect(() => {
    if (!active) return;
    const handler = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current(e);
    };
    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
  }, [ref, active]);
}
