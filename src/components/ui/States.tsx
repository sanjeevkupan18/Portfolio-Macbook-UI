import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="text-muted">{icon ?? <Inbox className="size-9" strokeWidth={1.5} aria-hidden="true" />}</div>
      <p className="text-[15px] font-semibold">{title}</p>
      {description && <p className="max-w-sm text-[13px] text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <AlertCircle className="size-9 text-danger" strokeWidth={1.5} aria-hidden="true" />
      <p className="text-[15px] font-semibold">{title}</p>
      {message && <p className="max-w-sm text-[13px] text-muted">{message}</p>}
      {onRetry && <Button size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-muted">
      <Loader2 className="spin size-4" aria-hidden="true" />
      <span className="text-[13px]">{label}</span>
    </span>
  );
}
