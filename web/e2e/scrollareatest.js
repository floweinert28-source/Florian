/* Scrollen in einem Bereich bleibt im Bereich: Filter-Fenster, Menüs, Dialoge, Listen – am Ende scrollt die Seite nicht mit */
const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 760 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e))); try { await require('./localfonts.js')(p); } catch (e) {}
  const wheelAt = async (sel, dy, n = 8) => { const r = await p.$eval(sel, e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + Math.min(b.height / 2, 120) }; }); await p.mouse.move(r.x, r.y); for (let i = 0; i < n; i++) { await p.mouse.wheel(0, dy); await p.waitForTimeout(40); } await p.waitForTimeout(700); };
  try {
    await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(1500);
    /* normale Seite scrollt weiter */
    await wheelAt('.dash-main', 300, 3); const y1 = await p.evaluate(() => scrollY);
    ok('Seite scrollt normal, wenn man nicht über einem Bereich ist', y1 > 100, String(y1));
    await p.evaluate(() => { Glide.stop(); scrollTo(0, 0); }); await p.waitForTimeout(300);
    /* Filter-Fenster: Inhalt scrollt, am Ende bleibt die Seite stehen */
    await p.click('[data-action="dash-f-open"]'); await p.waitForTimeout(400);
    const fd = await p.evaluate(() => { const e = document.querySelector('#fd-pop'); const sc = [e, ...e.querySelectorAll('*')].find(x => /(auto|scroll)/.test(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight + 1); return { scrollable: !!sc }; });
    await wheelAt('#fd-pop', 400, 10);
    const st = await p.evaluate(() => ({ y: scrollY, inner: (() => { const e = document.querySelector('#fd-pop'); const sc = [e, ...e.querySelectorAll('*')].find(x => /(auto|scroll)/.test(getComputedStyle(x).overflowY) && x.scrollHeight > x.clientHeight + 1); return sc ? sc.scrollTop : null; })() }));
    ok('Filter-Fenster: Scrollen bis zum Ende, Seite bleibt oben', st.y === 0 && (!fd.scrollable || st.inner > 0), JSON.stringify({ fd, st }));
    await p.keyboard.press('Escape'); await p.mouse.click(5, 700); await p.waitForTimeout(300);
    /* Menü ohne eigenes Scrollen (Zeitraum): Seite scrollt nicht */
    await p.click('[data-pop=range]'); await p.waitForTimeout(400);
    await wheelAt('#pop-range', 300, 5); ok('Zeitraum-Menü: Seite scrollt dahinter nicht', (await p.evaluate(() => scrollY)) === 0, String(await p.evaluate(() => scrollY)));
    await p.keyboard.press('Escape'); await p.mouse.click(5, 700); await p.waitForTimeout(300);
    /* Dialog */
    await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(400);
    await wheelAt('.modal', 400, 6); ok('Dialog: Seite scrollt dahinter nicht', (await p.evaluate(() => scrollY)) === 0);
    await p.evaluate(() => UI.closeModal(true)); await p.waitForTimeout(300);
    /* Seitenleiste */
    await p.setViewportSize({ width: 1440, height: 520 }); await p.waitForTimeout(300);
    await wheelAt('.sidebar', 400, 10); const sb = await p.evaluate(() => ({ y: scrollY, sb: document.querySelector('.sidebar').scrollTop }));
    ok('Seitenleiste: scrollt selbst bis zum Ende, die Seite nicht', sb.y === 0 && sb.sb > 0, JSON.stringify(sb));
    /* CSS: innere Scrollbereiche mit overscroll-behavior: contain */
    const css = await p.evaluate(() => ['.sidebar', '.modal'].map(s => { const e = document.querySelector(s); return e ? getComputedStyle(e).overscrollBehaviorY : 'fehlt'; }));
    ok('CSS: overscroll-behavior contain an Seitenleiste', css[0] === 'contain', JSON.stringify(css));
    ok('keine Seitenfehler', !errors.length, errors.join(' | '));
  } catch (e) { console.log('CRASH ' + e.message); }
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors'); console.log(`${pass} PASS, ${fail} FAIL`);
  await b.close();
})();
