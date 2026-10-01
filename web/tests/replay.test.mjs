import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const C = require('../js/core.js');
const R = require('../js/replay.js');

/* Fixture: Einstieg 100, Stop 95 → Risiko 5 je Stück; Ausstieg 110 = +10 (Gewinner), 95 = −5 (Verlierer), 100 = Break-even. Alle mit Screenshot vor Entry. */
const mk = (o = {}) => Object.assign({ id: 'x', symbol: 'DAX', direction: 1, openedAt: '2026-03-02T09:00:00', closedAt: '2026-03-02T09:30:00', entryPrice: 100, exitPrice: 110, quantity: 1, multiplier: 1, fees: 0, plannedStop: 95, setup: 'Breakout', screenshotPre: 'blob-pre' }, o);
/* card(tradeId, correct, extra): ein Historien-Eintrag; 'at' wird fortlaufend vergeben, damit die Reihenfolge eindeutig ist */
let clock = 0;
const card = (tradeId, correct, extra = {}) => Object.assign({ tradeId, decision: correct ? 'take' : 'skip', confidence: 2, correct, at: new Date(Date.UTC(2026, 3, 1, 10, 0, clock++)).toISOString(), sessionId: 's1' }, extra);
const ids = list => list.map(t => t.id);

test('eligible: nur geschlossene Trades mit Screenshot vor Entry, rohe Trades werden abgeleitet', () => {
  const list = [mk({ id: 'a' }), mk({ id: 'open', closedAt: null, exitPrice: null }), mk({ id: 'none', screenshotPre: null }), mk({ id: 'empty', screenshotPre: '' }), mk({ id: 'blank', screenshotPre: '   ' }), mk({ id: 'num', screenshotPre: 42 }), mk({ id: 'b', exitPrice: 95 })];
  const e = R.eligible(list);
  assert.deepEqual(ids(e), ['a', 'b']); assert.equal(e[0].closed, true); assert.equal(e[0].pnl, 10); assert.equal(e[1].pnl, -5);
  assert.deepEqual(ids(R.eligible(C.deriveAll(list))), ['a', 'b']);
  assert.deepEqual(R.eligible([]), []); assert.deepEqual(R.eligible(undefined), []);
});

test('boxes: Start in Fach 1, richtig +1 bis Deckel 3, falsch zurück auf 1, Zähler und letzter Zeitpunkt', () => {
  const h = [card('x', false), card('x', true), card('x', true), card('x', true), card('y', true)];
  let b = R.boxes(h);
  assert.deepEqual(b.get('x'), { box: 3, seen: 4, correct: 3, last: h[3].at }); assert.deepEqual(b.get('y'), { box: 2, seen: 1, correct: 1, last: h[4].at }); assert.equal(b.has('z'), false);
  const reset = h.concat([card('x', false), card('x', true)]); b = R.boxes(reset);
  assert.equal(b.get('x').box, 2); assert.equal(b.get('x').seen, 6); assert.equal(b.get('x').correct, 4); assert.equal(b.get('x').last, reset[6].at);
  assert.equal(R.boxes([card('w', true)]).get('w').box, 2); assert.equal(R.boxes([card('w', false)]).get('w').box, 1);
  /* Unsortierte Historie wird nach 'at' geordnet, nicht nach Eingabereihenfolge: die chronologisch letzte Karte (falsch) entscheidet → Fach 1 */
  const right = card('q', true), wrong = card('q', false); assert.equal(R.boxes([wrong, right]).get('q').box, 1); assert.equal(R.boxes([right, wrong]).get('q').box, 1); assert.equal(R.boxes([wrong, right]).get('q').last, wrong.at);
  assert.equal(R.boxes([]).size, 0); assert.equal(R.boxes(undefined).size, 0); assert.equal(R.boxes([null, { correct: true }]).size, 0);
});

test('pick: n verschiedene Trades, nie mehr als vorhanden, deterministisch mit Seed', () => {
  const list = R.eligible(Array.from({ length: 12 }, (_, i) => mk({ id: 't' + i })));
  const a = R.pick(list, [], 5, C.mulberry(7)), b = R.pick(list, [], 5, C.mulberry(7)), c = R.pick(list, [], 5, C.mulberry(8));
  assert.equal(a.length, 5); assert.equal(new Set(ids(a)).size, 5); assert.deepEqual(ids(a), ids(b)); assert.notDeepEqual(ids(a), ids(c));
  assert.equal(R.pick(list, [], 50, C.mulberry(1)).length, 12); assert.equal(new Set(ids(R.pick(list, [], 50, C.mulberry(1)))).size, 12);
  assert.deepEqual(R.pick(list, [], 0, C.mulberry(1)), []); assert.deepEqual(R.pick([], [], 5, C.mulberry(1)), []);
  assert.equal(R.pick(list, [], undefined, C.mulberry(3)).length, 10); assert.equal(R.pick(list, []).length, 10);
  /* doppelte ids in der Eingabe werden nur einmal gezogen */
  assert.equal(R.pick(list.concat(list), [], 50, C.mulberry(2)).length, 12);
});

