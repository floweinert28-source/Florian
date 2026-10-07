/* Bewegung: eine Signatur-Kurve, drei feste Dauern, ease-out rein, ease-in raus (siehe .claude/skills/motion-rules). */
import type React from 'react';
import { Easing, interpolate } from 'remotion';

export const FPS = 30;
export const ms = (m: number) => Math.max(1, Math.round((m / 1000) * FPS));

export const ENTER = Easing.bezier(0.2, 0.8, 0.2, 1);   // rein: ease-out (Signatur der App, --ease)
export const MOVE = Easing.bezier(0.4, 0, 0.2, 1);      // auf dem Bildschirm: premium, kein Überschwingen
export const EXIT = Easing.bezier(0.4, 0, 1, 1);        // raus: ease-in

export const D = { micro: ms(120), quick: ms(240), card: ms(420), scene: ms(560), big: ms(900), draw: ms(1300) };

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const prog = (frame: number, start: number, dur: number, easing: (t: number) => number = ENTER) =>
  interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

/* Eintritt von unten: Deckkraft und 24px Weg. */
export const enterStyle = (frame: number, start: number, dur = D.card, dy = 24): React.CSSProperties => {
  const p = prog(frame, start, dur);
  return { opacity: p, translate: `0px ${((1 - p) * dy).toFixed(2)}px` };
};
/* Austritt nach oben, 30–50 % kürzer als der Eintritt. */
export const exitStyle = (frame: number, start: number, dur = D.quick, dy = -14): React.CSSProperties => {
  const p = prog(frame, start, dur, EXIT);
  return { opacity: 1 - p, translate: `0px ${(p * dy).toFixed(2)}px` };
};
export const inOut = (frame: number, start: number, end: number, o: { inDur?: number; outDur?: number; dy?: number } = {}): React.CSSProperties => {
  const outDur = o.outDur ?? D.quick;
  if (frame >= end - outDur) return exitStyle(frame, end - outDur, outDur);
  return enterStyle(frame, start, o.inDur ?? D.card, o.dy ?? 24);
};
/* Zahlen hochzählen, ease-out, damit das Ende ruhig steht. */
export const count = (frame: number, start: number, dur: number, to: number, from = 0) => lerp(from, to, prog(frame, start, dur));
/* Schleifen immer mit Sinus. */
export const sine = (frame: number, periodFrames: number, phase = 0) => 0.5 + 0.5 * Math.sin((frame / periodFrames) * Math.PI * 2 + phase);
/* Skalen-Puls für Klicks: 100 % → 97 % → 100 % in 6 Frames. */
export const pressScale = (frame: number, at: number, depth = 0.03) => {
  const t = frame - at; if (t < 0 || t > 6) return 1;
  return 1 - depth * Math.sin((t / 6) * Math.PI);
};
