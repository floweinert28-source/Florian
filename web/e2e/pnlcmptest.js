/* „P&L im Vergleich“ (Vorlage: 21st.dev Multi Line Chart): Platz im Standard-Dashboard (auch per Migration), zwei Linien ohne Punkte,
   Pille mit dem Unterschied am gleichen Tag direkt neben dem Titel, Legende mit zwei Linien-Schlüsseln, Tooltip mit beiden Tagen, „Gesamt“: letzte 30 Tage gegen die 30 Tage davor, Englisch, Handy */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(() => { Store.setSetting('uiMode', 'advanced'); Store.setSetting('range', { preset: 'month', from: null, to: null }); Store.setSetting('dashFilter', null); Store.saveNow(); App.rerender(); }); await p.waitForTimeout(700);
  /* 1: Platz im Standard-Dashboard */
  const lay = await p.evaluate(() => Store.activeDashboard().layout.unten.map(w => w.typ));
  ok(lay[2] === 'pnl_vergleich' && !lay.includes('kum_pnl') && lay[1] === 'disziplin_trichter', 'Standard-Dashboard: „P&L im Vergleich“ an dritter Stelle statt „Kumulierter Tages-P&L“ · ' + lay.slice(0, 4).join(','));
  /* 2: Linien, Punkte, Pille */
  const v = await p.evaluate(() => { const w = document.querySelector('.w[data-typ="pnl_vergleich"]'); const d = UI.chartData['dash-pnlcmp']; const r = App.range(); const pf = new Date(r.from.getFullYear(), r.from.getMonth() - 1, 1), pt = new Date(r.from.getFullYear(), r.from.getMonth(), 0, 23, 59, 59, 999);
    const cur = Core.dailyAggregation(App.tradesInRange()), prev = Core.dailyAggregation(Core.closedOnly(App.allTrades()).filter(t => t.close >= pf && t.close <= pt));
    const i = d.cur.length - 1; const expPrev = prev.filter(x => x.day.getDate() <= i + 1).reduce((a, x) => a + x.pnl, 0);
    return { cur: !!w.querySelector('path.pc-cur'), prev: !!w.querySelector('path.pc-prev'), dash: getComputedStyle(w.querySelector('path.pc-prev')).strokeDasharray, dots: w.querySelectorAll('.pc-dot').length, tradeDays: cur.length, curEnd: Math.round(d.cur[i].v), expCur: Math.round(cur.reduce((a, x) => a + x.pnl, 0)), prevAt: Math.round(d.prev[i].v), expPrev: Math.round(expPrev), pill: w.querySelector('.pc-pill').textContent, up: w.querySelector('.pc-pill').classList.contains('up'), sub: w.querySelector('.card-sub').textContent, keys: [...w.querySelectorAll('.card-sub .pc-li')].map(k => [k.querySelector('.pc-k').className, k.textContent, k.dataset.tip]), inTitle: !!w.querySelector('.card-title > .pc-pill'), gap: (() => { const tn = [...w.querySelector('.card-title').childNodes].find(n => n.nodeType === 3); const rg = document.createRange(); rg.selectNodeContents(tn); return Math.round(w.querySelector('.pc-pill').getBoundingClientRect().left - rg.getBoundingClientRect().right); })() }; });
  ok(v.cur && v.prev && /4/.test(v.dash) && v.dots === 0, `Durchgezogen ohne Punkte (${v.dots}), Vormonat gestrichelt (${v.dash})`);
  ok(v.curEnd === v.expCur && v.prevAt === v.expPrev, `Werte stimmen: jetzt ${v.curEnd}, Vormonat am gleichen Tag ${v.prevAt}`);
  const diff = v.curEnd - v.prevAt;
  ok(v.up === (diff >= 0) && /[↗↘]/.test(v.pill) && v.pill.replace(/\D/g, '').startsWith(String(Math.abs(diff)).slice(0, 3)), `Pille zeigt den Unterschied am gleichen Tag: ${v.pill} (${diff})`);
  ok(v.inTitle && v.gap >= 4 && v.gap <= 12, 'Pille direkt neben dem Titel (Abstand ' + v.gap + ' px)');
  ok(v.keys.length === 2 && /pc-k cur/.test(v.keys[0][0]) && /pc-k prev/.test(v.keys[1][0]) && /2026/.test(v.keys[0][1]) && /2026/.test(v.keys[1][1]) && /\d{2}\.\d{2}\.\d{4} – \d{2}\.\d{2}\.\d{4}/.test(v.keys[1][2]) && !/·/.test(v.sub), 'Legende: zwei Linien-Schlüssel (durchgezogen, gestrichelt) mit Monat, Datum im Tooltip · ' + JSON.stringify(v.keys));
  /* 3: Tooltip mit beiden Tagen */
  await p.evaluate(() => document.querySelector('.w[data-typ="pnl_vergleich"]').scrollIntoView({ block: 'center' })); await p.waitForTimeout(200);
  const r = await (await p.$('.w[data-typ="pnl_vergleich"] .hit')).boundingBox(); await p.mouse.move(r.x + r.width * 0.3, r.y + r.height / 2); await p.waitForTimeout(300);
  const tip = await p.evaluate(() => document.getElementById('tip').textContent);
  ok(/Kumuliert bis Tag \d+/.test(tip) && (tip.match(/\d{2}\.\d{2}\.\d{4}/g) || []).length === 2, 'Tooltip: Tag im Zeitraum mit beiden Daten und Werten · ' + tip);
  await p.mouse.move(5, 5);
  /* 4: Gesamt: letzte 30 Tage gegen die 30 Tage davor */
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); App.rerender(); }); await p.waitForTimeout(600);
  const all = await p.evaluate(() => { const w = document.querySelector('.w[data-typ="pnl_vergleich"]'); return { prev: !!w.querySelector('path.pc-prev'), pill: !!w.querySelector('.pc-pill'), cur: !!w.querySelector('path.pc-cur'), sub: w.querySelector('.card-sub').textContent }; });
  ok(all.cur && all.prev && all.pill && /Letzte 30 Tage/.test(all.sub) && /Vorherige 30 Tage/.test(all.sub), 'Gesamt: „Letzte 30 Tage“ gegen „Vorherige 30 Tage“, mit Pille · ' + all.sub);
  /* 5: Migration: altes Standard-Dashboard mit „Kumulierter Tages-P&L“ wird einmal getauscht, eigene Vorlagen nicht */
  await p.evaluate(() => { const k = 'trading-journal-web-v1'; const d = JSON.parse(localStorage.getItem(k)); const std = d.dashboards.find(x => x.isDefault); std.layout.unten = std.layout.unten.map(w => w.typ === 'pnl_vergleich' ? { typ: 'kum_pnl', groesse: 'mittel' } : w); d.dashboards.push({ id: 'eigen2', name: 'Eigen', isDefault: false, layout: { oben: [], unten: [{ typ: 'kum_pnl', groesse: 'klein' }] } }); d.dashboardsVersion = 6; localStorage.setItem(k, JSON.stringify(d)); location.reload(); });
  await p.waitForTimeout(1500);
  const mig = await p.evaluate(() => { const std = Store.data.dashboards.find(x => x.isDefault); const own = Store.data.dashboards.find(x => x.id === 'eigen2'); const i = std.layout.unten.findIndex(w => w.typ === 'pnl_vergleich'); return { i, size: i >= 0 ? std.layout.unten[i].groesse : '', old: std.layout.unten.some(w => w.typ === 'kum_pnl'), own: own && own.layout.unten.map(w => w.typ).join(','), v: Store.data.dashboardsVersion }; });
  ok(mig.i === 2 && mig.size === 'mittel' && !mig.old && mig.own === 'kum_pnl' && mig.v >= 7, 'Migration: Standard-Dashboard tauscht an gleicher Stelle und Größe, eigene Vorlage bleibt · ' + JSON.stringify(mig));
  await p.evaluate(() => { Store.data.dashboards = Store.data.dashboards.filter(x => x.id !== 'eigen2'); const std = Store.data.dashboards.find(x => x.isDefault); const w = std.layout.unten.find(x => x.typ === 'pnl_vergleich'); if (w) w.groesse = 'klein'; Store.saveNow(); });
  ok(await p.evaluate(() => WidgetPreviews.has('pnl_vergleich') && /stroke-dasharray/.test(WidgetPreviews.svg('pnl_vergleich', 'pnlcmp'))), 'Vorschaubild für „Widget hinzufügen“ (zwei Linien, eine gestrichelt)');
  /* 6: Englisch und Handy */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push(e.message));
  await m.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(600);
  await m.evaluate(() => { Store.setSetting('language', 'en'); Store.setSetting('uiMode', 'advanced'); Store.setSetting('range', { preset: 'month', from: null, to: null }); Store.saveNow(); location.reload(); }); await m.waitForTimeout(1500);
  await m.evaluate(() => document.querySelector('.w[data-typ="pnl_vergleich"]').scrollIntoView()); await m.waitForTimeout(300);
  const mo = await m.evaluate(() => { const w = document.querySelector('.w[data-typ="pnl_vergleich"]'); return { title: w.querySelector('.card-title').textContent.trim(), sub: w.querySelector('.card-sub').textContent, over: [...w.querySelectorAll('*')].some(e => e.getBoundingClientRect().right > innerWidth + 1), sx: document.documentElement.scrollWidth - innerWidth }; });
  ok(/P&L comparison/.test(mo.title) && /Oct 2026/.test(mo.sub) && !mo.over && mo.sx === 0, 'Englisch und Handy: Titel und Monate übersetzt, nichts ragt heraus · ' + mo.title + ' · ' + mo.sub);
  await m.screenshot({ path: 'langshots/pnlcmp-handy-en.png' });
  await m.evaluate(() => { Store.setSetting('language', 'de'); Store.saveNow(); });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0);
})();
