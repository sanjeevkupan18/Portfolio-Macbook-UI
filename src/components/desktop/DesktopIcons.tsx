"use client";

import { useEffect, useRef, useState } from "react";
import { Folder } from "lucide-react";
import { AppIcon } from "@/components/system/AppIcon";
import { useDesktop } from "@/context/DesktopContext";
import { useLauncher } from "@/context/LauncherContext";
import { useNotifications } from "@/context/NotificationContext";
import { portfolio } from "@/data/portfolio";
import { useWallpaper } from "@/hooks/useWallpaper";
import { cn } from "@/lib/utils";
import type { AppId } from "@/types/app";
import type { ContextMenuState } from "./ContextMenu";
import { item } from "./MenuPanel";

interface Props {
  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  onContextMenu: (m: ContextMenuState) => void;
}

function RenameInput({ initial, onDone }: { initial: string; onDone: (name: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <input
      ref={ref}
      defaultValue={initial}
      aria-label="Folder name"
      maxLength={40}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onBlur={(e) => onDone(e.currentTarget.value.trim() || initial)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") onDone(e.currentTarget.value.trim() || initial);
        if (e.key === "Escape") onDone(null);
      }}
      className="w-full rounded bg-white px-1 text-center text-[12px] text-black outline-2 outline-accent"
    />
  );
}

/** Desktop icons (Projects, Resume, About Me + user-created folders). Double-click / Enter opens; tap opens on touch. */
export function DesktopIcons({ renamingId, setRenamingId, onContextMenu }: Props) {
  const { prefs, setPrefs, workArea, refreshKey } = useDesktop();
  const { openApp } = useLauncher();
  const { notify } = useNotifications();
  const tone = useWallpaper().tone;
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const clear = (e: PointerEvent) => {
      if (!(e.target as Element).closest("[data-desktop-icon]")) setSelected(null);
    };
    window.addEventListener("pointerdown", clear);
    return () => window.removeEventListener("pointerdown", clear);
  }, []);

  if (!prefs.showDesktopIcons) return null;
  const label = tone === "light" ? "text-neutral-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.6)]" : "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]";

  const cell = (id: string, children: React.ReactNode, onOpen: () => void, menu: () => ContextMenuState["items"], name: string) => (
    <div
      key={id}
      data-desktop-icon
      role="button"
      tabIndex={0}
      aria-label={`${name}. Press Enter to open.`}
      onClick={(e) => {
        setSelected(id);
        if ((e.nativeEvent as PointerEvent).pointerType === "touch") onOpen();
      }}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" && renamingId !== id) onOpen();
        if (e.key === " ") { e.preventDefault(); setSelected(id); }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelected(id);
        onContextMenu({ x: e.clientX, y: e.clientY, label: `${name} options`, items: menu() });
      }}
      className={cn("flex w-[84px] flex-col items-center gap-1 rounded-lg p-1.5 outline-offset-0", selected === id && "bg-white/25")}
    >
      {children}
    </div>
  );

  return (
    <div key={refreshKey} className="absolute z-[5] flex flex-col flex-wrap content-start gap-1 overflow-hidden" style={{ left: workArea.left + 12, top: workArea.top + 12, bottom: workArea.bottom + 12 }}>
      {portfolio.desktopIcons.map((d) =>
        cell(
          d.id,
          <>
            <div className="size-[54px]"><AppIcon appId={d.appId as AppId} /></div>
            <span className={cn("max-w-full truncate rounded px-1 text-center text-[12px] leading-tight font-medium", label, selected === d.id && "bg-accent !text-accent-fg [text-shadow:none]")}>{d.label}</span>
          </>,
          () => openApp(d.appId),
          () => [item("Open", () => openApp(d.appId))],
          d.label,
        ),
      )}
      {prefs.folders.map((f) =>
        cell(
          f.id,
          <>
            <div className="grid size-[54px] place-items-center rounded-[22%] bg-gradient-to-b from-sky-300 to-sky-500 text-white shadow-[inset_0_0.5px_0_rgba(255,255,255,0.5),0_1px_2px_rgba(0,0,0,0.3)]"><Folder className="size-7" fill="currentColor" fillOpacity={0.35} aria-hidden="true" /></div>
            {renamingId === f.id ? (
              <RenameInput initial={f.name} onDone={(name) => { if (name) setPrefs({ folders: prefs.folders.map((x) => (x.id === f.id ? { ...x, name } : x)) }); setRenamingId(null); }} />
            ) : (
              <span className={cn("max-w-full truncate rounded px-1 text-center text-[12px] leading-tight font-medium", label, selected === f.id && "bg-accent !text-accent-fg [text-shadow:none]")}>{f.name}</span>
            )}
          </>,
          () => notify({ title: `“${f.name}” is empty`, body: "Folders you create on the desktop are just for show.", key: `folder-${f.id}` }),
          () => [
            item("Open", () => notify({ title: `“${f.name}” is empty`, key: `folder-${f.id}` })),
            item("Rename", () => setRenamingId(f.id)),
            item("Move to Trash", () => setPrefs({ folders: prefs.folders.filter((x) => x.id !== f.id) })),
          ],
          f.name,
        ),
      )}
    </div>
  );
}
