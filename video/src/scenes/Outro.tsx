import React from 'react';
import { useCurrentFrame } from 'remotion';
import { D, ENTER, enterStyle, ms, prog } from '../motion';
import { FONT_TEXT, T } from '../theme';
import { JMark } from '../ui/Logo';
import { Glow } from './Intro';

/* Vordergrund außerhalb der Kamera: abdunkeln, Marke, Claim, Einladung, Schwarzblende */
export const OutroOverlay: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const dim = prog(f, 0, ms(900), ENTER);
  const words = ['Aufzeichnen.', 'Traden.', 'Besser werden.'];
  const black = prog(f, dur - ms(900), ms(900));
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT_TEXT, color: T.text, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${(0.8 * dim).toFixed(3)})` }} />
      <Glow frame={f} x={760} y={480} r={620} color="rgba(52,245,138,0.14)" opacity={dim} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, ...enterStyle(f, 18, D.big, 28) }}>
          <JMark size={64} />
          <div style={{ fontWeight: 900, fontSize: 84, letterSpacing: '0.05em', lineHeight: '90px', textTransform: 'uppercase' }}>Journalyst</div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 16 }}>
          {words.map((w, i) => <span key={w} style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.01em', color: i === 2 ? T.accent : T.text, ...enterStyle(f, 40 + i * 5, ms(520), 22) }}>{w}</span>)}
        </div>
        <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 12, height: 56, padding: '0 26px', borderRadius: 999, border: `1px solid ${T.accent}`, color: T.accent, fontWeight: 600, fontSize: 20, background: 'rgba(52,245,138,0.06)', boxShadow: `0 0 40px ${T.accentSoft}`, ...enterStyle(f, 82, D.card, 18) }}>
          Kostenlos im Browser · ohne Anmeldung · deine Daten bleiben bei dir
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: black }} />
    </div>
  );
};
