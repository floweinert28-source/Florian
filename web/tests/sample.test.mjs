import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const C = require('../js/core.js');
const P = require('../js/prop.js');
const Sh = require('../js/shadow.js');
const Rp = require('../js/replay.js');
const Sample = require('../js/sample.js');
const PropData = require('../js/propdata.js').PropData;

/* Fester Zeitpunkt: heute 23:00 Uhr lokal, damit alle Trades des letzten Handelstags enthalten sind. Die Trade-Folge hängt nur vom Index des Handelstags ab, nicht vom Datum. */
const NOW = new Date(); NOW.setHours(23, 0, 0, 0);
const START = new Date(NOW); START.setHours(0, 0, 0, 0);
const g = Sample.generate({ now: NOW });
const all = C.deriveAll(g.trades); const closed = all.filter(t => t.closed);
const acc = id => g.propAccounts.find(a => a.id === id);
const tradesOf = id => all.filter(t => (t.propAccountIds || []).includes(id));
const ev = (id, now = NOW) => P.evaluate(acc(id), tradesOf(id), { now });
const count = key => all.reduce((m, t) => (m[t[key]] = (m[t[key]] || 0) + 1, m), {});
const near = (a, b, eps) => assert.ok(Math.abs(a - b) <= eps, `${a} ≠ ${b} ± ${eps}`);

test('generate: deterministisch, alles mit sample: true, Trades in plausibler Zahl', () => {
  const again = Sample.generate({ now: NOW });
  assert.equal(JSON.stringify(again), JSON.stringify(g));
  assert.notEqual(JSON.stringify(Sample.generate({ now: NOW, seed: 5 }).trades[0].entryPrice), JSON.stringify(g.trades[0].entryPrice));
  assert.ok(g.trades.length >= 150 && g.trades.length <= 200, `${g.trades.length} Trades`);
  for (const list of [g.trades, g.notes, g.missed, g.strategies, g.rules, g.folders, g.noteTags, g.propAccounts, g.propExpenses, g.propPayouts, g.propBreaches, g.replay]) for (const x of list) assert.equal(x.sample, true);
  for (const d of Object.values(g.days)) assert.equal(d.sample, true);
  for (const t of g.trades) { assert.ok(t.id && t.symbol && t.openedAt && t.entryPrice > 0 && t.quantity > 0 && t.multiplier > 0); assert.ok(Array.isArray(t.propAccountIds) && Array.isArray(t.screenshots) && Array.isArray(t.voiceNotes)); }
  assert.equal(Sample.VERSION, 2);
});

test('Instrumente: NQ am häufigsten, dann ES; Futures mit Punktwert und ganzen Kontrakten 1–3 (NQ/ES, MNQ höchstens 5), Stops 8–40 Punkte bei NQ', () => {
  const by = count('symbol'); const order = Object.entries(by).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  assert.equal(order[0], 'NQ'); assert.equal(order[1], 'ES');
  for (const s of ['MNQ', 'GC', 'CL', 'DAX', 'EURUSD']) assert.ok(by[s] > 0, s);
  const mult = { NQ: 20, ES: 50, MNQ: 2, GC: 100, CL: 1000 };
  for (const t of all) {
    if (!mult[t.symbol]) continue;
    assert.equal(t.multiplier, mult[t.symbol], t.symbol); assert.equal(t.quantity, Math.round(t.quantity), 'ganze Kontrakte');
    if (t.symbol === 'NQ' || t.symbol === 'ES') assert.ok(t.quantity >= 1 && t.quantity <= 3, `${t.symbol} ${t.quantity}`);
    if (t.symbol === 'MNQ') assert.ok(t.quantity >= 1 && t.quantity <= 5, `MNQ ${t.quantity}`);
    if (t.symbol === 'NQ') { assert.ok(t.entryPrice >= 19000 && t.entryPrice <= 22000, `NQ ${t.entryPrice}`); assert.ok(t.stopDist >= 8 && t.stopDist <= 40.01, `NQ Stop ${t.stopDist}`); assert.equal(Math.round(t.entryPrice * 4) / 4, t.entryPrice, 'Tick 0,25'); }
    if (t.symbol === 'ES') assert.ok(t.entryPrice >= 5200 && t.entryPrice <= 6000, `ES ${t.entryPrice}`);
  }
});

