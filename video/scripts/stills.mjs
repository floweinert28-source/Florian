// Rendert einzelne Frames als PNG zur Sichtkontrolle: node scripts/stills.mjs 120 230 400
import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const browserExecutable = process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const frames = process.argv.slice(2).map(Number);
const outDir = path.join(root, 'out', 'stills'); fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
const composition = await selectComposition({ serveUrl, id: 'Journalyst', browserExecutable, logLevel: 'error' });
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, imageFormat: 'png', logLevel: 'error' });
  console.log('ok', output);
}
