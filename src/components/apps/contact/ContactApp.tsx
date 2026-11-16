"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  MapPin,
  Moon,
  Send,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
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

function ContactEmailItem({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    void navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="relative flex min-h-9 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-hover">
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none absolute -top-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-lg whitespace-nowrap"
          >
            <Check className="size-3 text-success" aria-hidden="true" />
            Copied to clipboard!
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={`mailto:${email}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-w-0 items-center gap-2.5 hover:text-accent"
        title="Send email"
      >
        <SocialIcon id="email" className="size-4 shrink-0 text-accent" />
        <span className="min-w-0 break-all">{email}</span>
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded p-1 text-muted transition hover:bg-surface hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Copy email to clipboard"
      >
        {copied ? (
          <Check className="size-3.5 text-success" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

function useKolkataTime() {
  const [timeStr, setTimeStr] = useState<string>("");
  const [isDay, setIsDay] = useState<boolean>(true);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const parts = formatter.formatToParts(now);
      const hourPart = parts.find((p) => p.type === "hour");
      const dayPeriod = parts.find((p) => p.type === "dayPeriod");
      let h = parseInt(hourPart?.value ?? "12", 10);
      if (dayPeriod?.value?.toLowerCase() === "pm" && h < 12) h += 12;
      if (dayPeriod?.value?.toLowerCase() === "am" && h === 12) h = 0;
      setIsDay(h >= 6 && h < 18);
      setTimeStr(formatter.format(now));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return { timeStr, isDay };
}

const TOPIC_STARTERS = [
  {
    id: "job",
    label: "💼 Job Opportunity",
    subject: "[Opportunity] Full Stack / Software Engineer Role",
  },
  {
    id: "internship",
    label: "🤝 Internship / Collab",
    subject: "[Collaboration] Project / Internship Opportunity",
  },
  {
    id: "project",
    label: "🚀 Project Inquiry",
    subject: "[Inquiry] Full Stack / MERN Development",
  },
  {
    id: "connect",
    label: "☕ Quick Connect",
    subject: "[Connect] Coffee Chat / Mentorship",
  },
];

const FAQ_ITEMS = [
  {
    q: "Are you open to relocation or remote roles?",
    a: "Yes! I am fully open to Onsite (Kolkata, Bangalore, Delhi NCR, Hyderabad, etc.), Hybrid, or Remote opportunities.",
  },
  {
    q: "When can you start?",
    a: "I am available immediately for internships, co-ops, and project contracts. I am set to graduate B.Tech in 2027.",
  },
  {
    q: "What is your primary engineering stack?",
    a: "My core stack is MERN (React, Next.js, Node.js, Express, MongoDB, MySQL, REST APIs & JWT Auth), along with GenAI & LLM integrations.",
  },
  {
    q: "How soon do you reply to messages?",
    a: "I typically reply to all recruiter and technical collaboration inquiries within 12 to 24 hours.",
  },
];

export function ContactApp({ launch }: AppProps) {
  void launch;
  const { notify } = useNotifications();
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const nameRef = useRef<HTMLInputElement | null>(null);

  const { timeStr, isDay } = useKolkataTime();

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

  const applyTopic = (subject: string) => {
    setValues((v) => ({ ...v, subject }));
    if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
    refs.current.message?.focus();
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
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-5 p-4 @2xl:grid-cols-[minmax(0,1fr)_18rem] @2xl:p-6">
          {/* Main Form Section */}
          <section
            aria-labelledby={id("title")}
            className="min-w-0 rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border)] transition-all duration-300 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_14px_28px_-10px_rgba(0,0,0,0.28),0_0_20px_-4px_color-mix(in_srgb,var(--accent)_20%,transparent)] @lg:p-5"
          >
            <div className="mb-4">
              <h1 id={id("title")} className="text-[18px] font-semibold tracking-tight">
                Get in touch
              </h1>
              <p className="mt-0.5 text-[13px] text-muted">Have a project, opportunity or question? Send a message directly.</p>
            </div>

            {sent ? (
              <div role="status" className="flex flex-col items-center gap-3.5 rounded-2xl border border-success/30 bg-[color-mix(in_srgb,var(--success)_8%,var(--surface))] p-8 text-center">
                <div className="relative">
                  <div className="grid size-14 place-items-center rounded-2xl bg-success/15 text-success shadow-inner">
                    <CheckCircle2 className="size-8" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <Sparkles className="absolute -top-1.5 -right-1.5 size-5 text-accent animate-pulse" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-[17px] font-semibold tracking-tight text-foreground">Message sent successfully!</h2>
                  <p className="max-w-sm text-[13px] text-muted leading-relaxed">
                    Thanks for reaching out! Sanjeev has received your message and will reply within 12–24 hours.
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <Button onClick={reset} variant="primary">
                    Send another message
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* 1-Click Inquiry Topic Pills */}
                <div className="mb-4 space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Quick Topic Starters:
                  </span>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick inquiry starters">
                    {TOPIC_STARTERS.map((t) => {
                      const isSelected = values.subject === t.subject;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyTopic(t.subject)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-all active:scale-[0.98]",
                            isSelected
                              ? "bg-accent text-accent-fg shadow-xs ring-1 ring-accent"
                              : "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] text-foreground hover:bg-hover hover:text-accent border border-border/50",
                          )}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                      placeholder="Write your message here…"
                    />
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">{err("message")}</div>
                      <p
                        id={id("count")}
                        className={cn(
                          "ml-auto shrink-0 text-[12px] tabular-nums",
                          overLimit ? "text-danger" : trimmedCount > 0 && trimmedCount < MESSAGE_MIN ? "text-warning" : "text-muted",
                        )}
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

                {/* FAQ Accordion Section */}
                <section className="mt-6 border-t border-border/70 pt-5 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="size-4 text-accent" aria-hidden="true" />
                    <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
                      Before You Reach Out (Quick FAQ)
                    </h2>
                  </div>

                  <div className="flex flex-col gap-2">
                    {FAQ_ITEMS.map((item, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div
                          key={item.q}
                          className="overflow-hidden rounded-xl border border-border/70 bg-[color-mix(in_srgb,var(--foreground)_2.5%,var(--surface))] transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="flex w-full items-center justify-between gap-3 p-3 text-left text-[12.5px] font-medium text-foreground hover:bg-hover transition-colors"
                            aria-expanded={isOpen}
                          >
                            <span>{item.q}</span>
                            <ChevronDown
                              className={cn("size-3.5 shrink-0 text-muted transition-transform duration-200", isOpen && "rotate-180 text-foreground")}
                              aria-hidden="true"
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-border/50 px-3 py-2.5 text-[12px] leading-relaxed text-muted bg-background/50">
                                  {item.a}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}
          </section>

          {/* Sidebar Section */}
          <aside aria-label="Contact details" className="flex min-w-0 flex-col gap-3.5 self-start">
            {/* Recruiter Availability & Target Roles Card */}
            {portfolio.availability && (
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/6 p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    {portfolio.availability.status}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    <Zap className="size-3 text-emerald-500" aria-hidden="true" />
                    12–24h SLA
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Target Roles</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {portfolio.availability.roles.map((r) => (
                      <span key={r} className="rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground border border-border/60">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-emerald-500/15 pt-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Availability</p>
                  <p className="mt-1 text-[12px] font-medium text-foreground leading-snug">
                    {portfolio.availability.period ?? "Open for Roles"}
                  </p>
                </div>
              </div>
            )}

            {/* Local Time & Timezone Widget */}
            <div className="rounded-2xl border border-border/80 bg-surface p-3.5 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-accent" aria-hidden="true" />
                  <span className="text-[12px] font-semibold text-foreground">Kolkata, India</span>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-muted font-medium">
                  {isDay ? <Sun className="size-3.5 text-amber-500" aria-hidden="true" /> : <Moon className="size-3.5 text-indigo-400" aria-hidden="true" />}
                  IST (UTC+5:30)
                </span>
              </div>
              <div className="text-[18px] font-mono font-semibold tracking-tight text-foreground tabular-nums">
                {timeStr || "Loading..."}
              </div>
              <p className="text-[11px] text-muted leading-tight">
                Active working hours: 09:30 AM – 10:00 PM IST
              </p>
            </div>

            {/* Contact Details Card */}
            <div className="rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border)] transition-all duration-300 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_14px_28px_-10px_rgba(0,0,0,0.28),0_0_20px_-4px_color-mix(in_srgb,var(--accent)_20%,transparent)] space-y-3">
              <h2 className="text-[13px] font-semibold">Direct Channels</h2>
              <ul className="flex flex-col gap-1">
                <li>
                  <ContactEmailItem email={portfolio.contact.email} />
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
                      className="flex min-h-9 items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-hover hover:text-accent"
                    >
                      <SocialIcon id={l.id} className="size-4 shrink-0 text-accent" />
                      <span>{l.label}</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>

              {/* 1-Click Download Resume Action */}
              <div className="border-t border-border pt-3">
                <a
                  href={portfolio.resume.file}
                  download={portfolio.resume.downloadName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-9 items-center justify-between gap-2 rounded-xl bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] px-3 py-2 text-[12.5px] font-medium text-foreground transition-all hover:bg-hover hover:text-accent active:scale-[0.99] border border-border/60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-4 shrink-0 text-accent transition-transform group-hover:scale-110" aria-hidden="true" />
                    <span className="truncate">Download Resume (CV)</span>
                  </div>
                  <Download className="size-3.5 shrink-0 text-muted transition-transform group-hover:translate-y-0.5 group-hover:text-accent" aria-hidden="true" />
                </a>
              </div>

              {portfolio.contact.responseNote && (
                <p className="border-t border-border pt-2.5 text-[11.5px] leading-relaxed text-muted">
                  {portfolio.contact.responseNote}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
