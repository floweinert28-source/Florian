import React from 'react';
import { MOVE, lerp, prog } from '../motion';

export type CamKey = { f: number; s: number; x: number; y: number; d?: number }; /* ab Frame f: Maßstab s, Blickpunkt (x,y) in App-Koordinaten, Bewegungsdauer d */
const W = 1920, H = 1080;

const clampFocus = (s: number, x: number, y: number) => ({ x: Math.min(W - W / 2 / s, Math.max(W / 2 / s, x)), y: Math.min(H - H / 2 / s, Math.max(H / 2 / s, y)) });

export const cameraAt = (frame: number, keys: CamKey[]) => {
  let i = 0; while (i < keys.length - 1 && keys[i + 1].f <= frame) i++;
  const cur = keys[i]; const prev = keys[Math.max(0, i - 1)];
  const p = i === 0 ? 1 : prog(frame, cur.f, cur.d ?? 24, MOVE);
  const s = lerp(prev.s, cur.s, p);
  const a = clampFocus(prev.s, prev.x, prev.y), b = clampFocus(cur.s, cur.x, cur.y);
  const x = lerp(a.x, b.x, p), y = lerp(a.y, b.y, p);
  return { s, tx: W / 2 - x * s, ty: H / 2 - y * s, x, y };
};

/* Die App-Oberfläche liegt in einem Rahmen, den die Kamera bewegt; nur translate und scale. */
export const CameraFrame: React.FC<{ frame: number; keys: CamKey[]; children?: React.ReactNode }> = ({ frame, keys, children }) => {
  const c = cameraAt(frame, keys);
  return <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', translate: `${c.tx.toFixed(2)}px ${c.ty.toFixed(2)}px`, scale: String(c.s) }}>{children}</div>;
};