test('pick: Fach 1 kommt statistisch am häufigsten, dann nie gesehen, Fach 3 am seltensten (200 Ziehungen, Seed)', () => {
  const list = R.eligible(Array.from({ length: 30 }, (_, i) => mk({ id: 't' + i })));
  const hist = [];
  for (let i = 0; i < 5; i++) hist.push(card('t' + i, false));                       /* t0–t4: Fach 1 */
  for (let i = 5; i < 10; i++) { hist.push(card('t' + i, true)); hist.push(card('t' + i, true)); } /* t5–t9: Fach 3 */
  hist.push(card('t5', true));                                                             /* zuletzt gesehen: t5 (bleibt in Fach 3) */
  const b = R.boxes(hist); assert.equal(b.get('t0').box, 1); assert.equal(b.get('t9').box, 3); assert.equal(b.get('t5').box, 3);
  const rng = C.mulberry(42); const count = { 1: 0, 3: 0, unseen: 0 };
  for (let i = 0; i < 200; i++) { const first = R.pick(list, hist, 1, rng)[0]; const e = b.get(first.id); count[e ? e.box : 'unseen']++; }
  /* Erwartung je Trade: Fach 1 = 4, nie gesehen = 3, Fach 3 = 1 → 5 Trades Fach 1 ≈ 20/85, 20 nie gesehen ≈ 60/85, 4 Trades Fach 3 (t5 ausgeschlossen) ≈ 4/85 */
  assert.ok(count[1] > 2 * count[3], `Fach 1 (${count[1]}) sollte deutlich öfter kommen als Fach 3 (${count[3]})`);
  assert.ok(count.unseen > count[1], `nie gesehen (${count.unseen}) kommt bei 20 Trades öfter als Fach 1 (${count[1]})`);
  assert.ok(count[1] + count[3] + count.unseen === 200);
  /* pro Trade: ein Fach-1-Trade liegt über einem Fach-3-Trade */
  assert.ok(count[1] / 5 > count[3] / 4);
});

test('pick: der zuletzt gesehene Trade kommt nicht als erste Karte, wenn es Alternativen gibt', () => {
  const list = R.eligible([mk({ id: 'a' }), mk({ id: 'b' }), mk({ id: 'c' })]);
  const hist = [card('a', true), card('c', false), card('b', true)];
  for (let s = 1; s <= 60; s++) { const p = R.pick(list, hist, 3, C.mulberry(s)); assert.notEqual(p[0].id, 'b'); assert.equal(p.length, 3); assert.ok(ids(p).includes('b')); }
  /* nur ein Kandidat oder gar keine Historie: keine Einschränkung */
  assert.deepEqual(ids(R.pick(R.eligible([mk({ id: 'b' })]), hist, 3, C.mulberry(1))), ['b']);
  let sawB = false; for (let s = 1; s <= 30; s++) if (R.pick(list, [], 1, C.mulberry(s))[0].id === 'b') sawB = true; assert.ok(sawB);
});

test('grade: Gewinner, Verlierer, Break-even; r null bleibt null', () => {
  const win = C.derive(mk()), loss = C.derive(mk({ exitPrice: 95 })), be = C.derive(mk({ exitPrice: 100 }));
  assert.deepEqual(R.grade(win, 'take'), { correct: true, winner: true, r: 2, pnl: 10 }); assert.equal(R.grade(win, 'skip').correct, false);
  assert.deepEqual(R.grade(loss, 'skip'), { correct: true, winner: false, r: -1, pnl: -5 }); assert.equal(R.grade(loss, 'take').correct, false);
  /* Break-even zählt als Verlierer: Skippen ist richtig */
  assert.equal(be.status, 'be'); assert.deepEqual(R.grade(be, 'skip'), { correct: true, winner: false, r: 0, pnl: 0 }); assert.equal(R.grade(be, 'take').correct, false);
  assert.equal(R.grade(mk({ exitPrice: 100.001 }), 'take').correct, false); assert.equal(R.grade(mk({ exitPrice: 100.01 }), 'take').correct, true);
  const noRisk = R.grade(mk({ plannedStop: null }), 'take'); assert.equal(noRisk.r, null); assert.equal(noRisk.pnl, 10); assert.equal(noRisk.correct, true);
  assert.equal(R.grade(mk({ plannedStop: null, exitPrice: 90 }), 'skip').r, null);
  /* rohe Trades und Kurzschreibweisen */
  assert.equal(R.grade(mk({ exitPrice: 120 }), 'TAKE').correct, true); assert.equal(R.grade(mk({ exitPrice: 120 }), undefined).correct, false);
  assert.equal(R.isWinner(mk()), true); assert.equal(R.isWinner(mk({ exitPrice: 100 })), false);
});

