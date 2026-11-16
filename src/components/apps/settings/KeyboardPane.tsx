"use client";

import { useEffect, useState } from "react";
import { Keyboard as KeyboardIcon, Search, Sparkles } from "lucide-react";
import { shortcuts } from "@/data/shortcuts";
import { PaneTitle } from "./controls";

export function KeyboardPane() {
  const [query, setQuery] = useState("");
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in search input
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;

      const keys: string[] = [];
      if (e.metaKey || e.ctrlKey) keys.push("⌘/Ctrl");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");
      if (e.key && !["Meta", "Control", "Alt", "Shift"].includes(e.key)) {
        keys.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
      }
      if (keys.length > 0) {
        setPressedKeys(keys);
      }
    };

    const handleKeyUp = () => {
      setPressedKeys([]);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const filtered = shortcuts.filter(
    (s) =>
      s.label.toLowerCase().includes(query.toLowerCase()) ||
      s.keys.some((k) => k.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <PaneTitle>Keyboard</PaneTitle>

      {/* Interactive Key Tester Hero */}
      <div className="mb-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border)] @md:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
            <KeyboardIcon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[13px] font-semibold">Live Key Tester</p>
            <p className="text-[12px] text-muted">
              Press any key combo on your physical keyboard to test
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {pressedKeys.length > 0 ? (
            pressedKeys.map((k) => (
              <kbd
                key={k}
                className="animate-pulse rounded-lg bg-accent px-2.5 py-1 font-mono text-[13px] font-bold text-accent-fg shadow-xs ring-1 ring-accent"
              >
                {k}
              </kbd>
            ))
          ) : (
            <span className="inline-flex items-center gap-1 text-[12px] text-muted italic">
              <Sparkles className="size-3 text-accent" /> Waiting for keystroke…
            </span>
          )}
        </div>
      </div>

      {/* Search Shortcuts */}
      <div className="mb-3 relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter shortcuts (e.g. Spotlight, Close, Esc)…"
          className="h-9 w-full rounded-xl bg-surface pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted/70 shadow-[0_0_0_0.5px_var(--border)] outline-none focus:shadow-[0_0_0_2px_var(--accent)] transition-shadow"
        />
      </div>

      {/* Shortcuts Table */}
      <div className="overflow-x-auto rounded-xl bg-surface shadow-[0_0_0_0.5px_var(--border)] touch-pan-x">
        <table className="w-full text-left text-[13px]">
          <caption className="sr-only">Keyboard shortcuts</caption>
          <thead className="text-[12px] text-muted bg-hover/40">
            <tr className="border-b border-border">
              <th scope="col" className="px-3.5 py-2 font-semibold">
                Action
              </th>
              <th scope="col" className="px-3.5 py-2 font-semibold text-right">
                Shortcut Keys
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <tr
                  key={`${s.keys.join("+")}-${s.label}`}
                  className="hover:bg-hover/30 transition-colors"
                >
                  <td className="px-3.5 py-2.5 align-middle">
                    <span className="font-medium text-foreground">{s.label}</span>
                    {s.note && (
                      <span className="mt-0.5 block text-[11.5px] text-muted">
                        {s.note}
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 align-middle text-right">
                    <span className="inline-flex flex-wrap justify-end gap-1">
                      {s.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded-md bg-hover px-2 py-0.5 font-mono text-[12px] font-semibold whitespace-nowrap shadow-[0_0_0_0.5px_var(--border)]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-3.5 py-6 text-center text-muted text-[13px]">
                  No keyboard shortcuts found matching &quot;{query}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
