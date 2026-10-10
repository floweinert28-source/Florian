/* Schluss: zwei kurze Aussagen, dann eine einzige Endkarte mit Logo, Satz und Knopf */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { lerp, OUT, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { big, DISPLAY, GREEN, INK } from '../theme';
import { Bg, BgKind } from '../ui/Bg';
import { JMark } from '../ui/Logo';
import { BlurText } from '../ui/Text';

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

/* Ein einziger Schluss: Logo, Satz und Knopf bauen sich nacheinander auf, dann bleibt das Bild stehen */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const tile = pop(f, sec(0.35), { damping: 13 });
  const cta = pop(f, sec(1.65), { damping: 14 }); const ctaA = prog(f, sec(1.65), sec(0.3), OUT);
  const push = zoomLerp(1, 1.04, prog(f, 0, sec(5), SIG));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="deep" dim={prog(f, sec(0.5), sec(4), SIG) * 0.45} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${push})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 116, height: 116, borderRadius: 30, background: '#141414', boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 30px 60px -26px rgba(0,0,0,0.7)', opacity: Math.min(1, tile * 1.5), transform: `scale(${tile}) rotate(${lerp(-14, 0, tile)}deg)` }}>
            <JMark size={76} />
          </span>
          <div style={{ fontFamily: DISPLAY, fontSize: 96, fontWeight: 800, letterSpacing: '0.06em', color: '#fff' }}>
            <BlurText f={f} text="JOURNALYST" by="letter" start={sec(0.5)} stagger={0.045} dur={0.7} blur={30} />
          </div>
        </div>
        <div style={{ ...big(42, 'rgba(255,255,255,0.72)', 500), letterSpacing: '-0.01em', marginTop: 34 }}>
          <BlurText f={f} text="The trading journal for discipline." start={sec(1.15)} stagger={0.06} />
        </div>
        <div style={{ marginTop: 56, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '24px 40px', borderRadius: 28, background: GREEN, color: '#04140a', fontFamily: DISPLAY, fontSize: 32, fontWeight: 600,
          opacity: ctaA, transform: `scale(${lerp(0.8, 1, cta)})`, boxShadow: '0 18px 44px -18px rgba(52,245,138,0.75)' }}>
          Start your journal
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#04140a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
