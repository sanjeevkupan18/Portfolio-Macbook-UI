"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Award, Briefcase, Compass, GraduationCap, Lightbulb, MapPin, Route, Target, User, type LucideIcon } from "lucide-react";
import type { AppProps } from "@/types/app";
import { portfolio } from "@/data/portfolio";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useLaunch } from "@/hooks/useLaunch";
import { EducationTimeline } from "./EducationTimeline";

type SectionId = "about" | "journey" | "education" | "experience" | "philosophy" | "focus" | "achievements";

const card = "rounded-xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border),0_6px_18px_-12px_rgba(0,0,0,0.3)]";

function Section({ id, title, icon: Icon, setRef, children }: { id: SectionId; title: string; icon: LucideIcon; setRef: (id: SectionId, el: HTMLElement | null) => void; children: ReactNode }) {
  return (
    <section ref={(el) => setRef(id, el)} data-section={id} aria-labelledby={`about-${id}`} className="scroll-mt-4">
      <h2 id={`about-${id}`} className="mb-3 flex items-center gap-2 text-[17px] font-semibold tracking-tight">
        <Icon className="size-[18px] text-accent" aria-hidden="true" /> {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((b) => (
        <li key={b} className="flex gap-2 text-[13px] leading-relaxed text-muted">
          <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

export function AboutApp({ launch }: AppProps) {
  const reduced = usePrefersReducedMotion();
  const { profile, education, experience, timeline, philosophy, currentFocus, achievements, certifications, extraCurricular } = portfolio;
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionEls = useRef(new Map<SectionId, HTMLElement>());
  const [active, setActive] = useState<SectionId>("about");

  const sections: { id: SectionId; label: string; icon: LucideIcon; show: boolean }[] = [
    { id: "about", label: "About Me", icon: User, show: true },
    { id: "journey", label: "Journey", icon: Route, show: timeline.length > 0 },
    { id: "education", label: "Education", icon: GraduationCap, show: education.length > 0 },
    { id: "experience", label: "Experience", icon: Briefcase, show: experience.length > 0 },
    { id: "philosophy", label: "Philosophy", icon: Lightbulb, show: philosophy.length > 0 },
    { id: "focus", label: "Current Focus", icon: Target, show: currentFocus.length > 0 },
    { id: "achievements", label: "Achievements", icon: Award, show: achievements.length + certifications.length + extraCurricular.length > 0 },
  ];
  const visible = sections.filter((s) => s.show);
  const visibleKey = visible.map((s) => s.id).join();

  const setRef = useCallback((id: SectionId, el: HTMLElement | null) => {
    if (el) sectionEls.current.set(id, el);
    else sectionEls.current.delete(id);
  }, []);

  const scrollTo = useCallback(
    (id: SectionId) => {
      setActive(id);
      sectionEls.current.get(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [reduced],
  );

  useLaunch(launch, (params) => {
    const s = params?.section;
    if (s && visible.some((v) => v.id === s)) scrollTo(s as SectionId);
  });

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const seen = new Map<SectionId, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.section as SectionId;
          if (e.isIntersecting) seen.set(id, e.boundingClientRect.top);
          else seen.delete(id);
        }
        const first = [...seen.entries()].sort((a, b) => a[1] - b[1])[0];
        if (first) setActive(first[0]);
      },
      { root, rootMargin: "0px 0px -65% 0px", threshold: 0 },
    );
    sectionEls.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [visibleKey]);

  return (
    <div className="@container flex h-full min-h-0 flex-col bg-background @2xl:flex-row">
      <nav aria-label="About sections" className="glass glass-sidebar hidden w-52 shrink-0 flex-col gap-0.5 border-r border-border p-2.5 @2xl:flex">
        {visible.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            aria-current={active === s.id ? "true" : undefined}
            className={cn("flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] transition-colors", active === s.id ? "bg-accent text-accent-fg" : "hover:bg-hover")}
          >
            <s.icon className="size-4 shrink-0" aria-hidden="true" /> {s.label}
          </button>
        ))}
      </nav>
      <nav aria-label="About sections" className="mac-scroll flex shrink-0 gap-2 overflow-x-auto border-b border-border px-3 py-2 @2xl:hidden">
        {visible.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            aria-current={active === s.id ? "true" : undefined}
            className={cn("min-h-9 shrink-0 rounded-full px-3.5 text-[12.5px] font-medium transition-colors", active === s.id ? "bg-accent text-accent-fg" : "bg-surface shadow-[0_0_0_0.5px_var(--border)]")}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div ref={scrollRef} className="mac-scroll min-h-0 flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-9 px-4 py-6 @lg:px-8 @lg:py-8">
          <Section id="about" title="About Me" icon={Compass} setRef={setRef}>
            <div className={cn(card, "flex flex-col gap-4 @lg:flex-row")}>
              <div className="size-20 shrink-0 self-center overflow-hidden rounded-full bg-white ring-1 ring-black/10 @lg:self-start">
                <Avatar size={80} className="size-full object-cover" />
              </div>
              <div>
                <p className="text-[16px] font-semibold">{profile.name}</p>
                <p className="text-[13px] text-accent">{profile.role}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{profile.summary}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-muted">
                  <MapPin className="size-3.5" aria-hidden="true" /> {profile.location}
                </p>
              </div>
            </div>
          </Section>

          {timeline.length > 0 && (
            <Section id="journey" title="Career & Developer Journey" icon={Route} setRef={setRef}>
              <EducationTimeline items={timeline} />
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" title="Education" icon={GraduationCap} setRef={setRef}>
              <div className="flex flex-col gap-3">
                {education.map((e) => (
                  <article key={e.id} className={card}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[14.5px] font-semibold">{e.degree}</h3>
                      <span className="text-[12px] text-muted tabular-nums">{e.start} – {e.end}</span>
                    </div>
                    <p className="text-[13px] text-accent">{e.institution}</p>
                    <p className="text-[12.5px] text-muted">{e.location}</p>
                    {e.grade && <p className="mt-2 inline-block rounded-full bg-hover px-2.5 py-0.5 text-[12px] font-medium">{e.grade}</p>}
                    {e.note && <p className="mt-2 text-[13px] text-muted">{e.note}</p>}
                  </article>
                ))}
              </div>
            </Section>
          )}

          {experience.length > 0 && (
            <Section id="experience" title="Experience" icon={Briefcase} setRef={setRef}>
              <div className="flex flex-col gap-3">
                {experience.map((x) => (
                  <article key={x.id} className={card}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[14.5px] font-semibold">{x.title}</h3>
                      <span className="text-[12px] text-muted tabular-nums">{x.start} – {x.end}</span>
                    </div>
                    <p className="text-[13px] text-accent">{x.company}</p>
                    <p className="mb-3 text-[12.5px] text-muted">{x.type} · {x.location}</p>
                    <BulletList items={x.bullets} />
                  </article>
                ))}
              </div>
            </Section>
          )}

          {philosophy.length > 0 && (
            <Section id="philosophy" title="Developer Philosophy" icon={Lightbulb} setRef={setRef}>
              <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
                {philosophy.map((p) => (
                  <article key={p.title} className={card}>
                    <h3 className="text-[14px] font-semibold">{p.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{p.body}</p>
                  </article>
                ))}
              </div>
            </Section>
          )}

          {currentFocus.length > 0 && (
            <Section id="focus" title="Current Focus" icon={Target} setRef={setRef}>
              <div className={card}>
                <BulletList items={currentFocus} />
              </div>
            </Section>
          )}

          {achievements.length + certifications.length + extraCurricular.length > 0 && (
            <Section id="achievements" title="Achievements & Certifications" icon={Award} setRef={setRef}>
              <div className="flex flex-col gap-5">
                {achievements.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
                    {achievements.map((a) => (
                      <article key={a.id} className={card}>
                        <h3 className="text-[14px] font-semibold">{a.title}</h3>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted">{a.detail}</p>
                      </article>
                    ))}
                  </div>
                )}
                {certifications.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-[13px] font-semibold text-muted">Certifications</h3>
                    <div className="flex flex-col gap-3">
                      {certifications.map((c) => (
                        <article key={c.id} className={card}>
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                            <h4 className="text-[14px] font-semibold">{c.title}</h4>
                            <span className="text-[12px] text-muted tabular-nums">{c.year}</span>
                          </div>
                          <p className="text-[12.5px] text-accent">{c.issuer}</p>
                          <p className="mt-1 text-[13px] text-muted">{c.detail}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
                {extraCurricular.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-[13px] font-semibold text-muted">Extra-curricular</h3>
                    <div className={card}>
                      <BulletList items={extraCurricular} />
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
