/* Standbilder der echten App (scripts/capture.cjs) und die Lage der Elemente darin, in CSS-Pixeln eines 1440 × 900-Fensters. */
import en from './data/shots-en.json';
import de from './data/shots-de.json';

export type Lang = 'en' | 'de';
export type Box = { x: number; y: number; w: number; h: number };
type Card = Box & { cls: string; title: string };
type Shots = {
  lang: string; viewport: { w: number; h: number };
  screens: {
    dashboard: { cards: Card[]; logTrade: Box };
    editor: { modal: Box; scrollH: number; clientH: number; save: Box };
    saved: { cards: Card[]; toast: Box };
    trades: { cards: Card[]; table: Box; firstRow: Box };
    shadow: { cards: Card[]; tiles: Box };
    prop: { cards: Card[] };
  };
};
export const shotsFor = (lang: Lang): Shots => (lang === 'de' ? de : en) as unknown as Shots;
export const VW = 1440, VH = 900;
