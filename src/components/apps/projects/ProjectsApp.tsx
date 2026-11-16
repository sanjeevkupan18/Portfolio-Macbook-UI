"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpDown,
  ChevronLeft,
  ExternalLink,
  Eye,
  FolderOpen,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  Star,
  X,
  type LucideIcon,
} from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { useNotifications } from "@/context/NotificationContext";
import { useLaunch } from "@/hooks/useLaunch";
import { EmptyState } from "@/components/ui/States";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SocialIcon } from "@/components/system/SocialIcon";
import { cn } from "@/lib/utils";
import type { AppProps } from "@/types/app";
import type { Project, ProjectStatus } from "@/types/portfolio";
import { ProjectCard, ProjectMedia, StatusBadge } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";

type Filter =
  | { kind: "all" }
  | { kind: "featured" }
  | { kind: "status"; value: ProjectStatus }
  | { kind: "tech"; value: string };
type View = "grid" | "list";
type SortBy = "featured" | "name";

const { projects } = portfolio;
const STATUS_ORDER: ProjectStatus[] = ["Completed", "In Progress", "Prototype"];
const statuses = STATUS_ORDER.filter((s) => projects.some((p) => p.status === s));
const techTags = Array.from(new Set(projects.flatMap((p) => p.tech))).sort((a, b) =>
  a.localeCompare(b)
);

function applyFilter(p: Project, f: Filter): boolean {
  switch (f.kind) {
    case "all":
      return true;
    case "featured":
      return p.featured;
    case "status":
      return p.status === f.value;
    case "tech":
      return p.tech.includes(f.value);
  }
}

const sameFilter = (a: Filter, b: Filter) =>
  a.kind === b.kind && ("value" in a && "value" in b ? a.value === b.value : true);

function filterTitle(f: Filter): string {
  if (f.kind === "all") return "All Projects";
  if (f.kind === "featured") return "Featured Projects";
  return f.value;
}