test('P&L und R plausibel für ein 25.000er Konto: Risiko sauberer NQ/ES-Trades meist 0,5–1,5 %, R-Multiples im Rahmen', () => {
  const clean = closed.filter(t => ['NQ', 'ES'].includes(t.symbol) && !t.mistakes.length);
  const risks = clean.map(t => t.risk / 25000);
  assert.ok(C.percentile(risks, 0.5) >= 0.005 && C.percentile(risks, 0.5) <= 0.016, `Median-Risiko ${C.percentile(risks, 0.5)}`);
  assert.ok(risks.filter(r => r >= 0.004 && r <= 0.02).length / risks.length >= 0.85, 'mindestens 85 % im Band 0,4–2 %');
  const rs = closed.filter(t => t.r != null).map(t => t.r);
  assert.ok(Math.min(...rs) >= -2.5 && Math.max(...rs) <= 3.5, `R von ${Math.min(...rs)} bis ${Math.max(...rs)}`);
  const s = C.summary(all);
  assert.ok(s.total > 0 && s.pf > 1 && s.winRate > 0.4 && s.winRate < 0.65, `Netto ${s.total} PF ${s.pf} WR ${s.winRate}`);
  assert.ok(s.largestLoss > -4000, `größter Verlust ${s.largestLoss}`);
});

test('Prop-Konten: vier Konten mit Regel-Snapshot aus dem Preset, Phasenverlauf, Währung USD', () => {
  assert.equal(g.propAccounts.length, 4);
  const top = acc(Sample.ACC.topstep), apex = acc(Sample.ACC.apex), ftmo = acc(Sample.ACC.ftmo), mffu = acc(Sample.ACC.mffu);
  assert.deepEqual([top.status, apex.status, ftmo.status, mffu.status], ['active', 'active', 'breached', 'archived']);
  assert.deepEqual([top.phase, apex.phase, ftmo.phase, mffu.phase], ['challenge1', 'funded', 'challenge1', 'challenge1']);
  for (const a of g.propAccounts) { const p = PropData.PRESETS.find(x => x.id === a.firmId); assert.ok(p, a.firmId); assert.deepEqual(a.rules, p.rules); assert.notEqual(a.rules, p.rules, 'Kopie, keine Referenz'); assert.equal(a.currency, 'USD'); assert.equal(a.size, p.size); assert.ok(a.startedAt && a.createdAt && Array.isArray(a.phases) && a.phases.length >= 1); }
  assert.deepEqual(apex.phases.map(x => x.phase), ['challenge1', 'funded']);
  const fundedAt = new Date(apex.phases[1].at); const weeks = (NOW - fundedAt) / (7 * 86400000);
  assert.ok(weeks >= 5 && weeks <= 7.5, `funded seit ${weeks.toFixed(1)} Wochen`);
  assert.ok((NOW - new Date(apex.startedAt)) / 86400000 >= 80, 'Apex seit ~3 Monaten');
  assert.ok((NOW - new Date(top.startedAt)) / 86400000 >= 18 && (NOW - new Date(top.startedAt)) / 86400000 <= 30, 'Topstep seit ~3 Wochen');
  assert.ok(ftmo.breachedAt && (NOW - new Date(ftmo.breachedAt)) / 86400000 >= 30 && (NOW - new Date(ftmo.breachedAt)) / 86400000 <= 42, 'FTMO vor ~5 Wochen geplatzt');
  assert.equal(tradesOf(Sample.ACC.mffu).length, 0);
  assert.equal(ftmo.tz, 'Europe/Prague');
});

test('Topstep: ~25 NQ/ES-Trades, ~40 % zum Ziel, nicht verletzt, Ampel grün oder gelb (mit und ohne heutige Trades)', () => {
  const list = tradesOf(Sample.ACC.topstep);
  assert.ok(list.length >= 18 && list.length <= 32, `${list.length} Trades`);
  assert.ok(list.every(t => ['NQ', 'ES', 'MNQ'].includes(t.symbol) && t.quantity <= 5));
  for (const now of [NOW, START]) { const e = ev(Sample.ACC.topstep, now); assert.equal(e.status, 'ok'); assert.equal(e.breaches.length, 0); assert.ok(e.target.progress >= 0.3 && e.target.progress <= 0.55, `Fortschritt ${e.target.progress}`); assert.ok(['gruen', 'gelb'].includes(e.buffer.ampel), e.buffer.ampel); }
});

