/* Bausteine im Design der Journalyst-App (dunkles Erscheinungsbild aus web/css/app.css), vereinfacht fürs Video.
   Alle Maße in App-Pixeln; die Szenen skalieren ganze Karten, damit die Proportionen der App erhalten bleiben. */
import React from 'react';
import { evolvePath } from '@remotion/paths';
import { clamp01, lerp } from '../anim';
import { DISPLAY, NUM } from '../theme';

/* Farben der App (:root) */
export const A = {
  bg: '#0e0d0b', bg2: '#151412', surface: '#1a1917', surface2: '#22211f', surface3: '#2b2a26', border: '#262522', border2: '#34322e', field: '#121110',
  text: '#f2f0ec', text2: '#bcb8b1', muted: '#8a867f', faint: '#4f4c47',
  accent: '#34f58a', accent2: '#1fd873', ink: '#04140a', accentSoft: 'rgba(52, 245, 138, 0.12)', accentGlow: 'rgba(52, 245, 138, 0.28)',
  loss: '#ff5c5c', lossSoft: 'rgba(255, 92, 92, 0.14)', be: '#8b7cf6', beSoft: 'rgba(139, 124, 246, 0.16)', warn: '#f5b93a', info: '#5cb8ff',
};
/* color-mix(in srgb, a p%, b) */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, p: number, b: string) => { const x = hex(a), y = hex(b); return '#' + x.map((v, i) => Math.round(v * p + y[i] * (1 - p)).toString(16).padStart(2, '0')).join(''); };
export const mixA = (a: string, alpha: number) => `rgba(${hex(a).join(',')}, ${alpha})`;

