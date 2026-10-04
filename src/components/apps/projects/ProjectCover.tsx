import { NamedIcon } from "@/components/system/icons";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/portfolio";

interface ProjectCoverProps {
  project: Project;
  className?: string;
  /** "hero" scales up the glyph for the detail view. */
  size?: "card" | "hero";
}

/** Generated cover: brand gradient + dotted pattern + soft glow + large glyph. */
export function ProjectCover({ project, className, size = "card" }: ProjectCoverProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative isolate flex items-center justify-center overflow-hidden", className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${project.cover.from}, ${project.cover.to})` }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1.4px)",
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(135deg, black 0%, transparent 70%)",
          WebkitMaskImage: "linear-gradient(135deg, black 0%, transparent 70%)",
        }}
      />
      <div className="absolute -top-1/3 -right-1/4 size-3/4 rounded-full bg-white/25 blur-3xl" />
      <div className="absolute -bottom-1/2 -left-1/4 size-3/4 rounded-full bg-black/25 blur-3xl" />
      <div
        className={cn(
          "relative grid place-items-center rounded-[28%] bg-white/18 text-white shadow-[inset_0_0.5px_0_rgba(255,255,255,0.5),0_10px_30px_-8px_rgba(0,0,0,0.45)] backdrop-blur-sm",
          size === "hero" ? "size-24 @lg:size-28" : "size-14",
        )}
      >
        <NamedIcon name={project.cover.icon} className={size === "hero" ? "size-12 @lg:size-14" : "size-7"} strokeWidth={1.5} />
      </div>
    </div>
  );
}
