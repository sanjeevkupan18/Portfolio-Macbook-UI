"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (next: number) => void;
  /** Fires when the user releases the thumb */
  onCommit?: (value: number) => void;
  label: string;
  /** "glass" = white fill (Control Center), "accent" = accent fill (Settings) */
  tone?: "glass" | "accent";
  className?: string;
}

/** Accessible native range input with a macOS look. */
export function Slider({ value, min = 0, max = 100, step = 1, onChange, onCommit, label, tone = "accent", className }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      onKeyUp={(e) => onCommit?.(Number((e.target as HTMLInputElement).value))}
      className={cn("mac-slider", tone === "accent" && "mac-slider-plain", className)}
      style={{ "--fill": `${pct}%` } as React.CSSProperties}
    />
  );
}
