"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Battery, BatteryCharging, Bluetooth, BluetoothOff, Search, SlidersHorizontal, Wifi, WifiOff } from "lucide-react";
import { Logo } from "@/components/system/Logo";
import { useDesktop } from "@/context/DesktopContext";
import { useLauncher } from "@/context/LauncherContext";
import { useNotifications } from "@/context/NotificationContext";
import { useOverlay } from "@/context/OverlayContext";
import { useSession } from "@/context/SessionContext";
import { useTheme } from "@/context/ThemeContext";
import { useWindows } from "@/context/WindowContext";
import { appById, apps } from "@/data/apps";
import { portfolio } from "@/data/portfolio";
import { useNow } from "@/hooks/useNow";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useWallpaper } from "@/hooks/useWallpaper";
import { cn } from "@/lib/utils";
import { item, MenuPanel, separator, type MenuItem } from "./MenuPanel";

interface TopMenu { id: string; label: ReactLabel; bold?: boolean; items: MenuItem[] }
type ReactLabel = string;

const barBtn = "flex h-[22px] items-center rounded px-2 text-[13px] transition-colors hover:bg-[color-mix(in_srgb,currentColor_14%,transparent)] aria-expanded:bg-[color-mix(in_srgb,currentColor_20%,transparent)]";

export function MenuBar() {
  const wm = useWindows();
  const { openApp } = useLauncher();
  const { open, toggle } = useOverlay();
  const session = useSession();
  const { prefs, setPrefs, battery } = useDesktop();
  const { theme, setTheme } = useTheme();
  const { notify } = useNotifications();
  const tone = useWallpaper().tone;
  const now = useNow(1000);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpenMenu(null), []);
  useOutsideClick(barRef, close, openMenu !== null);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpenMenu(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [openMenu]);

  const active = wm.windows.find((w) => w.id === wm.activeId);
  const activeName = active ? appById[active.appId].name : null;
  const copy = (text: string, what: string) => {
    void navigator.clipboard?.writeText(text).then(
      () => notify({ title: `${what} copied`, body: text, kind: "success", key: "copy" }),
      () => notify({ title: "Couldn't copy to the clipboard", kind: "error" }),
    );
  };
  const downloadResume = () => {
    const a = document.createElement("a");
    a.href = portfolio.resume.file;
    a.download = portfolio.resume.downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const social = (id: string) => portfolio.socialLinks.find((s) => s.id === id)?.url ?? "";
  const openWindows = wm.windows.filter((w) => w.isOpen);

  const appleItems: MenuItem[] = useMemo(
    () => [
      item("About This Mac", () => open({ type: "about" })),
      separator,
      item("System Settings…", () => openApp("settings")),
      wm.recents.length
        ? item("Recent Items", undefined, { submenu: wm.recents.map((r) => item(appById[r].name, () => openApp(r))) })
        : item("Recent Items", undefined, { disabled: true }),
      separator,
      item("Force Quit…", () => open({ type: "forceQuit" })),
      separator,
      item("Sleep", () => session.sleep()),
      item("Restart…", () => open({ type: "confirm", action: "restart" })),
      item("Shut Down…", () => open({ type: "confirm", action: "shutdown" })),
      separator,
      item("Lock Screen", () => session.lock()),
      item(`Log Out ${portfolio.profile.firstName}…`, () => open({ type: "confirm", action: "logout" })),
    ],
    [open, openApp, session, wm.recents],
  );

  const menus: TopMenu[] = [
    {
      id: "app",
      label: activeName ?? "Finder",
      bold: true,
      items: [
        item("About This Mac", () => open({ type: "about" })),
        item("Settings…", () => openApp("settings")),
        separator,
        item(activeName ? `Hide ${activeName}` : "Hide", () => active && wm.minimizeWindow(active.id), { disabled: !active, shortcut: "⌘M" }),
        item(activeName ? `Quit ${activeName}` : "Quit", () => active && wm.closeWindow(active.id), { disabled: !active, shortcut: "⌘W" }),
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        item("Open Projects", () => openApp("projects")),
        item("Open Resume", () => openApp("resume")),
        item("Open Contact", () => openApp("contact")),
        separator,
        item("Download Resume", downloadResume),
        separator,
        item("Close Window", () => active && wm.closeWindow(active.id), { disabled: !active, shortcut: "⌘W" }),
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        item("Copy Email Address", () => copy(portfolio.profile.email, "Email address")),
        item("Copy GitHub URL", () => copy(social("github"), "GitHub URL")),
        item("Copy LinkedIn URL", () => copy(social("linkedin"), "LinkedIn URL")),
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        item(active?.isMaximized ? "Exit Full Screen" : "Enter Full Screen", () => active && wm.toggleMaximize(active.id), { disabled: !active, shortcut: "⇧⌘F" }),
        separator,
        { type: "header", label: "Appearance" },
        item("Light", () => setTheme("light"), { checked: theme === "light" }),
        item("Dark", () => setTheme("dark"), { checked: theme === "dark" }),
        item("Auto", () => setTheme("system"), { checked: theme === "system" }),
        separator,
        item("Show Widgets", () => setPrefs({ showWidgets: !prefs.showWidgets }), { checked: prefs.showWidgets }),
        item("Show Desktop Icons", () => setPrefs({ showDesktopIcons: !prefs.showDesktopIcons }), { checked: prefs.showDesktopIcons }),
      ],
    },
    { id: "go", label: "Go", items: apps.map((a) => item(a.name, () => openApp(a.id))) },
    {
      id: "window",
      label: "Window",
      items: [
        item("Minimize", () => active && wm.minimizeWindow(active.id), { disabled: !active, shortcut: "⌘M" }),
        item("Zoom", () => active && wm.toggleMaximize(active.id), { disabled: !active }),
        separator,
        item("Bring All to Front", () => openWindows.forEach((w) => wm.restoreWindow(w.id)), { disabled: openWindows.length === 0 }),
        item("Close All Windows", () => wm.closeAll(), { disabled: openWindows.length === 0 }),
        ...(openWindows.length ? [separator, ...openWindows.map((w) => item(appById[w.appId].name, () => (w.isMinimized ? wm.restoreWindow(w.id) : wm.focusWindow(w.id)), { checked: w.id === wm.activeId }))] : []),
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        item("Keyboard Shortcuts", () => open({ type: "shortcuts" })),
        item("Search", () => open({ type: "spotlight" }), { shortcut: "⌘K" }),
        separator,
        item("GitHub Profile", () => window.open(social("github"), "_blank", "noopener,noreferrer")),
        item("LinkedIn Profile", () => window.open(social("linkedin"), "_blank", "noopener,noreferrer")),
      ],
    },
  ];

  const d = new Date(now);
  const dateLabel = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: !prefs.clock24 });
  const BatIcon = battery.charging ? BatteryCharging : Battery;

  const menuButton = (id: string, label: React.ReactNode, items: MenuItem[], extra?: string, aria?: string) => (
    <div key={id} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={openMenu === id}
        aria-label={aria}
        className={cn(barBtn, extra)}
        onClick={() => setOpenMenu(openMenu === id ? null : id)}
        onPointerEnter={() => openMenu && setOpenMenu(id)}
      >
        {label}
      </button>
      {openMenu === id && <MenuPanel items={items} label={aria ?? String(label)} onClose={close} className="absolute top-[26px] left-0" />}
    </div>
  );

  return (
    <header ref={barRef} data-tone={tone} className="glass glass-menu os-chrome fixed inset-x-0 top-0 z-[1000] flex h-7 items-center justify-between px-2">
      <nav aria-label="Application menus" className="flex items-center gap-0.5">
        {menuButton("apple", <Logo className="size-4" />, appleItems, "px-2.5", "Apple menu")}
        {menus.map((m) => menuButton(m.id, m.label, m.items, m.bold ? "font-semibold" : undefined, m.label))}
      </nav>
      <div className="flex items-center gap-0.5" role="group" aria-label="Status menus">
        <button type="button" data-overlay-trigger aria-label={`Wi-Fi ${prefs.wifi ? "connected" : "off"}`} className={barBtn} onClick={() => toggle({ type: "controlCenter" })}>
          {prefs.wifi ? <Wifi className="size-4" /> : <WifiOff className="size-4 opacity-60" />}
        </button>
        <button type="button" data-overlay-trigger aria-label={`Bluetooth ${prefs.bluetooth ? "on" : "off"}`} className={cn(barBtn, "max-sm:hidden")} onClick={() => toggle({ type: "controlCenter" })}>
          {prefs.bluetooth ? <Bluetooth className="size-4" /> : <BluetoothOff className="size-4 opacity-60" />}
        </button>
        <button type="button" data-overlay-trigger aria-label={`Battery ${battery.level} percent, ${battery.charging ? "charging" : "not charging"} (simulated)`} className={cn(barBtn, "gap-1")} onClick={() => toggle({ type: "controlCenter" })}>
          <span className="text-[12px] tabular-nums">{battery.level}%</span><BatIcon className="size-[18px]" />
        </button>
        <button type="button" data-overlay-trigger aria-label="Search (Spotlight)" className={barBtn} onClick={() => toggle({ type: "spotlight" })}><Search className="size-4" /></button>
        <button type="button" data-overlay-trigger aria-label="Control Center" className={barBtn} onClick={() => toggle({ type: "controlCenter" })}><SlidersHorizontal className="size-4" /></button>
        <button type="button" data-overlay-trigger aria-label={`${dateLabel} ${timeLabel}. Open Notification Center`} className={cn(barBtn, "gap-2 tabular-nums")} onClick={() => toggle({ type: "notificationCenter" })}>
          <span className="max-sm:hidden">{dateLabel}</span><span>{timeLabel}</span>
        </button>
      </div>
    </header>
  );
}
