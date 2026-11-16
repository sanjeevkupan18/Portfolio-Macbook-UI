import { portfolio, siteConfig } from "@/data/portfolio";

/**
 * Server-rendered, semantic copy of the portfolio so search engine crawlers (Googlebot, Bingbot),
 * assistive technology, and no-JS visitors have complete access to the content and metadata.
 * It is visually hidden with 'sr-only' and provides crawlable semantic text for all target keywords.
 */
export function SeoContent() {
  const { profile, education, experience, skills, skillCategories, projects, achievements, certifications, socialLinks } = portfolio;

  return (
    <div id="seo-content" className="sr-only">
      <main>
        <header>
          <h1>{profile.name} (sanjucoding / sanjeevkupan18) — MacBook UI &amp; iOS Portfolio</h1>
          <p>
            Welcome to the official developer portfolio of <strong>Sanjeev Kumar Pandit</strong>, also known as{" "}
            <strong>sanjucoding</strong> and <strong>sanjeevkupan18</strong>. This portfolio features an interactive{" "}
            <strong>MacBook UI</strong> desktop experience and an adaptive <strong>iOS portfolio</strong> mobile layout.
          </p>
          <p>
            Whether searching for <em>sanjeev</em>, <em>sanjeev portfolio</em>, <em>sanjucoding portfolio</em>,{" "}
            <em>sanjeev macbook</em>, <em>sanjeev ios</em>, <em>portfolio ios</em>, <em>portfolio macbook</em>,{" "}
            <em>sanjucoding macbook</em>, or <em>sanjucoding ios</em>, this website showcases Sanjeev&apos;s full-stack
            web development work, MERN stack applications, RESTful APIs, and AI integrations.
          </p>
        </header>

        <section id="about">
          <h2>About Sanjeev Kumar Pandit (sanjucoding)</h2>
          <p>{profile.summary}</p>
          <p>
            Role: <strong>{profile.role}</strong> | Location: <strong>{profile.location}</strong>
          </p>
          <nav aria-label="Profiles and Social Links">
            <ul>
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label} ({link.url})
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section id="experience">
          <h2>Work Experience</h2>
          {experience.map((exp) => (
            <article key={exp.id}>
              <h3>
                {exp.title} — {exp.company}
              </h3>
              <p>
                {exp.start} – {exp.end} | {exp.location} ({exp.type})
              </p>
              <ul>
                {exp.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section id="education">
          <h2>Education</h2>
          {education.map((edu) => (
            <article key={edu.id}>
              <h3>{edu.institution}</h3>
              <p>
                {edu.degree} ({edu.start} – {edu.end})
              </p>
              <p>Grade / Academic Performance: {edu.grade}</p>
              <p>Location: {edu.location}</p>
            </article>
          ))}
        </section>

        <section id="skills">
          <h2>Technical Skills &amp; Stack</h2>
          <p>
            Core competencies include: {skills.map((s) => s.name).join(", ")}.
          </p>
          {skillCategories.map((cat) => (
            <div key={cat.id}>
              <h3>{cat.label}</h3>
              <p>
                {skills
                  .filter((s) => s.category === cat.id)
                  .map((s) => s.name)
                  .join(", ")}
              </p>
            </div>
          ))}
        </section>

        <section id="projects">
          <h2>Featured Projects &amp; Software Work</h2>
          <p>
            Explore web applications, tools, and platforms built by Sanjeev Kumar Pandit in this MacBook UI and iOS
            portfolio.
          </p>
          {projects.map((proj) => (
            <article key={proj.id}>
              <h3>{proj.name}</h3>
              <p>{proj.description}</p>
              <p>
                <strong>Technologies:</strong> {proj.tech.join(", ")}
              </p>
              <ul>
                {proj.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {proj.live && (
                <p>
                  Live Deployment:{" "}
                  <a href={proj.live} target="_blank" rel="noopener noreferrer">
                    {proj.live}
                  </a>
                </p>
              )}
              {proj.github && (
                <p>
                  Source Code:{" "}
                  <a href={proj.github} target="_blank" rel="noopener noreferrer">
                    {proj.github}
                  </a>
                </p>
              )}
            </article>
          ))}
        </section>

        <section id="achievements">
          <h2>Key Achievements &amp; Competitions</h2>
          <ul>
            {achievements.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>: {item.detail}
              </li>
            ))}
          </ul>
        </section>

        <section id="certifications">
          <h2>Certifications &amp; Credentials</h2>
          <ul>
            {certifications.map((cert) => (
              <li key={cert.id}>
                <strong>{cert.title}</strong> — {cert.issuer} ({cert.year})
              </li>
            ))}
          </ul>
        </section>

        <section id="contact">
          <h2>Get in Touch with Sanjeev</h2>
          <p>
            Email:{" "}
            <a href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer">
              {profile.email}
            </a>
          </p>
          <p>
            Official Website:{" "}
            <a href={siteConfig.url} target="_blank" rel="noopener noreferrer">
              {siteConfig.url}
            </a>
          </p>
          <p>
            GitHub:{" "}
            <a href="https://github.com/sanjeevkupan18" target="_blank" rel="noopener noreferrer">
              https://github.com/sanjeevkupan18
            </a>
          </p>
          <p>
            LinkedIn:{" "}
            <a href="https://www.linkedin.com/in/sanjeevkupan18/" target="_blank" rel="noopener noreferrer">
              https://www.linkedin.com/in/sanjeevkupan18/
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
