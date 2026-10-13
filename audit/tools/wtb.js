const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch();
  for (const w of [961, 1024, 1100, 1180]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 768 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    const m = async (tag) => p.evaluate((tag) => { const tb = document.querySelector('.topbar'); const h1 = tb.querySelector('h1').getBoundingClientRect(); const act = tb.querySelector('.actions').getBoundingClientRect(); const acc = tb.querySelector('[data-pop="account"]'); const ar = acc && acc.getBoundingClientRect(); const span = acc && acc.querySelector('span'); return { tag, tbH: Math.round(tb.getBoundingClientRect().height), h1R: Math.round(h1.right), actL: Math.round(act.left), actR: Math.round(act.right), vw: innerWidth, accW: ar && Math.round(ar.width), accLabel: span && getComputedStyle(span).display, accText: acc && acc.textContent.trim(), gap: Math.round(act.left - h1.right) }; }, tag);
    console.log(w, JSON.stringify(await m('heute')));
    await p.addStyleTag({ content: '@media (min-width: 961px) and (max-width: 1180px) { .tb-tools [data-pop="account"] > span { display: inline !important; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } }' });
    await p.waitForTimeout(200);
    console.log(w, JSON.stringify(await m('mit Name')));
    if (w === 1024) await p.screenshot({ path: 'audit/shots/extra/w/1024-probe-topbar-konto.png', clip: { x: 0, y: 0, width: 1024, height: 150 } });
    await ctx.close();
  }
  await b.close();
})();
