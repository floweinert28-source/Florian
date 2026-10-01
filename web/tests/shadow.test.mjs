import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../js/core.js');
const S = require('../js/shadow.js');

/* Fixture: Einstieg 100, Stop 95 → Risiko 5 je Stück; Ausstieg 110 = +10, 95 = −5, 100 = Break-even (je Stück) */
const mk = (o = {}) => Object.assign({ id: 'x', symbol: 'DAX', direction: 1, openedAt: '2026-03-02T09:00:00', closedAt: '2026-03-02T09:30:00', entryPrice: 100, exitPrice: 110, quantity: 1, multiplier: 1, fees: 0, plannedStop: 95, setup: 'Breakout' }, o);
/* tr(id, open 'YYYY-MM-DDTHH:MM', close 'HH:MM' (gleicher Tag) oder volle ISO oder null (offen), exit, extra) */
const tr = (id, open, close, exit, extra) => mk(Object.assign({ id, openedAt: open, closedAt: close == null ? null : close.length <= 5 ? open.slice(0, 11) + close + ':00' : close, exitPrice: exit }, extra));
const rules = o => { const r = S.defaultRules(); for (const k of Object.keys(o)) Object.assign(r[k], { on: true }, o[k]); return r; };
const run = (list, r, opts) => S.evaluate(C.deriveAll(list), r, opts);
const row = (res, id) => res.trades.find(x => x.id === id);
const viol = (res, id) => res.violations.find(v => v.tradeId === id);

test('defaultRules: frisches Objekt, Katalog vollständig, ungültige Werte nur Warnung', () => {
  const a = S.defaultRules(), b = S.defaultRules(); a.maxTrades.on = true; a.setups.list.push('x');
  assert.equal(b.maxTrades.on, false); assert.deepEqual(b.setups.list, []); assert.deepEqual(Object.keys(a), S.RULES.map(r => r.key)); assert.equal(a.dailyLoss.unit, 'r'); assert.equal(a.hours.from, '08:00'); assert.equal(a.cooldown.minutes, 15);
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110), tr('b', '2026-03-02T10:00', '10:30', 110)], rules({ maxTrades: { value: 0 } }));
  assert.ok(res.warnings.length); assert.equal(res.violations.length, 0); assert.equal(res.active, true); assert.ok(res.trades.every(x => x.taken));
});

test('keine Regel aktiv: active false, alles genommen, Kosten 0', () => {
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110), tr('b', '2026-03-02T10:00', '10:30', 95), tr('c', '2026-03-02T11:00', '11:30', 120)], S.defaultRules());
  assert.equal(res.active, false); assert.equal(res.trades.length, 3); assert.ok(res.trades.every(x => x.taken && x.scale === 1 && x.reason === null && x.shadowPnl === x.realPnl));
  assert.equal(res.violations.length, 0); assert.equal(res.totals.real, 25); assert.equal(res.totals.shadow, 25); assert.equal(res.totals.cost, 0);
  assert.deepEqual(res.ranking, []); assert.deepEqual(res.warnings, []); assert.equal(res.unknownRisk, 0); assert.equal(res.curve.length, 3);
  const empty = S.evaluate(undefined, undefined); assert.equal(empty.active, false); assert.deepEqual(empty.totals, { real: 0, shadow: 0, cost: 0 }); assert.equal(empty.trades.length, 0);
});

test('maxTrades 2: dritter Trade des Tages fällt raus, Kosten = −P&L des dritten', () => {
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110), tr('b', '2026-03-02T10:00', '10:30', 110), tr('c', '2026-03-02T11:00', '11:30', 95)], rules({ maxTrades: { value: 2 } }));
  assert.equal(res.active, true); assert.equal(row(res, 'a').taken, true); assert.equal(row(res, 'b').taken, true);
  const c = row(res, 'c'); assert.equal(c.taken, false); assert.equal(c.reason, 'maxTrades'); assert.equal(c.realPnl, -5); assert.equal(c.shadowPnl, 0);
  assert.equal(res.violations.length, 1); const v = viol(res, 'c'); assert.equal(v.rule, 'maxTrades'); assert.equal(v.label, 'Max. Trades pro Tag'); assert.equal(v.cost, 5); assert.deepEqual(v.others, []); assert.equal(v.dayKey, '2026-03-02'); assert.equal(v.symbol, 'DAX'); assert.equal(v.r, -1);
  assert.equal(res.totals.real, 15); assert.equal(res.totals.shadow, 20); assert.equal(res.totals.cost, 5);
});

