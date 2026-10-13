const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch();
  for (const w of [961, 1024, 1100, 1180, 1240]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 768 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.goto(base + '#/stats/time'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    const m = () => p.evaluate(() => { const t = document.querySelector('#content > .tabs.scroll-x'); return { sw: t.scrollWidth, cw: t.clientWidth, sl: t.scrollLeft, pad: getComputedStyle(t.querySelector('a, button')).padding, tag: t.firstElementChild.tagName }; });
    const a = await m();
    await p.addStyleTag({ content: '@media (min-width: 961px) and (max-width: 1240px) { #content > .tabs.scroll-x { gap: 4px; } #content > .tabs.scroll-x > .btn { padding-left: 12px; padding-right: 12px; } }' }); await p.waitForTimeout(100);
    console.log(w, JSON.stringify(a), '->', JSON.stringify(await m()));
    await ctx.close();
  }
  await b.close();
})();
