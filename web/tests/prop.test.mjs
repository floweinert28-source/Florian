import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../js/core.js');
const P = require('../js/prop.js');

/* Fixture: geschlossener Trade mit festem P&L über pnlOverride; Zeiten immer als UTC-ISO, damit die Tests unabhängig von der System-Zeitzone sind */
const mk = (o = {}) => Object.assign({ id: 'x', symbol: 'NQ', direction: 1, openedAt: '2026-03-02T14:00:00Z', closedAt: '2026-03-02T14:30:00Z', entryPrice: 100, exitPrice: 110, quantity: 1, multiplier: 1, fees: 0, plannedStop: 95 }, o);
/* tr(id, Schluss als UTC-ISO, pnl, extra) – Eröffnung 30 Minuten vor Schluss */
const tr = (id, close, pnl, extra) => mk(Object.assign({ id, openedAt: new Date(new Date(close).getTime() - 30 * 60000).toISOString(), closedAt: close, pnlOverride: pnl }, extra));
const NY = 'America/New_York', BERLIN = 'Europe/Berlin';
const NOW = '2026-03-20T12:00:00Z';
/* Konto 50.000, Handelstage standardmäßig 00:00 UTC (acc.tz), damit der Tages-Key dem UTC-Datum des Schlusses entspricht */
const acc = (rules = {}, o = {}) => Object.assign({ id: 'acc1', size: 50000, startBalance: 50000, startedAt: '2026-03-01T00:00:00Z', phase: 'challenge1', status: 'active', tz: 'UTC', rules: Object.assign({ dailyLoss: null, drawdown: null, profitTarget: null, minTradingDays: null, maxContracts: null, consistency: null }, rules) }, o);
const run = (rules, trades, opts = {}, o) => P.evaluate(acc(rules, o), C.deriveAll(trades), Object.assign({ now: NOW }, opts));
const dd = (type, value, extra) => ({ drawdown: Object.assign({ value, mode: 'abs', type, lockAt: null, basis: 'intraday' }, extra) });
const dl = (value, extra) => ({ dailyLoss: Object.assign({ value, mode: 'abs', basis: 'balance', resetTime: '00:00', tz: 'UTC' }, extra) });
const rule = (ev, r) => ev.breaches.filter(b => b.rule === r);
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

/* ---------- Handelstag ---------- */
test('dayKey: Tageswechsel um 17:00 New York – 16:59 und 17:01 sind verschiedene Handelstage', () => {
  /* 2.3.2026 ist noch Winterzeit (EST = UTC−5): 16:59 NY = 21:59Z, 17:01 NY = 22:01Z */
  assert.equal(P.dayKey('2026-03-02T21:59:00Z', '17:00', NY), '2026-03-01');
  assert.equal(P.dayKey('2026-03-02T22:01:00Z', '17:00', NY), '2026-03-02');
  assert.equal(P.dayKey('2026-03-02T22:00:00Z', '17:00', NY), '2026-03-02'); /* genau 17:00 gehört zum neuen Handelstag */
  assert.equal(P.dayKey(new Date('2026-03-03T03:00:00Z'), '17:00', NY), '2026-03-02'); /* 22:00 NY → noch der Handelstag vom 2.3. */
  /* Sommerzeit (EDT = UTC−4): 16:59 NY = 20:59Z, 17:01 NY = 21:01Z */
  assert.equal(P.dayKey('2026-06-10T20:59:00Z', '17:00', NY), '2026-06-09');
  assert.equal(P.dayKey('2026-06-10T21:01:00Z', '17:00', NY), '2026-06-10');
});

test('dayKey: 00:00 Europe/Berlin, Monatswechsel, Fallbacks', () => {
  assert.equal(P.dayKey('2026-03-02T22:30:00Z', '00:00', BERLIN), '2026-03-02'); /* 23:30 Berlin */
  assert.equal(P.dayKey('2026-03-02T23:30:00Z', '00:00', BERLIN), '2026-03-03'); /* 00:30 Berlin */
  assert.equal(P.dayKey('2026-03-31T22:30:00Z', '00:00', BERLIN), '2026-04-01'); /* Sommerzeit: 00:30 Berlin am 1.4. */
  assert.equal(P.dayKey('2026-04-01T00:30:00Z', '03:00', BERLIN), '2026-03-31'); /* 02:30 Berlin vor Reset 03:00 → Vortag, auch über den Monatswechsel */
  assert.equal(P.dayKey('2026-03-02T23:30:00Z', '', BERLIN), '2026-03-03'); /* leere resetTime = Mitternacht */
  assert.equal(P.dayKey('2026-03-02T23:30:00Z', '00:00', 'Nicht/Existent'), '2026-03-02'); /* ungültige Zeitzone → UTC */
  assert.equal(P.dayKey('kein Datum', '00:00', BERLIN), null);
  assert.equal(P.parseResetTime('17:00'), 1020); assert.equal(P.parseResetTime('x'), 0);
});

