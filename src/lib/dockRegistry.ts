import type { AppId } from "@/types/app";

/** Lets windows find their dock icon so minimize can animate toward it. */
const icons = new Map<AppId, HTMLElement>();

export function registerDockIcon(appId: AppId, el: HTMLElement | null): void {
  if (el) icons.set(appId, el);
  else icons.delete(appId);
}

export function getDockIconRect(appId: AppId): DOMRect | null {
  return icons.get(appId)?.getBoundingClientRect() ?? null;
}
