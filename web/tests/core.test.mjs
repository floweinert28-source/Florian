import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../js/core.js');
globalThis.Core = C;
const Sample = require('../js/sample.js');

const mk = (o = {}) => Object.assign({ id: 'x', symbol: 'DAX', direction: 1, openedAt: '2026-03-02T09:00:00', closedAt: '2026-03-02T10:00:00', entryPrice: 100, exitPrice: 110, quantity: 1, multiplier: 1, fees: 0, plannedEntry: 100, plannedStop: 95, plannedTarget: 115, mistakes: [], emotions: [], rulesBroken: [] }, o);

test('derive: P&L, Risiko, R und Status', () => {
  const d = C.derive(mk());
  assert.equal(d.pnl, 10); assert.equal(d.risk, 5); assert.equal(d.r, 2); assert.equal(d.status, 'win'); assert.equal(d.plannedR, 3); assert.equal(d.holdingMin, 60);
  const s = C.derive(mk({ direction: -1, exitPrice: 104, plannedStop: 105, fees: 1 }));
  assert.equal(s.pnl, -5); assert.equal(s.status, 'loss'); assert.equal(s.r, -1);
  const o = C.derive(mk({ closedAt: null, exitPrice: null })); assert.equal(o.status, 'open'); assert.equal(o.closed, false);
  const ov = C.derive(mk({ pnlOverride: 42 })); assert.equal(ov.pnl, 42);
});

test('summary: Kennzahlen', () => {
  const list = C.deriveAll([mk({ exitPrice: 110 }), mk({ exitPrice: 95 }), mk({ exitPrice: 120 }), mk({ exitPrice: 100 })]);
  const s = C.summary(list);
  assert.equal(s.n, 4); assert.equal(s.wins, 2); assert.equal(s.losses, 1); assert.equal(s.be, 1); assert.equal(s.total, 25); assert.equal(s.pf, 6); assert.equal(s.winRate, 0.5);
  assert.equal(s.avgWin, 15); assert.equal(s.avgLoss, -5); assert.equal(s.payoff, 3); assert.equal(s.maxDD, 5);
});

test('discipline: Gewichte und Abzüge', () => {
  assert.equal(C.discipline(C.derive(mk())).score, 100);
  assert.equal(C.discipline(C.derive(mk({ mistakes: ['FOMO'] }))).score, 80);
  assert.equal(C.discipline(C.derive(mk({ rulesBroken: ['x'] }))).score, 90);
  assert.equal(C.discipline(C.derive(mk({ plannedEntry: null, plannedStop: null, plannedTarget: null }))).score, 30);
  const movedStop = C.discipline(C.derive(mk({ exitPrice: 90 }))); assert.ok(movedStop.score < 100 && movedStop.score > 50);
});

test('mistakeReport: Kosten', () => {
  const list = C.deriveAll([mk({ exitPrice: 110 }), mk({ exitPrice: 90, mistakes: ['Revenge-Trade'] })]);
  const mr = C.mistakeReport(list); assert.equal(mr.actual, 0); assert.equal(mr.compliant, 10); assert.equal(mr.cost, -10); assert.equal(mr.items[0].name, 'Revenge-Trade');
});

test('tiltCheck: Verlustserie, Größe, Revenge, Limit', () => {
  const t = [mk({ id: 'a', openedAt: '2026-03-02T09:00:00', closedAt: '2026-03-02T09:10:00', exitPrice: 95 }), mk({ id: 'b', openedAt: '2026-03-02T09:12:00', closedAt: '2026-03-02T09:20:00', exitPrice: 95, quantity: 3 }), mk({ id: 'c', openedAt: '2026-03-02T09:25:00', closedAt: '2026-03-02T09:40:00', exitPrice: 95 })];
  const res = C.tiltCheck(C.deriveAll(t), { account: 1000, dailyLossLimitPct: 0.02 });
  const kinds = res.warnings.map(w => w.kind);
  assert.ok(kinds.includes('lossStreak')); assert.ok(kinds.includes('sizeEscalation')); assert.ok(kinds.includes('revenge')); assert.ok(kinds.includes('dailyLoss'));
  assert.equal(C.tiltCheck(C.deriveAll([mk()]), { account: 10000 }).warnings.length, 0);
});

test('edge: Urteil und rollierender Schnitt', () => {
  const wins = Array.from({ length: 40 }, (_, i) => mk({ id: 'w' + i, exitPrice: i % 3 === 0 ? 95 : 110, closedAt: `2026-03-${String(2 + (i % 20)).padStart(2, '0')}T10:${String(i % 60).padStart(2, '0')}:00` }));
  const e = C.edge(C.deriveAll(wins)); assert.equal(e.verdict, 'positive'); assert.ok(e.rolling.length === 21); assert.ok(e.low > 0);
  assert.equal(C.edge(C.deriveAll(wins.slice(0, 5))).verdict, 'insufficient');
});

test('monteCarlo: deterministisch mit Seed', () => {
  const list = C.deriveAll(Array.from({ length: 30 }, (_, i) => mk({ id: 'm' + i, exitPrice: i % 2 ? 108 : 96 })));
  const a = C.monteCarlo(list, { account: 10000, seed: 3, runs: 200 }), b = C.monteCarlo(list, { account: 10000, seed: 3, runs: 200 });
  assert.equal(a.final.p50, b.final.p50); assert.ok(a.ruin >= 0 && a.ruin <= 1); assert.equal(a.curves.length, 25);
  assert.equal(C.monteCarlo(list.slice(0, 5)), null);
});