/* ---------- Daily Loss ---------- */
test('dailyLoss: erst Gewinn, dann Verlust am selben Tag – Tagesverlust ab Tagesbeginn-Balance', () => {
  const day = '2026-03-02T15:00:00Z', later = '2026-03-02T16:00:00Z', now = '2026-03-02T18:00:00Z';
  const a = run(dl(1000), [tr('a', day, 500), tr('b', later, -1400)], { now });
  assert.equal(a.status, 'ok'); assert.equal(a.dailyLoss.breached, false); near(a.dailyLoss.used, 900); near(a.dailyLoss.remaining, 100); assert.equal(a.dailyLoss.dayKey, '2026-03-02'); assert.equal(a.dailyLoss.limit, 1000);
  const b = run(dl(1000), [tr('a', day, 500), tr('b', later, -1500)], { now }); /* Tagesverlust genau 1000 → Breach (≥ Limit) */
  assert.equal(b.status, 'breached'); assert.equal(b.dailyLoss.breached, true); assert.equal(rule(b, 'dailyLoss').length, 1); assert.equal(rule(b, 'dailyLoss')[0].tradeId, 'b'); assert.equal(rule(b, 'dailyLoss')[0].at, new Date(later).toISOString()); assert.ok(rule(b, 'dailyLoss')[0].detail.includes('1000'));
  const c = run(dl(1000), [tr('a', day, 500), tr('b', later, -1200)], { now });
  assert.equal(c.status, 'ok'); near(c.dailyLoss.used, 700); near(c.dailyLoss.remaining, 300);
  /* Gewinn erhöht den Spielraum: nach +500 dürfen noch 1500 verloren werden */
  const d = run(dl(1000), [tr('a', day, 500)], { now }); near(d.dailyLoss.remaining, 1500); assert.equal(d.dailyLoss.used, 0);
  /* Verlust ohne vorherigen Gewinn: −999 ok, −1000 Breach */
  assert.equal(run(dl(1000), [tr('a', day, -999)], { now }).status, 'ok'); assert.equal(run(dl(1000), [tr('a', day, -1000)], { now }).status, 'breached');
});

test('dailyLoss: Reset am Tageswechsel (17:00 New York) – zwei Verluste auf verschiedenen Handelstagen addieren sich nicht', () => {
  const rules = dl(1000, { resetTime: '17:00', tz: NY });
  /* 16:59 NY und 17:01 NY am 2.3. (EST): 21:59Z und 22:01Z */
  const split = run(rules, [tr('a', '2026-03-02T21:59:00Z', -700), tr('b', '2026-03-02T22:01:00Z', -700)]);
  assert.equal(split.status, 'ok'); assert.equal(split.days.length, 2); assert.deepEqual(split.days.map(d => d.key), ['2026-03-01', '2026-03-02']);
  assert.deepEqual(split.days.map(d => [d.pnl, d.n, d.startBalance, d.endBalance]), [[-700, 1, 50000, 49300], [-700, 1, 49300, 48600]]);
  const same = run(rules, [tr('a', '2026-03-02T21:30:00Z', -700), tr('b', '2026-03-02T21:59:00Z', -700)]);
  assert.equal(same.status, 'breached'); assert.equal(same.days.length, 1); assert.equal(same.days[0].key, '2026-03-01');
  /* 00:00 Europe/Berlin: 23:30 und 00:30 Berlin liegen auf verschiedenen Handelstagen */
  const berlin = run(dl(1000, { resetTime: '00:00', tz: BERLIN }), [tr('a', '2026-03-02T22:30:00Z', -700), tr('b', '2026-03-02T23:30:00Z', -700)]);
  assert.equal(berlin.status, 'ok'); assert.deepEqual(berlin.days.map(d => d.key), ['2026-03-02', '2026-03-03']);
  /* ohne dailyLoss-Regel bestimmt account.tz die Handelstage (00:00) */
  const noRule = run({}, [tr('a', '2026-03-02T22:30:00Z', 100), tr('b', '2026-03-02T23:30:00Z', 100)], {}, { tz: BERLIN });
  assert.deepEqual(noRule.days.map(d => d.key), ['2026-03-02', '2026-03-03']); assert.equal(noRule.dailyLoss, null);
});

/* ---------- Drawdown ---------- */
test('drawdown static: Boden = Start − Limit, Breach genau an der Grenze', () => {
  const exact = run(dd('static', 2000), [tr('a', '2026-03-02T15:00:00Z', -2000)]);
  assert.equal(exact.status, 'breached'); assert.equal(exact.drawdown.type, 'static'); assert.equal(exact.drawdown.floor, 48000); assert.equal(exact.drawdown.limit, 2000); assert.equal(exact.drawdown.remaining, 0); assert.equal(exact.drawdown.breached, true); assert.equal(exact.drawdown.locked, false);
  assert.equal(rule(exact, 'drawdown').length, 1); assert.equal(rule(exact, 'drawdown')[0].tradeId, 'a');
  const above = run(dd('static', 2000), [tr('a', '2026-03-02T15:00:00Z', -1999.99)]);
  assert.equal(above.status, 'ok'); near(above.drawdown.remaining, 0.01); assert.equal(above.drawdown.breached, false);
  /* Gewinne heben den statischen Boden nicht an */
  const up = run(dd('static', 2000), [tr('a', '2026-03-02T15:00:00Z', 5000), tr('b', '2026-03-03T15:00:00Z', -6000)]);
  assert.equal(up.drawdown.floor, 48000); assert.equal(up.drawdown.peak, 55000); assert.equal(up.status, 'ok'); assert.equal(up.balance, 49000); near(up.drawdown.remaining, 1000);
});

