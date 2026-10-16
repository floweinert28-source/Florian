import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const T = require('../js/theme.js').Theme;

const ratio = (a, b) => { const x = T.lum(a), y = T.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test('Standardfarben: hell abgedunkelt, dunkel mit hellerem Break-even', () => {
  assert.deepEqual(T.DEFAULTS.dark, { accent: '#ede6da', profit: '#4cb782', loss: '#eb5757', be: '#9a8cf8' });
  assert.deepEqual(T.DEFAULTS.light, { accent: '#1c1a17', profit: '#16a34a', loss: '#ef4444', be: '#5f4fcf' });
  assert.equal(T.forLight('#ede6da'), '#1c1a17'); /* Elfenbein im hellen Design: Fast-Schwarz */
  assert.equal(T.inkFor('#ede6da'), '#04140a');
  /* Akzent und Break-even mit 4,5:1; Gewinn und Verlust auf Wunsch heller (frischeres Grün/Rot), mindestens 3:1 wie für große Zahlen und Grafik */
  for (const [k, h] of Object.entries(T.DEFAULTS.light)) assert.ok(ratio(h, '#fcfcfb') >= (k === 'profit' || k === 'loss' ? 3 : 4.5), `${k} ${h} auf Fast-Weiß`);
});

test('forLight: eigene Farben erreichen auf Weiß mindestens 4,5:1, dunkle bleiben unverändert', () => {
  const all = [...T.PRESETS_ACCENT.map(a => a[1]), ...T.PRESETS_PAIR.flatMap(p => [p[1], p[2]]), '#ffffff', '#ffff00'];
  for (const h of all) { const x = T.forLight(h); assert.ok(T.lum(x) <= 0.18, `${h} → ${x}`); assert.ok(ratio(x, '#fcfcfb') >= 4.5, `${h} → ${x}`); }
  assert.equal(T.forLight('#077a41'), '#077a41');
  assert.equal(T.forLight('#c62e2e'), '#c62e2e');
});

test('inkFor: Schrift auf Farbfläche nach dem höheren Kontrast', () => {
  assert.equal(T.inkFor('#34f58a'), '#04140a');
  assert.equal(T.inkFor('#077a41'), '#fcfcfb'); /* fast Weiß statt reinem Weiß */
  assert.equal(T.inkFor('#facc15'), '#04140a');
  for (const h of T.PRESETS_ACCENT.map(a => a[1])) { const ink = T.inkFor(h); const other = ink === '#fcfcfb' ? '#04140a' : '#fcfcfb'; assert.ok(ratio(h, ink) >= ratio(h, other), h); }
});
test('Design-Tokens: kein reines Weiß oder Schwarz, kleine Gewinn-/Verlust-Schrift im hellen Design mit 4,5 : 1', () => {
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../css/tokens.css'), 'utf8');
  assert.ok(!/#fff\b|#ffffff\b|#000\b|#000000\b/i.test(css), 'tokens.css ohne #fff/#000');
  const light = css.slice(css.indexOf(':root[data-theme="light"]'));
  const val = k => (new RegExp(`--${k}: (#[0-9a-f]{6})`, 'i').exec(light) || [])[1];
  for (const k of ['text', 'text-2', 'muted', 'profit-ink', 'loss-ink']) assert.ok(ratio(val(k), val('surface')) >= 4.5, `${k} ${val(k)} auf ${val('surface')}`);
  for (const k of ['profit', 'loss']) assert.ok(ratio(val(k), val('surface')) >= 3, `${k} groß ${val(k)}`);
});
