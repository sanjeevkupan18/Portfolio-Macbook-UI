import { portfolio } from "@/data/portfolio";
import type { Project, Skill } from "@/types/portfolio";

/** All lowercase names a skill is known by (name + aliases). */
export function skillTerms(skill: Skill): string[] {
  return [skill.name, ...(skill.aliases ?? [])].map((t) => t.toLowerCase());
}

/** Projects whose `tech` list contains the skill's name or any alias (case-insensitive). */
export function projectsUsing(skill: Skill, projects: Project[] = portfolio.projects): Project[] {
  const terms = new Set(skillTerms(skill));
  return projects.filter((p) => p.tech.some((t) => terms.has(t.toLowerCase())));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when the internship bullets mention the skill by name/alias (whole-word match). */
export function mentionedInInternship(skill: Skill): boolean {
  const text = portfolio.experience.map((e) => e.bullets.join(" ")).join(" ");
  return skillTerms(skill).some((term) => new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(term)}(?![A-Za-z0-9])`, "i").test(text));
}

/** Finds the skill that a project tech tag refers to, if any. */
export function findSkillByTech(tech: string): Skill | undefined {
  const t = tech.toLowerCase();
  return portfolio.skills.find((s) => skillTerms(s).includes(t));
}
