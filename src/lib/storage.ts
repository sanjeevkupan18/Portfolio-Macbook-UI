/** Safe wrappers: storage can throw (private mode, blocked cookies, SSR). Keys are namespaced. */
const NS = "sp-os:";

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(NS + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      window.localStorage.setItem(NS + key, JSON.stringify(value));
    } catch {
      /* ignore quota / privacy errors */
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(NS + key);
    } catch {
      /* ignore */
    }
  },
  clearAll(): void {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(NS))
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  },
};

export const sessionFlag = {
  get(key: string): boolean {
    try {
      return window.sessionStorage.getItem(NS + key) === "1";
    } catch {
      return false;
    }
  },
  set(key: string, value: boolean): void {
    try {
      if (value) window.sessionStorage.setItem(NS + key, "1");
      else window.sessionStorage.removeItem(NS + key);
    } catch {
      /* ignore */
    }
  },
};
