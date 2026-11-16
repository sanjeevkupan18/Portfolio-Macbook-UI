"use client";

import { motion } from "motion/react";
import { Award, BadgeCheck, Briefcase, GraduationCap, type LucideIcon } from "lucide-react";
import type { TimelineEntry } from "@/types/portfolio";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const KIND: Record<TimelineEntry["kind"], { icon: LucideIcon; label: string }> = {
  education: { icon: GraduationCap, label: "Education" },
  experience: { icon: Briefcase, label: "Experience" },
  achievement: { icon: Award, label: "Achievement" },
  certification: { icon: BadgeCheck, label: "Certification" },
};

const BADGE_STYLES: Record<string, string> = {
  "Current Internship":
    "bg-[color-mix(in_srgb,var(--success)_16%,transparent)] text-success font-semibold shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--success)_30%,transparent)]",
  "Competitive Exam":
    "bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-accent font-semibold shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--accent)_30%,transparent)]",
  Leadership:
    "bg-[color-mix(in_srgb,var(--warning)_18%,transparent)] text-[color-mix(in_srgb,var(--warning)_85%,var(--foreground))] font-semibold shadow-[0_0_0_0.5px_color-mix(in_srgb,var(--warning)_35%,transparent)]",
};

/** Vertical graphic timeline: line + nodes + year labels + active pulse beacon + colorful milestone pills. */
export function EducationTimeline({ items }: { items: TimelineEntry[] }) {
  const reduced = usePrefersReducedMotion();
  return (
    <ol className="relative flex flex-col gap-5 pl-12 @lg:pl-14">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[19px] w-px bg-gradient-to-b from-accent via-border to-transparent @lg:left-[23px]" />
      {items.map((t) => {
        const { icon: Icon, label } = KIND[t.kind];
        return (
          <motion.li
            key={t.id}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <span className="absolute top-3 -left-12 grid size-10 place-items-center rounded-full bg-surface text-accent shadow-[0_0_0_0.5px_var(--border),0_0_0_4px_var(--background)] @lg:-left-14 @lg:size-12">
              <Icon className="size-[18px] @lg:size-5" aria-hidden="true" />
              {t.active && (
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-success ring-2 ring-background" />
                </span>
              )}
            </span>
            <div className="rounded-xl bg-surface p-3.5 shadow-[0_0_0_0.5px_var(--border),0_6px_18px_-12px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_35%,transparent),0_14px_28px_-10px_rgba(0,0,0,0.28),0_0_20px_-4px_color-mix(in_srgb,var(--accent)_20%,transparent)]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[12px] font-semibold text-accent tabular-nums">{t.year}</span>
                <span className="rounded-full bg-hover px-2 py-px text-[10.5px] font-medium text-muted">{label}</span>
                {t.badge && (
                  <span
                    className={`rounded-full px-2 py-px text-[10.5px] ${
                      BADGE_STYLES[t.badge] ?? "bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] text-muted"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </div>
              <h4 className="mt-1 text-[14px] font-semibold text-foreground">{t.title}</h4>
              {t.subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{t.subtitle}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
