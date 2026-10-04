import { portfolio } from "@/data/portfolio";

/**
 * Server-rendered, semantic copy of the portfolio so crawlers, no-JS visitors and screen-reader users
 * always have the content. It is visually hidden and removed once the interactive OS takes over.
 */
export function SeoContent() {
  const { profile, education, experience, skills, skillCategories, projects, achievements, certifications, socialLinks } = portfolio;
  return (
    <div id="seo-content" className="sr-only">
      <main>
        <h1>{profile.name} — {profile.role}</h1>
        <p>{profile.summary}</p>
        <nav aria-label="Profiles">
          <ul>{socialLinks.map((l) => <li key={l.id}><a href={l.url}>{l.label}</a></li>)}</ul>
        </nav>
        <section><h2>Experience</h2>{experience.map((e) => <article key={e.id}><h3>{e.title} — {e.company}</h3><p>{e.start} – {e.end}, {e.location}</p><ul>{e.bullets.map((b) => <li key={b}>{b}</li>)}</ul></article>)}</section>
        <section><h2>Education</h2>{education.map((e) => <p key={e.id}>{e.degree}, {e.institution} ({e.start}–{e.end}). {e.grade}</p>)}</section>
        <section><h2>Skills</h2>{skillCategories.map((c) => <p key={c.id}><strong>{c.label}:</strong> {skills.filter((s) => s.category === c.id).map((s) => s.name).join(", ")}</p>)}</section>
        <section><h2>Projects</h2>{projects.map((p) => <article key={p.id}><h3>{p.name}</h3><p>{p.description}</p><p>Tech: {p.tech.join(", ")}</p><ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>{p.github && <a href={p.github}>GitHub</a>}{p.live && <a href={p.live}>Live demo</a>}</article>)}</section>
        <section><h2>Achievements</h2><ul>{achievements.map((a) => <li key={a.id}>{a.title}: {a.detail}</li>)}</ul></section>
        <section><h2>Certifications</h2><ul>{certifications.map((c) => <li key={c.id}>{c.title} — {c.issuer} ({c.year})</li>)}</ul></section>
        <p>Contact: <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
      </main>
    </div>
  );
}
