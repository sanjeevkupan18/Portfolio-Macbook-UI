"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LogOut, RefreshCw, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";
import type { ContactMessageDTO, MessageStats, MessageStatus } from "@/types/message";
import { adminApi, isUnauthorized, type StatusFilter } from "./adminApi";
import { MessageDetail } from "./MessageDetail";
import { MessageCards, MessageTable, type MessageHandlers } from "./MessageTable";
import { useModal } from "@/hooks/useModal";

interface Result {
  key: string;
  messages: ContactMessageDTO[];
  hasMore: boolean;
  page: number;
  error?: string;
}

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

function ConfirmDelete({ message, busy, onCancel, onConfirm }: { message: ContactMessageDTO; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const { ref, onKeyDown } = useModal<HTMLDivElement>(onCancel);
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/35 p-4">
      <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby="del-title" aria-describedby="del-desc" tabIndex={-1} onKeyDown={onKeyDown} className="glass glass-panel w-full max-w-sm rounded-2xl p-5 text-center outline-none">
        <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-danger"><Trash2 className="size-5" aria-hidden="true" /></div>
        <h2 id="del-title" className="text-[15px] font-semibold">Delete this message?</h2>
        <p id="del-desc" className="mt-1 text-[13px] text-muted">The message from {message.name} will be permanently deleted. This can&apos;t be undone.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={onCancel} data-autofocus>Cancel</Button>
          <Button variant="danger" disabled={busy} onClick={onConfirm}>{busy ? "Deleting…" : "Delete"}</Button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  email: string;
  onLogout: () => void;
  onExpired: () => void;
}

export function AdminDashboard({ email, onLogout, onExpired }: Props) {
  const { notify } = useNotifications();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [pending, setPending] = useState<Record<string, true | undefined>>({});
  const [selected, setSelected] = useState<ContactMessageDTO | null>(null);
  const [toDelete, setToDelete] = useState<ContactMessageDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const key = `${filter}|${debounced}|${reload}`;
  useEffect(() => {
    let cancelled = false;
    void adminApi.list(filter, debounced, 1).then((res) => {
      if (cancelled) return;
      if (isUnauthorized(res)) return onExpired();
      if (res.ok) {
        setStats(res.data.stats);
        setResult({ key, messages: res.data.messages, hasMore: res.data.hasMore, page: res.data.page });
      } else {
        setResult({ key, messages: [], hasMore: false, page: 1, error: res.error.message });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key, filter, debounced, onExpired]);

  const loading = result?.key !== key;
  const messages = result?.messages ?? [];

  const loadMore = useCallback(async () => {
    if (!result) return;
    setLoadingMore(true);
    const res = await adminApi.list(filter, debounced, result.page + 1);
    setLoadingMore(false);
    if (isUnauthorized(res)) return onExpired();
    if (!res.ok) return notify({ title: "Couldn't load more", body: res.error.message, kind: "error" });
    const data = res.data;
    setStats(data.stats);
    setResult((r) => (r ? { ...r, messages: [...r.messages, ...data.messages.filter((m) => !r.messages.some((x) => x.id === m.id))], hasMore: data.hasMore, page: data.page } : r));
  }, [result, filter, debounced, notify, onExpired]);

  const setStatus = useCallback(
    async (m: ContactMessageDTO, status: MessageStatus, silent = false) => {
      setPending((p) => ({ ...p, [m.id]: true }));
      const res = await adminApi.setStatus(m.id, status);
      setPending((p) => ({ ...p, [m.id]: undefined }));
      if (isUnauthorized(res)) return onExpired();
      if (!res.ok) return notify({ title: "Couldn't update message", body: res.error.message, kind: "error" });
      const updated = res.data.message;
      setStats(res.data.stats);
      setSelected((s) => (s?.id === updated.id ? updated : s));
      setResult((r) =>
        r ? { ...r, messages: r.messages.flatMap((x) => (x.id !== updated.id ? [x] : filter !== "all" && filter !== updated.status ? [] : [updated])) } : r,
      );
      if (!silent) notify({ title: `Marked as ${status}`, body: updated.subject || updated.name, kind: "success", key: `msg-${updated.id}` });
    },
    [filter, notify, onExpired],
  );

  const onView = useCallback(
    (m: ContactMessageDTO) => {
      setSelected(m);
      if (m.status === "unread") void setStatus(m, "read", true);
    },
    [setStatus],
  );

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const res = await adminApi.remove(toDelete.id);
    setDeleting(false);
    if (isUnauthorized(res)) return onExpired();
    if (!res.ok) return notify({ title: "Couldn't delete message", body: res.error.message, kind: "error" });
    const id = toDelete.id;
    setStats(res.data.stats);
    setResult((r) => (r ? { ...r, messages: r.messages.filter((x) => x.id !== id) } : r));
    setSelected((s) => (s?.id === id ? null : s));
    setToDelete(null);
    notify({ title: "Message deleted", kind: "success" });
  };

  const handlers: MessageHandlers = useMemo(
    () => ({ pending, onView, onSetStatus: (m, s) => void setStatus(m, s), onDelete: setToDelete }),
    [pending, onView, setStatus],
  );

  const statCards: { label: string; value: number | undefined; filter: StatusFilter }[] = [
    { label: "Total Messages", value: stats?.total, filter: "all" },
    { label: "Unread", value: stats?.unread, filter: "unread" },
    { label: "Read", value: stats?.read, filter: "read" },
    { label: "Archived", value: stats?.archived, filter: "archived" },
  ];
  const countFor = (f: StatusFilter) => (f === "all" ? stats?.total : stats?.[f]);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h1 className="text-[15px] font-semibold">Inbox</h1>
          <p className="truncate text-[12px] text-muted">Signed in as {email}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setReload((n) => n + 1)} aria-label="Refresh messages"><RefreshCw className={cn("size-3.5", loading && "spin")} aria-hidden="true" />Refresh</Button>
          <Button size="sm" onClick={onLogout}><LogOut className="size-3.5" aria-hidden="true" />Sign out</Button>
        </div>
      </header>

      <div className="mac-scroll min-h-0 flex-1 space-y-4 p-4">
        <section aria-label="Message statistics" className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
          {statCards.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setFilter(c.filter)}
              aria-pressed={filter === c.filter}
              className={cn("rounded-xl bg-surface p-3 text-left shadow-[0_0_0_0.5px_var(--border)] transition-shadow hover:shadow-[0_0_0_1px_var(--accent)]", filter === c.filter && "shadow-[0_0_0_1.5px_var(--accent)]")}
            >
              <span className="block text-[12px] text-muted">{c.label}</span>
              {c.value === undefined ? <Skeleton className="mt-1 h-7 w-10" /> : <span className="block text-2xl font-semibold tabular-nums">{c.value}</span>}
            </button>
          ))}
        </section>

        <div className="flex flex-col gap-2 @xl:flex-row @xl:items-center @xl:justify-between">
          <div role="tablist" aria-label="Filter messages" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn("h-8 shrink-0 rounded-lg px-3 text-[13px] font-medium transition-colors", filter === f.value ? "bg-accent text-accent-fg" : "text-muted hover:bg-hover hover:text-foreground")}
              >
                {f.label}{countFor(f.value) !== undefined && <span className="ml-1.5 opacity-70 tabular-nums">{countFor(f.value)}</span>}
              </button>
            ))}
          </div>
          <label className="relative block @xl:w-64">
            <span className="sr-only">Search messages</span>
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages" className="h-9 w-full rounded-lg bg-surface pr-3 pl-8 text-[13px] shadow-[0_0_0_0.5px_var(--border)] outline-none focus:shadow-[0_0_0_2px_var(--accent)]" />
          </label>
        </div>

        <section aria-label="Messages" aria-busy={loading}>
          {loading && !result ? (
            <div role="status" className="space-y-2"><span className="sr-only">Loading messages</span>{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : result?.error ? (
            <ErrorState title="Couldn't load messages" message={result.error} onRetry={() => setReload((n) => n + 1)} />
          ) : messages.length === 0 ? (
            loading ? <Skeleton className="h-24" /> : <EmptyState title={debounced || filter !== "all" ? "No matches" : "No messages yet"} description={debounced || filter !== "all" ? "Try a different filter or search." : "Messages sent from the Contact app will appear here."} />
          ) : (
            <div className={cn("transition-opacity", loading && "opacity-60")}>
              <MessageTable messages={messages} {...handlers} />
              <MessageCards messages={messages} {...handlers} />
              {result?.hasMore && (
                <div className="mt-3 flex justify-center"><Button onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? "Loading…" : "Load more"}</Button></div>
              )}
            </div>
          )}
        </section>
      </div>

      {selected && <MessageDetail message={selected} onClose={() => setSelected(null)} {...handlers} />}
      {toDelete && <ConfirmDelete message={toDelete} busy={deleting} onCancel={() => setToDelete(null)} onConfirm={() => void confirmDelete()} />}
    </div>
  );
}
