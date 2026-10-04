import Image from "next/image";
import { portfolio } from "@/data/portfolio";
import { cn } from "@/lib/utils";

export function Avatar({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <Image
      src={portfolio.profile.avatar}
      alt={`${portfolio.profile.name} profile photo`}
      width={size}
      height={size}
      unoptimized
      priority={size >= 96}
      className={cn("shrink-0 rounded-full object-cover shadow-[0_0_0_0.5px_var(--border),0_6px_18px_-6px_rgba(0,0,0,0.35)]", className)}
      style={{ width: size, height: "auto" }}
    />
  );
}
