const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch();
  for (const width of [1440, 390]) {
    const mobile = width < 600; const dir = path.join(__dirname, 'shots', 'extra');
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); });
    const go = async (h) => { await p.goto(base + h); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200); };
    const info = await (async () => { await go('#/prop/bilanz'); return p.evaluate(() => { const out = []; for (const el of document.querySelectorAll('*')) { const cs = getComputedStyle(el); if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 10) out.push(el.tagName + '.' + el.className + ' ' + el.scrollHeight + '/' + el.clientHeight); } return { out, cards: [...document.querySelectorAll('.content .card-title')].map(x => x.textContent), docH: document.documentElement.scrollHeight }; }); })();
    console.log(width, JSON.stringify(info));
    /* Schrittweise durch die Seite scrollen */
    for (const [route, name, prep] of [['#/prop/bilanz', 'bilanz'], ['#/prop/payout', 'bilanz_planer']]) {
      await go(route); const H = await p.evaluate(() => document.documentElement.scrollHeight); const vh = mobile ? 844 : 900; let i = 0;
      for (let y = 0; y < H; y += vh - 100) { await p.evaluate(y => { window.scrollTo(0, y); const m = document.querySelector('.main'); if (m) m.scrollTop = y; }, y); await p.waitForTimeout(500); await p.screenshot({ path: path.join(dir, `hicks-prop-${width}-${name}-s${i}.png`) }); console.log('ok', width, name, i, y, H); i++; if (i > 8) break; }
    }
    await ctx.close();
  }
  await b.close();
})();
