"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Binary,
  Briefcase,
  Check,
  Code,
  Compass,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  GitPullRequest,
  GraduationCap,
  HeartHandshake,
  Layers,
  Lightbulb,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  User,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { AppProps } from "@/types/app";
import { portfolio } from "@/data/portfolio";
import { Avatar } from "@/components/ui/Avatar";
import { SocialIcon } from "@/components/system/SocialIcon";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useLaunch } from "@/hooks/useLaunch";
import { EducationTimeline } from "./EducationTimeline";

type SectionId =
  | "about"
  | "specs"
  | "journey"
  | "education"
  | "experience"
  | "philosophy"
  | "leadership"
  | "focus"
  | "achievements";

const card =
  "rounded-xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border),0_6px_18px_-12px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_14px_28px_-10px_rgba(0,0,0,0.28),0_0_20px_-4px_color-mix(in_srgb,var(--accent)_20%,transparent)]";

function Section({ id, title, icon: Icon, setRef, children }: { id: SectionId; title: string; icon: LucideIcon; setRef: (id: SectionId, el: HTMLElement | null) => void; children: ReactNode }) {
  return (
    <section ref={(el) => setRef(id, el)} data-section={id} aria-labelledby={`about-${id}`} className="scroll-mt-4">
      <h2 id={`about-${id}`} className="mb-3 flex items-center gap-2 text-[17px] font-semibold tracking-tight">
        <Icon className="size-[18px] text-accent" aria-hidden="true" /> {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((b) => (
        <li key={b} className="flex gap-2 text-[13px] leading-relaxed text-muted">
          <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

function CopyEmailPill({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    void navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="relative inline-flex items-center">
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

      <button
        type="button"
        onClick={handleCopy}
        className="group inline-flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-foreground shadow-[0_0_0_0.5px_var(--border)] transition hover:bg-hover hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Click to copy email to clipboard"
      >
        <SocialIcon id="email" className="size-3.5 text-accent" />
        <span className="truncate">{email}</span>
        {copied ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
            <Check className="size-3" aria-hidden="true" /> Copied
          </span>
        ) : (
          <Copy className="size-3 text-muted transition group-hover:text-foreground" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

const CORE_PILLARS: {
  title: string;
  icon: LucideIcon;
  description: string;
  highlight: string;
}[] = [
  {
    title: "Full-Stack Engineering",
    icon: Layers,
    description: "MERN stack, Next.js, TypeScript, RESTful API design & JWT auth.",
    highlight: "End-to-End Craft",
  },
  {
    title: "AI & Modern Integration",
    icon: Sparkles,
    description: "LLMs, Web Speech API, Prompt Engineering, HyperSwitch payment gateways.",
    highlight: "Applied GenAI",
  },
  {
    title: "Core CS & Problem Solving",
    icon: Binary,
    description: "GATE 2026 qualified (AIR 21041), 80+ DSA algorithmic challenges solved.",
    highlight: "Top 1% Fundamentals",
  },
  {
    title: "Ownership & Execution",
    icon: Workflow,
    description: "Writing PRDs, end-to-end CRM development, delivering on tight deadlines.",
    highlight: "Production Ready",
  },
];

const SYSTEM_SPECS = [
  {
    label: "OS Architecture",
    value: "Portfolio OS · Next.js 16 / React 19",
    highlight: "Modern Web",
  },
  {
    label: "Processor",
    value: "Fast learner · Problem solver",
    highlight: "High Bandwidth",
  },
  {
    label: "Memory Cache",
    value: "80+ DSA algorithms & patterns",
    highlight: "L1 LeetCode/GFG",
  },
  {
    label: "Primary Engines",
    value: "Node.js, Express, Next.js, MongoDB",
    highlight: "Full Stack MERN",
  },
  {
    label: "Availability",
    value: "Open for SDE & Full Stack Roles",
    highlight: "2023 – 2027",
  },
];

function SystemSpecsCard() {
  return (
    <div className={cn(card, "overflow-hidden p-0")}>
      <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#ff5f56] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]" />
            <span className="size-3 rounded-full bg-[#ffbd2e] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]" />
            <span className="size-3 rounded-full bg-[#27c93f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]" />
          </div>
          <span className="ml-2 font-mono text-[11.5px] font-medium text-muted">
            specs://sanjeev.local/system-profile
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-0.5 font-mono text-[10.5px] font-medium text-muted shadow-[0_0_0_0.5px_var(--border)]">
          <span className="size-1.5 rounded-full bg-success" />
          SYSTEM ONLINE
        </span>
      </div>

      <div className="p-4 @lg:p-5">
        <div className="flex flex-col gap-2.5">
          {SYSTEM_SPECS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col justify-between gap-1.5 border-b border-border/50 pb-2.5 last:border-none last:pb-0 @sm:flex-row @sm:items-center"
            >
              <div className="flex items-baseline gap-3">
                <span className="w-32 shrink-0 font-mono text-[12px] font-medium text-muted @sm:w-36">
                  {s.label}
                </span>
                <span className="text-[13px] font-medium text-foreground">
                  {s.value}
                </span>
              </div>
              <span className="self-start rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2.5 py-0.5 font-mono text-[10.5px] font-semibold text-accent @sm:self-auto">
                {s.highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const BEYOND_CODE = [
  {
    title: "Community Mentoring",
    icon: GraduationCap,
    badge: "Mentorship",
    description: "Mentored 10+ junior students in HTML, CSS & JavaScript bootcamps.",
  },
  {
    title: "Club Leadership",
    icon: Users,
    badge: "Robonixx Fest",
    description: "Organizer for Robonixx (annual robotics fest) coordinating 12 volunteers and 200+ participants.",
  },
  {
    title: "Open Source",
    icon: GitPullRequest,
    badge: "Community",
    description: "Documenting and contributing to open-source GitHub repositories.",
  },
  {
    title: "Hackathon Spirit",
    icon: Trophy,
    badge: "Champion",
    description: "1st place in College Hackathon (30+ teams) & Operation Debug champion.",
  },
];

const PHILOSOPHY_CONFIG: Record<
  string,
  {
    icon: LucideIcon;
    tag: string;
    gradientBorder: string;
    iconBg: string;
  }
> = {
  "Production-ready by default": {
    icon: ShieldCheck,
    tag: "Reliability",
    gradientBorder: "from-blue-500/40 via-indigo-500/20 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-500",
  },
  "Learn by building": {
    icon: Code,
    tag: "Hands-on",
    gradientBorder: "from-emerald-500/40 via-teal-500/20 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  "AI as a first-class feature": {
    icon: Sparkles,
    tag: "GenAI First",
    gradientBorder: "from-purple-500/40 via-pink-500/20 to-transparent",
    iconBg: "bg-purple-500/10 text-purple-500",
  },
  "Share what I learn": {
    icon: HeartHandshake,
    tag: "Community",
    gradientBorder: "from-amber-500/40 via-orange-500/20 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
};

export function AboutApp({ launch }: AppProps) {
  const reduced = usePrefersReducedMotion();
  const {
    profile,
    education,
    experience,
    timeline,
    philosophy,
    currentFocus,
    achievements,
    certifications,
    extraCurricular,
    socialLinks,
    resume,
  } = portfolio;
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionEls = useRef(new Map<SectionId, HTMLElement>());
  const [active, setActive] = useState<SectionId>("about");

  const sections: { id: SectionId; label: string; icon: LucideIcon; show: boolean }[] = [
    { id: "about", label: "About Me", icon: User, show: true },
    { id: "specs", label: "System Specs", icon: Cpu, show: true },
    { id: "journey", label: "Journey", icon: Route, show: timeline.length > 0 },
    { id: "education", label: "Education", icon: GraduationCap, show: education.length > 0 },
    { id: "experience", label: "Experience", icon: Briefcase, show: experience.length > 0 },
    { id: "philosophy", label: "Philosophy", icon: Lightbulb, show: philosophy.length > 0 },
    { id: "leadership", label: "Beyond Code", icon: HeartHandshake, show: true },
    { id: "focus", label: "Current Focus", icon: Target, show: currentFocus.length > 0 },
    { id: "achievements", label: "Achievements", icon: Award, show: achievements.length + certifications.length + extraCurricular.length > 0 },
  ];
  const visible = sections.filter((s) => s.show);
  const visibleKey = visible.map((s) => s.id).join();

  const setRef = useCallback((id: SectionId, el: HTMLElement | null) => {
    if (el) sectionEls.current.set(id, el);
    else sectionEls.current.delete(id);
  }, []);

  const scrollTo = useCallback(
    (id: SectionId) => {
      setActive(id);
      sectionEls.current.get(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [reduced],
  );

  useLaunch(launch, (params) => {
    const s = params?.section;
    if (s && visible.some((v) => v.id === s)) scrollTo(s as SectionId);
  });

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const seen = new Map<SectionId, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.section as SectionId;
          if (e.isIntersecting) seen.set(id, e.boundingClientRect.top);
          else seen.delete(id);
        }
        const first = [...seen.entries()].sort((a, b) => a[1] - b[1])[0];
        if (first) setActive(first[0]);
      },
      { root, rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );
    sectionEls.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [visibleKey]);

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background @2xl:flex-row">
      <nav aria-label="About sections" className="glass glass-sidebar hidden w-52 shrink-0 flex-col gap-0.5 border-r border-border p-2.5 @2xl:flex">
        {visible.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "relative flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] font-medium transition-colors",
                isActive ? "text-accent-fg" : "text-muted hover:bg-hover hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="about-active"
                  className="absolute inset-0 rounded-lg bg-accent shadow-sm"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30 }
                  }
                />
              )}
              <s.icon className="relative z-10 size-4 shrink-0" aria-hidden="true" />
              <span className="relative z-10">{s.label}</span>
            </button>
          );
        })}
      </nav>
      <nav aria-label="About sections" className="mac-scroll flex shrink-0 gap-2 overflow-x-auto touch-pan-x border-b border-border px-3 py-2 @2xl:hidden">
        {visible.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "relative min-h-9 shrink-0 rounded-full px-3.5 text-[12.5px] font-medium transition-colors",
                isActive ? "text-accent-fg" : "bg-surface text-muted shadow-[0_0_0_0.5px_var(--border)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="about-active-mobile"
                  className="absolute inset-0 rounded-full bg-accent shadow-sm"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30 }
                  }
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div ref={scrollRef} className="mac-scroll min-h-0 flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-9 px-4 py-6 @lg:px-8 @lg:py-8">
          <Section id="about" title="About Me" icon={Compass} setRef={setRef}>
            <div className="flex flex-col gap-4">
              {/* Hero Card */}
              <div className={cn(card, "flex flex-col gap-4.5 @lg:flex-row")}>
                <div className="size-20 shrink-0 self-center overflow-hidden rounded-full bg-white ring-1 ring-black/10 @lg:self-start">
                  <Avatar size={80} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-2.5 py-0.5 text-[11.5px] font-medium text-[color-mix(in_srgb,var(--success)_85%,var(--foreground))] shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--success)_35%,transparent)]">
                      <span className="relative flex size-1.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-[var(--success)]" />
                      </span>
                      Full Stack Intern @ Tapvera Technologies
                    </span>
                  </div>

                  <h3 className="mt-2 text-[18px] font-bold text-foreground">{profile.name}</h3>
                  <p className="text-[13px] font-medium text-accent">{profile.role}</p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{profile.summary}</p>

                  <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted">
                    <MapPin className="size-3.5" aria-hidden="true" /> {profile.location}
                  </div>

                  {/* Quick Action & Contact Bar */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
                    <CopyEmailPill email={profile.email} />

                    {socialLinks
                      .filter((l) => l.id === "linkedin" || l.id === "github")
                      .map((l) => (
                        <a
                          key={l.id}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-foreground shadow-[0_0_0_0.5px_var(--border)] transition hover:bg-hover hover:text-accent"
                        >
                          <SocialIcon id={l.id} className="size-3.5" />
                          <span>{l.label}</span>
                          <ExternalLink className="size-2.5 opacity-60" aria-hidden="true" />
                        </a>
                      ))}

                    <a
                      href={resume.file}
                      download={resume.downloadName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1 text-[12px] font-semibold text-accent-fg shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition hover:brightness-110 active:scale-95"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      <span>Download CV (Nov 2026)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* "What I Bring to the Team" Core Pillars Grid */}
              <div className="mt-1">
                <h3 className="mb-2.5 text-[11.5px] font-semibold tracking-wider text-muted uppercase">
                  What I Bring to the Team
                </h3>
                <div className="grid grid-cols-1 gap-3 @md:grid-cols-2">
                  {CORE_PILLARS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <article
                        key={p.title}
                        className={cn(
                          card,
                          "group relative flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_0.5px_var(--border),0_12px_24px_-10px_rgba(0,0,0,0.25)]"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="grid size-8 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent transition-transform duration-200 group-hover:scale-105">
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-0.5 text-[10.5px] font-semibold text-accent">
                              {p.highlight}
                            </span>
                          </div>
                          <h4 className="mt-2.5 text-[14px] font-semibold text-foreground">{p.title}</h4>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{p.description}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          <Section id="specs" title="System Specifications" icon={Cpu} setRef={setRef}>
            <SystemSpecsCard />
          </Section>

          {timeline.length > 0 && (
            <Section id="journey" title="Career & Developer Journey" icon={Route} setRef={setRef}>
              <EducationTimeline items={timeline} />
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" title="Education" icon={GraduationCap} setRef={setRef}>
              <div className="flex flex-col gap-3">
                {education.map((e) => (
                  <article key={e.id} className={card}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[14.5px] font-semibold">{e.degree}</h3>
                      <span className="text-[12px] text-muted tabular-nums">{e.start} – {e.end}</span>
                    </div>
                    <p className="text-[13px] text-accent">{e.institution}</p>
                    <p className="text-[12.5px] text-muted">{e.location}</p>
                    {e.grade && <p className="mt-2 inline-block rounded-full bg-hover px-2.5 py-0.5 text-[12px] font-medium">{e.grade}</p>}
                    {e.note && <p className="mt-2 text-[13px] text-muted">{e.note}</p>}
                  </article>
                ))}
              </div>
            </Section>
          )}

          {experience.length > 0 && (
            <Section id="experience" title="Experience" icon={Briefcase} setRef={setRef}>
              <div className="flex flex-col gap-3">
                {experience.map((x) => (
                  <article key={x.id} className={card}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[14.5px] font-semibold">{x.title}</h3>
                      <span className="text-[12px] text-muted tabular-nums">{x.start} – {x.end}</span>
                    </div>
                    <p className="text-[13px] text-accent">{x.company}</p>
                    <p className="mb-3 text-[12.5px] text-muted">{x.type} · {x.location}</p>
                    <BulletList items={x.bullets} />
                  </article>
                ))}
              </div>
            </Section>
          )}

          {philosophy.length > 0 && (
            <Section id="philosophy" title="Developer Philosophy" icon={Lightbulb} setRef={setRef}>
              <div className="grid grid-cols-1 gap-3.5 @lg:grid-cols-2">
                {philosophy.map((p) => {
                  const conf = PHILOSOPHY_CONFIG[p.title] ?? {
                    icon: Lightbulb,
                    tag: "Principle",
                    gradientBorder: "from-[color-mix(in_srgb,var(--accent)_35%,transparent)] via-border to-transparent",
                    iconBg: "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent",
                  };
                  const Icon = conf.icon;
                  return (
                    <article
                      key={p.title}
                      className={cn(
                        "group relative rounded-xl p-[1px] transition-all duration-300",
                        "bg-gradient-to-br shadow-[0_0_0_0.5px_var(--border),0_6px_18px_-12px_rgba(0,0,0,0.3)]",
                        "hover:-translate-y-1 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_40%,transparent),0_14px_28px_-10px_rgba(0,0,0,0.28),0_0_20px_-4px_color-mix(in_srgb,var(--accent)_22%,transparent)]",
                        conf.gradientBorder
                      )}
                    >
                      <div className="flex h-full flex-col justify-between rounded-[11px] bg-surface p-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("grid size-8 place-items-center rounded-lg transition-transform duration-200 group-hover:scale-105", conf.iconBg)}>
                              <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-0.5 text-[10.5px] font-semibold text-accent">
                              {conf.tag}
                            </span>
                          </div>
                          <h3 className="mt-2.5 text-[14px] font-semibold text-foreground">{p.title}</h3>
                          <p className="mt-1 text-[13px] leading-relaxed text-muted">{p.body}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Section>
          )}

          <Section id="leadership" title="Beyond Code & Leadership" icon={HeartHandshake} setRef={setRef}>
            <div className="grid grid-cols-1 gap-3 @md:grid-cols-2">
              {BEYOND_CODE.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className={cn(
                      card,
                      "group relative flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_0.5px_var(--border),0_12px_24px_-10px_rgba(0,0,0,0.25)]"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="grid size-8 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent transition-transform duration-200 group-hover:scale-105">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-2 py-0.5 text-[10.5px] font-semibold text-accent">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="mt-2.5 text-[14px] font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </Section>

          {currentFocus.length > 0 && (
            <Section id="focus" title="Current Focus" icon={Target} setRef={setRef}>
              <div className={card}>
                <BulletList items={currentFocus} />
              </div>
            </Section>
          )}

          {achievements.length + certifications.length + extraCurricular.length > 0 && (
            <Section id="achievements" title="Achievements & Certifications" icon={Award} setRef={setRef}>
              <div className="flex flex-col gap-5">
                {achievements.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
                    {achievements.map((a) => (
                      <article key={a.id} className={card}>
                        <h3 className="text-[14px] font-semibold">{a.title}</h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted">{a.detail}</p>
                      </article>
                    ))}
                  </div>
                )}
                {certifications.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-[13px] font-semibold text-muted">Certifications</h3>
                    <div className="flex flex-col gap-3">
                      {certifications.map((c) => (
                        <article key={c.id} className={card}>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <h4 className="text-[14px] font-semibold">{c.title}</h4>
                            <span className="text-[12px] text-muted tabular-nums">{c.year}</span>
                          </div>
                          <p className="text-[12.5px] text-accent">{c.issuer}</p>
                          <p className="mt-1 text-[13px] text-muted">{c.detail}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
                {extraCurricular.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-[13px] font-semibold text-muted">Extra-curricular</h3>
                    <div className={card}>
                      <BulletList items={extraCurricular} />
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
