/** Tiny WebAudio UI sounds (no asset files). Volume is 0–100. */
let ctx: AudioContext | null = null;

export type AlertSoundName = "ping" | "boop" | "submarine" | "glass" | "pop";

export const ALERT_SOUNDS: { id: AlertSoundName; label: string; desc: string }[] = [
  { id: "ping", label: "Ping (Default)", desc: "Two-tone melodic chime" },
  { id: "glass", label: "Glass Chime", desc: "Crystal resonant triad" },
  { id: "submarine", label: "Submarine", desc: "Deep sonar pulse" },
  { id: "boop", label: "Boop", desc: "Warm subtle rounded tone" },
  { id: "pop", label: "Mechanical Pop", desc: "Crisp tactile switch click" },
];

export function playAlertSound(sound: AlertSoundName, volume: number): void {
  if (typeof window === "undefined" || volume <= 0) return;
  try {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    ctx ??= new AudioCtor();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const volScale = Math.max(0.0001, (volume / 100) * 0.15);
    gain.gain.setValueAtTime(0.0001, now);

    if (sound === "pop") {
      gain.gain.setValueAtTime(volScale * 1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.08);
      return;
    }

    if (sound === "boop") {
      gain.gain.exponentialRampToValueAtTime(volScale, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.3);
      return;
    }

    if (sound === "submarine") {
      gain.gain.exponentialRampToValueAtTime(volScale * 1.1, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      gain.connect(ctx.destination);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.08);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.6);
      return;
    }

    if (sound === "glass") {
      gain.gain.exponentialRampToValueAtTime(volScale * 0.9, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      gain.connect(ctx.destination);
      [1046, 1318, 2093].forEach((f, i) => {
        const osc = ctx!.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + i * 0.04);
        osc.connect(gain);
        osc.start(now + i * 0.04);
        osc.stop(now + 0.65);
      });
      return;
    }

    // Default "ping"
    gain.gain.exponentialRampToValueAtTime(volScale, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    gain.connect(ctx.destination);
    const freqs = [880, 1318];
    freqs.forEach((f, i) => {
      const osc = ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + i * 0.09);
      osc.connect(gain);
      osc.start(now + i * 0.09);
      osc.stop(now + 0.45);
    });
  } catch {
    /* autoplay policy or no audio device: ignore */
  }
}

export function playPing(volume: number, kind: "notify" | "sample" = "notify"): void {
  playAlertSound(kind === "sample" ? "boop" : "ping", volume);
}
