"use client";

import type { ReactNode } from "react";
import { Check, ExternalLink, FileText, Lightbulb, Target } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
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

export function ProjectDetail({ project }: { project: Project }) {
  const { openApp } = useLauncher();
  const hasLinks = Boolean(project.github || project.live || project.caseStudy);
  const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 pb-8 @lg:p-5 @lg:pb-10">
      <ProjectMedia project={project} size="hero" className="aspect-[16/9] w-full rounded-2xl shadow-[0_0_0_0.5px_var(--border),0_18px_40px_-20px_rgba(0,0,0,0.5)] @2xl:aspect-[2/1]" />

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} />
          {project.featured && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-2 py-0.5 text-[11px] font-medium text-muted">Featured</span>
          )}
          {project.stackLabel && <span className="text-[12px] text-muted">{project.stackLabel}</span>}
        </div>
        <h2 className="text-[22px] leading-tight font-semibold tracking-tight @lg:text-[26px]">{project.name}</h2>
        <p className="text-[14px] text-muted">{project.tagline}</p>
        {hasLinks && (
          <nav aria-label="Project links" className="mt-1 flex flex-wrap gap-2">
            {project.live && (
              <ButtonLink href={project.live} variant="primary" className="h-9" {...ext}>
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Live Demo
              </ButtonLink>
            )}
            {project.github && (
              <ButtonLink href={project.github} variant="secondary" className="h-9" {...ext}>
                <SocialIcon id="github" className="size-3.5" />
                GitHub
              </ButtonLink>
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

      <Section title="Overview">
        <p className="text-[14px] leading-relaxed">{project.description}</p>
      </Section>

      {(project.problem || project.solution) && (
        <div className="grid gap-3 @lg:grid-cols-2">
          {project.problem && (
            <div className="rounded-xl bg-surface p-3.5 shadow-[0_0_0_0.5px_var(--border)]">
              <h3 className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                <Target className="size-3.5 text-danger" aria-hidden="true" /> Problem
              </h3>
              <p className="text-[13px] leading-relaxed">{project.problem}</p>
            </div>
          )}
          {project.solution && (
            <div className="rounded-xl bg-surface p-3.5 shadow-[0_0_0_0.5px_var(--border)]">
              <h3 className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                <Lightbulb className="size-3.5 text-success" aria-hidden="true" /> Solution
              </h3>
              <p className="text-[13px] leading-relaxed">{project.solution}</p>
            </div>
          )}
        </div>
      )}

      {project.architecture && project.architecture.length > 0 && (
        <Section title="Architecture">
          <ol className="flex flex-col">
            {project.architecture.map((step, i, arr) => (
              <li key={step} className="relative flex gap-3 pb-3 last:pb-0">
                {i < arr.length - 1 && <span className="absolute top-7 bottom-0 left-[13px] w-px bg-border" aria-hidden="true" />}
                <span className="relative grid size-7 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[12px] font-semibold text-accent tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0 pt-1 text-[13px] leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section title="Tech stack">
        <ul className="flex flex-wrap gap-1.5">
          {project.tech.map((t) => {
            const skill = findSkillByTech(t);
            const cls = "inline-flex min-h-8 items-center rounded-lg bg-surface px-2.5 text-[12.5px] font-medium shadow-[0_0_0_0.5px_var(--border)]";
            return (
              <li key={t}>
                {skill ? (
                  <button
                    type="button"
                    onClick={() => openApp("skills", { query: t })}
                    title={`See ${skill.name} in Skills`}
                    className={`${cls} transition-colors hover:bg-hover`}
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

      {project.features.length > 0 && (
        <Section title="Features">
          <ul className="flex flex-col gap-2">
            {project.features.map((f) => (
              <li key={f} className="flex gap-2.5 text-[13px] leading-snug">
                <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}
