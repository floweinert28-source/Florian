/* Disziplin-Trichter: Platz im Standard-Dashboard (auch per Migration), Stufen und Zahlen, Hover, Klick ins TradeLog mit Chip,
   saubere Trades, fehlende Stufen, Handy, hell, Englisch, Vorschaubild */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
/* unabhängig nachgerechnet: jede Stufe zählt, was sie und alle davor schafft */
const expected = () => { const c = Core.closedOnly(App.tradesInRange(App.allTrades())); const stop = t => t.plannedStop != null && t.plannedStop !== '' && !(t.status === 'loss' && t.r != null && t.r < -1.15);
  const a = c.filter(t => t.setup), b = a.filter(stop), r = b.filter(t => !t.rulesBroken.length), m = r.filter(t => !t.mistakes.length); return [c.length, a.length, b.length, r.length, m.length]; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(() => { Store.setSetting('uiMode', 'advanced'); Store.setSetting('range', { preset: 'all', from: null, to: null }); Store.setSetting('dashFilter', null); Store.saveNow(); App.rerender(); }); await p.waitForTimeout(600);
  /* 1: Standard-Dashboard */
  const lay = await p.evaluate(() => Store.activeDashboard().layout.unten.map(w => w.typ));
  const sz = await p.evaluate(() => { const w = document.querySelector('.w[data-typ="disziplin_trichter"]'), s = document.querySelector('.w[data-typ="score"]'); const a = w.getBoundingClientRect(), b = s.getBoundingClientRect(); return { cls: w.classList.contains('sz-mittel'), ratio: +(a.width / b.width).toFixed(2), sameRow: Math.abs(a.top - b.top) < 2, size: Store.activeDashboard().layout.unten[1].groesse }; });
  ok(lay[1] === 'disziplin_trichter' && !lay.includes('pnl_pro_tag') && sz.cls && sz.size === 'mittel' && sz.ratio > 2 && sz.sameRow, 'Standard-Dashboard: Trichter zwei Spalten breit neben dem Score · ' + lay.slice(0, 5).join(',') + ' · ' + JSON.stringify(sz));
  ok(await p.evaluate(() => Sample.VERSION >= 4 && Core.closedOnly(App.allTrades()).filter(t => t.mistakes.includes('Revenge-Trade')).every(t => !t.setup)), 'Beispieldaten: Revenge-Trades ohne Setup');
  /* 2: Stufen und Zahlen */
  const exp = await p.evaluate(expected);
  const got = await p.evaluate(() => ({ v: [...document.querySelectorAll('.fn-col .fn-v')].map(x => x.textContent), p: [...document.querySelectorAll('.fn-col .fn-p')].map(x => x.textContent.replace(/\s/g, ' ')), l: [...document.querySelectorAll('.fn-col .fn-lb')].map(x => x.textContent), segs: document.querySelectorAll('.fn-seg').length, layers: document.querySelectorAll('.fn-seg path').length }));
  ok(got.v.join(',') === exp.join(',') && got.segs === 5 && got.layers === 15, 'Fünf Stufen mit je drei Schichten, Anzahlen stimmen · ' + got.v.join(',') + ' erwartet ' + exp.join(','));
  ok(got.l.join('|') === 'Alle Trades|Mit Setup|Stop gehalten|Regeln gehalten|Ohne Fehler' && got.p[0] === '100 %' && got.p[4] === Math.round(exp[4] / exp[0] * 100) + ' %', 'Namen und Prozent (bezogen auf alle Trades) · ' + got.p.join(','));
  ok(exp[1] < exp[0] && exp[4] < exp[3], 'Trichter wird schmaler (Beispieldaten fallen auf mehreren Stufen raus)');
  const say = await p.evaluate(() => { const c = Core.closedOnly(App.tradesInRange(App.allTrades())); const stop = t => t.plannedStop != null && !(t.status === 'loss' && t.r != null && t.r < -1.15); const clean = c.filter(t => t.setup && stop(t) && !t.rulesBroken.length && !t.mistakes.length); const rest = c.filter(t => !clean.includes(t));
    return { text: document.querySelector('.fn-say').textContent, exp: `Saubere Trades gewinnen ${UI.fmt.pct(Core.summary(clean).winRate, 0)}, alle anderen ${UI.fmt.pct(Core.summary(rest).winRate, 0)}.` }; });
  ok(say.text === say.exp, 'Satz darunter: Trefferquote sauber gegen den Rest · ' + say.text);
  /* 3: Hover und Tooltip */
  await p.hover('.fn-col[data-i="1"]'); await p.waitForTimeout(350);
  const hov = await p.evaluate(() => ({ hov: document.querySelector('.fn').classList.contains('hov'), on: document.querySelector('.fn-seg[data-i="1"]').classList.contains('on'), dim: getComputedStyle(document.querySelector('.fn-seg[data-i="3"]')).opacity, tip: (document.getElementById('tip') || {}).textContent || '' }));
  ok(hov.hov && hov.on && +hov.dim < 0.6 && /Mit Setup/.test(hov.tip) && /fallen hier raus|fällt hier raus/.test(hov.tip), 'Hover: Stufe hervorgehoben, Rest tritt zurück, Tooltip mit Anzahl und „fallen hier raus“ · ' + JSON.stringify(hov));
  ok(await p.evaluate(() => [...document.querySelectorAll('.fn-col')].every(c => c.tagName === 'BUTTON' && /von \d+ Trades/.test(c.getAttribute('aria-label')))), 'Jede Stufe ist ein Knopf mit Beschriftung für Screenreader');
  /* 4: Klick auf „Mit Setup“: TradeLog mit genau den Trades ohne Setup, Chip, × hebt auf */
  const dropN = await p.evaluate(() => UI.chartData['dash-funnel'].stages[1].dropIds.length);
  await p.click('.fn-col[data-i="1"]'); await p.waitForTimeout(800);
  const tl = await p.evaluate(() => ({ hash: location.hash, chip: (document.querySelector('.tl-ids') || {}).textContent || '', rows: document.querySelectorAll('.tl-table tbody tr, table.tbl tbody tr').length, count: (document.querySelector('.tl-count') || {}).textContent || '' }));
  ok(tl.hash === '#/trades' && /Ohne Setup/.test(tl.chip) && tl.rows === dropN && tl.count.startsWith(dropN + ' von'), `Klick auf „Mit Setup“: TradeLog mit den ${dropN} Trades ohne Setup und Chip · ` + JSON.stringify(tl));
  await p.click('.tl-ids-x'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => !document.querySelector('.tl-ids') && !App.state.tradeFilter.ids), '× am Chip hebt den Trichter-Filter auf');
  /* 5: „Saubere Trades ansehen“ */
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(800);
  await p.click('.fn-foot [data-i="clean"]'); await p.waitForTimeout(800);
  const cl = await p.evaluate(() => ({ chip: (document.querySelector('.tl-ids') || {}).textContent || '', count: (document.querySelector('.tl-count') || {}).textContent || '' }));
  ok(/Saubere Trades/.test(cl.chip) && cl.count.startsWith(exp[4] + ' von'), 'Saubere Trades ansehen: TradeLog nur mit den sauberen Trades · ' + JSON.stringify(cl));
  await p.click('[data-action="trade-filter-reset"]'); await p.waitForTimeout(300);
  /* 6: Migration: altes Standard-Dashboard mit „Netto-P&L pro Tag“ wird einmal getauscht, eigene Vorlagen nicht */
  await p.evaluate(() => { const k = 'trading-journal-web-v1'; const d = JSON.parse(localStorage.getItem(k)); const std = d.dashboards.find(x => x.isDefault); std.layout.unten = std.layout.unten.map(w => w.typ === 'disziplin_trichter' ? { typ: 'pnl_pro_tag', groesse: 'mittel' } : w); d.dashboards.push({ id: 'eigen', name: 'Eigen', isDefault: false, layout: { oben: [], unten: [{ typ: 'pnl_pro_tag', groesse: 'klein' }] } }); d.dashboardsVersion = 5; localStorage.setItem(k, JSON.stringify(d)); location.reload(); });
  await p.waitForTimeout(1500);
  const mig = await p.evaluate(() => { const std = Store.data.dashboards.find(x => x.isDefault); const own = Store.data.dashboards.find(x => x.id === 'eigen'); const i = std.layout.unten.findIndex(w => w.typ === 'disziplin_trichter'); return { i, size: i >= 0 ? std.layout.unten[i].groesse : '', old: std.layout.unten.some(w => w.typ === 'pnl_pro_tag'), own: own && own.layout.unten.map(w => w.typ).join(','), v: Store.data.dashboardsVersion }; });
  ok(mig.i === 1 && mig.size === 'mittel' && !mig.old && mig.own === 'pnl_pro_tag' && mig.v >= 6, 'Migration: Standard-Dashboard tauscht an gleicher Stelle und Größe, eigene Vorlage bleibt · ' + JSON.stringify(mig));
  await p.evaluate(() => { Store.data.dashboards = Store.data.dashboards.filter(x => x.id !== 'eigen'); Store.saveNow(); });
  /* 6b: Migration 8: alter Standard (Trichter klein an dritter Stelle) wird breit und rückt neben den Score; eigene Vorlage bleibt klein */
  await p.evaluate(() => { const k = 'trading-journal-web-v1'; const d = JSON.parse(localStorage.getItem(k)); const std = d.dashboards.find(x => x.isDefault); const by = t => std.layout.unten.find(w => w.typ === t); std.layout.unten = [by('score'), by('pnl_vergleich'), { typ: 'disziplin_trichter', groesse: 'klein' }, by('letzte_trades'), by('kalender'), ...std.layout.unten.filter(w => !['score', 'pnl_vergleich', 'disziplin_trichter', 'letzte_trades', 'kalender'].includes(w.typ))]; d.dashboards.push({ id: 'eigen3', name: 'Eigen', isDefault: false, layout: { oben: [], unten: [{ typ: 'disziplin_trichter', groesse: 'klein' }] } }); d.dashboardsVersion = 7; localStorage.setItem(k, JSON.stringify(d)); location.reload(); });
  await p.waitForTimeout(1500);
  const m8 = await p.evaluate(() => { const std = Store.data.dashboards.find(x => x.isDefault); const own = Store.data.dashboards.find(x => x.id === 'eigen3'); return { order: std.layout.unten.slice(0, 5).map(w => w.typ + ':' + w.groesse).join(','), own: own.layout.unten[0].groesse, v: Store.data.dashboardsVersion }; });
  ok(m8.order === 'score:klein,disziplin_trichter:mittel,pnl_vergleich:klein,kalender:mittel,letzte_trades:klein' && m8.own === 'klein' && m8.v >= 8, 'Migration 8: Trichter wird breit und rückt neben den Score, eigene Vorlage bleibt · ' + JSON.stringify(m8));
  await p.evaluate(() => { const k = 'trading-journal-web-v1'; const d = JSON.parse(localStorage.getItem(k)); const std = d.dashboards.find(x => x.isDefault); const fn = std.layout.unten.find(w => w.typ === 'disziplin_trichter'); fn.groesse = 'klein'; std.layout.unten = [fn, ...std.layout.unten.filter(w => w !== fn)]; d.dashboards = d.dashboards.filter(x => x.id !== 'eigen3'); d.dashboardsVersion = 7; localStorage.setItem(k, JSON.stringify(d)); location.reload(); });
  await p.waitForTimeout(1500);
  const m8b = await p.evaluate(() => Store.data.dashboards.find(x => x.isDefault).layout.unten.slice(0, 3).map(w => w.typ + ':' + w.groesse).join(','));
  ok(/^disziplin_trichter:mittel,score:klein,/.test(m8b), 'Migration 8: eigene Reihenfolge im Standard bleibt, Trichter wird nur breit · ' + m8b);
  await p.evaluate(() => { const std = Store.data.dashboards.find(x => x.isDefault); const fn = std.layout.unten.shift(); std.layout.unten.splice(1, 0, fn); Store.saveNow(); });
  /* 7: fehlende Stufen: ohne Setups fällt die Stufe weg, mit Hinweis */
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(600);
  const miss = await p.evaluate(() => { const keep = Store.data.trades.map(t => [t, t.setup]); Store.data.trades.forEach(t => { t.setup = ''; }); App.rerender(); return new Promise(res => setTimeout(() => { const r = { l: [...document.querySelectorAll('.fn-col .fn-lb')].map(x => x.textContent).join('|'), hint: !!document.querySelector('.fn-miss') }; keep.forEach(([t, s]) => { t.setup = s; }); App.rerender(); res(r); }, 400)); });
  ok(miss.l === 'Alle Trades|Stop gehalten|Regeln gehalten|Ohne Fehler' && miss.hint, 'Ohne Setups: Stufe fehlt, Hinweis „Weitere Stufen erscheinen …“ · ' + JSON.stringify(miss));
  /* 8: Vorschaubild in der Widget-Bibliothek */
  ok(await p.evaluate(() => WidgetPreviews.has('disziplin_trichter') && /<path/.test(WidgetPreviews.svg('disziplin_trichter', 'funnel'))), 'Vorschaubild für „Widget hinzufügen“');
  /* 9: hell */
  await p.evaluate(() => { Store.setSetting('theme', 'light'); Theme.apply(Store.settings); App.rerender(); }); await p.waitForTimeout(500);
  const lt = await p.evaluate(() => { const pill = document.querySelector('.fn-p'); const cs = getComputedStyle(pill); return { bg: cs.backgroundColor, fg: cs.color }; });
  ok(lt.bg !== lt.fg && /rgb\(25[0-5], 25[0-5], 25[0-5]\)|rgb\(252, 252, 251\)/.test(lt.bg), 'Hell: Prozent-Pillen hell mit dunkler Schrift · ' + JSON.stringify(lt));
  await p.screenshot({ path: 'langshots/trichter-hell.png' });
  await p.evaluate(() => { Store.setSetting('theme', 'dark'); Theme.apply(Store.settings); App.rerender(); }); await p.waitForTimeout(300);
  /* 10: Handy und Englisch */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push(e.message));
  await m.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(600);
  await m.evaluate(() => { Store.setSetting('language', 'en'); Store.setSetting('uiMode', 'advanced'); Store.saveNow(); location.reload(); }); await m.waitForTimeout(1500);
  await m.evaluate(() => document.querySelector('.w[data-typ="disziplin_trichter"]').scrollIntoView()); await m.waitForTimeout(300);
  const mo = await m.evaluate(() => { const w = document.querySelector('.w[data-typ="disziplin_trichter"]'); const r = w.getBoundingClientRect(); return { over: [...w.querySelectorAll('*')].some(e => e.getBoundingClientRect().right > innerWidth + 1), clip: [...w.querySelectorAll('.fn-lb')].some(x => x.scrollHeight > x.clientHeight + 1), labels: [...w.querySelectorAll('.fn-lb')].map(x => x.textContent).join('|'), say: w.querySelector('.fn-say').textContent, title: w.querySelector('.card-head, h3, .head').textContent.trim(), sx: document.documentElement.scrollWidth - innerWidth, h: Math.round(r.height) }; });
  ok(!mo.over && !mo.clip && mo.sx === 0, 'Handy: nichts ragt heraus, Stufennamen vollständig · ' + JSON.stringify({ over: mo.over, clip: mo.clip, sx: mo.sx }));
  ok(mo.labels === 'All trades|With setup|Stop respected|Rules followed|No mistakes' && /^Clean trades win \d+%, all others \d+%\.$/.test(mo.say) && /Discipline funnel/.test(mo.title), 'Englisch: Titel, Stufen und Satz übersetzt · ' + mo.labels + ' · ' + mo.say);
  await m.screenshot({ path: 'langshots/trichter-handy-en.png' });
  await m.evaluate(() => { Store.setSetting('language', 'de'); Store.saveNow(); });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0);
})();