test('dailyLoss in money, pct und r: nach Erreichen Tag gesperrt, nächster Tag frei', () => {
  const list = [tr('a', '2026-03-02T09:00', '09:30', 95, { quantity: 10 }), tr('b', '2026-03-02T10:00', '10:30', 95, { quantity: 10 }), tr('c', '2026-03-02T11:00', '11:30', 110, { quantity: 10 }), tr('d', '2026-03-02T12:00', '12:30', 110, { quantity: 10 }), tr('e', '2026-03-03T09:00', '09:30', 110, { quantity: 10 })];
  const check = (res, label) => {
    assert.equal(row(res, 'a').taken, true, label); assert.equal(row(res, 'b').taken, true, label); /* −50, dann −100: Limit genau erreicht */
    assert.equal(row(res, 'c').reason, 'dailyLoss', label); assert.equal(row(res, 'd').reason, 'dailyLoss', label); assert.equal(row(res, 'e').taken, true, label);
    assert.equal(res.totals.real, 200, label); assert.equal(res.totals.shadow, 0, label); assert.equal(res.totals.cost, -200, label); assert.deepEqual(res.warnings, [], label); assert.equal(res.unknownRisk, 0, label);
  };
  check(run(list, rules({ dailyLoss: { value: 100, unit: 'money' } })), 'money');
  check(run(list, rules({ dailyLoss: { value: 1, unit: 'pct' } }), { account: 10000 }), 'pct');
  check(run(list, rules({ dailyLoss: { value: 2, unit: 'r' } }), { rUnit: 50 }), 'r');
  /* knapp unter dem Limit bleibt der Tag offen */
  const res = run(list, rules({ dailyLoss: { value: 101, unit: 'money' } })); assert.equal(row(res, 'c').taken, true); assert.equal(res.violations.length, 0);
});

test('lossStreak 2: dritter Trade nach zwei Schatten-Verlusten fällt raus, Gewinn setzt zurück, Break-even ändert nichts', () => {
  const r2 = rules({ lossStreak: { value: 2 } }); const t = (id, h, exit) => tr(id, `2026-03-02T${h}:00`, `${h}:30`, exit);
  const a = run([t('a', '09', 95), t('b', '10', 95), t('c', '11', 110), t('d', '12', 110)], r2);
  assert.equal(row(a, 'c').reason, 'lossStreak'); assert.equal(row(a, 'd').reason, 'lossStreak'); /* übersprungene Trades ändern den Schatten nicht, Serie bleibt 2 */
  assert.equal(viol(a, 'c').cost, -10); assert.equal(a.totals.cost, -20);
  const b = run([t('a', '09', 95), t('b', '10', 110), t('c', '11', 95), t('d', '12', 110)], r2); assert.ok(b.trades.every(x => x.taken)); assert.equal(b.violations.length, 0);
  const c = run([t('a', '09', 95), t('b', '10', 100), t('c', '11', 95), t('d', '12', 110)], r2); /* Verlust, BE, Verlust → Serie 2 */
  assert.equal(row(c, 'b').taken, true); assert.equal(row(c, 'c').taken, true); assert.equal(row(c, 'd').reason, 'lossStreak');
  const d = run([t('a', '09', 95), t('b', '10', 100), t('c', '11', 110)], r2); assert.ok(d.trades.every(x => x.taken)); /* BE erhöht die Serie nicht */
  const e = run([t('a', '09', 95), t('b', '10', 95), tr('c', '2026-03-03T09:00', '09:30', 110)], r2); assert.equal(row(e, 'c').taken, true); /* Serie gilt je Tag */
});

