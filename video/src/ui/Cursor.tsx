import React from 'react';
import { lerp, prog, sec, SIG } from '../anim';

export type CursorKey = { at: number; x: number; y: number; dur?: number; click?: boolean };

/* Position in App-Koordinaten: zwischen Stützpunkten mit Signatur-Kurve und leichtem Bogen */
export const cursorAt = (f: number, keys: CursorKey[]) => {
  let x = keys[0].x, y = keys[0].y, lastClick = -1e9;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]; if (f < k.at) break;
    const dur = k.dur ?? sec(0.8); const t = prog(f, k.at, dur, SIG);
    const dx = k.x - x, dy = k.y - y, dist = Math.hypot(dx, dy) || 1; const bulge = Math.sin(t * Math.PI) * Math.min(36, dist * 0.1);
    const nx = lerp(x, k.x, t) + (-dy / dist) * bulge, ny = lerp(y, k.y, t) + (dx / dist) * bulge;
    if (k.click && f >= k.at + dur) lastClick = k.at + dur;
    if (t < 1) return { x: nx, y: ny, clickAge: f - lastClick };
    x = k.x; y = k.y;
  }
  return { x, y, clickAge: f - lastClick };
};

/* macOS-Pfeil; beim Klick kurz eingedrückt mit einem weichen Ring */
export const CursorView: React.FC<{ x: number; y: number; clickAge: number; opacity: number }> = ({ x, y, clickAge, opacity }) => {
  const press = clickAge >= 0 && clickAge < sec(0.16) ? 1 - 0.12 * Math.sin((clickAge / sec(0.16)) * Math.PI) : 1;
  const ring = clickAge >= 0 && clickAge < sec(0.45) ? clickAge / sec(0.45) : null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, pointerEvents: 'none' }}>
      {ring != null ? <div style={{ position: 'absolute', left: -14 - 16 * ring, top: -14 - 16 * ring, width: 28 + 32 * ring, height: 28 + 32 * ring, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.7)', opacity: 0.8 * (1 - ring) }} /> : null}
      <svg width="30" height="30" viewBox="0 0 28 28" style={{ position: 'absolute', left: -4, top: -3, scale: String(press), transformOrigin: '4px 3px', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.45))' }}>
        <path d="M5 3l16 11-7 1.2 4.3 8-3.2 1.5-4.2-8.1L5 21z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
