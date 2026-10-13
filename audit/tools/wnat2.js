const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  await p.addStyleTag({ content: '@media (min-width:961px) and (max-width:1180px){ .settings{grid-template-columns:184px minmax(0,1fr);gap:20px} .set-nav a{padding:10px 10px;gap:10px} .set-body .tbl{min-width:0} .nb-settings{grid-template-columns:1fr} }' });
  for (const r of ['settings/konten', 'settings/inhalte', 'settings/logs', 'settings/notebook', 'settings/trading', 'settings/design']) {
    await p.goto(base + '#/' + r); await p.waitForTimeout(800);
    const res = await p.evaluate(() => { const out = {}; const w = document.querySelector('#content .set-body .tbl-wrap'); if (w) { out.sw = w.scrollWidth; out.cw = w.clientWidth; } const nav = document.querySelector('.set-nav'); out.navW = Math.round(nav.getBoundingClientRect().width); out.navWrap = [...nav.querySelectorAll('a')].filter(a => a.getBoundingClientRect().height > 46).length; out.bodyW = Math.round(document.querySelector('.set-body').getBoundingClientRect().width); out.docSW = document.documentElement.scrollWidth; return out; });
    console.log(r, JSON.stringify(res));
    if (r === 'settings/konten' || r === 'settings/notebook') await p.screenshot({ path: `audit/shots/extra/w/1024-probe-${r.replace('/', '_')}.png`, fullPage: true });
  }
  await b.close();
})();
