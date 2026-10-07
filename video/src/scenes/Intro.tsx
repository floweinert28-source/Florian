import React from 'react';
import { useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { D, ENTER, enterStyle, exitStyle, lerp, ms, prog, sine } from '../motion';
import { FONT_TEXT, T } from '../theme';
import { JMark } from '../ui/Logo';

/* Umgebung: zwei weiche Lichtflächen, die langsam treiben */
export const Glow: React.FC<{ frame: number; x: number; y: number; r: number; color: string; opacity: number; speed?: number; phase?: number }> = ({ frame, x, y, r, color, opacity, speed = 1, phase = 0 }) => (
  <div style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`, opacity, translate: `${(Math.sin(frame / (ms(9000) / speed) * Math.PI * 2 + phase) * 40).toFixed(1)}px ${(Math.cos(frame / (ms(11000) / speed) * Math.PI * 2 + phase) * 30).toFixed(1)}px`, pointerEvents: 'none' }} />
);

const LOADER = 'M2 17 L9 11 L15 14 L22 6 L29 10 L36 4 L46 8'; /* die Kurslinie des App-Loaders */

export const Intro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const out = dur - ms(420);
  const lineP = prog(f, 8, ms(900));
  const ev = evolvePath(lineP, LOADER);
  const glide = prog(f, 36, ms(1100), ENTER); /* grünes Stück gleitet über die Linie */
  const fadeLine = 1 - prog(f, 54, ms(500));
  const wordP = prog(f, 54, ms(800));
  const words = ['Aufzeichnen.', 'Traden.', 'Besser werden.'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, fontFamily: FONT_TEXT, color: T.text, overflow: 'hidden' }}>
      <Glow frame={f} x={700} y={420} r={620} color="rgba(52,245,138,0.16)" opacity={prog(f, 0, ms(1500)) * (1 - prog(f, out, ms(420)))} />
      <Glow frame={f} x={1350} y={760} r={560} color="rgba(139,124,246,0.14)" opacity={prog(f, 10, ms(1500)) * (1 - prog(f, out, ms(420)))} phase={2} />
      {/* Kurslinie */}
      <svg width="520" height="240" viewBox="0 0 48 22" style={{ position: 'absolute', left: 700, top: 420, opacity: fadeLine, overflow: 'visible' }}>
        <path d={LOADER} fill="none" stroke={T.border2} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
        <path d={LOADER} fill="none" stroke={T.accent} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="18 100" strokeDashoffset={-lerp(-18, 100, glide)} style={{ filter: `drop-shadow(0 0 1.2px ${T.accent})` }} />
      </svg>
      {/* Marke */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, ...(f >= out ? exitStyle(f, out, ms(420), -28) : { opacity: 1 }) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: wordP, translate: `0px ${((1 - wordP) * 28).toFixed(1)}px` }}>
          <JMark size={64} />
          <div style={{ overflow: 'hidden', height: 90 }}>
            <div style={{ fontWeight: 900, fontSize: 84, letterSpacing: '0.05em', lineHeight: '90px', textTransform: 'uppercase', translate: `0px ${((1 - wordP) * 90).toFixed(1)}px` }}>Journalyst</div>
          </div>
        </div>
        <div style={{ fontSize: 20, color: T.muted, fontWeight: 500, letterSpacing: '0.01em', ...enterStyle(f, 78, D.card, 14) }}>Dein Trading-Journal im Browser</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 36 }}>
          {words.map((w, i) => (
            <span key={w} style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.01em', color: i === 2 ? T.accent : T.text, ...enterStyle(f, 98 + i * 5, ms(520), 22) }}>{w}</span>
          ))}
        </div>
      </div>
      {/* Atmen des Hintergrunds: ganz leicht */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 60%, rgba(0,0,0,0) 40%, rgba(0,0,0,${(0.35 + 0.1 * sine(f, ms(6000))).toFixed(3)}) 100%)`, pointerEvents: 'none' }} />
    </div>
  );
};
