"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Briefcase,
  ChevronDown,
  LayoutGrid,
  List,
  Rocket,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { useLauncher } from "@/context/LauncherContext";
import { useLaunch } from "@/hooks/useLaunch";
import { EmptyState } from "@/components/ui/States";
import { NamedIcon } from "@/components/system/icons";
import { cn } from "@/lib/utils";
import type { AppProps } from "@/types/app";
import type { Skill } from "@/types/portfolio";
import { SkillLogo } from "./SkillLogo";
import { isTapveraSkill, projectsUsing, skillTerms } from "./skillMatch";

const { skills, skillCategories } = portfolio;
const categoryLabel = (id: string) => skillCategories.find((c) => c.id === id)?.label ?? id;

function matches(skill: Skill, q: string): boolean {
  if (!q) return true;
  const hay = [
    ...skillTerms(skill),
    categoryLabel(skill.category).toLowerCase(),
    skill.description.toLowerCase(),
    (skill.practicalExposure ?? "").toLowerCase(),
  ];
  return hay.some((h) => h.includes(q));
}

/** Best skill for a launch query: exact name/alias, else first partial match. */
function pickSkill(query: string): Skill | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return skills.find((s) => skillTerms(s).includes(q)) ?? skills.find((s) => skillTerms(s).some((t) => t.includes(q)));
}

function getColumnsCount(container: HTMLElement | null): number {
  if (!container) return 4;
  const buttons = Array.from(container.querySelectorAll<HTMLElement>("[data-skill-button]"));
  if (buttons.length <= 1) return 1;
  const firstTop = buttons[0].offsetTop;
  let cols = 0;
  for (const b of buttons) {
    if (b.offsetTop === firstTop) cols++;
    else break;
  }
  return Math.max(1, cols);
}

type SkillScope = "all" | "tapvera" | "projects";
type ViewMode = "grid" | "list";

