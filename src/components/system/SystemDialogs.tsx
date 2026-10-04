"use client";

import { AnimatePresence } from "motion/react";
import { Power, RotateCcw, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/States";
import { AppIcon } from "@/components/system/AppIcon";
import { SocialIcon } from "@/components/system/SocialIcon";
import { useOverlay, type ConfirmAction } from "@/context/OverlayContext";
import { useSession } from "@/context/SessionContext";
import { useOptionalWindows } from "@/context/WindowContext";
import { appById } from "@/data/apps";
import { portfolio, siteConfig } from "@/data/portfolio";
import { shortcuts } from "@/data/shortcuts";

function AboutThisMac() {
  const { profile, socialLinks, currentFocus } = portfolio;
  return (
    <div className="flex flex-col items-center px-8 pt-8 pb-6 text-center">
      <Avatar size={88} />
      <h2 className="mt-4 text-[20px] font-semibold tracking-tight">{profile.name}</h2>
      <p className="text-[13px] text-muted">{profile.role}</p>
      <p className="mt-0.5 text-[12px] text-muted">Portfolio OS {siteConfig.version}</p>
      <dl className="mt-5 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-left text-[13px]">
        <dt className="text-muted">Technologies</dt><dd>{siteConfig.techStack.join(" · ")}</dd>
        <dt className="text-muted">Current focus</dt><dd>{currentFocus[0]}</dd>
        <dt className="text-muted">Location</dt><dd>{profile.location}</dd>
      </dl>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {socialLinks.map((l) => (
          <a key={l.id} href={l.url} target={l.id === "email" ? undefined : "_blank"} rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface px-3 text-[12px] font-medium shadow-[0_0_0_0.5px_var(--border)] hover:bg-surface-2">
            <SocialIcon id={l.id} className="size-4" />{l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function Shortcuts() {
  return (
    <div className="p-6">
      <h2 className="mb-3 text-[16px] font-semibold">Keyboard Shortcuts</h2>
      <ul className="divide-y divide-border text-[13px]">
        {shortcuts.map((s) => (
          <li key={s.label} className="flex items-start justify-between gap-4 py-2">
            <span className="min-w-0">{s.label}{s.note && <span className="block text-[12px] text-muted">{s.note}</span>}</span>
            <span className="flex shrink-0 gap-1">{s.keys.map((k) => <kbd key={k} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-sans text-[11px] shadow-[0_0_0_0.5px_var(--border)]">{k}</kbd>)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ForceQuit({ onClose }: { onClose: () => void }) {
  const wm = useOptionalWindows();
  const open = wm?.windows.filter((w) => w.isOpen) ?? [];
  return (
    <div className="p-6">
      <h2 className="text-[16px] font-semibold">Force Quit Applications</h2>
      <p className="mt-1 mb-3 text-[13px] text-muted">If an app isn&apos;t responding, select it and quit.</p>
      {open.length === 0 ? (
        <EmptyState title="No applications open" />
      ) : (
        <ul className="divide-y divide-border rounded-xl bg-surface shadow-[0_0_0_0.5px_var(--border)]">
          {open.map((w) => (
            <li key={w.id} className="flex items-center gap-3 px-3 py-2">
              <AppIcon appId={w.appId} size={28} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{appById[w.appId].name}</span>
              <Button size="sm" variant="danger" onClick={() => wm?.closeWindow(w.id)}>Quit</Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-end"><Button variant="primary" onClick={onClose} data-autofocus>Done</Button></div>
    </div>
  );
}

const CONFIRM: Record<ConfirmAction, { title: string; body: string; cta: string; icon: typeof Power }> = {
  restart: { title: "Restart now?", body: "The portfolio will restart and replay the boot sequence.", cta: "Restart", icon: RotateCcw },
  shutdown: { title: "Shut down now?", body: "The screen will turn off. Click or press a key to power it back on.", cta: "Shut Down", icon: Power },
  logout: { title: `Log out ${portfolio.profile.firstName}?`, body: "All open windows will be closed and the lock screen will appear.", cta: "Log Out", icon: LogOut },
};

function Confirm({ action, onClose }: { action: ConfirmAction; onClose: () => void }) {
  const session = useSession();
  const wm = useOptionalWindows();
  const c = CONFIRM[action];
  const Icon = c.icon;
  const run = () => {
    onClose();
    if (action === "restart") session.restart();
    else if (action === "shutdown") session.shutdown();
    else {
      wm?.closeAll();
      session.lock();
    }
  };
  return (
    <div className="flex flex-col items-center px-7 pt-7 pb-5 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-accent"><Icon className="size-6" aria-hidden="true" /></div>
      <h2 className="mt-3 text-[16px] font-semibold">{c.title}</h2>
      <p className="mt-1 text-[13px] text-muted">{c.body}</p>
      <div className="mt-5 flex gap-2"><Button onClick={onClose} data-autofocus>Cancel</Button><Button variant="primary" onClick={run}>{c.cta}</Button></div>
    </div>
  );
}

/** Renders whichever system dialog is requested through OverlayContext (About This Mac, shortcuts, force quit, confirmations). */
export function SystemDialogs() {
  const { overlay, close } = useOverlay();
  const type = overlay?.type;
  return (
    <AnimatePresence>
      {type === "about" && <Dialog key="about" title="About This Mac" onClose={close}><AboutThisMac /></Dialog>}
      {type === "shortcuts" && <Dialog key="shortcuts" title="Keyboard Shortcuts" onClose={close} className="max-w-lg"><Shortcuts /></Dialog>}
      {type === "forceQuit" && <Dialog key="fq" title="Force Quit Applications" onClose={close} hideClose><ForceQuit onClose={close} /></Dialog>}
      {overlay?.type === "confirm" && <Dialog key="confirm" title={CONFIRM[overlay.action].title} onClose={close} hideClose className="max-w-sm"><Confirm action={overlay.action} onClose={close} /></Dialog>}
    </AnimatePresence>
  );
}