test('drawdown trailing_intraday: Boden steigt nach Gewinn, Breach danach obwohl über dem Startboden', () => {
  const ev = run(dd('trailing_intraday', 2000), [tr('a', '2026-03-02T15:00:00Z', 1500), tr('b', '2026-03-02T16:00:00Z', -2000)]);
  assert.equal(ev.status, 'breached'); assert.equal(ev.balance, 49500); assert.equal(ev.drawdown.peak, 51500); assert.equal(ev.drawdown.floor, 49500); assert.ok(ev.balance > 48000); assert.equal(rule(ev, 'drawdown')[0].tradeId, 'b');
  /* Verlust zuerst hebt den Boden nicht; spätere Erholung hebt ihn nach jedem Close */
  const seq = run(dd('trailing_intraday', 2000), [tr('a', '2026-03-02T15:00:00Z', -1000), tr('b', '2026-03-02T16:00:00Z', 3000), tr('c', '2026-03-02T17:00:00Z', -1999)]);
  assert.equal(seq.status, 'ok'); assert.equal(seq.drawdown.peak, 52000); assert.equal(seq.drawdown.floor, 50000); near(seq.drawdown.remaining, 1);
  const afterOnlyLoss = run(dd('trailing_intraday', 2000), [tr('a', '2026-03-02T15:00:00Z', -1500)]);
  assert.equal(afterOnlyLoss.drawdown.peak, 50000); assert.equal(afterOnlyLoss.drawdown.floor, 48000); assert.equal(afterOnlyLoss.status, 'ok');
});

test('drawdown trailing_eod: Intraday-Hoch zählt erst nach dem Tageswechsel', () => {
  const day1 = [tr('a', '2026-03-02T15:00:00Z', 3000), tr('b', '2026-03-02T16:00:00Z', -2500)];
  /* intraday wäre das ein Breach (Boden 51000), eod nicht: Boden bleibt am Tag 48000 */
  assert.equal(run(dd('trailing_intraday', 2000), day1).status, 'breached');
  const sameDay = run(dd('trailing_eod', 2000), day1, { now: '2026-03-02T18:00:00Z' });
  assert.equal(sameDay.status, 'ok'); assert.equal(sameDay.drawdown.peak, 50000); assert.equal(sameDay.drawdown.floor, 48000); near(sameDay.drawdown.remaining, 2500);
  /* nach Tagesende: Tages-Endbalance 50500 wird Peak, Boden 48500 */
  const nextDay = run(dd('trailing_eod', 2000), day1, { now: '2026-03-03T12:00:00Z' });
  assert.equal(nextDay.status, 'ok'); assert.equal(nextDay.drawdown.peak, 50500); assert.equal(nextDay.drawdown.floor, 48500);
  /* am Folgetag reicht −2500 für den Breach (48000 ≤ 48500), obwohl der statische Boden 48000 nur erreicht wäre */
  const breach = run(dd('trailing_eod', 2000), [...day1, tr('c', '2026-03-03T15:00:00Z', -2500)]);
  assert.equal(breach.status, 'breached'); assert.equal(rule(breach, 'drawdown')[0].tradeId, 'c'); assert.equal(breach.drawdown.remaining, 0);
  /* Peak ist die HÖCHSTE Endbalance: ein schlechterer Folgetag senkt ihn nicht */
  const keep = run(dd('trailing_eod', 2000), [...day1, tr('c', '2026-03-03T15:00:00Z', -1000)]);
  assert.equal(keep.drawdown.peak, 50500); assert.equal(keep.drawdown.floor, 48500); assert.equal(keep.status, 'ok');
});

