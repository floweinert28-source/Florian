/* Hintergründe: weiche, langsam treibende Verläufe in Journalyst-Grün (Umgebungsebene, bewegt sich nur mit 20–30 % Tempo) */
import React from 'react';
import { AbsoluteFill } from 'remotion';

export type BgKind = 'white' | 'mint' | 'green' | 'dark' | 'deep' | 'black';

export const Bg: React.FC<{ f: number; kind: BgKind; dim?: number }> = ({ f, kind, dim = 0 }) => {
  const d = (p: number, a: number) => (Math.sin(f / 140 + p) * a).toFixed(2); /* langsames Atmen der Lichtpunkte, in Prozent */
  let background = '#ffffff';
  if (kind === 'mint') background = [
    `radial-gradient(900px 640px at ${80 + +d(0, 4)}% ${108 + +d(1, 3)}%, rgba(52,245,138,0.30), transparent 70%)`,
    `radial-gradient(800px 600px at ${4 + +d(2, 3)}% ${-6 + +d(3, 3)}%, rgba(255,255,255,0.95), transparent 70%)`,
    `radial-gradient(700px 520px at ${98 + +d(4, 3)}% ${12 + +d(5, 3)}%, rgba(190,244,212,0.55), transparent 70%)`,
    'linear-gradient(180deg, #f8fbf9 0%, #eaf4ee 100%)',
  ].join(',');
  if (kind === 'green') background = [
    `radial-gradient(1000px 700px at ${12 + +d(0, 5)}% ${8 + +d(1, 4)}%, rgba(255,255,255,0.95), transparent 65%)`,
    `radial-gradient(900px 640px at ${92 + +d(2, 4)}% ${98 + +d(3, 4)}%, rgba(9,150,78,0.85), transparent 70%)`,
    `radial-gradient(700px 520px at ${70 + +d(4, 5)}% ${40 + +d(5, 4)}%, rgba(120,240,172,0.55), transparent 70%)`,
    'linear-gradient(155deg, #fbfdfb 0%, #ddf8e8 32%, #8cefb6 64%, #22d575 86%, #0fb862 100%)',
  ].join(',');
  if (kind === 'dark') background = [
    `radial-gradient(1200px 700px at ${50 + +d(0, 4)}% ${118 + +d(1, 3)}%, rgba(15,184,98,0.38), transparent 70%)`,
    `radial-gradient(900px 600px at ${12 + +d(2, 4)}% ${-12 + +d(3, 3)}%, rgba(52,245,138,0.10), transparent 70%)`,
    '#050a07',
  ].join(',');
  if (kind === 'deep') background = [
    `radial-gradient(1100px 760px at ${50 + +d(0, 3)}% ${46 + +d(1, 3)}%, #0e6a39 0%, #084524 38%, #04180c 78%, #020a05 100%)`,
  ].join(',');
  if (kind === 'black') background = '#050605';
  return (
    <AbsoluteFill style={{ background }}>
      {dim > 0 ? <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)', opacity: dim }} /> : null}
    </AbsoluteFill>
  );
};
