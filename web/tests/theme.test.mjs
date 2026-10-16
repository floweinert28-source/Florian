import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const T = require('../js/theme.js').Theme;

const ratio = (a, b) => { const x = T.lum(a), y = T.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test('Standardfarben: hell abgedunkelt, dunkel mit hellerem Break-even', () => {
  assert.deepEqual(T.DEFAULTS.dark, { accent: '#ede6da', profit: '#4cb782', loss: '#eb5757', be: '#9a8cf8' });
  assert.deepEqual(T.DEFAULTS.light, { accent: '#22201c', profit: '#16a34a', loss: '#ef4444', be: '#5f4fcf' });
  assert.equal(T.forLight('#ede6da'), '#22201c'); /* Elfenbein im hellen Design: Grafit */
  assert.equal(T.inkFor('#ede6da'), '#04140a');
  /* Akzent und Break-even mit 4,5:1; Gewinn und Verlust auf Wunsch heller (frischeres Grün/Rot), mindestens 3:1 wie für große Zahlen und Grafik */
  for (const [k, h] of Object.entries(T.DEFAULTS.light)) assert.ok(ratio(h, '#ffffff') >= (k === 'profit' || k === 'loss' ? 3 : 4.5), `${k} ${h} auf Weiß`);
});

test('forLight: eigene Farben erreichen auf Weiß mindestens 4,5:1, dunkle bleiben unverändert', () => {
  const all = [...T.PRESETS_ACCENT.map(a => a[1]), ...T.PRESETS_PAIR.flatMap(p => [p[1], p[2]]), '#ffffff', '#ffff00'];
  for (const h of all) { const x = T.forLight(h); assert.ok(T.lum(x) <= 0.18, `${h} → ${x}`); assert.ok(ratio(x, '#ffffff') >= 4.5, `${h} → ${x}`); }
  assert.equal(T.forLight('#077a41'), '#077a41');
  assert.equal(T.forLight('#c62e2e'), '#c62e2e');
});

test('inkFor: Schrift auf Farbfläche nach dem höheren Kontrast', () => {
  assert.equal(T.inkFor('#34f58a'), '#04140a');
  assert.equal(T.inkFor('#077a41'), '#ffffff');
  assert.equal(T.inkFor('#facc15'), '#04140a');
  for (const h of T.PRESETS_ACCENT.map(a => a[1])) { const ink = T.inkFor(h); const other = ink === '#ffffff' ? '#04140a' : '#ffffff'; assert.ok(ratio(h, ink) >= ratio(h, other), h); }
});
