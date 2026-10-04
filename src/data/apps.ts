import type { AppDefinition, AppId } from "@/types/app";

export const apps: AppDefinition[] = [
  {
    id: "home", name: "Home", icon: "Home", gradient: ["#4facfe", "#2563eb"],
    description: "Welcome and introduction", keywords: ["welcome", "intro", "hello", "start"],
    defaultSize: { width: 880, height: 660 }, minSize: { width: 420, height: 380 }, inDock: true, inMobileDock: true,
  },
  {
    id: "about", name: "About", icon: "User", gradient: ["#fbbf24", "#f97316"],
    description: "Background, education and experience", keywords: ["bio", "education", "experience", "journey", "timeline", "achievements", "certification", "gate"],
    defaultSize: { width: 900, height: 620 }, minSize: { width: 440, height: 400 }, inDock: true, inMobileDock: true,
  },
  {
    id: "skills", name: "Skills", icon: "Layers", gradient: ["#a78bfa", "#7c3aed"],
    description: "Technologies and tools", keywords: ["tech", "stack", "technologies", "tools", "languages"],
    defaultSize: { width: 940, height: 620 }, minSize: { width: 460, height: 420 }, inDock: true, inMobileDock: false,
  },
  {
    id: "projects", name: "Projects", icon: "FolderOpen", gradient: ["#34d399", "#059669"],
    description: "Selected work", keywords: ["work", "portfolio", "github", "apps", "case study"],
    defaultSize: { width: 980, height: 640 }, minSize: { width: 480, height: 420 }, inDock: true, inMobileDock: true,
  },
  {
    id: "contact", name: "Contact", icon: "Mail", gradient: ["#38bdf8", "#0ea5e9"],
    description: "Send a message", keywords: ["email", "message", "hire", "reach", "linkedin"],
    defaultSize: { width: 760, height: 620 }, minSize: { width: 400, height: 460 }, inDock: true, inMobileDock: true,
  },
  {
    id: "resume", name: "Resume", icon: "FileText", gradient: ["#fb7185", "#e11d48"],
    description: "Preview and download the CV", keywords: ["cv", "pdf", "download"],
    defaultSize: { width: 880, height: 680 }, minSize: { width: 420, height: 420 }, inDock: true, inMobileDock: false,
  },
  {
    id: "settings", name: "Settings", icon: "Settings", gradient: ["#9ca3af", "#4b5563"],
    description: "Appearance, dock, notifications", keywords: ["theme", "dark", "light", "wallpaper", "dock", "preferences", "system settings"],
    defaultSize: { width: 820, height: 560 }, minSize: { width: 460, height: 400 }, inDock: true, inMobileDock: false,
  },
  {
    id: "admin", name: "Admin", icon: "ShieldCheck", gradient: ["#334155", "#0f172a"],
    description: "Message inbox (login required)", keywords: ["inbox", "messages", "dashboard", "login"],
    defaultSize: { width: 960, height: 640 }, minSize: { width: 480, height: 440 }, inDock: true, inMobileDock: false,
  },
];

export const appById: Record<AppId, AppDefinition> = Object.fromEntries(apps.map((a) => [a.id, a])) as Record<AppId, AppDefinition>;
