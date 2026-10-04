/**
 * Original, royalty-safe wallpapers (pure CSS gradients + generated SVG).
 * To add one: append an entry below. `tone` tells the menu bar whether to use dark or light text.
 */
export type WallpaperTone = "light" | "dark";
export interface WallpaperVariant { background: string; tone: WallpaperTone }
export interface Wallpaper { id: string; name: string; light: WallpaperVariant; dark: WallpaperVariant }

/** Deterministic pseudo-random so SSR/CSR and rebuilds always draw the same landscape. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function ridge(seed: number, baseY: number, amp: number, steps: number, fill: string, opacity = 1): string {
  const r = rng(seed);
  const w = 1600;
  const pts: string[] = [`0,1000`];
  let y = baseY;
  for (let i = 0; i <= steps; i++) {
    const x = (w / steps) * i;
    y = baseY - amp * (0.25 + 0.75 * Math.abs(Math.sin(i * 0.7 + seed))) * (0.5 + r());
    pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
  }
  pts.push(`${w},1000`);
  return `<polygon points="${pts.join(" ")}" fill="${fill}" opacity="${opacity}"/>`;
}

function mountainSvg(mode: "light" | "dark"): string {
  const day = mode === "light";
  const sky = day ? ["#ffd9b3", "#ffb4a2", "#8ecae6"] : ["#0b1026", "#1b2250", "#3b2f63"];
  const layers = day
    ? ["#9db4d8", "#7d95c4", "#5a6fa8", "#364a85", "#1f2f5c"]
    : ["#2c3768", "#222b57", "#181f45", "#10152f", "#080b1d"];
  const r = rng(7);
  const stars = day
    ? ""
    : Array.from({ length: 90 }, () => `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 520).toFixed(0)}" r="${(r() * 1.6 + 0.4).toFixed(1)}" fill="#fff" opacity="${(r() * 0.6 + 0.3).toFixed(2)}"/>`).join("");
  const orb = day
    ? `<circle cx="1180" cy="330" r="120" fill="#fff4d6" opacity="0.9"/><circle cx="1180" cy="330" r="220" fill="#fff4d6" opacity="0.18"/>`
    : `<circle cx="1180" cy="260" r="64" fill="#e8ecff" opacity="0.95"/><circle cx="1180" cy="260" r="150" fill="#9fb0ff" opacity="0.12"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="0.55" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient></defs>
<rect width="1600" height="1000" fill="url(#g)"/>${stars}${orb}
${ridge(3, 640, 190, 14, layers[0] ?? "#999", 0.9)}${ridge(11, 720, 210, 16, layers[1] ?? "#888")}${ridge(19, 800, 230, 18, layers[2] ?? "#777")}${ridge(29, 880, 200, 20, layers[3] ?? "#666")}${ridge(41, 960, 150, 24, layers[4] ?? "#555")}
</svg>`;
}

function svgBackground(svg: string): string {
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") center bottom / cover no-repeat`;
}

export const wallpapers: Wallpaper[] = [
  {
    id: "aurora",
    name: "Aurora",
    light: {
      tone: "light",
      background:
        "radial-gradient(60% 55% at 15% 20%, #ffd3e8 0%, transparent 70%), radial-gradient(55% 60% at 85% 15%, #b9d7ff 0%, transparent 70%), radial-gradient(70% 70% at 70% 90%, #d8c6ff 0%, transparent 70%), radial-gradient(50% 50% at 10% 90%, #bff3e3 0%, transparent 70%), #f4f1fb",
    },
    dark: {
      tone: "dark",
      background:
        "radial-gradient(60% 55% at 15% 20%, #5b2a86 0%, transparent 70%), radial-gradient(55% 60% at 85% 15%, #1d4f9c 0%, transparent 70%), radial-gradient(70% 70% at 70% 90%, #3b2a8f 0%, transparent 70%), radial-gradient(50% 50% at 10% 90%, #0f6b6b 0%, transparent 70%), #0d0b1f",
    },
  },
  {
    id: "peaks",
    name: "Peaks",
    light: { tone: "light", background: svgBackground(mountainSvg("light")) },
    dark: { tone: "dark", background: svgBackground(mountainSvg("dark")) },
  },
  {
    id: "graphite",
    name: "Graphite",
    light: {
      tone: "dark",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%), radial-gradient(80% 80% at 80% 20%, #7b8794 0%, transparent 70%), linear-gradient(160deg, #4b5563 0%, #1f2937 100%)",
    },
    dark: {
      tone: "dark",
      background:
        "radial-gradient(70% 60% at 80% 10%, #1e3a5f 0%, transparent 70%), radial-gradient(60% 60% at 10% 90%, #1b1b2f 0%, transparent 70%), linear-gradient(160deg, #0b0f19 0%, #05060a 100%)",
    },
  },
  {
    id: "daybreak",
    name: "Daybreak",
    light: {
      tone: "light",
      background:
        "radial-gradient(70% 60% at 20% 90%, #ffd6a5 0%, transparent 70%), radial-gradient(60% 60% at 90% 20%, #ffc6e0 0%, transparent 70%), radial-gradient(60% 60% at 50% 0%, #fff3c4 0%, transparent 70%), #fff8f0",
    },
    dark: {
      tone: "dark",
      background:
        "radial-gradient(70% 60% at 20% 95%, #b4501e 0%, transparent 70%), radial-gradient(60% 60% at 90% 20%, #7a2e6b 0%, transparent 70%), radial-gradient(60% 60% at 50% 0%, #2b2350 0%, transparent 70%), #15101f",
    },
  },
];

export const defaultWallpaperId = "aurora";
export const wallpaperById = (id: string): Wallpaper => wallpapers.find((w) => w.id === id) ?? wallpapers[0]!;
