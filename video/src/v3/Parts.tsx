/* Bausteine für Video 3 (Vorlage „Outbidd“): Rauten und Ringe als Übergangsanker, die grüne Leit-Raute,
   Wörter, die durch eine Maske nach oben tauschen, und der Planungs-Dialog mit Schrittanzeige. */
import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { clamp01, FPS, lerp, prog, sec, SOFT } from '../anim';
import { DISPLAY, GREEN } from '../theme';
import { A, Icon, mixA } from '../ui/Kit';

/* Konzentrische Rauten, die aus der Mitte wachsen und sich leicht drehen */
export const Diamonds: React.FC<{ f: number; x: number; y: number; start?: number; n?: number; size?: number }> = ({ f, x, y, start = 0, n = 6, size = 260 }) => {
  const { width: W, height: H } = useVideoConfig();
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {Array.from({ length: n }, (_, i) => {
        const k = prog(f, start + sec(i * 0.12), sec(1.5), SOFT); if (k <= 0) return null;
        const s = size * lerp(0.2, 1 + i * 0.75, k); const rot = 45 + 15 * k;
        return <rect key={i} x={x - s / 2} y={y - s / 2} width={s} height={s} rx={s * 0.06} fill="none" stroke={GREEN} strokeWidth={i === 0 ? 2.2 : 1.5}
          strokeOpacity={(i === 0 ? 0.9 : 0.55 - i * 0.07) * clamp01(k * 3)} transform={`rotate(${rot} ${x} ${y})`} style={{ filter: i === 0 ? 'drop-shadow(0 0 10px rgba(52,245,138,0.6))' : undefined }} />;
      })}
    </svg>
  );
};

/* Ringe, die ruhig aus einem Punkt nach außen laufen (Hintergrund-Puls) */
export const Rings: React.FC<{ f: number; x: number; y: number; max: number; n?: number; period?: number; opacity?: number }> = ({ f, x, y, max, n = 4, period = 3.2, opacity = 0.3 }) => {
  const { width: W, height: H } = useVideoConfig(); const t = f / FPS;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const p = ((t / period + i / n) % 1); const r = max * (0.15 + 0.85 * p);
        return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={GREEN} strokeWidth={1.4} strokeOpacity={opacity * Math.sin(Math.PI * p)} />;
      })}
    </svg>
  );
};

/* Bögen in den Ecken (ruhig) */
export const CornerArcs: React.FC<{ a: number }> = ({ a }) => {
  const { width: W, height: H } = useVideoConfig(); const r = Math.min(W, H) * 0.42;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, opacity: a }}>
      {[0, 1, 2].map((i) => (
        <g key={i} fill="none" stroke={GREEN} strokeOpacity={0.22 - i * 0.06} strokeWidth={1.5}>
          <path d={`M 0 ${r + i * 60} A ${r + i * 60} ${r + i * 60} 0 0 0 ${r + i * 60} 0`} />
          <path d={`M ${W} ${H - r - i * 60} A ${r + i * 60} ${r + i * 60} 0 0 0 ${W - r - i * 60} ${H}`} />
        </g>
      ))}
    </svg>
  );
};

/* Die grüne Leit-Raute */
export const Guide: React.FC<{ x: number; y: number; size?: number; scale?: number; opacity?: number; rot?: number }> = ({ x, y, size = 46, scale = 1, opacity = 1, rot = 0 }) => (
  <div style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity, transform: `rotate(${45 + rot}deg) scale(${scale})`, borderRadius: size * 0.2,
    background: `linear-gradient(135deg, #8af5b9, ${GREEN} 45%, #0fb862)`, boxShadow: `0 0 ${size * 0.6}px rgba(52,245,138,0.55)` }} />
);

/* Wort tauscht durch eine Maske: das alte gleitet nach oben hinaus, das neue von unten herein */
export const MaskSwap: React.FC<{ f: number; from: React.ReactNode; to: React.ReactNode; at: number; enter?: number; dur?: number }> = ({ f, from, to, at, enter, dur = 0.45 }) => {
  const k = prog(f, at, sec(dur), SOFT); const e = enter != null ? prog(f, enter, sec(dur), SOFT) : 1;
  /* beide Wörter in derselben Rasterzelle: die Breite richtet sich nach dem längeren */
  return (
    <span style={{ display: 'inline-grid', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.14em', marginBottom: '-0.14em' }}>
      <span style={{ gridArea: '1 / 1', justifySelf: 'start', transform: `translateY(${((1 - e) * 115 - k * 115).toFixed(2)}%)`, opacity: k < 1 ? 1 : 0 }}>{from}</span>
      <span style={{ gridArea: '1 / 1', justifySelf: 'start', transform: `translateY(${((1 - k) * 115).toFixed(2)}%)`, opacity: k > 0 ? 1 : 0 }}>{to}</span>
    </span>
  );
};

/* Schrittanzeige oben im Dialog: 1–4, erledigte Schritte mit Häkchen, die Linie füllt sich */
export const Stepper: React.FC<{ step: number; fill?: number; w: number }> = ({ step, fill = 0, w }) => {
  const labels = ['Account', 'Rules', 'Setups', 'Review']; const gap = (w - 40) / 3;
  return (
    <div style={{ position: 'relative', width: w, height: 58 }}>
      <div style={{ position: 'absolute', left: 20, right: 20, top: 15, height: 3, borderRadius: 2, background: A.surface3 }} />
      <div style={{ position: 'absolute', left: 20, top: 15, height: 3, borderRadius: 2, width: gap * (step - 1 + fill), background: A.accent, boxShadow: `0 0 10px ${A.accentGlow}` }} />
      {labels.map((l, i) => {
        const cur = step - 1 + (fill >= 1 ? 1 : 0); const done = i < cur; const active = i === cur;
        return (
          <div key={l} style={{ position: 'absolute', left: 20 + i * gap - 16, top: 0, width: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, display: 'grid', placeItems: 'center', boxSizing: 'border-box', fontFamily: DISPLAY, fontSize: 13, fontWeight: 700,
              background: done ? A.accent : active ? A.surface : A.surface2, border: `2px solid ${done || active ? A.accent : A.border2}`, color: done ? A.ink : active ? A.accent : A.muted,
              boxShadow: active ? `0 0 0 4px ${mixA(A.accent, 0.15)}` : undefined }}>
              {done ? <Icon name="check" size={15} color={A.ink} sw={3} /> : i + 1}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 12, fontWeight: 600, color: done || active ? A.text : A.muted, whiteSpace: 'nowrap' }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
};

/* Dunkle Fläche mit grünem Schein, für Szenen ohne Raster */
export const Glow: React.FC<{ x?: string; y?: string; a?: number; size?: string }> = ({ x = '50%', y = '50%', a = 0.18, size = '900px 600px' }) => (
  <AbsoluteFill style={{ background: `radial-gradient(${size} at ${x} ${y}, rgba(52,245,138,${a}), transparent 70%)` }} />
);