test('Schatten-Zustand statt echtem: wegen hours übersprungener Verlust zählt nicht zur Serie', () => {
  /* Fenster 13:00–11:00 (über Mitternacht) sperrt die Mittagszeit: der zweite echte Verlust (11:30) fällt wegen hours raus und zählt nicht zur Schatten-Serie */
  const list = [tr('a', '2026-03-02T09:00', '09:30', 95), tr('b', '2026-03-02T11:30', '12:00', 95), tr('c', '2026-03-02T13:30', '14:00', 110)];
  const res = run(list, rules({ hours: { from: '13:00', to: '11:00' }, lossStreak: { value: 2 } }));
  assert.equal(row(res, 'a').taken, true); assert.equal(row(res, 'b').reason, 'hours'); assert.equal(row(res, 'c').taken, true); assert.equal(row(res, 'c').reason, null);
  assert.equal(res.violations.length, 1); assert.equal(res.totals.cost, 5);
  /* ohne hours-Regel zählt b, und c fällt wegen lossStreak raus */
  const real = run(list, rules({ lossStreak: { value: 2 } })); assert.equal(row(real, 'b').taken, true); assert.equal(row(real, 'c').reason, 'lossStreak');
});

test('maxRisk in r, pct und money: P&L skaliert, Trade genommen, Verstoß mit Kosten', () => {
  const win = [tr('a', '2026-03-02T09:00', '09:30', 110, { quantity: 20 })]; /* Risiko 100, P&L +200 */
  const check = (res, label) => {
    const x = row(res, 'a'); assert.equal(x.taken, true, label); assert.equal(x.scale, 0.5, label); assert.equal(x.shadowPnl, 100, label); assert.equal(x.reason, 'maxRisk', label);
    const v = viol(res, 'a'); assert.equal(v.rule, 'maxRisk', label); assert.equal(v.cost, -100, label); assert.equal(v.scale, 0.5, label); assert.equal(res.totals.cost, -100, label); assert.equal(res.unknownRisk, 0, label); assert.deepEqual(res.warnings, [], label);
  };
  check(run(win, rules({ maxRisk: { value: 1, unit: 'r' } }), { rUnit: 50 }), 'r');
  check(run(win, rules({ maxRisk: { value: 0.5, unit: 'pct' } }), { account: 10000 }), 'pct');
  check(run(win, rules({ maxRisk: { value: 50, unit: 'money' } })), 'money');
  const loss = run([tr('a', '2026-03-02T09:00', '09:30', 90, { quantity: 20 })], rules({ maxRisk: { value: 50, unit: 'money' } })); assert.equal(row(loss, 'a').shadowPnl, -100); assert.equal(viol(loss, 'a').cost, 100); /* Verlust halbiert → Disziplin spart */
  const ok = run(win, rules({ maxRisk: { value: 100, unit: 'money' } })); assert.equal(ok.violations.length, 0); assert.equal(row(ok, 'a').scale, 1); /* genau am Limit: kein Verstoß */
});

test('maxRisk ohne Stop: unknownRisk 1, kein Verstoß', () => {
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110, { plannedStop: null, quantity: 20 })], rules({ maxRisk: { value: 10, unit: 'money' } }));
  assert.equal(res.unknownRisk, 1); assert.equal(res.violations.length, 0); assert.equal(row(res, 'a').taken, true); assert.equal(row(res, 'a').shadowPnl, 200); assert.equal(res.totals.cost, 0); assert.deepEqual(res.warnings, []);
});

test('Einheit r ohne R-Einheit: Warnung, Regel nicht prüfbar', () => {
  const list = [tr('a', '2026-03-02T09:00', '09:30', 110, { quantity: 20 })]; const r = rules({ maxRisk: { value: 1, unit: 'r' }, dailyLoss: { value: 1, unit: 'r' } });
  const res = run(list, r);
  assert.ok(res.warnings.length >= 2); assert.ok(res.warnings.every(w => /R-Einheit/.test(w)));
  assert.equal(res.violations.length, 0); assert.equal(row(res, 'a').taken, true); assert.equal(res.unknownRisk, 1); assert.equal(res.active, true);
  assert.deepEqual(run(list, r, { rUnit: 50 }).warnings, []); assert.equal(run(list, r, { rUnit: 50 }).violations.length, 1); /* mit R-Einheit prüfbar: Risiko 100 > 50 */
});

