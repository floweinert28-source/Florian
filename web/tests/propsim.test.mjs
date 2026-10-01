import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../js/core.js');
const S = require('../js/propsim.js');

/* Fixture wie in prop.test.mjs: geschlossener Trade mit festem P&L über pnlOverride, Zeiten als UTC-ISO */
const mk = (o = {}) => Object.assign({ id: 'x', symbol: 'NQ', direction: 1, openedAt: '2026-03-02T14:00:00Z', closedAt: '2026-03-02T14:30:00Z', entryPrice: 100, exitPrice: 110, quantity: 1, multiplier: 1, fees: 0, plannedStop: 95 }, o);
const tr = (id, close, pnl, extra) => mk(Object.assign({ id, openedAt: new Date(new Date(close).getTime() - 30 * 60000).toISOString(), closedAt: close, pnlOverride: pnl }, extra));
const NY = 'America/New_York';
const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
const rules = (o = {}) => Object.assign({ dailyLoss: null, drawdown: null, profitTarget: null, minTradingDays: null, maxContracts: null, consistency: null }, o);
const dl = v => ({ value: v, mode: 'abs', basis: 'balance', resetTime: '00:00', tz: 'UTC' });
const dd = (type, value, extra) => Object.assign({ value, mode: 'abs', type, lockAt: null, basis: 'intraday' }, extra);
const tgt = v => ({ value: v, mode: 'abs' });
/* Standard: 500 Läufe, Seed 7, Konto 50.000, tradeCount 100 (minSample hängt dann nur an der Tageszahl) */
const sim = (days, r, o) => S.simulate(days, rules(r), Object.assign({ runs: 500, seed: 7, startBalance: 50000, tradeCount: 100 }, o));

/* ---------- Tages-P&L ---------- */
test('dayPnLs: Handelstage nach Reset-Zeit, nur geschlossene Trades, Rückgabe vom Tageshoch', () => {
  /* 16:59 NY (21:59Z) und 17:01 NY (22:01Z) am 2.3. liegen auf verschiedenen Handelstagen bei Reset 17:00 New York */
  const trades = [tr('a', '2026-03-02T21:59:00Z', -700), tr('b', '2026-03-02T22:01:00Z', 300), tr('c', '2026-03-02T22:30:00Z', -100), mk({ id: 'open', closedAt: null, exitPrice: null })];
  const ny = S.dayPnLs(trades, '17:00', NY);
  assert.deepEqual(ny.days, [-700, 200]); assert.deepEqual(ny.keys, ['2026-03-01', '2026-03-02']); assert.deepEqual(ny.counts, [1, 2]); assert.equal(ny.tradeCount, 3); near(ny.tradesPerDay, 1.5); assert.equal(ny.n, 2);
  assert.deepEqual(ny.giveback, [0, 100]); near(ny.avgGiveback, 50); /* Tag 2: Hoch +300, Schluss +200 → 100 zurückgegeben; Tag 1 nur abwärts → 0 */
  const utc = S.dayPnLs(trades, '00:00', 'UTC'); assert.deepEqual(utc.days, [-500]); assert.equal(utc.tradesPerDay, 3); assert.deepEqual(utc.giveback, [0]); /* Tageshoch nie über dem Tagesstart */
  const empty = S.dayPnLs([], '00:00', 'UTC'); assert.deepEqual(empty.days, []); assert.equal(empty.tradeCount, 0); assert.equal(empty.tradesPerDay, 0); assert.equal(empty.avgGiveback, 0);
  /* rohe Trades werden abgeleitet; unsortierte Eingabe wird chronologisch */
  assert.deepEqual(S.dayPnLs([mk({ id: 'r', exitPrice: 90 })], '00:00', 'UTC').days, [-10]);
  assert.deepEqual(S.dayPnLs([tr('b', '2026-03-03T12:00:00Z', 5), tr('a', '2026-03-02T12:00:00Z', 1)], '00:00', 'UTC').days, [1, 5]);
});

