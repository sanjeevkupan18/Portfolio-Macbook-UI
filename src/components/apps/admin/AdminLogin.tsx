"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Info, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminLoginSchema, fieldErrorsFrom } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { adminApi } from "./adminApi";

interface AdminLoginProps {
  notice?: string | null;
  onSuccess: (email: string) => void;
}

const inputCls =
  "h-10 w-full rounded-lg bg-surface px-3 text-[14px] text-foreground placeholder:text-muted/70 shadow-[0_0_0_0.5px_var(--border)] outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--accent)] disabled:opacity-60";

export function AdminLogin({ notice, onSuccess }: AdminLoginProps) {
  const uid = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
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
    setError(res.error.message || "Sign in failed. Please try again.");
    passRef.current?.focus();
  };

  return (
    <div className="mac-scroll min-h-0 flex-1">
      <div className="flex min-h-full items-center justify-center p-4 @lg:p-8">
        <form
          onSubmit={submit}
          noValidate
          aria-busy={busy}
          className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-[0_0_0_0.5px_var(--border),0_12px_32px_rgba(0,0,0,0.18)] @lg:p-6"
        >
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent">
              <Lock className="size-5" aria-hidden="true" />
            </span>
            <h1 className="text-[17px] font-semibold tracking-tight">Admin Sign In</h1>
            <p className="text-[13px] text-muted">Sign in to read your messages.</p>
          </div>

          {notice && (
            <div role="status" className="mb-3 flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--warning)_14%,transparent)] px-3 py-2 text-[13px]">
              <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}
          {error && (
            <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2 text-[13px] text-danger">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            <div>
              <label htmlFor={`${uid}-email`} className="mb-1 block text-[12px] font-medium text-muted">
                Email
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
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={fieldErrors.password ? `${uid}-pass-err` : undefined}
                  className={cn(inputCls, "pr-11", fieldErrors.password && "shadow-[0_0_0_1.5px_var(--danger)]")}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  aria-pressed={show}
                  className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-muted hover:text-foreground"
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
            <Button type="submit" variant="primary" size="lg" disabled={busy} className="mt-1 w-full">
              {busy && <Loader2 className="spin size-4" aria-hidden="true" />}
              {busy ? "Signing in…" : "Sign In"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
