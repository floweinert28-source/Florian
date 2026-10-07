/* Zeitachse: Intro, dann das echte App-Material (public/footage.mp4) mit Ereignissen aus out/footage/events.json.
   Zwischen Stützpunkten läuft das Material in Abschnitten mit eigener Geschwindigkeit (Tippen im Editor schneller). */
import eventsEn from './data/events-en.json';
import eventsDe from './data/events-de.json';

/* Sprache der Fassung: REMOTION_LANG=de|en beim Bundeln, Standard Englisch */
export const LANG: 'de' | 'en' = process.env.REMOTION_LANG === 'de' ? 'de' : 'en';
const eventsJson = LANG === 'de' ? eventsDe : eventsEn;

export type Ev = { t: number; name: string; x: number | null; y: number | null };
const EVENTS: Ev[] = (eventsJson as { events: Ev[] }).events;
export const ev = (name: string): Ev => { const e = EVENTS.find((x) => x.name === name); if (!e) throw new Error('Ereignis fehlt: ' + name); return e; };
export const evTime = (name: string) => ev(name).t;
export const allEvents = EVENTS;

export const FPS = 30;
export const INTRO = 165;                     /* Frames vor dem Material */
export const FOOTAGE_END = evTime('end');

/* Abschnitte des Materials: [von, bis] in Sekunden Material, Geschwindigkeit */
export const SEGMENTS: { from: number; to: number; rate: number }[] = (() => {
  const a = evTime('f-open') - 0.2, b = evTime('save-trade') - 0.9;
  return [{ from: 0, to: a, rate: 1 }, { from: a, to: b, rate: 1.45 }, { from: b, to: FOOTAGE_END + 0.2, rate: 1 }];
})();

/* Materialzeit → Frame auf der Zeitachse */
export const tl = (t: number): number => {
  let frames = INTRO;
  for (const s of SEGMENTS) {
    if (t <= s.from) break;
    const span = Math.min(t, s.to) - s.from;
    frames += (span / s.rate) * FPS;
    if (t <= s.to) break;
  }
  return Math.round(frames);
};
export const tlEv = (name: string, offsetSec = 0) => tl(evTime(name) + offsetSec);
export const TOTAL = tl(FOOTAGE_END) + 1;
