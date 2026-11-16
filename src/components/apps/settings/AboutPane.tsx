"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  HardDrive,
  Layers,
  Monitor,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { portfolio, siteConfig } from "@/data/portfolio";
import { techIcons } from "@/data/techIcons";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SocialIcon } from "@/components/system/SocialIcon";
import { Group, PaneTitle, Row } from "./controls";

/** Maps stack names in siteConfig to simple-icons slugs (only those available in techIcons render a logo). */
const STACK_SLUGS: Record<string, string> = {
  "Next.js": "nextdotjs",
  TypeScript: "typescript",
  React: "react",
  "Tailwind CSS": "tailwindcss",
  MongoDB: "mongodb",
  Motion: "framer",
};

export function AboutPane() {
  const { profile, socialLinks } = portfolio;
  const links = socialLinks.filter((s) => s.id === "github" || s.id === "linkedin");
  const stack = siteConfig.techStack.includes("TypeScript")
    ? siteConfig.techStack
    : [...siteConfig.techStack.slice(0, 2), "TypeScript", ...siteConfig.techStack.slice(2)];

  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const serialNumber = "SK-2026-M3-MAX-DEV";

  const copySerial = () => {
    void navigator.clipboard.writeText(serialNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PaneTitle>About</PaneTitle>

      {/* macOS Hardware Identity Card */}
      <div className="mb-5 flex flex-col items-center gap-4 rounded-2xl bg-surface p-6 shadow-[0_0_0_0.5px_var(--border)] text-center @md:flex-row @md:text-left">
        <div className="relative shrink-0">
          <Avatar size={76} />
          <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-accent text-accent-fg shadow-xs ring-2 ring-surface">
            <Sparkles className="size-3" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center gap-2 @md:justify-start">
            <h3 className="text-[18px] font-bold tracking-tight text-foreground">
              {profile.name}
            </h3>
            <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              Developer Workstation
            </span>
          </div>
          <p className="mt-0.5 text-[13px] font-medium text-muted">{profile.role}</p>
          <p className="mt-1 text-[12px] text-muted/90">
            MacBook Pro (16-inch, Apple Silicon M3 Max) · macOS Sequoia 15.2
          </p>
        </div>
        <div className="shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setReportOpen(true)}
            className="text-[12px]"
          >
            System Report…
          </Button>
        </div>
      </div>

      {/* Hardware Specifications */}
      <Group title="System Hardware & Runtime">
        <Row label="Chip">
          <span className="flex items-center gap-1.5 text-[13px] font-medium">
            <Cpu className="size-4 text-accent" aria-hidden="true" />
            Apple M3 Max (16-core CPU · 40-core GPU)
          </span>
        </Row>
        <Row label="Memory & Architecture">
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <Layers className="size-4 text-accent" aria-hidden="true" />
            16 GB Unified Memory · V8 WebAssembly
          </span>
        </Row>
        <Row label="Framework Engine">
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <Monitor className="size-4 text-accent" aria-hidden="true" />
            Next.js 16 (App Router) + React 19 + TypeScript
          </span>
        </Row>
        <Row label="Storage">
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <HardDrive className="size-4 text-accent" aria-hidden="true" />
            512 GB SSD (Client Storage + MongoDB Cloud)
          </span>
        </Row>
        <Row label="Serial Number">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12.5px] text-muted tabular-nums">
              {serialNumber}
            </span>
            <button
              type="button"
              onClick={copySerial}
              aria-label={copied ? "Copied serial number" : "Copy serial number"}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-hover transition-colors"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </Row>
        <Row label="Portfolio OS Version">
          <span className="text-[13px] text-muted tabular-nums">v{siteConfig.version} (Build 2026.11)</span>
        </Row>
      </Group>

      {/* Built With Tech Stack */}
      <Group title="Built With Modern Technologies">
        <div className="py-3">
          <p className="mb-2.5 text-[12.5px] text-muted">
            Engineered with a high-performance modern web stack replicating native macOS mechanics:
          </p>
          <ul className="flex flex-wrap gap-2">
            {stack.map((name) => {
              const icon = techIcons[STACK_SLUGS[name] ?? ""];
              return (
                <li
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-hover px-2.5 py-1 text-[12px] font-medium transition-colors hover:bg-surface-2"
                >
                  {icon && (
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={icon.path} />
                    </svg>
                  )}
                  {name}
                </li>
              );
            })}
          </ul>
        </div>
      </Group>

      {/* Quick Action Links */}
      <Group title="Developer Actions">
        <div className="flex flex-wrap gap-2 py-3">
          {links.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-hover px-3 text-[13px] font-medium hover:bg-surface-2 transition-colors"
            >
              <SocialIcon id={s.id} className="size-4" />
              <span>{s.label}</span>
              <ExternalLink className="size-3 text-muted" aria-hidden="true" />
            </a>
          ))}
          <a
            href="/resume/Sanjeev_CV_Developer.pdf"
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-accent text-accent-fg px-3.5 text-[13px] font-medium hover:opacity-95 transition-opacity"
          >
            <Download className="size-3.5" aria-hidden="true" />
            <span>Download Resume (PDF)</span>
          </a>
        </div>
      </Group>

      {/* System Report Modal */}
      {reportOpen && (
        <Dialog
          title="System & Architecture Report"
          onClose={() => setReportOpen(false)}
          className="max-w-md p-5"
        >
          <div className="flex items-center gap-2 border-b border-border/80 pb-3">
            <ShieldCheck className="size-5 text-accent" aria-hidden="true" />
            <h3 className="text-[16px] font-semibold text-foreground">
              System &amp; Architecture Report
            </h3>
          </div>

          <div className="space-y-4 pt-3 text-[13px]">
            <div className="rounded-xl bg-hover/80 p-3.5">
              <p className="font-semibold text-foreground">Next.js 16.3 + React 19 Engine</p>
              <p className="mt-1 text-[12px] text-muted">
                Zero-bundle server components, dynamic API routes, edge rate limiting, and client-side window virtualization.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-lg bg-surface p-2.5 shadow-[0_0_0_0.5px_var(--border)]">
                <span className="text-muted block font-medium">CSS Engine</span>
                <span className="font-semibold text-foreground">Tailwind CSS v4 + Variables</span>
              </div>
              <div className="rounded-lg bg-surface p-2.5 shadow-[0_0_0_0.5px_var(--border)]">
                <span className="text-muted block font-medium">Animations</span>
                <span className="font-semibold text-foreground">Motion (Framer) 12</span>
              </div>
              <div className="rounded-lg bg-surface p-2.5 shadow-[0_0_0_0.5px_var(--border)]">
                <span className="text-muted block font-medium">Database</span>
                <span className="font-semibold text-foreground">MongoDB Atlas + Mongoose</span>
              </div>
              <div className="rounded-lg bg-surface p-2.5 shadow-[0_0_0_0.5px_var(--border)]">
                <span className="text-muted block font-medium">Security</span>
                <span className="font-semibold text-foreground">HMAC SHA-256 + Rate Limits</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setReportOpen(false)}>Done</Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
