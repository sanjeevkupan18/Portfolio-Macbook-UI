/** Tiny WebAudio UI sounds (no asset files). Volume is 0–100. */
let ctx: AudioContext | null = null;

export function playPing(volume: number, kind: "notify" | "sample" = "notify"): void {
  if (typeof window === "undefined" || volume <= 0) return;
  try {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    ctx ??= new AudioCtor();
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const peak = Math.max(0.0001, (volume / 100) * (kind === "sample" ? 0.18 : 0.12));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    gain.connect(ctx.destination);
    const freqs = kind === "sample" ? [660] : [880, 1318];
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
