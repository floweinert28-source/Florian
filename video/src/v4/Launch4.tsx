/* Viertes Launch-Video nach der Vorlage „iBanPay“ (https://youtu.be/wwIt5ZvROrs): gleicher Aufbau und gleiche Bewegungen,
   im dunklen Journalyst-Design mit echten Werten aus der App. Nur Sound-Effekte (scripts/sound4.py), keine Musik. */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { sec } from '../anim';
import '../fonts';
import { Shot, Wrap } from '../Launch';
import { Part1, P1_DURATION } from './Part1';
import { Part2, P2_DURATION } from './Part2';
import { Part3, P3_DURATION } from './Part3';
import { Part4, P4_DURATION } from './Part4';
import { Part5, P5_DURATION } from './Part5';

const T1 = P1_DURATION, T2 = T1 + P2_DURATION, T3 = T2 + P3_DURATION, T4 = T3 + P4_DURATION, T5 = T4 + P5_DURATION;
const SHOTS: Shot[] = [
  { from: 0, to: T1, el: <Part1 /> },        /* Still copying every trade into spreadsheets? → Meet JOURNALYST */
  { from: T1, to: T2, el: <Part2 /> },       /* Drop one or many CSV files → Import → It reads every trade */
  { from: T2, to: T3, el: <Part3 /> },       /* And seconds later → Your trades are in. → Time for a quick ◆ review. */
  { from: T3, to: T4, el: <Part4 /> },       /* TradeLog → Review trade → Save review */
  { from: T4, to: T5, el: <Part5 /> },       /* Rule check → Plan followed → Trade reviewed → Save time … → JOURNALYST */
];
export const DURATION4 = sec(T5);

export const Launch4: React.FC = () => (
  <AbsoluteFill style={{ background: '#060807' }}>
    <Audio src={staticFile('audio/sound4.wav')} />
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