test('drawdown trailing_lock: Boden friert bei Start + lockAt ein', () => {
  const lock = dd('trailing_lock', 2500, { lockAt: 100 });
  const before = run(lock, [tr('a', '2026-03-02T15:00:00Z', 1000)]);
  assert.equal(before.drawdown.locked, false); assert.equal(before.drawdown.floor, 48500); assert.equal(before.drawdown.type, 'trailing_lock');
  /* Peak 53000 → roher Boden 50500 ≥ 50100 → eingefroren bei 50100; −2800 wäre bei reinem Trailing ein Breach */
  const frozen = run(lock, [tr('a', '2026-03-02T15:00:00Z', 3000), tr('b', '2026-03-02T16:00:00Z', -2800)]);
  assert.equal(frozen.status, 'ok'); assert.equal(frozen.drawdown.locked, true); assert.equal(frozen.drawdown.floor, 50100); assert.equal(frozen.balance, 50200); near(frozen.drawdown.remaining, 100);
  assert.equal(run(dd('trailing_intraday', 2500), [tr('a', '2026-03-02T15:00:00Z', 3000), tr('b', '2026-03-02T16:00:00Z', -2800)]).status, 'breached');
  const breach = run(lock, [tr('a', '2026-03-02T15:00:00Z', 3000), tr('b', '2026-03-02T16:00:00Z', -2800), tr('c', '2026-03-03T15:00:00Z', -200)]);
  assert.equal(breach.status, 'breached'); assert.equal(breach.drawdown.floor, 50100); assert.equal(rule(breach, 'drawdown')[0].tradeId, 'c');
  /* weitere Gewinne heben den eingefrorenen Boden nicht mehr an */
  const more = run(lock, [tr('a', '2026-03-02T15:00:00Z', 3000), tr('b', '2026-03-03T15:00:00Z', 10000)]);
  assert.equal(more.drawdown.floor, 50100); assert.equal(more.drawdown.locked, true);
  /* basis eod: Peak erst aus der Tages-Endbalance → Lock erst nach dem Tag, an dem die Endbalance 52600 erreicht */
  const eod = dd('trailing_lock', 2500, { lockAt: 100, basis: 'eod' });
  const e1 = run(eod, [tr('a', '2026-03-02T15:00:00Z', 3000), tr('b', '2026-03-02T16:00:00Z', -2800)]);
  assert.equal(e1.status, 'ok'); assert.equal(e1.drawdown.locked, false); assert.equal(e1.drawdown.peak, 50200); assert.equal(e1.drawdown.floor, 47700); assert.equal(e1.drawdown.basis, 'eod');
  const e2 = run(eod, [tr('a', '2026-03-02T15:00:00Z', 3000), tr('b', '2026-03-02T16:00:00Z', -2800), tr('c', '2026-03-03T15:00:00Z', 2500)]);
  assert.equal(e2.drawdown.locked, true); assert.equal(e2.drawdown.floor, 50100); assert.equal(e2.drawdown.peak, 52700);
});

test('pct-Modus: Limits relativ zur Startbalance', () => {
  const rules = { drawdown: { value: 4, mode: 'pct', type: 'static' }, dailyLoss: { value: 2, mode: 'pct', basis: 'balance', resetTime: '00:00', tz: 'UTC' }, profitTarget: { value: 6, mode: 'pct' } };
  const ev = run(rules, [tr('a', '2026-03-02T15:00:00Z', 1500)], {}, { size: 100000, startBalance: 100000 });
  assert.equal(ev.drawdown.limit, 4000); assert.equal(ev.drawdown.floor, 96000); assert.equal(ev.dailyLoss.limit, 2000); assert.equal(ev.target.value, 6000); assert.equal(ev.balance, 101500);
  assert.equal(P.limitOf({ value: 5, mode: 'pct' }, 50000), 2500); assert.equal(P.limitOf({ value: 2500, mode: 'abs' }, 50000), 2500); assert.equal(P.limitOf({ value: '', mode: 'abs' }, 50000), null); assert.equal(P.limitOf(null, 50000), null);
  /* pct-Breach: 4 % von 100.000 = 4000 */
  assert.equal(run({ drawdown: { value: 4, mode: 'pct', type: 'static' } }, [tr('a', '2026-03-02T15:00:00Z', -4000)], {}, { startBalance: 100000 }).status, 'breached');
  assert.equal(run({ drawdown: { value: 4, mode: 'pct', type: 'static' } }, [tr('a', '2026-03-02T15:00:00Z', -3999)], {}, { startBalance: 100000 }).status, 'ok');
});

/* ---------- Ziel, Tage, Kontrakte, Konsistenz, Status ---------- */
test('profitTarget: progress und remaining', () => {
  const half = run({ profitTarget: { value: 3000, mode: 'abs' } }, [tr('a', '2026-03-02T15:00:00Z', 1500)]);
  assert.deepEqual(half.target, { value: 3000, progress: 0.5, remaining: 1500 }); assert.equal(half.status, 'ok');
  const over = run({ profitTarget: { value: 3000, mode: 'abs' } }, [tr('a', '2026-03-02T15:00:00Z', 3500)]);
  assert.equal(over.target.progress, 1); assert.equal(over.target.remaining, 0); assert.equal(over.status, 'passed');
  const neg = run({ profitTarget: { value: 3000, mode: 'abs' } }, [tr('a', '2026-03-02T15:00:00Z', -500)]);
  assert.equal(neg.target.progress, 0); assert.equal(neg.target.remaining, 3500);
  assert.equal(run({}, [tr('a', '2026-03-02T15:00:00Z', 9999)]).target, null);
});