test('Apex: ~60 Trades, nie verletzt, Ziel beim Funded-Wechsel erreicht, Payouts (2 erhalten, 1 beantragt), Copy-Trading mit Topstep bei ~10 Trades', () => {
  const list = tradesOf(Sample.ACC.apex); const a = acc(Sample.ACC.apex);
  assert.ok(list.length >= 50 && list.length <= 80, `${list.length} Trades`);
  const e = ev(Sample.ACC.apex); assert.equal(e.breaches.length, 0); assert.notEqual(e.status, 'breached');
  assert.ok(e.balance >= 103100, `Balance ${e.balance} für Payout-Mindestbalance`);
  assert.ok(e.consistency && e.consistency.ok, 'Consistency 30 % ok');
  const atFunded = ev(Sample.ACC.apex, new Date(a.phases[1].at)); assert.ok(atFunded.pnl >= 6000, `P&L beim Wechsel ${atFunded.pnl}`);
  const funded = list.filter(t => t.closed && t.close >= new Date(a.phases[1].at)); assert.ok(funded.length >= 15, 'Funded-Trades');
  const po = g.propPayouts; assert.equal(po.length, 3); assert.deepEqual(po.map(p => p.status), ['received', 'received', 'requested']); assert.ok(po.every(p => p.accountId === a.id && p.net === Math.round(p.gross * p.split * 100) / 100 && p.requestedAt));
  assert.ok(po.filter(p => p.receivedAt).length === 2 && po[2].receivedAt == null);
  assert.ok(C.sum(funded.map(t => t.pnl)) >= C.sum(po.map(p => p.gross)) * 0.8, 'Payouts aus dem Funded-Gewinn gedeckt');
  const copy = all.filter(t => t.propAccountIds.includes(Sample.ACC.topstep) && t.propAccountIds.includes(Sample.ACC.apex));
  assert.ok(copy.length >= 6 && copy.length <= 16, `${copy.length} Copy-Trades`);
  assert.ok(list.every(t => t.quantity <= 14));
});

test('FTMO (Forex/CFD): nur DAX/EURUSD/AAPL zugeordnet, Prop.evaluate bewertet das Konto als verletzt (Daily Loss 5 % = 5.000), Breach-Datensatz zeigt auf den auslösenden DAX-Verlust-Trade', () => {
  const e = ev(Sample.ACC.ftmo); const b = g.propBreaches[0]; const list = tradesOf(Sample.ACC.ftmo);
  assert.equal(e.status, 'breached'); assert.equal(e.breaches[0].rule, 'dailyLoss'); assert.ok(e.breaches[0].loss >= 5000, `Tagesverlust ${e.breaches[0].loss}`);
  assert.ok(b && b.rule === 'dailyLoss' && b.tradeId === e.breaches[0].tradeId && b.accountId === Sample.ACC.ftmo && b.note);
  const t = all.find(x => x.id === b.tradeId); assert.ok(t && t.pnl < 0 && t.propAccountIds.includes(Sample.ACC.ftmo) && t.symbol === 'DAX' && t.quantity === 75 && t.multiplier === 1);
  assert.equal(acc(Sample.ACC.ftmo).breachedAt, t.closedAt); assert.equal(b.at, t.closedAt);
  assert.ok(e.n >= 20, `${e.n} zugeordnete Trades`);
  assert.equal(acc(Sample.ACC.ftmo).market, 'forex');
  for (const x of list) assert.ok(['DAX', 'EURUSD', 'AAPL'].includes(x.symbol), `${x.symbol} gehört nicht auf ein Forex/CFD-Konto`);
  assert.ok(!all.some(x => ['NQ', 'ES', 'MNQ', 'GC', 'CL'].includes(x.symbol) && x.propAccountIds.includes(Sample.ACC.ftmo)), 'keine Futures bei FTMO');
  const breachDay = all.filter(x => x.dayKey === t.dayKey && x.propAccountIds.includes(Sample.ACC.ftmo)); assert.equal(breachDay.length, 4);
  assert.deepEqual(breachDay.map(x => x.symbol), ['DAX', 'DAX', 'DAX', 'EURUSD']);
  assert.ok(breachDay.every(x => x.open.getHours() >= 9 && x.open.getHours() < 14), 'Breach-Tag in der Frühsession');
  assert.ok(breachDay.some(x => x.voiceNotes.length), 'Sprachnotiz am Breach-Trade');
  assert.ok(C.sum(breachDay.slice(0, 2).map(x => x.pnl)) > -5000 && C.sum(breachDay.slice(0, 3).map(x => x.pnl)) < -5000, 'erst der dritte Trade reißt das Limit');
});