/* ---------- Monte Carlo ---------- */
test('simulate: deterministisch bei gleichem Seed, Struktur des Ergebnisses', () => {
  const days = [500, -300, 800, -600, 200, -100, 400, -450, 300, 150];
  const r = { dailyLoss: dl(1000), drawdown: dd('trailing_eod', 2000), profitTarget: tgt(3000), minTradingDays: 5 };
  const a = sim(days, r, { runs: 2000 }), b = sim(days, r, { runs: 2000 });
  assert.deepEqual(a, b); assert.equal(a.runs, 2000); near(a.pass + a.fail, 1); assert.ok(a.pass > 0 && a.pass < 1);
  assert.ok(a.failReasons.every((x, i, arr) => !i || arr[i - 1].share >= x.share)); near(a.failReasons.reduce((s, x) => s + x.share, 0), a.fail);
  assert.ok(a.avgDaysToPass >= 5); assert.ok(a.medianDaysToPass >= 5); assert.ok(a.note.includes('keine Garantie')); assert.equal(a.minSample, true); assert.equal(a.startBalance, 50000); assert.equal(a.maxDays, 90);
  assert.notDeepEqual(sim(days, r, { runs: 2000, seed: 99 }), a);
});

test('simulate: ohne Handelstage keine Läufe, minSample erst ab 30 Trades an 10 Tagen', () => {
  const e = sim([], { profitTarget: tgt(3000) }, { tradeCount: 0 });
  assert.equal(e.runs, 0); assert.equal(e.pass, 0); assert.equal(e.fail, 0); assert.deepEqual(e.failReasons, []); assert.equal(e.minSample, false); assert.equal(e.avgDaysToPass, null); assert.equal(e.medianDaysToPass, null);
  assert.ok(e.note.includes('keine Garantie') && e.note.includes('wenig'));
  assert.equal(sim(Array(10).fill(100), { profitTarget: tgt(3000) }, { tradeCount: 29 }).minSample, false);
  assert.equal(sim(Array(9).fill(100), { profitTarget: tgt(3000) }, { tradeCount: 100 }).minSample, false);
  assert.equal(sim(Array(10).fill(100), { profitTarget: tgt(3000) }, { tradeCount: 30 }).minSample, true);
  /* Objekt aus dayPnLs wird direkt akzeptiert (tradeCount daraus) */
  const dp = S.dayPnLs([tr('a', '2026-03-02T12:00:00Z', 100)], '00:00', 'UTC'); const s = S.simulate(dp, rules({ profitTarget: tgt(100) }), { runs: 10, startBalance: 1000 });
  assert.equal(s.tradeCount, 1); assert.equal(s.pass, 1); assert.equal(s.minSample, false);
});

test('simulate: nur Gewinn-Tage → pass 1, Mindest-Tage verzögern das Bestehen', () => {
  const a = sim([500], { profitTarget: tgt(3000) });
  assert.equal(a.pass, 1); assert.equal(a.fail, 0); assert.deepEqual(a.failReasons, []); assert.equal(a.avgDaysToPass, 6); assert.equal(a.medianDaysToPass, 6); assert.equal(a.avgDaysToFail, null);
  const b = sim([500], { profitTarget: tgt(3000), minTradingDays: 10 }); assert.equal(b.pass, 1); assert.equal(b.avgDaysToPass, 10);
  const c = sim([500, 1000], { profitTarget: tgt(3000) }); assert.equal(c.pass, 1); assert.ok(c.avgDaysToPass >= 3 && c.avgDaysToPass <= 6);
  assert.equal(sim([500], { profitTarget: { value: 6, mode: 'pct' } }).avgDaysToPass, 6); /* 6 % von 50.000 = 3000 */
});

