"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Loader2,
  Mail,
  MailOpen,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import { formatDateTime, formatRelativeTime, initialsOf } from "@/lib/utils";
import type { ContactMessageDTO, MessageStatus } from "@/types/message";
import { StatusBadge, type MessageHandlers } from "./MessageTable";

interface Props extends MessageHandlers {
  message: ContactMessageDTO;
  onClose?: () => void;
  isInline?: boolean;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="relative inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-2.5 text-[11.5px] font-medium text-foreground transition-colors hover:bg-hover hover:border-accent/40 active:scale-[0.98]"
      title={label}
    >
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -26, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.9 }}
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-md bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background shadow-md whitespace-nowrap z-30"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-muted" />}
      <span>{label}</span>
    </button>
  );
}

/** macOS-style reading pane for a contact message. Supports both inline split-pane and mobile overlay. */
export function MessageDetail({ message: m, onClose, isInline = false, pending, onSetStatus, onDelete }: Props) {
  const busy = pending[m.id] === true;
  const toggleTo: MessageStatus = m.status === "unread" ? "read" : "unread";
  const toggleLabel = m.status === "unread" ? "Mark Read" : "Mark Unread";
  const archived = m.status === "archived";
  const archiveLabel = archived ? "Unarchive" : "Archive";

  const replyMailto = `mailto:${m.email}?subject=${encodeURIComponent(
    m.subject?.startsWith("Re:") ? m.subject : `Re: ${m.subject || "Portfolio Inquiry"}`
  )}`;

  const content = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {/* Top Header & Actions Bar */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mr-1 inline-flex size-8 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-foreground @2xl:hidden"
              aria-label="Back to messages"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
          )}
          <StatusBadge status={m.status} />
          <span className="flex items-center gap-1 text-[11.5px] text-muted">
            <Clock className="size-3 text-muted/70" aria-hidden="true" />
            {formatRelativeTime(m.createdAt)}
          </span>
        </div>

        {/* Primary Quick Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Direct 1-Click Email Reply (G) */}
          <a
            href={replyMailto}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-[12px] font-semibold text-accent-fg shadow-xs transition-transform hover:brightness-105 active:scale-[0.98]"
            title="Open email client to reply"
          >
            <Send className="size-3.5" aria-hidden="true" />
            <span>Reply via Email</span>
          </a>

          {/* Mark read / unread toggle */}
          {!archived && (
            <button
              type="button"
              onClick={() => onSetStatus(m, toggleTo)}
              disabled={busy}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-2.5 text-[11.5px] font-medium text-foreground transition-colors hover:bg-hover hover:border-accent/30 disabled:opacity-50"
              title={toggleLabel}
            >
              {busy ? (
                <Loader2 className="spin size-3.5" aria-hidden="true" />
              ) : m.status === "unread" ? (
                <MailOpen className="size-3.5 text-muted" aria-hidden="true" />
              ) : (
                <Mail className="size-3.5 text-muted" aria-hidden="true" />
              )}
              <span>{toggleLabel}</span>
            </button>
          )}

          {/* Archive / Unarchive */}
          <button
            type="button"
            onClick={() => onSetStatus(m, archived ? "read" : "archived")}
            disabled={busy}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-2.5 text-[11.5px] font-medium text-foreground transition-colors hover:bg-hover hover:border-accent/30 disabled:opacity-50"
            title={archiveLabel}
          >
            {busy ? (
              <Loader2 className="spin size-3.5" aria-hidden="true" />
            ) : archived ? (
              <ArchiveRestore className="size-3.5 text-warning" aria-hidden="true" />
            ) : (
              <Archive className="size-3.5 text-muted" aria-hidden="true" />
            )}
            <span>{archiveLabel}</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(m)}
            disabled={busy}
            className="grid size-8 place-items-center rounded-lg border border-danger/30 text-danger hover:bg-danger/10 disabled:opacity-50"
            title="Delete message"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </button>

          {onClose && !isInline && (
            <button
              type="button"
              onClick={onClose}
              className="hidden @2xl:grid size-8 place-items-center rounded-lg text-muted hover:bg-hover hover:text-foreground"
              aria-label="Close message"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Message Reader Body */}
      <div className="mac-scroll min-h-0 flex-1 space-y-4 p-4 @lg:p-6">
        {/* Subject Header */}
        <h2 className="text-[18px] font-bold tracking-tight text-foreground break-words">
          {m.subject || "(No subject provided)"}
        </h2>

        {/* Sender Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface p-3.5 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 font-semibold text-[13px] text-accent ring-1 ring-accent/30">
              {initialsOf(m.name) || <User className="size-4" />}
            </span>
            <div className="min-w-0">
              <span className="block truncate font-semibold text-[14px] text-foreground">{m.name}</span>
              <a
                href={`mailto:${m.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-[12.5px] text-accent hover:underline"
              >
                {m.email}
              </a>
            </div>
          </div>

          {/* Copy Shortcuts (H) */}
          <div className="flex items-center gap-1.5">
            <CopyButton text={m.email} label="Copy Email" />
            <CopyButton text={m.message} label="Copy Text" />
          </div>
        </div>

        {/* Message Text Body */}
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Message Content</h3>
          <div className="rounded-2xl border border-border/80 bg-surface p-4 text-[14px] leading-relaxed text-foreground shadow-2xs whitespace-pre-wrap break-words selection:bg-accent/25">
            {m.message}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="border-t border-border/70 pt-3 text-[11.5px] text-muted flex flex-wrap items-center justify-between gap-2">
          <span>Received: {formatDateTime(m.createdAt)}</span>
          <span className="font-mono text-[10.5px] text-muted/70">ID: {m.id}</span>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-background" onClick={(e) => e.stopPropagation()}>
      {content}
    </div>
  );
}
