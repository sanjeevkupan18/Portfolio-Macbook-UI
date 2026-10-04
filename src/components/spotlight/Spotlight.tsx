"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import { AppIcon } from "@/components/system/AppIcon";
import { NamedIcon } from "@/components/system/icons";
import { SkillLogo } from "@/components/apps/skills/SkillLogo";
import { useLauncher } from "@/context/LauncherContext";
import { useOverlay } from "@/context/OverlayContext";
import { portfolio } from "@/data/portfolio";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { search, type SearchItem, type SearchSection } from "@/lib/search";
import { cn } from "@/lib/utils";

function ResultIcon({ item }: { item: SearchItem }) {
  if (item.section === "Applications") return <AppIcon appId={item.appId} size={30} />;
  const skill = item.section === "Skills" ? portfolio.skills.find((s) => `skill:${s.id}` === item.id) : undefined;
  return (
    <span aria-hidden="true" className="grid size-[30px] shrink-0 place-items-center rounded-lg bg-surface-2 text-muted shadow-[0_0_0_0.5px_var(--border)]">
      {skill ? <SkillLogo skill={skill} size={18} /> : <NamedIcon name={item.icon} className="size-4" />}
    </span>
  );
}

function SpotlightPanel() {
  const { close } = useOverlay();
  const { openApp } = useLauncher();
  const mobile = useIsMobile();
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const results = useMemo(() => search(query), [query]);
  const activeIdx = Math.min(active, Math.max(0, results.length - 1));

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  useEffect(() => {
    document.getElementById(`${listId}-${activeIdx}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, listId]);

  const choose = (item: SearchItem | undefined) => {
    if (!item) return;
    close();
    openApp(item.appId, item.params);
  };

  return (
    <div className="fixed inset-0 z-[2000]" onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <motion.div
        role="dialog"
        aria-label="Spotlight search"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 440, damping: 36 }}
        className={cn("glass glass-panel os-chrome absolute left-1/2 w-[min(640px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-2xl", mobile ? "top-[calc(env(safe-area-inset-top)+12px)]" : "top-[16vh]")}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="size-5 shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length ? `${listId}-${activeIdx}` : undefined}
            aria-label="Search apps, skills and projects"
            autoComplete="off"
            spellCheck={false}
            value={query}
            placeholder="Spotlight Search"
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(activeIdx + 1, results.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(activeIdx - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); choose(results[activeIdx]); }
            }}
            className="min-w-0 flex-1 bg-transparent text-[20px] font-light outline-none placeholder:text-muted/70"
          />
        </div>
        <ul id={listId} role="listbox" aria-label="Results" className="mac-scroll max-h-[min(52vh,420px)] border-t border-border p-1.5">
          {results.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-muted" role="status">No results for “{query}”</li>}
          {results.map((item, i) => {
            const header: SearchSection | null = i === 0 || results[i - 1]?.section !== item.section ? item.section : null;
            return (
              <li key={item.id} role="presentation">
                {header && <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{header}</p>}
                <div
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === activeIdx}
                  onPointerMove={() => i !== activeIdx && setActive(i)}
                  onClick={() => choose(item)}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2", i === activeIdx ? "bg-accent text-accent-fg" : "")}
                >
                  <ResultIcon item={item} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{item.title}</span>
                    <span className={cn("block truncate text-[12px]", i === activeIdx ? "opacity-80" : "text-muted")}>{item.subtitle}</span>
                  </span>
                  {i === activeIdx && <CornerDownLeft className="size-4 shrink-0 opacity-80" aria-hidden="true" />}
                </div>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}

export function Spotlight() {
  const { overlay } = useOverlay();
  return <AnimatePresence>{overlay?.type === "spotlight" && <SpotlightPanel key="spotlight" />}</AnimatePresence>;
}