export function SkillsApp({ launch }: AppProps) {
  const { openApp } = useLauncher();
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<string>("all");
  const [scope, setScope] = useState<SkillScope>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Mobile history navigation: allow hardware back button to dismiss skill detail sheet
  useEffect(() => {
    if (!selectedId) return;
    if (typeof window === "undefined" || !window.matchMedia("(max-width: 767px)").matches) return;
    let popped = false;
    window.history.pushState({ type: "skill-detail", skillId: selectedId }, "");

    const onPopState = () => {
      popped = true;
      setSelectedId(null);
    };

    window.addEventListener("popstate", onPopState, { once: true });
    return () => {
      window.removeEventListener("popstate", onPopState);
      if (!popped && window.history.state?.type === "skill-detail") {
        window.history.back();
      }
    };
  }, [selectedId]);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useLaunch(launch, (params) => {
    const q = params?.query?.trim();
    if (!q) return;
    const hit = pickSkill(q);
    setCategory("all");
    setScope("all");
    setQuery(q);
    setSelectedId(hit?.id ?? null);
  });

  const q = query.trim().toLowerCase();
  const searched = useMemo(() => skills.filter((s) => matches(s, q)), [q]);

  // Recruiter scope filter
  const scoped = useMemo(() => {
    if (scope === "tapvera") return searched.filter(isTapveraSkill);
    if (scope === "projects") return searched.filter((s) => projectsUsing(s).length > 0);
    return searched;
  }, [searched, scope]);

  const scopeCounts = useMemo(() => {
    return {
      all: searched.length,
      tapvera: searched.filter(isTapveraSkill).length,
      projects: searched.filter((s) => projectsUsing(s).length > 0).length,
    };
  }, [searched]);

  const visible = category === "all" ? scoped : scoped.filter((s) => s.category === category);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: scoped.length };
    for (const s of scoped) map[s.category] = (map[s.category] ?? 0) + 1;
    return map;
  }, [scoped]);

  const groups = skillCategories
    .map((c) => ({ category: c, items: visible.filter((s) => s.category === c.id) }))
    .filter((g) => g.items.length > 0);

  const selected = skills.find((s) => s.id === selectedId) ?? null;

  const tabs = [{ id: "all", label: "All" }, ...skillCategories.map((c) => ({ id: c.id, label: c.label }))];

  const scopeFilters: { id: SkillScope; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: "all",
      label: "All Skills",
      icon: null,
      count: scopeCounts.all,
    },
    {
      id: "tapvera",
      label: "Tapvera (Production)",
      icon: <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />,
      count: scopeCounts.tapvera,
    },
    {
      id: "projects",
      label: "Project Backed",
      icon: <Rocket className="size-3 text-sky-500" aria-hidden="true" />,
      count: scopeCounts.projects,
    },
  ];

  // macOS Launchpad-style Keyboard Arrow Navigation (H)
  useEffect(() => {
    const scrollIntoView = (id: string) => {
      const el = containerRef.current?.querySelector<HTMLElement>(`[data-skill-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in search input, allow ArrowDown to drop into skills list
      if (document.activeElement === searchInputRef.current) {
        if (e.key === "ArrowDown" && visible.length > 0) {
          e.preventDefault();
          const target = visible[0].id;
          setSelectedId(target);
          scrollIntoView(target);
          searchInputRef.current?.blur();
        }
        return;
      }

      if (visible.length === 0) return;

      const currentIndex = visible.findIndex((s) => s.id === selectedId);

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = currentIndex < 0 ? 0 : Math.min(visible.length - 1, currentIndex + 1);
        const target = visible[nextIndex].id;
        setSelectedId(target);
        scrollIntoView(target);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = currentIndex < 0 ? 0 : Math.max(0, currentIndex - 1);
        const target = visible[prevIndex].id;
        setSelectedId(target);
        scrollIntoView(target);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const cols = viewMode === "list" ? 1 : getColumnsCount(containerRef.current);
        const nextIndex = currentIndex < 0 ? 0 : Math.min(visible.length - 1, currentIndex + cols);
        const target = visible[nextIndex].id;
        setSelectedId(target);
        scrollIntoView(target);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const cols = viewMode === "list" ? 1 : getColumnsCount(containerRef.current);
        const prevIndex = currentIndex < 0 ? 0 : Math.max(0, currentIndex - cols);
        const target = visible[prevIndex].id;
        setSelectedId(target);
        scrollIntoView(target);
      } else if (e.key === "Escape") {
        if (selectedId) {
          e.preventDefault();
          setSelectedId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, selectedId, viewMode]);

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background" ref={containerRef}>
      <header className="flex shrink-0 flex-col gap-2.5 border-b border-border px-3 pt-3 pb-2.5 @lg:px-4">
        {/* Title, Search bar, and View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold tracking-tight">Skills</h1>
            <p className="truncate text-[12px] text-muted" aria-live="polite">
              {visible.length} of {skills.length} skills
              {scope === "tapvera" && " · Production (Tapvera)"}
              {scope === "projects" && " · Project Backed"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div className="relative w-28 @xs:w-36 shrink-0 @lg:w-56">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search skills"
                placeholder="Search skills..."
                className="h-9 w-full rounded-lg bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] pr-8 pl-8 text-[13px] outline-none placeholder:text-muted focus:bg-surface focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_55%,transparent)]"
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

            {/* macOS Finder View Mode Switcher */}
            <div
              className="flex items-center rounded-lg bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] p-0.5"
              role="group"
              aria-label="View mode switcher"
            >
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={cn(
                  "grid size-8 place-items-center rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-surface text-foreground shadow-xs font-semibold"
                    : "text-muted hover:text-foreground",
                )}
                title="Grid view (Icon tiles)"
              >
                <LayoutGrid className="size-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "grid size-8 place-items-center rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-surface text-foreground shadow-xs font-semibold"
                    : "text-muted hover:text-foreground",
                )}
                title="List view (macOS Finder table)"
              >
                <List className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips (Recruiter Signal) */}
        <div className="mac-scroll -mx-3 flex items-center gap-1.5 overflow-x-auto touch-pan-x px-3 pb-0.5 @lg:-mx-4 @lg:px-4" role="group" aria-label="Skill scope filter">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider shrink-0 mr-1">Filter:</span>
          {scopeFilters.map((f) => {
            const active = scope === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setScope(f.id)}
                className={cn(
                  "relative inline-flex h-7.5 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium transition-colors",
                  active
                    ? "text-accent-fg shadow-[inset_0_0.5px_0_rgba(255,255,255,0.3)]"
                    : "bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] text-foreground hover:bg-hover",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="skills-scope-active"
                    className="absolute inset-0 rounded-full bg-accent shadow-[inset_0_0.5px_0_rgba(255,255,255,0.3)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  {f.icon}
                  {f.label}
                </span>
                <span
                  className={cn(
                    "relative z-10 rounded-full px-1.5 text-[9.5px] tabular-nums font-semibold",
                    active ? "bg-white/25 text-white" : "bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)] text-muted",
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Pill Tabs with Fluid Springy Active Indicator */}
        <div className="mac-scroll -mx-3 flex gap-1.5 overflow-x-auto touch-pan-x px-3 pb-0.5 @lg:-mx-4 @lg:px-4" role="group" aria-label="Skill categories">
          {tabs.map((t) => {
            const active = category === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(t.id)}
                className={cn(
                  "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
                  active ? "text-accent-fg" : "bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] text-foreground hover:bg-hover",
                )}
              >
                {active && (
                  <motion.div
                    layoutId="skills-tab-active"
                    className="absolute inset-0 rounded-full bg-accent shadow-[inset_0_0.5px_0_rgba(255,255,255,0.3)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t.label}</span>
                <span
                  className={cn(
                    "relative z-10 rounded-full px-1.5 text-[10px] tabular-nums font-semibold",
                    active ? "bg-white/25 text-white" : "bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)] text-muted",
                  )}
                >
                  {categoryCounts[t.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <div className="mac-scroll min-h-0 flex-1 px-3 py-3 @lg:px-4">
          {groups.length === 0 ? (
            <EmptyState
              title="No skills found"
              description={
                q
                  ? `Nothing matches “${query.trim()}”. Try another name or category.`
                  : scope !== "all"
                    ? "No skills in this category match the selected filter."
                    : "This category is empty."
              }
              icon={<Search className="size-9" strokeWidth={1.5} aria-hidden="true" />}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                    setScope("all");
                  }}
                  className="mt-2 h-9 rounded-lg px-3 text-[13px] font-medium text-accent hover:bg-hover"
                >
                  Reset filters
                </button>
              }
            />
          ) : viewMode === "grid" ? (
            /* Grid View with Ambient Card Hover & Launchpad Arrow Nav (H) */
            <div className={cn("flex flex-col gap-5", selected && "pb-72 @2xl:pb-0")}>
              {groups.map((g) => (
                <section key={g.category.id} aria-labelledby={`skills-${g.category.id}`}>
                  <div className="mb-2 flex items-baseline gap-2">
                    <h2 id={`skills-${g.category.id}`} className="text-[12px] font-semibold tracking-wide text-muted uppercase">
                      {g.category.label}
                    </h2>
                    <p className="hidden truncate text-[12px] text-muted/80 @lg:block">{g.category.blurb}</p>
                  </div>
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(106px,1fr))] gap-2.5 @lg:grid-cols-[repeat(auto-fill,minmax(122px,1fr))]">
                    {g.items.map((s) => {
                      const active = s.id === selected?.id;
                      const tapvera = isTapveraSkill(s);
                      const projects = projectsUsing(s);
                      const hasProjects = projects.length > 0;

                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            aria-pressed={active}
                            data-skill-button
                            data-skill-id={s.id}
                            onClick={() => setSelectedId(active ? null : s.id)}
                            className={cn(
                              "group relative flex min-h-[104px] w-full flex-col items-center justify-between gap-1 overflow-hidden rounded-xl bg-surface p-2.5 text-center transition-[transform,box-shadow,background-color] duration-200 ease-out",
                              "shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.06)]",
                              "hover:-translate-y-1 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_45%,transparent),0_12px_26px_-8px_rgba(0,0,0,0.35),0_0_22px_-2px_color-mix(in_srgb,var(--accent)_22%,transparent)]",
                              "active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                              active && "bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))] shadow-[0_0_0_1.5px_var(--accent),0_0_18px_color-mix(in_srgb,var(--accent)_25%,transparent)]",
                            )}
                          >
                            {/* Ambient radial accent glow on hover */}
                            <div
                              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--accent)_14%,transparent)_0%,transparent_72%)]"
                              aria-hidden="true"
                            />

                            {/* Visual Badges: Tapvera & Project */}
                            <div className="relative z-10 flex h-4.5 w-full items-center justify-center gap-1">
                              {tapvera && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[9px] font-semibold tracking-tight text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25">
                                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                                  Tapvera
                                </span>
                              )}
                              {hasProjects && !tapvera && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/12 px-1.5 py-0.5 text-[9px] font-semibold tracking-tight text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
                                  <Rocket className="size-2.5 text-sky-500" aria-hidden="true" />
                                  Project
                                </span>
                              )}
                              {tapvera && hasProjects && (
                                <span
                                  className="inline-flex items-center rounded-full bg-sky-500/12 px-1 py-0.5 text-[8.5px] font-medium text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20"
                                  title={`Also used in ${projects.map((p) => p.name).join(", ")}`}
                                >
                                  🚀
                                </span>
                              )}
                            </div>

                            {/* Brand / Glyph Logo with soft luminous glow */}
                            <span className="relative z-10 grid size-10 place-items-center text-foreground transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none">
                              <span
                                className="pointer-events-none absolute inset-0 rounded-full bg-accent/0 blur-md transition-colors duration-200 group-hover:bg-accent/20"
                                aria-hidden="true"
                              />
                              <SkillLogo skill={s} size={28} />
                            </span>

                            {/* Skill Name */}
                            <span className="relative z-10 line-clamp-2 text-[12px] leading-tight font-medium">{s.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            /* List View: macOS Finder-style Table */
            <div className={cn("flex flex-col gap-3", selected && "pb-72 @2xl:pb-0")}>
              <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
                {/* Table Header */}
                <div
                  className="grid grid-cols-[minmax(130px,1.8fr)_minmax(90px,1fr)_minmax(140px,2fr)_minmax(100px,1fr)] items-center gap-2 border-b border-border bg-[color-mix(in_srgb,var(--foreground)_3.5%,transparent)] px-3 py-2 text-[11px] font-semibold tracking-wider text-muted uppercase select-none"
                  role="row"
                >
                  <span>Skill Name</span>
                  <span className="hidden @sm:block">Category</span>
                  <span>Where Used</span>
                  <span className="text-right pr-2">Experience</span>
                </div>

                {/* Table Body */}
                <ul className="divide-y divide-border/60" role="list">
                  {visible.map((s) => {
                    const active = s.id === selected?.id;
                    const tapvera = isTapveraSkill(s);
                    const projects = projectsUsing(s);
                    const hasProjects = projects.length > 0;

                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          aria-pressed={active}
                          data-skill-button
                          data-skill-id={s.id}
                          onClick={() => setSelectedId(active ? null : s.id)}
                          className={cn(
                            "group relative grid w-full grid-cols-[minmax(130px,1.8fr)_minmax(90px,1fr)_minmax(140px,2fr)_minmax(100px,1fr)] items-center gap-2 px-3 py-2.5 text-left text-[12.5px] transition-colors",
                            "hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]",
                            active
                              ? "bg-[color-mix(in_srgb,var(--accent)_13%,var(--surface))] font-medium shadow-[inset_3px_0_0_var(--accent)]"
                              : "even:bg-[color-mix(in_srgb,var(--foreground)_1.5%,transparent)]",
                          )}
                        >
                          {/* Column 1: Skill Name & Brand Icon */}
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="relative grid size-7 shrink-0 place-items-center rounded-lg bg-background text-foreground shadow-2xs group-hover:scale-105 transition-transform">
                              <SkillLogo skill={s} size={18} />
                            </span>
                            <span className="truncate font-medium text-foreground">{s.name}</span>
                          </div>

                          {/* Column 2: Category */}
                          <div className="hidden @sm:block min-w-0 truncate text-[11.5px] text-muted">
                            {categoryLabel(s.category)}
                          </div>

                          {/* Column 3: Where Used */}
                          <div className="min-w-0 truncate text-[11.5px]">
                            {tapvera && hasProjects ? (
                              <span className="truncate text-foreground/90 font-medium">
                                Tapvera CRM · {projects.map((p) => p.name).join(", ")}
                              </span>
                            ) : tapvera ? (
                              <span className="truncate text-emerald-600 dark:text-emerald-400 font-medium">
                                Tapvera CRM (Full Stack)
                              </span>
                            ) : hasProjects ? (
                              <span className="truncate text-foreground/80">
                                {projects.map((p) => p.name).join(", ")}
                              </span>
                            ) : (
                              <span className="text-muted/65 italic">
                                {s.category === "tools" ? "DSA & CS Foundation" : "Exploration & Core"}
                              </span>
                            )}
                          </div>

                          {/* Column 4: Experience Level */}
                          <div className="flex items-center justify-end pr-2">
                            {tapvera ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                                Production
                              </span>
                            ) : hasProjects ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/12 px-2 py-0.5 text-[9.5px] font-semibold text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
                                <Rocket className="size-2.5 text-sky-500" aria-hidden="true" />
                                Project
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] px-2 py-0.5 text-[9.5px] font-medium text-muted">
                                Core
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        <aside
          aria-label="Skill details"
          className={cn(
            "z-10 flex-col overflow-hidden bg-surface",
            "absolute inset-x-2 bottom-2 max-h-[68%] rounded-2xl shadow-[0_0_0_0.5px_var(--border),0_16px_40px_-12px_rgba(0,0,0,0.45)]",
            "@2xl:static @2xl:inset-auto @2xl:flex @2xl:max-h-none @2xl:w-88 @2xl:shrink-0 @2xl:rounded-none @2xl:shadow-none @2xl:border-l @2xl:border-border",
            selected ? "flex" : "hidden",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <motion.div
                key={selected.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <SkillDetails
                  skill={selected}
                  onClose={() => setSelectedId(null)}
                  onOpenProject={(projectId) => openApp("projects", { projectId })}
                />
              </motion.div>
            ) : (
              <div key="empty" className="hidden flex-1 flex-col items-center justify-center gap-2.5 px-6 text-center @2xl:flex">
                <Sparkles className="size-8 text-muted" strokeWidth={1.4} aria-hidden="true" />
                <p className="text-[13px] font-medium">Select a skill</p>
                <p className="text-[12px] text-muted leading-relaxed">
                  Navigate with arrow keys <span className="font-mono text-[11px] bg-hover px-1 py-0.5 rounded">← → ↑ ↓</span> or click to inspect projects and practical context.
                </p>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

function SkillDetails({
  skill,
  onClose,
  onOpenProject,
}: {
  skill: Skill;
  onClose: () => void;
  onOpenProject: (id: string) => void;
}) {
  const used = projectsUsing(skill);
  const isTapvera = isTapveraSkill(skill);
  const intern = portfolio.experience[0];

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close skill details"
        className="absolute top-2 right-2 z-10 grid size-8 place-items-center rounded-full text-muted hover:bg-hover hover:text-foreground @2xl:hidden"
      >
        <ChevronDown className="size-4" aria-hidden="true" />
      </button>

      <div className="mac-scroll min-h-0 flex-1 p-4 space-y-4">
        {/* Top Header Card */}
        <div className="flex items-start gap-3 pr-6 @2xl:pr-0">
          <div className="grid size-13 shrink-0 place-items-center rounded-2xl bg-background text-foreground shadow-[0_0_0_0.5px_var(--border)]">
            <SkillLogo skill={skill} size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] leading-tight font-semibold tracking-tight">{skill.name}</h2>
            <p className="mt-0.5 text-[12px] text-muted">{categoryLabel(skill.category)}</p>
            {/* Quick Status Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {isTapvera && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                  Tapvera Production
                </span>
              )}
              {used.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/12 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/25">
                  <Rocket className="size-3 text-sky-500" aria-hidden="true" />
                  {used.length} Live Project{used.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Direct "Open in Projects" Action Card (G) */}
        {used.length > 0 && (
          <div className="rounded-xl border border-accent/25 bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] p-2.5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-accent">
                Featured Implementation
              </span>
              <span className="text-[10.5px] text-muted font-medium">1-Click Launch</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenProject(used[0].id)}
              className="group flex w-full items-center justify-between gap-2.5 rounded-lg bg-accent px-3 py-2 text-left text-[12.5px] font-semibold text-accent-fg shadow-[inset_0_0.5px_0_rgba(255,255,255,0.35),0_6px_16px_color-mix(in_srgb,var(--accent)_28%,transparent)] transition-all hover:brightness-105 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-md text-white shadow-2xs"
                  style={{ backgroundImage: `linear-gradient(135deg, ${used[0].cover.from}, ${used[0].cover.to})` }}
                >
                  <NamedIcon name={used[0].cover.icon} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block truncate leading-tight">Launch {used[0].name}</span>
                  <span className="block truncate text-[10px] font-normal text-white/80">
                    {used[0].stackLabel ?? "Live Project"} · Projects App
                  </span>
                </div>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-white shadow-2xs transition-transform group-hover:translate-x-0.5">
                Open <ArrowUpRight className="size-3" aria-hidden="true" />
              </span>
            </button>
          </div>
        )}

        {/* Practical Exposure Highlight Card */}
        {skill.practicalExposure && (
          <div className="rounded-xl border border-accent/25 bg-accent/6 p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Practical Exposure</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed font-medium text-foreground">
              {skill.practicalExposure}
            </p>
          </div>
        )}

        {/* Conceptual Description */}
        <div className="space-y-1">
          <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">Overview</h3>
          <p className="text-[12.5px] leading-relaxed text-foreground/90">{skill.description}</p>
        </div>

        {/* Production Experience Link */}
        {isTapvera && intern && (
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">Production Context</h3>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-3 text-[12.5px]">
              <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                <Briefcase className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{intern.company}</span>
              </div>
              <p className="mt-1 text-[11.5px] text-muted leading-snug">
                {intern.title} · {intern.start} – {intern.end}
              </p>
              <p className="mt-1.5 text-[11px] text-muted/80 leading-relaxed">
                Full-stack CRM modules: Authentication, Organization, HR, Access Management & HyperSwitch Payments.
              </p>
            </div>
          </div>
        )}

        {/* Used In Projects Action List (G) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold tracking-wide text-muted uppercase">Used in Projects</h3>
            {used.length > 0 && (
              <span className="text-[11px] text-muted">{used.length} associated</span>
            )}
          </div>
          {used.length === 0 ? (
            <p className="text-[12px] text-muted">
              {isTapvera
                ? "Used actively across production modules at Tapvera Technologies."
                : "Practiced through coursework, DSA problem solving, and technical certifications."}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {used.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onOpenProject(p.id)}
                    className="group relative flex w-full items-center gap-3 rounded-xl border border-border/80 bg-background/80 p-2.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-accent/40 hover:bg-hover hover:-translate-y-0.5 hover:shadow-xs active:scale-[0.99]"
                  >
                    {/* Project Gradient Icon */}
                    <div
                      className="grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-xs transition-transform group-hover:scale-105"
                      style={{ backgroundImage: `linear-gradient(135deg, ${p.cover.from}, ${p.cover.to})` }}
                    >
                      <NamedIcon name={p.cover.icon} className="size-4.5" />
                    </div>

                    {/* Project Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-semibold tracking-tight text-foreground">{p.name}</span>
                        {p.featured && (
                          <span className="rounded-full bg-accent/12 px-1.5 py-0.2 text-[9px] font-semibold text-accent ring-1 ring-accent/25">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-1 text-[11.5px] text-muted">{p.tagline}</p>
                    </div>

                    {/* Direct Launch Action Badge */}
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] px-2.5 py-1 text-[11px] font-medium text-accent transition-colors group-hover:bg-accent group-hover:text-accent-fg">
                      <span>Open</span>
                      <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