test('minTradingDays: Handelstage zählen, Ziel allein reicht nicht', () => {
  const rules = { profitTarget: { value: 3000, mode: 'abs' }, minTradingDays: 3 };
  const two = run(rules, [tr('a', '2026-03-02T15:00:00Z', 2000), tr('b', '2026-03-02T16:00:00Z', 500), tr('c', '2026-03-03T15:00:00Z', 1000)]);
  assert.deepEqual(two.tradingDays, { n: 2, min: 3, remaining: 1 }); assert.equal(two.status, 'ok'); assert.equal(two.target.progress, 1);
  const three = run(rules, [tr('a', '2026-03-02T15:00:00Z', 2000), tr('b', '2026-03-03T15:00:00Z', 500), tr('c', '2026-03-04T15:00:00Z', 1000)]);
  assert.deepEqual(three.tradingDays, { n: 3, min: 3, remaining: 0 }); assert.equal(three.status, 'passed');
  assert.equal(run({}, []).tradingDays, null);
});

test('maxContracts: Verstoß je Trade, maxUsed, Status breached', () => {
  const ev = run({ maxContracts: 3 }, [tr('a', '2026-03-02T15:00:00Z', 100, { quantity: 5 }), tr('b', '2026-03-02T16:00:00Z', 100, { quantity: 3 }), tr('c', '2026-03-02T17:00:00Z', 100, { quantity: 4 })]);
  assert.deepEqual(ev.contracts, { max: 3, maxUsed: 5, breaches: 2 }); assert.equal(ev.status, 'breached');
  assert.deepEqual(rule(ev, 'maxContracts').map(b => b.tradeId), ['a', 'c']); assert.ok(rule(ev, 'maxContracts')[0].detail.includes('5')); assert.ok(rule(ev, 'maxContracts').every(b => typeof b.at === 'string' && b.at.endsWith('Z')));
  const fine = run({ maxContracts: 3 }, [tr('a', '2026-03-02T15:00:00Z', 100, { quantity: 3 })]);
  assert.deepEqual(fine.contracts, { max: 3, maxUsed: 3, breaches: 0 }); assert.equal(fine.status, 'ok');
  assert.equal(run({}, [tr('a', '2026-03-02T15:00:00Z', 100, { quantity: 50 })]).contracts, null);
});

test('consistency: bestDayPct, ok und allowedToday', () => {
  const trades = [tr('a', '2026-03-02T15:00:00Z', 600), tr('b', '2026-03-03T15:00:00Z', 400)];
  const bad = run({ consistency: { maxDayPct: 30 } }, trades);
  near(bad.consistency.bestDay, 600); near(bad.consistency.bestDayPct, 0.6); assert.equal(bad.consistency.maxDayPct, 30); assert.equal(bad.consistency.ok, false); assert.equal(bad.consistency.allowedToday, 0); assert.equal(bad.status, 'ok'); assert.equal(bad.breaches.length, 0);
  /* 70 %: ok; heute (3.3., D = 400) darf noch x verdient werden mit (400 + x) / (1000 + x) ≤ 0,7 → x ≤ 1000 */
  const good = run({ consistency: { maxDayPct: 70 } }, trades, { now: '2026-03-03T20:00:00Z' });
  assert.equal(good.consistency.ok, true); near(good.consistency.allowedToday, 1000);
  /* an einem neuen Tag ohne Trades (D = 0): x ≤ 0,7 · 1000 / 0,3 */
  near(run({ consistency: { maxDayPct: 70 } }, trades).consistency.allowedToday, 700 / 0.3);
  /* exakt an der Grenze gilt als ok; ohne Gesamtgewinn nicht anwendbar */
  assert.equal(run({ consistency: { maxDayPct: 60 } }, trades).consistency.ok, true);
  const flat = run({ consistency: { maxDayPct: 30 } }, [tr('a', '2026-03-02T15:00:00Z', 600), tr('b', '2026-03-03T15:00:00Z', -800)]);
  assert.equal(flat.consistency.ok, true); assert.equal(flat.consistency.bestDayPct, null); near(flat.consistency.allowedToday, 200);
  assert.equal(run({}, trades).consistency, null);
});

test('status passed: Ziel, Mindest-Tage und Konsistenz; Breach schlägt alles', () => {
  const rules = { profitTarget: { value: 3000, mode: 'abs' }, minTradingDays: 2, consistency: { maxDayPct: 50 } };
  const ok = [tr('a', '2026-03-02T15:00:00Z', 1500), tr('b', '2026-03-03T15:00:00Z', 1500)];
  assert.equal(run(rules, ok).status, 'passed');
  assert.equal(run(rules, [tr('a', '2026-03-02T15:00:00Z', 2500), tr('b', '2026-03-03T15:00:00Z', 500)]).status, 'ok'); /* Konsistenz verletzt → nicht bestanden */
  assert.equal(run(rules, [tr('a', '2026-03-02T15:00:00Z', 1500), tr('b', '2026-03-02T16:00:00Z', 1500)]).status, 'ok'); /* nur ein Handelstag */
  assert.equal(run(Object.assign({}, rules, dd('static', 2000)), [tr('z', '2026-03-01T15:00:00Z', -2000), ...ok]).status, 'breached');
  assert.equal(run({}, ok).status, 'ok'); /* ohne Ziel gibt es kein „passed“ */
});

