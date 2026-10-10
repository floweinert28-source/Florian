/* 8–16 s: Wendepunkt, Marke und Claim */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { lerp, prog, sec, SIG, zoomLerp } from '../anim';
import { DashboardPanel } from './Product';
import { big, GREEN, GREEN_D, INK } from '../theme';
import { Bg } from '../ui/Bg';
import { useFormat } from '../format';
import { BlurText, ramp, useBox } from '../ui/Text';

/* Weißer Grund mit feinen grünen Linien, die sich selbst zeichnen */
const CURVES = [
  { d: 'M -120 830 C 380 640, 720 1050, 1160 860 S 1720 590, 2060 700', c: GREEN_D, w: 2.6, at: 0 },
  { d: 'M -120 900 C 360 720, 760 1110, 1190 935 S 1730 690, 2060 800', c: GREEN, w: 2, at: 0.12 },
  { d: 'M 1180 -80 C 1420 140, 1660 170, 2060 110', c: GREEN_D, w: 2, at: 0.24 },
  { d: 'M 1320 -80 C 1520 90, 1720 110, 2060 40', c: GREEN, w: 1.6, at: 0.34 },
];
const CURVES_V = [
  { d: 'M -100 1470 C 200 1350, 420 1700, 700 1560 S 1000 1380, 1180 1450', c: GREEN_D, w: 2.6, at: 0 },
  { d: 'M -100 1545 C 220 1435, 450 1775, 720 1635 S 1010 1465, 1180 1535', c: GREEN, w: 2, at: 0.12 },
  { d: 'M 600 -80 C 750 130, 900 170, 1180 120', c: GREEN_D, w: 2, at: 0.24 },
  { d: 'M 730 -80 C 860 90, 990 110, 1180 45', c: GREEN, w: 1.6, at: 0.34 },
];
export const Stop: React.FC = () => {
  const f = useCurrentFrame(); const { W, H, V } = useFormat();
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <svg width={W} height={H} style={{ position: 'absolute', transform: `translateX(${(-f * 0.25).toFixed(2)}px)` }}>
        {(V ? CURVES_V : CURVES).map((c, i) => { const e = evolvePath(prog(f, sec(c.at), sec(1.5), SIG), c.d); return <path key={i} d={c.d} fill="none" stroke={c.c} strokeWidth={c.w} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} opacity={0.75} />; })}
      </svg>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...big(V ? 104 : 108), ...(V ? { whiteSpace: 'normal', maxWidth: 900, textAlign: 'center' } : null) }}>
          <BlurText f={f} text="Stop" by="letter" start={sec(0.1)} stagger={0.05} dur={0.6} />
          <BlurText f={f} text=" repeating mistakes." start={sec(0.4)} stagger={0.08} dur={0.7} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* „Meet Journalyst“: Buchstaben kommen nacheinander aus der Unschärfe, dann rückt „Meet“ zur Seite (Platz für das neue Logo folgt) */
const MEET_COLORS = ramp('#0b0f0c', '#0b9a52');
export const Meet: React.FC = () => {
  const f = useCurrentFrame(); const { V } = useFormat();
  const [rowRef, row] = useBox<HTMLDivElement>(); const [meetRef, meet] = useBox<HTMLSpanElement>();
  const m = prog(f, sec(1.35), sec(0.75), SIG);
  /* Phase 1: „Meet“ allein, groß und mittig; Phase 2: an seinem Platz in der Zeile */
  const big1 = 1.7; const meetCx = meet ? meet.x + meet.w / 2 : 0; const rowCx = row ? row.x + row.w / 2 : 0;
  const dx = lerp(rowCx - meetCx, 0, m), sc = lerp(big1, 1, m);
  const push = zoomLerp(1, 1.05, prog(f, 0, sec(3.4), SIG));
  return (
    <AbsoluteFill data-root>
      <Bg f={f} kind="green" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div ref={rowRef} style={{ ...big(V ? 104 : 150), display: 'flex', alignItems: 'center', gap: V ? 26 : 38, letterSpacing: '-0.045em' }}>
          <span ref={meetRef} style={{ display: 'inline-block', transform: `translateX(${dx}px) scale(${sc})` }}>
            <BlurText f={f} text="Meet" by="letter" start={sec(0.35)} stagger={0.09} dur={0.8} blur={40} scaleFrom={1.15} color={MEET_COLORS} />
          </span>
          <span style={{ opacity: f >= sec(1.5) ? 1 : 0 }}>
            <BlurText f={f} text="Journalyst" by="letter" start={sec(1.6)} stagger={0.045} dur={0.7} blur={34} color={MEET_COLORS} />
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* Claim auf hellem Grund, dahinter schwach das Dashboard */
export const Tagline: React.FC = () => {
  const f = useCurrentFrame(); const { V } = useFormat();
  const drift = prog(f, 0, sec(3.4), SIG);
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, opacity: 0.07, filter: 'blur(1.5px) grayscale(0.4)', transformOrigin: '0 0', transform: V ? `translate(${lerp(-1150, -1210, drift)}px, ${lerp(-60, -80, drift)}px) rotate(-7deg) scale(2.3)` : `translate(${lerp(-150, -210, drift)}px, ${lerp(-120, -140, drift)}px) rotate(-7deg) scale(1.6)` }}><DashboardPanel f={0} still /></div>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {V ? (
          <div style={{ ...big(84), lineHeight: 1.12 }}>
            <BlurText f={f} text="The trading journal" start={sec(0.4)} stagger={0.08} />{'\n'}
            <BlurText f={f} text="that trains" start={sec(0.72)} stagger={0.08} />{'\n'}
            <BlurText f={f} text="your discipline." start={sec(0.88)} stagger={0.08} color={(i) => (i === 1 ? GREEN_D : INK)} />
          </div>
        ) : (
          <div style={{ ...big(92), lineHeight: 1.12 }}>
            <BlurText f={f} text="The trading journal" start={sec(0.4)} stagger={0.08} />
            {'\n'}
            <BlurText f={f} text="that trains your discipline." start={sec(0.72)} stagger={0.08} color={(i) => (i === 3 ? GREEN_D : INK)} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
