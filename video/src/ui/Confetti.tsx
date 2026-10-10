/* Konfetti wie im Vorbild, in Journalyst-Farben: ein Schuss aus einem Punkt, dann Luftwiderstand, Schwerkraft, Drehen und Kippen.
   Feste Zufallswerte, damit jedes Bild gleich gerendert wird. */
import React from 'react';
import { FPS } from '../anim';

const COLORS = ['#34f58a', '#8af5b9', '#f2f0ec', '#0fb862', '#c9ffe0', '#1fd873'];
const make = (n: number, seed: number) => {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => {
    const w = 8 + r() * 8, round = r() < 0.25;
    return { ang: -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.5, sp: 0.55 + r() * 0.75, w, h: round ? w : w * (1.4 + r() * 0.6), rot: r() * 360, spin: (r() - 0.5) * 900,
      flip: 4 + r() * 10, ph: r() * 6.28, c: COLORS[Math.floor(r() * COLORS.length)], life: 1.9 + r() * 0.7, round };
  });
};
const PIECES = make(100, 29);

export const Confetti: React.FC<{ f: number; at: number; x: number; y: number; scale?: number; power?: number }> = ({ f, at, x, y, scale = 1, power = 1500 }) => {
  const t = (f - at) / FPS;
  if (t < 0 || t > 2.8) return null;
  const k = 3.2, g = 1900 * scale;
  return (
    <>
      {PIECES.map((p, i) => {
        if (t > p.life) return null;
        const v = power * p.sp * scale; const d = (1 - Math.exp(-k * t)) / k;
        const px = x + Math.cos(p.ang) * v * d, py = y + Math.sin(p.ang) * v * d + 0.5 * g * t * t * 0.55;
        const a = Math.min(1, (p.life - t) / 0.45) * Math.min(1, t / 0.04);
        return (
          <div key={i} style={{ position: 'absolute', left: px, top: py, width: p.w * scale, height: p.h * scale, marginLeft: (-p.w * scale) / 2, marginTop: (-p.h * scale) / 2,
            background: p.c, borderRadius: p.round ? '50%' : 2 * scale, opacity: a, transform: `rotate(${(p.rot + p.spin * t).toFixed(1)}deg) scaleY(${Math.cos(p.ph + p.flip * t).toFixed(3)})`,
            boxShadow: p.c === '#34f58a' ? '0 0 8px rgba(52,245,138,0.5)' : undefined }} />
        );
      })}
    </>
  );
};
