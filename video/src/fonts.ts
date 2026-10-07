import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

const satoshi = [400, 500, 700, 900].map((w) => loadFont({ family: 'Satoshi', url: staticFile(`fonts/satoshi-${w}.woff2`), weight: String(w), format: 'woff2' }));
const onest = [400, 500, 600, 700].map((w) => loadFont({ family: 'Onest', url: staticFile(`fonts/onest-${w}.woff2`), weight: String(w), format: 'woff2' }));

export const fontsReady = Promise.all([...satoshi, ...onest]);
export const FONT_TEXT = '"Satoshi", "Onest", "Segoe UI", system-ui, sans-serif';
export const FONT_NUM = '"Onest", "Segoe UI", system-ui, sans-serif';
