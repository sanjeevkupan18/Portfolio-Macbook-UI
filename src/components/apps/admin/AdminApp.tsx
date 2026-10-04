"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import type { AppProps } from "@/types/app";
import { adminApi } from "./adminApi";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLogin } from "./AdminLogin";

type Auth = { state: "checking" } | { state: "error"; message: string } | { state: "out"; notice: string | null } | { state: "in"; email: string };

/** Admin inbox. Authentication lives entirely server-side (httpOnly signed cookie); this component only reflects it. */
export function AdminApp(props: AppProps) {
  void props;
  const [auth, setAuth] = useState<Auth>({ state: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void adminApi.session().then((res) => {
      if (cancelled) return;
      if (res.ok) setAuth(res.data.authenticated && res.data.email ? { state: "in", email: res.data.email } : { state: "out", notice: null });
      else if (res.error.code === "db_not_configured" || res.error.code === "admin_not_configured" || res.status === 0 || res.status >= 500) setAuth({ state: "error", message: res.error.message });
      else setAuth({ state: "out", notice: null });
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const onExpired = useCallback(() => setAuth({ state: "out", notice: "Your session expired. Please sign in again." }), []);
  const onLogout = useCallback(async () => {
    await adminApi.logout();
    setAuth({ state: "out", notice: null });
  }, []);

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background">
      {auth.state === "checking" && (
        <div role="status" className="space-y-3 p-6"><span className="sr-only">Checking session…</span><Skeleton className="h-8 w-40" /><Skeleton className="h-24" /><Skeleton className="h-40" /></div>
      )}
      {auth.state === "error" && <ErrorState title="Admin is unavailable" message={auth.message} onRetry={() => { setAuth({ state: "checking" }); setAttempt((n) => n + 1); }} />}
      {auth.state === "out" && <AdminLogin notice={auth.notice} onSuccess={(email) => setAuth({ state: "in", email })} />}
      {auth.state === "in" && <AdminDashboard email={auth.email} onLogout={() => void onLogout()} onExpired={onExpired} />}
    </div>
  );
}
