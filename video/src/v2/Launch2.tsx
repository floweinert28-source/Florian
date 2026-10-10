/* Zweites Launch-Video nach der Vorlage „LangEase“ (https://youtu.be/SgmuplXU2iY): gleicher Aufbau und gleiche Bewegungen,
   aber im dunklen Journalyst-Design mit echten Werten aus der App. Nur Sound-Effekte (scripts/sound2.py), keine Musik. */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { sec } from '../anim';
import '../fonts';
import { Shot, Wrap } from '../Launch';
import { Edge, EDGE_DURATION } from './Edge';
import { Finale, FINALE_DURATION } from './Finale';
import { Hook, HOOK_DURATION } from './Hook';
import { Phones, PHONES_DURATION } from './Phones';
import { Score, SCORE_DURATION } from './Score';

const A0 = HOOK_DURATION, B0 = A0 + PHONES_DURATION, C0 = B0 + SCORE_DURATION, D0 = C0 + EDGE_DURATION;
const SHOTS: Shot[] = [
  { from: 0, to: A0, el: <Hook /> },                                            /* Turn trades → into discipline → Every trade [Ordner] instantly */
  { from: A0, to: B0, in: 'fade', inDur: 0.3, el: <Phones /> },                /* Just drop and go. → vier Handys → All in one journal. */
  { from: B0, to: C0, in: 'fade', inDur: 0.25, el: <Score /> },                /* Balken → Plan followed. → Karten → TradeLog */
  { from: C0, to: D0, el: <Edge /> },                                           /* Know your edge. (nahtloser Schnitt) */
  { from: D0, to: D0 + FINALE_DURATION, in: 'blur', inDur: 0.4, el: <Finale /> }, /* Create certificate → Log. Review. Improve. → JOURNALYST */
];
export const DURATION2 = sec(D0 + FINALE_DURATION);

export const Launch2: React.FC = () => (
  <AbsoluteFill style={{ background: '#060807' }}>
    <Audio src={staticFile('audio/sound2.wav')} />
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
