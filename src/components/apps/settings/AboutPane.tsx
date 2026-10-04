import { portfolio, siteConfig } from "@/data/portfolio";
import { techIcons } from "@/data/techIcons";
import { Avatar } from "@/components/ui/Avatar";
import { SocialIcon } from "@/components/system/SocialIcon";
import { Group, PaneTitle, Row } from "./controls";

/** Maps stack names in siteConfig to simple-icons slugs (only those available in techIcons render a logo). */
const STACK_SLUGS: Record<string, string> = {
  "Next.js": "nextdotjs",
  TypeScript: "typescript",
  React: "react",
  "Tailwind CSS": "tailwindcss",
  MongoDB: "mongodb",
};

export function AboutPane() {
  const { profile, socialLinks } = portfolio;
  const links = socialLinks.filter((s) => s.id === "github" || s.id === "linkedin");
  const stack = siteConfig.techStack.includes("TypeScript") ? siteConfig.techStack : [...siteConfig.techStack.slice(0, 2), "TypeScript", ...siteConfig.techStack.slice(2)];
  return (
    <div>
      <PaneTitle>About</PaneTitle>
      <div className="mb-5 flex items-center gap-4 rounded-xl bg-surface p-4 shadow-[0_0_0_0.5px_var(--border)]">
        <Avatar size={64} />
        <div className="min-w-0">
          <p className="text-[16px] font-semibold">{profile.name}</p>
          <p className="text-[13px] text-muted">{profile.role}</p>
        </div>
      </div>

      <Group>
        <Row label="Portfolio version">
          <span className="text-[13px] text-muted tabular-nums">{siteConfig.version}</span>
        </Row>
        <div className="py-3">
          <p className="mb-2 text-[13px] font-medium">Built with</p>
          <ul className="flex flex-wrap gap-2">
            {stack.map((name) => {
              const icon = techIcons[STACK_SLUGS[name] ?? ""];
              return (
                <li key={name} className="inline-flex items-center gap-1.5 rounded-full bg-hover px-2.5 py-1 text-[12px] font-medium">
                  {icon && (
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
                      <path d={icon.path} />
                    </svg>
                  )}
                  {name}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex flex-wrap gap-2 py-3">
          {links.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-hover px-3 text-[13px] font-medium hover:bg-surface-2">
              <SocialIcon id={s.id} className="size-4" /> {s.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
        </div>
      </Group>
    </div>
  );
}
