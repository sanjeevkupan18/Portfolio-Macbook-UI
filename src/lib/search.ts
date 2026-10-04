import { apps } from "@/data/apps";
import { portfolio } from "@/data/portfolio";
import type { AppId, AppParams } from "@/types/app";
import type { IconName } from "@/types/icons";

export type SearchSection = "Applications" | "Skills" | "Projects" | "About";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  section: SearchSection;
  appId: AppId;
  params?: AppParams;
  icon: IconName;
  keywords: string;
}

const categoryLabel = Object.fromEntries(portfolio.skillCategories.map((c) => [c.id, c.label]));

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];
  for (const a of apps) {
    items.push({ id: `app:${a.id}`, title: a.name, subtitle: a.description, section: "Applications", appId: a.id, icon: a.icon as IconName, keywords: a.keywords.join(" ") });
  }
  for (const s of portfolio.skills) {
    items.push({
      id: `skill:${s.id}`, title: s.name, subtitle: `Skills → ${s.name}`, section: "Skills", appId: "skills",
      params: { query: s.name }, icon: "Layers", keywords: [...(s.aliases ?? []), categoryLabel[s.category] ?? ""].join(" "),
    });
  }
  for (const p of portfolio.projects) {
    items.push({
      id: `project:${p.id}`, title: p.name, subtitle: `Projects → ${p.tagline}`, section: "Projects", appId: "projects",
      params: { projectId: p.id }, icon: "FolderOpen", keywords: p.tech.join(" "),
    });
  }
  for (const e of portfolio.education) {
    items.push({ id: `edu:${e.id}`, title: e.degree, subtitle: `About → Education · ${e.institution}`, section: "About", appId: "about", params: { section: "education" }, icon: "User", keywords: "education college university btech cgpa" });
  }
  for (const x of portfolio.experience) {
    items.push({ id: `exp:${x.id}`, title: x.title, subtitle: `About → Experience · ${x.company}`, section: "About", appId: "about", params: { section: "experience" }, icon: "User", keywords: "internship experience work" });
  }
  for (const a of portfolio.achievements) {
    items.push({ id: `ach:${a.id}`, title: a.title, subtitle: "About → Achievements", section: "About", appId: "about", params: { section: "achievements" }, icon: "User", keywords: a.detail });
  }
  for (const c of portfolio.certifications) {
    items.push({ id: `cert:${c.id}`, title: c.title, subtitle: "About → Certifications", section: "About", appId: "about", params: { section: "achievements" }, icon: "User", keywords: `${c.issuer} ${c.detail}` });
  }
  return items;
}

let cached: SearchItem[] | null = null;
export const searchIndex = (): SearchItem[] => (cached ??= buildIndex());

function score(item: SearchItem, terms: string[]): number {
  const title = item.title.toLowerCase();
  const rest = `${item.subtitle} ${item.keywords}`.toLowerCase();
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (title === t) s = 100;
    else if (title.startsWith(t)) s = 80;
    else if (title.split(/[\s.\-/(]+/).some((w) => w.startsWith(t))) s = 60;
    else if (title.includes(t)) s = 40;
    else if (rest.includes(t)) s = 15;
    if (s === 0) return 0;
    total += s;
  }
  return total + (item.section === "Applications" ? 5 : 0);
}

export function search(query: string, limit = 12): SearchItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const index = searchIndex();
  if (terms.length === 0) return index.filter((i) => i.section === "Applications");
  return index
    .map((item) => ({ item, s: score(item, terms) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((r) => r.item);
}
