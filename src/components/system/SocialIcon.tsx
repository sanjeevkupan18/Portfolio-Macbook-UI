import { Mail, Globe } from "lucide-react";
import { techIcons } from "@/data/techIcons";
import type { SocialLink } from "@/types/portfolio";

/** Brand glyphs for social links (lucide dropped brand icons; GitHub comes from simple-icons, LinkedIn is a simple original mark). */
export function SocialIcon({ id, className }: { id: SocialLink["id"]; className?: string }) {
  if (id === "github") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d={techIcons.github?.path ?? ""} />
      </svg>
    );
  }
  if (id === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="4.5" fill="currentColor" />
        <text x="12" y="17" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="system-ui, sans-serif" style={{ fill: "var(--social-glyph-bg, #fff)" }}>in</text>
      </svg>
    );
  }
  if (id === "email") return <Mail className={className} aria-hidden="true" />;
  return <Globe className={className} aria-hidden="true" />;
}