test('simulate: nur Verlust-Tage → fail 1 mit Grund dailyLoss oder drawdown', () => {
  const r = { dailyLoss: dl(1000), drawdown: dd('static', 2000), profitTarget: tgt(3000) };
  const a = sim([-500], r);
  assert.equal(a.fail, 1); assert.equal(a.pass, 0); assert.deepEqual(a.failReasons, [{ reason: 'drawdown', share: 1, n: 500 }]); assert.equal(a.avgDaysToFail, 4); assert.equal(a.avgDaysToPass, null);
  const b = sim([-1200], r); assert.equal(b.failReasons[0].reason, 'dailyLoss'); assert.equal(b.avgDaysToFail, 1);
  const c = sim([-500, -1200], r); assert.equal(c.fail, 1); assert.deepEqual(c.failReasons.map(x => x.reason).sort(), ['dailyLoss', 'drawdown']); near(c.failReasons[0].share + c.failReasons[1].share, 1); assert.ok(c.failReasons[0].share >= c.failReasons[1].share);
  /* genau an der Grenze: Tagesverlust 1000 bei Limit 1000 ist ein Breach, 999,99 nicht */
  assert.equal(sim([-1000], { dailyLoss: dl(1000) }, { maxDays: 1 }).failReasons[0].reason, 'dailyLoss'); assert.equal(sim([-999.99], { dailyLoss: dl(1000) }, { maxDays: 1 }).failReasons[0].reason, 'timeout');
  /* pct-Limits relativ zur Startbalance: 2 % von 50.000 = 1000 */
  assert.equal(sim([-1000], { dailyLoss: { value: 2, mode: 'pct' } }, { maxDays: 1 }).failReasons[0].reason, 'dailyLoss');
});

test('simulate: sizeFactor skaliert die Tagesbeträge – Breach und Ziel kommen früher', () => {
  const r = { drawdown: dd('static', 2000), profitTarget: tgt(3000) };
  assert.equal(sim([-500], r).avgDaysToFail, 4); assert.equal(sim([-500], r, { sizeFactor: 2 }).avgDaysToFail, 2); assert.equal(sim([-500], r, { sizeFactor: 0.5 }).avgDaysToFail, 8);
  assert.equal(sim([500], r).avgDaysToPass, 6); assert.equal(sim([500], r, { sizeFactor: 2 }).avgDaysToPass, 3);
  const days = [600, -400, 300, -500, 450, -350, 200, -250, 700, -600]; const mixed = { dailyLoss: dl(1000), drawdown: dd('trailing_eod', 1500), profitTarget: tgt(2500) };
  const one = sim(days, mixed, { runs: 2000 }), two = sim(days, mixed, { runs: 2000, sizeFactor: 2 });
  assert.ok(two.fail > one.fail); assert.equal(two.sizeFactor, 2); assert.equal(sim(days, mixed, { sizeFactor: 0 }).sizeFactor, 1);
});

test('path + trailing_lock: fester Pfad, Boden friert bei Start + lockAt ein', () => {
  const lock = { drawdown: dd('trailing_lock', 2500, { lockAt: 100 }), profitTarget: tgt(10000) }; const o = { startBalance: 50000 };
  /* Tag 1: Peak 53.000 → roher Boden 50.500 ≥ 50.100 → eingefroren bei 50.100; −2800 bleibt darüber, erst −200 am Tag 3 bricht */
  const a = S.path([3000, -2800, -200], rules(lock), o);
  assert.equal(a.outcome, 'drawdown'); assert.equal(a.day, 3); assert.equal(a.locked, true); assert.equal(a.floor, 50100); assert.equal(a.balance, 50000); assert.equal(a.pnl, 0);
  const eod = S.path([3000, -2800, -200], rules({ drawdown: dd('trailing_eod', 2500), profitTarget: tgt(10000) }), o);
  assert.equal(eod.outcome, 'drawdown'); assert.equal(eod.day, 2); assert.equal(eod.floor, 50500); assert.equal(eod.locked, false);
  const stat = S.path([3000, -2800, -200], rules({ drawdown: dd('static', 2500), profitTarget: tgt(10000) }), o); assert.equal(stat.outcome, 'timeout'); assert.equal(stat.floor, 47500);
  /* trailing_intraday wird auf Tagesbasis wie trailing_eod gerechnet */
  const intra = S.path([3000, -2800, -200], rules({ drawdown: dd('trailing_intraday', 2500), profitTarget: tgt(10000) }), o); assert.equal(intra.outcome, 'drawdown'); assert.equal(intra.day, eod.day);
  /* weitere Gewinne heben den eingefrorenen Boden nicht mehr an; Ziel erreicht */
  const more = S.path([3000, 5000, 5000], rules(lock), o); assert.equal(more.outcome, 'pass'); assert.equal(more.floor, 50100); assert.equal(more.day, 3); assert.equal(more.locked, true);
  assert.equal(S.path([2000, 2000], rules({ profitTarget: tgt(3000) }), o).outcome, 'pass'); assert.equal(S.path([], rules({ profitTarget: tgt(3000) }), o).outcome, 'timeout');
  /* Simulation: mit Lock bestehen mehr Läufe als mit reinem EOD-Trailing */
  const days = [3000, -2800, 1500, -1000];
  const l = sim(days, lock, { runs: 2000 }), e = sim(days, { drawdown: dd('trailing_eod', 2500), profitTarget: tgt(10000) }, { runs: 2000 });
  assert.ok(l.pass > e.pass, `${l.pass} ≤ ${e.pass}`);
});

