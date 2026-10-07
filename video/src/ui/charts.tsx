import React from 'react';
import { evolvePath, getLength, getPointAtLength } from '@remotion/paths';
import { ENTER, MOVE, clamp01, lerp, ms, prog } from '../motion';
import { FONT_NUM, T } from '../theme';

export type Pt = { x: number; y: number };
/* Catmull-Rom → kubische Bézier, leicht gedämpft, damit die Kurve nicht unter das Minimum schwingt */
export const smoothPath = (pts: Pt[], k = 0.8) => {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * k, c1y = p1.y + ((p2.y - p0.y) / 6) * k;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * k, c2y = p2.y - ((p3.y - p1.y) / 6) * k;
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
};
export const niceTicks = (min: number, max: number, n = 4) => {
  const span = max - min || 1; const raw = span / n; const mag = 10 ** Math.floor(Math.log10(raw)); const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step; const out: number[] = [];
  for (let v = lo; v <= hi + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
};

type Series = { values: number[]; color: string; width?: number; area?: boolean; glow?: boolean };
/* Linien zeichnen sich von links nach rechts; der Kopfpunkt leuchtet, die Fläche folgt. */
export const LineChart: React.FC<{ w: number; h: number; series: Series[]; progress: number; yFmt?: (v: number) => string; xLabels?: string[]; padL?: number; padR?: number; padT?: number; padB?: number; zeroLine?: boolean; min?: number; max?: number; ticks?: number }> =
  ({ w, h, series, progress, yFmt = (v) => String(v), xLabels = [], padL = 64, padR = 16, padT = 12, padB = 28, zeroLine = true, min, max, ticks = 4 }) => {
    const all = series.flatMap((s) => s.values);
    const lo = min ?? Math.min(0, ...all), hi = max ?? Math.max(...all);
    const tk = niceTicks(lo, hi, ticks); const y0 = tk[0], y1 = tk[tk.length - 1];
    const iw = w - padL - padR, ih = h - padT - padB;
    const X = (i: number, n: number) => padL + (i / Math.max(1, n - 1)) * iw;
    const Y = (v: number) => padT + (1 - (v - y0) / (y1 - y0 || 1)) * ih;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`area${i}-${s.color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={s.color} stopOpacity="0.28" /><stop offset="1" stopColor={s.color} stopOpacity="0.02" /></linearGradient>
          ))}
        </defs>
        {tk.map((v) => (
          <g key={v}>
            <line x1={padL} x2={w - padR} y1={Y(v)} y2={Y(v)} stroke={v === 0 && zeroLine ? T.border2 : T.border} strokeDasharray={v === 0 ? undefined : '2 4'} />
            <text x={padL - 10} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={T.muted} fontFamily={FONT_NUM}>{yFmt(v)}</text>
          </g>
        ))}
        {xLabels.map((l, i) => <text key={i} x={X(i, xLabels.length)} y={h - 8} textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'} fontSize="11" fill={T.muted} fontFamily={FONT_NUM}>{l}</text>)}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => ({ x: X(i, s.values.length), y: Y(v) }));
          const d = smoothPath(pts); if (!d) return null;
          const len = getLength(d); const p = clamp01(progress); const ev = evolvePath(p, d);
          const head = getPointAtLength(d, len * p) ?? pts[pts.length - 1];
          const areaD = `${d} L${pts[pts.length - 1].x} ${Y(Math.max(y0, 0))} L${pts[0].x} ${Y(Math.max(y0, 0))} Z`;
          const clipW = padL + iw * p;
          return (
            <g key={si}>
              {s.area ? <g style={{ clipPath: `inset(0 ${Math.max(0, w - clipW)}px 0 0)` }}><path d={areaD} fill={`url(#area${si}-${s.color.replace('#', '')})`} /></g> : null}
              <path d={d} fill="none" stroke={s.color} strokeWidth={s.width ?? 2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
              {s.glow !== false && p > 0.01 && p < 0.999 ? <><circle cx={head.x} cy={head.y} r="9" fill={s.color} opacity="0.25" /><circle cx={head.x} cy={head.y} r="4" fill={s.color} /></> : null}
              {p >= 0.999 ? <circle cx={head.x} cy={head.y} r="4" fill={s.color} /> : null}
            </g>
          );
        })}
      </svg>
    );
  };

