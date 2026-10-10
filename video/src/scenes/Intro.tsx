/* 8–16 s: Wendepunkt, Marke und Claim */
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { lerp, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { img } from '../cap';
import { big, GREEN, GREEN_D, GREY, INK } from '../theme';
import { Bg } from '../ui/Bg';
import { JMark } from '../ui/Logo';
import { BlurText, ramp, useBox } from '../ui/Text';

/* Weißer Grund mit feinen grünen Linien, die sich selbst zeichnen */
const CURVES = [
  { d: 'M -120 830 C 380 640, 720 1050, 1160 860 S 1720 590, 2060 700', c: GREEN_D, w: 2.6, at: 0 },
  { d: 'M -120 900 C 360 720, 760 1110, 1190 935 S 1730 690, 2060 800', c: GREEN, w: 2, at: 0.12 },
  { d: 'M 1180 -80 C 1420 140, 1660 170, 2060 110', c: GREEN_D, w: 2, at: 0.24 },
  { d: 'M 1320 -80 C 1520 90, 1720 110, 2060 40', c: GREEN, w: 1.6, at: 0.34 },
];
export const Stop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: '#fff' }}>
      <svg width="1920" height="1080" style={{ position: 'absolute', transform: `translateX(${(-f * 0.25).toFixed(2)}px)` }}>
        {CURVES.map((c, i) => { const e = evolvePath(prog(f, sec(c.at), sec(1.5), SIG), c.d); return <path key={i} d={c.d} fill="none" stroke={c.c} strokeWidth={c.w} strokeLinecap="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} opacity={0.75} />; })}
      </svg>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={big(108)}>
          <BlurText f={f} text="Stop" by="letter" start={sec(0.1)} stagger={0.05} dur={0.6} />
          <BlurText f={f} text=" repeating mistakes." start={sec(0.5)} stagger={0.08} dur={0.7} color={GREY} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* „Meet Journalyst“: Buchstaben kommen nacheinander aus der Unschärfe, dann rückt „Meet“ zur Seite und das Logo springt dazwischen */
const MEET_COLORS = ramp('#0b0f0c', '#0b9a52');
export const Meet: React.FC = () => {
  const f = useCurrentFrame();
  const [rowRef, row] = useBox<HTMLDivElement>(); const [meetRef, meet] = useBox<HTMLSpanElement>();
  const m = prog(f, sec(1.35), sec(0.75), SIG);
  /* Phase 1: „Meet“ allein, groß und mittig; Phase 2: an seinem Platz in der Zeile */
  const big1 = 1.7; const meetCx = meet ? meet.x + meet.w / 2 : 0; const rowCx = row ? row.x + row.w / 2 : 0;
  const dx = lerp(rowCx - meetCx, 0, m), sc = lerp(big1, 1, m);
  const logo = pop(f, sec(1.5), { damping: 12 });
  const push = zoomLerp(1, 1.05, prog(f, 0, sec(3.4), SIG));
  return (
    <AbsoluteFill data-root>
      <Bg f={f} kind="green" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div ref={rowRef} style={{ ...big(150), display: 'flex', alignItems: 'center', gap: 38, letterSpacing: '-0.045em' }}>
          <span ref={meetRef} style={{ display: 'inline-block', transform: `translateX(${dx}px) scale(${sc})` }}>
            <BlurText f={f} text="Meet" by="letter" start={sec(0.35)} stagger={0.09} dur={0.8} blur={40} scaleFrom={1.15} color={MEET_COLORS} />
          </span>
          <span style={{ display: 'grid', placeItems: 'center', width: 132, height: 132, borderRadius: 34, background: '#141414', boxShadow: '0 30px 60px -24px rgba(4,40,20,0.6)', opacity: Math.min(1, logo * 1.5), transform: `scale(${logo}) rotate(${lerp(-14, 0, logo)}deg)` }}>
            <JMark size={88} />
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
  const f = useCurrentFrame();
  const drift = prog(f, 0, sec(3.4), SIG);
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <Img src={img('dash.jpg')} style={{ position: 'absolute', width: 2300, left: -190, top: -170, opacity: 0.07, filter: 'blur(2px) grayscale(0.3)', transform: `rotate(-7deg) translate(${lerp(30, -30, drift)}px, ${lerp(10, -10, drift)}px)` }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ ...big(92), lineHeight: 1.12 }}>
          <BlurText f={f} text="The trading journal" start={sec(0.4)} stagger={0.08} />
          {'\n'}
          <BlurText f={f} text="that trains your discipline." start={sec(0.72)} stagger={0.08} color={(i) => (i === 3 ? GREEN_D : INK)} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
