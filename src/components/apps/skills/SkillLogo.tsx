"use client";

import { techIcons } from "@/data/techIcons";
import { NamedIcon } from "@/components/system/icons";
import { useTheme } from "@/context/ThemeContext";
import { luminance } from "@/lib/utils";
import type { Skill } from "@/types/portfolio";

interface SkillLogoProps {
  skill: Skill;
  /** Pixel size of the glyph. */
  size?: number;
  className?: string;
  /** When true the logo is announced with the skill name (use when no visible name is adjacent). */
  labelled?: boolean;
}

/** Brand glyph for a skill. Falls back to currentColor when the brand colour would vanish on the current theme. */
export function SkillLogo({ skill, size = 28, className, labelled = false }: SkillLogoProps) {
  const { resolved } = useTheme();
  const icon = skill.iconSlug ? techIcons[skill.iconSlug] : undefined;
  const a11y = labelled ? { role: "img" as const, "aria-label": skill.name } : { "aria-hidden": true as const };

  if (icon) {
    const lum = luminance(icon.hex);
    const unreadable = resolved === "dark" ? lum < 0.06 : lum > 0.62;
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        fill={unreadable ? "currentColor" : icon.hex}
        {...a11y}
      >
        <path d={icon.path} />
      </svg>
    );
  }

  return <NamedIcon name={skill.fallbackIcon} width={size} height={size} strokeWidth={1.6} className={className} {...a11y} />;
}
