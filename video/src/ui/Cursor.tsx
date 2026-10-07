import React from 'react';
import { MOVE, lerp, prog } from '../motion';
import { T } from '../theme';

export type CursorKey = { f: number; x: number; y: number; click?: boolean; hide?: boolean };

/* Position zwischen zwei Stützpunkten: ease-in-out und ein leichter Bogen statt gerader Linie */
export const cursorAt = (frame: number, keys: CursorKey[]) => {
  if (!keys.length) return { x: -100, y: -100, visible: false, clickAge: 999 };
  let i = 0; while (i < keys.length - 1 && keys[i + 1].f <= frame) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const visible = frame >= keys[0].f && !a.hide;
  if (a === b || frame >= b.f) { const k = frame >= b.f ? b : a; const lastClick = [...keys].reverse().find((kk) => kk.click && kk.f <= frame); return { x: k.x, y: k.y, visible: visible && !k.hide, clickAge: lastClick ? frame - lastClick.f : 999 }; }
  const p = prog(frame, a.f, b.f - a.f, MOVE);
  const dx = b.x - a.x, dy = b.y - a.y; const dist = Math.hypot(dx, dy) || 1;
  const bulge = Math.sin(p * Math.PI) * Math.min(60, dist * 0.12) * (dx >= 0 ? -1 : 1);
  const nx = -dy / dist, ny = dx / dist;
  const lastClick = [...keys].reverse().find((kk) => kk.click && kk.f <= frame);
  return { x: lerp(a.x, b.x, p) + nx * bulge, y: lerp(a.y, b.y, p) + ny * bulge, visible, clickAge: lastClick ? frame - lastClick.f : 999 };
};

export const Cursor: React.FC<{ frame: number; keys: CursorKey[] }> = ({ frame, keys }) => {
  const c = cursorAt(frame, keys);
  if (!c.visible) return null;
  const press = c.clickAge >= 0 && c.clickAge <= 6 ? 1 - 0.12 * Math.sin((c.clickAge / 6) * Math.PI) : 1;
  const ripple = c.clickAge >= 0 && c.clickAge <= 12 ? c.clickAge / 12 : null;
  return (
    <div style={{ position: 'absolute', left: c.x, top: c.y, width: 0, height: 0, pointerEvents: 'none' }}>
      {ripple != null ? <div style={{ position: 'absolute', left: -18 * ripple - 6, top: -18 * ripple - 6, width: 36 * ripple + 12, height: 36 * ripple + 12, borderRadius: '50%', border: `2px solid ${T.accent}`, opacity: 0.7 * (1 - ripple) }} /> : null}
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ position: 'absolute', left: -3, top: -2, scale: String(press), transformOrigin: '4px 3px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.6))' }}>
        <path d="M5 3l16 11-7 1.2 4.3 8-3.2 1.5-4.2-8.1L5 21z" fill="#ffffff" stroke="#0b0d0c" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
