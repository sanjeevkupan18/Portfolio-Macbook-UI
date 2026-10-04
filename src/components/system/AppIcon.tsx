import { appById } from "@/data/apps";
import type { AppId } from "@/types/app";
import { cn } from "@/lib/utils";
import { NamedIcon } from "./icons";

interface AppIconProps {
  appId: AppId;
  /** Pixel size of the squircle. Omit to fill the parent (use with a sized wrapper). */
  size?: number;
  className?: string;
}

/** iOS/macOS-style squircle app icon built from the app registry (original artwork, no Apple assets). */
export function AppIcon({ appId, size, className }: AppIconProps) {
  const app = appById[appId];
  return (
    <span
      aria-hidden="true"
      className={cn("app-icon relative inline-grid shrink-0 place-items-center text-white", className)}
      style={{
        width: size ?? "100%",
        height: size ?? "100%",
        borderRadius: size ? size * 0.225 : "22.5%",
        background: `linear-gradient(160deg, ${app.gradient[0]}, ${app.gradient[1]})`,
      }}
    >
      <NamedIcon name={app.icon} style={{ width: "52%", height: "52%" }} strokeWidth={1.9} />
    </span>
  );
}
