"use client";

import dynamic from "next/dynamic";
import { AppSkeleton } from "@/components/ui/Skeleton";
import type { AppComponent, AppId } from "@/types/app";
import { HomeApp } from "./home/HomeApp";

const loading = () => <AppSkeleton />;

/**
 * App registry: maps an AppId to its component. Heavy apps are lazy-loaded (with skeleton fallbacks);
 * Home is bundled eagerly because it is the first thing visitors see.
 * Every app receives `{ launch }` and must render inside any container width (desktop window or phone screen).
 */
export const appComponents: Record<AppId, AppComponent> = {
  home: HomeApp,
  about: dynamic(() => import("./about/AboutApp").then((m) => m.AboutApp), { loading }),
  skills: dynamic(() => import("./skills/SkillsApp").then((m) => m.SkillsApp), { loading }),
  projects: dynamic(() => import("./projects/ProjectsApp").then((m) => m.ProjectsApp), { loading }),
  contact: dynamic(() => import("./contact/ContactApp").then((m) => m.ContactApp), { loading }),
  resume: dynamic(() => import("./resume/ResumeApp").then((m) => m.ResumeApp), { loading }),
  settings: dynamic(() => import("./settings/SettingsApp").then((m) => m.SettingsApp), { loading }),
  admin: dynamic(() => import("./admin/AdminApp").then((m) => m.AdminApp), { loading }),
};
