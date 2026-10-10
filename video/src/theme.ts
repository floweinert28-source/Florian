/* Farben und Schrift des Videos: Journalyst-Grün statt Numtera-Blau, Satoshi wie in der App */
import type React from 'react';
export const W = 1920, H = 1080;

export const INK = '#0b0f0c';          /* fast schwarz, leicht grün */
export const LIGHT = '#f2f0ec';        /* Text auf dunklem Grund (--text der App) */
export const GREY = '#a7aea9';         /* zweite Textebene auf Weiß */
export const GREEN = '#34f58a';        /* Akzent der App (dunkles Erscheinungsbild) */
export const GREEN_D = '#0fb862';      /* Akzent der App (helles Erscheinungsbild) */
export const GREEN_DD = '#07733c';
export const DEEP = '#04140a';         /* „accent-ink“ der App */
export const APP_BG = '#0e0d0b';
export const LOSS = '#ff5c5c';

export const DISPLAY = '"Satoshi", "Onest", "Segoe UI", system-ui, sans-serif';
export const NUM = '"Onest", "Segoe UI", system-ui, sans-serif';

/* Große Aussagen: fett, eng gesetzt */
export const big = (size: number, color = INK, weight = 700): React.CSSProperties => ({
  fontFamily: DISPLAY, fontSize: size, fontWeight: weight, color, letterSpacing: '-0.035em', lineHeight: 1.05, whiteSpace: 'pre',
});

/* Weicher, großer Schatten für schwebende App-Teile auf hellem Grund */
export const FLOAT_SHADOW = '0 50px 90px -30px rgba(6, 40, 20, 0.45), 0 18px 36px -18px rgba(6, 40, 20, 0.35)';
