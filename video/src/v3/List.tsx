/* Vorlage Outbidd, 20,8–27,6 s: „All“ links, rechts laufen die Bereiche der App durch, ein grüner Balken markiert im Takt
   (schwarz) → alles fällt in die Leit-Raute zusammen, Flug hindurch → „See the patterns you miss“ baut sich um „patterns“ herum auf,
   Ringe pulsieren. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, lerp, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { useFormat } from '../format';
import { big, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { lerpColor } from '../ui/Kit';
import { useMetrics } from '../ui/Text';
import { Guide, Rings } from './Parts';

const ITEMS = ['Trades', 'Rules', 'Notebook', 'Statistics', 'Shadow Self', 'Blind Replay'];
export const LIST_DURATION = 6.8;
export const List: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, V, cx, cy } = useFormat();
  /* A: Liste */
  const S = V ? 84 : 104, row = S * 1.18;
  const steps = ITEMS.map((_, i) => 0.25 + i * 0.4);
  const pos = steps.reduce((a, at, i) => (i === 0 ? 0 : a + prog(f, sec(at), sec(0.3), SOFT)), 0); /* aktive Zeile, gleitend */
  const collapse = prog(f, sec(2.55), sec(0.22), EXPO_IN);
  const lineX = V ? cx - 250 : cx - 210, allX = lineX, itemsX = lineX + (V ? 70 : 90);
  /* B: Leit-Raute */
  const gIn = pop(f, sec(2.72), { damping: 12, stiffness: 180 }); const breath = prog(f, sec(2.9), sec(0.5), SIG);
  const thru = prog(f, sec(3.42), sec(0.3), EXPO_IN);
  const night = prog(f, sec(2.7), sec(0.3));
  /* C: See the patterns you miss */
  const SP = V ? 104 : 116;
  const m = useMetrics(`700 ${SP}px Satoshi`, `${(-0.035 * SP).toFixed(2)}px`, ['See the ', 'See the patterns', 'See the patterns you miss.']);
  const a0 = m ? m[0].w : SP * 3.6, a1 = m ? m[1].w : SP * 7.6, a2 = m ? m[2].w : SP * 12;
  const k1 = prog(f, sec(3.95), sec(0.5), SIG), k2 = prog(f, sec(5.45), sec(0.5), SIG);
  const span0 = { l: a0, r: a1 }, span1 = { l: 0, r: a1 }, span2 = { l: 0, r: a2 };
  const sl = lerp(lerp(span0.l, span1.l, k1), span2.l, k2), sr = lerp(lerp(span0.r, span1.r, k1), span2.r, k2);
  const groupLeft = cx - (sl + sr) / 2;
  const pat = prog(f, sec(3.72), sec(0.45), SOFT), see = prog(f, sec(3.95), sec(0.5), SOFT), miss = prog(f, sec(5.45), sec(0.5), SOFT);
  const push = lerp(1, 1.06, prog(f, sec(3.7), sec(3.1), (x) => x));
  const word = (k: number, dx: number): React.CSSProperties => ({ display: 'inline-block', opacity: clamp01(k * 1.6), transform: `translateX(${lerp(dx, 0, k).toFixed(1)}px)`, filter: k < 1 ? `blur(${lerp(12, 0, k).toFixed(1)}px)` : undefined });
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="black" />
      {night > 0 ? <AbsoluteFill style={{ opacity: night }}><Bg f={f} kind="night" /></AbsoluteFill> : null}

      {collapse < 1 ? (
        <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${lerp(1, 0.05, collapse)})`, opacity: 1 - collapse, filter: collapse > 0 ? `blur(${(collapse * 10).toFixed(1)}px)` : undefined }}>
          <div style={{ position: 'absolute', left: lineX - 2, top: cy - row * 2.3, width: 4, height: row * 2.3 - S * 0.55, borderRadius: 2, background: `linear-gradient(180deg, transparent, ${GREEN})`, boxShadow: '0 0 12px rgba(52,245,138,0.6)', opacity: prog(f, 0, sec(0.3)) }} />
          <div style={{ position: 'absolute', left: lineX - 2, top: cy + S * 0.55, width: 4, height: row * 2.3 - S * 0.55, borderRadius: 2, background: `linear-gradient(180deg, ${GREEN}, transparent)`, boxShadow: '0 0 12px rgba(52,245,138,0.6)', opacity: prog(f, 0, sec(0.3)) }} />
          <div style={{ position: 'absolute', left: allX, top: cy, transform: 'translate(-50%, -52%)', ...big(S, LIGHT), opacity: prog(f, 0, sec(0.25)) }}>All</div>
          {/* Markierung */}
          <div style={{ position: 'absolute', left: itemsX - 24, top: cy - row * 0.5, height: row, width: V ? 700 : 820, borderRadius: 18, background: 'linear-gradient(90deg, rgba(52,245,138,0.34), rgba(52,245,138,0.08) 60%, transparent)', boxShadow: 'inset 0 0 0 1px rgba(52,245,138,0.25)', opacity: prog(f, sec(0.15), sec(0.25)) }} />
          <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, maskImage: `linear-gradient(180deg, transparent ${V ? 30 : 10}%, black 40%, black 60%, transparent ${V ? 70 : 90}%)`, WebkitMaskImage: `linear-gradient(180deg, transparent ${V ? 30 : 10}%, black 40%, black 60%, transparent ${V ? 70 : 90}%)` }}>
            {ITEMS.map((it, i) => {
              const a = prog(f, sec(i * 0.05), sec(0.35), SOFT);
              const y = cy + (i - pos) * row + lerp(80, 0, a);
              const on = clamp01(1 - Math.abs(i - pos));
              return <div key={it} style={{ position: 'absolute', left: itemsX, top: y, transform: 'translateY(-52%)', ...big(S, lerpColor(LIGHT, GREEN, on)), opacity: clamp01(a * 1.5) }}>{it}</div>;
            })}
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= 2.7 && thru < 1 ? (
        <>
          <Guide x={cx} y={cy} size={V ? 70 : 80} scale={gIn * (1 + 0.15 * breath) * zoomLerp(1, 60, thru)} rot={90 * breath} />
          {thru > 0.5 ? <AbsoluteFill style={{ background: '#060807', opacity: clamp01((thru - 0.6) / 0.4) }} /> : null}
        </>
      ) : null}

      {t >= 3.68 ? (
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          <Rings f={f} x={V ? cx : W * 0.2} y={cy} max={V ? 900 : 1000} opacity={0.25} />
          {V ? (
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...big(SP, LIGHT), gap: 8 }}>
              <span style={word(see, -60)}>See the</span>
              <span style={{ ...word(pat, 0), transform: `scale(${lerp(0.8, 1, pat)})` }}>patterns</span>
              <span style={{ ...word(miss, 60), color: GREEN }}>you miss.</span>
            </AbsoluteFill>
          ) : (
            <div style={{ position: 'absolute', left: groupLeft, top: cy, transform: 'translateY(-52%)', ...big(SP, LIGHT) }}>
              <span style={word(see, -60)}>See the</span>{' '}
              <span style={{ ...word(pat, 0), transform: `scale(${lerp(0.8, 1, pat)})` }}>patterns</span>{' '}
              <span style={{ ...word(miss, 60), color: GREEN }}>you miss.</span>
            </div>
          )}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
