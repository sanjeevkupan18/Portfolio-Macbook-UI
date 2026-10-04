"use client";

import { useEffect } from "react";
import { useSession } from "@/context/SessionContext";

/** Black screen for Sleep (wakes to the lock screen) and Shut Down (powers back on through boot). */
export function PowerScreen({ mode }: { mode: "sleep" | "off" }) {
  const { wake, powerOn } = useSession();
  useEffect(() => {
    const go = () => (mode === "sleep" ? wake() : powerOn());
    const t = setTimeout(() => {
      window.addEventListener("keydown", go);
      window.addEventListener("pointerdown", go);
    }, 300);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", go);
      window.removeEventListener("pointerdown", go);
    };
  }, [mode, wake, powerOn]);
  return (
    <button type="button" onClick={() => (mode === "sleep" ? wake() : powerOn())} className="fixed inset-0 z-[3000] grid place-items-center bg-black text-[12px] text-white/30" aria-label={mode === "sleep" ? "Wake the screen" : "Power on"}>
      {mode === "sleep" ? "Click or press a key to wake" : "Click or press a key to power on"}
    </button>
  );
}
