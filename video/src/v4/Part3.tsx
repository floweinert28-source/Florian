/* Vorlage iBanPay, 19,8–26,9 s: „And seconds later“ → Fenster „Your trades are in.“ (leicht schräg), die Hand klickt
   „Review trades“, Flug in den Knopf, Lichtblitz, heller grüner Hintergrund. Die Leit-Raute fliegt im Bogen, tupft auf „Time“
   und landet zwischen „quick“ und „review.“: „Time for a quick ◆ review.“ */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, IN, lerp, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { dash } from '../app';
import { useFormat } from '../format';
import { big, DISPLAY, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Icon, lerpColor, Val } from '../ui/Kit';
import { BlurText, useMetrics } from '../ui/Text';
import { Guide } from '../v3/Parts';

const CW = 960, CH = 600; const BTN = { x: CW / 2 - 120, y: 486, w: 240, h: 56 };
const Ready: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <div style={{ position: 'relative', width: CW, height: CH, borderRadius: 22, background: A.bg, border: `1px solid ${A.border2}`, overflow: 'hidden', fontFamily: DISPLAY, color: A.text }}>
    <div style={{ height: 44, borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, background: A.bg2 }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85 }} />)}
      <span style={{ marginLeft: 20, fontSize: 13, color: A.muted, fontWeight: 600 }}>Journalyst · Import</span>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 84, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: A.accent, display: 'grid', placeItems: 'center', boxShadow: `0 0 30px ${A.accentGlow}` }}><Icon name="check" size={32} color={A.ink} sw={3} /></div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 22 }}>Your trades are in.</div>
      <div style={{ fontSize: 16, color: A.text2, marginTop: 10 }}>42 trades from broker-export-sep.csv were added to your TradeLog.</div>
      <div style={{ display: 'flex', marginTop: 30, borderRadius: 16, border: `1px solid ${A.border2}`, background: A.surface, overflow: 'hidden' }}>
        {[['Trades', '42', A.text], ['Wins', String(dash.wins), A.accent], ['Losses', String(dash.losses), A.loss], ['Net P&L', `+${dash.net}`, A.accent]].map(([l, v, c], i) => (
          <div key={l} style={{ padding: '14px 26px', borderLeft: i ? `1px solid ${A.border}` : undefined }}><div style={{ fontSize: 12.5, fontWeight: 600, color: A.text2 }}>{l}</div><Val size={22} color={c} style={{ marginTop: 4 }}>{v}</Val></div>
        ))}
      </div>
    </div>
    <div style={{ position: 'absolute', left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 14, background: A.accent, color: A.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontSize: 17, fontWeight: 700, transform: `scale(${pressed ? 0.95 : 1})`, boxShadow: `0 12px 30px -10px ${A.accentGlow}` }}>Review trades<Icon name="chev" size={17} color={A.ink} style={{ transform: 'rotate(-90deg)' }} /></div>
  </div>
);

/* Bezierkurve für den Flug der Raute */
const bez = (p: number[][], t: number) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };

