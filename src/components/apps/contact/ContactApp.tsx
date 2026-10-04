"use client";

import { useCallback, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/system/SocialIcon";
import { useNotifications } from "@/context/NotificationContext";
import { portfolio } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { MESSAGE_MAX, MESSAGE_MIN, contactSchema, fieldErrorsFrom } from "@/lib/validation";
import type { ApiResponse } from "@/types/message";
import type { AppProps } from "@/types/app";

type FieldName = "name" | "email" | "subject" | "message";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["name", "email", "subject", "message"];
const EMPTY: Values = { name: "", email: "", subject: "", message: "" };

function isField(key: string): key is FieldName {
  return (FIELD_ORDER as string[]).includes(key);
}

function validate(values: Values): Errors {
  const result = contactSchema.safeParse({ ...values, company: "" });
  if (result.success) return {};
  const raw = fieldErrorsFrom(result.error);
  const out: Errors = {};
  for (const [k, v] of Object.entries(raw)) if (isField(k)) out[k] = v;
  return out;
}

async function sendMessage(values: Values): Promise<ApiResponse<{ id: string }>> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, company: "" }),
    });
    try {
      return (await res.json()) as ApiResponse<{ id: string }>;
    } catch {
      return { ok: false, error: { code: "bad_response", message: `Unexpected server response (${res.status}). Please try again.` } };
    }
  } catch {
    return { ok: false, error: { code: "network_error", message: "Couldn't reach the server. Check your connection and try again." } };
  }
}