test('simulate: maxDays → timeout, ohne Ziel nie bestanden', () => {
  const a = sim([100], { profitTarget: tgt(3000) }, { maxDays: 10 });
  assert.equal(a.fail, 1); assert.deepEqual(a.failReasons, [{ reason: 'timeout', share: 1, n: 500 }]); assert.equal(a.avgDaysToPass, null); assert.equal(a.medianDaysToPass, null); assert.equal(a.avgDaysToFail, 10); assert.equal(a.maxDays, 10);
  assert.equal(sim([100], { profitTarget: tgt(3000) }, { maxDays: 30 }).pass, 1);
  assert.equal(sim([500], {}).failReasons[0].reason, 'timeout'); assert.equal(S.simulate([500], null, { runs: 5 }).failReasons[0].reason, 'timeout');
});

test('simulate + path: Consistency Rule verzögert oder verhindert das Bestehen', () => {
  const r = m => ({ profitTarget: tgt(3000), consistency: { maxDayPct: m } });
  assert.equal(sim([2500], r(50)).avgDaysToPass, 2); /* 2 × 2500: bester Tag genau 50 % → ok */
  assert.equal(sim([2500], r(40)).avgDaysToPass, 3); /* nach 2 Tagen 50 % > 40 → weiterhandeln, nach 3 Tagen 33 % */
  const c = sim([3000], r(50), { maxDays: 1 }); assert.equal(c.fail, 1); assert.deepEqual(c.failReasons, [{ reason: 'consistency', share: 1, n: 500 }]);
  const p = S.path([2500, 300, 300], rules(r(50)), { startBalance: 50000 }); assert.equal(p.outcome, 'consistency'); assert.equal(p.bestDay, 2500); assert.equal(p.pnl, 3100);
  assert.equal(S.path([2500, 300, 300], rules(r(100)), { startBalance: 50000 }).outcome, 'pass'); /* 100 % = nie verletzbar */
  /* Breach schlägt Consistency: Verlusttag nach Zielerreichung bei verletzter Consistency */
  assert.equal(S.path([3000, -1500], rules({ profitTarget: tgt(3000), consistency: { maxDayPct: 50 }, dailyLoss: dl(1000) }), { startBalance: 50000 }).outcome, 'dailyLoss');
});

