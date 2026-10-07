import type { Lang } from './shots';

export type Copy = { beats: { eyebrow: string; title: string }[]; claim: [string, string, string]; cta: string };
export const COPY: Record<Lang, Copy> = {
  en: {
    beats: [
      { eyebrow: 'Dashboard', title: 'Your whole trading, on one screen.' },
      { eyebrow: 'Log a trade', title: 'Plan, setup and emotion. In seconds.' },
      { eyebrow: 'TradeLog', title: 'Every trade, right where you need it.' },
      { eyebrow: 'Shadow Self', title: 'See what breaking your rules really costs.' },
      { eyebrow: 'Prop firms', title: 'Every account, every rule, always in view.' },
    ],
    claim: ['Log.', 'Trade.', 'Get better.'],
    cta: 'Start your journal',
  },
  de: {
    beats: [
      { eyebrow: 'Dashboard', title: 'Dein ganzes Trading auf einem Bildschirm.' },
      { eyebrow: 'Trade loggen', title: 'Plan, Setup und Emotion. In Sekunden.' },
      { eyebrow: 'TradeLog', title: 'Jeder Trade, genau da, wo du ihn brauchst.' },
      { eyebrow: 'Schatten-Ich', title: 'Sieh, was dich Regelbrüche wirklich kosten.' },
      { eyebrow: 'Prop Firms', title: 'Jedes Konto, jede Regel, immer im Blick.' },
    ],
    claim: ['Aufzeichnen.', 'Traden.', 'Besser werden.'],
    cta: 'Starte dein Journal',
  },
};
