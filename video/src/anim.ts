/* Bewegung nach .claude/skills/motion-rules: eine Signatur-Kurve (premium, kein Überschwingen), rein ease-out, raus ease-in. */
import { Easing, interpolate } from 'remotion';

export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);

export const SIG = Easing.bezier(0.4, 0, 0.2, 1);   /* Bewegung auf dem Bildschirm: Kamera, Scrollen, Cursor */
export const OUT = Easing.bezier(0, 0, 0.2, 1);     /* Eintritt */
export const IN = Easing.bezier(0.4, 0, 1, 1);      /* Austritt */

export const prog = (f: number, start: number, dur: number, ease: (t: number) => number = SIG) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Ein Element blendet ein (ease-out, von unten) und später aus (ease-in, kürzer, nach oben) */
export const inOut = (f: number, inAt: number, outAt: number | null, o: { inDur?: number; outDur?: number; rise?: number; lift?: number } = {}) => {
  const inDur = o.inDur ?? sec(0.5), outDur = o.outDur ?? sec(0.3), rise = o.rise ?? 14, lift = o.lift ?? -8;
  const a = prog(f, inAt, inDur, OUT); const b = outAt == null ? 0 : prog(f, outAt, outDur, IN);
  return { opacity: a * (1 - b), translate: `0px ${(lerp(rise, 0, a) + lerp(0, lift, b)).toFixed(2)}px` };
};
