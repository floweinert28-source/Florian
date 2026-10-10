/* Vorlage LangEase, Abschnitt 1 (0–5,1 s): drei Wortpaare aus der Unschärfe („Turn trades“ → „into discipline“ → „Every trade“),
   dann springt ein Glas-Ordner auf, „Every trade“ rückt zur Seite, „instantly“ kommt dazu, die Hand klickt auf den Ordner
   und die Kamera fliegt in den Ordner hinein. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, IN, lerp, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { useFormat } from '../format';
import { DashboardPanel } from '../scenes/Product';
import { big, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Icon } from '../ui/Kit';

/* ---------- Glas-Ordner, 420 × 330 Einheiten ---------- */
export const FOLDER = { w: 420, h: 330 };
const FRONT = 'M40 96L160 96C176 96 184 104 192 114C198 122 204 126 216 126L380 126Q397 126 399 143L414 288Q416 306 398 306L22 306Q4 306 6 288L21 113Q23 96 40 96Z';
const Sheet: React.FC<{ x: number; y: number; rot: number; lift: number; kind: 'csv' | 'chart' | 'grid' }> = ({ x, y, rot, lift, kind }) => (
  <div style={{ position: 'absolute', left: x, top: y - lift, width: 250, height: 200, borderRadius: 12, background: LIGHT, boxShadow: '0 -2px 10px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.06)', transform: `rotate(${rot}deg)`, overflow: 'hidden' }}>
    {kind === 'csv' ? (
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"Onest", sans-serif', fontSize: 11, fontWeight: 700, color: '#0b6b3a' }}><div style={{ width: 12, height: 12, borderRadius: 3, background: '#0fb862' }} />trades.csv</div>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ display: 'flex', gap: 6, marginTop: 9 }}>{[44, 26, 36, 50].map((w, j) => <div key={j} style={{ width: w, height: 6, borderRadius: 3, background: j === 3 ? (i % 3 ? '#9be7bd' : '#f3a5a5') : '#d4d8d5' }} />)}</div>)}
      </div>
    ) : kind === 'chart' ? (
      <svg width={250} height={200} viewBox="0 0 250 200">
        {[[20, 60, 90, 70, 1], [45, 50, 80, 64, 1], [70, 58, 74, 48, 0], [95, 40, 66, 46, 1], [120, 30, 52, 36, 1], [145, 34, 60, 50, 0], [170, 22, 46, 28, 1], [195, 14, 36, 20, 1]].map(([x, hi, lo, o, up], i) => (
          <g key={i}><line x1={x + 6} x2={x + 6} y1={hi + 10} y2={lo + 26} stroke={up ? '#0fb862' : '#e05a5a'} strokeWidth={2} /><rect x={x} y={(up ? o : hi + 6) + 10} width={12} height={Math.abs(lo - o) + 6} rx={2} fill={up ? '#0fb862' : '#e05a5a'} /></g>
        ))}
      </svg>
    ) : (
      <div style={{ position: 'absolute', left: 92, top: 26, width: 66, height: 52, borderRadius: 8, border: '3px solid #0b8a47', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', overflow: 'hidden' }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ borderRight: i % 2 === 0 ? '3px solid #0b8a47' : undefined, borderBottom: i < 2 ? '3px solid #0b8a47' : undefined }} />)}
      </div>
    )}
  </div>
);
export const Folder: React.FC<{ lift?: number }> = ({ lift = 0 }) => (
  <div style={{ position: 'relative', width: FOLDER.w, height: FOLDER.h }}>
    {/* grüner Schein darunter */}
    <div style={{ position: 'absolute', left: 30, right: 30, top: 230, height: 160, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(52,245,138,0.42), transparent)', filter: 'blur(18px)' }} />
    {/* Rückwand */}
    <div style={{ position: 'absolute', left: 24, top: 30, width: 372, height: 230, borderRadius: 26, background: 'linear-gradient(180deg, #19c56f, #0b8a47 70%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }} />
    <Sheet x={110} y={46} rot={4} lift={lift * 0.7} kind="chart" />
    <Sheet x={62} y={52} rot={-3} lift={lift} kind="csv" />
    <Sheet x={86} y={64} rot={0} lift={lift * 1.25} kind="grid" />
    {/* Glas vorne */}
    <div style={{ position: 'absolute', inset: 0, clipPath: `path('${FRONT}')`, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      background: 'linear-gradient(180deg, rgba(140,255,190,0.34) 0%, rgba(52,245,138,0.30) 38%, rgba(15,170,92,0.62) 100%)' }} />
    <svg width={FOLDER.w} height={FOLDER.h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs><linearGradient id="fedge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.75} /><stop offset="0.5" stopColor="#fff" stopOpacity={0.18} /><stop offset="1" stopColor="#bfffd9" stopOpacity={0.5} /></linearGradient></defs>
      <path d={FRONT} fill="none" stroke="url(#fedge)" strokeWidth={1.6} />
    </svg>
    <div style={{ position: 'absolute', left: 42, top: 206, fontFamily: '"Satoshi", sans-serif', fontSize: 40, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em' }}>Trades</div>
    <div style={{ position: 'absolute', left: 44, top: 256, fontFamily: '"Satoshi", sans-serif', fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.78)' }}>Import CSV</div>
    <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 352, top: 246 }}>
      <path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" /><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </svg>
  </div>
);

/* ---------- Szene ---------- */
export const HOOK_DURATION = 5.1;
export const Hook: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  const S = V ? 104 : 116;
  const soft = (at: number, dur = 0.5) => prog(f, sec(at), sec(dur), SOFT);
  const gone = (at: number) => prog(f, sec(at), sec(0.16), IN);
  const blurOut = (k: number): React.CSSProperties => (k > 0 ? { opacity: 1 - k, filter: `blur(${(k * 30).toFixed(2)}px)` } : {});

  /* Ordner und Kamera */
  const FS = V ? 1.45 : 1.22; const fw = FOLDER.w * FS, fh = FOLDER.h * FS;
  const fx = cx - fw / 2, fy = cy - fh / 2 + (V ? 10 : 20);
  const fp = pop(f, sec(3.32), { damping: 11, stiffness: 150 });
  const CLICK = 4.1; const age = (f - sec(CLICK)) / FPS;
  const wig = age > 0 ? Math.exp(-age * 7) : 0;
  const fRot = age > 0 ? 4 * Math.sin(age * 2 * Math.PI * 4.5) * wig : 0; const fSc = age > 0 ? 1 - 0.05 * Math.sin(Math.min(1, age / 0.18) * Math.PI) : 1;
  const lift = age > 0 ? 18 * Math.sin(Math.min(1, age / 0.35) * Math.PI / 2) : 0;
  const zk = prog(f, sec(4.4), sec(0.72), EXPO_IN); const Z = zoomLerp(1, 20, zk);
  const focus = { x: cx, y: fy + 215 * FS };

  /* „Every trade“ rückt zur Seite (quer) oder nach oben (hochkant) */
  const mv = prog(f, sec(2.95), sec(0.55), SIG);
  const sideGap = V ? 70 : 60;
  const third = V
    ? { left: cx, top: lerp(cy, fy - 40, mv), tx: -50, ty: lerp(-50, -100, mv) }
    : { left: lerp(cx, fx - sideGap, mv), top: cy, tx: lerp(-50, -100, mv), ty: -50 };
  const inst = soft(3.45, 0.55);
  const fadeAll = prog(f, sec(4.3), sec(0.2), IN);

  /* Hand */
  const from = V ? { x: W * 0.92, y: H * 1.04 } : { x: W * 0.83, y: H * 1.1 };
  const to = { x: fx + fw * 0.8, y: fy + fh * 0.62 };
  const hk = prog(f, sec(3.58), sec(0.48), SIG);
  const bulge = Math.sin(hk * Math.PI) * 40;
  const hand = { x: lerp(from.x, to.x, hk) + bulge, y: lerp(from.y, to.y, hk) };
  const handA = prog(f, sec(3.55), sec(0.15)) * (1 - fadeAll);

  /* Unscharfe App im Hintergrund wie im Vorbild */
  const bgA = prog(f, sec(3.2), sec(0.6), SIG) * 0.42;
  const PS = V ? 0.68 : 1.0;

  const line1 = soft(0.05), tr = soft(0.32, 0.45), out1 = gone(1.12);
  const line2 = soft(1.22, 0.55), out2 = gone(2.2);
  const line3 = soft(2.3, 0.55);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      <AbsoluteFill style={{ transformOrigin: `${focus.x}px ${focus.y}px`, transform: `scale(${Z})` }}>
        {bgA > 0 ? (
          <AbsoluteFill style={{ perspective: 2400, opacity: bgA * (1 - fadeAll * 0.6) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, transformOrigin: '0 0', filter: 'blur(10px)',
              transform: `translate(${cx}px, ${cy + (V ? 40 : 60)}px) rotateX(24deg) scale(${PS * lerp(0.92, 1, bgA / 0.42)}) translate(-720px, -450px)` }}>
              <DashboardPanel f={0} still />
            </div>
          </AbsoluteFill>
        ) : null}

        {/* 1: Turn trades */}
        {out1 < 1 ? (
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...blurOut(out1) }}>
            <div style={big(S, LIGHT)}>
              <span style={{ display: 'inline-block', color: GREEN, opacity: clamp01(line1 * 1.5), filter: line1 < 1 ? `blur(${lerp(24, 0, line1).toFixed(2)}px)` : undefined, transform: `scale(${lerp(0.9, 1, line1)})` }}>Turn</span>{' '}
              <span style={{ display: 'inline-block', opacity: clamp01(tr * 1.5), filter: tr < 1 ? `blur(${lerp(14, 0, tr).toFixed(2)}px)` : undefined, transform: `translateX(${lerp(80, 0, tr).toFixed(2)}px)` }}>trades</span>
            </div>
          </AbsoluteFill>
        ) : null}
        {/* 2: into discipline */}
        {t >= 1.2 && out2 < 1 ? (
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...blurOut(out2) }}>
            <div style={{ ...big(S, LIGHT), opacity: clamp01(line2 * 1.5), filter: line2 < 1 ? `blur(${lerp(30, 0, line2).toFixed(2)}px)` : undefined, transform: `scale(${lerp(0.88, 1, line2)})` }}>
              into <span style={{ color: GREEN }}>discipline</span>
            </div>
          </AbsoluteFill>
        ) : null}
        {/* 3: Every trade, dann rechts „instantly“ */}
        {t >= 2.28 ? (
          <div style={{ position: 'absolute', left: third.left, top: third.top, transform: `translate(${third.tx}%, ${third.ty}%) scale(${lerp(0.9, 1, line3)})`, ...big(S, LIGHT),
            opacity: clamp01(line3 * 1.5) * (1 - fadeAll), filter: line3 < 1 ? `blur(${lerp(26, 0, line3).toFixed(2)}px)` : undefined }}>
            <span style={{ color: GREEN }}>Every</span> trade
          </div>
        ) : null}
        {inst > 0 ? (
          <div style={{ position: 'absolute', ...(V ? { left: cx, top: fy + fh + 40, transform: `translate(-50%, ${lerp(30, 0, inst)}px)` } : { left: fx + fw + sideGap, top: cy, transform: `translate(${lerp(50, 0, inst)}px, -50%)` }),
            ...big(S, GREEN), opacity: clamp01(inst * 1.5) * (1 - fadeAll), filter: inst < 1 ? `blur(${lerp(20, 0, inst).toFixed(2)}px)` : undefined }}>instantly</div>
        ) : null}

        {fp > 0.001 ? (
          <div style={{ position: 'absolute', left: fx, top: fy, width: FOLDER.w, height: FOLDER.h, transformOrigin: '0 0', transform: `scale(${FS})` }}>
            <div style={{ transformOrigin: '50% 70%', transform: `scale(${(fp * fSc).toFixed(4)}) rotate(${fRot.toFixed(2)}deg)`, opacity: clamp01(fp * 3) }}><Folder lift={lift} /></div>
          </div>
        ) : null}
      </AbsoluteFill>
      {handA > 0 ? <Hand x={hand.x} y={hand.y} clickAge={f - sec(CLICK)} size={V ? 112 : 100} opacity={handA} /> : null}
      {/* am Ende füllt das grüne Glas das Bild */}
      {zk > 0.6 ? <AbsoluteFill style={{ background: '#060807', opacity: clamp01((zk - 0.85) / 0.15) }} /> : null}
    </AbsoluteFill>
  );
};
