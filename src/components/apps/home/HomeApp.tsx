"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Download,
  GraduationCap,
  FolderOpen,
  Trophy,
  Send,
  GitCommit,
  Star,
  CheckCircle2,
  Command,
  ArrowUpRight,
} from "lucide-react";
import { portfolio, siteConfig } from "@/data/portfolio";
import { techIcons } from "@/data/techIcons";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SocialIcon } from "@/components/system/SocialIcon";
import { SkillLogo } from "@/components/apps/skills/SkillLogo";
import { AppIcon } from "@/components/system/AppIcon";
import { NamedIcon } from "@/components/system/icons";
import { useLauncher } from "@/context/LauncherContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import type { AppId } from "@/types/app";
import type { Skill } from "@/types/portfolio";

/** Rotating headline phrases, derived from the CV. */
const PHRASES: { verb: string; text: string }[] = [
  { verb: "I build", text: "Full Stack Applications" },
  { verb: "I design", text: "REST APIs & Backend Systems" },
  { verb: "I create", text: "AI-Powered Features" },
  { verb: "I engineer", text: "Scalable Software Solutions" },
];
const ROTATE_MS = 3000;

function RotatingHeadline() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = !reduced && !paused;

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % PHRASES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [active]);

  const current = PHRASES[reduced ? 0 : index] ?? PHRASES[0]!;
  const srSentence = `${PHRASES.map((p) => `${p.verb} ${p.text}`).join(". ")}.`;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-label="What I do"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="rounded-lg outline-offset-4"
    >
      <span className="sr-only">{srSentence}</span>
      <div aria-hidden="true" aria-live="off" className="flex min-h-[3.6rem] flex-col justify-center overflow-hidden @md:min-h-[2.4rem] @md:flex-row @md:items-baseline @md:gap-2.5">
        <span className="text-[15px] font-medium text-muted @md:text-lg">{current.verb}</span>
        <div className="relative h-8 overflow-hidden @md:h-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={current.text}
              initial={reduced ? false : { y: 18, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -18, opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="block whitespace-nowrap bg-gradient-to-r from-accent to-[#bf5af2] bg-clip-text text-xl font-semibold tracking-tight text-transparent @md:text-2xl"
            >
              {current.text}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Animated Number Counter ────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1200, decimals = 0 }: { value: number; duration?: number; decimals?: number }) {
  const reduced = usePrefersReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let start: number | null = null;
    let animId: number;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(progress === 1 ? value : parseFloat((ease * value).toFixed(decimals)));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [value, duration, decimals, reduced]);

  const displayed = reduced ? value : current;
  return <>{decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed).toLocaleString()}</>;
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge() {
  const exp = portfolio.experience[0];
  if (!exp) return null;
  const isPresent = /present/i.test(exp.end);
  const companyShort = exp.company.replace(/\s+Pvt\.?\s*Ltd\.?/i, "");
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-3 py-1 text-[12px] font-medium text-[color-mix(in_srgb,var(--success)_85%,var(--foreground))] shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--success)_35%,transparent)] transition-all hover:scale-[1.02]">
      <span className="relative flex size-2 shrink-0">
        {isPresent && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
        )}
        <span className="relative inline-flex size-2 rounded-full bg-[var(--success)]" />
      </span>
      <span className="truncate">
        Currently at <strong className="font-semibold text-foreground">{companyShort}</strong>
        <span className="hidden sm:inline text-muted"> · {exp.title}</span>
      </span>
    </span>
  );
}

// ─── Open to Work / Target Roles Banner ──────────────────────────────────────

