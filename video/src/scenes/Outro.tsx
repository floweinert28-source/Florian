/* 48–64 s: kurze Aussagen im Takt, Logo, getippter Satz, Aufruf */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { lerp, OUT, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { big, DISPLAY, GREEN, GREY, INK } from '../theme';
import { Bg, BgKind } from '../ui/Bg';
import { JMark } from '../ui/Logo';
import { BlurText, ramp, Typed } from '../ui/Text';

/* Eine Zeile auf vollem Grund: Wörter aus der Unschärfe oder die ganze Zeile skaliert herein */
export const Statement: React.FC<{ text: string; bg: BgKind; color?: string; size?: number; mode?: 'words' | 'scale'; accent?: number; accentColor?: string; start?: number }> = ({ text, bg, color = INK, size = 124, mode = 'words', accent, accentColor = GREEN, start = 0.35 }) => {
  const f = useCurrentFrame();
  const s = prog(f, sec(start), sec(0.9), OUT);
  const push = zoomLerp(1, 1.04, prog(f, 0, sec(2.2), SIG));
  return (
    <AbsoluteFill>
      <Bg f={f} kind={bg} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        {mode === 'scale' ? (
          <div style={{ ...big(size, color), opacity: s, filter: s < 1 ? `blur(${lerp(22, 0, s).toFixed(2)}px)` : undefined, transform: `scale(${lerp(0.86, 1, s)})` }}>{text}</div>
        ) : (
          <div style={big(size, color)}><BlurText f={f} text={text} start={sec(start)} stagger={0.09} dur={0.75} color={(i) => (i === accent ? accentColor : color)} /></div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const WORD = ramp('#0b0f0c', '#0a8f49');
export const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const tile = pop(f, sec(0.3), { damping: 13 });
  const sub = prog(f, sec(1.3), sec(0.6), OUT);
  const push = zoomLerp(1, 1.05, prog(f, 0, sec(3.2), SIG));
  return (
    <AbsoluteFill style={{ background: '#fff', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${push})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 124, height: 124, borderRadius: 32, background: '#141414', boxShadow: '0 30px 60px -26px rgba(4,40,20,0.55)', opacity: Math.min(1, tile * 1.5), transform: `scale(${tile}) rotate(${lerp(-14, 0, tile)}deg)` }}>
            <JMark size={82} />
          </span>
          <div style={{ fontFamily: DISPLAY, fontSize: 104, fontWeight: 900, letterSpacing: '0.02em', color: INK }}>
            <BlurText f={f} text="JOURNALYST" by="letter" start={sec(0.5)} stagger={0.045} dur={0.7} blur={30} color={WORD} />
          </div>
        </div>
        <div style={{ marginTop: 26, fontFamily: DISPLAY, fontSize: 34, fontWeight: 500, color: GREY, letterSpacing: '0.01em', opacity: sub, transform: `translateY(${lerp(16, 0, sub)}px)` }}>Trading Journal App</div>
      </div>
    </AbsoluteFill>
  );
};

export const TypedLine: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Bg f={f} kind="black" />
      <div style={{ ...big(80, '#fff', 600), letterSpacing: '-0.025em', position: 'relative' }}>
        <Typed f={f} text="The trading journal for discipline." start={sec(0.55)} cps={22} />
      </div>
    </AbsoluteFill>
  );
};

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const mark = prog(f, sec(1.2), sec(0.7), OUT);
  const push = zoomLerp(1, 1.05, prog(f, 0, sec(4), SIG));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="deep" dim={prog(f, sec(0.5), sec(3.3), SIG) * 0.6} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div style={big(132, '#fff', 700)}><BlurText f={f} text="Start your journal" start={sec(0.5)} stagger={0.1} dur={0.8} /></div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 92, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, opacity: mark, transform: `translateY(${lerp(14, 0, mark)}px)` }}>
        <span style={{ display: 'grid', placeItems: 'center', width: 52, height: 52, borderRadius: 14, background: '#141414', boxShadow: '0 0 0 1px rgba(255,255,255,0.1)' }}><JMark size={34} /></span>
        <span style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>JOURNALYST</span>
      </div>
    </AbsoluteFill>
  );
};
