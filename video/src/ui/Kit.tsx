/* Karten-Baukasten für das Video: hell, ruhig, viel Luft. Angelehnt an das helle Erscheinungsbild der App
   (Satoshi für Text, Onest für Zahlen, Grün #0fb862), aber reduziert auf das Wesentliche. */
import React from 'react';
import { evolvePath } from '@remotion/paths';
import { clamp01, lerp } from '../anim';
import { DISPLAY, NUM } from '../theme';

export const K = {
  bg: '#f6f8f7', surface: '#ffffff', soft: '#f3f6f4', line: '#e5ebe7', text: '#0d130f', text2: '#3d463f', muted: '#7b857e', faint: '#c6cec8',
  accent: '#0fb862', accentSoft: 'rgba(15,184,98,0.11)', loss: '#e5484d', lossSoft: 'rgba(229,72,77,0.10)', warn: '#e0a019',
};
export const cardShadow = (lift = 0) =>
  `0 1px 2px rgba(13,19,15,0.04), 0 ${24 + lift * 30}px ${48 + lift * 50}px -${26 - lift * 6}px rgba(13,40,24,${(0.26 + lift * 0.16).toFixed(3)})`;

export const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode; lift?: number; dark?: boolean }> = ({ x, y, w, h, style, children, lift = 0, dark }) => (
  <div style={{
    position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, padding: 26, boxSizing: 'border-box', fontFamily: DISPLAY,
    background: dark ? 'rgba(255,255,255,0.045)' : K.surface, border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : K.line}`,
    boxShadow: dark ? 'none' : cardShadow(lift), color: dark ? '#fff' : K.text, ...style,
  }}>{children}</div>
);

export const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 500, color: K.muted, letterSpacing: '-0.005em', ...style }}>{children}</div>
);
export const Num: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 44, color = K.text, style }) => (
  <div style={{ fontFamily: NUM, fontSize: size, fontWeight: 700, color, letterSpacing: '-0.03em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums', ...style }}>{children}</div>
);
export const Pill: React.FC<{ children: React.ReactNode; tone?: 'green' | 'red' | 'neutral' | 'solid'; size?: number }> = ({ children, tone = 'neutral', size = 15 }) => {
  const c = { green: [K.accentSoft, K.accent], red: [K.lossSoft, K.loss], neutral: [K.soft, K.text2], solid: [K.accent, '#fff'] }[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: `${size * 0.32}px ${size * 0.8}px`, borderRadius: 999, background: c[0], color: c[1], fontFamily: DISPLAY, fontSize: size, fontWeight: 700, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>{children}</span>;
};

/* Geld mit Tausendertrennung */
export const usd = (n: number, sign = false) => `${sign ? (n < 0 ? '−' : '+') : n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* Halbkreis: Anteil p grün, Rest rot, zeichnet sich mit t */
export const Gauge: React.FC<{ p: number; t: number; size?: number }> = ({ p, t, size = 96 }) => {
  const r = size / 2 - 7; const L = Math.PI * r; const d = `M 7 ${size / 2} A ${r} ${r} 0 0 1 ${size - 7} ${size / 2}`;
  return (
    <svg width={size} height={size / 2 + 8} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={K.loss} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${L * t} ${L}`} opacity={0.9} />
      <path d={d} fill="none" stroke={K.accent} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${L * p * t} ${L}`} />
    </svg>
  );
};
/* Ring: Anteil p grün */
export const Ring: React.FC<{ p: number; t: number; size?: number }> = ({ p, t, size = 84 }) => {
  const r = size / 2 - 7; const C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={K.loss} strokeWidth={11} strokeDasharray={`${C * t} ${C}`} opacity={0.9} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={K.accent} strokeWidth={11} strokeDasharray={`${C * p * t} ${C}`} strokeLinecap="round" />
    </svg>
  );
};
/* Balken aus zwei Teilen */
export const Split: React.FC<{ p: number; t: number; w: number }> = ({ p, t, w }) => (
  <div style={{ position: 'relative', width: w, height: 10, borderRadius: 5, background: K.soft, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: w * t, background: K.loss, opacity: 0.9 }} />
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: w * p * t, background: K.accent, borderRadius: 5 }} />
  </div>
);

