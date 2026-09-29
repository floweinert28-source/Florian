import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../js/core.js');
const D = require('../js/certdata.js');

const mk = (o) => { const t = Object.assign({ id: 'x', symbol: 'AAPL', direction: 1, entryPrice: 100, exitPrice: 101, quantity: 10, fees: 0, open: '2026-09-21T10:00', close: '2026-09-21T11:00', stopPrice: 99 }, o); t.openedAt = t.open; t.closedAt = t.close; t.plannedStop = t.stopPrice; return t; };
const trades = C.deriveAll([
  mk({ id: 'a', open: '2026-09-21T10:00', close: '2026-09-21T11:00', exitPrice: 102 }),            /* Mo +20, 2R */
  mk({ id: 'b', symbol: 'TSLA', open: '2026-09-22T10:00', close: '2026-09-22T11:00', exitPrice: 99 }), /* Di -10, -1R */
  mk({ id: 'c', open: '2026-09-24T10:00', close: '2026-09-24T11:00', exitPrice: 103 }),            /* Do +30, 3R */
  mk({ id: 'd', open: '2026-09-02T10:00', close: '2026-09-02T11:00', exitPrice: 101 }),            /* früher im Monat +10 */
  mk({ id: 'e', open: '2026-09-25T10:00', close: null, exitPrice: null }),                          /* offen */
]);

test('Zeiträume: Tag, Woche, Monat, Stats', () => {
  const d = D.period('day', '2026-09-24'); assert.equal(C.dayKey(d.from), '2026-09-24'); assert.equal(C.dayKey(d.to), '2026-09-24');
  const w = D.period('week', '2026-09-24'); assert.equal(C.dayKey(w.from), '2026-09-21'); assert.equal(C.dayKey(w.to), '2026-09-27'); assert.match(w.label, /^KW 39/);
  const m = D.period('month', '2026-09'); assert.equal(C.dayKey(m.from), '2026-09-01'); assert.equal(C.dayKey(m.to), '2026-09-30');
  const s = D.period('stats', null); assert.equal(s.from, null); assert.equal(s.label, 'Gesamter Zeitraum');
  assert.equal(D.shift('day', '2026-09-30', 1), '2026-10-01'); assert.equal(D.shift('week', '2026-09-24', -1), '2026-09-14'); assert.equal(D.shift('month', '2026-12', 1), '2027-01');
});

test('Auswahl nimmt nur geschlossene Trades im Zeitraum', () => {
  const w = D.period('week', '2026-09-24'); const list = D.select(trades, w);
  assert.deepEqual(list.map(t => t.id), ['a', 'b', 'c']);
  assert.equal(D.select(trades, D.period('day', '2026-09-25')).length, 0);
  assert.equal(D.select(trades, D.period('stats', null)).length, 4);
});

test('Kennzahlen Tag/Woche/Monat/Stats', () => {
  const dp = D.period('day', '2026-09-21'); const day = D.compute('day', D.select(trades, dp), dp);
  assert.equal(day.n, 1); assert.equal(Math.round(day.pnl), 20); assert.equal(day.winRate, 1); assert.equal(day.avgR, 2); assert.equal(day.bestTrade.symbol, 'AAPL'); assert.deepEqual(day.symbols, ['AAPL']);
  const wp = D.period('week', '2026-09-24'); const week = D.compute('week', D.select(trades, wp), wp);
  assert.equal(week.n, 3); assert.equal(Math.round(week.pnl), 40); assert.equal(week.tradingDays, 3); assert.equal(week.weekBars.length, 5);
  assert.deepEqual(week.weekBars.map(b => b.pnl == null ? null : Math.round(b.pnl)), [20, -10, null, 30, null]); assert.equal(week.bestDay.key, '2026-09-24');
  const mp = D.period('month', '2026-09'); const month = D.compute('month', D.select(trades, mp), mp);
  assert.equal(month.greenDays, 3); assert.equal(month.redDays, 1); assert.equal(month.monthCells.length % 7, 0); assert.equal(month.monthCells.filter(Boolean).length, 30);
  assert.equal(month.monthCells.filter(Boolean).find(c => c.day === 2).pnl > 0, true); assert.equal(month.monthCells.filter(Boolean).find(c => c.day === 3).pnl, null);
  const sp = D.period('stats', null); const st = D.compute('stats', D.select(trades, sp), sp);
  assert.equal(st.n, 4); assert.equal(st.maxWinStreak, 2); assert.equal(st.worstDay.key, '2026-09-22'); assert.equal(st.pf, 6); assert.equal(st.avgLoss, -10);
});

test('Nicht berechenbare Werte sind null (kein NaN)', () => {
  const noRisk = C.deriveAll([mk({ id: 'z', stopPrice: null })]); const p = D.period('day', '2026-09-21'); const m = D.compute('day', D.select(noRisk, p), p);
  assert.equal(m.avgR, null); assert.equal(m.rSum, null); assert.equal(m.bestTrade.r, null);
  const empty = D.compute('stats', [], D.period('stats', null)); assert.equal(empty.n, 0); assert.equal(empty.winRate, null); assert.equal(empty.pf, null); assert.equal(empty.maxDD, null); assert.equal(empty.bestTrade, null);
  for (const v of Object.values(m)) if (typeof v === 'number') assert.ok(!Number.isNaN(v));
});

test('Zertifikatsnummer: Format und deterministisch', () => {
  const p = D.period('week', '2026-09-24'); const m = D.compute('week', D.select(trades, p), p); const d = new Date(2026, 8, 29);
  const a = D.certNo('week', p, m, d), b = D.certNo('week', p, m, d);
  assert.match(a, /^#TJ-20260929-[0-9A-Z]{4}$/); assert.equal(a, b);
  assert.notEqual(a, D.certNo('week', p, Object.assign({}, m, { pnl: m.pnl + 1 }), d));
});
