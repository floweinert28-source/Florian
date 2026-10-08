// Renders key-frame stills for visual QA with a single bundle.
// Usage: node scripts/stills.mjs S1-Intro:0,30,90 S2-KPIs:60 [--scale=0.5]
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const args = process.argv.slice(2);
const scale = Number(args.find((a) => a.startsWith('--scale='))?.split('=')[1] ?? 1);
const jobs = args
  .filter((a) => !a.startsWith('--'))
  .flatMap((a) => {
    const [id, frames] = a.split(':');
    return frames.split(',').map((f) => ({id, frame: Number(f)}));
  });

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
for (const {id, frame} of jobs) {
  const composition = await selectComposition({serveUrl, id});
  const output = `stills/${id}-${String(frame).padStart(4, '0')}.png`;
  await renderStill({composition, serveUrl, frame, output, scale, overwrite: true});
  console.log(output);
}
