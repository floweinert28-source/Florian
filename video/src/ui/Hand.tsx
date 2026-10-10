/* Zeigehand wie im Vorbild (weiße Hand mit farbiger Kontur). Die Spitze des Zeigefingers ist der Klickpunkt (x, y).
   Beim Klick drückt sie kurz ein, ein weicher Ring läuft nach außen. */
import React from 'react';
import { sec } from '../anim';

/* Umriss in einem 30 × 36-Raster, Spitze bei (11.5, 1.8) */
const HAND = 'M9 4.5C9 2.8 10.2 1.8 11.5 1.8C12.8 1.8 14 2.8 14 4.5L14 13.5C14 12 15.1 11.2 16.3 11.2C17.5 11.2 18.6 12 18.6 13.5L18.6 14.5C18.6 13.2 19.7 12.5 20.8 12.5C22 12.5 23 13.3 23 14.8L23 16C23 14.8 24 14.1 25 14.1C26.2 14.1 27.2 15 27.2 16.3L27.2 24C27.2 30 23.5 34 18 34L15.5 34C12 34 10 32.8 8 30.5L2.8 24.2C1.8 23 2 21.4 3.2 20.6C4.4 19.8 5.9 20.1 6.8 21.1L9 23.5Z';
const TIP = [11.5, 1.8];

export const Hand: React.FC<{ x: number; y: number; clickAge?: number; size?: number; opacity?: number; rot?: number; line?: string }> = ({ x, y, clickAge = -1, size = 70, opacity = 1, rot = -14, line = '#0b8a47' }) => {
  const k = size / 36;
  const press = clickAge >= 0 && clickAge < sec(0.22) ? 1 - 0.16 * Math.sin((clickAge / sec(0.22)) * Math.PI) : 1;
  const ring = clickAge >= 0 && clickAge < sec(0.5) ? clickAge / sec(0.5) : null;
  const R = size * (0.28 + 0.5 * (ring ?? 0));
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, pointerEvents: 'none' }}>
      {ring != null ? <div style={{ position: 'absolute', left: -R, top: -R, width: 2 * R, height: 2 * R, borderRadius: '50%', border: `${(size / 30).toFixed(2)}px solid rgba(52,245,138,0.8)`, opacity: 0.9 * (1 - ring) }} /> : null}
      <svg width={size * 30 / 36} height={size} viewBox="0 0 30 36" style={{ position: 'absolute', left: -TIP[0] * k, top: -TIP[1] * k, overflow: 'visible',
        transformOrigin: `${TIP[0] * k}px ${TIP[1] * k}px`, transform: `rotate(${rot}deg) scale(${press})`, filter: `drop-shadow(0 ${(size / 9).toFixed(1)}px ${(size / 6).toFixed(1)}px rgba(0,0,0,.5))` }}>
        <path d={HAND} fill="#fff" stroke={line} strokeWidth={1.7} strokeLinejoin="round" />
        <path d="M14 13.5v5.6M18.6 14.5v5.1M23 16v4.4" fill="none" stroke={line} strokeWidth={1.4} strokeLinecap="round" />
      </svg>
    </div>
  );
};
