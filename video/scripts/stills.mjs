// Rendert einzelne Bilder als PNG zur Sichtkontrolle: node scripts/stills.mjs 120 230 7.5s   (Zahl = Frame, mit „s“ = Sekunde)
// Hochkant: COMP=JournalystVertical node scripts/stills.mjs 7.5s
import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const browserExecutable = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const frames = process.argv.slice(2).map((a) => (a.endsWith('s') ? Math.round(parseFloat(a) * 60) : Number(a)));
const outDir = path.join(root, 'out', 'stills'); fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
const puppeteerInstance = await openBrowser('chrome', { browserExecutable, logLevel: 'error' });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || 'Journalyst', puppeteerInstance, logLevel: 'error' });
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({ composition, serveUrl, output, frame, puppeteerInstance, imageFormat: 'png', logLevel: 'error', onBrowserLog: (l) => { if (l.text.startsWith('DBG')) console.log(l.text); } });
  console.log('ok', output);
}
await puppeteerInstance.close({ silent: true });
