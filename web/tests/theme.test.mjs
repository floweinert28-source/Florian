import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const T = require('../js/theme.js').Theme;

const ratio = (a, b) => { const x = T.lum(a), y = T.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test('Standardfarben: hell abgedunkelt, dunkel mit hellerem Break-even', () => {
  assert.deepEqual(T.DEFAULTS.dark, { accent: '#34f58a', profit: '#34f58a', loss: '#ff5c5c', be: '#9a8cf8' });
  assert.deepEqual(T.DEFAULTS.light, { accent: '#077a41', profit: '#077a41', loss: '#c62e2e', be: '#5f4fcf' });
  for (const h of Object.values(T.DEFAULTS.light)) assert.ok(ratio(h, '#ffffff') >= 4.5, `${h} auf Weiß`);
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
