/**
 * SIMULATED battery. Never reads the visitor's real battery.
 * Starts at a random plausible level and drifts slowly within 15–100%.
 */
export interface BatteryState { level: number; charging: boolean }

const SERVER: BatteryState = { level: 87, charging: true };
let state: BatteryState = SERVER;
let started = false;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

function init() {
  if (started || typeof window === "undefined") return;
  started = true;
  state = { level: 62 + Math.floor(Math.random() * 33), charging: Math.random() > 0.45 };
}

function tick() {
  let { level, charging } = state;
  if (charging) {
    if (level < 100 && Math.random() < 0.7) level += 1;
    if (level >= 100 && Math.random() < 0.15) charging = false; // unplugged
  } else {
    if (Math.random() < 0.55) level -= 1;
    if (level <= 20) charging = true; // plug in at low battery
  }
  state = { level: Math.min(100, Math.max(15, level)), charging };
  listeners.forEach((l) => l());
}

export const batteryStore = {
  subscribe(cb: () => void) {
    init();
    listeners.add(cb);
    timer ??= setInterval(tick, 20_000);
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
  return "Not charging";
}