test('Heute: kein geschlossener Trade mit Ausstieg in der Zukunft; Replay-Screenshots unabhängig von der Uhrzeit', () => {
  const day = new Date(NOW); while (day.getDay() === 0 || day.getDay() === 6) day.setDate(day.getDate() - 1);
  const at = h => { const d = new Date(day); d.setHours(h, 30, 0, 0); return d; };
  const key = C.dayKey(day);
  for (const h of [10, 16, 18]) {
    const gen = Sample.generate({ now: at(h) }); const today = gen.trades.filter(t => C.dayKey(new Date(t.openedAt)) === key);
    assert.equal(today.filter(t => t.closedAt && new Date(t.closedAt) > at(h)).length, 0, `${h}:30: geschlossener Trade mit closedAt in der Zukunft`);
    assert.equal(today.filter(t => new Date(t.openedAt) > at(h)).length, 0, `${h}:30: Trade in der Zukunft eröffnet`);
    if (h >= 15) { const open = today.find(t => !t.closedAt); assert.ok(open && open.symbol === 'NQ' && open.exitPrice == null, 'laufender NQ-Trade'); }
    assert.equal(gen.screenshots.length, g.screenshots.length, 'Bildanzahl hängt nicht von der Uhrzeit ab');
    assert.ok(!gen.trades.some(t => t.screenshotPre && C.dayKey(new Date(t.openedAt)) === key), 'heutige Trades ohne Replay-Screenshot');
  }
});

test('Ausgaben und Bilanz: Challenge-Gebühren je Konto, Reset bei FTMO, Aktivierung bei Apex, zwei Monatsgebühren; Netto und ROI positiv', () => {
  const ex = g.propExpenses; const types = ex.map(e => e.type);
  for (const id of Object.values(Sample.ACC)) assert.ok(ex.some(e => e.accountId === id && e.type === 'challenge'), id);
  assert.ok(ex.some(e => e.accountId === Sample.ACC.ftmo && e.type === 'reset')); assert.ok(ex.some(e => e.accountId === Sample.ACC.apex && e.type === 'activation'));
  assert.equal(types.filter(t => t === 'subscription').length, 2);
  for (const e of ex) assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.amount > 0 && e.firm);
  const bs = P.balanceSheet(ex, g.propPayouts, g.propAccounts);
  assert.ok(bs.net > 0 && bs.roi > 0 && bs.pending > 0, `Netto ${bs.net} ROI ${bs.roi}`);
  assert.equal(bs.accounts.breached, 1); assert.equal(bs.accounts.funded, 1); assert.equal(bs.accounts.active, 2);
});

test('Blind-Replay: ≥ 25 Trades mit Screenshot vor Entry (+ Bild danach), zwei Sessions mit 20 bewerteten Karten, Bewertung stimmt mit Replay.grade überein', () => {
  const el = Rp.eligible(all); assert.ok(el.length >= 25, `${el.length} Karten`);
  for (const t of el) { assert.equal(t.screenshotPre, 'sample-pre-' + t.id); assert.deepEqual(t.screenshots, ['sample-post-' + t.id]); }
  assert.equal(g.screenshots.length, el.length * 2);
  for (const s of g.screenshots) assert.ok(['pre', 'post'].includes(s.kind) && s.symbol && s.entry > 0 && s.stop != null && s.time && s.seed);
  assert.equal(g.replay.length, 20); assert.equal(new Set(g.replay.map(c => c.sessionId)).size, 2);
  const byId = new Map(all.map(t => [t.id, t]));
  for (const c of g.replay) { const t = byId.get(c.tradeId); assert.ok(t && t.screenshotPre); assert.equal(c.correct, Rp.grade(t, c.decision).correct); assert.ok(c.confidence >= 1 && c.confidence <= 3 && c.at && new Date(c.at) < NOW); }
  const st = Rp.stats(g.replay, all); assert.ok(st.hitRate > 0 && st.hitRate < 1 && st.timeline.length === 2 && st.seenTrades === 20);
});