/* Symbole aus web/js/ui.js (24er-Raster, Strich 1.9) */
const P: Record<string, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>,
  stats: <><path d="M3 17l5-6 4 3 5-7 4 4" /><path d="M3 21h18" /></>,
  progress: <path d="M6 3h12M6 21h12M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" />,
  tradelog: <><path d="M4 6h16M4 12h16M4 18h10" /><circle cx="19" cy="18" r="1" /></>,
  day: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /><rect x="7" y="13" width="4" height="4" rx="1" /></>,
  journal: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M8 3v18M12 8h4M12 12h4" /></>,
  shadow: <><circle cx="9" cy="12" r="6" /><path d="M13.5 6.6a6 6 0 1 1 0 10.8" strokeDasharray="2 2.5" /></>,
  replay: <><rect x="3" y="6" width="13" height="14" rx="2" /><path d="M8 3h11a2 2 0 0 1 2 2v11" /><path d="M8 11l4 2-4 2z" /></>,
  prop: <><path d="M3 20h18" /><path d="M5 20V9l7-5 7 5v11" /><path d="M9 20v-5h6v5" /><path d="M12 8v3" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  plus: <path d="M12 5v14M5 12h14" />, chev: <path d="M6 9l6 6 6-6" />, close: <path d="M6 6l12 12M18 6L6 18" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>, check: <path d="M5 12l5 5L20 7" />,
  long: <path d="M7 17L17 7M9 7h8v8" />, short: <path d="M7 7l10 10M17 9v8H9" />,
};
export const Icon: React.FC<{ name: string; size?: number; color?: string; sw?: number; style?: React.CSSProperties }> = ({ name, size = 18, color = 'currentColor', sw = 1.9, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', display: 'block', ...style }}>{P[name]}</svg>
);

/* Karte (.card) und Kachel (.tile) */
export const lift = (l: number): React.CSSProperties => ({
  transform: `translateZ(${(l * 90).toFixed(2)}px) scale(${(1 + l * 0.035).toFixed(4)})`,
  boxShadow: l > 0.001 ? `0 ${(18 + l * 30).toFixed(1)}px ${(50 + l * 40).toFixed(1)}px rgba(0,0,0,${(0.35 + l * 0.3).toFixed(3)}), 0 0 0 1px ${mixA(A.accent, 0.25 * l)}` : undefined,
});
export const Card: React.FC<{ x: number; y: number; w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode; tile?: boolean }> = ({ x, y, w, h, style, children, tile }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', background: A.surface, border: `1px solid ${A.border}`, borderRadius: 14,
    padding: tile ? '12px 15px' : '18px 20px', fontFamily: DISPLAY, color: A.text, ...style }}>{children}</div>
);
export const CardTitle: React.FC<{ children: React.ReactNode; info?: boolean; right?: React.ReactNode }> = ({ children, info = true, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, color: A.text }}>{children}{info ? <Icon name="info" size={15} color={A.faint} /> : null}</div>{right}
  </div>
);
export const TileHead: React.FC<{ children: React.ReactNode; n?: React.ReactNode }> = ({ children, n }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, color: A.text2 }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{children}<Icon name="info" size={13} color={A.faint} /></span>
    {n != null ? <span style={{ fontFamily: NUM, fontSize: 12, fontWeight: 500, color: A.muted }}>{n}</span> : null}
  </div>
);
/* Zahlen wie in der App: Onest 700, eng, normale (nicht tabellarische) Ziffern */
export const Val: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 25, color = A.text, style }) => (
  <div style={{ fontFamily: NUM, fontSize: size, fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1.1, whiteSpace: 'nowrap', ...style }}>{children}</div>
);
export const Pill: React.FC<{ children: React.ReactNode; tone?: 'win' | 'loss' | 'be' | 'neutral' | 'open'; num?: boolean; size?: number }> = ({ children, tone = 'neutral', num, size = 11.5 }) => {
  const c = { win: [A.accentSoft, A.accent], loss: [A.lossSoft, A.loss], be: [A.beSoft, A.be], neutral: [A.surface3, A.text2], open: [A.surface3, A.info] }[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: c[0], color: c[1], fontFamily: num ? NUM : DISPLAY, fontSize: size, fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1.35 }}>{children}</span>;
};
/* LONG/SHORT-Abzeichen (.badge) */
export const Badge: React.FC<{ dir: 'LONG' | 'SHORT' }> = ({ dir }) => {
  const c = dir === 'LONG' ? A.accent : A.loss;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 22, padding: '0 9px 0 3px', boxSizing: 'border-box', borderRadius: 999, fontFamily: DISPLAY, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.07em', color: c,
      border: `1px solid ${mixA(c, 0.3)}`, background: `linear-gradient(90deg, ${mixA(c, 0.22)}, ${mixA(c, 0.06)} 75%)`, whiteSpace: 'nowrap' }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 16, height: 16, borderRadius: 8, background: c, boxShadow: `0 0 8px ${mixA(c, 0.45)}` }}><Icon name={dir === 'LONG' ? 'long' : 'short'} size={10} color={A.bg} sw={3} /></span>{dir}
    </span>
  );
};
export const Btn: React.FC<{ children: React.ReactNode; kind?: 'primary' | 'accent' | 'plain'; style?: React.CSSProperties }> = ({ children, kind = 'plain', style }) => {
  const s = { primary: { background: A.accent, border: `1px solid ${A.accent}`, color: A.ink }, accent: { background: mix(A.accent, 0.1, A.surface), border: `1px solid ${mixA(A.accent, 0.45)}`, color: A.accent, boxShadow: `0 8px 20px -10px ${A.accentGlow}` }, plain: { background: A.surface, border: `1px solid ${A.border2}`, color: A.text } }[kind];
  return <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', boxSizing: 'border-box', borderRadius: 12, fontFamily: DISPLAY, fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', ...s, ...style }}>{children}</div>;
};
export const Switch: React.FC<{ on: boolean }> = ({ on }) => (
  <div style={{ position: 'relative', width: 36, height: 20, borderRadius: 999, background: on ? A.accent : A.surface3, boxShadow: on ? undefined : `inset 0 0 0 1px ${A.border2}` }}>
    <div style={{ position: 'absolute', top: 3, left: on ? 19 : 3, width: 14, height: 14, borderRadius: 7, background: on ? '#fff' : A.muted, boxShadow: on ? '0 1px 2px rgba(0,0,0,.25)' : undefined }} />
  </div>
);

