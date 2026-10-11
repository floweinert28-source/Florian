/* TradeLog passt auf einen Bildschirm (Desktop): Seite scrollt nicht, Tabelle scrollt in ihrer Box, Seitenwähler sichtbar; Detail und Handy wie gewohnt */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [w, h] of [[1440, 900], [1280, 720], [1100, 800]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
    await p.goto(BASE + '#/trades', { waitUntil: 'load' }); await p.evaluate(() => { Store.setSetting('range', { preset: 'all' }); App.state.tradePage = { page: 1, size: 100 }; App.rerender(); }); await p.waitForTimeout(700);
    const r = await p.evaluate(() => { const sc = document.querySelector('.tl-fit .tbl-scroll'); const pg = document.querySelector('.tl-fit .pager'); const pr = pg && pg.getBoundingClientRect(); return { pageMax: document.documentElement.scrollHeight - innerHeight, fit: !!document.querySelector('.tl-fit'), inner: sc ? sc.scrollHeight > sc.clientHeight + 5 : null, pagerIn: !!pr && pr.bottom <= innerHeight + 1 && pr.height > 20, rows: document.querySelectorAll('.tl-fit tbody tr').length }; });
    ok(r.fit && r.pageMax <= 0 && r.pagerIn, `${w}×${h}: Seite scrollt nicht, Seitenwähler unten sichtbar · ` + JSON.stringify(r));
    ok(r.rows > 15 && r.inner === true, `${w}×${h}: Tabelle scrollt in ihrer Box · ${r.rows} Zeilen`);
    if (w === 1440) { await p.mouse.move(700, 600); await p.mouse.wheel(0, 400); await p.waitForTimeout(500);
      ok(await p.evaluate(() => scrollY === 0 && document.querySelector('.tl-fit .tbl-scroll').scrollTop > 100), 'Rad über der Tabelle scrollt die Tabelle, nicht die Seite');
      for (const v of ['days', 'missed']) { await p.evaluate(v => { App.state.tradeFilter.view = v; App.rerender(); }, v); await p.waitForTimeout(500); ok(await p.evaluate(() => !!document.querySelector('.tl-fit') && document.documentElement.scrollHeight - innerHeight <= 0), `Reiter ${v}: ebenfalls ohne Seiten-Scrollen`); }
      await p.evaluate(() => { App.state.tradeFilter.view = 'trades'; }); const id = await p.evaluate(() => Store.trades()[0].id); await p.goto(BASE + '#/trades/' + id, { waitUntil: 'load' }); await p.waitForTimeout(700);
      ok(await p.evaluate(() => !document.querySelector('.tl-fit') && getComputedStyle(document.querySelector('.main')).height !== innerHeight + 'px' || document.documentElement.scrollHeight - innerHeight > 0), 'Trade-Detail: normale Seite, nicht festgezurrt'); }
    await p.close(); }
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(m); } catch (e) {}
  await m.goto(BASE + '#/trades', { waitUntil: 'load' }); await m.waitForTimeout(800);
  ok(await m.evaluate(() => document.documentElement.scrollHeight - innerHeight > 200 && getComputedStyle(document.querySelector('.main')).height !== innerHeight + 'px'), 'Handy: Seite scrollt wie gewohnt');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