/* ---------- Puffer, Ampel, Stops ---------- */
test('buffer: Ampel-Schwellen und Stop-Puffer', () => {
  const rules = Object.assign(dl(1000), dd('static', 2000)); const today = '2026-03-20T10:00:00Z';
  const none = run(rules, []); assert.equal(none.buffer.money, 1000); assert.equal(none.buffer.ratio, 1); assert.equal(none.buffer.ampel, 'gruen'); assert.equal(none.buffer.stops, null);
  const gelb = run(rules, [tr('a', today, -600)], { stopSize: 150 });
  assert.equal(gelb.buffer.money, 400); near(gelb.buffer.ratio, 0.4); assert.equal(gelb.buffer.ampel, 'gelb'); assert.equal(gelb.buffer.stops, 2);
  const rot = run(rules, [tr('a', today, -800)], { stopSize: 150 }); near(rot.buffer.ratio, 0.2); assert.equal(rot.buffer.ampel, 'rot'); assert.equal(rot.buffer.stops, 1);
  assert.equal(run(rules, [tr('a', today, -500)]).buffer.ampel, 'gelb'); /* genau 0,5 → gelb */
  assert.equal(run(rules, [tr('a', today, -750)]).buffer.ampel, 'rot'); /* genau 0,25 → rot */
  assert.equal(run(rules, [tr('a', today, -600)], { thresholds: { yellow: 0.3, red: 0.1 } }).buffer.ampel, 'gruen');
  assert.equal(run(rules, [tr('a', today, -600)], { thresholds: { red: 0.45 } }).buffer.ampel, 'rot'); /* Teilangabe wird mit Standard gemischt */
  /* kleinster Spielraum zählt: gestern −1500 (Drawdown-Rest 500) schlägt den frischen Tageslimit-Rest 1000 */
  const dd500 = run(rules, [tr('a', '2026-03-19T10:00:00Z', -1500)], { stopSize: 200 });
  assert.equal(dd500.buffer.money, 500); near(dd500.buffer.ratio, 0.25); assert.equal(dd500.buffer.ampel, 'rot'); assert.equal(dd500.buffer.stops, 2);
  assert.equal(run(rules, [tr('a', today, -600)], { stopSize: 500 }).buffer.stops, 0);
  assert.equal(run(rules, [tr('a', today, -600)], { stopSize: 0 }).buffer.stops, null);
  const noLimits = run({}, [tr('a', today, -600)]); assert.equal(noLimits.buffer.money, null); assert.equal(noLimits.buffer.ampel, 'gruen');
});

test('stopSize: manuell oder Median der Verlustbeträge der letzten 30 Trades', () => {
  const list = C.deriveAll([mk({ id: 'a', exitPrice: 95 }), mk({ id: 'b', exitPrice: 90 }), mk({ id: 'c', exitPrice: 80 }), mk({ id: 'd', exitPrice: 120 }), mk({ id: 'e', closedAt: null, exitPrice: null })]);
  assert.equal(P.stopSize(list), 10); assert.equal(P.stopSize(list, 250), 250); assert.equal(P.stopSize(list, '0'), 10);
  assert.equal(P.stopSize(C.deriveAll([mk({ exitPrice: 110 })])), null); assert.equal(P.stopSize([]), null);
  const two = C.deriveAll([mk({ id: 'a', exitPrice: 96 }), mk({ id: 'b', exitPrice: 90 })]); assert.equal(P.stopSize(two), 7); /* Median zweier Werte = Mittelwert */
  /* nur die letzten 30 geschlossenen Trades: der alte Riesenverlust fällt heraus */
  const many = C.deriveAll([mk({ id: 'old', closedAt: '2026-01-01T10:00:00Z', openedAt: '2026-01-01T09:00:00Z', exitPrice: 0 }), ...Array.from({ length: 30 }, (_, i) => mk({ id: 'n' + i, openedAt: `2026-03-${String(2 + i % 20).padStart(2, '0')}T09:00:00Z`, closedAt: `2026-03-${String(2 + i % 20).padStart(2, '0')}T10:${String(i).padStart(2, '0')}:00Z`, exitPrice: 95 }))]);
  assert.equal(P.stopSize(many), 5);
});

