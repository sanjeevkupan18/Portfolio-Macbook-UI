"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCheck,
  Download,
  Inbox,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNotifications } from "@/context/NotificationContext";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { ContactMessageDTO, MessageStats, MessageStatus } from "@/types/message";
import { adminApi, isUnauthorized, type StatusFilter } from "./adminApi";
import { MessageDetail } from "./MessageDetail";
import { UnreadDot, type MessageHandlers } from "./MessageTable";
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

function ConfirmDelete({
  message,
  busy,
  onCancel,
  onConfirm,
}: {
  message: ContactMessageDTO;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { ref, onKeyDown } = useModal<HTMLDivElement>(onCancel);
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/45 p-4">
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-title"
        aria-describedby="del-desc"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="glass glass-panel w-full max-w-sm rounded-2xl p-5 text-center outline-none shadow-xl border border-border"
      >
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[color-mix(in_srgb,var(--danger)_16%,transparent)] text-danger">
          <Trash2 className="size-5" aria-hidden="true" />
        </div>
        <h2 id="del-title" className="text-[16px] font-semibold text-foreground">
          Delete this message?
        </h2>
        <p id="del-desc" className="mt-1 text-[13px] text-muted">
          The message from <span className="font-semibold text-foreground">{message.name}</span> will be permanently deleted.
        </p>
        <div className="mt-5 flex justify-center gap-2.5">
          <Button onClick={onCancel} data-autofocus variant="secondary">
            Cancel
          </Button>
          <Button variant="danger" disabled={busy} onClick={onConfirm}>
            {busy ? "Deleting…" : "Delete"}
          </Button>
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
  const messages = useMemo(() => result?.messages ?? [], [result?.messages]);

  const loadMore = useCallback(async () => {
    if (!result) return;
    setLoadingMore(true);
    const res = await adminApi.list(filter, debounced, result.page + 1);
    setLoadingMore(false);
    if (isUnauthorized(res)) return onExpired();
    if (!res.ok) return notify({ title: "Couldn't load more", body: res.error.message, kind: "error" });
    const data = res.data;
    setStats(data.stats);
    setResult((r) =>
      r
        ? {
            ...r,
            messages: [...r.messages, ...data.messages.filter((m) => !r.messages.some((x) => x.id === m.id))],
            hasMore: data.hasMore,
            page: data.page,
          }
        : r,
    );
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
        r
          ? {
              ...r,
              messages: r.messages.flatMap((x) =>
                x.id !== updated.id ? [x] : filter !== "all" && filter !== updated.status ? [] : [updated],
              ),
            }
          : r,
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

  // Export messages to CSV (I)
  const exportCSV = useCallback(() => {
    if (messages.length === 0) {
      notify({ title: "No messages to export", kind: "error" });
      return;
    }
    const headers = ["ID", "Date", "Name", "Email", "Subject", "Status", "Message"];
    const rows = messages.map((m) => [
      m.id,
      new Date(m.createdAt).toISOString(),
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.subject || "").replace(/"/g, '""')}"`,
      m.status,
      `"${(m.message || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `portfolio-messages-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify({ title: "Exported messages to CSV", kind: "success" });
  }, [messages, notify]);

  const handlers: MessageHandlers = useMemo(
    () => ({ pending, onView, onSetStatus: (m, s) => void setStatus(m, s), onDelete: setToDelete }),
    [pending, onView, setStatus],
  );

  const countFor = (f: StatusFilter) => (f === "all" ? stats?.total : stats?.[f]);

  const statCards: {
    label: string;
    value: number | undefined;
    filter: StatusFilter;
    icon: React.ReactNode;
    colorClass: string;
  }[] = [
    {
      label: "Total Messages",
      value: stats?.total,
      filter: "all",
      icon: <Mail className="size-4 text-sky-500" aria-hidden="true" />,
      colorClass: "hover:border-sky-500/40 hover:bg-sky-500/5",
    },
    {
      label: "Unread",
      value: stats?.unread,
      filter: "unread",
      icon: (
        <span className="relative flex size-3 items-center justify-center" aria-hidden="true">
          <span className="absolute inline-flex size-3 animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
      ),
      colorClass: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
    },
    {
      label: "Read",
      value: stats?.read,
      filter: "read",
      icon: <CheckCheck className="size-4 text-muted" aria-hidden="true" />,
      colorClass: "hover:border-foreground/30 hover:bg-foreground/5",
    },
    {
      label: "Archived",
      value: stats?.archived,
      filter: "archived",
      icon: <Archive className="size-4 text-purple-400" aria-hidden="true" />,
      colorClass: "hover:border-purple-500/40 hover:bg-purple-500/5",
    },
  ];

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-background">
      {/* Top Header Toolbar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold tracking-tight text-foreground">Admin Inbox</h1>
            {stats?.unread ? (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10.5px] font-bold text-accent-fg">
                {stats.unread} new
              </span>
            ) : null}
          </div>
          <p className="truncate text-[12px] text-muted">Signed in as {email}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Export to CSV (I) */}
          <Button size="sm" variant="secondary" onClick={exportCSV} title="Export current messages to CSV">
            <Download className="size-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </Button>

          {/* Refresh */}
          <Button size="sm" variant="secondary" onClick={() => setReload((n) => n + 1)} aria-label="Refresh messages">
            <RefreshCw className={cn("size-3.5", loading && "spin")} aria-hidden="true" />
            <span>Refresh</span>
          </Button>

          {/* Sign Out */}
          <Button size="sm" variant="ghost" onClick={onLogout} className="text-danger hover:bg-danger/10">
            <LogOut className="size-3.5" aria-hidden="true" />
            <span>Sign out</span>
          </Button>
        </div>
      </header>

      {/* Quick Widget Stats Row (F) */}
      <section aria-label="Message statistics" className="grid shrink-0 grid-cols-2 gap-2 border-b border-border bg-surface/50 p-3 @2xl:grid-cols-4">
        {statCards.map((c) => {
          const isActive = filter === c.filter;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => setFilter(c.filter)}
              aria-pressed={isActive}
              className={cn(
                "group relative flex items-center justify-between rounded-xl bg-surface p-2.5 text-left transition-all border border-border/80 shadow-2xs active:scale-[0.99]",
                c.colorClass,
                isActive && "border-accent ring-1 ring-accent bg-accent/5",
              )}
            >
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-muted uppercase tracking-wider">{c.label}</span>
                {c.value === undefined ? (
                  <Skeleton className="mt-1 h-6 w-8" />
                ) : (
                  <span className="block text-xl font-bold tabular-nums text-foreground tracking-tight">{c.value}</span>
                )}
              </div>
              <div className="grid size-8 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] transition-transform group-hover:scale-110">
                {c.icon}
              </div>
            </button>
          );
        })}
      </section>

      {/* Main Mail App 2-Pane Split View (E) */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Left Pane: Search, Filter Tabs & Message Items List */}
        <div
          className={cn(
            "flex min-h-0 flex-col bg-surface/40",
            selected ? "hidden @2xl:flex @2xl:w-80 @3xl:w-92 @2xl:shrink-0 @2xl:border-r @2xl:border-border" : "flex flex-1 @2xl:w-80 @3xl:w-92 @2xl:shrink-0 @2xl:border-r @2xl:border-border",
          )}
        >
          {/* Search & Status Filter bar */}
          <div className="flex shrink-0 flex-col gap-2 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages..."
                aria-label="Search messages"
                className="h-8.5 w-full rounded-lg bg-surface pr-8 pl-8 text-[12.5px] shadow-[0_0_0_0.5px_var(--border)] outline-none focus:shadow-[0_0_0_2px_var(--accent)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted hover:text-foreground p-1"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div role="tablist" aria-label="Filter messages" className="mac-scroll -mx-1 flex gap-1 overflow-x-auto px-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11.5px] font-medium transition-colors",
                    filter === f.value
                      ? "bg-accent text-accent-fg shadow-xs"
                      : "text-muted hover:bg-hover hover:text-foreground",
                  )}
                >
                  <span>{f.label}</span>
                  {countFor(f.value) !== undefined && (
                    <span className="opacity-80 tabular-nums text-[10px]">({countFor(f.value)})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll List */}
          <div className="mac-scroll min-h-0 flex-1 p-2 space-y-1.5">
            {loading && !result ? (
              <div role="status" className="space-y-2 p-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-18 rounded-xl" />
                ))}
              </div>
            ) : result?.error ? (
              <div className="p-3">
                <ErrorState title="Couldn't load messages" message={result.error} onRetry={() => setReload((n) => n + 1)} />
              </div>
            ) : messages.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title={debounced || filter !== "all" ? "No matches" : "Inbox empty"}
                  description={
                    debounced || filter !== "all"
                      ? "Try a different filter or search term."
                      : "New contact form submissions will appear here."
                  }
                  icon={<Inbox className="size-8" strokeWidth={1.5} />}
                />
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5" role="list">
                {messages.map((m) => {
                  const isSelected = selected?.id === m.id;
                  const isUnread = m.status === "unread";

                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => onView(m)}
                        aria-pressed={isSelected}
                        className={cn(
                          "group relative flex w-full flex-col gap-1 rounded-xl p-3 text-left transition-[background-color,box-shadow,transform] border",
                          isSelected
                            ? "bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))] border-accent shadow-xs"
                            : "bg-surface border-border/70 hover:bg-hover hover:border-accent/30",
                          isUnread && !isSelected && "border-accent/40 bg-accent/4 font-medium",
                        )}
                      >
                        {/* Top row: unread dot, sender name, relative time (J) */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <UnreadDot unread={isUnread} />
                            <span className={cn("truncate text-[13px]", isUnread ? "font-bold text-foreground" : "font-medium text-foreground/90")}>
                              {m.name}
                            </span>
                          </div>
                          <span className="shrink-0 text-[11px] text-muted whitespace-nowrap">
                            {formatRelativeTime(m.createdAt)}
                          </span>
                        </div>

                        {/* Subject line */}
                        <div className="truncate text-[12px] font-medium text-foreground/95">
                          {m.subject || "(No subject)"}
                        </div>

                        {/* Message snippet */}
                        <p className="line-clamp-2 text-[11.5px] leading-snug text-muted">
                          {m.message}
                        </p>
                      </button>
                    </li>
                  );
                })}

                {result?.hasMore && (
                  <div className="pt-2 pb-1 text-center">
                    <Button size="sm" variant="secondary" onClick={() => void loadMore()} disabled={loadingMore} className="w-full">
                      {loadingMore ? "Loading more…" : "Load more messages"}
                    </Button>
                  </div>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Right Pane: Reading Pane (Desktop Inline / Mobile Overlay) */}
        <div
          className={cn(
            "min-h-0 flex-1 flex-col overflow-hidden bg-background",
            selected ? "flex" : "hidden @2xl:flex",
          )}
        >
          {selected ? (
            <MessageDetail
              message={selected}
              isInline={true}
              onClose={() => setSelected(null)}
              {...handlers}
            />
          ) : (
            <div className="hidden size-full flex-col items-center justify-center gap-3 p-8 text-center text-muted @2xl:flex">
              <div className="grid size-16 place-items-center rounded-2xl bg-surface border border-border/80 shadow-2xs">
                <Inbox className="size-8 text-accent/70" strokeWidth={1.4} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-[15px] font-semibold text-foreground">No message selected</p>
                <p className="max-w-xs text-[12.5px] text-muted">
                  Choose a contact inquiry from the list on the left to read and reply.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {toDelete && (
        <ConfirmDelete
          message={toDelete}
          busy={deleting}
          onCancel={() => setToDelete(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </div>
  );
}