export const P3_DURATION = 7.1;
export const Part3: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  /* 1 */
  const a1 = t < 1.2;
  /* 2: Fenster */
  const win = pop(f, sec(1.2), { damping: 14, stiffness: 150 }); const cs = V ? 1.0 : 1.3;
  const zoomB = prog(f, sec(2.2), sec(1.1), SIG); const dive = prog(f, sec(3.35), sec(0.35), EXPO_IN);
  const bc = { x: cx + (BTN.x + BTN.w / 2 - CW / 2) * cs, y: cy + (BTN.y + BTN.h / 2 - CH / 2) * cs };
  const z = zoomLerp(1, 1.15, zoomB) * zoomLerp(1, 9, dive);
  const hk = prog(f, sec(2.2), sec(0.55), SIG); const from = V ? { x: W * 0.7, y: H * 1.04 } : { x: W * 0.62, y: H * 1.08 };
  const hand = { x: lerp(from.x, bc.x + 30, hk), y: lerp(from.y, bc.y + 16, hk) };
  const CLICK = 2.8;
  const flash = prog(f, sec(3.5), sec(0.35));
  const aurora = prog(f, sec(3.6), sec(0.2));
  /* 3: Zeile mit Raute */
  const S = V ? 84 : 112, gap = S * 0.85;
  const m = useMetrics(`700 ${S}px Satoshi`, `${(-0.035 * S).toFixed(2)}px`, ['Time for a quick ', 'review.', 'Time']);
  const wA = m ? m[0].w : S * 7.2, wB = m ? m[1].w : S * 3.2, wT = m ? m[2].w : S * 2.1;
  const full = wA + gap + wB; const shift = lerp(W * 0.12, 0, prog(f, sec(4.8), sec(1.5), SIG));
  const left = cx - full / 2 + shift; const baseY = cy;
  const words = [['Time', 4.8], ['for', 5.1], ['a', 5.25], ['quick', 5.45]] as const;
  const timeX = left + wT / 2, spotX = left + wA + gap / 2;
  const P0 = [cx, cy], P1 = [cx + W * 0.3, cy + H * 0.28], P2 = [cx + W * 0.06, cy - H * 0.38], P3 = [timeX, baseY - S * 0.95];
  const k1 = prog(f, sec(4.0), sec(0.75), SIG); const dip = Math.sin(Math.PI * prog(f, sec(4.75), sec(0.3), SIG)); const k3 = prog(f, sec(5.05), sec(0.6), SIG);
  let gx: number, gy: number;
  if (t < 4.75) [gx, gy] = bez([P0, P1, P2, P3], k1); else { gx = lerp(timeX, spotX, k3); gy = lerp(P3[1] + dip * S * 0.4, baseY - S * 0.08, k3) - Math.sin(k3 * Math.PI) * S * 0.6; }
  const gScale = t < 4.0 ? lerp(1.6, 0.9, prog(f, sec(3.7), sec(0.3), SIG)) : 0.9 + 0.12 * Math.sin(Math.PI * prog(f, sec(5.62), sec(0.3)));
  const out3 = prog(f, sec(6.85), sec(0.25), IN);
  const trail = [0.05, 0.1, 0.15, 0.2, 0.25].map((d) => { const tt = t - d; if (tt < 4.0 || tt > 4.75) return null; const [x, y] = bez([P0, P1, P2, P3], prog(tt * FPS, sec(4.0), sec(0.75), SIG)); return { x, y, a: 0.35 * (1 - d / 0.3) }; });
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {aurora > 0 ? <AbsoluteFill style={{ opacity: aurora }}><Bg f={f} kind="aurora" /></AbsoluteFill> : null}

      {a1 ? (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={big(V ? 92 : 112, LIGHT)}><BlurText f={f} text="And seconds later" start={0} stagger={0.15} dur={0.45} blur={15} color={(i) => (i === 1 ? GREEN : LIGHT)} /></div>
        </AbsoluteFill>
      ) : null}

      {t >= 1.2 && t < 3.75 ? (
        <AbsoluteFill style={{ perspective: 1800 }}>
          <div style={{ position: 'absolute', left: cx - CW / 2, top: cy - CH / 2, width: CW, height: CH,
            transform: `scale(${(cs * lerp(0.85, 1, win)).toFixed(4)}) rotateX(${(5 * (1 - zoomB)).toFixed(2)}deg) rotateY(${(-3 * (1 - zoomB)).toFixed(2)}deg)`, opacity: clamp01(win * 3) * (1 - dive * 0.3) }}>
            <div style={{ position: 'absolute', inset: 0, transformOrigin: `${BTN.x + BTN.w / 2}px ${BTN.y + BTN.h / 2}px`, transform: `scale(${z.toFixed(4)})` }}>
              <div style={{ position: 'absolute', inset: -2, borderRadius: 24, boxShadow: '0 -10px 80px -10px rgba(52,245,138,0.35), 0 60px 140px -40px rgba(0,0,0,0.8)' }} />
              <Ready pressed={t >= CLICK && t < CLICK + 0.14} />
            </div>
          </div>
          {t < 3.3 ? <Hand x={hand.x} y={hand.y} clickAge={f - sec(CLICK)} size={V ? 100 : 92} opacity={prog(f, sec(2.2), sec(0.15)) * (1 - prog(f, sec(3.15), sec(0.15)))} /> : null}
        </AbsoluteFill>
      ) : null}
      {flash > 0 && flash < 1 ? <AbsoluteFill style={{ background: '#d9ffe9', opacity: Math.sin(Math.PI * flash) * 0.85 }} /> : null}

      {t >= 3.7 && out3 < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - out3, transform: `translateX(${(-out3 * W * 0.3).toFixed(1)}px)`, filter: out3 > 0 ? `blur(${(out3 * 16).toFixed(1)}px)` : undefined }}>
          {trail.map((p, i) => (p ? <Guide key={i} x={p.x} y={p.y} size={V ? 40 : 46} scale={0.8} opacity={p.a} /> : null))}
          <Guide x={gx} y={gy} size={V ? 40 : 46} scale={gScale} rot={t < 4.2 ? lerp(180, 0, prog(f, sec(3.7), sec(0.5), SIG)) : 0} />
          <div style={{ position: 'absolute', left, top: baseY, transform: 'translateY(-52%)', ...big(S, LIGHT), display: 'flex' }}>
            <span>{words.map(([w, at], i) => { const q = prog(f, sec(at), sec(0.35), SOFT); const tint = i === 3 ? lerpColor(GREEN, LIGHT, prog(f, sec(5.8), sec(0.4))) : LIGHT;
              return <React.Fragment key={w}>{i ? ' ' : ''}<span style={{ display: 'inline-block', color: tint, opacity: clamp01(q * 1.6), transform: `scale(${lerp(0.8, 1, q)})`, filter: q < 1 ? `blur(${lerp(10, 0, q).toFixed(1)}px)` : undefined }}>{w}</span></React.Fragment>; })} </span>
            <span style={{ display: 'inline-block', width: gap }} />
            {(() => { const q = prog(f, sec(6.0), sec(0.4), SOFT); return <span style={{ display: 'inline-block', color: GREEN, opacity: clamp01(q * 1.6), transform: `translateX(${lerp(40, 0, q)}px)`, filter: q < 1 ? `blur(${lerp(12, 0, q).toFixed(1)}px)` : undefined }}>review.</span>; })()}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