/* Säulen wachsen aus der Nulllinie, gestaffelt von links */
export const Bars: React.FC<{ w: number; h: number; values: number[]; frame: number; start: number; stagger?: number; dur?: number; yFmt?: (v: number) => string; xLabels?: string[]; padL?: number; padB?: number; padT?: number }> =
  ({ w, h, values, frame, start, stagger = 1, dur = ms(600), yFmt = (v) => String(v), xLabels = [], padL = 64, padB = 26, padT = 10 }) => {
    const tk = niceTicks(Math.min(0, ...values), Math.max(0, ...values), 4); const y0 = tk[0], y1 = tk[tk.length - 1];
    const iw = w - padL - 10, ih = h - padT - padB; const n = values.length; const slot = iw / n; const bw = Math.min(22, slot * 0.46);
    const Y = (v: number) => padT + (1 - (v - y0) / (y1 - y0 || 1)) * ih;
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        {tk.map((v) => <g key={v}><line x1={padL} x2={w - 10} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? T.border2 : T.border} strokeDasharray={v === 0 ? undefined : '2 4'} /><text x={padL - 10} y={Y(v) + 4} textAnchor="end" fontSize="11" fill={T.muted} fontFamily={FONT_NUM}>{yFmt(v)}</text></g>)}
        {values.map((v, i) => {
          const p = prog(frame, start + i * stagger, dur, ENTER); const x = padL + i * slot + slot / 2 - bw / 2; const top = Math.min(Y(v), Y(0)); const hh = Math.abs(Y(v) - Y(0));
          return <rect key={i} x={x} y={top} width={bw} height={Math.max(0.5, hh)} rx={3} fill={v >= 0 ? T.profit : T.loss} style={{ transformOrigin: `${x + bw / 2}px ${Y(0)}px`, scale: `1 ${p.toFixed(3)}` }} />;
        })}
        {xLabels.map((l, i) => <text key={i} x={padL + (i / Math.max(1, xLabels.length - 1)) * iw} y={h - 6} textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'} fontSize="11" fill={T.muted} fontFamily={FONT_NUM}>{l}</text>)}
      </svg>
    );
  };

/* Balken nach rechts, gestaffelt von oben */
export const HBars: React.FC<{ rows: { label: string; value: number; sub?: string }[]; frame: number; start: number; stagger?: number; dur?: number; color?: string; fmt: (v: number) => string; max?: number; rowH?: number; labelW?: number }> =
  ({ rows, frame, start, stagger = 2, dur = ms(700), color, fmt, max, rowH = 44, labelW = 170 }) => {
    const m = max ?? Math.max(...rows.map((r) => Math.abs(r.value)));
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r, i) => {
          const p = prog(frame, start + i * stagger, dur, ENTER); const frac = Math.abs(r.value) / (m || 1);
          return (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', height: rowH, gap: 14, opacity: prog(frame, start + i * stagger, ms(200)) }}>
              <div style={{ width: labelW, fontSize: 13.5, color: T.text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</div>
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: T.surface3, overflow: 'hidden' }}><div style={{ width: `${(frac * 100).toFixed(1)}%`, height: '100%', borderRadius: 5, background: color ?? (r.value < 0 ? T.loss : T.profit), transformOrigin: 'left center', scale: `${p.toFixed(3)} 1` }} /></div>
              <div style={{ width: 110, textAlign: 'right', fontFamily: FONT_NUM, fontWeight: 600, fontSize: 14, color: r.value < 0 ? T.loss : T.profit, fontVariantNumeric: 'tabular-nums' }}>{fmt(r.value * p)}</div>
              {r.sub ? <div style={{ width: 70, fontSize: 12, color: T.muted, textAlign: 'right' }}>{r.sub}</div> : null}
            </div>
          );
        })}
      </div>
    );
  };

/* Radar: Netz steht, die Fläche wächst aus der Mitte */
export const Radar: React.FC<{ size: number; axes: { label: string; score: number }[]; progress: number }> = ({ size, axes, progress }) => {
  const c = size / 2, R = size / 2 - 44; const n = axes.length;
  const pt = (i: number, r: number) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return { x: c + Math.cos(a) * r, y: c + Math.sin(a) * r }; };
  const ring = (f: number) => axes.map((_, i) => pt(i, R * f)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const data = axes.map((a, i) => pt(i, R * Math.max(0.04, a.score) * progress)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', overflow: 'visible' }}>
      {[0.33, 0.66, 1].map((f) => <polygon key={f} points={ring(f)} fill="none" stroke={T.border2} strokeWidth="1" />)}
      {axes.map((_, i) => { const p = pt(i, R); return <line key={i} x1={c} y1={c} x2={p.x} y2={p.y} stroke={T.border} />; })}
      <polygon points={data} fill="rgba(52,245,138,0.22)" stroke={T.accent} strokeWidth="2" strokeLinejoin="round" />
      {axes.map((a, i) => { const p = pt(i, R + 22); const anchor = Math.abs(p.x - c) < 8 ? 'middle' : p.x > c ? 'start' : 'end'; return <text key={a.label} x={p.x} y={p.y + 4} textAnchor={anchor} fontSize="11.5" fontWeight="600" fill={T.text2}>{a.label}</text>; })}
    </svg>
  );
};

