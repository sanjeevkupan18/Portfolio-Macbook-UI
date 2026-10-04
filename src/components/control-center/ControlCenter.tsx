"use client";

import { useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Battery, BatteryCharging, Bluetooth, BluetoothOff, Keyboard, Moon, Radio, Sun, SunDim, Volume1, Volume2, VolumeX, Wifi, WifiOff, MoonStar } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { useDesktop } from "@/context/DesktopContext";
import { useNotifications } from "@/context/NotificationContext";
import { useOverlay } from "@/context/OverlayContext";
import { useTheme } from "@/context/ThemeContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { batteryStatusLabel } from "@/lib/battery";
import { playPing } from "@/lib/sound";
import { cn } from "@/lib/utils";

function Tile({ active, onClick, icon, label, sub, className }: { active: boolean; onClick: () => void; icon: ReactNode; label: string; sub?: string; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("flex items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-hover", className)}>
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full transition-colors", active ? "bg-accent text-accent-fg" : "bg-[color-mix(in_srgb,var(--foreground)_16%,transparent)]")}>{icon}</span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[12px] font-semibold">{label}</span>
        {sub && <span className="block truncate text-[11px] text-muted">{sub}</span>}
      </span>
    </button>
  );
}

function SliderCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] px-3 pt-2 pb-2.5 shadow-[0_0_0_0.5px_var(--border)]">
      <p className="mb-0.5 text-[12px] font-semibold">{title}</p>
      <div className="flex items-center gap-2"><span className="text-muted" aria-hidden="true">{icon}</span><div className="flex-1">{children}</div></div>
    </div>
  );
}

const card = "rounded-2xl bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] p-2 shadow-[0_0_0_0.5px_var(--border)]";

export function ControlCenter() {
  const { overlay, close } = useOverlay();
  const isOpen = overlay?.type === "controlCenter";
  const mobile = useIsMobile();
  const reduce = useReducedMotion();
  const { prefs, setPrefs, battery } = useDesktop();
  const { resolved, setTheme } = useTheme();
  const { notify } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, (e) => {
    if (!(e.target as Element).closest("[data-overlay-trigger]")) close();
  }, isOpen);

  const dark = resolved === "dark";
  const VolIcon = prefs.volume === 0 ? VolumeX : prefs.volume < 50 ? Volume1 : Volume2;
  const BatIcon = battery.charging ? BatteryCharging : Battery;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-label="Control Center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          style={{ transformOrigin: "top right" }}
          className={cn("glass glass-panel os-chrome fixed z-[1500] rounded-3xl p-3", mobile ? "inset-x-3 top-[calc(env(safe-area-inset-top)+34px)]" : "top-[34px] right-2 w-[340px]")}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <div className={cn(card, "flex flex-col gap-0.5")}>
              <Tile active={prefs.wifi} onClick={() => setPrefs({ wifi: !prefs.wifi })} icon={prefs.wifi ? <Wifi className="size-4" /> : <WifiOff className="size-4" />} label="Wi-Fi" sub={prefs.wifi ? "Connected" : "Off"} />
              <Tile active={prefs.bluetooth} onClick={() => setPrefs({ bluetooth: !prefs.bluetooth })} icon={prefs.bluetooth ? <Bluetooth className="size-4" /> : <BluetoothOff className="size-4" />} label="Bluetooth" sub={prefs.bluetooth ? "On" : "Off"} />
              <Tile active={prefs.airdrop} onClick={() => setPrefs({ airdrop: !prefs.airdrop })} icon={<Radio className="size-4" />} label="AirDrop" sub={prefs.airdrop ? "Everyone" : "Off"} />
            </div>
            <div className="flex flex-col gap-2.5">
              <div className={card}>
                <Tile active={prefs.focus} onClick={() => { setPrefs({ focus: !prefs.focus }); notify({ title: prefs.focus ? "Focus turned off" : "Focus turned on", body: prefs.focus ? undefined : "Notification banners are silenced.", key: "focus" }); }} icon={<MoonStar className="size-4" />} label="Focus" sub={prefs.focus ? "On" : "Off"} />
              </div>
              <div className={card}>
                <Tile
                  active={dark}
                  onClick={() => { const next = dark ? "light" : "dark"; setTheme(next); notify({ title: `Theme changed to ${next === "dark" ? "Dark" : "Light"}.`, key: "theme" }); }}
                  icon={dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  label={dark ? "Dark Mode" : "Light Mode"}
                  sub="Tap to switch"
                />
              </div>
            </div>
          </div>
          <div className="mt-2.5 space-y-2.5">
            <SliderCard title="Display" icon={<SunDim className="size-4" />}>
              <Slider tone="glass" label="Display brightness" min={35} max={100} value={Math.round(prefs.brightness * 100)} onChange={(v) => setPrefs({ brightness: v / 100 })} />
            </SliderCard>
            <SliderCard title="Keyboard Brightness" icon={<Keyboard className="size-4" />}>
              <Slider tone="glass" label="Keyboard brightness" value={prefs.keyboardBrightness} onChange={(v) => setPrefs({ keyboardBrightness: v })} />
            </SliderCard>
            <SliderCard title="Sound" icon={<VolIcon className="size-4" />}>
              <Slider tone="glass" label="Volume" value={prefs.volume} onChange={(v) => setPrefs({ volume: v })} onCommit={(v) => playPing(v, "sample")} />
            </SliderCard>
            <div className={cn(card, "flex items-center gap-3 px-3 py-2.5")}>
              <BatIcon className="size-5 text-muted" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold">Battery <span className="font-normal text-muted">· {battery.level}%</span></p>
                <p className="text-[11px] text-muted">{batteryStatusLabel(battery)} <span className="opacity-70">(simulated)</span></p>
              </div>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--foreground)_16%,transparent)]" role="img" aria-label={`Battery ${battery.level} percent`}>
                <div className={cn("h-full rounded-full", battery.level <= 20 && !battery.charging ? "bg-danger" : "bg-success")} style={{ width: `${battery.level}%` }} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
