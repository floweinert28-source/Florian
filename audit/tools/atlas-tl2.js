const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const dir = path.join(__dirname, 'shots', 'extra');
  for (const width of [1440, 390]) { const mobile = width < 600;
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.goto(base + '#/trades'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    const id = await p.evaluate(() => document.querySelector('tr[data-action="trade"]').dataset.id); await p.goto(base + '#/trades/' + id); await p.waitForTimeout(800);
    /* Seite schrittweise durchscrollen, damit alle Karten eingeblendet sind, dann ganz unten aufnehmen */
    const sc = await p.evaluate(async () => { const el = [...document.querySelectorAll('.content, .main, body')].find(e => e.scrollHeight > e.clientHeight + 10) || document.scrollingElement; const h = el.scrollHeight; for (let y = 0; y < h; y += 300) { el.scrollTop = y; await new Promise(r => setTimeout(r, 120)); } el.scrollTop = h; return { cls: el.className, h, c: el.clientHeight }; });
    console.log(width, JSON.stringify(sc)); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(dir, `tl-${width}-trade_detail_unten.png`), fullPage: !mobile });
    if (mobile) { await p.evaluate(() => { const el = [...document.querySelectorAll('.content, .main')].find(e => e.scrollHeight > e.clientHeight + 10) || document.scrollingElement; el.scrollTop = el.scrollHeight; }); await p.waitForTimeout(600); await p.screenshot({ path: path.join(dir, `tl-${width}-trade_detail_fuss.png`), fullPage: false }); }
    const info = await p.evaluate(() => [...document.querySelectorAll('.content .btn, .content button, .content a.btn')].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').map(e => (e.className + ' | ' + (e.textContent.trim() || e.getAttribute('aria-label') || '')).replace(/\s+/g, ' ')));
    console.log(width, 'Knöpfe Detail:', JSON.stringify(info));
    await ctx.close(); }
  await b.close(); console.log('TL2DONE'); })();
