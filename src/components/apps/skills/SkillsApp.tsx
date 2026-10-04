"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Briefcase, ChevronDown, FolderOpen, Search, Sparkles, X } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { useLauncher } from "@/context/LauncherContext";
import { useLaunch } from "@/hooks/useLaunch";
import { EmptyState } from "@/components/ui/States";
import { cn } from "@/lib/utils";
import type { AppProps } from "@/types/app";
import type { Skill } from "@/types/portfolio";
import { SkillLogo } from "./SkillLogo";
import { mentionedInInternship, projectsUsing, skillTerms } from "./skillMatch";

const { skills, skillCategories } = portfolio;
const categoryLabel = (id: string) => skillCategories.find((c) => c.id === id)?.label ?? id;

function matches(skill: Skill, q: string): boolean {
  if (!q) return true;
  const hay = [...skillTerms(skill), categoryLabel(skill.category).toLowerCase(), skill.description.toLowerCase()];
  return hay.some((h) => h.includes(q));
}

/** Best skill for a launch query: exact name/alias, else first partial match. */
function pickSkill(query: string): Skill | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return skills.find((s) => skillTerms(s).includes(q)) ?? skills.find((s) => skillTerms(s).some((t) => t.includes(q)));
}

export function SkillsApp({ launch }: AppProps) {
  const { openApp } = useLauncher();
  const reduce = useReducedMotion();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useLaunch(launch, (params) => {
    const q = params?.query?.trim();
    if (!q) return;
    const hit = pickSkill(q);
    setCategory("all");
    setQuery(q);
    setSelectedId(hit?.id ?? null);
  });

  const q = query.trim().toLowerCase();
  const searched = useMemo(() => skills.filter((s) => matches(s, q)), [q]);
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: searched.length };
    for (const s of searched) map[s.category] = (map[s.category] ?? 0) + 1;
    return map;
  }, [searched]);

  const visible = category === "all" ? searched : searched.filter((s) => s.category === category);
  const groups = skillCategories
    .map((c) => ({ category: c, items: visible.filter((s) => s.category === c.id) }))
    .filter((g) => g.items.length > 0);
  const selected = visible.find((s) => s.id === selectedId) ?? null;

  const tabs = [{ id: "all", label: "All" }, ...skillCategories.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background">
      <header className="flex shrink-0 flex-col gap-2.5 border-b border-border px-3 pt-3 pb-2.5 @lg:px-4">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold tracking-tight">Skills</h1>
            <p className="truncate text-[12px] text-muted" aria-live="polite">
              {visible.length} of {skills.length} skills
            </p>
          </div>
          <div className="relative w-40 shrink-0 @lg:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search skills"
              placeholder="Search skills"
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
        </div>
        <div className="mac-scroll -mx-3 flex gap-1.5 px-3 pb-0.5 @lg:-mx-4 @lg:px-4" role="group" aria-label="Skill categories">
          {tabs.map((t) => {
            const active = category === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(t.id)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-fg shadow-[inset_0_0.5px_0_rgba(255,255,255,0.3)]"
                    : "bg-[color-mix(in_srgb,var(--foreground)_7%,transparent)] text-foreground hover:bg-hover",
                )}
              >
                {t.label}
                <span className={cn("rounded-full px-1.5 text-[10.5px] tabular-nums", active ? "bg-white/25" : "bg-[color-mix(in_srgb,var(--foreground)_9%,transparent)] text-muted")}>
                  {counts[t.id] ?? 0}
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
              description={q ? `Nothing matches “${query.trim()}”. Try another name or category.` : "This category is empty."}
              icon={<Search className="size-9" strokeWidth={1.5} aria-hidden="true" />}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                  className="mt-2 h-9 rounded-lg px-3 text-[13px] font-medium text-accent hover:bg-hover"
                >
                  Reset filters
                </button>
              }
            />
          ) : (
            <div className={cn("flex flex-col gap-5", selected && "pb-72 @2xl:pb-0")}>
              {groups.map((g) => (
                <section key={g.category.id} aria-labelledby={`skills-${g.category.id}`}>
                  <div className="mb-2 flex items-baseline gap-2">
                    <h2 id={`skills-${g.category.id}`} className="text-[12px] font-semibold tracking-wide text-muted uppercase">
                      {g.category.label}
                    </h2>
                    <p className="hidden truncate text-[12px] text-muted/80 @lg:block">{g.category.blurb}</p>
                  </div>
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2.5 @lg:grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
                    {g.items.map((s) => {
                      const active = s.id === selected?.id;
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSelectedId(active ? null : s.id)}
                            className={cn(
                              "group flex min-h-[92px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-surface px-2 py-3 text-center transition-[transform,box-shadow,background-color] duration-200 ease-out",
                              "shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-[0_0_0_0.5px_var(--border),0_8px_18px_-8px_rgba(0,0,0,0.3)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                              active && "bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))] shadow-[0_0_0_1.5px_var(--accent)]",
                            )}
                          >
                            <span className="grid size-10 place-items-center text-foreground transition-transform duration-200 group-hover:scale-110 motion-reduce:transform-none">
                              <SkillLogo skill={s} size={30} />
                            </span>
                            <span className="line-clamp-2 text-[12px] leading-tight font-medium">{s.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>

        <aside
          aria-label="Skill details"
          className={cn(
            "z-10 flex-col overflow-hidden bg-surface",
            "absolute inset-x-2 bottom-2 max-h-[62%] rounded-2xl shadow-[0_0_0_0.5px_var(--border),0_16px_40px_-12px_rgba(0,0,0,0.45)]",
            "@2xl:static @2xl:inset-auto @2xl:flex @2xl:max-h-none @2xl:w-80 @2xl:shrink-0 @2xl:rounded-none @2xl:shadow-none @2xl:border-l @2xl:border-border",
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
                <SkillDetails skill={selected} onClose={() => setSelectedId(null)} onOpenProject={(projectId) => openApp("projects", { projectId })} />
              </motion.div>
            ) : (
              <div key="empty" className="hidden flex-1 flex-col items-center justify-center gap-2 px-6 text-center @2xl:flex">
                <Sparkles className="size-8 text-muted" strokeWidth={1.4} aria-hidden="true" />
                <p className="text-[13px] font-medium">Select a skill</p>
                <p className="text-[12px] text-muted">See what it is and where it was used.</p>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

function SkillDetails({ skill, onClose, onOpenProject }: { skill: Skill; onClose: () => void; onOpenProject: (id: string) => void }) {
  const used = projectsUsing(skill);
  const internship = mentionedInInternship(skill);
  const intern = portfolio.experience[0];
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close skill details"
        className="absolute top-1.5 right-1.5 z-10 grid size-9 place-items-center rounded-full text-muted hover:bg-hover hover:text-foreground @2xl:hidden"
      >
        <ChevronDown className="size-4" aria-hidden="true" />
      </button>
      <div className="mac-scroll min-h-0 flex-1 p-4">
        <div className="flex items-center gap-3 pr-8 @2xl:pr-0">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-background text-foreground shadow-[0_0_0_0.5px_var(--border)]">
            <SkillLogo skill={skill} size={34} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[16px] leading-tight font-semibold tracking-tight">{skill.name}</h2>
            <p className="mt-0.5 text-[12px] text-muted">{categoryLabel(skill.category)}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed">{skill.description}</p>

        <h3 className="mt-4 mb-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">Used in</h3>
        {used.length === 0 && !internship ? (
          <p className="text-[12.5px] text-muted">Not tied to a listed project yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {used.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onOpenProject(p.id)}
                  className="flex min-h-10 w-full items-center gap-2.5 rounded-lg bg-background px-2.5 py-1.5 text-left text-[13px] shadow-[0_0_0_0.5px_var(--border)] transition-colors hover:bg-hover"
                >
                  <FolderOpen className="size-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <span className="text-[11px] text-muted">Open</span>
                </button>
              </li>
            ))}
            {internship && intern && (
              <li className="flex min-h-10 items-center gap-2.5 rounded-lg bg-background px-2.5 py-1.5 text-[13px] shadow-[0_0_0_0.5px_var(--border)]">
                <Briefcase className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">Internship</span>
                  <span className="block truncate text-[11px] text-muted">{intern.title} · {intern.company}</span>
                </span>
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );
}