test('stats: leere Historie → alles leer, hitRate und recent null', () => {
  const s = R.stats([], R.eligible([mk({ id: 'a' })]));
  assert.equal(s.n, 0); assert.equal(s.correct, 0); assert.equal(s.hitRate, null); assert.deepEqual(s.bySetup, []); assert.deepEqual(s.byConfidence, []); assert.deepEqual(s.timeline, []); assert.equal(s.recent, null); assert.deepEqual(s.boxes, { 1: 0, 2: 0, 3: 0 }); assert.equal(s.unseen, 1);
  const e = R.stats(undefined, undefined); assert.equal(e.n, 0); assert.equal(e.hitRate, null); assert.deepEqual(e.boxes, { 1: 0, 2: 0, 3: 0 });
});

test('stats: bySetup, byConfidence, timeline je Session, Karteikasten über vorhandene Trades', () => {
  const trades = C.deriveAll([mk({ id: 'a', setup: 'Breakout' }), mk({ id: 'b', setup: 'Pullback' }), mk({ id: 'c', setup: '' }), mk({ id: 'd', setup: 'Breakout' }), mk({ id: 'e', setup: 'Range' })]);
  const hist = [
    card('a', true, { confidence: 3, sessionId: 's1' }), card('b', false, { confidence: 1, sessionId: 's1' }), card('c', true, { confidence: 2, sessionId: 's1' }),
    card('a', true, { confidence: 3, sessionId: 's2' }), card('d', false, { confidence: 2, sessionId: 's2' }),
  ];
  const s = R.stats(hist, trades);
  assert.equal(s.n, 5); assert.equal(s.correct, 3); assert.equal(s.hitRate, 0.6); assert.equal(s.recent, 0.6);
  assert.equal(s.bySetup[0].setup, 'Breakout'); assert.deepEqual(s.bySetup[0], { setup: 'Breakout', n: 3, correct: 2, hitRate: 2 / 3 });
  assert.deepEqual(s.bySetup.find(x => x.setup === 'Pullback'), { setup: 'Pullback', n: 1, correct: 0, hitRate: 0 });
  assert.deepEqual(s.bySetup.find(x => x.setup === 'Ohne Setup'), { setup: 'Ohne Setup', n: 1, correct: 1, hitRate: 1 });
  assert.equal(s.bySetup.length, 3); assert.ok(s.bySetup.every((x, i, arr) => i === 0 || arr[i - 1].n >= x.n));
  assert.deepEqual(s.byConfidence, [{ confidence: 1, n: 1, correct: 0, hitRate: 0 }, { confidence: 2, n: 2, correct: 1, hitRate: 0.5 }, { confidence: 3, n: 2, correct: 2, hitRate: 1 }]);
  assert.equal(s.timeline.length, 2); assert.deepEqual(s.timeline[0], { sessionId: 's1', at: hist[0].at, n: 3, correct: 2, hitRate: 2 / 3 }); assert.deepEqual(s.timeline[1], { sessionId: 's2', at: hist[3].at, n: 2, correct: 1, hitRate: 0.5 });
  /* a: zweimal richtig → Fach 3, b und d falsch → Fach 1, c richtig → Fach 2, e nie gesehen */
  assert.deepEqual(s.boxes, { 1: 2, 2: 1, 3: 1 }); assert.equal(s.seenTrades, 4); assert.equal(s.unseen, 1);
  /* Gelöschter Trade d: Karte zählt weiter, landet bei „Ohne Setup“, fehlt im Karteikasten */
  const s2 = R.stats(hist, trades.filter(t => t.id !== 'd'));
  assert.equal(s2.n, 5); assert.deepEqual(s2.boxes, { 1: 1, 2: 1, 3: 1 }); assert.equal(s2.bySetup.find(x => x.setup === 'Ohne Setup').n, 2); assert.equal(s2.bySetup.find(x => x.setup === 'Breakout').n, 2);
  /* Sessions in chronologischer Reihenfolge auch bei durcheinander gelieferter Historie */
  const rev = R.stats(hist.slice().reverse(), trades); assert.deepEqual(rev.timeline.map(x => x.sessionId), ['s1', 's2']); assert.equal(rev.boxes[3], 1);
});

test('stats: recent nimmt genau die letzten 20 Karten', () => {
  const trades = C.deriveAll(Array.from({ length: 30 }, (_, i) => mk({ id: 't' + i })));
  const hist = Array.from({ length: 30 }, (_, i) => card('t' + i, i >= 10, { sessionId: 's' + Math.floor(i / 10) }));
  const s = R.stats(hist, trades); assert.equal(s.n, 30); assert.ok(Math.abs(s.hitRate - 20 / 30) < 1e-12); assert.equal(s.recent, 1); assert.equal(s.timeline.length, 3);
  const h2 = Array.from({ length: 25 }, (_, i) => card('t' + i, i < 5 || i % 2 === 0)); /* erste 5 richtig, dann im Wechsel: letzte 20 = 10 richtig */
  const s2 = R.stats(h2, trades); assert.equal(s2.recent, 0.5); assert.equal(s2.hitRate, 15 / 25);
  const h3 = Array.from({ length: 7 }, (_, i) => card('t' + i, i < 2)); assert.equal(R.stats(h3, trades).recent, 2 / 7);
});
