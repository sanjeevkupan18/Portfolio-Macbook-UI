"use client";

import { useState, useSyncExternalStore } from "react";
import { Monitor, Sun, Sparkles } from "lucide-react";
import { useDesktop } from "@/context/DesktopContext";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Group, PaneTitle, Row } from "./controls";

interface ScreenInfo {
  width: number;
  height: number;
  dpr: number;
  colorDepth: number;
}

const DEFAULT_SCREEN: ScreenInfo = { width: 2560, height: 1440, dpr: 2, colorDepth: 24 };

function getScreenSnapshot(): string {
  if (typeof window === "undefined") return "2560:1440:2:24";
  const w = Math.round(window.screen.width * (window.devicePixelRatio || 1));
  const h = Math.round(window.screen.height * (window.devicePixelRatio || 1));
  const dpr = window.devicePixelRatio || 1;
  const cd = window.screen.colorDepth || 24;
  return `${w}:${h}:${dpr}:${cd}`;
}

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export function DisplaysPane() {
  const { prefs, setPrefs } = useDesktop();
  const [trueTone, setTrueTone] = useState(true);
  const [nightShift, setNightShift] = useState(false);

  const snapshot = useSyncExternalStore(subscribe, getScreenSnapshot, () => "2560:1440:2:24");
  const [w, h, dpr, cd] = snapshot.split(":").map(Number);
  const screenInfo: ScreenInfo = {
    width: w ?? DEFAULT_SCREEN.width,
    height: h ?? DEFAULT_SCREEN.height,
    dpr: dpr ?? DEFAULT_SCREEN.dpr,
    colorDepth: cd ?? DEFAULT_SCREEN.colorDepth,
  };

  return (
    <div>
      <PaneTitle>Displays</PaneTitle>

      {/* Screen Preview Graphic */}
      <div className="mb-5 flex flex-col items-center justify-center rounded-2xl bg-surface p-6 shadow-[0_0_0_0.5px_var(--border)] text-center">
        <div className="relative mb-3 flex flex-col items-center">
          <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-tr from-sky-500/20 via-blue-500/10 to-transparent ring-1 ring-sky-500/30">
            <Monitor className="size-10 text-sky-500" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-[15px] font-semibold">Built-in Liquid Retina XDR Display</h3>
        <p className="mt-0.5 text-[12.5px] text-muted">
          {screenInfo.width} × {screenInfo.height} · {screenInfo.dpr >= 2 ? "Retina HiDPI" : "Standard"} · Wide Color (P3)
        </p>
      </div>

      {/* Brightness Controls */}
      <Group title="Brightness">
        <Row
          label="Display brightness"
          description={`Level: ${Math.round(prefs.brightness * 100)}%`}
        >
          <div className="flex items-center gap-3">
            <Sun className="size-3.5 text-muted shrink-0" aria-hidden="true" />
            <Slider
              label="Display brightness"
              min={35}
              max={100}
              value={Math.round(prefs.brightness * 100)}
              onChange={(val) => setPrefs({ brightness: val / 100 })}
              className="w-36 @md:w-48"
            />
            <Sun className="size-5 text-amber-500 shrink-0" aria-hidden="true" />
          </div>
        </Row>

        <Row
          label="True Tone"
          description="Automatically adapt display colors to ambient lighting conditions"
        >
          <Switch
            label="True Tone"
            checked={trueTone}
            onChange={setTrueTone}
          />
        </Row>

        <Row
          label="Night Shift"
          description="Shift display colors to the warmer end of the spectrum"
        >
          <Switch
            label="Night Shift"
            checked={nightShift}
            onChange={setNightShift}
          />
        </Row>
      </Group>

      {/* Display Specifications */}
      <Group title="Display Specifications">
        <div className="grid grid-cols-2 gap-4 py-3 @md:grid-cols-4">
          <div className="rounded-xl bg-hover/70 p-3">
            <span className="block text-[11px] font-medium text-muted">Resolution</span>
            <span className="mt-1 block text-[13px] font-semibold tabular-nums">
              {screenInfo.width} × {screenInfo.height}
            </span>
          </div>
          <div className="rounded-xl bg-hover/70 p-3">
            <span className="block text-[11px] font-medium text-muted">Scale Factor</span>
            <span className="mt-1 block text-[13px] font-semibold tabular-nums">
              @{screenInfo.dpr}x Retina
            </span>
          </div>
          <div className="rounded-xl bg-hover/70 p-3">
            <span className="block text-[11px] font-medium text-muted">Color Depth</span>
            <span className="mt-1 block text-[13px] font-semibold">
              {screenInfo.colorDepth}-bit P3
            </span>
          </div>
          <div className="rounded-xl bg-hover/70 p-3">
            <span className="block text-[11px] font-medium text-muted">Refresh Rate</span>
            <span className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-accent">
              <Sparkles className="size-3.5" aria-hidden="true" /> ProMotion
            </span>
          </div>
        </div>
      </Group>
    </div>
  );
}
