"use client";

import { AnimatePresence } from "motion/react";
import { useWindows } from "@/context/WindowContext";
import { Window } from "./Window";

/** Renders every open window (minimized ones stay mounted so their state survives). */
export function WindowManager() {
  const { windows } = useWindows();
  return (
    <div className="pointer-events-none absolute inset-0 z-[100]">
      <AnimatePresence>
        {windows.filter((w) => w.isOpen).map((w) => <Window key={w.id} win={w} />)}
      </AnimatePresence>
    </div>
  );
}
