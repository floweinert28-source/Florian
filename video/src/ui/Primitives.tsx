import React from 'react';
import { D, inOut } from '../motion';
import { FONT_NUM, FONT_TEXT, T } from '../theme';

/* Bauchbinde: im Band unter der Bühne, zentriert; Kapitelnummer in Grün */
export const Caption: React.FC<{ frame: number; start: number; end: number; no: string; text: string }> = ({ frame, start, end, no, text }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center', fontFamily: FONT_TEXT, ...inOut(frame, start, end, { dy: 14, inDur: D.card, outDur: D.quick }) }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontFamily: FONT_NUM, fontWeight: 700, fontSize: 22, color: T.accent, letterSpacing: '0.02em' }}>{no}</span>
      <span style={{ width: 1, height: 22, background: T.border2 }} />
      <span style={{ fontWeight: 600, fontSize: 24, color: T.text, letterSpacing: '-0.005em' }}>{text}</span>
    </div>
  </div>
);

