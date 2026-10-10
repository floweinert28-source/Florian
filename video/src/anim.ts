/* Bewegung nach .claude/skills/motion-rules: eine Signatur-Kurve, rein ease-out, raus ease-in.
   Wie im Numtera-Vorbild federn nur kleine Elemente (Karten, Häkchen) mit leichtem Überschwingen. */
import { Easing, interpolate, spring } from 'remotion';
import type React from 'react';

export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);

export const SIG = Easing.bezier(0.4, 0, 0.2, 1);   /* Bewegung auf dem Bildschirm: Kamera, Scrollen, Cursor */
export const OUT = Easing.bezier(0, 0, 0.2, 1);     /* Eintritt */
export const IN = Easing.bezier(0.4, 0, 1, 1);      /* Austritt */
export const EXPO_IN = Easing.bezier(0.7, 0, 0.84, 0); /* Durchflug durch einen Buchstaben */
export const SOFT = Easing.bezier(0.16, 1, 0.3, 1);  /* langes Ausrollen für Text-Unschärfe */

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const prog = (f: number, start: number, dur: number, ease: (t: number) => number = SIG) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Feder mit 10–15 % Überschwingen (Karten, Häkchen) */
export const pop = (f: number, start: number, o: { damping?: number; stiffness?: number } = {}) =>
  f < start ? 0 : spring({ frame: f - start, fps: FPS, config: { damping: o.damping ?? 13, stiffness: o.stiffness ?? 170, mass: 1 } });

/* Zoom gleichmäßig wirken lassen: auf der Log-Skala mischen */
export const zoomLerp = (a: number, b: number, t: number) => Math.exp(lerp(Math.log(a), Math.log(b), t));

/* Kamera über Stützpunkte: jeder Punkt gleitet mit eigener Dauer und Kurve vom vorigen Zustand weg */
export type Cam = { s: number; x: number; y: number };
export type CamKey = { at: number; dur: number; to: Partial<Cam>; ease?: (t: number) => number };
export const camAt = (f: number, start: Cam, keys: CamKey[]): Cam => {
  let c = { ...start };
  for (const k of keys) {
    if (f < k.at) break;
    const t = prog(f, k.at, k.dur, k.ease ?? SIG); const to = { ...c, ...k.to };
    c = { s: zoomLerp(c.s, to.s, t), x: lerp(c.x, to.x, t), y: lerp(c.y, to.y, t) };
  }
  return c;
};
/* Weltpunkt (x, y) liegt in der Bildmitte, Maßstab s */
export const camStyle = (c: Cam, cx = 960, cy = 540): React.CSSProperties => ({
  position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${cx - c.x * c.s}px, ${cy - c.y * c.s}px) scale(${c.s})`,
});
export const toScreen = (c: Cam, x: number, y: number, cx = 960, cy = 540) => ({ x: cx + (x - c.x) * c.s, y: cy + (y - c.y) * c.s });
