"use client";

import Image from "next/image";
import { ArrowUpRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/types/portfolio";
import { ProjectCover } from "./ProjectCover";

const STATUS_TONE: Record<ProjectStatus, string> = {
  Completed: "text-[color-mix(in_srgb,var(--success)_62%,var(--foreground))] bg-[color-mix(in_srgb,var(--success)_16%,transparent)]",
  "In Progress": "text-[color-mix(in_srgb,var(--warning)_58%,var(--foreground))] bg-[color-mix(in_srgb,var(--warning)_18%,transparent)]",
  Prototype: "text-[color-mix(in_srgb,var(--accent)_70%,var(--foreground))] bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]",
};
const STATUS_DOT: Record<ProjectStatus, string> = {
  Completed: "bg-success",
  "In Progress": "bg-warning",
  Prototype: "bg-accent",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", STATUS_TONE[status], className)}>
      <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} aria-hidden="true" />
      {status}
    </span>
  );
}

export function ProjectMedia({ project, className, size = "card" }: { project: Project; className?: string; size?: "card" | "hero" }) {
  if (project.image) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-2", className)}>
        <Image src={project.image} alt={`${project.name} preview`} fill unoptimized sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
      </div>
    );
  }
  return <ProjectCover project={project} size={size} className={className} />;
}

export function TechChip({ children }: { children: string }) {
  return (
    <span className="rounded-md bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-1.5 py-0.5 text-[11px] font-medium text-muted">{children}</span>
  );
}

interface ProjectCardProps {
  project: Project;
  view: "grid" | "list";
  onOpen: (id: string) => void;
  onQuickLook?: (project: Project) => void;
}

export function ProjectCard({ project, view, onOpen, onQuickLook }: ProjectCardProps) {
  const list = view === "list";
  const shown = project.tech.slice(0, list ? 4 : 5);
  const extra = project.tech.length - shown.length;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(project.id);
        if (e.key === " " && onQuickLook) {
          e.preventDefault();
          onQuickLook(project);
        }
      }}
      aria-label={`Open ${project.name}`}
      className={cn(
        "group relative flex w-full cursor-pointer overflow-hidden rounded-2xl bg-surface text-left transition-all duration-200 ease-out",
        "shadow-[0_0_0_0.5px_var(--border),0_1px_3px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_16px_36px_-12px_rgba(0,0,0,0.35)] active:scale-[0.99] outline-none focus-visible:shadow-[0_0_0_2px_var(--accent)]",
        list ? "flex-row items-stretch" : "flex-col"
      )}
    >
      {/* Ambient Radial Hover Backlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${project.cover.from}24, ${project.cover.to}0e, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* Media with Quick Look Overlay Button */}
      <div className={cn("relative overflow-hidden", list ? "aspect-square w-28 shrink-0 @lg:w-36" : "aspect-[16/9] w-full")}>
        <ProjectMedia project={project} className="size-full" />
        {onQuickLook && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickLook(project);
            }}
            title="Quick Look (Spacebar)"
            aria-label={`Quick look at ${project.name}`}
            className="absolute top-2 right-2 z-10 grid size-7 place-items-center rounded-lg bg-black/45 text-white opacity-0 shadow-sm backdrop-blur-md transition-all group-hover:opacity-100 hover:bg-black/70 hover:scale-105 active:scale-95"
          >
            <Eye className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-[14px] leading-snug font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors">
            {project.name}
          </h3>
          <ArrowUpRight
            className="mt-0.5 size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-@lg:opacity-60"
            aria-hidden="true"
          />
        </div>

        <p className={cn("text-[12.5px] text-muted", list ? "line-clamp-2" : "line-clamp-2 min-h-[2.5em]")}>
          {project.tagline}
        </p>

        {/* High-Impact Recruiter Metric Badges */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="my-0.5 flex flex-wrap items-center gap-1">
            {project.metrics.slice(0, list ? 2 : 2).map((m) => (
              <span
                key={m}
                className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2 py-0.5 text-[11px] font-medium text-accent"
              >
                {m}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
          <StatusBadge status={project.status} className="mr-1" />
          {shown.map((t) => (
            <TechChip key={t}>{t}</TechChip>
          ))}
          {extra > 0 && <TechChip>{`+${extra}`}</TechChip>}
        </div>
      </div>
    </div>
  );
}
