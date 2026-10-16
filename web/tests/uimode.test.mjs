/* Ansicht Simple / Advanced: neue Nutzer starten in Simple, bestehende Daten ohne Angabe bleiben in Advanced */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const C = require('../js/core.js'); const P = require('../js/prop.js'); const Sh = require('../js/shadow.js'); const Rp = require('../js/replay.js'); const Sample = require('../js/sample.js'); const PropData = require('../js/propdata.js').PropData;
function makeStore(saved) {
  const mem = { v: saved == null ? null : JSON.stringify(saved) };
  globalThis.localStorage = { getItem: () => mem.v, setItem: (k, v) => { mem.v = v; }, removeItem: () => { mem.v = null; } };
  const sandbox = { Core: C, Shadow: Sh, Replay: Rp, Prop: P, PropData, Sample, console, setTimeout, clearTimeout };
  new Function('self', readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../js/store.js'), 'utf8'))(sandbox);
  return sandbox.Store;
}
test('neuer Nutzer (kein Speicher): Simple', () => { const S = makeStore(null); S.load(); assert.equal(S.settings.uiMode, 'simple'); });
test('bestehende Daten ohne uiMode: Advanced, sonst bleibt alles', () => { const S = makeStore({ settings: { theme: 'light', language: 'de' }, trades: [] }); S.load(); assert.equal(S.settings.uiMode, 'advanced'); assert.equal(S.settings.theme, 'light'); });
test('gespeicherte Wahl bleibt', () => { for (const m of ['simple', 'advanced']) { const S = makeStore({ settings: { uiMode: m }, trades: [] }); S.load(); assert.equal(S.settings.uiMode, m); } });
test('Beispielordner ohne Emoji: alte Namen werden umbenannt, eigene Ordner bleiben', () => {
  const S = makeStore({ settings: { language: 'de' }, trades: [], notes: [], folders: [
    { id: 'smpf-strategie', name: '📈 Strategie', sample: true }, { id: 'smpf-ideen', name: '💡 Ideen', sample: true }, { id: 'eigen', name: '🚀 Meins' }] });
  S.load(); const n = id => S.data.folders.find(f => f.id === id).name;
  assert.equal(n('smpf-strategie'), 'Strategie'); assert.equal(n('smpf-ideen'), 'Ideen'); assert.equal(n('eigen'), '🚀 Meins');
});
