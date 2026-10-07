/* Kamera im App-Fenster: Maßstab s und Blickpunkt (cx, cy) in CSS-Pixeln der App. Zoom wird logarithmisch gemischt, damit er gleichmäßig wirkt. */
import { lerp, prog, SIG } from './anim';
import { VH, VW, type Box } from './shots';

export type Cam = { s: number; cx: number; cy: number };
export const FULL: Cam = { s: 1, cx: VW / 2, cy: VH / 2 };

export const fit = (b: Box, o: { pad?: number; max?: number } = {}): Cam => {
  const pad = o.pad ?? 56, max = o.max ?? 1.8;
  const s = Math.max(1, Math.min(max, VW / (b.w + 2 * pad), VH / (b.h + 2 * pad)));
  const hx = VW / 2 / s, hy = VH / 2 / s;
  return { s, cx: Math.min(VW - hx, Math.max(hx, b.x + b.w / 2)), cy: Math.min(VH - hy, Math.max(hy, b.y + b.h / 2)) };
};
const mix = (a: Cam, b: Cam, t: number): Cam => ({ s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), t)), cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t) });

export type CamKey = { at: number; dur: number; to: Cam };
export const camAt = (f: number, keys: CamKey[]): Cam => {
  let cur = FULL;
  for (const k of keys) { if (f < k.at) break; cur = mix(cur, k.to, prog(f, k.at, k.dur, SIG)); }
  return cur;
};
/* App-Punkt → Punkt im Fensterinhalt (unskaliert, 1440 × 900) */
export const toView = (c: Cam, x: number, y: number) => ({ x: VW / 2 + (x - c.cx) * c.s, y: VH / 2 + (y - c.cy) * c.s });
export const camTransform = (c: Cam) => ({ transformOrigin: '0 0', translate: `${(VW / 2 - c.cx * c.s).toFixed(3)}px ${(VH / 2 - c.cy * c.s).toFixed(3)}px`, scale: c.s.toFixed(5) });
