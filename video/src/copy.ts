/* Texte des Videos je Sprache; die Sprache kommt aus der Aufnahme (events.json → lang). */
import { LANG } from './footage';

type Copy = { sub: string; claim: [string, string, string]; cta: string; captions: { no: string; text: string }[] };
const COPY: Record<'de' | 'en', Copy> = {
  de: {
    sub: 'Dein Trading-Journal im Browser',
    claim: ['Aufzeichnen.', 'Traden.', 'Besser werden.'],
    cta: 'Starte dein Journal',
    captions: [
      { no: '01', text: 'Dashboard: alle Kennzahlen auf einen Blick' },
      { no: '02', text: 'Trade loggen: Plan, Setup, Emotion, Notizen' },
      { no: '03', text: 'Statistiken: 16 Kennzahlen und was Fehler kosten' },
      { no: '04', text: 'Fortschritt: Regeln abhaken, Serie halten' },
      { no: '05', text: 'Schatten-Ich: was Regelbrüche kosten' },
      { no: '06', text: 'Ruhepunkt: ruhig rein, sauber raus' },
      { no: '07', text: 'Mentor: fragt dein Journal, nicht dein Bauchgefühl' },
      { no: '08', text: 'Prop Firms: Regel-Engine, Puffer, Ampel' },
    ],
  },
  en: {
    sub: 'Your trading journal in the browser',
    claim: ['Log.', 'Trade.', 'Get better.'],
    cta: 'Start your journal',
    captions: [
      { no: '01', text: 'Dashboard: every metric at a glance' },
      { no: '02', text: 'Log a trade: plan, setup, emotion, notes' },
      { no: '03', text: 'Statistics: 16 metrics and what your mistakes cost' },
      { no: '04', text: 'Progress: tick your rules, keep the streak' },
      { no: '05', text: 'Shadow Self: what breaking rules costs you' },
      { no: '06', text: 'Calm Point: arrive calm, leave clean' },
      { no: '07', text: 'Mentor: asks your journal, not your gut' },
      { no: '08', text: 'Prop firms: rule engine, buffer, traffic light' },
    ],
  },
};
export const C = COPY[LANG];
