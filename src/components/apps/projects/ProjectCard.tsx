"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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
}

export function ProjectCard({ project, view, onOpen }: ProjectCardProps) {
  const list = view === "list";
  const shown = project.tech.slice(0, list ? 4 : 5);
  const extra = project.tech.length - shown.length;
  return (
    <button
      type="button"
      onClick={() => onOpen(project.id)}
      aria-label={`Open ${project.name}`}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-2xl bg-surface text-left transition-[transform,box-shadow] duration-200 ease-out",
        "shadow-[0_0_0_0.5px_var(--border),0_1px_3px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:shadow-[0_0_0_0.5px_var(--border),0_14px_30px_-12px_rgba(0,0,0,0.35)] active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        list ? "flex-row items-stretch" : "flex-col",
      )}
    >
      <ProjectMedia project={project} className={list ? "aspect-square w-24 shrink-0 @lg:w-36" : "aspect-[16/9] w-full"} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 text-[14px] leading-snug font-semibold tracking-tight">{project.name}</h3>
          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 max-@lg:opacity-60" aria-hidden="true" />
        </div>
        <p className={cn("text-[12.5px] text-muted", list ? "line-clamp-2" : "line-clamp-2 min-h-[2.5em]")}>{project.tagline}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
          <StatusBadge status={project.status} className="mr-1" />
          {shown.map((t) => (
            <TechChip key={t}>{t}</TechChip>
          ))}
          {extra > 0 && <TechChip>{`+${extra}`}</TechChip>}
        </div>
      </div>
    </button>
  );
}