export function ContactApp({ launch }: AppProps) {
  void launch;
  const { notify } = useNotifications();
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const nameRef = useRef<HTMLInputElement | null>(null);

  const id = (f: string) => `${uid}-${f}`;

  const focusFirst = useCallback((errs: Errors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (first) refs.current[first]?.focus();
  }, []);

  const onChange = (field: FieldName) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onBlur = (field: FieldName) => () => {
    if (!values[field] && !errors[field]) return;
    const msg = validate(values)[field];
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setServerError(null);
      focusFirst(errs);
      return;
    }
    setSending(true);
    setServerError(null);
    const res = await sendMessage(values);
    setSending(false);
    if (res.ok) {
      setSent(true);
      setValues(EMPTY);
      setErrors({});
      notify({ title: "Message sent successfully.", kind: "success", appId: "contact" });
      return;
    }
    const fe: Errors = {};
    for (const [k, v] of Object.entries(res.error.fieldErrors ?? {})) if (isField(k)) fe[k] = v;
    setErrors(fe);
    setServerError(res.error.message || "Something went wrong. Please try again.");
    if (Object.keys(fe).length > 0) focusFirst(fe);
  };

  const reset = () => {
    setSent(false);
    setServerError(null);
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  const count = values.message.length;
  const trimmedCount = values.message.trim().length;
  const overLimit = count > MESSAGE_MAX;

  const inputCls = (f: FieldName) =>
    cn(
      "w-full rounded-lg bg-surface px-3 text-[14px] text-foreground placeholder:text-muted/70 shadow-[0_0_0_0.5px_var(--border)] outline-none transition-shadow focus:shadow-[0_0_0_2px_var(--accent)]",
      errors[f] && "shadow-[0_0_0_1.5px_var(--danger)] focus:shadow-[0_0_0_2px_var(--danger)]",
    );

  const fieldProps = (f: FieldName) => ({
    id: id(f),
    value: values[f],
    onChange: onChange(f),
    onBlur: onBlur(f),
    disabled: sending,
    "aria-invalid": errors[f] ? (true as const) : undefined,
    "aria-describedby": errors[f] ? id(`${f}-err`) : f === "message" ? id("count") : undefined,
    className: inputCls(f),
  });

  const err = (f: FieldName) =>
    errors[f] ? (
      <p id={id(`${f}-err`)} className="mt-1 text-[12px] text-danger">
        {errors[f]}
      </p>
    ) : null;

  const labelCls = "mb-1 block text-[12px] font-medium text-muted";

  const links = portfolio.socialLinks.filter((l) => l.id === "linkedin" || l.id === "github");

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background">
      <div className="mac-scroll min-h-0 flex-1">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 p-4 @2xl:grid-cols-[minmax(0,1fr)_16rem] @2xl:p-6">
          <section aria-labelledby={id("title")} className="min-w-0 rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border)] @lg:p-5">
            <h1 id={id("title")} className="text-[18px] font-semibold tracking-tight">
              Get in touch
            </h1>
            <p className="mb-4 mt-0.5 text-[13px] text-muted">Have a project, opportunity or question? Send a message.</p>

            {sent ? (
              <div role="status" className="flex flex-col items-center gap-3 rounded-xl bg-background px-4 py-10 text-center">
                <CheckCircle2 className="size-11 text-success" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-[16px] font-semibold">Message sent successfully.</p>
                <p className="max-w-xs text-[13px] text-muted">Thanks for reaching out. I&apos;ll get back to you soon.</p>
                <Button onClick={reset}>Send another</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="relative flex flex-col gap-3.5" aria-busy={sending}>
                {serverError && (
                  <div role="alert" className="flex items-start gap-2 rounded-lg bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-3 py-2.5 text-[13px] text-danger">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3.5 @lg:grid-cols-2">
                  <div>
                    <label htmlFor={id("name")} className={labelCls}>
                      Name
                    </label>
                    <input
                      {...fieldProps("name")}
                      ref={(el) => {
                        refs.current.name = el;
                        nameRef.current = el;
                      }}
                      type="text"
                      autoComplete="name"
                      className={cn(inputCls("name"), "h-10")}
                      placeholder="Your name"
                    />
                    {err("name")}
                  </div>
                  <div>
                    <label htmlFor={id("email")} className={labelCls}>
                      Email
                    </label>
                    <input
                      {...fieldProps("email")}
                      ref={(el) => {
                        refs.current.email = el;
                      }}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      className={cn(inputCls("email"), "h-10")}
                      placeholder="you@example.com"
                    />
                    {err("email")}
                  </div>
                </div>

                <div>
                  <label htmlFor={id("subject")} className={labelCls}>
                    Subject <span className="font-normal">(optional)</span>
                  </label>
                  <input
                    {...fieldProps("subject")}
                    ref={(el) => {
                      refs.current.subject = el;
                    }}
                    type="text"
                    autoComplete="off"
                    className={cn(inputCls("subject"), "h-10")}
                    placeholder="What's this about?"
                  />
                  {err("subject")}
                </div>

                <div>
                  <label htmlFor={id("message")} className={labelCls}>
                    Message
                  </label>
                  <textarea
                    {...fieldProps("message")}
                    ref={(el) => {
                      refs.current.message = el;
                    }}
                    rows={6}
                    className={cn(inputCls("message"), "min-h-32 resize-y py-2.5 leading-relaxed")}
                    placeholder="Write your message…"
                  />
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">{err("message")}</div>
                    <p
                      id={id("count")}
                      className={cn("ml-auto shrink-0 text-[12px] tabular-nums", overLimit ? "text-danger" : trimmedCount > 0 && trimmedCount < MESSAGE_MIN ? "text-warning" : "text-muted")}
                    >
                      {count} / {MESSAGE_MAX}
                      {trimmedCount > 0 && trimmedCount < MESSAGE_MIN ? ` (min ${MESSAGE_MIN})` : ""}
                    </p>
                  </div>
                </div>

                {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
                <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden opacity-0">
                  <label htmlFor={id("company")}>Company</label>
                  <input id={id("company")} name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                </div>

                <div className="flex items-center justify-end">
                  <Button type="submit" variant="primary" size="lg" disabled={sending} className="w-full @lg:w-auto">
                    {sending ? <Loader2 className="spin size-4" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
                    {sending ? "Sending…" : "Send Message"}
                  </Button>
                </div>
              </form>
            )}
          </section>

          <aside aria-label="Contact details" className="flex min-w-0 flex-col gap-3 self-start rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border)]">
            <h2 className="text-[13px] font-semibold">Contact details</h2>
            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-hover"
                >
                  <SocialIcon id="email" className="size-4 shrink-0 text-accent" />
                  <span className="min-w-0 break-all">{portfolio.contact.email}</span>
                </a>
              </li>
              <li className="flex min-h-9 items-center gap-2.5 px-2 py-1.5 text-[13px]">
                <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0">{portfolio.contact.location}</span>
              </li>
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-hover"
                  >
                    <SocialIcon id={l.id} className="size-4 shrink-0 text-accent" />
                    <span>{l.label}</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
            {portfolio.contact.responseNote && <p className="border-t border-border pt-3 text-[12px] leading-relaxed text-muted">{portfolio.contact.responseNote}</p>}
          </aside>
        </div>
      </div>
    </div>
  );
}
