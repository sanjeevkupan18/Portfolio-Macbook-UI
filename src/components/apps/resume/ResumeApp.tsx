"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { portfolio } from "@/data/portfolio";
import { ButtonLink } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Skeleton } from "@/components/ui/Skeleton";

type Tab = "preview" | "overview";
const NARROW_PX = 640;
const LOAD_TIMEOUT_MS = 8000;

const h2 = "mb-2 border-b border-border pb-1 text-[12px] font-semibold tracking-wider text-muted uppercase";

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className={h2}>{title}</h2>
      {children}
    </section>
  );
}

function Overview() {
  const { profile, skills, skillCategories, experience, projects, education, certifications, achievements, extraCurricular } = portfolio;
  return (
    <article className="mx-auto max-w-3xl px-4 py-6 @lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
        <p className="text-[14px] text-accent">{profile.role}</p>
        <p className="mt-1 text-[12.5px] text-muted">{profile.location} · <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a></p>
      </header>

      <CvSection title="Summary">
        <p className="text-[13.5px] leading-relaxed">{profile.summary}</p>
      </CvSection>

      <CvSection title="Skills">
        <dl className="flex flex-col gap-2">
          {skillCategories.map((c) => {
            const list = skills.filter((s) => s.category === c.id);
            if (list.length === 0) return null;
            return (
              <div key={c.id} className="flex flex-col gap-0.5 @md:flex-row @md:gap-3">
                <dt className="shrink-0 text-[13px] font-semibold @md:w-36">{c.label}</dt>
                <dd className="text-[13px] text-muted">{list.map((s) => s.name).join(", ")}</dd>
              </div>
            );
          })}
        </dl>
      </CvSection>

      {experience.length > 0 && (
        <CvSection title="Experience">
          {experience.map((x) => (
            <div key={x.id} className="mb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-[14px] font-semibold">{x.title} · {x.company}</h3>
                <span className="text-[12px] text-muted">{x.start} – {x.end}</span>
              </div>
              <p className="text-[12.5px] text-muted">{x.type} · {x.location}</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13px] text-muted">
                {x.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          ))}
        </CvSection>
      )}

      {projects.length > 0 && (
        <CvSection title="Projects">
          {projects.map((p) => (
            <div key={p.id} className="mb-3">
              <h3 className="text-[14px] font-semibold">{p.name}{p.stackLabel ? ` · ${p.stackLabel}` : ""}</h3>
              <p className="text-[13px] text-muted">{p.description}</p>
              <p className="mt-0.5 text-[12px] text-muted">Tech: {p.tech.join(", ")}</p>
            </div>
          ))}
        </CvSection>
      )}

      {education.length > 0 && (
        <CvSection title="Education">
          {education.map((e) => (
            <div key={e.id} className="mb-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3 className="text-[14px] font-semibold">{e.degree}</h3>
                <span className="text-[12px] text-muted">{e.start} – {e.end}</span>
              </div>
              <p className="text-[13px] text-muted">{e.institution}, {e.location}{e.grade ? ` · ${e.grade}` : ""}</p>
            </div>
          ))}
        </CvSection>
      )}

      {certifications.length > 0 && (
        <CvSection title="Certifications">
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted">
            {certifications.map((c) => <li key={c.id}><span className="font-medium text-foreground">{c.title}</span> ({c.issuer}, {c.year}) — {c.detail}</li>)}
          </ul>
        </CvSection>
      )}

      {achievements.length > 0 && (
        <CvSection title="Achievements">
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted">
            {achievements.map((a) => <li key={a.id}><span className="font-medium text-foreground">{a.title}</span> — {a.detail}</li>)}
          </ul>
        </CvSection>
      )}

      {extraCurricular.length > 0 && (
        <CvSection title="Extra-curricular">
          <ul className="list-disc space-y-1 pl-5 text-[13px] text-muted">
            {extraCurricular.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </CvSection>
      )}
    </article>
  );
}

function PdfFallback() {
  const { resume } = portfolio;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <FileText className="size-10 text-muted" strokeWidth={1.5} aria-hidden="true" />
      <p className="text-[15px] font-semibold">Preview isn&apos;t available here</p>
      <p className="max-w-sm text-[13px] text-muted">Your browser can&apos;t display PDFs inline. Open or download the resume instead, or switch to the Overview tab.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <ButtonLink variant="primary" href={resume.file} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" aria-hidden="true" /> Open Resume</ButtonLink>
        <ButtonLink href={resume.file} download={resume.downloadName}><Download className="size-3.5" aria-hidden="true" /> Download</ButtonLink>
      </div>
    </div>
  );
}

function PdfPreview() {
  const { resume } = portfolio;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setFailed(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [loaded]);

  if (failed && !loaded) return <PdfFallback />;
  return (
    <div className="relative h-full bg-surface-2">
      {!loaded && (
        <div role="status" className="absolute inset-0 flex flex-col gap-3 p-6">
          <span className="sr-only">Loading resume preview…</span>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-full w-full" />
        </div>
      )}
      <object data={resume.file} type="application/pdf" aria-label="Resume PDF preview" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} className="relative h-full w-full">
        <PdfFallback />
      </object>
    </div>
  );
}

export function ResumeApp() {
  const { resume } = portfolio;
  const rootRef = useRef<HTMLDivElement>(null);
  const picked = useRef(false);
  const [tab, setTab] = useState<Tab>("preview");
  const [canPreview, setCanPreview] = useState(true);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (!picked.current && entry && entry.contentRect.width < NARROW_PX) setTab("overview");
    });
    ro.observe(el);
    const nav = navigator as Navigator & { pdfViewerEnabled?: boolean };
    const t = setTimeout(() => setCanPreview(nav.pdfViewerEnabled !== false), 0);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  const choose = (t: Tab) => {
    picked.current = true;
    setTab(t);
  };

  return (
    <div ref={rootRef} className="@container flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText className="size-4 shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate text-[13px] font-medium">{resume.downloadName}</span>
        </div>
        <Segmented<Tab> label="Resume view" value={tab} onChange={choose} options={[{ value: "preview", label: "Preview" }, { value: "overview", label: "Overview" }]} />
        <ButtonLink size="md" href={resume.file} target="_blank" rel="noopener noreferrer" className="min-h-9">
          <ExternalLink className="size-3.5" aria-hidden="true" /> Open Resume
        </ButtonLink>
        <ButtonLink size="md" variant="primary" href={resume.file} download={resume.downloadName} className="min-h-9">
          <Download className="size-3.5" aria-hidden="true" /> Download Resume
        </ButtonLink>
      </div>
      <div className="mac-scroll min-h-0 flex-1">
        {tab === "overview" ? <Overview /> : canPreview ? <PdfPreview /> : <PdfFallback />}
      </div>
    </div>
  );
}

