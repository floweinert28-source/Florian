/* „Every broken rule has a price.“ und „Your Shadow Self shows you what discipline is worth.“
   Hervorhebung wie in der App: „price“ in einer roten Pille, „discipline“ wird grün und bekommt eine leuchtende Linie. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { OUT, prog, sec, SIG, zoomLerp } from '../anim';
import { big, GREEN } from '../theme';
import { Bg } from '../ui/Bg';
import { lerpColor } from '../ui/Kit';
import { useFormat } from '../format';
import { BlurText } from '../ui/Text';

const LOSS = '#e03e3e'; /* Rot des hellen Erscheinungsbilds, auf Weiß */

export const Price: React.FC = () => {
  const f = useCurrentFrame(); const { V } = useFormat();
  const pill = prog(f, sec(0.75), sec(0.5), SIG);
  const push = zoomLerp(1, 1.04, prog(f, 0, sec(2.4), SIG));
  return (
    <AbsoluteFill style={{ background: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      {V ? <div style={{ ...big(96), transform: `scale(${push})`, marginBottom: 10 }}><BlurText f={f} text="Every broken rule" start={sec(0.3)} stagger={0.06} /></div> : null}
      <div style={{ ...big(96), display: 'flex', alignItems: 'baseline', transform: `scale(${push})` }}>
        <BlurText f={f} text={V ? 'has a' : 'Every broken rule has a'} start={sec(V ? 0.48 : 0.3)} stagger={0.06} />
        {/* Pille um „price“: unten mehr Luft für die Unterlänge des „p“, seitlich mehr Rand */}
        <span style={{ position: 'relative', display: 'inline-block', marginLeft: '0.26em', padding: '0 0.42em 0.22em' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(224, 62, 62, 0.12)', transform: `scaleX(${pill})`, opacity: Math.min(1, pill * 2) }} />
          <span style={{ position: 'relative' }}><BlurText f={f} text="price" by="letter" start={sec(0.92)} stagger={0.04} dur={0.6} color={LOSS} /></span>
        </span>
        <span style={{ opacity: prog(f, sec(1.15), sec(0.3), OUT) }}>.</span>
      </div>
    </AbsoluteFill>
  );
};

export const Worth: React.FC = () => {
  const f = useCurrentFrame(); const { V } = useFormat();
  const mark = prog(f, sec(1.75), sec(0.55), SIG);
  const push = zoomLerp(1, 1.05, prog(f, 0, sec(3.4), SIG));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="deep" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div style={{ ...big(58, 'rgba(255,255,255,0.78)', 500), marginBottom: 40 }}><BlurText f={f} text="Your Shadow Self shows you" start={sec(0.4)} stagger={0.07} /></div>
        <div style={{ ...big(100, '#fff', 700), ...(V ? { whiteSpace: 'normal', maxWidth: 900, textAlign: 'center', lineHeight: 1.12 } : null) }}>
          <BlurText f={f} text="what" start={sec(1.0)} />{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <BlurText f={f} text="discipline" start={sec(1.08)} color={lerpColor('#ffffff', GREEN, mark)} />
            <span style={{ position: 'absolute', left: 0, bottom: '-0.06em', height: 7, borderRadius: 4, width: `${(mark * 100).toFixed(2)}%`, background: GREEN, boxShadow: `0 0 18px rgba(52,245,138,0.6)` }} />
          </span>{V ? <br /> : ' '}
          <BlurText f={f} text="is worth." start={sec(1.16)} stagger={0.08} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

