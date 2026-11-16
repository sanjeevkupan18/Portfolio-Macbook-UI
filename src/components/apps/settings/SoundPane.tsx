"use client";

import { useState } from "react";
import { Volume2, Volume1, VolumeX, Play, Headphones, Music2 } from "lucide-react";
import { useDesktop } from "@/context/DesktopContext";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { ALERT_SOUNDS, playAlertSound, type AlertSoundName } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Group, PaneTitle, Row } from "./controls";

export function SoundPane() {
  const { prefs, setPrefs } = useDesktop();
  const [activeSound, setActiveSound] = useState<AlertSoundName>("ping");

  const VolumeIcon =
    prefs.volume === 0 ? VolumeX : prefs.volume < 50 ? Volume1 : Volume2;

  const testSound = (soundId: AlertSoundName) => {
    setActiveSound(soundId);
    playAlertSound(soundId, prefs.volume > 0 ? prefs.volume : 50);
  };

  return (
    <div>
      <PaneTitle>Sound</PaneTitle>

      {/* Output Volume & Mute */}
      <Group title="Sound Output">
        <Row
          label="Output volume"
          description={
            prefs.volume === 0
              ? "Audio is muted"
              : `Current level: ${prefs.volume}%`
          }
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setPrefs({ volume: prefs.volume === 0 ? 50 : 0 })
              }
              aria-label={prefs.volume === 0 ? "Unmute audio" : "Mute audio"}
              className="grid size-7 place-items-center rounded-lg text-muted hover:text-foreground hover:bg-hover transition-colors"
            >
              <VolumeIcon className="size-4" aria-hidden="true" />
            </button>
            <Slider
              label="Output volume"
              min={0}
              max={100}
              value={prefs.volume}
              onChange={(volume) => {
                setPrefs({ volume });
              }}
              className="w-36 @md:w-48"
            />
          </div>
        </Row>

        <Row
          label="Play sound effects"
          description="Play interactive audio feedback for notifications, actions, and clicks"
        >
          <Switch
            label="Play sound effects"
            checked={prefs.soundEffects}
            onChange={(soundEffects) => setPrefs({ soundEffects })}
          />
        </Row>
      </Group>

      {/* Output Device */}
      <Group title="Output Device">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-accent/15 text-accent">
              <Headphones className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold">MacBook Pro Speakers</p>
              <p className="text-[12px] text-muted">Built-in High-Fidelity Audio Array</p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11.5px] font-medium text-emerald-600 dark:text-emerald-400">
            Active
          </span>
        </div>
      </Group>

      {/* Alert Sound Picker */}
      <Group title="System Alert Sounds">
        <div className="py-2.5">
          <p className="mb-2 text-[12px] text-muted">
            Select an alert sound or click Play to preview the synthesized WebAudio tone:
          </p>
          <div className="flex flex-col divide-y divide-border/60">
            {ALERT_SOUNDS.map((s) => {
              const selected = activeSound === s.id;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-2 text-[13px]"
                >
                  <div className="flex items-center gap-2.5">
                    <Music2
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        selected ? "text-accent" : "text-muted"
                      )}
                      aria-hidden="true"
                    />
                    <div>
                      <p className={cn("font-medium", selected && "text-accent")}>
                        {s.label}
                      </p>
                      <p className="text-[11.5px] text-muted">{s.desc}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={selected ? "primary" : "secondary"}
                    onClick={() => testSound(s.id)}
                    className="gap-1.5 text-[12px]"
                  >
                    <Play className="size-3 fill-current" aria-hidden="true" />
                    Preview
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </Group>
    </div>
  );
}