test('Sprachjournal: vier Notizen ohne Audio mit deutschem Transkript, Stimmung und Auswertung (source sample)', () => {
  const withVoice = all.filter(t => t.voiceNotes.length); assert.equal(withVoice.length, 4);
  assert.ok(withVoice.some(t => t.symbol === 'NQ'));
  for (const t of withVoice) for (const v of t.voiceNotes) {
    assert.equal(v.blobId, null); assert.equal(v.mime, null); assert.equal(v.duration, 24); assert.ok(v.transcript.length > 40 && /[äöüß]|ich|der|die/i.test(v.transcript));
    assert.ok(v.sentiment && v.sentiment.label); assert.equal(v.analysis.source, 'sample'); assert.equal(v.analysis.model, null); assert.ok(v.analysis.emotion && v.analysis.summary && Array.isArray(v.analysis.mistakes));
    assert.equal(v.pending, false); assert.equal(v.error, null); assert.ok(v.createdAt);
  }
});

test('Schatten-Ich: mit den Vorschlagsregeln (max. 3 Trades, 2 Verluste, 15 min Pause) mindestens 8 Verstöße, dazu Übergröße und Trades außerhalb 15:30–20:00', () => {
  const r = Sh.defaultRules(); r.maxTrades.on = true; r.lossStreak.on = true; r.cooldown.on = true;
  const res = Sh.evaluate(all, r, { account: 25000, now: NOW }); assert.ok(res.violations.length >= 8, `${res.violations.length} Verstöße`);
  const rules = ['maxTrades', 'lossStreak', 'cooldown'].filter(k => res.violations.some(v => v.rule === k)); assert.ok(rules.length >= 2, rules.join(','));
  const r2 = Sh.defaultRules(); r2.hours.on = true; r2.hours.from = '15:30'; r2.hours.to = '20:00'; r2.maxRisk.on = true; r2.maxRisk.unit = 'pct'; r2.maxRisk.value = 1.5;
  const res2 = Sh.evaluate(all, r2, { account: 25000, now: NOW });
  assert.ok(res2.violations.some(v => v.rule === 'hours'), 'außerhalb des Zeitfensters'); assert.ok(res2.violations.some(v => v.rule === 'maxRisk'), 'Übergröße');
  assert.ok(all.filter(t => t.mistakes.includes('Revenge-Trade')).length >= 4, 'Revenge-Trades');
});

test('Check-ins, Notizen, Regeln, verpasste Trades, Strategien wie bisher', () => {
  const days = Object.values(g.days); assert.ok(days.length >= 80 && days.filter(d => d.checkIn).length >= 50);
  assert.ok(g.notes.length >= 10 && g.notes.some(n => n.type === 'day') && g.notes.some(n => n.type === 'trade') && g.notes.some(n => n.title === 'FTMO-Konto geplatzt' || (n.content.ops[0].insert || '').includes('FTMO')));
  assert.equal(g.rules.length, 5); assert.equal(g.missed.length, 6); assert.equal(g.strategies.length, 2); assert.equal(g.folders.length, 2); assert.ok(g.noteTags.length >= 4);
  assert.ok(g.missed.some(m => m.symbol === 'NQ'));
});

/* ---------- Store: installieren, entfernen, Upgrade (store.js in einer Sandbox, localStorage simuliert) ---------- */
function makeStore(saved) {
  const mem = { v: saved == null ? null : JSON.stringify(saved) };
  globalThis.localStorage = { getItem: k => mem.v, setItem: (k, v) => { mem.v = v; }, removeItem: () => { mem.v = null; } };
  const sandbox = { Core: C, Shadow: Sh, Replay: Rp, Prop: P, PropData, Sample, console, setTimeout, clearTimeout };
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../js/store.js'), 'utf8');
  new Function('self', src)(sandbox);
  return { Store: sandbox.Store, mem };
}
const own = { id: 'own1', accountId: 'main', symbol: 'DAX', direction: 1, openedAt: '2026-01-05T09:00:00.000Z', closedAt: '2026-01-05T10:00:00.000Z', entryPrice: 18000, exitPrice: 18020, quantity: 1, multiplier: 1, fees: 1, screenshots: [], voiceNotes: [], propAccountIds: [Sample.ACC.apex, 'eigen'] };

