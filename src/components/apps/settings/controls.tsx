import type { ReactNode } from "react";

export function PaneTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 text-[20px] font-semibold tracking-tight">{children}</h2>;
}

/** Grouped card of rows, like a macOS System Settings group. */
export function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      {title && <h3 className="mb-1.5 px-1 text-[12px] font-semibold text-muted">{title}</h3>}
      <div className="divide-y divide-border rounded-xl bg-surface px-3.5 shadow-[0_0_0_0.5px_var(--border)]">{children}</div>
    </section>
  );
}

export function Row({ label, description, htmlFor, children }: { label: string; description?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
      <div className="min-w-0 flex-1 basis-40">
        <label htmlFor={htmlFor} className="block text-[13px] font-medium">{label}</label>
        {description && <p className="text-[12px] text-muted">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center">{children}</div>
    </div>
  );
}
