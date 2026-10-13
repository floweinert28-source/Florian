const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch();
  for (const w of [1280, 1366]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const r = await p.evaluate(() => { const wrap = document.querySelector('.recent-wrap'); const t = wrap.querySelector('table'); const before = { tw: t.scrollWidth, cw: wrap.clientWidth, cardW: Math.round(wrap.closest('.card').getBoundingClientRect().width) };
      
      const s1 = t.scrollWidth;
      t.querySelectorAll('.badge').forEach(bd => { const n = [...bd.childNodes].find(x => x.nodeType === 3); if (n) { const sp = document.createElement('span'); sp.className = 'bt'; sp.textContent = n.textContent; n.replaceWith(sp); } });
      const st = document.createElement('style'); st.textContent = '.recent-wrap .tbl td.dir-cell .badge { min-width: 0; gap: 0; padding: 0 4px; } .recent-wrap .badge .bt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }'; document.head.appendChild(st);
      return { before, kurzDatum: s1, kurzDatumUndPfeil: t.scrollWidth }; });
    console.log(w, JSON.stringify(r));
    if (w === 1280) await p.screenshot({ path: 'audit/shots/extra/w/1280-probe-letzte-trades.png', clip: { x: 250, y: 700, width: 340, height: 420 } });
    await ctx.close();
  }
  await b.close();
})();
