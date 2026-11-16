"use client";

import { useState } from "react";
import { Battery, BatteryCharging, BatteryWarning, Zap, ShieldCheck, Clock } from "lucide-react";
import { useDesktop } from "@/context/DesktopContext";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import { Group, PaneTitle, Row } from "./controls";

export function BatteryPane() {
  const { battery } = useDesktop();
  const [lowPowerMode, setLowPowerMode] = useState(false);
  const [optimizedCharging, setOptimizedCharging] = useState(true);

  const levelPercent = Math.min(100, Math.max(0, Math.round(battery.level)));
  const isCharging = battery.charging;

  const BatteryIcon = isCharging
    ? BatteryCharging
    : levelPercent <= 20
    ? BatteryWarning
    : Battery;

  const barColor = isCharging
    ? "bg-amber-500"
    : levelPercent <= 20
    ? "bg-rose-500"
    : "bg-emerald-500";

  return (
    <div>
      <PaneTitle>Battery</PaneTitle>

      {/* Battery Status Hero Card */}
      <div className="mb-5 flex flex-col items-center justify-center rounded-2xl bg-surface p-6 shadow-[0_0_0_0.5px_var(--border)] text-center">
        <div className="relative mb-3 flex flex-col items-center">
          <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-green-500/10 to-transparent ring-1 ring-emerald-500/30">
            <BatteryIcon
              className={cn(
                "size-10",
                isCharging
                  ? "text-amber-500"
                  : levelPercent <= 20
                  ? "text-rose-500"
                  : "text-emerald-500"
              )}
              aria-hidden="true"
            />
          </div>
          {isCharging && (
            <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-amber-500 text-white shadow-xs ring-2 ring-surface">
              <Zap className="size-3 fill-current" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-bold tracking-tight tabular-nums">
            {levelPercent}%
          </span>
        </div>

        <p className="mt-0.5 text-[13px] font-medium text-foreground">
          {isCharging
            ? "Connected to Power Adapter — Fully Powered"
            : "Running on Battery Power"}
        </p>

        <div className="mt-2 flex items-center justify-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              battery.isReal
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                : "bg-hover text-muted"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                battery.isReal ? "bg-emerald-500 animate-pulse" : "bg-muted"
              )}
              aria-hidden="true"
            />
            {battery.isReal ? "Live Device Telemetry Active" : "Simulated Battery Telemetry"}
          </span>
        </div>

        {/* Visual Battery Bar */}
        <div className="mt-4 h-3 w-48 overflow-hidden rounded-full bg-hover p-0.5 ring-1 ring-border">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${Math.max(5, levelPercent)}%` }}
          />
        </div>
      </div>

      {/* Energy & Power Modes */}
      <Group title="Power Modes">
        <Row
          label="Low Power Mode"
          description="Reduces energy consumption to extend battery life and keep the system cool"
        >
          <Switch
            label="Low Power Mode"
            checked={lowPowerMode}
            onChange={setLowPowerMode}
          />
        </Row>

        <Row
          label="Optimized Battery Charging"
          description="To reduce battery aging, the system learns your charging routine"
        >
          <Switch
            label="Optimized Battery Charging"
            checked={optimizedCharging}
            onChange={setOptimizedCharging}
          />
        </Row>
      </Group>

      {/* Battery Health */}
      <Group title="Battery Health">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold">Battery Condition: Normal</p>
              <p className="text-[12px] text-muted">Maximum Capacity: 100%</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11.5px] font-medium text-emerald-600 dark:text-emerald-400">
            Peak Performance
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <Clock className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold">Estimated Runtime</p>
              <p className="text-[12px] text-muted">
                {isCharging ? "Unlimited on AC Power" : "Approx. 14 hrs remaining"}
              </p>
            </div>
          </div>
        </div>
      </Group>
    </div>
  );
}
