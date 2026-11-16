"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { motion } from "motion/react";
import { AlertCircle, Eye, EyeOff, Info, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { portfolio } from "@/data/portfolio";
import { adminLoginSchema, fieldErrorsFrom } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { adminApi } from "./adminApi";

interface AdminLoginProps {
  notice?: string | null;
  onSuccess: (email: string) => void;
  onLockGate?: () => void;
}

const inputCls =
  "h-10 w-full rounded-xl bg-surface px-3 text-[14px] text-foreground placeholder:text-muted/70 shadow-[0_0_0_0.5px_var(--border)] outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--accent)] disabled:opacity-60";

export function AdminLogin({ notice, onSuccess, onLockGate }: AdminLoginProps) {
  const uid = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = adminLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fe = fieldErrorsFrom(parsed.error);
      setFieldErrors({ email: fe.email, password: fe.password });
      setError(null);
      setShake((s) => s + 1);
      (fe.email ? emailRef : passRef).current?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);
    setBusy(true);
    const res = await adminApi.login(parsed.data.email, password);
    setBusy(false);
    if (res.ok) {
      setPassword("");
      onSuccess(res.data.email);
      return;
    }
    setPassword("");
    setError(res.error.message || "Sign in failed. Please check your credentials.");
    setShake((s) => s + 1);
    passRef.current?.focus();
  };

  return (
    <div className="mac-scroll min-h-0 flex-1">
      <div className="flex min-h-full items-center justify-center p-4 @lg:p-8">
        <motion.div
          key={shake}
          animate={shake > 0 ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full max-w-sm"
        >
          <form
            onSubmit={submit}
            noValidate
            aria-busy={busy}
            className="w-full rounded-2xl bg-surface p-6 shadow-[0_0_0_0.5px_var(--border),0_16px_40px_-10px_rgba(0,0,0,0.28)] @lg:p-7 transition-shadow"
          >
            {/* macOS User Profile Header */}
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <div className="relative size-18 overflow-hidden rounded-full ring-3 ring-accent/30 shadow-md">
                  <Avatar size={72} />
                </div>
                <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-accent text-accent-fg shadow-xs ring-2 ring-surface">
                  <Lock className="size-3" aria-hidden="true" />
                </span>
              </div>
              <div>
                <h1 className="text-[17px] font-semibold tracking-tight">{portfolio.profile.name}</h1>
                <p className="text-[12.5px] font-medium text-accent">Portfolio Administrator</p>
              </div>
            </div>

            {notice && (
              <div role="status" className="mb-3.5 flex items-start gap-2 rounded-xl bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] px-3 py-2 text-[12.5px]">
                <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                <span>{notice}</span>
              </div>
            )}
            {error && (
              <div role="alert" className="mb-3.5 flex items-start gap-2 rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-[12.5px] text-danger">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-3.5">
              <div>
                <label htmlFor={`${uid}-email`} className="mb-1 block text-[12px] font-medium text-muted">
                  Admin Email
                </label>
                <input
                  ref={emailRef}
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  value={email}
                  disabled={busy}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={fieldErrors.email ? `${uid}-email-err` : undefined}
                  className={cn(inputCls, fieldErrors.email && "shadow-[0_0_0_1.5px_var(--danger)]")}
                />
                {fieldErrors.email && (
                  <p id={`${uid}-email-err`} className="mt-1 text-[12px] text-danger">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={`${uid}-pass`} className="mb-1 block text-[12px] font-medium text-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passRef}
                    id={`${uid}-pass`}
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    disabled={busy}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    aria-invalid={fieldErrors.password ? true : undefined}
                    aria-describedby={fieldErrors.password ? `${uid}-pass-err` : undefined}
                    className={cn(inputCls, "pr-11", fieldErrors.password && "shadow-[0_0_0_1.5px_var(--danger)]")}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-xl text-muted hover:text-foreground"
                  >
                    {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id={`${uid}-pass-err`} className="mt-1 text-[12px] text-danger">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <Button type="submit" variant="primary" size="lg" disabled={busy} className="mt-1.5 w-full">
                {busy && <Loader2 className="spin size-4" aria-hidden="true" />}
                {busy ? "Authenticating…" : "Unlock Dashboard"}
              </Button>
            </div>

            {/* Security Session Badge */}
            <div className="mt-5 border-t border-border/70 pt-3 text-center text-[11px] text-muted flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
                <span>Signed HTTP-only session · Rate-limited</span>
              </div>
              {onLockGate && (
                <button
                  type="button"
                  onClick={onLockGate}
                  className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  <Lock className="size-3 text-amber-500" aria-hidden="true" />
                  Lock Gatekeeper
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
