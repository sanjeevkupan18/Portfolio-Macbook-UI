"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import type { AppProps } from "@/types/app";
import { adminApi } from "./adminApi";
import { AdminDashboard } from "./AdminDashboard";
import { AdminGatekeeper } from "./AdminGatekeeper";
import { AdminLogin } from "./AdminLogin";

type Auth =
  | { state: "checking" }
  | { state: "error"; message: string }
  | { state: "out"; notice: string | null }
  | { state: "in"; email: string };

/** Admin inbox. Authentication lives entirely server-side (httpOnly signed cookie); this component only reflects it. */
export function AdminApp(props: AppProps) {
  void props;
  const [gateUnlocked, setGateUnlocked] = useState<boolean | null>(null);
  const [auth, setAuth] = useState<Auth>({ state: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function checkSecurity() {
      // Step 1: Verify Master Gate status
      const gateRes = await adminApi.checkGate();
      if (cancelled) return;

      if (!gateRes.ok || !gateRes.data.unlocked) {
        setGateUnlocked(false);
        setAuth({ state: "out", notice: null });
        return;
      }

      setGateUnlocked(true);

      // Step 2: Verify Admin Session status
      const sessionRes = await adminApi.session();
      if (cancelled) return;

      if (sessionRes.ok) {
        setAuth(
          sessionRes.data.authenticated && sessionRes.data.email
            ? { state: "in", email: sessionRes.data.email }
            : { state: "out", notice: null }
        );
      } else if (
        sessionRes.error.code === "db_not_configured" ||
        sessionRes.error.code === "admin_not_configured" ||
        sessionRes.status === 0 ||
        sessionRes.status >= 500
      ) {
        setAuth({ state: "error", message: sessionRes.error.message });
      } else {
        setAuth({ state: "out", notice: null });
      }
    }

    void checkSecurity();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const onGateSuccess = useCallback(() => {
    setGateUnlocked(true);
    setAuth({ state: "checking" });
    setAttempt((n) => n + 1);
  }, []);

  const onLockGate = useCallback(async () => {
    await adminApi.lockGate();
    setGateUnlocked(false);
    setAuth({ state: "out", notice: null });
  }, []);

  const onExpired = useCallback(
    () => setAuth({ state: "out", notice: "Your session expired. Please sign in again." }),
    []
  );

  const onLogout = useCallback(async () => {
    await adminApi.logout();
    setGateUnlocked(false);
    setAuth({ state: "out", notice: null });
  }, []);

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background">
      {/* 1. Checking initial gate status */}
      {gateUnlocked === null && (
        <div role="status" className="space-y-3 p-6">
          <span className="sr-only">Checking security gate status…</span>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </div>
      )}

      {/* 2. Gate is locked: Show macOS Security Gatekeeper */}
      {gateUnlocked === false && (
        <AdminGatekeeper onSuccess={onGateSuccess} />
      )}

      {/* 3. Gate is unlocked: Proceed to Auth & Dashboard */}
      {gateUnlocked === true && (
        <>
          {auth.state === "checking" && (
            <div role="status" className="space-y-3 p-6">
              <span className="sr-only">Checking admin session…</span>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-24" />
              <Skeleton className="h-40" />
            </div>
          )}
          {auth.state === "error" && (
            <ErrorState
              title="Admin is unavailable"
              message={auth.message}
              onRetry={() => {
                setAuth({ state: "checking" });
                setAttempt((n) => n + 1);
              }}
            />
          )}
          {auth.state === "out" && (
            <AdminLogin
              notice={auth.notice}
              onSuccess={(email) => setAuth({ state: "in", email })}
              onLockGate={() => void onLockGate()}
            />
          )}
          {auth.state === "in" && (
            <AdminDashboard
              email={auth.email}
              onLogout={() => void onLogout()}
              onExpired={onExpired}
            />
          )}
        </>
      )}
    </div>
  );
}
