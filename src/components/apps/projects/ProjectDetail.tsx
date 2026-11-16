"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Cpu,
  ExternalLink,
  FileText,
  Lightbulb,
  Lock,
  Sparkles,
  Target,
} from "lucide-react";
import { ButtonLink, Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/system/SocialIcon";
import { useLauncher } from "@/context/LauncherContext";
import type { Project } from "@/types/portfolio";
import { findSkillByTech } from "../skills/skillMatch";
import { ProjectMedia, StatusBadge } from "./ProjectCard";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

interface ProjectDetailProps {
  project: Project;
  prevProject?: Project | null;
  nextProject?: Project | null;
  onNavigate?: (id: string) => void;
}

export function ProjectDetail({
  project,
  prevProject,
  nextProject,
  onNavigate,
}: ProjectDetailProps) {
  const { openApp } = useLauncher();
  const [copiedClone, setCopiedClone] = useState(false);
  const hasLinks = Boolean(project.github || project.live || project.caseStudy);
  const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

  const liveDomain = project.live
    ? project.live.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : null;

  const copyGitClone = () => {
    if (!project.github) return;
    const cmd = `git clone ${project.github}.git`;
    void navigator.clipboard.writeText(cmd);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 pb-8 @lg:p-5 @lg:pb-10">
      {/* macOS Safari Browser Frame Mockup */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-surface/90 shadow-[0_0_0_0.5px_var(--border),0_18px_42px_-18px_rgba(0,0,0,0.45)]">
        {/* Safari Titlebar */}
        <div className="flex h-10 items-center gap-2 border-b border-border/70 bg-hover/40 px-2.5 @xs:gap-3 @xs:px-3.5">
          {/* Traffic Lights */}
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#ff5f56] shadow-xs" />
            <span className="size-3 rounded-full bg-[#ffbd2e] shadow-xs" />
            <span className="size-3 rounded-full bg-[#27c93f] shadow-xs" />
          </div>

          <div className="hidden @xs:flex shrink-0 items-center gap-1 text-muted" aria-hidden="true">
            <span className="grid size-6 place-items-center rounded-md hover:bg-hover">
              <ChevronLeft className="size-3.5" />
            </span>
            <span className="grid size-6 place-items-center rounded-md hover:bg-hover">
              <ChevronRight className="size-3.5" />
            </span>
          </div>

          {/* Safari URL Pill */}
          <div className="flex-1 min-w-0 max-w-md mx-auto">
            {project.live ? (
              <a
                href={project.live}
                {...ext}
                title="Open live URL in new tab"
                className="group flex h-7 items-center justify-center gap-1.5 rounded-lg bg-surface px-3 text-[11.5px] text-muted shadow-[0_0_0_0.5px_var(--border)] transition-colors hover:text-foreground hover:bg-hover"
              >
                <Lock className="size-3 text-emerald-500" aria-hidden="true" />
                <span className="font-mono truncate">{liveDomain}</span>
                <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ) : (
              <div className="flex h-7 items-center justify-center gap-1.5 rounded-lg bg-surface/60 px-3 text-[11.5px] text-muted/70 shadow-[0_0_0_0.5px_var(--border)]">
                <span className="font-mono truncate">{project.name.toLowerCase()}.internal</span>
              </div>
            )}
          </div>
        </div>

        {/* Browser Content Viewport */}
        <div className="relative aspect-[16/9] w-full @2xl:aspect-[2/1] overflow-hidden">
          <ProjectMedia project={project} size="hero" className="size-full" />
        </div>
      </div>

      {/* Header Info */}
      <header className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} />
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              <Sparkles className="size-3" aria-hidden="true" /> Featured Project
            </span>
          )}
          {project.stackLabel && (
            <span className="text-[12px] font-medium text-muted">{project.stackLabel}</span>
          )}
        </div>

        <h2 className="text-[22px] leading-tight font-semibold tracking-tight text-foreground @lg:text-[26px]">
          {project.name}
        </h2>
        <p className="text-[14px] leading-relaxed text-muted">{project.tagline}</p>

        {/* Action Links Bar */}
        {hasLinks && (
          <nav aria-label="Project links" className="mt-1 flex flex-wrap items-center gap-2">
            {project.live && (
              <ButtonLink href={project.live} variant="primary" className="h-9" {...ext}>
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Live Demo
              </ButtonLink>
            )}
            {project.github && (
              <>
                <ButtonLink href={project.github} variant="secondary" className="h-9" {...ext}>
                  <SocialIcon id="github" className="size-3.5" />
                  GitHub Repository
                </ButtonLink>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyGitClone}
                  className="h-9 gap-1.5 font-mono text-[12px]"
                >
                  {copiedClone ? (
                    <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <Copy className="size-3.5" aria-hidden="true" />
                  )}
                  {copiedClone ? "Copied clone command!" : "git clone"}
                </Button>
              </>
            )}
            {project.caseStudy && (
              <ButtonLink href={project.caseStudy} variant="secondary" className="h-9" {...ext}>
                <FileText className="size-3.5" aria-hidden="true" />
                Case Study
              </ButtonLink>
            )}
          </nav>
        )}
      </header>

      {/* Recruiter Metric Highlights */}
      {project.metrics && project.metrics.length > 0 && (
        <Section title="Key Metrics & Signals">
          <div className="grid grid-cols-2 gap-2.5 @lg:grid-cols-4">
            {project.metrics.map((metric) => (
              <div
                key={metric}
                className="flex items-center gap-2 rounded-xl bg-surface p-3 shadow-[0_0_0_0.5px_var(--border)]"
              >
                <span className="text-[12.5px] font-semibold text-foreground">{metric}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Overview */}
      <Section title="Overview">
        <p className="text-[14px] leading-relaxed text-foreground/90">{project.description}</p>
      </Section>

      {/* Engineering Architecture & Trade-offs */}
      {project.engineeringDecisions && (
        <Section title="Engineering Decisions & Architecture">
          <div className="rounded-xl border border-accent/25 bg-[color-mix(in_srgb,var(--accent)_6%,var(--surface))] p-4 shadow-[0_0_0_0.5px_var(--border)]">
            <div className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold text-accent uppercase tracking-wider">
              <Cpu className="size-4" aria-hidden="true" />
              <span>Architectural Trade-offs</span>
            </div>
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {project.engineeringDecisions}
            </p>
          </div>
        </Section>
      )}

      {/* Problem & Solution */}
      {(project.problem || project.solution) && (
        <div className="grid gap-3 @lg:grid-cols-2">
          {project.problem && (
            <div className="rounded-xl bg-surface p-3.5 shadow-[0_0_0_0.5px_var(--border)]">
              <h3 className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                <Target className="size-3.5 text-danger" aria-hidden="true" /> Problem
              </h3>
              <p className="text-[13px] leading-relaxed text-foreground/90">{project.problem}</p>
            </div>
          )}
          {project.solution && (
            <div className="rounded-xl bg-surface p-3.5 shadow-[0_0_0_0.5px_var(--border)]">
              <h3 className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                <Lightbulb className="size-3.5 text-success" aria-hidden="true" /> Solution
              </h3>
              <p className="text-[13px] leading-relaxed text-foreground/90">{project.solution}</p>
            </div>
          )}
        </div>
      )}

      {/* Architecture Steps Pipeline */}
      {project.architecture && project.architecture.length > 0 && (
        <Section title="Pipeline Architecture">
          <ol className="flex flex-col">
            {project.architecture.map((step, i, arr) => (
              <li key={step} className="relative flex gap-3 pb-3 last:pb-0">
                {i < arr.length - 1 && (
                  <span
                    className="absolute top-7 bottom-0 left-[13px] w-px bg-border"
                    aria-hidden="true"
                  />
                )}
                <span className="relative grid size-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[12px] font-semibold text-accent tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0 pt-1 text-[13px] leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Tech Stack Chips with Skills App links */}
      <Section title="Technologies Used">
        <ul className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => {
            const skill = findSkillByTech(t);
            const cls =
              "inline-flex min-h-8 items-center rounded-lg bg-surface px-2.5 text-[12.5px] font-medium shadow-[0_0_0_0.5px_var(--border)]";
            return (
              <li key={t}>
                {skill ? (
                  <button
                    type="button"
                    onClick={() => openApp("skills", { query: t })}
                    title={`Inspect ${skill.name} in Skills App`}
                    className={`${cls} transition-colors hover:bg-hover hover:text-accent`}
                  >
                    {t}
                  </button>
                ) : (
                  <span className={cls}>{t}</span>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      {/* Features Checklist */}
      {project.features.length > 0 && (
        <Section title="Key Production Features">
          <ul className="flex flex-col gap-2">
            {project.features.map((f) => (
              <li key={f} className="flex gap-2.5 text-[13px] leading-snug text-foreground/90">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Next / Previous Project Navigation Footer */}
      {(prevProject || nextProject) && (
        <footer className="mt-6 flex items-center justify-between border-t border-border pt-4">
          {prevProject ? (
            <button
              type="button"
              onClick={() => onNavigate?.(prevProject.id)}
              className="group flex items-center gap-2.5 text-left transition-colors"
            >
              <div className="grid size-8 place-items-center rounded-lg bg-hover group-hover:bg-accent group-hover:text-accent-fg transition-colors">
                <ChevronLeft className="size-4" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold uppercase text-muted">
                  Previous Project
                </span>
                <span className="text-[13px] font-medium text-foreground group-hover:text-accent transition-colors">
                  {prevProject.name}
                </span>
              </div>
            </button>
          ) : (
            <div />
          )}

          {nextProject ? (
            <button
              type="button"
              onClick={() => onNavigate?.(nextProject.id)}
              className="group flex items-center gap-2.5 text-right transition-colors"
            >
              <div>
                <span className="block text-[11px] font-semibold uppercase text-muted">
                  Next Project
                </span>
                <span className="text-[13px] font-medium text-foreground group-hover:text-accent transition-colors">
                  {nextProject.name}
                </span>
              </div>
              <div className="grid size-8 place-items-center rounded-lg bg-hover group-hover:bg-accent group-hover:text-accent-fg transition-colors">
                <ChevronRight className="size-4" />
              </div>
            </button>
          ) : (
            <div />
          )}
        </footer>
      )}
    </article>
  );
}
