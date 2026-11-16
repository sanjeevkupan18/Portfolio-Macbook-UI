/**
 * Hybrid Device / Simulated Battery Store.
 * Detects real hardware battery and charging telemetry via navigator.getBattery() (Chrome, Android, Edge, Chromium).
 * Falls back to a realistic macOS/iOS simulated battery drift when the Battery API is disabled (Safari, Firefox).
 */
export interface BatteryState {
  level: number; // 0 to 100
  charging: boolean;
  isReal: boolean;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<{
    charging: boolean;
    level: number;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  }>;
}

const SERVER: BatteryState = { level: 87, charging: true, isReal: false };
let state: BatteryState = SERVER;
let started = false;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function init() {
  if (started || typeof window === "undefined") return;
  started = true;

  const nav = navigator as NavigatorWithBattery;
  if (typeof nav.getBattery === "function") {
    nav.getBattery().then((bm) => {
      const updateReal = () => {
        state = {
          level: Math.min(100, Math.max(0, Math.round(bm.level * 100))),
          charging: bm.charging,
          isReal: true,
        };
        listeners.forEach((l) => l());
      };

      updateReal();
      bm.addEventListener("levelchange", updateReal);
      bm.addEventListener("chargingchange", updateReal);

      if (timer) {
        clearInterval(timer);
        timer = undefined;
      }
    }).catch(() => {
      startSimulation();
    });
  } else {
    startSimulation();
  }
}

function startSimulation() {
  if (state.isReal) return;
  state = {
    level: 62 + Math.floor(Math.random() * 33),
    charging: Math.random() > 0.45,
    isReal: false,
  };
  listeners.forEach((l) => l());
}

function tick() {
  if (state.isReal) return;
  let { level, charging } = state;
  if (charging) {
    if (level < 100 && Math.random() < 0.7) level += 1;
    if (level >= 100 && Math.random() < 0.15) charging = false;
  } else {
    if (Math.random() < 0.55) level -= 1;
    if (level <= 20) charging = true;
  }
  state = { level: Math.min(100, Math.max(15, level)), charging, isReal: false };
  listeners.forEach((l) => l());
}

export const batteryStore = {
  subscribe(cb: () => void) {
    init();
    listeners.add(cb);
    if (!state.isReal && !timer) {
      timer = setInterval(tick, 20_000);
    }
    return () => {
      listeners.delete(cb);
      if (listeners.size === 0 && timer) {
        clearInterval(timer);
        timer = undefined;
      }
    };
  },
  getSnapshot: (): BatteryState => {
    init();
    return state;
  },
  getServerSnapshot: (): BatteryState => SERVER,
};

export function batteryStatusLabel(b: BatteryState): string {
  if (b.charging) return b.level >= 100 ? "Fully charged" : "Charging";
  return "On battery";
}
