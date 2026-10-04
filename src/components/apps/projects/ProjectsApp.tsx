"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, FolderOpen, LayoutGrid, List, Search, Star, X, type LucideIcon } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { useNotifications } from "@/context/NotificationContext";
import { useLaunch } from "@/hooks/useLaunch";
import { EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils";
import type { AppProps } from "@/types/app";
import type { Project, ProjectStatus } from "@/types/portfolio";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetail } from "./ProjectDetail";

type Filter = { kind: "all" } | { kind: "featured" } | { kind: "status"; value: ProjectStatus } | { kind: "tech"; value: string };
type View = "grid" | "list";

const { projects } = portfolio;
const STATUS_ORDER: ProjectStatus[] = ["Completed", "In Progress", "Prototype"];
const statuses = STATUS_ORDER.filter((s) => projects.some((p) => p.status === s));
const techTags = Array.from(new Set(projects.flatMap((p) => p.tech))).sort((a, b) => a.localeCompare(b));

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

const sameFilter = (a: Filter, b: Filter) => a.kind === b.kind && ("value" in a && "value" in b ? a.value === b.value : true);

function filterTitle(f: Filter): string {
  if (f.kind === "all") return "All Projects";
  if (f.kind === "featured") return "Featured";
  return f.value;
}

export function ProjectsApp({ launch }: AppProps) {
  const { notify } = useNotifications();
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("grid");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>({ kind: "all" });
  const [openId, setOpenId] = useState<string | null>(null);

  const open = (id: string) => {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    setOpenId(id);
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
          (!q || [p.name, p.tagline, p.description, p.stackLabel ?? "", ...p.tech].some((t) => t.toLowerCase().includes(q))),
      ),
    [filter, q],
  );

  const current = openId ? (projects.find((p) => p.id === openId) ?? null) : null;

  const choose = (f: Filter) => {
    setFilter(f);
    setOpenId(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    if (current) {
      e.preventDefault();
      setOpenId(null);
    } else if (query) {
      e.preventDefault();
      setQuery("");
    }
  };

  const dur = reduce ? 0 : 0.18;
  const title = current ? current.name : filterTitle(filter);

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background" onKeyDown={onKeyDown}>
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
          <h1 className="truncate text-[14px] leading-tight font-semibold">{title}</h1>
          <p className="truncate text-[11.5px] text-muted" aria-live="polite">
            {current ? current.tagline : `${visible.length} ${visible.length === 1 ? "project" : "projects"}`}
          </p>
        </div>
        {!current && (
          <>
            <div role="group" aria-label="View" className="inline-flex rounded-lg bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)] p-0.5">
              {([["grid", LayoutGrid, "Grid view"], ["list", List, "List view"]] as [View, LucideIcon, string][]).map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  aria-label={label}
                  onClick={() => setView(v)}
                  className={cn(
                    "grid h-8 w-9 place-items-center rounded-md transition-colors",
                    view === v ? "bg-surface text-foreground shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.12)]" : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="relative order-last w-full @lg:order-none @lg:w-52">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search projects"
                placeholder="Search"
                className="h-9 w-full rounded-lg bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] pr-8 pl-8 text-[13px] outline-none placeholder:text-muted focus:bg-background focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-0.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-foreground"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </>
        )}
      </header>

      <div className="flex min-h-0 flex-1 flex-col @2xl:flex-row">
        <nav aria-label="Project filters" className="glass glass-sidebar mac-scroll shrink-0 border-b border-border @2xl:w-52 @2xl:border-r @2xl:border-b-0">
          <div className="flex items-center gap-1.5 px-2.5 py-2 @2xl:flex-col @2xl:items-stretch @2xl:gap-0 @2xl:p-2.5">
            <SidebarSection title="Favorites">
              <SideItem label="Featured" icon={Star} count={projects.filter((p) => p.featured).length} active={sameFilter(filter, { kind: "featured" })} onClick={() => choose({ kind: "featured" })} />
              <SideItem label="All Projects" icon={FolderOpen} count={projects.length} active={sameFilter(filter, { kind: "all" })} onClick={() => choose({ kind: "all" })} />
            </SidebarSection>
            <SidebarSection title="Status">
              {statuses.map((s) => (
                <SideItem
                  key={s}
                  label={s}
                  dot={s === "Completed" ? "bg-success" : s === "In Progress" ? "bg-warning" : "bg-accent"}
                  count={projects.filter((p) => p.status === s).length}
                  active={sameFilter(filter, { kind: "status", value: s })}
                  onClick={() => choose({ kind: "status", value: s })}
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
                />
              ))}
            </SidebarSection>
          </div>
        </nav>

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
                <ProjectDetail project={current} />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={reduce ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: dur, ease: "easeOut" }}
                className="p-3 @lg:p-4"
              >
                {visible.length === 0 ? (
                  <EmptyState
                    title="No projects found"
                    description={q ? `Nothing matches “${query.trim()}” in ${filterTitle(filter)}.` : "No projects in this group."}
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
                  <ul className={cn("grid gap-3", view === "grid" ? "grid-cols-1 @xl:grid-cols-2 @3xl:grid-cols-3" : "grid-cols-1")}>
                    {visible.map((p) => (
                      <li key={p.id} className="flex">
                        <ProjectCard project={p} view={view} onOpen={open} />
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="contents @2xl:mb-3 @2xl:flex @2xl:flex-col @2xl:gap-0.5">
      <h2 className="hidden px-2 pb-0.5 text-[11px] font-semibold text-muted @2xl:block">{title}</h2>
      {children}
    </div>
  );
}

function SideItem({ label, count, active, onClick, icon: Icon, dot }: { label: string; count: number; active: boolean; onClick: () => void; icon?: LucideIcon; dot?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-[12.5px] font-medium whitespace-nowrap transition-colors @2xl:h-8 @2xl:w-full @2xl:rounded-lg @2xl:px-2",
        active ? "bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-foreground" : "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:bg-hover @2xl:bg-transparent",
      )}
    >
      {Icon && <Icon className={cn("size-4 shrink-0", active ? "text-accent" : "text-muted")} aria-hidden="true" />}
      {dot && <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden="true" />}
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <span className="text-[11px] text-muted tabular-nums">{count}</span>
    </button>
  );
}