/* Halbkreis wie U.semiGauge: Abschnitte nacheinander, t zeichnet von links */
export const SemiGauge: React.FC<{ segs: { v: number; c: string }[]; t: number; size?: number }> = ({ segs, t, size = 110 }) => {
  const r = 42, cx = 60, cy = 58, lw = 11; const total = Math.max(1e-9, segs.reduce((a, s) => a + Math.max(0, s.v), 0));
  const pt = (ang: number) => [cx + r * Math.cos(ang), cy - r * Math.sin(ang)];
  let a = Math.PI; const stop = Math.PI * (1 - clamp01(t));
  const arcs = segs.filter((s) => s.v > 0).map((s, i) => {
    const span = (s.v / total) * Math.PI; const a1 = Math.max(a - span, stop); if (a <= stop) { a -= span; return null; }
    const [x0, y0] = pt(a), [x1, y1] = pt(a1); const d = `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)}`; a -= span;
    return <path key={i} d={d} fill="none" stroke={s.c} strokeWidth={lw} />;
  });
  return (
    <svg viewBox="0 0 120 66" width={size} height={size * 0.55}>
      <path d={`M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={A.surface3} strokeWidth={lw} />{arcs}
    </svg>
  );
};
/* Ring wie U.donut */
export const Donut: React.FC<{ segs: { v: number; c: string }[]; t: number; size?: number; lw?: number }> = ({ segs, t, size = 56, lw = 8 }) => {
  const r = (size - lw) / 2, c = 2 * Math.PI * r; const total = Math.max(segs.reduce((a, s) => a + Math.max(s.v, 0), 0), 1e-9); let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={A.surface3} strokeWidth={lw} />
      {segs.map((s, i) => { const f = (Math.max(s.v, 0) / total) * clamp01(t); const len = Math.max(f * c - 2, 0); const e = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.c} strokeWidth={lw} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc * c + 1} />; acc += (Math.max(s.v, 0) / total) * clamp01(t); return e; })}
    </svg>
  );
};
/* Radar wie U.radar */
export const Radar: React.FC<{ axes: { label: string; score: number }[]; t: number; size?: number }> = ({ axes, t, size = 220 }) => {
  const pad = 70; const c = size / 2, r = size / 2 - 30, n = axes.length;
  const pt = (i: number, f: number) => { const a = -Math.PI / 2 + (i / n) * 2 * Math.PI; return [c + Math.cos(a) * r * f, c + Math.sin(a) * r * f]; };
  const area = axes.map((a, i) => pt(i, Math.max(a.score * clamp01(t), 0.03)).join(',')).join(' ');
  return (
    <svg viewBox={`${-pad} 0 ${size + 2 * pad} ${size}`} width={size + 2 * pad} height={size}>
      {[0.25, 0.5, 0.75, 1].map((f) => <polygon key={f} points={axes.map((_, i) => pt(i, f).join(',')).join(' ')} fill="none" stroke={A.border2} />)}
      {axes.map((_, i) => <line key={i} x1={c} y1={c} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]} stroke={A.border} />)}
      <polygon points={area} fill={A.accent} fillOpacity={0.22} stroke={A.accent} strokeWidth={2} strokeLinejoin="round" />
      {axes.map((a, i) => { const [x, y] = pt(i, 1.2); const anchor = Math.abs(x - c) < 4 ? 'middle' : x < c ? 'end' : 'start'; return <text key={i} x={x} y={y + 4} textAnchor={anchor} style={{ fontSize: 11, fill: A.text2, fontWeight: 600, fontFamily: DISPLAY }}>{a.label}</text>; })}
    </svg>
  );
};
/* Score-Skala (.score-scale): Füllung und Knopf im Verlauf rot → gelb → grün */
export const ScoreScale: React.FC<{ p: number; w: number }> = ({ p, w }) => {
  const grad = (k: number) => `linear-gradient(90deg, ${mix(A.loss, k, A.surface)}, ${mix(A.warn, k, A.surface)}, ${mix(A.accent, k, A.surface)})`;
  const sx = Math.max(7, Math.min(w - 7, (p / 100) * w));
  return (
    <div style={{ position: 'relative', width: w, height: 30 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 6, borderRadius: 3, backgroundImage: grad(0.26) }} />
      <div style={{ position: 'absolute', left: 0, top: 10, height: 6, width: sx, borderRadius: '3px 0 0 3px', backgroundImage: grad(0.82), backgroundSize: `${w}px 6px` }} />
      <div style={{ position: 'absolute', top: 6, left: sx - 7, width: 14, height: 14, borderRadius: 7, backgroundImage: grad(0.82), backgroundSize: `${w}px 14px`, backgroundPosition: `${7 - sx}px 0`, boxShadow: '0 1px 4px rgba(0,0,0,.35)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', justifyContent: 'space-between', fontFamily: NUM, fontSize: 11, color: A.muted }}>{[0, 20, 40, 60, 80, 100].map((v) => <span key={v}>{v}</span>)}</div>
    </div>
  );
};

/* Kurven */
type Pt = readonly [number, number];
const smooth = (pts: readonly Pt[]) => pts.reduce((d, [x, y], i, a) => { if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`; const [px, py] = a[i - 1]; const cx = (px + x) / 2; return `${d} C ${cx.toFixed(1)} ${py.toFixed(1)}, ${cx.toFixed(1)} ${y.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`; }, '');
const fit = (sets: number[][], w: number, h: number, withZero: boolean) => {
  const all = sets.flat(); const lo = Math.min(withZero ? 0 : Infinity, ...all), hi = Math.max(...all); const span = hi - lo || 1;
  return { lo, hi, y: (v: number) => h - ((v - lo) / span) * h * 0.9 - h * 0.05, pts: (v: number[]) => v.map((y, i) => [(i / (v.length - 1)) * w, h - ((y - lo) / span) * h * 0.9 - h * 0.05] as const) };
};
const axisMoney = (v: number) => (v < 0 ? '-' : '') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US');
const ticks = (lo: number, hi: number, n = 4) => { const step = Math.pow(10, Math.floor(Math.log10((hi - lo) / n))); const s = [1, 2, 2.5, 5, 10].map((k) => k * step).find((k) => (hi - lo) / k <= n) ?? step * 10; const out: number[] = []; for (let v = Math.ceil(lo / s) * s; v <= hi; v += s) out.push(v); return out; };

/* Kumulierte P&L wie im Dashboard: Linie im Akzent, Fläche mit Verlauf .35 → .02 */
export const PnlArea: React.FC<{ values: number[]; w: number; h: number; t: number; id: string }> = ({ values, w, h, t, id }) => {
  const L = 54; const W = w - L; const s = fit([values], W, h, true); const pts = s.pts(values); const line = smooth(pts);
  const e = evolvePath(clamp01(t), line);
  return (
    <svg width={w} height={h + 24} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={A.accent} stopOpacity={0.35} /><stop offset="1" stopColor={A.accent} stopOpacity={0.02} /></linearGradient>
        <clipPath id={`${id}c`}><rect x={0} y={-10} width={W * clamp01(t)} height={h + 20} /></clipPath>
      </defs>
      {ticks(s.lo, s.hi).map((v) => <text key={v} x={L - 10} y={s.y(v) + 4} textAnchor="end" style={{ fontFamily: NUM, fontSize: 11.5, fill: A.text2 }}>{axisMoney(v)}</text>)}
      <g transform={`translate(${L}, 0)`}>
        <path d={`${line} L ${W} ${h} L 0 ${h} Z`} fill={`url(#${id})`} clipPath={`url(#${id}c)`} />
        <path d={line} fill="none" stroke={A.accent} strokeWidth={2} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />
        {t >= 1 ? <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3.5} fill={A.accent} /> : null}
        {['09/01/26', '09/15/26', '09/29/26'].map((d, i) => <text key={d} x={(i / 2) * W} y={h + 20} textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'} style={{ fontFamily: NUM, fontSize: 11.5, fill: A.text2 }}>{d}</text>)}
      </g>
    </svg>
  );
};
/* Tagesbalken grün und rot */
export const DayBars: React.FC<{ values: number[]; w: number; h: number; t: number }> = ({ values, w, h, t }) => {
  const max = Math.max(...values.map(Math.abs)); const bw = (w / values.length) * 0.42; const mid = h / 2;
  return (
    <svg width={w} height={h}>
      <line x1={0} x2={w} y1={mid} y2={mid} stroke={A.border2} />
      {values.map((v, i) => { const k = clamp01((t - (i / values.length) * 0.5) / 0.5); const bh = (Math.abs(v) / max) * (mid - 4) * k; const x = (i + 0.5) * (w / values.length) - bw / 2;
        return <rect key={i} x={x} y={v >= 0 ? mid - bh : mid} width={bw} height={bh} rx={2} fill={v >= 0 ? A.accent : A.loss} />; })}
    </svg>
  );
};
/* Shadow Self: echt (text-2) gegen Schatten-Ich (Akzent) */
export const ShadowLines: React.FC<{ a: number[]; b: number[]; w: number; h: number; t: number }> = ({ a, b, w, h, t }) => {
  const L = 62; const W = w - L; const s = fit([a, b], W, h, false); const pa = s.pts(a), pb = s.pts(b); const la = smooth(pa), lb = smooth(pb);
  const ea = evolvePath(clamp01(t), la), eb = evolvePath(clamp01(t), lb);
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      {ticks(s.lo, s.hi, 5).map((v) => <g key={v}><line x1={L} x2={w} y1={s.y(v)} y2={s.y(v)} stroke={A.border} /><text x={L - 12} y={s.y(v) + 4} textAnchor="end" style={{ fontFamily: NUM, fontSize: 11.5, fill: A.text2 }}>{axisMoney(v)}</text></g>)}
      <g transform={`translate(${L}, 0)`}>
        <path d={la} fill="none" stroke={A.text2} strokeWidth={2} strokeLinecap="round" strokeDasharray={ea.strokeDasharray} strokeDashoffset={ea.strokeDashoffset} />
        <path d={lb} fill="none" stroke={A.accent} strokeWidth={2.4} strokeLinecap="round" strokeDasharray={eb.strokeDasharray} strokeDashoffset={eb.strokeDashoffset} />
        {t >= 1 ? <><circle cx={pa[pa.length - 1][0]} cy={pa[pa.length - 1][1]} r={4} fill={A.text2} /><circle cx={pb[pb.length - 1][0]} cy={pb[pb.length - 1][1]} r={4.5} fill={A.accent} /></> : null}
      </g>
    </svg>
  );
};
export const shadowEnds = (a: number[], b: number[], w: number, h: number) => { const L = 62; const s = fit([a, b], w - L, h, false); const pa = s.pts(a), pb = s.pts(b); return { x: L + pa[pa.length - 1][0], ya: pa[pa.length - 1][1], yb: pb[pb.length - 1][1] }; };

/* Häkchen im Akzent-Kreis; vorher ein drehender Ring */
export const Check: React.FC<{ f: number; at: number; done: number; size?: number }> = ({ f, at, done, size = 44 }) => (
  <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
    {done < 0.02 ? (
      <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: `3px solid ${A.surface3}`, borderTopColor: A.accent, opacity: clamp01((f - at + 30) / 10), transform: `rotate(${f * 9}deg)` }} />
    ) : (
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: A.accent, display: 'grid', placeItems: 'center', transform: `scale(${done})`, boxShadow: `0 0 18px ${A.accentGlow}` }}>
        <Icon name="check" size={size * 0.5} color={A.ink} sw={3.2} />
      </div>
    )}
  </div>
);

/* Geld mit Tausendertrennung, Minus wie in der App (−) */
export const usd = (n: number, sign = false) => `${n < 0 ? '−' : sign ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const lerpColor = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp01(t)))).join(',')})`; };