test('hours: normales Fenster (inklusiv) und Fenster über Mitternacht', () => {
  const a = run([tr('a', '2026-03-02T08:59', '09:10', 110), tr('b', '2026-03-02T09:00', '09:10', 110), tr('c', '2026-03-02T17:00', '17:10', 110), tr('d', '2026-03-02T17:01', '17:10', 110)], rules({ hours: { from: '09:00', to: '17:00' } }));
  assert.equal(row(a, 'a').reason, 'hours'); assert.equal(row(a, 'b').taken, true); assert.equal(row(a, 'c').taken, true); assert.equal(row(a, 'd').reason, 'hours'); assert.equal(a.totals.cost, -20);
  const b = run([tr('a', '2026-03-02T21:59', '22:10', 110), tr('b', '2026-03-02T22:30', '23:00', 110), tr('c', '2026-03-03T01:30', '01:45', 110), tr('d', '2026-03-03T03:00', '03:30', 110)], rules({ hours: { from: '22:00', to: '02:00' } }));
  assert.equal(row(b, 'a').reason, 'hours'); assert.equal(row(b, 'b').taken, true); assert.equal(row(b, 'c').taken, true); assert.equal(row(b, 'd').reason, 'hours');
  const bad = run([tr('a', '2026-03-02T08:00', '08:10', 110)], rules({ hours: { from: 'acht', to: '17:00' } })); assert.ok(bad.warnings.length); assert.equal(bad.violations.length, 0); /* unlesbar: Regel nicht angewendet */
});

test('setups: case-insensitiv und getrimmt, Trade ohne Setup verletzt', () => {
  const t = (id, h, setup) => tr(id, `2026-03-02T${h}:00`, `${h}:30`, 110, { setup });
  const res = run([t('a', '09', 'breakout'), t('b', '10', 'PULLBACK'), t('c', '11', 'Reversal'), t('d', '12', ''), t('e', '13', null)], rules({ setups: { list: ['Breakout', ' Pullback '] } }));
  assert.equal(row(res, 'a').taken, true); assert.equal(row(res, 'b').taken, true); assert.equal(row(res, 'c').reason, 'setups'); assert.equal(row(res, 'd').reason, 'setups'); assert.equal(row(res, 'e').reason, 'setups'); assert.deepEqual(res.warnings, []);
  const empty = run([t('a', '09', 'Breakout')], rules({ setups: { list: [] } })); assert.ok(empty.warnings.length); assert.equal(row(empty, 'a').reason, 'setups'); /* leere Liste: Warnung, jeder Trade ein Verstoß */
});

test('cooldown 15 Minuten nach Verlust, Gewinn löst keinen aus', () => {
  const r = rules({ cooldown: { minutes: 15 } });
  const a = run([tr('a', '2026-03-02T09:00', '09:10', 95), tr('b', '2026-03-02T09:20', '09:22', 110), tr('c', '2026-03-02T09:25', '09:40', 110)], r);
  assert.equal(row(a, 'a').taken, true); assert.equal(row(a, 'b').reason, 'cooldown'); assert.equal(viol(a, 'b').cost, -10); assert.equal(row(a, 'c').taken, true); /* 09:25 = genau 15 min nach 09:10 */
  const b = run([tr('a', '2026-03-02T09:00', '09:10', 110), tr('b', '2026-03-02T09:12', '09:20', 110)], r); assert.equal(row(b, 'b').taken, true); assert.equal(b.violations.length, 0);
  /* Schatten-Zustand: der übersprungene Verlust b startet keinen neuen Cooldown */
  const c = run([tr('a', '2026-03-02T09:00', '09:10', 95), tr('b', '2026-03-02T09:12', '09:14', 95), tr('c', '2026-03-02T09:26', '09:40', 110)], r);
  assert.equal(row(c, 'b').reason, 'cooldown'); assert.equal(row(c, 'c').taken, true);
});