function AvailabilityBanner({ onContact }: { onContact: () => void }) {
  const roles = portfolio.availability?.roles ?? [
    "MERN Stack Developer",
    "Full Stack Developer",
    "Software Engineer",
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border),0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
        <div className="flex items-start gap-3">
          <span className="relative mt-1 flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold tracking-wider text-accent uppercase">Open to Opportunities</span>
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-2 py-0.5 text-[10.5px] font-medium text-accent">
                2023 – 2027
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Target Roles:{" "}
              {roles.map((r, i) => (
                <span key={r}>
                  <strong className="font-medium text-foreground">{r}</strong>
                  {i < roles.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContact}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-[12.5px] font-semibold text-accent-fg shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition hover:brightness-110 active:scale-95"
        >
          <Send className="size-3.5" aria-hidden="true" /> Get in Touch
        </button>
      </div>
    </div>
  );
}

// ─── Quick App Navigation Dock ──────────────────────────────────────────────

function QuickNavDock({ openApp }: { openApp: (appId: AppId) => void }) {
  const apps: { id: AppId; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "resume", label: "Resume" },
    { id: "about", label: "About Me" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <section aria-label="Quick App Launcher" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest text-muted uppercase">Explore Applications</p>
        <span className="text-[11px] text-muted">Click to launch</span>
      </div>
      <div className="grid grid-cols-3 @xs:grid-cols-5 gap-2 @sm:gap-3">
        {apps.map((app) => (
          <button
            key={app.id}
            type="button"
            onClick={() => openApp(app.id)}
            className="group flex flex-col items-center gap-2 rounded-2xl bg-surface p-2.5 shadow-[0_0_0_0.5px_var(--border)] transition-all duration-200 hover:-translate-y-1 hover:bg-surface-2 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_10px_22px_-6px_rgba(0,0,0,0.25),0_0_16px_-2px_color-mix(in_srgb,var(--accent)_18%,transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="transition-transform duration-150 group-hover:scale-105">
              <AppIcon appId={app.id} size={42} />
            </div>
            <span className="truncate text-center text-[11.5px] font-medium text-foreground">
              {app.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ─── Terminal Developer Intro Block ─────────────────────────────────────────

function TerminalIntro() {
  const [copied, setCopied] = useState(false);
  const codeSnippet = `const sanjeev = {
  role: "Full Stack Developer",
  company: "Tapvera Technologies Pvt. Ltd.",
  stack: ["React", "Next.js", "Node.js", "MongoDB", "Express"],
  focus: ["Machine Learning", "GenAI", "System Design", "DSA"],
  status: "Open for Opportunities (2023-2027)"
};`;

  const copySnippet = () => {
    void navigator.clipboard?.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-[#1a1a20] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.35)]">
      {/* Titlebar */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#141418] px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-3 shrink-0 rounded-full bg-[#ff5f56]" />
          <span className="size-3 shrink-0 rounded-full bg-[#ffbd2e]" />
          <span className="size-3 shrink-0 rounded-full bg-[#27c93f]" />
          <span className="ml-2 truncate font-mono text-[11px] text-white/50">developer@macbook ~ sanjeev.ts</span>
        </div>
        <button
          type="button"
          onClick={copySnippet}
          className="shrink-0 rounded px-2 py-0.5 font-mono text-[11px] text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code Body */}
      <div className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed">
        <div className="flex items-center gap-2 text-white/40">
          <span className="text-[#27c93f]">$</span>
          <span>node --print sanjeev.profile</span>
        </div>
        <div className="mt-2 space-y-0.5">
          <p><span className="text-[#ff7b72]">const</span> <span className="text-[#79c0ff]">sanjeev</span> = &#123;</p>
          <p className="pl-4"><span className="text-[#7ee787]">role</span>: <span className="text-[#a5d6ff]">&quot;Full Stack Developer&quot;</span>,</p>
          <p className="pl-4"><span className="text-[#7ee787]">currentCompany</span>: <span className="text-[#a5d6ff]">&quot;Tapvera Technologies Pvt. Ltd.&quot;</span>,</p>
          <p className="pl-4"><span className="text-[#7ee787]">primaryStack</span>: [<span className="text-[#a5d6ff]">&quot;React&quot;</span>, <span className="text-[#a5d6ff]">&quot;Next.js&quot;</span>, <span className="text-[#a5d6ff]">&quot;Node.js&quot;</span>, <span className="text-[#a5d6ff]">&quot;MongoDB&quot;</span>],</p>
          <p className="pl-4"><span className="text-[#7ee787]">currentFocus</span>: [<span className="text-[#a5d6ff]">&quot;Machine Learning&quot;</span>, <span className="text-[#a5d6ff]">&quot;GenAI&quot;</span>, <span className="text-[#a5d6ff]">&quot;System Design&quot;</span>, <span className="text-[#a5d6ff]">&quot;DSA&quot;</span>],</p>
          <p className="pl-4"><span className="text-[#7ee787]">openToRoles</span>: <span className="text-[#ff7b72]">true</span></p>
          <p>&#125;;</p>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[#27c93f]">
          <span>➜</span>
          <span className="text-white/80">ready for new opportunities</span>
          <span className="inline-block size-2 animate-pulse bg-[#27c93f]" />
        </div>
      </div>
    </div>
  );
}

// ─── Currently Learning & Exploring ─────────────────────────────────────────

function LearningNowSection() {
  const items = portfolio.learningNow ?? [
    { label: "Machine Learning", icon: "Brain", note: "Foundations & algorithms" },
    { label: "Data Structures & Algorithms", icon: "Binary", note: "80+ problems on LeetCode & GFG" },
    { label: "System Design", icon: "Workflow", note: "Scalable architectures & databases" },
    { label: "GenAI", icon: "Sparkles", note: "LLMs, Prompt Engineering & RAG" },
    { label: "Building Projects", icon: "Code", note: "Full-stack MERN & AI apps" },
  ];

  return (
    <section aria-label="Currently Learning and Exploring" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest text-muted uppercase">Currently Learning &amp; Exploring</p>
        <span className="text-[11px] font-medium text-accent">Active Growth</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 @sm:grid-cols-2 @lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="group flex items-center gap-3 rounded-xl bg-surface p-3 shadow-[0_0_0_0.5px_var(--border)] transition duration-200 hover:-translate-y-0.5 hover:bg-surface-2 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_8px_18px_-4px_rgba(0,0,0,0.18),0_0_16px_-2px_color-mix(in_srgb,var(--accent)_18%,transparent)]"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent transition-transform duration-150 group-hover:scale-105">
              <NamedIcon name={item.icon} className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-foreground">{item.label}</p>
              {item.note && <p className="truncate text-[11.5px] text-muted">{item.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── GitHub Combined Activity (Visual Graph + Metrics) ──────────────────────

function GitHubActivity() {
  const username = "sanjeevkupan18";
  const profileUrl = `https://github.com/${username}`;
  const [useFallback, setUseFallback] = useState(false);

  // Deterministic SVG contribution calendar preview (18 weeks x 7 days)
  const calendarWeeks = useMemo(() => {
    const weeks: number[][] = [];
    for (let w = 0; w < 18; w++) {
      const days: number[] = [];
      for (let d = 0; d < 7; d++) {
        const seed = (w * 7 + d * 11 + 3) % 19;
        const level = seed > 15 ? 4 : seed > 11 ? 3 : seed > 7 ? 2 : seed > 3 ? 1 : 0;
        days.push(level);
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

  const LEVEL_CLASSES = [
    "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]",
    "bg-[#0e4429] dark:bg-[#003820]",
    "bg-[#006d32] dark:bg-[#006d32]",
    "bg-[#26a641] dark:bg-[#26a641]",
    "bg-[#39d353] dark:bg-[#39d353]",
  ];

  return (
    <section aria-label="GitHub Activity" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest text-muted uppercase">GitHub Activity &amp; Stats</p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline"
        >
          @{username} <ArrowUpRight className="size-3" aria-hidden="true" />
        </a>
      </div>

      <div className="rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border),0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_14px_28px_-10px_rgba(0,0,0,0.28),0_0_20px_-4px_color-mix(in_srgb,var(--accent)_20%,transparent)]">
        {/* Top metrics bar */}
        <div className="mb-4 grid grid-cols-2 gap-2 border-b border-border pb-3.5 @sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent">
              <GitCommit className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-foreground">15+ Repos</p>
              <p className="text-[11px] text-muted">Public Repositories</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success">
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-foreground">80+ Solved</p>
              <p className="text-[11px] text-muted">DSA Challenges</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-[color-mix(in_srgb,var(--warning)_85%,var(--foreground))]">
              <Star className="size-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-foreground">Open Source</p>
              <p className="text-[11px] text-muted">Active Contributor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent">
              <NamedIcon name="Code" className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-foreground">JS / TS / PY</p>
              <p className="text-[11px] text-muted">Primary Languages</p>
            </div>
          </div>
        </div>

        {/* Contribution visual graph */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11.5px] text-muted">
            <span className="flex items-center gap-1.5 font-medium">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
                <path d={techIcons.github?.path ?? ""} />
              </svg>
              Contribution Heatmap
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              Less
              <span className="inline-block size-2 rounded-xs bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]" />
              <span className="inline-block size-2 rounded-xs bg-[#0e4429]" />
              <span className="inline-block size-2 rounded-xs bg-[#006d32]" />
              <span className="inline-block size-2 rounded-xs bg-[#26a641]" />
              <span className="inline-block size-2 rounded-xs bg-[#39d353]" />
              More
            </span>
          </div>

          {!useFallback ? (
            <div className="mac-scroll overflow-x-auto touch-pan-x py-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://ghchart.rshah.org/00aa55/${username}`}
                alt={`${username}'s GitHub contribution calendar`}
                className="h-auto min-w-[580px] w-full max-w-full rounded-md"
                onError={() => setUseFallback(true)}
              />
            </div>
          ) : (
            <div className="mac-scroll flex items-center gap-1 overflow-x-auto touch-pan-x py-1">
              {calendarWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((level, di) => (
                    <span
                      key={di}
                      className={`size-2.5 rounded-xs ${LEVEL_CLASSES[level]}`}
                      title="Activity indicator"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Tech Stack Row ─────────────────────────────────────────────────────────

const HOME_SKILL_IDS = [
  "react",
  "node",
  "nextjs",
  "mongodb",
  "javascript",
  "tailwind",
  "express",
  "postgresql",
  "python",
  "git",
  "llm",
];

function TechSkillItem({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative flex shrink-0 flex-col items-center focus:outline-none"
      aria-label={skill.name}
    >
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-[0_0_0_0.5px_var(--border),0_4px_12px_rgba(0,0,0,0.25)]"
          >
            {skill.name}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface shadow-[0_0_0_0.5px_var(--border),0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 group-hover:-translate-y-1 group-hover:bg-surface-2 group-hover:shadow-[0_0_0_0.5px_var(--border),0_8px_20px_-6px_rgba(0,0,0,0.3)] group-focus-visible:ring-2 group-focus-visible:ring-accent">
        <SkillLogo skill={skill} size={22} />
      </div>
    </button>
  );
}

function TechStackRow({ openApp }: { openApp: (appId: AppId) => void }) {
  const homeSkills = HOME_SKILL_IDS
    .map((id) => portfolio.skills.find((s) => s.id === id))
    .filter((s): s is Skill => Boolean(s));

  return (
    <section aria-label="Core Tech Stack" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest text-muted uppercase">Core Tech Stack</p>
        <button
          type="button"
          onClick={() => openApp("skills")}
          className="inline-flex items-center gap-0.5 text-[11.5px] font-medium text-accent hover:underline"
        >
          All Skills <ArrowRight className="size-3" aria-hidden="true" />
        </button>
      </div>
      <div className="mac-scroll -mx-1 flex items-center gap-2.5 overflow-x-auto touch-pan-x px-1 py-1">
        {homeSkills.map((skill) => (
          <TechSkillItem
            key={skill.id}
            skill={skill}
            onClick={() => openApp("skills")}
          />
        ))}
      </div>
    </section>
  );
}

// ─── Achievement Spotlight ──────────────────────────────────────────────────

function AchievementSpotlight({ openApp }: { openApp: (appId: AppId) => void }) {
  const { achievements } = portfolio;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % achievements.length), 4500);
    return () => clearInterval(id);
  }, [achievements.length]);

  const current = achievements[index] ?? achievements[0];
  if (!current) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3.5 shadow-[0_0_0_0.5px_var(--border)] transition-all duration-300 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_14px_28px_-10px_rgba(0,0,0,0.28),0_0_20px_-4px_color-mix(in_srgb,var(--accent)_20%,transparent)]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--warning)_16%,transparent)] text-[color-mix(in_srgb,var(--warning)_85%,var(--foreground))]">
          <Trophy className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold tracking-wider text-muted uppercase">Achievement Spotlight</p>
          <p className="truncate text-[13px] font-semibold text-foreground">
            {current.title} <span className="font-normal text-muted">— {current.detail}</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => openApp("about")}
        className="shrink-0 text-[11.5px] font-medium text-accent hover:underline"
      >
        All Wins <ArrowRight className="inline size-3" aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Main HomeApp Component ─────────────────────────────────────────────────

export function HomeApp() {
  const { openApp } = useLauncher();
  const reduced = usePrefersReducedMotion();
  const { profile, socialLinks, resume, projects } = portfolio;

  const gate = portfolio.achievements.find((a) => /gate/i.test(a.title));
  const gateYear = gate?.title.match(/20\d{2}/)?.[0];
  const cgpaMatch = portfolio.education[0]?.grade?.match(/[\d.]+/)?.[0];
  const cgpaValue = cgpaMatch ? parseFloat(cgpaMatch) : null;

  const highlights = [
    {
      icon: Trophy,
      prefix: "AIR ",
      numeric: 21041,
      label: `GATE${gateYear ? ` ${gateYear}` : ""} · Computer Science`,
    },
    cgpaValue
      ? {
          icon: GraduationCap,
          numeric: cgpaValue,
          decimals: 1,
          suffix: " / 10",
          label: "B.Tech CGPA",
        }
      : null,
    projects.length > 0
      ? {
          icon: FolderOpen,
          numeric: projects.length,
          label: projects.length === 1 ? "Project built" : "Projects built",
        }
      : null,
  ].filter((h): h is NonNullable<typeof h> => h !== null);

  const item = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background">
      <div className="mac-scroll relative min-h-0 flex-1">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60"
          style={{
            background:
              "radial-gradient(60% 100% at 20% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), radial-gradient(50% 90% at 90% 10%, color-mix(in srgb, #bf5af2 16%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8 @lg:px-8 @lg:py-12">
          
          {/* Header */}
          <motion.header {...item(0)} className="flex flex-col items-start gap-4 @lg:flex-row @lg:items-center @lg:gap-6">
            <div className="rounded-full p-[3px]" style={{ background: "conic-gradient(from 200deg, var(--accent), #bf5af2, #ff375f, var(--accent))" }}>
              <Avatar size={96} className="border-[3px] border-background" />
            </div>
            <div className="min-w-0">
              <div className="mb-2">
                <StatusBadge />
              </div>
              <h1 className="text-[28px] leading-tight font-bold tracking-tight @lg:text-4xl">{profile.name}</h1>
              <p className="mt-1 text-[15px] font-semibold text-accent">{profile.role}</p>
              {profile.roleAlternates.length > 0 && (
                <ul aria-label="Also" className="mt-2 flex flex-wrap gap-1.5">
                  {profile.roleAlternates.map((r) => (
                    <li key={r} className="rounded-full bg-surface px-2.5 py-0.5 text-[12px] text-muted shadow-[0_0_0_0.5px_var(--border)]">
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.header>

          {/* Open to Work Banner */}
          <motion.div {...item(1)}>
            <AvailabilityBanner onContact={() => openApp("contact")} />
          </motion.div>

          {/* Rotating Headline */}
          <motion.div {...item(2)}>
            <RotatingHeadline />
          </motion.div>

          {/* Summary */}
          <motion.p {...item(3)} className="line-clamp-5 max-w-2xl text-[14px] leading-relaxed text-muted @md:line-clamp-none @lg:text-[15px]">
            {profile.summary}
          </motion.p>

          {/* CTAs with Resume "Updated Nov 2026" Badge */}
          <motion.div {...item(4)} className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" size="lg" onClick={() => openApp("projects")} className="min-h-10">
              View Projects <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button size="lg" onClick={() => openApp("contact")} className="min-h-10">
              <Send className="size-4" aria-hidden="true" /> Contact Me
            </Button>
            <div className="inline-flex items-center gap-2">
              <ButtonLink
                size="lg"
                href={resume.file}
                download={resume.downloadName}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-10"
              >
                <Download className="size-4" aria-hidden="true" /> Download Resume
              </ButtonLink>
              <span className="hidden rounded-full bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] px-2 py-0.5 text-[11px] font-medium text-muted @sm:inline-block">
                Updated Nov 2026
              </span>
            </div>
          </motion.div>

          {/* Keyboard Shortcut & Spotlight Tip */}
          <motion.div
            {...item(5)}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface/70 px-3.5 py-2 text-[12px] text-muted shadow-[0_0_0_0.5px_var(--border)] backdrop-blur-xs"
          >
            <span className="flex items-center gap-1.5">
              <Command className="size-3.5 text-accent" aria-hidden="true" />
              <span>
                Tip: Press{" "}
                <kbd className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-[0_0_0_0.5px_var(--border)]">
                  ⌘K
                </kbd>{" "}
                or{" "}
                <kbd className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground shadow-[0_0_0_0.5px_var(--border)]">
                  Ctrl+K
                </kbd>{" "}
                to launch Spotlight search
              </span>
            </span>
            <button
              type="button"
              onClick={() => openApp("about")}
              className="hidden font-medium text-accent hover:underline @sm:inline"
            >
              Explore OS →
            </button>
          </motion.div>

          {/* Social Links */}
          <motion.ul {...item(6)} aria-label="Social links" className="flex flex-wrap gap-2">
            {socialLinks
              .filter((s) => s.id !== "website")
              .map((s) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.id === "email" ? `Email ${profile.name}` : `${s.label} (opens in a new tab)`}
                    className="grid size-10 place-items-center rounded-xl bg-surface text-foreground shadow-[0_0_0_0.5px_var(--border)] transition hover:-translate-y-0.5 hover:bg-surface-2"
                  >
                    <SocialIcon id={s.id} className="size-5" />
                  </a>
                </li>
              ))}
          </motion.ul>

          {/* Animated Highlights with Hover Glow */}
          {highlights.length > 0 && (
            <motion.ul {...item(7)} aria-label="Highlights" className="grid grid-cols-1 gap-3 @md:grid-cols-3">
              {highlights.map((h) => (
                <li
                  key={h.label}
                  className="group relative flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border),0_8px_24px_-14px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_0_1px_var(--accent),0_12px_28px_-10px_color-mix(in_srgb,var(--accent)_25%,transparent)]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent transition-transform duration-200 group-hover:scale-110">
                    <h.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl leading-none font-bold tabular-nums text-foreground">
                      {h.prefix}
                      <AnimatedNumber value={h.numeric} decimals={h.decimals} />
                      {h.suffix}
                    </p>
                    <p className="mt-1 text-[12px] text-muted">{h.label}</p>
                  </div>
                </li>
              ))}
            </motion.ul>
          )}

          {/* Quick App Navigation Dock */}
          <motion.div {...item(8)}>
            <QuickNavDock openApp={openApp} />
          </motion.div>

          {/* Terminal Intro Block */}
          <motion.div {...item(9)}>
            <TerminalIntro />
          </motion.div>

          {/* Achievement Spotlight */}
          <motion.div {...item(10)}>
            <AchievementSpotlight openApp={openApp} />
          </motion.div>

          {/* Currently Learning & Exploring */}
          <motion.div {...item(11)}>
            <LearningNowSection />
          </motion.div>

          {/* GitHub Combined Activity */}
          <motion.div {...item(12)}>
            <GitHubActivity />
          </motion.div>

          {/* Tech Stack */}
          <motion.div {...item(13)}>
            <TechStackRow openApp={openApp} />
          </motion.div>

          {/* "Built with" Footer */}
          <motion.footer
            {...item(14)}
            className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-[12px] text-muted @sm:flex-row"
          >
            <p>© {new Date().getFullYear()} {profile.name} · Portfolio OS {siteConfig.version}</p>
            <p className="flex items-center gap-1.5">
              <span>Built with Next.js · TypeScript · Tailwind CSS · Motion</span>
            </p>
          </motion.footer>

        </div>
      </div>
    </div>
  );
}