test('positionSize: Futures und Forex', () => {
  const fut = P.positionSize({ market: 'futures', tickValue: 5, tickSize: 0.25, stopTicks: 40, buffer: 1000, maxPct: 50 });
  assert.equal(fut.units, 2); assert.equal(fut.riskPerUnit, 200); assert.equal(fut.maxRisk, 500); assert.equal(fut.risk, 400);
  const futPrice = P.positionSize({ market: 'futures', tickValue: 5, tickSize: 0.25, entryPrice: 18250, stopPrice: 18240, buffer: 1000 });
  assert.equal(futPrice.stopTicks, 40); assert.equal(futPrice.units, 5); assert.equal(futPrice.maxRisk, 1000);
  assert.equal(P.positionSize({ market: 'futures', tickValue: 12.5, stopTicks: 8, buffer: 90 }).units, 0); /* 100 je Kontrakt > 90 → nichts */
  const fx = P.positionSize({ market: 'forex', pipValue: 10, stopPips: 20, buffer: 1000, maxPct: 50 });
  assert.equal(fx.units, 2.5); assert.equal(fx.riskPerUnit, 200); assert.equal(fx.maxRisk, 500);
  const fxPrice = P.positionSize({ market: 'forex', pipValue: 10, entryPrice: 1.0850, stopPrice: 1.0830, buffer: 333 });
  assert.equal(fxPrice.stopPips, 20); assert.equal(fxPrice.units, 1.66); near(fxPrice.risk, 332); /* auf 0,01 Lot abgerundet */
  assert.equal(P.positionSize({ market: 'forex', pipValue: 10, pipSize: 0.01, entryPrice: 150.50, stopPrice: 150.20, buffer: 600 }).stopPips, 30); /* JPY-Paar */
  assert.equal(P.positionSize({ market: 'futures', tickValue: 5, stopTicks: 40, buffer: 0 }).units, 0);
  assert.equal(P.positionSize({ market: 'futures', tickValue: 5, buffer: 1000 }).riskPerUnit, null); /* ohne Stop keine Größe */
  assert.equal(P.positionSize({ market: 'futures', tickValue: 5, stopTicks: 40, buffer: -500 }).maxRisk, 0);
});

/* ---------- Payout-Plan ---------- */
test('payoutPlan: fehlende Tage und Gewinn, Vorschlag unter der Consistency-Grenze, ready', () => {
  const four = Array.from({ length: 4 }, (_, i) => tr('d' + i, `2026-03-0${2 + i}T15:00:00Z`, 250)); /* 4 Tage à 250 → 1000, bester Tag 25 % */
  const ev = run({ consistency: { maxDayPct: 30 } }, four);
  const plan = P.payoutPlan(acc(), ev, { minDays: 5, minProfit: 3000, consistencyPct: 30 });
  assert.equal(plan.missingDays, 1); assert.equal(plan.missingProfit, 2000); assert.equal(plan.consistencyOk, true); assert.equal(plan.ready, false);
  /* 2000 fehlen; Endgewinn 3000 → höchstens 900 pro Tag → 3 Tage à 666,67 */
  assert.equal(plan.suggestion.days, 3); near(plan.suggestion.perDay, 2000 / 3); assert.ok(plan.suggestion.perDay <= 0.3 * 3000);
  assert.ok(typeof plan.consistencyWarning === 'string' && plan.consistencyWarning.includes('heute'));
  const ready = P.payoutPlan(acc(), ev, { minDays: 4, minProfit: 1000 });
  assert.equal(ready.ready, true); assert.equal(ready.missingDays, 0); assert.equal(ready.missingProfit, 0); assert.equal(ready.suggestion.perDay, 0); assert.equal(ready.suggestion.days, 0);
  /* minBalance erzwingt zusätzlichen Gewinn */
  assert.equal(P.payoutPlan(acc(), ev, { minDays: 4, minProfit: 0, minBalance: 52000 }).missingProfit, 1000);
  /* Consistency verletzt: Vorschlag deckt auch den Weg zurück unter die Grenze (bester Tag 600 bei 30 % → Gesamt ≥ 2000) */
  const skew = run({ consistency: { maxDayPct: 30 } }, [tr('a', '2026-03-02T15:00:00Z', 600), tr('b', '2026-03-03T15:00:00Z', 400)]);
  const fix = P.payoutPlan(acc(), skew, { minDays: 2, minProfit: 1000 });
  assert.equal(fix.consistencyOk, false); assert.equal(fix.ready, false); assert.ok(fix.consistencyWarning.includes('verletzt')); assert.equal(fix.missingProfit, 0); near(fix.suggestion.total, 1000); assert.ok(fix.suggestion.days >= 2); near(fix.suggestion.perDay * fix.suggestion.days, 1000);
  /* opts.consistencyPct überschreibt die Kontoregel; gebrochenes Konto ist nie bereit */
  assert.equal(P.payoutPlan(acc(), skew, { minDays: 2, minProfit: 1000, consistencyPct: 70 }).consistencyOk, true);
  assert.equal(P.payoutPlan(acc(), Object.assign({}, ev, { status: 'breached' }), { minDays: 1, minProfit: 0 }).ready, false);
  assert.equal(P.payoutPlan(acc(), undefined, {}).ready, true);
});