/* Linien und Flächen: Werte → Pfad im Feld w × h */
const scale = (vals: number[][], w: number, h: number, pad = 0.08, zero = true) => {
  const all = vals.flat(); const lo = Math.min(zero ? 0 : Infinity, ...all), hi = Math.max(...all); const span = hi - lo || 1;
  return (v: number[]) => v.map((y, i) => [(i / (v.length - 1)) * w, h - ((y - lo) / span) * h * (1 - pad) - h * pad * 0.5] as const);
};
/* weiche Kurve durch die Punkte */
const smooth = (pts: readonly (readonly [number, number])[]) => pts.reduce((d, [x, y], i, a) => {
  if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  const [px, py] = a[i - 1]; const cx = (px + x) / 2;
  return `${d} C ${cx.toFixed(1)} ${py.toFixed(1)}, ${cx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
}, '');

export const AreaChart: React.FC<{ values: number[]; w: number; h: number; t: number; id: string }> = ({ values, w, h, t, id }) => {
  const pts = scale([values], w, h)(values); const line = smooth(pts); const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const e = evolvePath(clamp01(t), line);
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={K.accent} stopOpacity={0.22} /><stop offset="100%" stopColor={K.accent} stopOpacity={0} /></linearGradient>
        <clipPath id={`${id}-c`}><rect x={0} y={-20} width={w * clamp01(t)} height={h + 40} /></clipPath>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={K.line} strokeWidth={1} strokeDasharray="4 6" />)}
      <path d={area} fill={`url(#${id})`} clipPath={`url(#${id}-c)`} />
      <path d={line} fill="none" stroke={K.accent} strokeWidth={3.5} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
    </svg>
  );
};

export const Bars: React.FC<{ values: number[]; w: number; h: number; t: number; stagger?: number }> = ({ values, w, h, t, stagger = 0.5 }) => {
  const max = Math.max(...values.map(Math.abs)); const bw = (w / values.length) * 0.56; const mid = h / 2;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <line x1={0} x2={w} y1={mid} y2={mid} stroke={K.line} strokeWidth={1.5} />
      {values.map((v, i) => {
        const k = clamp01((t - (i / values.length) * stagger) / (1 - stagger)); const bh = (Math.abs(v) / max) * (mid - 6) * k;
        const x = (i + 0.5) * (w / values.length) - bw / 2;
        return <rect key={i} x={x} y={v >= 0 ? mid - bh : mid} width={bw} height={bh} rx={Math.min(5, bw / 2)} fill={v >= 0 ? K.accent : K.loss} opacity={v >= 0 ? 1 : 0.9} />;
      })}
    </svg>
  );
};

export const Lines: React.FC<{ a: number[]; b: number[]; w: number; h: number; t: number }> = ({ a, b, w, h, t }) => {
  const s = scale([a, b], w, h, 0.12, false); const pa = s(a), pb = s(b); const la = smooth(pa), lb = smooth(pb);
  const ea = evolvePath(clamp01(t), la), eb = evolvePath(clamp01(t), lb);
  const end = (p: readonly (readonly [number, number])[]) => p[p.length - 1];
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={K.line} strokeWidth={1} strokeDasharray="4 6" />)}
      <path d={la} fill="none" stroke="#a3aca5" strokeWidth={3} strokeLinecap="round" strokeDasharray={ea.strokeDasharray} strokeDashoffset={ea.strokeDashoffset} />
      <path d={lb} fill="none" stroke={K.accent} strokeWidth={4} strokeLinecap="round" strokeDasharray={eb.strokeDasharray} strokeDashoffset={eb.strokeDashoffset} />
      {t >= 1 ? <><circle cx={end(pa)[0]} cy={end(pa)[1]} r={7} fill="#a3aca5" /><circle cx={end(pb)[0]} cy={end(pb)[1]} r={8} fill={K.accent} stroke="#fff" strokeWidth={3} /></> : null}
    </svg>
  );
};
export const lineEnds = (a: number[], b: number[], w: number, h: number) => { const s = scale([a, b], w, h, 0.12, false); const pa = s(a), pb = s(b); return { a: pa[pa.length - 1], b: pb[pb.length - 1] }; };

/* Häkchen im Kreis; vorher ein drehender Ring */
export const Check: React.FC<{ f: number; at: number; done: number; size?: number; dark?: boolean }> = ({ f, at, done, size = 44, dark }) => (
  <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
    {done < 0.02 ? (
      <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: `3px solid ${dark ? 'rgba(255,255,255,0.14)' : K.line}`, borderTopColor: '#34f58a', opacity: clamp01((f - at + 30) / 10), transform: `rotate(${f * 9}deg)` }} />
    ) : (
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#34f58a', display: 'grid', placeItems: 'center', transform: `scale(${done})`, boxShadow: '0 0 24px rgba(52,245,138,0.45)' }}>
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#04140a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    )}
  </div>
);

/* Eingabefeld mit getipptem Text (n Zeichen sichtbar), Fokus-Rahmen und Cursor */
export const Field: React.FC<{ label: string; value: string; n: number; focus: number; caretOn: boolean; w: number; suffix?: React.ReactNode }> = ({ label, value, n, focus, caretOn, w, suffix }) => (
  <div style={{ width: w }}>
    <Label style={{ marginBottom: 10 }}>{label}</Label>
    <div style={{
      position: 'relative', height: 64, borderRadius: 16, boxSizing: 'border-box', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: lerpColor(K.soft, '#ffffff', focus), border: `1.5px solid ${lerpColor(K.line, K.accent, focus)}`, boxShadow: `0 0 0 ${(4 * focus).toFixed(2)}px ${K.accentSoft}`,
    }}>
      <span style={{ fontFamily: NUM, fontSize: 24, fontWeight: 600, color: K.text, letterSpacing: '-0.01em', whiteSpace: 'pre' }}>
        {value.slice(0, n)}{focus > 0.5 ? <span style={{ display: 'inline-block', width: 2, height: 28, marginLeft: 2, verticalAlign: -5, background: K.accent, opacity: caretOn ? 1 : 0 }} /> : null}
      </span>
      {suffix}
    </div>
  </div>
);
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const lerpColor = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t)))).join(',')})`; };
