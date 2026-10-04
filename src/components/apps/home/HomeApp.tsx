"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Download, GraduationCap, FolderOpen, Trophy, Send } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SocialIcon } from "@/components/system/SocialIcon";
import { useLauncher } from "@/context/LauncherContext";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/** Rotating headline phrases, derived from the CV (full-stack, REST APIs, AI features, data analytics). */
const PHRASES: { verb: string; text: string }[] = [
  { verb: "I build", text: "Full Stack Applications" },
  { verb: "I design", text: "REST APIs & Backend Systems" },
  { verb: "I create", text: "AI-Powered Features" },
  { verb: "I turn", text: "Data into Insights" },
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

function firstMatch(text: string | undefined, re: RegExp): string | undefined {
  return text?.match(re)?.[0];
}

export function HomeApp() {
  const { openApp } = useLauncher();
  const reduced = usePrefersReducedMotion();
  const { profile, socialLinks, resume, projects } = portfolio;

  const gate = portfolio.achievements.find((a) => /gate/i.test(a.title));
  const air = firstMatch(gate?.detail, /AIR\s*\d+/i);
  const gateYear = firstMatch(gate?.title, /20\d{2}/);
  const cgpa = firstMatch(portfolio.education[0]?.grade, /CGPA\s*[\d.]+/i)?.replace(/CGPA\s*/i, "");

  const highlights = [
    air ? { icon: Trophy, value: air, label: `GATE${gateYear ? ` ${gateYear}` : ""} · Computer Science` } : null,
    cgpa ? { icon: GraduationCap, value: cgpa, label: "B.Tech CGPA" } : null,
    projects.length > 0 ? { icon: FolderOpen, value: String(projects.length), label: projects.length === 1 ? "Project built" : "Projects built" } : null,
  ].filter((h): h is NonNullable<typeof h> => h !== null);

  const item = (i: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background">
      <div className="mac-scroll relative min-h-0 flex-1">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60" style={{ background: "radial-gradient(60% 100% at 20% 0%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%), radial-gradient(50% 90% at 90% 10%, color-mix(in srgb, #bf5af2 16%, transparent), transparent 70%)" }} />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-6 px-5 py-8 @lg:px-8 @lg:py-12">
          <motion.header {...item(0)} className="flex flex-col items-start gap-4 @lg:flex-row @lg:items-center @lg:gap-6">
            <div className="rounded-full p-[3px]" style={{ background: "conic-gradient(from 200deg, var(--accent), #bf5af2, #ff375f, var(--accent))" }}>
              <Avatar size={96} className="border-[3px] border-background" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-muted">Hello, I&apos;m</p>
              <h1 className="text-[28px] leading-tight font-bold tracking-tight @lg:text-4xl">{profile.name}</h1>
              <p className="mt-1 text-[15px] font-semibold text-accent">{profile.role}</p>
              {profile.roleAlternates.length > 0 && (
                <ul aria-label="Also" className="mt-2 flex flex-wrap gap-1.5">
                  {profile.roleAlternates.map((r) => (
                    <li key={r} className="rounded-full bg-surface px-2.5 py-0.5 text-[12px] text-muted shadow-[0_0_0_0.5px_var(--border)]">{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.header>

          <motion.div {...item(1)}>
            <RotatingHeadline />
          </motion.div>

          <motion.p {...item(2)} className="line-clamp-5 max-w-2xl text-[14px] leading-relaxed text-muted @md:line-clamp-none @lg:text-[15px]">
            {profile.summary}
          </motion.p>

          <motion.div {...item(3)} className="flex flex-wrap gap-2.5">
            <Button variant="primary" size="lg" onClick={() => openApp("projects")} className="min-h-10">
              View Projects <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button size="lg" onClick={() => openApp("contact")} className="min-h-10">
              <Send className="size-4" aria-hidden="true" /> Contact Me
            </Button>
            <ButtonLink size="lg" href={resume.file} download={resume.downloadName} className="min-h-10">
              <Download className="size-4" aria-hidden="true" /> Download Resume
            </ButtonLink>
          </motion.div>

          <motion.ul {...item(4)} aria-label="Social links" className="flex flex-wrap gap-2">
            {socialLinks.filter((s) => s.id !== "website").map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target={s.id === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.id === "email" ? `Email ${profile.name}` : `${s.label} (opens in a new tab)`}
                  className="grid size-10 place-items-center rounded-xl bg-surface text-foreground shadow-[0_0_0_0.5px_var(--border)] transition hover:-translate-y-0.5 hover:bg-surface-2"
                >
                  <SocialIcon id={s.id} className="size-5" />
                </a>
              </li>
            ))}
          </motion.ul>

          {highlights.length > 0 && (
            <motion.ul {...item(5)} aria-label="Highlights" className="grid grid-cols-1 gap-3 @md:grid-cols-3">
              {highlights.map((h) => (
                <li key={h.label} className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border),0_8px_24px_-14px_rgba(0,0,0,0.3)]">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-accent">
                    <h.icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl leading-none font-bold tabular-nums">{h.value}</p>
                    <p className="mt-1 text-[12px] text-muted">{h.label}</p>
                  </div>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </div>
  );
}