test('mehrere Regeln gleichzeitig: reason erste, others Rest, Kosten einmal', () => {
  const r = rules({ hours: { from: '09:00', to: '17:00' }, setups: { list: ['Breakout'] }, maxTrades: { value: 1 }, maxRisk: { value: 50, unit: 'money' } });
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110), tr('b', '2026-03-02T18:00', '18:30', 95, { setup: 'Reversal', quantity: 20 })], r);
  const b = row(res, 'b'); assert.equal(b.taken, false); assert.equal(b.reason, 'hours'); assert.deepEqual(b.violations, ['hours', 'setups', 'maxTrades', 'maxRisk']); assert.equal(b.scale, 1); assert.equal(b.shadowPnl, 0);
  assert.equal(res.violations.length, 1); const v = viol(res, 'b'); assert.equal(v.rule, 'hours'); assert.deepEqual(v.others, ['setups', 'maxTrades', 'maxRisk']); assert.equal(v.cost, 100); assert.equal(res.totals.cost, 100);
  const byRule = Object.fromEntries(res.ranking.map(x => [x.rule, x])); assert.equal(res.ranking.length, 4); assert.equal(byRule.hours.cost, 100); assert.equal(byRule.hours.n, 1); assert.equal(byRule.setups.cost, 0); assert.equal(byRule.maxTrades.n, 0); assert.equal(byRule.maxRisk.n, 0);
});

test('Tageswechsel 23:59/00:01: Tageslimits beginnen neu', () => {
  const r = rules({ maxTrades: { value: 1 }, dailyLoss: { value: 10, unit: 'money' }, lossStreak: { value: 1 } });
  const res = run([tr('a', '2026-03-02T23:50', '23:59', 90, { quantity: 10 }), tr('b', '2026-03-03T00:01', '00:20', 110), tr('c', '2026-03-03T00:30', '00:40', 110)], r);
  assert.equal(row(res, 'a').taken, true); assert.equal(row(res, 'b').taken, true); assert.equal(row(res, 'c').reason, 'maxTrades'); assert.equal(viol(res, 'c').dayKey, '2026-03-03'); assert.equal(res.violations.length, 1);
  const same = run([tr('a', '2026-03-02T23:50', '23:55', 90, { quantity: 10 }), tr('b', '2026-03-02T23:58', '23:59', 110)], r);
  assert.deepEqual(row(same, 'b').violations, ['lossStreak', 'dailyLoss', 'maxTrades']); /* gleicher Tag: alle drei Tageslimits greifen, Prüfreihenfolge */
});

test('Zeitzonen: eigene dayKey/localMinutes kippen 22:30 UTC in den nächsten Tag', () => {
  const view = off => ({ dayKey: d => new Date(d.getTime() + off * 60000).toISOString().slice(0, 10), localMinutes: d => { const x = new Date(d.getTime() + off * 60000); return x.getUTCHours() * 60 + x.getUTCMinutes(); } });
  const list = [tr('a', '2026-03-02T20:00:00Z', '2026-03-02T20:30:00Z', 110), tr('b', '2026-03-02T22:30:00Z', '2026-03-02T23:00:00Z', 95)];
  const r = rules({ maxTrades: { value: 1 } });
  const utc = run(list, r, view(0)); assert.equal(row(utc, 'b').reason, 'maxTrades'); assert.equal(viol(utc, 'b').dayKey, '2026-03-02'); assert.equal(utc.totals.cost, 5);
  const plus2 = run(list, r, view(120)); assert.equal(row(plus2, 'b').taken, true); assert.equal(plus2.violations.length, 0); assert.equal(plus2.totals.cost, 0);
  const hrs = rules({ hours: { from: '08:00', to: '23:00' } }); /* 22:30 UTC ist in +2 h 00:30 und damit außerhalb */
  assert.equal(run(list, hrs, view(0)).violations.length, 0); assert.equal(row(run(list, hrs, view(120)), 'b').reason, 'hours');
});

