"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Loader2, Moon, Power, RotateCcw } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "@/context/SessionContext";
import { portfolio } from "@/data/portfolio";
import { useNow } from "@/hooks/useNow";
import { useWallpaper } from "@/hooks/useWallpaper";
import { cn, greetingFor } from "@/lib/utils";

const HINT = process.env.NEXT_PUBLIC_PASSWORD_HINT || "Hint: a friendly greeting";

/** macOS-style login window. The demo password is validated server-side by /api/unlock. */
export function LockScreen() {
  const { unlock, sleep, restart, shutdown } = useSession();
  const wp = useWallpaper();
  const reduce = useReducedMotion();
  const now = useNow(1000);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const date = new Date(now);
  const light = wp.tone === "light";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const json = (await res.json()) as { ok: boolean; data?: { valid: boolean }; error?: { message: string } };
      if (res.ok && json.ok && json.data?.valid) {
        unlock();
        return;
      }
      setError(res.status === 429 ? (json.error?.message ?? "Too many attempts. Try again shortly.") : "Incorrect password. Try again.");
    } catch {
      setError("Couldn't verify the password. Check your connection and try again.");
    }
    setBusy(false);
    setShake((n) => n + 1);
    setPassword("");
    inputRef.current?.focus();
  };

  return (
    <motion.main
      aria-label="Lock screen"
      className={cn("os-chrome fixed inset-0 z-[1000] overflow-hidden", light ? "text-neutral-900" : "text-white")}
      initial={{ opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06, filter: "blur(12px)", transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div
        aria-hidden="true"
        className="wallpaper-layer wallpaper-layer-center absolute inset-0 scale-105 blur-[6px]"
        style={{ "--wallpaper-background": wp.background } as React.CSSProperties}
      />
      <div aria-hidden="true" className={cn("absolute inset-0", light ? "bg-white/10" : "bg-black/25")} />

      <div className="relative flex h-full flex-col items-center px-4">
        <div className="mt-[8vh] text-center drop-shadow-sm">
          <p className="text-[clamp(16px,2.2vw,22px)] font-medium opacity-90">{date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <p className="text-[clamp(64px,11vw,120px)] leading-none font-semibold tracking-tight tabular-nums">{date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false })}</p>
        </div>

        <motion.form
          key={shake}
          onSubmit={submit}
          animate={shake && !reduce ? { x: [0, -12, 12, -9, 9, -5, 5, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-auto mb-auto flex w-[min(300px,100%)] flex-col items-center gap-3 pt-6"
          aria-label="Unlock"
        >
          <Avatar size={96} />
          <h1 className="text-[20px] font-semibold drop-shadow-sm">{portfolio.profile.name}</h1>
          <p className="-mt-2 text-[13px] opacity-80">{greetingFor(date)}</p>
          <div className={cn("flex w-full items-center rounded-full border px-4 backdrop-blur-xl", error ? "border-red-400/80" : light ? "border-black/10" : "border-white/25", light ? "bg-white/50" : "bg-white/15")}>
            <label htmlFor="lock-password" className="sr-only">Password</label>
            <input
              id="lock-password"
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby="lock-help"
              disabled={busy}
              className={cn("h-9 min-w-0 flex-1 bg-transparent text-[14px] outline-none", light ? "placeholder:text-neutral-700/60" : "placeholder:text-white/60")}
            />
            <button type="submit" disabled={busy || password.length === 0} aria-label="Unlock" className={cn("grid size-6 place-items-center rounded-full transition-opacity", light ? "bg-black/60 text-white" : "bg-white/70 text-black", (busy || password.length === 0) && "opacity-40")}>
              {busy ? <Loader2 className="spin size-3.5" aria-hidden="true" /> : <ArrowRight className="size-3.5" aria-hidden="true" />}
            </button>
          </div>
          <p id="lock-help" role={error ? "alert" : undefined} className={cn("min-h-4 text-center text-[12px]", error ? (light ? "text-red-700" : "text-red-200") : "opacity-75")}>
            {error ?? `${HINT} · Press Enter to unlock`}
          </p>
        </motion.form>

        <div className="mb-8 flex gap-8 text-[12px]">
          {[
            { label: "Sleep", icon: Moon, run: sleep },
            { label: "Restart", icon: RotateCcw, run: restart },
            { label: "Shut Down", icon: Power, run: shutdown },
          ].map(({ label, icon: Icon, run }) => (
            <button key={label} type="button" onClick={run} className="group flex flex-col items-center gap-1.5 opacity-80 hover:opacity-100">
              <span className={cn("grid size-10 place-items-center rounded-full backdrop-blur-xl transition-colors", light ? "bg-black/10 group-hover:bg-black/20" : "bg-white/15 group-hover:bg-white/25")}><Icon className="size-4.5" aria-hidden="true" /></span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </motion.main>
  );
}
