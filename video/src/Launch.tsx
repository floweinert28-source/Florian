/* Launch-Video nach dem Vorbild „Numtera“ (ObiN Studio). Die App-Szenen sind eigene, helle Karten mit echten Werten aus Journalyst.
   Schnitte liegen auf einem 120-BPM-Raster (alle 0,5 s), damit Musik in diesem Tempo später direkt passt. */
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { IN, lerp, OUT, prog, sec } from './anim';
import './fonts';
import { Problem } from './scenes/Problem';
import { Meet, Stop, Tagline } from './scenes/Intro';
import { Dashboard, LogTrade, RuleCheck, ShadowSelf, TradeLog } from './scenes/Product';
import { Price, Worth } from './scenes/Shadow';
import { Cta, Logo, Statement, TypedLine } from './scenes/Outro';
import { GREEN } from './theme';

type Tr = 'cut' | 'fade' | 'blur' | 'wipe';
type Shot = { from: number; to: number; in?: Tr; inDur?: number; el: React.ReactNode };

/* Zeitplan in Sekunden; „in“ ist der Übergang aus der vorigen Szene */
const SHOTS: Shot[] = [
  { from: 0, to: 6.5, el: <Problem /> },                                 /* Same mistake, / Different day. → Same loss… again?  Flug durch das „o“ */
  { from: 6.5, to: 8.5, el: <Stop /> },                                  /* Stop repeating mistakes. */
  { from: 8.5, to: 11.5, in: 'fade', inDur: 0.4, el: <Meet /> },         /* Meet [J] Journalyst */
  { from: 11.5, to: 14, in: 'fade', inDur: 0.4, el: <Tagline /> },       /* The trading journal that trains your discipline. */
  { from: 14, to: 16.5, el: <Dashboard /> },                             /* Dashboard schräg im Raum, Karten ragen kurz heraus */
  { from: 16.5, to: 19.5, el: <LogTrade /> },                            /* Trade loggen */
  { from: 19.5, to: 21.5, el: <TradeLog /> },                            /* neuer Trade oben im TradeLog */
  { from: 21.5, to: 24.5, el: <RuleCheck /> },                           /* Regeln werden abgehakt */
  { from: 24.5, to: 26.5, in: 'fade', inDur: 0.35, el: <Price /> },      /* Every broken rule has a { price } */
  { from: 26.5, to: 30, in: 'fade', inDur: 0.35, el: <ShadowSelf /> },   /* Disziplin-Kosten zählen hoch, Kurven zeichnen sich */
  { from: 30, to: 33, in: 'fade', inDur: 0.4, el: <Worth /> },           /* Your Shadow Self shows you [ what discipline is worth ] */
  { from: 33, to: 35, in: 'blur', inDur: 0.45, el: <Statement text="Others count trades." bg="white" /> },
  { from: 35, to: 37, in: 'fade', inDur: 0.3, el: <Statement text="We build traders." bg="deep" color="#fff" accent={2} accentColor={GREEN} /> },
  { from: 37, to: 39.5, in: 'fade', inDur: 0.3, el: <Logo /> },
  { from: 39.5, to: 42, in: 'wipe', inDur: 0.5, el: <TypedLine /> },
  { from: 42, to: 45.5, in: 'fade', inDur: 0.45, el: <Cta /> },
];
export const DURATION = sec(45.5);

/* Hülle einer Szene: blendet beim Eintritt über die vorige Szene; die vorige läuft so lange weiter */
const Wrap: React.FC<{ tr: Tr; inDur: number; outTr?: Tr; outAt: number; outDur: number; children: React.ReactNode }> = ({ tr, inDur, outTr, outAt, outDur, children }) => {
  const f = useCurrentFrame();
  const t = tr === 'cut' ? 1 : prog(f, 0, sec(inDur), tr === 'wipe' ? IN : OUT);
  const o = outTr === 'blur' || outTr === 'fade' ? prog(f, outAt, sec(outDur), IN) * (outTr === 'blur' ? 1 : 0.5) : 0;
  const style: React.CSSProperties = {};
  if (tr === 'fade') style.opacity = t;
  if (tr === 'blur') { style.opacity = t; if (t < 1) style.filter = `blur(${lerp(26, 0, t).toFixed(2)}px)`; }
  if (tr === 'wipe') style.clipPath = `inset(0 ${((1 - t) * 100).toFixed(3)}% 0 0)`;
  if (o > 0) style.filter = `blur(${(o * 26).toFixed(2)}px)`;
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

export const Launch: React.FC = () => (
  <AbsoluteFill style={{ background: '#fff' }}>
    {SHOTS.map((s, i) => {
      const next = SHOTS[i + 1]; const extend = next && next.in && next.in !== 'cut' ? next.inDur ?? 0 : 0;
      return (
        <Sequence key={i} from={sec(s.from)} durationInFrames={sec(s.to - s.from + extend)} name={`${s.from}s`}>
          <Wrap tr={s.in ?? 'cut'} inDur={s.inDur ?? 0} outTr={next?.in} outAt={sec(s.to - s.from)} outDur={extend}>{s.el}</Wrap>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
