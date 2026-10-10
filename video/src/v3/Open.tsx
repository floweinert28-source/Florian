/* Vorlage Outbidd, 0–7,5 s: „What if“ zwischen wachsenden Rauten (schwarz) → Flug in die mittlere Raute, sie wird zur grünen
   Leit-Raute → „You could follow“ (Ringe im Hintergrund), Wisch nach rechts → „your trading plan“, die Raute fliegt im Bogen
   ans Satzende → „Every time?“ mit Verlauf und Leuchten (schwarz). */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, IN, lerp, pop, prog, sec, SIG, SOFT } from '../anim';
import { useFormat } from '../format';
import { big, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { BlurText, useMetrics } from '../ui/Text';
import { CornerArcs, Diamonds, Guide, Rings } from './Parts';

export const OPEN_DURATION = 7.5;
export const Open: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, V, cx, cy } = useFormat();
  const SB = V ? 150 : 170, S = V ? 92 : 116;
  const m = useMetrics(`700 ${S}px Satoshi`, `${(-0.035 * S).toFixed(2)}px`, ['You could follow', 'your trading plan']);
  const w1 = m ? m[0].w : S * 7.5, w2 = m ? m[1].w : S * 8;

  /* Hintergrund: schwarz → Raster → schwarz */
  const night = prog(f, sec(1.6), sec(0.5), SIG) * (1 - prog(f, sec(6.3), sec(0.15)));

  /* 1: What if */
  const push = lerp(1, 1.08, prog(f, 0, sec(1.5), (x) => x));
  const ifk = prog(f, sec(0.6), sec(0.35), SOFT); const outA = prog(f, sec(1.42), sec(0.16), IN);
  const dz = prog(f, sec(1.48), sec(0.32), EXPO_IN);

  /* 2: Leit-Raute und zwei Zeilen */
  const gIn = prog(f, sec(1.55), sec(0.4), SOFT);
  const drift = W * 0.03 * prog(f, sec(2.1), sec(1.5), (x) => x);
  const whip = prog(f, sec(3.55), sec(0.3), EXPO_IN);
  const l1x = cx + drift + whip * W * 0.75;
  const toLeft = prog(f, sec(2.02), sec(0.35), SIG);
  let g = { x: lerp(cx, l1x - w1 / 2 - 62, toLeft), y: cy, s: lerp(2.6, 1, gIn), r: lerp(0, 180, gIn) };
  const fly = prog(f, sec(4.0), sec(0.95), SIG);
  if (t >= 4.0) {
    const ex = cx + w2 / 2 + 62, ey = cy; const sx = cx, sy = -80;
    g = { x: lerp(sx, ex, fly) + Math.sin(fly * Math.PI) * (V ? 140 : 260), y: lerp(sy, ey, fly), s: 0.85 + 0.15 * pop(f, sec(4.85), { damping: 9, stiffness: 200 }), r: 360 * fly };
  }
  const gA = (t < 4.0 ? clamp01(gIn * 3) * (1 - whip) : clamp01(fly * 4)) * (1 - prog(f, sec(6.2), sec(0.18), IN));
  const out2 = prog(f, sec(6.2), sec(0.18), IN);

  /* 3: Every time? */
  const ev = prog(f, sec(6.42), sec(0.5), SOFT); const glow = 0.5 + 0.5 * Math.sin((t - 6.4) * 5);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="black" />
      {night > 0 ? <AbsoluteFill style={{ opacity: night }}><Bg f={f} kind="night" /></AbsoluteFill> : null}

      {t < 1.9 ? (
        <AbsoluteFill style={{ transform: `scale(${push * (1 + dz * 2.5)})`, opacity: 1 - dz }}>
          <Diamonds f={f} x={cx} y={cy} size={V ? 300 : 340} />
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - outA, filter: outA > 0 ? `blur(${(outA * 24).toFixed(2)}px)` : undefined }}>
            <div style={big(SB, LIGHT)}>
              <BlurText f={f} text="What" start={0} dur={0.5} blur={22} scaleFrom={0.9} />{' '}
              <span style={{ display: 'inline-block', opacity: clamp01(ifk * 1.5), transform: `translateX(${lerp(60, 0, ifk).toFixed(2)}px)`, filter: ifk < 1 ? `blur(${lerp(10, 0, ifk).toFixed(2)}px)` : undefined }}>if</span>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {t >= 1.9 && t < 6.45 ? <Rings f={f} x={cx} y={cy} max={V ? 900 : 1100} opacity={0.22 * night} /> : null}
      {t >= 2.1 && t < 3.9 ? (
        <div style={{ position: 'absolute', left: l1x, top: cy, transform: 'translate(-50%, -52%)', ...big(S, LIGHT), filter: whip > 0 ? `blur(${(whip * 30).toFixed(2)}px)` : undefined, opacity: 1 - whip }}>
          <BlurText f={f} text="You could follow" start={sec(2.2)} stagger={0.25} dur={0.5} blur={14} rise={20} />
        </div>
      ) : null}
      {t >= 4.05 && out2 < 1 ? (
        <div style={{ position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -52%)', ...big(S, LIGHT), opacity: 1 - out2, filter: out2 > 0 ? `blur(${(out2 * 24).toFixed(2)}px)` : undefined }}>
          <BlurText f={f} text="your trading plan" start={sec(4.1)} stagger={0.35} dur={0.5} blur={14} rise={20} color={(i) => (i === 0 ? LIGHT : GREEN)} />
        </div>
      ) : null}
      {t >= 1.55 && gA > 0 ? <Guide x={g.x} y={g.y} size={V ? 42 : 48} scale={g.s} rot={g.r} opacity={gA} /> : null}

      {t >= 6.38 ? (
        <>
          <CornerArcs a={prog(f, sec(6.4), sec(0.6))} />
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...big(V ? 150 : 180, LIGHT), backgroundImage: `linear-gradient(90deg, ${GREEN}, #b9fbd3 55%, ${LIGHT})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              opacity: clamp01(ev * 1.5), transform: `scale(${lerp(0.9, 1, ev) * lerp(1, 1.03, prog(f, sec(6.4), sec(1.1), (x) => x))})`,
              filter: `${ev < 1 ? `blur(${lerp(20, 0, ev).toFixed(2)}px) ` : ''}drop-shadow(0 0 ${(18 + 18 * glow).toFixed(1)}px rgba(52,245,138,${(0.35 + 0.2 * glow).toFixed(2)}))` }}>Every time?</div>
          </AbsoluteFill>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
