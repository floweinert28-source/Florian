/* „P&L im Vergleich“ (Vorlage: 21st.dev Multi Line Chart): Platz im Standard-Dashboard (auch per Migration), zwei Linien, Punkte an
   Handelstagen, Pille mit dem Unterschied am gleichen Tag, Tooltip mit beiden Tagen, „Gesamt“: letzte 30 Tage gegen die 30 Tage davor, Englisch, Handy */
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
  ok(lay[1] === 'pnl_vergleich' && !lay.includes('kum_pnl') && lay[2] === 'disziplin_trichter', 'Standard-Dashboard: „P&L im Vergleich“ an zweiter Stelle statt „Kumulierter Tages-P&L“ · ' + lay.slice(0, 4).join(','));
  /* 2: Linien, Punkte, Pille */
  const v = await p.evaluate(() => { const w = document.querySelector('.w[data-typ="pnl_vergleich"]'); const d = UI.chartData['dash-pnlcmp']; const r = App.range(); const pf = new Date(r.from.getFullYear(), r.from.getMonth() - 1, 1), pt = new Date(r.from.getFullYear(), r.from.getMonth(), 0, 23, 59, 59, 999);
    const cur = Core.dailyAggregation(App.tradesInRange()), prev = Core.dailyAggregation(Core.closedOnly(App.allTrades()).filter(t => t.close >= pf && t.close <= pt));
    const i = d.cur.length - 1; const expPrev = prev.filter(x => x.day.getDate() <= i + 1).reduce((a, x) => a + x.pnl, 0);
    return { cur: !!w.querySelector('path.pc-cur'), prev: !!w.querySelector('path.pc-prev'), dash: getComputedStyle(w.querySelector('path.pc-prev')).strokeDasharray, dots: w.querySelectorAll('.pc-dot').length, tradeDays: cur.length, curEnd: Math.round(d.cur[i].v), expCur: Math.round(cur.reduce((a, x) => a + x.pnl, 0)), prevAt: Math.round(d.prev[i].v), expPrev: Math.round(expPrev), pill: w.querySelector('.pc-pill').textContent, up: w.querySelector('.pc-pill').classList.contains('up'), sub: w.querySelector('.card-sub').textContent, key: !!w.querySelector('.card-sub .pc-key') }; });
  ok(v.cur && v.prev && /4/.test(v.dash) && v.dots === v.tradeDays, `Durchgezogen mit ${v.dots} Punkten (je Handelstag), Vormonat gestrichelt (${v.dash})`);
  ok(v.curEnd === v.expCur && v.prevAt === v.expPrev, `Werte stimmen: jetzt ${v.curEnd}, Vormonat am gleichen Tag ${v.prevAt}`);
  const diff = v.curEnd - v.prevAt;
  ok(v.up === (diff >= 0) && /[↗↘]/.test(v.pill) && v.pill.replace(/\D/g, '').startsWith(String(Math.abs(diff)).slice(0, 3)), `Pille zeigt den Unterschied am gleichen Tag: ${v.pill} (${diff})`);
  ok(/2026/.test(v.sub) && v.key, 'Untertitel: Monat · gestrichelt Vormonat · ' + v.sub);
  /* 3: Tooltip mit beiden Tagen */
  const r = await (await p.$('.w[data-typ="pnl_vergleich"] .hit')).boundingBox(); await p.mouse.move(r.x + r.width * 0.3, r.y + r.height / 2); await p.waitForTimeout(300);
  const tip = await p.evaluate(() => document.getElementById('tip').textContent);
  ok(/Kumuliert bis Tag \d+/.test(tip) && (tip.match(/\d{2}\.\d{2}\.\d{4}/g) || []).length === 2, 'Tooltip: Tag im Zeitraum mit beiden Daten und Werten · ' + tip);
  await p.mouse.move(5, 5);
  /* 4: Gesamt: letzte 30 Tage gegen die 30 Tage davor */
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); App.rerender(); }); await p.waitForTimeout(600);
  const all = await p.evaluate(() => { const w = document.querySelector('.w[data-typ="pnl_vergleich"]'); return { prev: !!w.querySelector('path.pc-prev'), pill: !!w.querySelector('.pc-pill'), cur: !!w.querySelector('path.pc-cur'), sub: w.querySelector('.card-sub').textContent }; });
  ok(all.cur && all.prev && all.pill && /Letzte 30 Tage/.test(all.sub) && /30 Tage davor/.test(all.sub), 'Gesamt: letzte 30 Tage gegen die 30 Tage davor, mit Pille · ' + all.sub);
  /* 5: Migration: altes Standard-Dashboard mit „Kumulierter Tages-P&L“ wird einmal getauscht, eigene Vorlagen nicht */
  await p.evaluate(() => { const k = 'trading-journal-web-v1'; const d = JSON.parse(localStorage.getItem(k)); const std = d.dashboards.find(x => x.isDefault); std.layout.unten = std.layout.unten.map(w => w.typ === 'pnl_vergleich' ? { typ: 'kum_pnl', groesse: 'mittel' } : w); d.dashboards.push({ id: 'eigen2', name: 'Eigen', isDefault: false, layout: { oben: [], unten: [{ typ: 'kum_pnl', groesse: 'klein' }] } }); d.dashboardsVersion = 6; localStorage.setItem(k, JSON.stringify(d)); location.reload(); });
  await p.waitForTimeout(1500);
  const mig = await p.evaluate(() => { const std = Store.data.dashboards.find(x => x.isDefault); const own = Store.data.dashboards.find(x => x.id === 'eigen2'); const i = std.layout.unten.findIndex(w => w.typ === 'pnl_vergleich'); return { i, size: i >= 0 ? std.layout.unten[i].groesse : '', old: std.layout.unten.some(w => w.typ === 'kum_pnl'), own: own && own.layout.unten.map(w => w.typ).join(','), v: Store.data.dashboardsVersion }; });
  ok(mig.i === 1 && mig.size === 'mittel' && !mig.old && mig.own === 'kum_pnl' && mig.v >= 7, 'Migration: Standard-Dashboard tauscht an gleicher Stelle und Größe, eigene Vorlage bleibt · ' + JSON.stringify(mig));
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