/* ---------- Firmen-Matcher ---------- */
const PRESET = (id, firm, r, challenge, size = 50000) => ({ id, firm, name: `${size / 1000}K`, size, rules: rules(r), fees: { challenge, reset: 50, activation: 0, monthly: 0 }, profitSplit: 90, payout: { minDays: 5, minProfit: 1000 } });
test('matchFirms: Rangliste nach Bestehensquote, dann Gebühren, mit deutscher Begründung', () => {
  const days = [400, -350, 600, -200, 300, -150, 500, -400, 250, 350];
  const loose = { dailyLoss: dl(2000), drawdown: dd('trailing_eod', 4000), profitTarget: tgt(2000) }, tight = { dailyLoss: dl(300), drawdown: dd('trailing_intraday', 500), profitTarget: tgt(3000) };
  const presets = [PRESET('a', 'Alpha', loose, 100), PRESET('b', 'Beta', tight, 50), PRESET('c', 'Gamma', loose, 80)];
  const list = S.matchFirms(days, presets, { runs: 1000, seed: 3, tradeCount: 100 });
  assert.deepEqual(list.map(x => x.presetId), ['c', 'a', 'b']); assert.equal(list[0].pass, list[1].pass); assert.ok(list[0].pass > list[2].pass); assert.equal(list[0].fees, 80); assert.equal(list[0].firm, 'Gamma'); assert.equal(list[0].size, 50000);
  assert.ok(list.every(x => typeof x.reason === 'string' && x.reason.length > 10 && Number.isInteger(x.score) && x.score >= 0 && x.score <= 100 && Math.abs(x.pass + x.fail - 1) < 1e-9));
  assert.ok(list[0].score >= list[2].score); assert.ok(/Daily Loss|Drawdown/.test(list[2].reason), list[2].reason); assert.ok(list[2].failReasons[0].reason === 'dailyLoss');
  for (const k of ['presetId', 'firm', 'name', 'size', 'pass', 'fail', 'avgDaysToPass', 'reason', 'score']) assert.ok(k in list[0], k);
  /* referenceSize skaliert die Tagesbeträge auf die Kontogröße des Presets */
  const big = S.matchFirms(days, [Object.assign({}, presets[0], { id: 'big', size: 100000 })], { runs: 200, referenceSize: 50000, tradeCount: 100 }); near(big[0].sizeFactor, 2);
  /* ohne Tage: alle 0, Begründung erklärt es; ohne Ziel: nie bestanden */
  const none = S.matchFirms([], presets, { runs: 10 }); assert.deepEqual(none.map(x => x.pass), [0, 0, 0]); assert.ok(none[0].reason.includes('Keine Handelstage'));
  assert.ok(S.matchFirms(days, [PRESET('z', 'Zeta', { dailyLoss: dl(2000) }, 10)], { runs: 10 })[0].reason.includes('Gewinnziel'));
  /* Begründungen je Scheitergrund */
  assert.ok(S.matchFirms([100], [PRESET('t', 'T', { profitTarget: tgt(50000) }, 10)], { runs: 10, maxDays: 20 })[0].reason.includes('Großes Ziel'));
  assert.ok(S.matchFirms([3000], [PRESET('k', 'K', { profitTarget: tgt(3000), consistency: { maxDayPct: 50 } }, 10)], { runs: 10, maxDays: 1 })[0].reason.includes('Consistency'));
  assert.ok(S.matchFirms([-500, 100], [PRESET('d', 'D', { drawdown: dd('trailing_eod', 600), profitTarget: tgt(5000) }, 10)], { runs: 50 })[0].reason.includes('EOD-Trailing-Drawdown'));
});