test('traderScore: Achsen und Bereich', () => {
  const g = Sample.generate({ now: '2026-09-24T12:00:00', seed: 12 }); const list = C.deriveAll(g.trades);
  const sc = C.traderScore(list, 25000); assert.equal(sc.axes.length, 6); assert.ok(sc.overall > 0 && sc.overall <= 100);
  assert.equal(C.traderScore([], 25000).overall, 0);
});

test('parseCSV: Trennzeichen, Anführungszeichen, CRLF', () => {
  const p = C.parseCSV('Symbol;Richtung;Datum;"Einstieg";Ausstieg\r\nDAX;Long;02.03.2026 09:00;"18.250,5";18.300,0\r\nNQ;Short;03.03.2026 10:15;19.400;19.350\r\n');
  assert.equal(p.delimiter, ';'); assert.deepEqual(p.headers, ['Symbol', 'Richtung', 'Datum', 'Einstieg', 'Ausstieg']); assert.equal(p.rows.length, 2); assert.equal(p.rows[0].Einstieg, '18.250,5');
  const q = C.parseCSV('a,b\n"x, y","he said ""hi"""\n'); assert.equal(q.rows[0].a, 'x, y'); assert.equal(q.rows[0].b, 'he said "hi"');
});

test('guessMapping und mapRows', () => {
  const p = C.parseCSV('Symbol;Side;Open Date;Close Date;Entry Price;Exit Price;Qty;Commission;Stop\nDAX;Sell;02.03.2026 09:00;02.03.2026 09:30;18250,5;18230,0;2;2,4;18270\nEURUSD;Buy;03.03.2026;;1,0850;;1;0;1,0820\n');
  const m = C.guessMapping(p.headers);
  assert.equal(m.symbol, 'Symbol'); assert.equal(m.direction, 'Side'); assert.equal(m.openedAt, 'Open Date'); assert.equal(m.closedAt, 'Close Date'); assert.equal(m.entryPrice, 'Entry Price'); assert.equal(m.exitPrice, 'Exit Price'); assert.equal(m.quantity, 'Qty'); assert.equal(m.fees, 'Commission'); assert.equal(m.plannedStop, 'Stop');
  const r = C.mapRows(p.rows, m); assert.equal(r.errors.length, 0); assert.equal(r.trades.length, 2);
  const d = C.derive(r.trades[0]); assert.equal(d.direction, -1); assert.equal(d.pnl, (18250.5 - 18230) * 2 - 2.4); assert.equal(d.status, 'win');
  assert.equal(C.derive(r.trades[1]).status, 'open');
});

test('parseNumber und parseDate', () => {
  assert.equal(C.parseNumber('1.234,56'), 1234.56); assert.equal(C.parseNumber('1,234.56'), 1234.56); assert.equal(C.parseNumber('−12,5'), -12.5); assert.equal(C.parseNumber('(3.00)'), -3); assert.equal(C.parseNumber('€ 1.000'), 1); assert.equal(C.parseNumber('1.000.000'), 1000000); assert.equal(C.parseNumber('abc'), null);
  assert.equal(C.parseDate('2026-03-02T09:30:00').getHours(), 9); assert.equal(C.parseDate('02.03.2026 09:30').getMonth(), 2); assert.equal(C.parseDate('03/02/2026', false).getMonth(), 2); assert.equal(C.parseDate('02/03/2026', true).getMonth(), 2); assert.equal(C.parseDate('2026/03/02 14:05').getMinutes(), 5); assert.equal(C.parseDate('nope'), null);
});

test('sentiment: deutsch und englisch', () => {
  assert.equal(C.sentiment('Ruhig und fokussiert, sauber nach Plan').label, 'positiv'); assert.equal(C.sentiment('Wütend, wollte Rache, total gestresst').label, 'negativ'); assert.equal(C.sentiment('Trade eröffnet').label, 'neutral');
});

test('Beispieldaten: konsistent und markiert', () => {
  const g = Sample.generate({ now: '2026-09-24T12:00:00', seed: 12 });
  assert.ok(g.trades.length > 100); assert.ok(g.trades.every(t => t.sample)); assert.ok(Object.values(g.days).every(d => d.sample)); const s = C.summary(C.deriveAll(g.trades)); assert.ok(s.total > 0); assert.ok(C.mistakeReport(C.deriveAll(g.trades)).cost < 0);
  const g2 = Sample.generate({ now: '2026-09-24T12:00:00', seed: 12 }); assert.deepEqual(g2.trades.map(t => t.exitPrice), g.trades.map(t => t.exitPrice));
});

test('calendarMonth und stats16', () => {
  const list = C.deriveAll([mk({ openedAt: '2026-03-02T09:00:00', closedAt: '2026-03-02T10:00:00' }), mk({ id: 'y', openedAt: '2026-03-10T09:00:00', closedAt: '2026-03-10T10:00:00', exitPrice: 90 })]);
  const weeks = C.calendarMonth(C.dailyAggregation(list), 2026, 2); assert.equal(weeks.length, 6); assert.equal(weeks[1].pnl, 10); assert.equal(weeks[2].pnl, -10);
  const st = C.stats16(list); assert.equal(st.items.length, 16); assert.equal(st.items.find(i => i.key === 'days').v, 2);
});
