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

/** Vertical graphic timeline: line + nodes + year labels. Items animate in once as they enter the viewport. */
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
            </span>
            <div className="rounded-xl bg-surface p-3.5 shadow-[0_0_0_0.5px_var(--border),0_6px_18px_-12px_rgba(0,0,0,0.3)]">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-[12px] font-semibold text-accent tabular-nums">{t.year}</span>
                <span className="rounded-full bg-hover px-2 py-px text-[10.5px] font-medium text-muted">{label}</span>
              </div>
              <h4 className="mt-1 text-[14px] font-semibold">{t.title}</h4>
              {t.subtitle && <p className="mt-0.5 text-[12.5px] text-muted">{t.subtitle}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