/* ---------- Lohnt sich die Challenge? ---------- */
test('expectedValue: Vorzeichen, Gebühren und breakEvenPassRate', () => {
  const preset = PRESET('a', 'Alpha', { dailyLoss: dl(2000), drawdown: dd('trailing_eod', 4000), profitTarget: tgt(3000) }, 150); preset.fees.reset = 80; preset.profitSplit = 80;
  const good = [500, 300, -200, 400, 250]; const o = { runs: 500, seed: 5 };
  const hi = S.expectedValue({ passProb: 0.9, preset, dayPnLs: good, opts: o });
  assert.ok(hi.payoutProb > 0.95); assert.ok(hi.expectedPayout > 0); assert.ok(hi.ev > 0); near(hi.split, 0.8); assert.ok(hi.avgDaysToPayout >= 5); assert.ok(hi.avgProfitAtPayout >= 1000); assert.equal(hi.breachProb, 0);
  near(hi.expectedPayout, hi.avgProfitAtPayout * 0.8 * hi.payoutProb); near(hi.fees.total, 150 + 0.1 * 80); near(hi.fees.expectedResets, 0.1); near(hi.ev, 0.9 * hi.expectedPayout - hi.fees.total);
  const lo = S.expectedValue({ passProb: 0.05, preset, dayPnLs: good, opts: o }); assert.ok(lo.ev < 0); near(lo.expectedPayout, hi.expectedPayout);
  /* Break-even: p × EP − 150 − (1 − p) × 80 = 0 → p = 230 / (EP + 80) */
  const be = hi.breakEvenPassRate; assert.ok(be > 0.05 && be < 0.9); near(be, 230 / (hi.expectedPayout + 80)); near(S.expectedValue({ passProb: be, preset, dayPnLs: good, opts: o }).ev, 0);
  /* Verlusttage: nie Payout → Erwartungswert = −Gebühren, kein Break-even */
  const bad = S.expectedValue({ passProb: 0.5, preset, dayPnLs: [-500], opts: { runs: 200 } });
  assert.equal(bad.payoutProb, 0); assert.equal(bad.expectedPayout, 0); near(bad.ev, -(150 + 0.5 * 80)); assert.equal(bad.breakEvenPassRate, null); assert.equal(bad.breachProb, 1);
  /* Aktivierungsgebühr nur bei Bestehen, Split als Bruch, bis zu 2 Resets */
  const act = S.expectedValue({ passProb: 0.5, preset: Object.assign({}, preset, { fees: { challenge: 100, reset: 50, activation: 120 }, profitSplit: 0.9 }), dayPnLs: good, opts: { runs: 200, maxResets: 2 } });
  near(act.fees.activationCost, 60); near(act.fees.expectedResets, 0.75); near(act.split, 0.9); near(act.fees.total, 100 + 0.75 * 50 + 60);
  /* ohne Gebühren ist jede Quote break-even; ohne Tage keine Läufe */
  assert.equal(S.expectedValue({ passProb: 0.5, preset: Object.assign({}, preset, { fees: {} }), dayPnLs: good, opts: o }).breakEvenPassRate, 0);
  const empty = S.expectedValue({ passProb: 0.5, preset, dayPnLs: [], opts: {} }); assert.ok(empty.ev < 0); assert.equal(empty.runs, 0); assert.ok(typeof hi.note === 'string' && hi.note.includes('keine Garantie'));
  /* Funded-Regeln aus preset.fundedRules: enger Drawdown senkt die Payout-Wahrscheinlichkeit */
  const strict = S.expectedValue({ passProb: 0.9, preset: Object.assign({}, preset, { fundedRules: rules({ drawdown: dd('static', 150) }) }), dayPnLs: good, opts: o }); assert.ok(strict.payoutProb < hi.payoutProb);
});