test('Store.installSample: füllt Trades, Tage, Prop-Konten, Ausgaben, Payouts, Breaches, Replay-Verlauf; setzt sampleVersion 2; gibt Promise zurück', async () => {
  const { Store } = makeStore(null); Store.load();
  const p = Store.installSample(); assert.ok(p && typeof p.then === 'function'); assert.equal(await p, 0, 'in Node keine Bilder');
  assert.ok(Store.trades().length >= 150); assert.equal(Store.propAccounts().length, 4); assert.equal(Store.propExpenses().length, 8); assert.equal(Store.propPayouts().length, 3); assert.equal(Store.propBreaches().length, 1); assert.equal(Store.replayHistory().length, 20);
  assert.equal(Store.settings.sampleInstalled, true); assert.equal(Store.settings.sampleVersion, 2);
  assert.ok(Store.data.rules.length === 5 && Store.data.missed.length === 6 && Store.data.strategies.length === 2);
  assert.ok(Store.tradesForPropAccount(Sample.ACC.topstep).length >= 18);
  const again = Store.installSample(); await again; assert.equal(Store.propAccounts().length, 4, 'erneutes Laden ersetzt statt zu verdoppeln'); assert.equal(Store.replayHistory().length, 20);
});

test('Store.removeSample: entfernt alle Beispieldaten samt Prop-Verweisen und Replay-Karten, eigene Daten bleiben', async () => {
  const { Store } = makeStore(null); Store.load(); await Store.installSample();
  Store.data.trades.push(JSON.parse(JSON.stringify(own))); Store.addReplayCard({ tradeId: 'own1', decision: 'take', confidence: 2, correct: true, r: 1, at: new Date().toISOString(), sessionId: 'eigen' });
  Store.addPropAccount({ firm: 'Eigene', name: 'Test', size: 1000, rules: {}, phase: 'challenge1', status: 'active' }); Store.addPropExpense({ type: 'other', amount: 5, date: '2026-01-01', firm: 'Eigene' });
  const n = await Store.removeSample();
  assert.ok(n >= 50, `${n} Blob-Löschungen angestoßen`);
  assert.equal(Store.trades().length, 1); assert.equal(Store.trades()[0].id, 'own1'); assert.deepEqual(Store.trades()[0].propAccountIds, ['eigen']);
  assert.equal(Store.propAccounts().length, 1); assert.equal(Store.propAccounts()[0].firm, 'Eigene'); assert.equal(Store.propExpenses().length, 1); assert.equal(Store.propPayouts().length, 0); assert.equal(Store.propBreaches().length, 0);
  assert.equal(Store.replayHistory().length, 1); assert.equal(Store.replayHistory()[0].tradeId, 'own1');
  assert.equal(Object.values(Store.data.days).filter(d => d.sample).length, 0); assert.equal(Store.data.notes.filter(x => x.sample).length, 0); assert.equal(Store.data.rules.length, 0); assert.equal(Store.data.missed.length, 0); assert.equal(Store.data.strategies.length, 0); assert.equal(Store.data.folders.filter(f => f.sample).length, 0); assert.equal(Store.data.noteTags.length, 0);
  assert.equal(Store.settings.sampleInstalled, false);
});

test('Store.load: alte Installation (sampleInstalled, sampleVersion fehlt) bekommt die neuen Beispieldaten, eigener Trade bleibt', () => {
  const oldSample = { id: 'smpold', accountId: 'main', symbol: 'DAX', direction: 1, openedAt: '2026-02-02T09:00:00.000Z', closedAt: '2026-02-02T10:00:00.000Z', entryPrice: 18000, exitPrice: 18010, quantity: 1, multiplier: 1, fees: 1, sample: true, screenshots: [], voiceNotes: [] };
  const saved = { version: 1, settings: { sampleInstalled: true, onboarded: true }, trades: [oldSample, own], days: { '2026-02-02': { key: '2026-02-02', sample: true } }, notes: [], rules: [{ id: 'r9', text: 'Eigene Regel', active: true }], replay: { history: [] } };
  const { Store, mem } = makeStore(saved); Store.load();
  assert.equal(Store.settings.sampleVersion, 2); assert.equal(Store.settings.sampleInstalled, true);
  assert.ok(!Store.trades().some(t => t.id === 'smpold')); assert.ok(Store.trades().some(t => t.id === 'own1'));
  assert.ok(Store.trades().filter(t => t.symbol === 'NQ' && t.sample).length > 30); assert.equal(Store.propAccounts().length, 4);
  assert.ok(Store.data.rules.some(r => r.text === 'Eigene Regel') && Store.data.rules.length === 6);
  assert.ok(!Store.data.days['2026-02-02']);
  /* Ohne Beispieldaten passiert beim Laden nichts */
  const { Store: S2 } = makeStore({ version: 1, settings: { sampleInstalled: false, onboarded: true }, trades: [own] }); S2.load();
  assert.equal(S2.trades().length, 1); assert.equal(S2.propAccounts().length, 0);
  /* Aktuelle Version wird nicht erneut installiert (Verlauf bleibt unverändert) */
  const { Store: S3 } = makeStore({ version: 1, settings: { sampleInstalled: true, sampleVersion: 2, onboarded: true }, trades: [own], logs: [] }); S3.load();
  assert.equal(S3.trades().length, 1); assert.equal((S3.data.logs || []).length, 0);
  void mem;
});

