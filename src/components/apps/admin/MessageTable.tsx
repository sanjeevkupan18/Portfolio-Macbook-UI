"use client";

import type { ReactNode } from "react";
import { Archive, ArchiveRestore, Eye, Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatDateTime } from "@/lib/utils";
import type { ContactMessageDTO, MessageStatus } from "@/types/message";

export interface MessageHandlers {
  /** ids with an action in flight */
  pending: Record<string, true | undefined>;
  onView: (m: ContactMessageDTO) => void;
  onSetStatus: (m: ContactMessageDTO, status: MessageStatus) => void;
  onDelete: (m: ContactMessageDTO) => void;
}

const STATUS_LABEL: Record<MessageStatus, string> = { unread: "Unread", read: "Read", archived: "Archived" };

export function StatusBadge({ status }: { status: MessageStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        status === "unread" && "bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-accent",
        status === "read" && "bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)] text-muted",
        status === "archived" && "bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-warning",
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function UnreadDot({ unread }: { unread: boolean }) {
  return unread ? (
    <span className="inline-block size-2 shrink-0 rounded-full bg-accent" role="img" aria-label="Unread" />
  ) : (
    <span className="inline-block size-2 shrink-0" aria-hidden="true" />
  );
}

interface ActionsProps extends MessageHandlers {
  message: ContactMessageDTO;
  /** "icon" = square icon buttons (table); "text" = labelled buttons (cards, detail) */
  variant: "icon" | "text";
  showView?: boolean;
  className?: string;
}

export function MessageActions({ message: m, variant, showView = true, pending, onView, onSetStatus, onDelete, className }: ActionsProps) {
  const busy = pending[m.id] === true;
  const toggleTo: MessageStatus = m.status === "unread" ? "read" : "unread";
  const toggleLabel = m.status === "unread" ? "Mark Read" : "Mark Unread";
  const archived = m.status === "archived";
  const archiveLabel = archived ? "Unarchive" : "Archive";

  const items: { key: string; label: string; icon: ReactNode; onClick: () => void; danger?: boolean; hidden?: boolean }[] = [
    { key: "view", label: "View", icon: <Eye className="size-4" aria-hidden="true" />, onClick: () => onView(m), hidden: !showView },
    {
      key: "toggle",
      label: toggleLabel,
      icon: m.status === "unread" ? <MailOpen className="size-4" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />,
      onClick: () => onSetStatus(m, toggleTo),
      hidden: archived,
    },
    {
      key: "archive",
      label: archiveLabel,
      icon: archived ? <ArchiveRestore className="size-4" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />,
      onClick: () => onSetStatus(m, archived ? "read" : "archived"),
    },
    { key: "delete", label: "Delete", icon: <Trash2 className="size-4" aria-hidden="true" />, onClick: () => onDelete(m), danger: true },
  ];

  return (
    <div className={cn("flex items-center", variant === "icon" ? "gap-0.5" : "flex-wrap gap-1.5", className)} aria-busy={busy}>
      {items
        .filter((i) => !i.hidden)
        .map((i) =>
          variant === "icon" ? (
            <button
              key={i.key}
              type="button"
              onClick={i.onClick}
              disabled={busy && i.key !== "view"}
              aria-label={`${i.label} message from ${m.name}`}
              title={i.label}
              className={cn(
                "grid size-9 place-items-center rounded-lg transition-colors hover:bg-hover disabled:pointer-events-none disabled:opacity-50",
                i.danger ? "text-danger" : "text-muted hover:text-foreground",
              )}
            >
              {busy && i.key !== "view" && i.key !== "delete" ? <Loader2 className="spin size-4" aria-hidden="true" /> : i.icon}
            </button>
          ) : (
            <Button
              key={i.key}
              size="md"
              variant="secondary"
              onClick={i.onClick}
              disabled={busy && i.key !== "view"}
              className={cn("h-9", i.danger && "text-danger")}
            >
              {busy && i.key !== "view" ? <Loader2 className="spin size-4" aria-hidden="true" /> : i.icon}
              {i.label}
            </Button>
          ),
        )}
      {busy && <span className="sr-only" role="status">Updating message…</span>}
    </div>
  );
}

interface ListProps extends MessageHandlers {
  messages: ContactMessageDTO[];
}

/** Real table, shown at container widths >= @3xl. */
export function MessageTable({ messages, ...handlers }: ListProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl bg-surface shadow-[0_0_0_0.5px_var(--border)] @3xl:block">
      <table className="w-full table-fixed border-collapse text-left text-[13px]">
        <caption className="sr-only">Contact messages, newest first</caption>
        <colgroup>
          <col className="w-[17%]" />
          <col className="w-[21%]" />
          <col />
          <col className="w-[140px]" />
          <col className="w-[88px]" />
          <col className="w-[172px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
            <th scope="col" className="px-3 py-2 font-medium">Sender</th>
            <th scope="col" className="px-3 py-2 font-medium">Email</th>
            <th scope="col" className="px-3 py-2 font-medium">Subject</th>
            <th scope="col" className="px-3 py-2 font-medium">Date</th>
            <th scope="col" className="px-3 py-2 font-medium">Status</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((m) => {
            const unread = m.status === "unread";
            return (
              <tr key={m.id} className="border-b border-border last:border-b-0 hover:bg-hover">
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <UnreadDot unread={unread} />
                    <button
                      type="button"
                      onClick={() => handlers.onView(m)}
                      className={cn("min-h-9 min-w-0 truncate text-left hover:underline", unread ? "font-semibold" : "font-medium")}
                    >
                      {m.name}
                    </button>
                  </div>
                </td>
                <td className="truncate px-3 py-1.5 text-muted">
                  <a href={`mailto:${m.email}`} className="hover:underline" title={m.email}>
                    {m.email}
                  </a>
                </td>
                <td className={cn("truncate px-3 py-1.5", unread && "font-semibold")} title={m.subject || undefined}>
                  {m.subject || <span className="font-normal italic text-muted">(No subject)</span>}
                </td>
                <td className="px-3 py-1.5 text-[12px] text-muted">{formatDateTime(m.createdAt)}</td>
                <td className="px-3 py-1.5">
                  <StatusBadge status={m.status} />
                </td>
                <td className="px-2 py-1.5">
                  <MessageActions message={m} variant="icon" className="justify-end" {...handlers} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Card list, shown below @3xl. */
export function MessageCards({ messages, ...handlers }: ListProps) {
  return (
    <ul className="flex flex-col gap-2.5 @3xl:hidden" aria-label="Contact messages, newest first">
      {messages.map((m) => {
        const unread = m.status === "unread";
        return (
          <li key={m.id} className="rounded-xl bg-surface p-3 shadow-[0_0_0_0.5px_var(--border)]">
            <div className="flex items-start gap-2">
              <span className="mt-1.5">
                <UnreadDot unread={unread} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("min-w-0 break-words text-[14px]", unread ? "font-semibold" : "font-medium")}>{m.name}</p>
                  <StatusBadge status={m.status} />
                </div>
                <a href={`mailto:${m.email}`} className="block break-all text-[12px] text-muted hover:underline">
                  {m.email}
                </a>
                <p className={cn("mt-1 break-words text-[13px]", unread && "font-semibold")}>
                  {m.subject || <span className="font-normal italic text-muted">(No subject)</span>}
                </p>
                <p className="mt-0.5 line-clamp-2 break-words text-[12px] text-muted">{m.message}</p>
                <p className="mt-1 text-[11px] text-muted">{formatDateTime(m.createdAt)}</p>
              </div>
            </div>
            <MessageActions message={m} variant="text" className="mt-2.5" {...handlers} />
          </li>
        );
      })}
    </ul>
  );
}