/* ---------- Bilanz ---------- */
test('balanceSheet: Summen, ROI, je Firma, Kosten je bestandenes Konto, Serie', () => {
  const expenses = [{ id: 'e1', type: 'fee', amount: 150, date: '2026-01-05', firm: 'Topstep' }, { id: 'e2', type: 'reset', amount: -100, date: '2026-02-01', accountId: 'b' }, { id: 'e3', type: 'fee', amount: 50, date: '2026-01-05', firm: 'Topstep' }];
  const payouts = [{ id: 'p1', firm: 'Topstep', gross: 1000, split: 90, requestedAt: '2026-02-10', receivedAt: '2026-02-15', status: 'paid' }, { id: 'p2', accountId: 'c', gross: 500, net: 400, requestedAt: '2026-03-01', status: 'pending' }, { id: 'p3', firm: 'Apex', gross: 9999, status: 'rejected' }];
  const accounts = [{ id: 'a', firm: 'Topstep', status: 'passed' }, { id: 'b', firm: 'Apex', status: 'breached' }, { id: 'c', firm: 'Apex', status: 'funded' }, { id: 'd', firm: 'Apex', status: 'active' }];
  const bs = P.balanceSheet(expenses, payouts, accounts);
  assert.equal(bs.spent, 300); assert.equal(bs.received, 1300); assert.equal(bs.pending, 400); assert.equal(bs.net, 1000); near(bs.roi, 1000 / 300); assert.equal(bs.toBreakEven, 0);
  assert.equal(bs.costPerPassed, 150); near(bs.passRate, 2 / 3);
  assert.deepEqual(bs.byFirm.map(f => [f.firm, f.spent, f.received, f.net]), [['Apex', 100, 400, 300], ['Topstep', 200, 900, 700]]); near(bs.byFirm[0].roi, 3);
  assert.deepEqual(bs.series.map(s => [s.date, s.spentCum, s.receivedCum]), [['2026-01-05', 150, 0], ['2026-01-05', 200, 0], ['2026-02-01', 300, 0], ['2026-02-15', 300, 900], ['2026-03-01', 300, 1300]]);
  /* nur Ausgaben: ROI −1, Break-even = Ausgaben; leer: alles 0/null */
  const only = P.balanceSheet(expenses, [], accounts); assert.equal(only.roi, -1); assert.equal(only.toBreakEven, 300); assert.equal(only.received, 0);
  const empty = P.balanceSheet([], [], []); assert.equal(empty.spent, 0); assert.equal(empty.roi, null); assert.equal(empty.costPerPassed, null); assert.equal(empty.passRate, null); assert.deepEqual(empty.series, []); assert.deepEqual(empty.byFirm, []);
  /* Payout ohne Datum zählt in den Summen, fehlt aber in der Serie; split als Bruch */
  const nd = P.balanceSheet([], [{ id: 'p', gross: 100, split: 0.8 }], []); assert.equal(nd.received, 80); assert.equal(nd.series.length, 0);
});

/* ---------- Robustheit ---------- */
test('evaluate: rohe Trades werden abgeleitet, offene und zukünftige Trades ignoriert, leere Eingaben', () => {
  const raw = [mk({ id: 'a', openedAt: '2026-03-02T14:00:00Z', closedAt: '2026-03-02T15:00:00Z', exitPrice: 90, quantity: 10 }), mk({ id: 'open', openedAt: '2026-03-02T16:00:00Z', closedAt: null, exitPrice: null }), tr('future', '2026-04-01T15:00:00Z', -9999)];
  const ev = P.evaluate(acc(dd('static', 2000)), raw, { now: NOW });
  assert.equal(ev.balance, 49900); assert.equal(ev.pnl, -100); assert.equal(ev.n, 1); assert.equal(ev.days.length, 1); assert.equal(ev.status, 'ok');
  assert.deepEqual(ev.days[0], { key: '2026-03-02', pnl: -100, n: 1, startBalance: 50000, endBalance: 49900 });
  /* Regeln ohne Wert gelten als nicht gesetzt; fehlendes Konto bricht nicht */
  const loose = run({ dailyLoss: { value: '', mode: 'abs' }, drawdown: { type: 'static' }, profitTarget: { value: null } }, [tr('a', '2026-03-02T15:00:00Z', -100)]);
  assert.equal(loose.status, 'ok'); assert.equal(loose.dailyLoss, null); assert.equal(loose.drawdown, null); assert.equal(loose.target, null);
  const empty = P.evaluate(undefined, undefined, { now: NOW });
  assert.equal(empty.status, 'ok'); assert.equal(empty.balance, 0); assert.deepEqual(empty.days, []); assert.deepEqual(empty.breaches, []); assert.equal(empty.buffer.ampel, 'gruen');
  /* size als Fallback für startBalance; Reihenfolge stabil bei gleichem Schluss (Tie-Break id) */
  assert.equal(P.evaluate({ size: 25000, tz: 'UTC', rules: {} }, [], { now: NOW }).balance, 25000);
  const tie = run(dl(1000), [tr('b', '2026-03-02T15:00:00Z', -1200), tr('a', '2026-03-02T15:00:00Z', 500)]);
  assert.equal(tie.status, 'ok'); /* a (+500) vor b (−1200): Tagesverlust 700 */
  assert.equal(run(dl(1000), [tr('a', '2026-03-02T15:00:00Z', -1200), tr('b', '2026-03-02T15:00:00Z', 500)]).status, 'breached'); /* a (−1200) zuerst */
});