test('Store: Beispiel-Tage – eigene Felder gewinnen, removeSample entfernt nur unveränderte Beispiel-Felder, leere Tage verschwinden', async () => {
  const { Store } = makeStore(null); Store.load();
  const keys = Object.keys(Sample.generate({ accountId: 'main' }).days); const kOwn = keys[30], kEdit = keys[31], kRules = keys[32];
  /* Eigener Check-in auf einem Tag, den das Beispiel ebenfalls belegt, bevor die Beispieldaten geladen werden */
  Store.setDay(kOwn, { checkIn: { sleep: 7.5, stress: 2, mood: 4, note: 'EIGEN', goal: 'ruhig bleiben', createdAt: '2026-01-01T12:00:00.000Z' } });
  await Store.installSample();
  const dOwn = Store.data.days[kOwn];
  assert.equal(dOwn.checkIn.note, 'EIGEN', 'eigener Check-in gewinnt gegen den Beispiel-Check-in'); assert.equal(dOwn.sample, true); assert.ok(dOwn.regime && dOwn.sampleFields.regime && !dOwn.sampleFields.checkIn);
  /* Check-in auf einem Beispiel-Tag bearbeiten, Regel-Häkchen auf einem anderen ändern */
  Store.setDay(kEdit, { checkIn: Object.assign({}, Store.data.days[kEdit].checkIn, { note: 'BEARBEITET' }) });
  const sampleRule = Store.data.rules.find(r => r.sample).id; Store.data.rules.push({ id: 'own-rule', text: 'Eigene Regel', active: true });
  Store.setDay(kRules, { rulesFollowed: [sampleRule, 'own-rule'] });
  const nDays = Object.keys(Store.data.days).length;
  await Store.removeSample();
  assert.equal(Object.values(Store.data.days).filter(d => d.sample || d.sampleFields).length, 0, 'keine Beispiel-Markierung mehr');
  assert.deepEqual(Object.keys(Store.data.days).sort(), [kOwn, kEdit, kRules].sort(), `nur Tage mit eigenen Feldern bleiben (vorher ${nDays})`);
  assert.equal(Store.data.days[kOwn].checkIn.note, 'EIGEN'); assert.ok(!Store.data.days[kOwn].regime && !Store.data.days[kOwn].rulesFollowed, 'Beispiel-Marktphase und -Häkchen entfernt');
  assert.equal(Store.data.days[kEdit].checkIn.note, 'BEARBEITET'); assert.ok(!Store.data.days[kEdit].regime);
  assert.deepEqual(Store.data.days[kRules].rulesFollowed, ['own-rule'], 'Häkchen auf Beispiel-Regeln fallen weg, eigenes bleibt'); assert.ok(!Store.data.days[kRules].checkIn);
  /* Erneut laden: eigene Felder gewinnen weiterhin, Entfernen lässt sie stehen */
  await Store.installSample(); assert.equal(Store.data.days[kEdit].checkIn.note, 'BEARBEITET'); assert.ok(Store.data.days[kEdit].regime);
  await Store.removeSample(); assert.equal(Store.data.days[kEdit].checkIn.note, 'BEARBEITET'); assert.equal(Object.keys(Store.data.days).length, 3);
});

