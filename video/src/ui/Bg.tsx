/* Hintergründe: dunkel wie die App, mit leisen Ebenen, damit die Fläche nicht leer wirkt.
   Umgebungsebene: bewegt sich nur langsam (20–30 % Tempo). Ebenen: Grundfarbe, grüne Lichtflecken, feines Raster,
   schwache Kurslinie, Filmkorn. */
import React from 'react';
import { AbsoluteFill, staticFile, useVideoConfig } from 'remotion';

export type BgKind = 'night' | 'aurora' | 'dark' | 'deep' | 'black';

/* Kurslinie als Zufallsweg mit festem Startwert: jedes Bild gleich, kein Flackern */
const walk = (() => {
  let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts: number[] = []; let v = 0.5;
  for (let i = 0; i < 90; i++) { v += (r() - 0.47) * 0.09; v = Math.max(0.08, Math.min(0.92, v)); pts.push(v); }
  return pts;
})();

const Grid: React.FC<{ f: number; opacity: number }> = ({ f, opacity }) => {
  const size = 72; const off = (f * 0.12) % size;
  return (
    <AbsoluteFill style={{
      opacity,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
      backgroundSize: `${size}px ${size}px`, backgroundPosition: `${-off}px ${-off * 0.5}px`,
      maskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 20%, transparent 80%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 20%, transparent 80%)',
    }} />
  );
};

const Chart: React.FC<{ f: number; opacity: number }> = ({ f, opacity }) => {
  const { width: W, height: H } = useVideoConfig();
  const w = W * 1.6, h = H * 0.22, top = H * 0.64;
  const pts = walk.map((v, i) => [(i / (walk.length - 1)) * w, h * (1 - v)] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h + 40} style={{ position: 'absolute', left: 0, top, opacity, transform: `translateX(${(-f * 0.35 - W * 0.1).toFixed(2)}px)`,
      maskImage: 'linear-gradient(90deg, transparent, black 25%, black 75%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, black 25%, black 75%, transparent)' }}>
      <defs><linearGradient id="bgchart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34f58a" stopOpacity="0.16" /><stop offset="1" stopColor="#34f58a" stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L ${w} ${h + 40} L 0 ${h + 40} Z`} fill="url(#bgchart)" />
      <path d={line} fill="none" stroke="#34f58a" strokeOpacity={0.45} strokeWidth={2} />
    </svg>
  );
};

/* Filmkorn: kleine Rauschtextur, je Bild verschoben */
const Grain: React.FC<{ f: number; opacity?: number }> = ({ f, opacity = 0.05 }) => (
  <AbsoluteFill style={{ opacity, mixBlendMode: 'overlay', backgroundImage: `url(${staticFile('noise.png')})`, backgroundSize: '256px 256px', backgroundPosition: `${(f * 73) % 256}px ${(f * 41) % 256}px` }} />
);

export const Bg: React.FC<{ f: number; kind: BgKind; dim?: number }> = ({ f, kind, dim = 0 }) => {
  const d = (p: number, a: number) => (Math.sin(f / 140 + p) * a).toFixed(2); /* langsames Atmen der Lichtpunkte, in Prozent */
  let background = '#060807';
  if (kind === 'night') background = [
    `radial-gradient(1100px 700px at ${82 + +d(0, 4)}% ${110 + +d(1, 3)}%, rgba(52,245,138,0.14), transparent 70%)`,
    `radial-gradient(900px 620px at ${8 + +d(2, 3)}% ${-8 + +d(3, 3)}%, rgba(52,245,138,0.07), transparent 70%)`,
    `radial-gradient(700px 500px at ${50 + +d(4, 4)}% ${45 + +d(5, 3)}%, rgba(255,255,255,0.025), transparent 70%)`,
    '#060807',
  ].join(',');
  if (kind === 'aurora') background = [
    `radial-gradient(1100px 760px at ${78 + +d(0, 5)}% ${105 + +d(1, 4)}%, rgba(52,245,138,0.42), transparent 68%)`,
    `radial-gradient(900px 640px at ${15 + +d(2, 4)}% ${-5 + +d(3, 4)}%, rgba(15,184,98,0.22), transparent 70%)`,
    `radial-gradient(800px 560px at ${60 + +d(4, 5)}% ${45 + +d(5, 4)}%, rgba(52,245,138,0.10), transparent 70%)`,
    'linear-gradient(160deg, #050806 0%, #07140c 55%, #0a2615 100%)',
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
      {kind === 'night' || kind === 'aurora' ? <Grid f={f} opacity={kind === 'night' ? 1 : 0.7} /> : null}
      {kind === 'deep' ? <Grid f={f} opacity={0.45} /> : null}
      {kind === 'night' ? <Chart f={f} opacity={0.55} /> : null}
      {dim > 0 ? <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 100%)', opacity: dim }} /> : null}
      <Grain f={f} />
    </AbsoluteFill>
  );
};

