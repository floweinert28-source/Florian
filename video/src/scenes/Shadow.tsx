/* „Every broken rule has a { price }“ und „Your Shadow Self shows you [ what discipline is worth ]“ */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { IN, lerp, OUT, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { big, GREEN, GREEN_D } from '../theme';
import { Bg } from '../ui/Bg';
import { BlurText, useBox } from '../ui/Text';

export const Price: React.FC = () => {
  const f = useCurrentFrame();
  const [pRef, p] = useBox<HTMLSpanElement>();
  const open = prog(f, sec(0.65), sec(0.65), SIG); const half = p ? p.w / 2 + 18 : 120;
  return (
    <AbsoluteFill data-root style={{ background: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...big(96), display: 'flex', alignItems: 'baseline' }}>
        <BlurText f={f} text="Every broken rule has a" start={sec(0.3)} stagger={0.06} />
        <span style={{ display: 'inline-block', marginLeft: '0.32em', color: GREEN_D, opacity: prog(f, sec(0.6), sec(0.2)), transform: `translateX(${lerp(half, 0, open)}px)` }}>{'{'}</span>
        <span ref={pRef} style={{ display: 'inline-block', margin: '0 0.14em', color: GREEN_D }}>
          <BlurText f={f} text="price" by="letter" start={sec(0.82)} stagger={0.05} dur={0.6} scaleFrom={0.85} color={GREEN_D} />
        </span>
        <span style={{ display: 'inline-block', color: GREEN_D, opacity: prog(f, sec(0.6), sec(0.2)), transform: `translateX(${lerp(-half, 0, open)}px)` }}>{'}'}</span>
      </div>
    </AbsoluteFill>
  );
};

/* Eckige Klammern zeichnen sich und öffnen sich bis an die Ränder des Satzes */
export const Worth: React.FC = () => {
  const f = useCurrentFrame();
  const [tRef, tb] = useBox<HTMLSpanElement>();
  const open = prog(f, sec(0.85), sec(0.75), SIG); const draw = prog(f, sec(0.75), sec(0.6), OUT);
  const half = tb ? tb.w / 2 + 46 : 500; const bh = 128; const arm = 30;
  const left = `M ${arm} 0 H 0 V ${bh} H ${arm}`, right = `M 0 0 H ${arm} V ${bh} H 0`;
  const eL = evolvePath(draw, left), eR = evolvePath(draw, right);
  const push = zoomLerp(1, 1.06, prog(f, 0, sec(4), SIG));
  return (
    <AbsoluteFill data-root>
      <Bg f={f} kind="deep" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div style={{ ...big(58, 'rgba(255,255,255,0.78)', 500), marginBottom: 46 }}><BlurText f={f} text="Your Shadow Self shows you" start={sec(0.4)} stagger={0.07} /></div>
        <div style={{ position: 'relative', ...big(100, '#fff', 700) }}>
          <span ref={tRef}><BlurText f={f} text="what discipline is worth" start={sec(1.05)} stagger={0.08} /></span>
          <svg width={arm + 6} height={bh + 6} style={{ position: 'absolute', left: '50%', top: '50%', overflow: 'visible', transform: `translate(${-half - arm / 2}px, ${-bh / 2}px) translateX(${lerp(half, 0, open)}px)` }}>
            <path d={left} fill="none" stroke={GREEN} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={eL.strokeDasharray} strokeDashoffset={eL.strokeDashoffset} />
          </svg>
          <svg width={arm + 6} height={bh + 6} style={{ position: 'absolute', left: '50%', top: '50%', overflow: 'visible', transform: `translate(${half - arm / 2}px, ${-bh / 2}px) translateX(${lerp(-half, 0, open)}px)` }}>
            <path d={right} fill="none" stroke={GREEN} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={eR.strokeDasharray} strokeDashoffset={eR.strokeDashoffset} />
          </svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

