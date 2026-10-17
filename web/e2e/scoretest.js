/* Gesamt-Score im Netz-Design (Vorlage heygaia/radar-chart): „jetzt / vorher“ an jedem Punkt, Vorzeitraum gestrichelt mit Legende,
   Punkte über das Zahnrad wählbar (mindestens 3, „Standard“), Score = Mittelwert der gewählten Punkte, Gesamt gegen die letzten 30 Tage, Englisch, Handy */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
const view = () => { const w = document.querySelector('.w[data-typ="score"]'); const svg = w && w.querySelector('svg.r2-svg'); return { labels: svg ? [...svg.querySelectorAll('.r2-lbl')].map(t => [...t.querySelectorAll('tspan')].map(s => s.textContent)) : [], prev: !!(svg && svg.querySelector('.r2-prev')), cur: !!(svg && svg.querySelector('.r2-cur')), legend: w ? [...w.querySelectorAll('.r2-legend > span')].map(s => s.textContent.trim()) : [], big: w ? +w.querySelector('.score-big').textContent : null, delta: w && w.querySelector('.r2-delta') ? w.querySelector('.r2-delta').textContent : '', gear: !!(w && w.querySelector('[data-action="dash-w-settings"]')), keys: (Store.activeDashboard().layout.unten.find(x => x.typ === 'score').einstellungen || {}).achsen || null }; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(() => { Store.setSetting('uiMode', 'advanced'); Store.setSetting('range', { preset: 'month', from: null, to: null }); Store.setSetting('dashFilter', null); Store.saveNow(); App.rerender(); }); await p.waitForTimeout(700);
  /* 1: Standard mit Vorzeitraum */
  let v = await p.evaluate(view);
  const exp = await p.evaluate(() => { const r = App.range(); const pf = new Date(r.from.getFullYear(), r.from.getMonth() - 1, 1), pt = new Date(r.from.getFullYear(), r.from.getMonth(), 0, 23, 59, 59, 999); const prev = Core.closedOnly(App.allTrades()).filter(t => t.close >= pf && t.close <= pt); const cur = Core.scoreAxes(App.tradesInRange(), Store.accountSize()), ps = Core.scoreAxes(prev, Store.accountSize());
    return { overall: cur.overall, trader: Core.traderScore(App.tradesInRange(), Store.accountSize()).overall, pairs: cur.axes.map((a, i) => `${Math.round(a.score * 100)} / ${Math.round(ps.axes[i].score * 100)}`), prevOverall: ps.overall, n: prev.length }; });
  ok(v.cur && v.prev && v.labels.length === 6 && v.labels.map(l => l[0]).join('|') === exp.pairs.join('|') && v.labels[0][1] === 'Trefferquote', 'Sechs Punkte, je „jetzt / vorher“ und Name · ' + v.labels.map(l => l.join(' ')).join(', '));
  ok(v.legend.length === 2 && /2026/.test(v.legend[0]) && v.legend[0] !== v.legend[1], 'Legende: gewählter Monat und Vormonat · ' + v.legend.join(' | '));
  ok(v.big === exp.overall && exp.overall === exp.trader && v.delta.includes(String(Math.abs(exp.overall - exp.prevOverall))), `Score ${v.big} wie bisher (traderScore ${exp.trader}), Veränderung zum Vormonat ${v.delta}`);
  /* 2: Tooltip nennt beide Zeiträume */
  const hb = await (await p.$('.w[data-typ="score"] .r2-hit[data-i="0"]')).boundingBox(); await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.waitForTimeout(350);
  const tip = await p.evaluate(() => (document.getElementById('tip') || {}).textContent || '');
  ok(/Trefferquote/.test(tip) && (tip.match(/Teilscore \d+/g) || []).length === 2, 'Tooltip: Punkt mit Wert und Teilscore für beide Zeiträume · ' + tip);
  await p.mouse.move(5, 5);
  /* 3: Zahnrad → Punkte wählen, mindestens 3 */
  await p.click('.w[data-typ="score"] [data-action="dash-w-settings"]'); await p.waitForTimeout(400);
  const m0 = await p.evaluate(() => ({ title: document.querySelector('.modal h2').textContent, n: document.querySelectorAll('.modal input[name=achse]').length, on: document.querySelectorAll('.modal input[name=achse]:checked').length, cnt: document.querySelector('.modal .sc-n').textContent }));
  ok(m0.title === 'Punkte im Score' && m0.n === 12 && m0.on === 6 && /6 von 12 gewählt/.test(m0.cnt), 'Einstellungen: 12 Punkte zur Wahl, 6 Standard-Punkte an · ' + JSON.stringify(m0));
  for (const k of ['consistency', 'rules', 'drawdown']) await p.click(`.modal input[value="${k}"]`);
  const m1 = await p.evaluate(() => ({ on: document.querySelectorAll('.modal input[name=achse]:checked').length, locked: [...document.querySelectorAll('.modal input[name=achse]:checked')].every(i => i.disabled), free: [...document.querySelectorAll('.modal input[name=achse]:not(:checked)')].every(i => !i.disabled), cnt: document.querySelector('.modal .sc-n').textContent }));
  ok(m1.on === 3 && m1.locked && m1.free && /mindestens 3 Punkte/.test(m1.cnt), 'Bei 3 Punkten lassen sich die letzten nicht abwählen, Hinweis „mindestens 3 Punkte“ · ' + JSON.stringify(m1));
  await p.click('.modal input[value="winRate"]', { force: true }); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelectorAll('.modal input[name=achse]:checked').length === 3), 'Abwählen unter 3 geht nicht');
  await p.click('.modal input[value="dayWin"]'); await p.click('.modal input[value="review"]'); await p.click('.modal [type=submit]'); await p.waitForTimeout(600);
  v = await p.evaluate(view);
  const exp2 = await p.evaluate(keys => { const s = Core.scoreAxes(App.tradesInRange(), Store.accountSize(), keys); return { overall: s.overall, mean: Math.round(s.axes.reduce((a, x) => a + x.score, 0) / s.axes.length * 100) }; }, v.keys);
  ok(v.keys && v.keys.join(',') === 'winRate,profitFactor,payoff,dayWin,review' && v.labels.length === 5 && v.labels.map(l => l.slice(1).join('')).join('|') === 'Trefferquote|Profit-Faktor|Gewinn/Verlust|Tages-Trefferquote|Nachbereitung', 'Gespeichert: 5 gewählte Punkte im Netz · ' + JSON.stringify(v.keys) + ' · ' + v.labels.map(l => l.slice(1).join('')).join(', '));
  ok(v.big === exp2.overall && exp2.overall === exp2.mean, `Score = Mittelwert der gewählten Punkte (${v.big})`);
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1000);
  v = await p.evaluate(view);
  ok(v.labels.length === 5 && v.keys.length === 5, 'Nach dem Neuladen bleibt die Auswahl');
  /* 4: „Standard“ stellt die sechs Punkte wieder her */
  await p.click('.w[data-typ="score"] [data-action="dash-w-settings"]'); await p.waitForTimeout(400); await p.click('.modal [data-sc-default]'); await p.click('.modal [type=submit]'); await p.waitForTimeout(500);
  v = await p.evaluate(view);
  ok(v.labels.length === 6 && v.keys === null, '„Standard“: wieder die sechs Punkte, keine eigene Auswahl gespeichert');
  /* 5: Gesamt: Vergleich mit den letzten 30 Tagen */
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); App.rerender(); }); await p.waitForTimeout(600);
  v = await p.evaluate(view);
  const r30 = await p.evaluate(() => { const to = new Date(); to.setHours(23, 59, 59, 999); const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - 29); const l = Core.closedOnly(App.allTrades()).filter(t => t.close >= from && t.close <= to); const a = Core.scoreAxes(App.allTrades(), Store.accountSize()), b = Core.scoreAxes(l, Store.accountSize()); return a.axes.map((x, i) => `${Math.round(x.score * 100)} / ${Math.round(b.axes[i].score * 100)}`); });
  ok(v.prev && v.legend.join('|') === 'Gesamt|Letzte 30 Tage' && /[↗↘→]/.test(v.delta) && v.labels.map(l => l[0]).join('|') === r30.join('|'), 'Gesamt: zweite Linie mit den letzten 30 Tagen, Legende „Gesamt | Letzte 30 Tage“ · ' + v.labels.map(l => l[0]).join(', '));
  await p.screenshot({ path: 'langshots/score-gesamt.png' });
  /* 6: Englisch und Handy */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push(e.message));
  await m.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(600);
  await m.evaluate(() => { Store.setSetting('language', 'en'); Store.setSetting('uiMode', 'advanced'); Store.setSetting('range', { preset: 'month', from: null, to: null }); Store.saveNow(); location.reload(); }); await m.waitForTimeout(1500);
  await m.evaluate(() => document.querySelector('.w[data-typ="score"]').scrollIntoView()); await m.waitForTimeout(300);
  const mo = await m.evaluate(() => { const w = document.querySelector('.w[data-typ="score"]'); const svg = w.querySelector('svg.r2-svg'); const bb = svg.getBBox(), vb = svg.viewBox.baseVal; return { names: [...svg.querySelectorAll('.r2-n')].map(t => t.textContent).join('|'), legend: [...w.querySelectorAll('.r2-legend > span')].map(s => s.textContent.trim()).join('|'), fits: bb.x >= -1 && bb.y >= -1 && bb.x + bb.width <= vb.width + 1 && bb.y + bb.height <= vb.height + 1, sx: document.documentElement.scrollWidth - innerWidth }; });
  ok(/Win rate/.test(mo.names) && /Drawdown/.test(mo.names) && /Oct 2026|Sep 2026/.test(mo.legend), 'Englisch: Punkte und Legende übersetzt · ' + mo.names + ' · ' + mo.legend);
  ok(mo.fits && mo.sx === 0, 'Handy: Netz mit Beschriftungen passt, kein Querscrollen');
  await m.screenshot({ path: 'langshots/score-handy-en.png' });
  await m.evaluate(() => { Store.setSetting('language', 'de'); Store.saveNow(); });
  ok(await p.evaluate(() => /\d+ \/ \d+/.test(WidgetPreviews.svg('score', 'radar')) && (WidgetPreviews.svg('score', 'radar').match(/<polygon/g) || []).length >= 6), 'Vorschaubild: Netz mit zwei Flächen und „jetzt / vorher“');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0);
})();
