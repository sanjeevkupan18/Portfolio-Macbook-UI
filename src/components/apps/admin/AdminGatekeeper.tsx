"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { adminApi } from "./adminApi";

interface AdminGatekeeperProps {
  onSuccess: () => void;
}

const inputCls =
  "h-10 w-full rounded-xl bg-surface px-3 text-[14px] text-foreground placeholder:text-muted/70 shadow-[0_0_0_0.5px_var(--border)] outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--accent)] disabled:opacity-60";

export function AdminGatekeeper({ onSuccess }: AdminGatekeeperProps) {
  const uid = useId();
  const passRef = useRef<HTMLInputElement>(null);
  const [passcode, setPasscode] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    passRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (!passcode.trim()) {
      setError("Please enter the gatekeeper password.");
      setShake((s) => s + 1);
      passRef.current?.focus();
      return;
    }

    setBusy(true);
    setError(null);

    const res = await adminApi.unlockGate(passcode);
    setBusy(false);

    if (res.ok) {
      if (res.data.unlocked) {
        setPasscode("");
        onSuccess();
        return;
      }
      setError("Incorrect gatekeeper password. Access denied.");
    } else {
      setError(res.error.message || "Incorrect gatekeeper password. Access denied.");
    }
    setPasscode("");
    setShake((s) => s + 1);
    passRef.current?.focus();
  };

  return (
    <div className="mac-scroll min-h-0 flex-1">
      <div className="flex min-h-full items-center justify-center p-4 @lg:p-8">
        <motion.div
          key={shake}
          animate={shake > 0 ? { x: [-14, 14, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="w-full max-w-sm"
        >
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-busy={busy}
            className="w-full rounded-2xl bg-surface p-6 shadow-[0_0_0_0.5px_var(--border),0_16px_40px_-10px_rgba(0,0,0,0.28)] @lg:p-7 transition-shadow"
          >
            {/* macOS Gatekeeper Security Header */}
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent ring-1 ring-amber-500/30 shadow-md">
                  <KeyRound className="size-8 text-amber-500" aria-hidden="true" />
                </div>
                <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-surface text-amber-500 shadow-xs ring-1 ring-border">
                  <ShieldAlert className="size-3" aria-hidden="true" />
                </span>
              </div>
              <div>
                <h1 className="text-[17px] font-semibold tracking-tight text-foreground">
                  Security Gatekeeper
                </h1>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  This administrative area is restricted. Enter the master gate password to proceed to the login portal.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-3.5 flex items-start gap-2 rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-[12.5px] text-danger"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              <div>
                <label
                  htmlFor={`${uid}-gate-pass`}
                  className="mb-1 block text-[12px] font-medium text-muted"
                >
                  Master Gate Password
                </label>
                <div className="relative">
                  <input
                    ref={passRef}
                    id={`${uid}-gate-pass`}
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={passcode}
                    disabled={busy}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter gate password…"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${uid}-gate-err` : undefined}
                    className={cn(inputCls, "pr-11", error && "shadow-[0_0_0_1.5px_var(--danger)]")}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-xl text-muted hover:text-foreground"
                  >
                    {show ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={busy}
                className="mt-1.5 w-full bg-amber-600 hover:bg-amber-500 text-white"
              >
                {busy && <Loader2 className="spin size-4" aria-hidden="true" />}
                {busy ? "Verifying Gate…" : "Unlock Gate"}
              </Button>
            </div>

            {/* Security Footer */}
            <div className="mt-5 border-t border-border/70 pt-3 text-center text-[11px] text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
              <span>Environment protected · Encrypted HMAC session token</span>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