export function ProjectsApp({ launch }: AppProps) {
  const { notify } = useNotifications();
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("featured");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [openId, setOpenId] = useState<string | null>(null);
  const [quickLookProject, setQuickLookProject] = useState<Project | null>(null);

  // Mobile history navigation: allow hardware back button to return to projects list
  useEffect(() => {
    if (!openId) return;
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches) return;
    let popped = false;
    window.history.pushState({ type: "project-detail", projectId: openId }, "");

    const onPopState = () => {
      popped = true;
      setOpenId(null);
    };

    window.addEventListener("popstate", onPopState, { once: true });
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (!popped && window.history.state?.type === "project-detail") {
        window.history.back();
      }
    };
  }, [openId]);

  // Mobile history navigation for quick look preview
  useEffect(() => {
    if (!quickLookProject) return;
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches) return;
    let popped = false;
    window.history.pushState({ type: "quick-look", projectId: quickLookProject.id }, "");

    const onPopState = () => {
      popped = true;
      setQuickLookProject(null);
    };

    window.addEventListener("popstate", onPopState, { once: true });
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (!popped && window.history.state?.type === "quick-look") {
        window.history.back();
      }
    };
  }, [quickLookProject]);

  const open = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setOpenId(id);
    setQuickLookProject(null);
    notify({ title: "Project opened", body: p.name, appId: "projects", key: `proj-${id}` });
  };

  useLaunch(launch, (params) => {
    if (params?.projectId) open(params.projectId);
  });

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      projects.filter(
        (p) =>
          applyFilter(p, filter) &&
          (!q ||
            [p.name, p.tagline, p.description, p.stackLabel ?? "", ...p.tech].some((t) =>
              t.toLowerCase().includes(q)
            ))
      ),
    [filter, q]
  );

  const sorted = useMemo(() => {
    return [...visible].sort((a, b) => {
      if (sortBy === "featured") {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [visible, sortBy]);

  const currentIndex = openId ? projects.findIndex((p) => p.id === openId) : -1;
  const current = currentIndex !== -1 ? projects[currentIndex] : null;
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  const choose = (f: Filter) => {
    setFilter(f);
    setOpenId(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      if (quickLookProject) {
        e.preventDefault();
        setQuickLookProject(null);
      } else if (current) {
        e.preventDefault();
        setOpenId(null);
      } else if (query) {
        e.preventDefault();
        setQuery("");
      }
    }
  };

  const dur = reduce ? 0 : 0.18;
  const title = current ? current.name : filterTitle(filter);

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background" onKeyDown={onKeyDown}>
      {/* Header Toolbar */}
      <header className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-2 border-b border-border bg-surface px-2.5 py-2 @lg:px-3">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          disabled={!current}
          aria-label="Back to projects"
          className="grid size-9 shrink-0 place-items-center rounded-lg text-foreground transition-colors hover:bg-hover disabled:opacity-35 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[14px] leading-tight font-semibold text-foreground">
            {title}
          </h1>
          <p className="truncate text-[11.5px] text-muted" aria-live="polite">
            {current
              ? current.tagline
              : `${sorted.length} ${sorted.length === 1 ? "project" : "projects"}`}
          </p>
        </div>

        {!current && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 rounded-lg bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-2 py-1 text-[12px]">
              <ArrowUpDown className="size-3.5 text-muted shrink-0" aria-hidden="true" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                aria-label="Sort projects"
                className="bg-transparent text-[12px] font-medium text-foreground outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="name">A–Z</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div
              role="group"
              aria-label="View"
              className="inline-flex rounded-lg bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)] p-0.5"
            >
              {(
                [
                  ["grid", LayoutGrid, "Grid view"],
                  ["list", List, "List view"],
                ] as [View, LucideIcon, string][]
              ).map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={label}
                  onClick={() => setView(v)}
                  className={cn(
                    "grid h-8 w-9 place-items-center rounded-md transition-colors",
                    view === v
                      ? "bg-surface text-foreground shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.12)]"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative order-last w-full @lg:order-none @lg:w-48">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search projects"
                placeholder="Search projects…"
                className="h-8.5 w-full rounded-lg bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] pr-8 pl-8 text-[12.5px] outline-none placeholder:text-muted focus:bg-background focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-1 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col @2xl:flex-row">
        {/* Sidebar Filters */}
        <nav
          aria-label="Project filters"
          className="glass glass-sidebar mac-scroll shrink-0 overflow-x-auto touch-pan-x border-b border-border @2xl:w-54 @2xl:overflow-x-visible @2xl:border-r @2xl:border-b-0"
        >
          <div className="flex items-center gap-1.5 px-2.5 py-2 @2xl:flex-col @2xl:items-stretch @2xl:gap-0 @2xl:p-2.5">
            <SidebarSection title="Favorites">
              <SideItem
                label="Featured"
                icon={Star}
                count={projects.filter((p) => p.featured).length}
                active={sameFilter(filter, { kind: "featured" })}
                onClick={() => choose({ kind: "featured" })}
                reduced={Boolean(reduce)}
              />
              <SideItem
                label="All Projects"
                icon={FolderOpen}
                count={projects.length}
                active={sameFilter(filter, { kind: "all" })}
                onClick={() => choose({ kind: "all" })}
                reduced={Boolean(reduce)}
              />
            </SidebarSection>

            <SidebarSection title="Status">
              {statuses.map((s) => (
                <SideItem
                  key={s}
                  label={s}
                  dot={
                    s === "Completed"
                      ? "bg-success"
                      : s === "In Progress"
                      ? "bg-warning"
                      : "bg-accent"
                  }
                  count={projects.filter((p) => p.status === s).length}
                  active={sameFilter(filter, { kind: "status", value: s })}
                  onClick={() => choose({ kind: "status", value: s })}
                  reduced={Boolean(reduce)}
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Tech Stack">
              {techTags.map((t) => (
                <SideItem
                  key={t}
                  label={t}
                  count={projects.filter((p) => p.tech.includes(t)).length}
                  active={sameFilter(filter, { kind: "tech", value: t })}
                  onClick={() => choose({ kind: "tech", value: t })}
                  reduced={Boolean(reduce)}
                />
              ))}
            </SidebarSection>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="mac-scroll min-h-0 min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {current ? (
              <motion.div
                key={`detail-${current.id}`}
                initial={reduce ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 18 }}
                transition={{ duration: dur, ease: "easeOut" }}
              >
                <ProjectDetail
                  project={current}
                  prevProject={prevProject}
                  nextProject={nextProject}
                  onNavigate={(id) => open(id)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: dur, ease: "easeOut" }}
                className="p-3 @lg:p-4.5"
              >
                {/* Horizontal Quick Filter Pills Bar */}
                <div className="mb-4 flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-[12px]">
                  <span className="text-[11.5px] font-semibold text-muted mr-1">
                    Quick Filter:
                  </span>
                  {[
                    { label: "All", filter: { kind: "all" } as Filter },
                    { label: "⭐ Featured", filter: { kind: "featured" } as Filter },
                    { label: "🎙️ Voice AI", filter: { kind: "tech", value: "Web Speech API" } as Filter },
                    { label: "💻 Full Stack MERN", filter: { kind: "tech", value: "React.js" } as Filter },
                    { label: "📊 Data & SQL", filter: { kind: "tech", value: "SQL" } as Filter },
                  ].map((pill) => {
                    const isAct = sameFilter(filter, pill.filter);
                    return (
                      <button
                        key={pill.label}
                        type="button"
                        onClick={() => choose(pill.filter)}
                        className={cn(
                          "rounded-full px-3 py-1 font-medium transition-colors shadow-xs",
                          isAct
                            ? "bg-accent text-accent-fg font-semibold"
                            : "bg-surface text-muted hover:bg-hover hover:text-foreground ring-1 ring-border"
                        )}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>

                {sorted.length === 0 ? (
                  <EmptyState
                    title="No projects found"
                    description={
                      q
                        ? `Nothing matches “${query.trim()}” in ${filterTitle(filter)}.`
                        : "No projects in this group."
                    }
                    icon={<FolderOpen className="size-9" strokeWidth={1.5} aria-hidden="true" />}
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setFilter({ kind: "all" });
                        }}
                        className="mt-2 h-9 rounded-lg px-3 text-[13px] font-medium text-accent hover:bg-hover"
                      >
                        Show all projects
                      </button>
                    }
                  />
                ) : (
                  <ul
                    className={cn(
                      "grid gap-3.5",
                      view === "grid"
                        ? "grid-cols-1 @xl:grid-cols-2 @3xl:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {sorted.map((p) => (
                      <li key={p.id} className="flex">
                        <ProjectCard
                          project={p}
                          view={view}
                          onOpen={open}
                          onQuickLook={(proj) => setQuickLookProject(proj)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* macOS Quick Look Sheet (Spacebar Peek) */}
      {quickLookProject && (
        <Dialog
          title={`Quick Look: ${quickLookProject.name}`}
          onClose={() => setQuickLookProject(null)}
          className="max-w-md p-5"
        >
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl shadow-[0_0_0_0.5px_var(--border)]">
              <ProjectMedia project={quickLookProject} size="hero" className="size-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={quickLookProject.status} />
                {quickLookProject.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10.5px] font-semibold text-accent">
                    <Sparkles className="size-3" /> Featured
                  </span>
                )}
              </div>
              <h3 className="mt-1.5 text-[17px] font-semibold text-foreground">
                {quickLookProject.name}
              </h3>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">
                {quickLookProject.tagline}
              </p>
            </div>

            {quickLookProject.metrics && quickLookProject.metrics.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {quickLookProject.metrics.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2.5 py-1 text-[11.5px] font-medium text-accent"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            <div className="rounded-xl bg-hover/80 p-3 text-[12.5px] leading-relaxed text-foreground/90">
              {quickLookProject.description}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-3">
              <div className="flex gap-2">
                {quickLookProject.live && (
                  <ButtonLink
                    href={quickLookProject.live}
                    variant="primary"
                    size="sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-3.5" /> Live Demo
                  </ButtonLink>
                )}
                {quickLookProject.github && (
                  <ButtonLink
                    href={quickLookProject.github}
                    variant="secondary"
                    size="sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SocialIcon id="github" className="size-3.5" /> Code
                  </ButtonLink>
                )}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const id = quickLookProject.id;
                  setQuickLookProject(null);
                  open(id);
                }}
              >
                <Eye className="size-3.5" /> Full Details
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="contents @2xl:mb-3 @2xl:flex @2xl:flex-col @2xl:gap-0.5">
      <h2 className="hidden px-2 pb-0.5 text-[11px] font-semibold text-muted @2xl:block">
        {title}
      </h2>
      {children}
    </div>
  );
}

function SideItem({
  label,
  count,
  active,
  onClick,
  icon: Icon,
  dot,
  reduced,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  dot?: string;
  reduced?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-[12.5px] font-medium whitespace-nowrap transition-colors @2xl:h-8 @2xl:w-full @2xl:rounded-lg @2xl:px-2",
        active
          ? "text-accent-fg"
          : "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:bg-hover @2xl:bg-transparent text-muted hover:text-foreground"
      )}
    >
      {active && (
        <motion.div
          layoutId="projects-nav-active"
          className="absolute inset-0 rounded-full bg-accent @2xl:rounded-lg shadow-xs"
          transition={
            reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }
          }
        />
      )}
      {Icon && (
        <Icon
          className={cn(
            "relative z-10 size-4 shrink-0 transition-colors",
            active ? "text-accent-fg @2xl:text-accent-fg" : "text-muted"
          )}
          aria-hidden="true"
        />
      )}
      {dot && (
        <span
          className={cn(
            "relative z-10 size-2 shrink-0 rounded-full",
            active ? "ring-1 ring-white" : dot
          )}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 min-w-0 flex-1 truncate text-left">{label}</span>
      <span
        className={cn(
          "relative z-10 text-[11px] tabular-nums",
          active ? "text-accent-fg/80" : "text-muted"
        )}
      >
        {count}
      </span>
    </button>
  );
}