test('periods week/month/all mit festem now', () => {
  const now = new Date('2026-03-18T12:00:00'); /* Mittwoch, Woche ab Mo 16.03. 00:00 */
  const list = [tr('a', '2026-03-17T09:00', '09:30', 110), tr('a2', '2026-03-17T10:00', '10:30', 95), tr('b', '2026-03-10T09:00', '09:30', 95), tr('c', '2026-02-20T09:00', '09:30', 110), tr('e', '2026-03-15T23:00', '23:30', 110), tr('f', '2026-03-16T00:30', '00:45', 110)];
  const res = run(list, rules({ maxTrades: { value: 1 } }), { now });
  assert.deepEqual(res.periods.week, { real: 15, shadow: 20, cost: 5, n: 3 }); /* a, a2 (übersprungen), f; e liegt am Sonntag davor */
  assert.deepEqual(res.periods.month, { real: 20, shadow: 25, cost: 5, n: 5 });
  assert.deepEqual(res.periods.all, { real: 30, shadow: 35, cost: 5, n: 6 });
  assert.deepEqual(run(list, rules({ maxTrades: { value: 1 } }), { now: '2026-03-18T12:00:00' }).periods, res.periods); /* now auch als String */
});

test('ranking: absteigend nach Kosten, aktive Regeln ohne Verstoß mit 0, inaktive fehlen', () => {
  const r = rules({ maxTrades: { value: 1 }, setups: { list: ['Breakout'] }, cooldown: { minutes: 15 } });
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110), tr('b', '2026-03-02T10:00', '10:30', 80, { setup: 'Reversal' }), tr('c', '2026-03-02T11:00', '11:30', 95)], r);
  assert.deepEqual(res.ranking.map(x => [x.rule, x.n, x.cost]), [['setups', 1, 20], ['maxTrades', 1, 5], ['cooldown', 0, 0]]);
  assert.equal(res.ranking[0].label, 'Nur bestimmte Setups'); assert.ok(!res.ranking.some(x => x.rule === 'hours'));
});

test('curve: ein Punkt je geschlossenem Trade nach Schlusszeit, Schatten kumuliert ohne übersprungene', () => {
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110), tr('b', '2026-03-02T10:00', '10:30', 95), tr('c', '2026-03-02T11:00', '11:30', 120), tr('o', '2026-03-02T12:00', null, null)], rules({ maxTrades: { value: 2 } }));
  assert.equal(res.curve.length, 3); assert.deepEqual(res.curve.map(p => p.id), ['a', 'b', 'c']); assert.deepEqual(res.curve.map(p => p.real), [10, 5, 25]); assert.deepEqual(res.curve.map(p => p.shadow), [10, 5, 5]);
  assert.equal(res.curve[2].date.getTime(), new Date('2026-03-02T11:30:00').getTime());
  const res2 = run([tr('a', '2026-03-02T09:00', '11:00', 110), tr('b', '2026-03-02T09:30', '10:00', 95)], S.defaultRules()); assert.deepEqual(res2.curve.map(p => p.id), ['b', 'a']); assert.deepEqual(res2.curve.map(p => p.real), [-5, 5]);
});

test('Regelbruch mit Gewinn: Kosten negativ', () => {
  const res = run([tr('a', '2026-03-02T09:00', '09:30', 110), tr('b', '2026-03-02T10:00', '10:30', 130)], rules({ maxTrades: { value: 1 } }));
  assert.equal(viol(res, 'b').cost, -30); assert.equal(res.totals.cost, -30); assert.equal(res.ranking[0].cost, -30); assert.equal(res.periods.all.cost, -30); assert.equal(res.totals.real, 40); assert.equal(res.totals.shadow, 10);
});

test('offene Trades werden ignoriert', () => {
  const res = run([tr('o', '2026-03-02T09:00', null, null), tr('b', '2026-03-02T10:00', '10:30', 110)], rules({ maxTrades: { value: 1 } }));
  assert.equal(res.trades.length, 1); assert.equal(res.trades[0].id, 'b'); assert.equal(res.trades[0].taken, true); assert.equal(res.violations.length, 0); assert.equal(res.curve.length, 1); assert.equal(res.periods.all.n, 1);
  assert.equal(S.evaluate([], rules({ maxTrades: { value: 1 } })).trades.length, 0);
});