/* ---------- Konto-Friedhof ---------- */
test('graveyard: Grabsteine und Muster mit korrekten Zahlen', () => {
  /* 5 gebrochene Konten: Breach-Tage 2.3. (Mo), 9.3. (Mo), 16.3. (Mo), 5.3. (Do), 6.3. (Fr); Uhrzeiten 15, 16, 16, 10, 9 Uhr UTC */
  const dates = ['2026-03-02', '2026-03-09', '2026-03-16', '2026-03-05', '2026-03-06'], hours = [15, 16, 16, 10, 9];
  const accs = dates.map((_, i) => ({ id: 'g' + (i + 1), firm: i % 2 ? 'Apex' : 'Topstep', name: 'Konto ' + (i + 1), size: 50000, status: 'breached', startedAt: '2026-03-01T00:00:00Z', tz: 'UTC', phase: 'challenge1', market: 'futures' }));
  const byId = new Map(); const breaches = [];
  accs.forEach((a, i) => {
    const at = h => `${dates[i]}T${String(h).padStart(2, '0')}:00:00Z`; const pre = i < 4 ? [-200, -200] : [100, -200]; /* g1–g4: zwei Verluste davor, g5: nur einer */
    pre.forEach((pnl, j) => { const t = tr(`${a.id}-p${j}`, at(hours[i] - 2 + j), pnl, { accountId: a.id, emotions: i === 0 ? ['Wut'] : [] }); byId.set(t.id, t); });
    const b = tr(`${a.id}-b`, at(hours[i]), -1500, { accountId: a.id, symbol: i < 3 ? 'NQ' : 'ES', setup: i < 3 ? 'Breakout' : 'Reversal', emotions: i < 4 ? ['FOMO'] : ['Ruhig'], mistakes: ['Revenge-Trade'] }); byId.set(b.id, b);
    breaches.push({ accountId: a.id, tradeId: b.id, rule: i < 4 ? 'dailyLoss' : 'drawdown', at: at(hours[i]), note: i === 0 ? 'Nach dem FOMC' : '' });
  });
  const g = S.graveyard([...accs, { id: 'live', status: 'active', firm: 'X' }], breaches, byId);
  assert.equal(g.n, 5); assert.equal(g.tombstones.length, 5); assert.deepEqual(g.tombstones.map(t => t.accountId), ['g1', 'g4', 'g5', 'g2', 'g3']); /* chronologisch */
  const t1 = g.tombstones.find(t => t.accountId === 'g1');
  assert.equal(t1.lifetimeDays, 2); assert.equal(t1.result, -1900); assert.equal(t1.lossStreakBefore, 2); assert.deepEqual(t1.emotions, ['FOMO', 'Wut']); assert.deepEqual(t1.mistakes, ['Revenge-Trade']); assert.equal(t1.note, 'Nach dem FOMC');
  assert.deepEqual(t1.cause, { rule: 'dailyLoss', tradeId: 'g1-b', at: '2026-03-02T15:00:00.000Z', symbol: 'NQ', setup: 'Breakout', hour: 15, weekday: 'Mo', weekdayIndex: 0, pnl: -1500 });
  assert.equal(t1.firm, 'Topstep'); assert.equal(t1.size, 50000); assert.equal(t1.phase, 'challenge1');
  assert.equal(g.tombstones.find(t => t.accountId === 'g5').lossStreakBefore, 1); assert.equal(g.tombstones.find(t => t.accountId === 'g5').lifetimeDays, 6);
  assert.ok(g.patterns.includes('4 von 5 Breaches passierten nach 2+ Verlusttrades in Folge.'), g.patterns.join(' | '));
  assert.ok(g.patterns.includes('3 von 5 zwischen 15 und 17 Uhr.'));
  assert.ok(g.patterns.includes('3 von 5 an einem Montag.'));
  assert.ok(g.patterns.includes('3 von 5 im NQ.'));
  assert.ok(g.patterns.includes('3 von 5 mit dem Setup „Breakout“.'));
  assert.ok(g.patterns.includes('4 von 5 mit der Emotion „FOMO“ rund um den Breach.'));
  assert.ok(g.patterns.includes('4 von 5 durch das Daily Loss Limit.')); assert.equal(g.patterns.length, 7);
  /* ein einzelner Breach ergibt kein Muster; leer; Objekt statt Map; Breach mit unbekanntem Trade; Stunde in Kontozeitzone */
  assert.deepEqual(S.graveyard(accs.slice(0, 1), breaches, byId).patterns, []); assert.deepEqual(S.graveyard([], [], new Map()), { tombstones: [], patterns: [], n: 0 });
  const obj = {}; for (const [k, v] of byId) obj[k] = v; assert.deepEqual(S.graveyard(accs, breaches, obj), g);
  const missing = S.graveyard([accs[0]], [{ accountId: 'g1', tradeId: 'nope', rule: 'drawdown', at: '2026-03-02T15:00:00Z' }], byId);
  assert.equal(missing.tombstones[0].cause.symbol, null); assert.equal(missing.tombstones[0].cause.rule, 'drawdown'); assert.equal(missing.tombstones[0].lifetimeDays, 2); assert.equal(missing.tombstones[0].result, -1900);
  assert.equal(S.graveyard([Object.assign({}, accs[0], { tz: 'America/New_York' })], breaches, byId).tombstones[0].cause.hour, 10); /* 15:00Z = 10:00 New York (EST) */
  /* Konto ohne verknüpfte Trades: result aus account.pnl, kein Breach-Datensatz */
  const bare = S.graveyard([{ id: 'q', status: 'breached', pnl: -800, startedAt: '2026-03-01' }], [], new Map()).tombstones[0]; assert.equal(bare.result, -800); assert.equal(bare.cause.rule, null); assert.equal(bare.lifetimeDays, null); assert.equal(bare.lossStreakBefore, 0);
});

