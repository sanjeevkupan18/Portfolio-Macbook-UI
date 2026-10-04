import {
  Home, User, Layers, FolderOpen, Mail, FileText, Settings, ShieldCheck, Database, ChartBar, ChartLine, ChartScatter,
  Network, KeyRound, Code, Boxes, Workflow, Binary, Sparkles, Cpu, MessageSquareText, Mic, Cloud, Brain, ListChecks,
  Folder, Terminal, GitBranch, Globe, type LucideIcon, type LucideProps,
} from "lucide-react";
import type { IconName } from "@/types/icons";

/** Explicit map (instead of `import * as`) keeps lucide tree-shaken. */
export const iconMap: Record<IconName, LucideIcon> = {
  Home, User, Layers, FolderOpen, Mail, FileText, Settings, ShieldCheck, Database, ChartBar, ChartLine, ChartScatter,
  Network, KeyRound, Code, Boxes, Workflow, Binary, Sparkles, Cpu, MessageSquareText, Mic, Cloud, Brain, ListChecks,
  Folder, Terminal, GitBranch, Globe,
};

export type NamedIconProps = Omit<LucideProps, "ref"> & { name: string | undefined };

/** Renders a Lucide icon by name (falls back to a generic glyph). */
export function NamedIcon({ name, ...props }: NamedIconProps) {
  const Icon = (name ? (iconMap as Record<string, LucideIcon>)[name] : undefined) ?? Code;
  return <Icon {...props} />;
}
