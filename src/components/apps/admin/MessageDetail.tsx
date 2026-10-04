"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import type { ContactMessageDTO } from "@/types/message";
import { MessageActions, StatusBadge, type MessageHandlers } from "./MessageTable";
import { useModal } from "@/hooks/useModal";

interface Props extends MessageHandlers {
  message: ContactMessageDTO;
  onClose: () => void;
}

/** macOS-style sheet showing a single contact message. All user text is rendered as plain React text. */
export function MessageDetail({ message: m, onClose, ...handlers }: Props) {
  const { ref, onKeyDown } = useModal<HTMLDivElement>(onClose);
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/30 p-3 @sm:p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="msg-detail-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="glass glass-panel flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-2xl outline-none"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 id="msg-detail-title" className="truncate text-[15px] font-semibold">{m.subject || "(No subject)"}</h2>
            <div className="mt-1"><StatusBadge status={m.status} /></div>
          </div>
          <Button variant="ghost" size="sm" aria-label="Close message" onClick={onClose} data-autofocus><X className="size-4" aria-hidden="true" /></Button>
        </div>
        <div className="mac-scroll min-h-0 flex-1 space-y-4 px-5 py-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
            <dt className="text-muted">Name</dt><dd className="min-w-0 break-words">{m.name}</dd>
            <dt className="text-muted">Email</dt><dd className="min-w-0 break-all"><a className="text-accent underline-offset-2 hover:underline" href={`mailto:${m.email}`}>{m.email}</a></dd>
            <dt className="text-muted">Subject</dt><dd className="min-w-0 break-words">{m.subject || "—"}</dd>
            <dt className="text-muted">Date</dt><dd>{formatDateTime(m.createdAt)}</dd>
            <dt className="text-muted">Status</dt><dd className="capitalize">{m.status}</dd>
          </dl>
          <div>
            <h3 className="mb-1 text-[12px] font-medium uppercase tracking-wide text-muted">Message</h3>
            <p className="whitespace-pre-wrap break-words rounded-xl bg-surface p-3 text-[14px] shadow-[0_0_0_0.5px_var(--border)]">{m.message}</p>
          </div>
        </div>
        <div className="border-t border-border px-5 py-3">
          <MessageActions message={m} variant="text" showView={false} {...handlers} />
        </div>
      </div>
    </div>
  );
}