/* ---------- Challenge vs. Funded ---------- */
test('compare: Kennzahlen Challenge vs. Funded und Hervorhebungen ab 20 %', () => {
  const at = (i, hh, mm) => `2026-03-${String(2 + i).padStart(2, '0')}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00Z`;
  /* Challenge: 10 Trades à 2 Kontrakte (Risiko 10), 60 Minuten, abwechselnd −10 / +20 → Trefferquote 50 %, PF 2, Ø R 0,5, Max-DD 10 */
  const ch = Array.from({ length: 10 }, (_, i) => mk({ id: 'c' + i, openedAt: at(i, 11, 0), closedAt: at(i, 12, 0), exitPrice: i % 2 ? 110 : 95, quantity: 2 }));
  /* Funded: 20 Trades à 1 Kontrakt (Risiko 5), 30 Minuten, 2 pro Tag, 12 Gewinne (+10) und 8 Verluste (−5) → 60 %, PF 3, Ø R 0,8, Max-DD 5 */
  const fu = Array.from({ length: 20 }, (_, i) => mk({ id: 'f' + i, openedAt: at(Math.floor(i / 2), i % 2 ? 12 : 11, 30 * (i % 2 ? 0 : 1)), closedAt: at(Math.floor(i / 2), 12, i % 2 ? 30 : 0), exitPrice: i % 5 === 1 || i % 5 === 4 ? 95 : 110, quantity: 1 }));
  const r = S.compare(ch, fu); const row = k => r.rows.find(x => x.key === k);
  assert.deepEqual(r.rows.map(x => x.key), ['winRate', 'avgR', 'pf', 'avgQty', 'avgRisk', 'tradesPerDay', 'avgHold', 'maxDD']);
  assert.deepEqual(r.rows.map(x => x.unit), ['pct', 'r', 'num', 'num', 'cur', 'num', 'dur', 'cur']); assert.deepEqual(r.n, { challenge: 10, funded: 20 });
  near(row('winRate').challenge, 0.5); near(row('winRate').funded, 0.6); near(row('winRate').diffPct, 20);
  near(row('avgRisk').challenge, 10); near(row('avgRisk').funded, 5); near(row('avgRisk').diffPct, -50); near(row('avgQty').diffPct, -50);
  near(row('tradesPerDay').challenge, 1); near(row('tradesPerDay').funded, 2); near(row('tradesPerDay').diffPct, 100);
  near(row('avgHold').challenge, 60); near(row('avgHold').funded, 30); near(row('pf').challenge, 2); near(row('pf').funded, 3); near(row('avgR').challenge, 0.5); near(row('avgR').funded, 0.8); near(row('maxDD').challenge, 10); near(row('maxDD').funded, 5);
  assert.ok(r.rows.every(x => x.highlight)); assert.equal(r.highlights.length, 8); assert.equal(r.highlights[0], 'Funded machst du 100 % mehr Trades pro Tag.'); /* größte Abweichung zuerst */
  for (const s of ['Funded riskierst du 50 % weniger pro Trade.', 'Funded handelst du 50 % kleinere Positionen.', 'Funded hältst du Trades 50 % kürzer.', 'Funded triffst du 20 % öfter.', 'Dein maximaler Drawdown ist funded 50 % kleiner.', 'Dein Profit Factor ist funded 50 % höher.', 'Funded holst du 60 % mehr R pro Trade.']) assert.ok(r.highlights.includes(s), s);
  /* identische Listen: keine Hervorhebungen; Schwelle anpassbar; leere Seite: null-Werte */
  const same = S.compare(ch, ch); assert.deepEqual(same.highlights, []); assert.ok(same.rows.every(x => x.diffPct === 0));
  assert.equal(S.compare(ch, fu, { threshold: 55 }).highlights.length, 2);
  const none = S.compare(ch, []); assert.deepEqual(none.highlights, []); assert.equal(none.rows[0].funded, null); assert.equal(none.rows[0].diffPct, null); assert.equal(none.n.funded, 0); assert.equal(none.rows[0].highlight, false);
  /* rohe und abgeleitete Trades gemischt, offene ignoriert */
  assert.equal(S.compare(C.deriveAll(ch), [...fu, mk({ id: 'o', closedAt: null, exitPrice: null })]).n.funded, 20);
});
