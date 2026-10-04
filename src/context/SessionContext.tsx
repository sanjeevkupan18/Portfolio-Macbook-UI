"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { sessionFlag } from "@/lib/storage";

export type Phase = "boot" | "lock" | "desktop" | "sleep" | "off";

interface SessionContextValue {
  phase: Phase;
  /** Boot animation finished (or was skipped) */
  finishBoot: () => void;
  unlock: () => void;
  lock: () => void;
  sleep: () => void;
  wake: () => void;
  shutdown: () => void;
  powerOn: () => void;
  restart: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function initialPhase(): Phase {
  if (sessionFlag.get("unlocked")) return "desktop";
  if (sessionFlag.get("booted")) return "lock";
  return "boot";
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(initialPhase);

  const finishBoot = useCallback(() => {
    sessionFlag.set("booted", true);
    setPhase("lock");
  }, []);
  const unlock = useCallback(() => {
    sessionFlag.set("booted", true);
    sessionFlag.set("unlocked", true);
    setPhase("desktop");
  }, []);
  const lock = useCallback(() => {
    sessionFlag.set("unlocked", false);
    setPhase("lock");
  }, []);
  const sleep = useCallback(() => {
    sessionFlag.set("unlocked", false);
    setPhase("sleep");
  }, []);
  const wake = useCallback(() => setPhase("lock"), []);
  const shutdown = useCallback(() => {
    sessionFlag.set("unlocked", false);
    sessionFlag.set("booted", false);
    setPhase("off");
  }, []);
  const powerOn = useCallback(() => setPhase("boot"), []);
  const restart = useCallback(() => {
    sessionFlag.set("unlocked", false);
    sessionFlag.set("booted", false);
    setPhase("boot");
  }, []);

  const value = useMemo(
    () => ({ phase, finishBoot, unlock, lock, sleep, wake, shutdown, powerOn, restart }),
    [phase, finishBoot, unlock, lock, sleep, wake, shutdown, powerOn, restart],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
