const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  for (const r of ['settings/konten', 'settings/inhalte', 'settings/logs', 'settings/notebook']) {
    await p.goto(base + '#/' + r); await p.waitForTimeout(800);
    const res = await p.evaluate(() => { const out = {}; const t = document.querySelector('#content .set-body table'); if (t) { t.style.minWidth = '0'; t.style.width = 'auto'; out.natural = Math.round(t.getBoundingClientRect().width); } const nav = document.querySelector('.set-nav'); out.navW = Math.round(nav.getBoundingClientRect().width); out.navMaxLabel = Math.max(...[...nav.querySelectorAll('a span')].map(s => Math.round(s.getBoundingClientRect().width))); out.bodyW = Math.round(document.querySelector('.set-body').getBoundingClientRect().width);
      const pv = document.querySelector('.nb-preview'); if (pv) { const r = pv.getBoundingClientRect(); out.preview = { w: Math.round(r.width), right: Math.round(r.right), sw: pv.scrollWidth, cw: pv.clientWidth, h1: (pv.querySelector('h1, .pv-h1, [class*=h1]') || {}).className }; out.docSW = document.documentElement.scrollWidth; out.grid = getComputedStyle(document.querySelector('.nb-settings')).gridTemplateColumns; }
      return out; });
    console.log(r, JSON.stringify(res));
  }
  await b.close();
})();