/* Ring, der sich füllt */
export const Ring: React.FC<{ size: number; value: number; stroke?: number; color?: string; track?: string; children?: React.ReactNode }> = ({ size, value, stroke = 10, color = T.accent, track = T.surface3, children }) => {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ rotate: '-90deg' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${C} ${C}`} strokeDashoffset={C * (1 - clamp01(value))} style={{ filter: `drop-shadow(0 0 6px ${T.accentGlow})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{children}</div>
    </div>
  );
};

/* Halbbogen Gewinn/Verlust mit Zählern darunter */
export const HalfGauge: React.FC<{ wins: number; be: number; losses: number; progress: number; w?: number }> = ({ wins, be, losses, progress, w = 96 }) => {
  const r = w / 2 - 6, cx = w / 2, cy = w / 2; const total = wins + be + losses || 1; const C = Math.PI * r;
  const segs = [[wins, T.profit], [be, T.be], [losses, T.loss]] as const; let acc = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={w} height={w / 2 + 6} viewBox={`0 0 ${w} ${w / 2 + 6}`}>
        <path d={`M6 ${cy} A${r} ${r} 0 0 1 ${w - 6} ${cy}`} fill="none" stroke={T.surface3} strokeWidth="8" strokeLinecap="round" />
        {segs.map(([v, col], i) => { const len = (v / total) * C * progress; const off = acc; acc += (v / total) * C; return <path key={i} d={`M6 ${cy} A${r} ${r} 0 0 1 ${w - 6} ${cy}`} fill="none" stroke={col} strokeWidth="8" strokeLinecap="butt" strokeDasharray={`${len} ${C * 2}`} strokeDashoffset={-off * progress} />; })}
      </svg>
      <div style={{ display: 'flex', gap: 6, marginTop: -14 }}>
        {segs.map(([v, col], i) => <span key={i} style={{ minWidth: 22, height: 20, padding: '0 6px', borderRadius: 10, background: col + '33', color: col, fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', fontFamily: FONT_NUM }}>{Math.round(v * progress)}</span>)}
      </div>
    </div>
  );
};

/* Teilbalken Gewinn/Verlust */
export const SplitBar: React.FC<{ win: number; loss: number; progress: number; w?: number; fmt: (v: number) => string }> = ({ win, loss, progress, w = 220, fmt }) => {
  const f = win / (win + Math.abs(loss) || 1);
  return (
    <div style={{ width: w }}>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: T.surface3 }}>
        <div style={{ width: `${f * 100}%`, background: T.profit, transformOrigin: 'left', scale: `${progress.toFixed(3)} 1` }} />
        <div style={{ flex: 1, background: T.loss, transformOrigin: 'right', scale: `${progress.toFixed(3)} 1` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: FONT_NUM, fontSize: 12, fontWeight: 600 }}><span style={{ color: T.profit }}>{fmt(win * progress)}</span><span style={{ color: T.loss }}>{fmt(loss * progress)}</span></div>
    </div>
  );
};

/* Monatskalender wie im Dashboard: Zahl oben rechts, P&L unten links, Kacheln poppen in Lesereihenfolge */
export const CalendarMonth: React.FC<{ year: number; month: number; days: Map<string, { pnl: number; n: number }>; frame: number; start: number; w: number; cellH?: number; fmt: (v: number) => string; today?: string }> = ({ year, month, days, frame, start, w, cellH = 56, fmt, today }) => {
  const first = new Date(Date.UTC(year, month, 1)); const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate(); const lead = (first.getUTCDay() + 6) % 7;
  const gap = 8; const cw = (w - gap * 6) / 7; const wd = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]; while (cells.length % 7) cells.push(null);
  return (
    <div style={{ width: w }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${cw}px)`, gap, marginBottom: gap }}>
        {wd.map((d) => <div key={d} style={{ height: 34, borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface2, display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 600, color: T.text2, opacity: prog(frame, start, ms(300)) }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${cw}px)`, gap }}>
        {cells.map((d, i) => {
          const key = d ? `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : ''; const info = d ? days.get(key) : undefined; const p = prog(frame, start + 2 + i * 0.5, ms(320), ENTER);
          const isToday = key === today; const tone = info ? (info.pnl > 0 ? T.profit : T.loss) : null;
          return (
            <div key={i} style={{ height: cellH, borderRadius: 10, border: `1px solid ${tone ? tone + '55' : T.border}`, background: tone ? tone + (info!.pnl > 0 ? '1c' : '22') : d ? T.surface2 : 'transparent', position: 'relative', padding: 8, opacity: d ? p : 0, scale: String(lerp(0.92, 1, p)) }}>
              {d ? <span style={{ position: 'absolute', top: 6, right: 6, minWidth: 20, height: 20, borderRadius: 10, background: isToday ? T.accent : T.surface3, color: isToday ? T.accentInk : T.text2, fontSize: 11, fontWeight: 600, display: 'grid', placeItems: 'center', fontFamily: FONT_NUM, padding: '0 5px' }}>{d}</span> : null}
              {info ? <div style={{ position: 'absolute', left: 8, bottom: 6 }}><div style={{ fontFamily: FONT_NUM, fontWeight: 600, fontSize: 12.5, color: tone!, fontVariantNumeric: 'tabular-nums' }}>{fmt(info.pnl)}</div><div style={{ fontSize: 10.5, color: T.muted }}>{info.n} {info.n === 1 ? 'Trade' : 'Trades'}</div></div> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* Aktivitäts-Heatmap (Wochen × Wochentage), füllt sich als Welle von links */
export const Heatmap: React.FC<{ days: Map<string, number>; from: string; to: string; frame: number; start: number; cell?: number; gap?: number; dur?: number }> = ({ days, from, to, frame, start, cell = 22, gap = 5, dur = ms(1100) }) => {
  const d0 = new Date(from + 'T12:00:00Z'); d0.setUTCDate(d0.getUTCDate() - ((d0.getUTCDay() + 6) % 7)); const d1 = new Date(to + 'T12:00:00Z');
  const weeks: { key: string; v: number }[][] = []; const months: { label: string; col: number }[] = []; const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  for (let w = 0; ; w++) { const col: { key: string; v: number }[] = []; for (let i = 0; i < 7; i++) { const dt = new Date(d0); dt.setUTCDate(d0.getUTCDate() + w * 7 + i); const key = dt.toISOString().slice(0, 10); col.push({ key, v: dt > d1 ? -1 : days.get(key) ?? 0 }); if (i === 0 && dt.getUTCDate() <= 7) months.push({ label: MON[dt.getUTCMonth()], col: w }); } weeks.push(col); const last = new Date(d0); last.setUTCDate(d0.getUTCDate() + w * 7 + 6); if (last >= d1) break; }
  const max = Math.max(1, ...[...days.values()]); const W = weeks.length;
  const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap, paddingTop: 20 }}>{WD.map((d) => <div key={d} style={{ height: cell, fontSize: 11.5, color: T.muted, lineHeight: `${cell}px`, width: 26 }}>{d}</div>)}</div>
      <div>
        <div style={{ position: 'relative', height: 16, marginBottom: 4 }}>{months.map((m) => <span key={m.label + m.col} style={{ position: 'absolute', left: m.col * (cell + gap), fontSize: 11.5, color: T.muted }}>{m.label}</span>)}</div>
        <div style={{ display: 'flex', gap }}>
          {weeks.map((col, w) => (
            <div key={w} style={{ display: 'flex', flexDirection: 'column', gap }}>
              {col.map((c) => { const p = prog(frame, start + (w / W) * (dur * 0.75), dur * 0.25, ENTER); const f = c.v <= 0 ? 0 : 0.35 + 0.65 * Math.min(1, c.v / max); return <div key={c.key} style={{ width: cell, height: cell, borderRadius: 5, background: c.v < 0 ? 'transparent' : c.v === 0 ? T.surface2 : T.accent, opacity: c.v > 0 ? f * p : c.v === 0 ? 0.9 : 0, border: c.v === 0 ? `1px solid ${T.border}` : 'none', boxSizing: 'border-box', scale: c.v > 0 ? String(lerp(0.6, 1, p)) : '1' }} />; })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Fortschrittsbalken (Prop-Regeln) */
export const ProgressBar: React.FC<{ frac: number; progress: number; color?: string; h?: number }> = ({ frac, progress, color = T.accent, h = 6 }) => (
  <div style={{ height: h, borderRadius: h / 2, background: T.surface3, overflow: 'hidden' }}><div style={{ width: `${(clamp01(frac) * 100).toFixed(1)}%`, height: '100%', background: color, borderRadius: h / 2, transformOrigin: 'left', scale: `${progress.toFixed(3)} 1` }} /></div>
);
export const Donut: React.FC<{ size: number; frac: number; progress: number; stroke?: number }> = ({ size, frac, progress, stroke = 9 }) => {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ rotate: '-90deg' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.loss} strokeWidth={stroke} strokeDasharray={`${C * progress} ${C}`} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.profit} strokeWidth={stroke} strokeDasharray={`${C * frac * progress} ${C}`} strokeLinecap="butt" />
    </svg>
  );
};
export const MOVE_ = MOVE;
