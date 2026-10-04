import { storage } from "@/lib/storage";

/**
 * Tiny external store persisted to localStorage, consumed with useSyncExternalStore.
 * Server snapshot = defaults, so SSR and hydration always agree.
 */
export function createPersistedStore<T extends object>(key: string, defaults: T) {
  let state: T = defaults;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const read = (): T => {
    if (!hydrated && typeof window !== "undefined") {
      state = { ...defaults, ...storage.get<Partial<T>>(key, {}) };
      hydrated = true;
    }
    return state;
  };
  const emit = () => listeners.forEach((l) => l());

  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    getSnapshot: read,
    getServerSnapshot: (): T => defaults,
    set(patch: Partial<T> | ((prev: T) => Partial<T>)) {
      const prev = read();
      state = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
      storage.set(key, state);
      emit();
    },
    reset() {
      state = defaults;
      hydrated = true;
      storage.remove(key);
      emit();
    },
  };
}
