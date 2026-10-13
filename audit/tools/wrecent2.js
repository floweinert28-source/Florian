const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  const r = await p.evaluate(() => { const wrap = document.querySelector('.recent-wrap'); const t = wrap.querySelector('table'); t.style.width = 'auto'; return { minContent: Math.round(t.getBoundingClientRect().width) }; });
  console.log('min content heute', JSON.stringify(r));
  await p.evaluate(() => { const t = document.querySelector('.recent-wrap table'); t.querySelectorAll('.badge').forEach(bd => { const n = [...bd.childNodes].find(x => x.nodeType === 3); if (n) { const sp = document.createElement('span'); sp.className = 'bt'; sp.textContent = n.textContent; n.replaceWith(sp); } }); const st = document.createElement('style'); st.textContent = '.card.recent-card { container-type: inline-size; } @container (max-width: 330px) { .recent-wrap .tbl td.dir-cell .badge { min-width: 0; gap: 0; padding: 0 4px; } .recent-wrap .badge .bt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; } }'; document.head.appendChild(st); });
  await p.waitForTimeout(200);
  const r2 = await p.evaluate(() => { const wrap = document.querySelector('.recent-wrap'); const t = wrap.querySelector('table'); const w1 = Math.round(t.getBoundingClientRect().width); const card = wrap.closest('.card'); card.scrollIntoView(); return { tableAuto: w1, cw: wrap.clientWidth, sw: wrap.scrollWidth }; });
  console.log('mit Container-Regel', JSON.stringify(r2));
  const box = await p.evaluate(() => { const r = document.querySelector('.recent-card').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await p.screenshot({ path: 'audit/shots/extra/w/1280-probe-letzte-trades.png', clip: { x: box.x, y: box.y, width: box.w, height: Math.min(box.h, 400) } });
  await b.close(); })();
