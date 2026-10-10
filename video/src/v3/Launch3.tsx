/* Drittes Launch-Video nach der Vorlage „Outbidd“ (https://youtu.be/otlWhoTRUsw): gleicher Aufbau und gleiche Bewegungen,
   im dunklen Journalyst-Design mit echten Werten aus der App. Nur Sound-Effekte (scripts/sound3.py), keine Musik. */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { sec } from '../anim';
import '../fonts';
import { Shot, Wrap } from '../Launch';
import { Chaos, CHAOS_DURATION } from './Chaos';
import { List, LIST_DURATION } from './List';
import { Outro, OUTRO_DURATION } from './Outro';
import { Plan, PLAN_DURATION } from './Plan';
import { Review, REVIEW_DURATION } from './Review';
import { Open, OPEN_DURATION } from './Open';
import { Overview, OVERVIEW_DURATION } from './Overview';

const T1 = OPEN_DURATION, T2 = T1 + CHAOS_DURATION, T3 = T2 + OVERVIEW_DURATION, T4 = T3 + LIST_DURATION, T5 = T4 + PLAN_DURATION, T6 = T5 + REVIEW_DURATION, T7 = T6 + OUTRO_DURATION;
const SHOTS: Shot[] = [
  { from: 0, to: T1, el: <Open /> },                                   /* What if → You could follow → your trading plan → Every time? */
  { from: T1, to: T2, el: <Chaos /> },                                 /* No more spreadsheets → And scattered notes. */
  { from: T2, to: T3, in: 'fade', inDur: 0.25, el: <Overview /> },     /* All your trades → Kalender → Tag */
  { from: T3, to: T4, el: <List /> },                                  /* All [Trades, Rules, …] → Raute → See the patterns you miss */
  { from: T4, to: T5, in: 'fade', inDur: 0.25, el: <Plan /> },         /* Build your trading plan: Regeln, Setups, Review */
  { from: T5, to: T6, in: 'fade', inDur: 0.25, el: <Review /> },       /* Seitenleiste → Shadow Self → Trade-Prüfung */
  { from: T6, to: T7, el: <Outro /> },                                 /* Your plan → Your rules → The way journaling should be → JOURNALYST */
];
export const DURATION3 = sec(T7);

export const Launch3: React.FC = () => (
  <AbsoluteFill style={{ background: '#060807' }}>
    <Audio src={staticFile('audio/sound3.wav')} />
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
