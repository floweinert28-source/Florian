const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390');
const CSS = `@media (max-width: 960px) {
  .side-panel .sp-item { display: grid; grid-template-columns: 104px minmax(0, 1fr); column-gap: 12px; row-gap: 10px; align-items: start; }
  .side-panel .sp-item .pv { grid-column: 1; grid-row: 1; order: 0; }
  .side-panel .sp-item .grow { grid-column: 2; grid-row: 1; order: 0; flex: none; }
  .side-panel .sp-item .btn { grid-column: 1 / -1; grid-row: 2; justify-self: start; order: 0; }
}`;
(async () => { const b = await chromium.launch(); const out = {};
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
    await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelector('[data-pop="tpl"]').click()); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('#pop-tpl [data-action="dash-tpl-edit"]').click()); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="dash-add-open"]').click()); await p.waitForTimeout(700);
    await p.addStyleTag({ content: CSS }); await p.waitForTimeout(300);
    out[theme] = await p.evaluate(() => { const r = x => x.getBoundingClientRect(); const its = [...document.querySelectorAll('.side-panel .sp-item')]; const hs = its.map(i => Math.round(r(i).height)); const t = its.slice(0, 12).map(it => { const b = it.querySelector('.btn'), g = it.querySelector('.grow'); return { belowText: r(b).top >= r(g).bottom - 1, leftEdge: Math.round(r(b).left - r(it).left) }; }); return { min: Math.min(...hs), max: Math.max(...hs), list: document.querySelector('.side-panel .sp-list').scrollHeight, textW: Math.round(r(its[0].querySelector('.grow')).width), testOk: t.every(x => x.belowText && x.leftEdge <= 16) }; });
    await p.evaluate(() => { document.querySelector('.side-panel .sp-list').scrollTop = 1200; }); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(OUT, `${theme}_probe_panel_v2.png`) }); await ctx.close(); }
  console.log(JSON.stringify(out)); await b.close(); })();
