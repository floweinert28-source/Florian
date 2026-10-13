const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 794, height: 1123 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' });
  for (const r of ['dashboard', 'stats']) { await p.goto(process.env.BASE + '#/' + r); await p.waitForTimeout(1500); await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(200);
    const res = await p.evaluate(() => { const vw = document.documentElement.clientWidth; const out = []; document.querySelectorAll('.content *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.right > vw + 2) { const par = e.parentElement; const pr = par.getBoundingClientRect(); if (pr.right <= vw + 2) { const cs = getComputedStyle(par); out.push({ el: e.tagName + '.' + String(e.className).slice(0, 40), parent: par.tagName + '.' + String(par.className).slice(0, 60), pdisp: cs.display, pov: cs.overflowX, pwrap: cs.flexWrap, pgrid: cs.gridTemplateColumns.slice(0, 80), right: Math.round(r.right) }); } } }); const sb = document.querySelector('.score-bar, .sc-bar, [class*="score"] [class*="bar"], .gs-scale, .scale'); return { vw, out: out.slice(0, 8), score: sb ? sb.className + ' ' + getComputedStyle(sb).backgroundImage.slice(0, 60) : null }; });
    console.log(r, JSON.stringify(res, null, 1)); await p.emulateMedia({ media: null }); }
  await b.close();
})();
