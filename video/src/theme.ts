import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Journalyst design tokens (see journalyst-design-motion.md).
export const C = {
  stage: '#090807',
  bg: '#0e0d0b',
  sidebar: '#151412',
  card: '#1a1917',
  surface: '#22211f',
  surface2: '#2b2a26',
  border: '#262522',
  border2: '#34322e',
  text: '#f2f0ec',
  text2: '#bcb8b1',
  muted: '#8a867f',
  grid: '#2c2a27',
  zero: '#46433e',
  accent: '#34f58a',
  loss: '#ff5c5c',
} as const;

export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Satoshi is not on Google Fonts – Manrope is the closest geometric-grotesk match.
// Both are the Google Fonts variable files (latin subset), bundled locally so renders never hit the network.
for (const family of ['Manrope', 'Onest']) {
  loadFont({family, url: staticFile(`fonts/${family}-latin.woff2`), weight: '400 700', format: 'woff2'});
}

export const FONT = {
  text: 'Manrope, sans-serif',
  num: 'Onest, sans-serif',
};

export const NUM_STYLE = {
  fontFamily: FONT.num,
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum" 1',
} as const;

export const R = {card: 14, button: 10, small: 7};

// Dashboard canvas layout (px, unscaled).
export const L = {
  width: 1920,
  height: 1118,
  sidebar: 232,
  header: 72,
  pad: 24,
  gap: 18,
  toolbar: 40,
  kpi: 112,
  widget: 396,
};

const contentX = L.sidebar + L.pad;
const contentW = L.width - L.sidebar - L.pad * 2;
const colW = (contentW - L.gap * 2) / 3;
const toolbarY = L.header + L.pad;
const kpiY = toolbarY + L.toolbar + L.gap;
const row1Y = kpiY + L.kpi + L.gap;
const row2Y = row1Y + L.widget + L.gap;

export const BOX = {
  toolbar: {x: contentX, y: toolbarY, w: contentW, h: L.toolbar},
  kpi: {x: contentX, y: kpiY, w: contentW, h: L.kpi},
  equity: {x: contentX, y: row1Y, w: colW * 2 + L.gap, h: L.widget},
  trades: {x: contentX + (colW + L.gap) * 2, y: row1Y, w: colW, h: L.widget * 2 + L.gap},
  calendar: {x: contentX, y: row2Y, w: colW * 2 + L.gap, h: L.widget},
};

export type Box = {x: number; y: number; w: number; h: number};
