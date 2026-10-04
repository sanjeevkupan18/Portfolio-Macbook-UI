import type { AppId } from "./app";

export interface Profile {
  name: string;
  firstName: string;
  initials: string;
  role: string;
  roleAlternates: string[];
  tagline: string;
  location: string;
  summary: string;
  shortBio: string;
  avatar: string;
  email: string;
  website: string;
}

export interface SocialLink {
  id: "github" | "linkedin" | "email" | "website";
  label: string;
  url: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  grade?: string;
  note?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  subtitle?: string;
  kind: "education" | "experience" | "achievement" | "certification";
}

export interface SkillCategory {
  id: string;
  label: string;
  blurb: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  /** Key into techIcons (simple-icons slug). Falls back to `fallbackIcon`. */
  iconSlug?: string;
  /** Lucide icon name used when no brand icon exists. */
  fallbackIcon?: string;
  /** Alternative names used by projects / search. */
  aliases?: string[];
  description: string;
}

export type ProjectStatus = "Completed" | "In Progress" | "Prototype";

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: ProjectStatus;
  featured: boolean;
  tech: string[];
  /** Short label for the stack when the CV groups it (e.g. "MERN Stack"). */
  stackLabel?: string;
  features: string[];
  problem?: string;
  solution?: string;
  architecture?: string[];
  github?: string;
  live?: string;
  caseStudy?: string;
  /** Path under /public. When omitted a generated cover is used. */
  image?: string;
  cover: { from: string; to: string; icon: string };
}

export interface Achievement {
  id: string;
  title: string;
  detail: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year: string;
  detail: string;
}

export interface ResumeConfig {
  file: string;
  downloadName: string;
}

export interface ContactConfig {
  email: string;
  location: string;
  responseNote: string;
}

export interface DesktopFolderIcon {
  id: string;
  label: string;
  appId: AppId;
  icon: string;
}

export interface Portfolio {
  profile: Profile;
  socialLinks: SocialLink[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  timeline: TimelineEntry[];
  philosophy: { title: string; body: string }[];
  currentFocus: string[];
  skillCategories: SkillCategory[];
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  extraCurricular: string[];
  certifications: Certification[];
  resume: ResumeConfig;
  contact: ContactConfig;
  desktopIcons: DesktopFolderIcon[];
}