test('Store.load (Upgrade v1 → v2): eigener Check-in auf einem alten Beispiel-Tag bleibt, generierte v1-Check-ins und leere Beispiel-Tage verschwinden', () => {
  const keys = Object.keys(Sample.generate({ accountId: 'main' }).days); const kOwn = keys[40], kGen = keys[41];
  const genCheckIn = { sleep: 7, stress: 2, mood: 4, note: 'Schlecht geschlafen, unruhig.', createdAt: new Date(C.parseDayKey(kGen).getTime() + 8 * 3600000).toISOString() };
  const days = { '2026-02-02': { key: '2026-02-02', sample: true } };
  days[kOwn] = { key: kOwn, sample: true, regime: { trend: 'up', vol: 'low' }, checkIn: { sleep: 8, stress: 1, mood: 5, note: 'EIGENER CHECK-IN auf einem Beispiel-Tag' } };
  days[kGen] = { key: kGen, sample: true, regime: { trend: 'down', vol: 'high' }, checkIn: genCheckIn, rulesFollowed: ['r1'] };
  const { Store } = makeStore({ version: 1, settings: { sampleInstalled: true, onboarded: true }, trades: [own], days, notes: [], rules: [{ id: 'r1', text: 'Nur mit vollständigem Plan handeln', active: true, sample: true }] }); Store.load();
  assert.equal(Store.settings.sampleVersion, 2);
  assert.ok(!Store.data.days['2026-02-02'], 'leerer v1-Beispiel-Tag gelöscht');
  assert.equal(Store.data.days[kOwn].checkIn.note, 'EIGENER CHECK-IN auf einem Beispiel-Tag', 'eigener Check-in überlebt das Upgrade');
  assert.ok(Store.data.days[kOwn].sample && Store.data.days[kOwn].regime && !Store.data.days[kOwn].sampleFields.checkIn, 'Tag trägt die neuen Beispiel-Felder, der Check-in gilt als eigen');
  const gen = Store.data.days[kGen]; assert.ok(gen.sample && gen.sampleFields.regime, 'generiert aussehender v1-Tag wird durch v2 ersetzt');
  assert.ok(gen.checkIn == null || gen.sampleFields.checkIn, 'v1-Check-in (8:00 Uhr, ohne Tagesziel) gilt als Beispiel und wird nicht als eigener übernommen');
});

test('Store: Schatten-Ich-Vorschlagsregeln – mit den Beispieldaten an (gemerkt, protokolliert), beim Entfernen wieder aus, außer das Regelwerk wurde geändert', async () => {
  const on = S => Object.entries(S.shadowRules()).filter(([k, r]) => r.on).map(([k]) => k).sort();
  const { Store } = makeStore(null); Store.load();
  assert.deepEqual(on(Store), []);
  await Store.installSample();
  assert.deepEqual(on(Store), ['cooldown', 'lossStreak', 'maxTrades']); assert.equal(Store.settings.sampleShadowRules, true);
  assert.ok(Store.data.logs.some(l => l.type === 'Schatten-Ich' && l.source === 'Beispieldaten' && /eingeschaltet/.test(l.action)));
  await Store.removeSample();
  assert.deepEqual(on(Store), [], 'wieder aus'); assert.equal(Store.settings.sampleShadowRules, undefined);
  assert.ok(Store.data.logs.some(l => l.type === 'Schatten-Ich' && /ausgeschaltet/.test(l.action)));
  /* Nutzer hatte schon eine Regel an: Beispieldaten ändern nichts, kein Flag */
  const r = Sh.defaultRules(); r.hours.on = true; Store.setShadowRules(r);
  await Store.installSample(); assert.deepEqual(on(Store), ['hours']); assert.equal(Store.settings.sampleShadowRules, undefined);
  await Store.removeSample(); assert.deepEqual(on(Store), ['hours']);
  /* Nutzer ändert das Regelwerk nach dem Laden: Entfernen lässt es stehen */
  Store.setShadowRules(Sh.defaultRules()); await Store.installSample(); assert.equal(Store.settings.sampleShadowRules, true);
  const r2 = Store.shadowRules(); r2.cooldown.on = false; r2.maxTrades.value = 5; Store.setShadowRules(r2);
  await Store.removeSample(); assert.deepEqual(on(Store), ['lossStreak', 'maxTrades']); assert.equal(Store.shadowRules().maxTrades.value, 5); assert.equal(Store.settings.sampleShadowRules, undefined);
  /* Upgrade in Store.load: Regeln gehen an und werden protokolliert (nicht stillschweigend) */
  const { Store: S2 } = makeStore({ version: 1, settings: { sampleInstalled: true, onboarded: true }, trades: [], logs: [] }); S2.load();
  assert.deepEqual(on(S2), ['cooldown', 'lossStreak', 'maxTrades']); assert.equal(S2.settings.sampleShadowRules, true); assert.ok(S2.data.logs.some(l => l.type === 'Schatten-Ich'));
});
