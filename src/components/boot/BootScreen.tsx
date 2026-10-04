"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Logo } from "@/components/system/Logo";
import { useSession } from "@/context/SessionContext";

const BOOT_MS = 2800;
const BOOT_MS_REDUCED = 900;

/** Black screen → logo fades/scales in → progress bar → lock screen. Click or press any key to skip. */
export function BootScreen() {
  const { finishBoot } = useSession();
  const reduce = useReducedMotion();
  const duration = reduce ? BOOT_MS_REDUCED : BOOT_MS;
  const [skippable, setSkippable] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      finishBoot();
    };
    const end = setTimeout(finish, duration);
    const arm = setTimeout(() => setSkippable(true), 500);
    const onInput = () => {
      if (skippable) finish();
    };
    window.addEventListener("keydown", onInput);
    window.addEventListener("pointerdown", onInput);
    return () => {
      clearTimeout(end);
      clearTimeout(arm);
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("pointerdown", onInput);
    };
  }, [duration, finishBoot, skippable]);

  return (
    <motion.div role="status" aria-live="polite" aria-label="Starting up" className="fixed inset-0 z-[3000] flex flex-col items-center justify-center bg-black text-white" exit={{ opacity: 0, transition: { duration: 0.4 } }}>
      <motion.div initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
        <Logo className="size-20" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.4 }} className="mt-14 h-1 w-44 overflow-hidden rounded-full bg-white/20" aria-hidden="true">
        <div className="h-full origin-left rounded-full bg-white" style={{ animation: `boot-progress ${Math.max(0.4, duration / 1000 - 0.9)}s cubic-bezier(0.4,0,0.2,1) 0.8s both` }} />
      </motion.div>
      <span className="sr-only">Starting {`Sanjeev's`} portfolio…</span>
      {skippable && <p className="absolute bottom-6 text-[11px] text-white/35">Press any key or click to skip</p>}
    </motion.div>
  );
}
