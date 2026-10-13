/* Probe: ein Raster für Widget-Bibliothek-Einträge bei 1440, 1024 und 390 */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390');
const CSS = `.side-panel .sp-item { display: grid; grid-template-columns: 144px minmax(0, 1fr); column-gap: 14px; row-gap: 8px; align-items: start; }
.side-panel .sp-item .pv { grid-row: 1 / span 2; order: 0; }
.side-panel .sp-item .grow { grid-column: 2; order: 0; flex: none; }
.side-panel .sp-item .btn { grid-column: 2; justify-self: start; order: 0; }
@media (max-width: 960px) { .side-panel .sp-item { grid-template-columns: 104px minmax(0, 1fr); column-gap: 12px; } }`;
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const [w, h, mob] of [[1440, 900, false], [1024, 768, false], [390, 844, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mob ? 2 : 1, isMobile: mob, hasTouch: mob, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); });
    await p.goto(base + '#/dashboard'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    await p.evaluate(() => document.querySelector('[data-pop="tpl"]').click()); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('#pop-tpl [data-action="dash-tpl-edit"]').click()); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="dash-add-open"]').click()); await p.waitForTimeout(700);
    const m = () => p.evaluate(() => { const its = [...document.querySelectorAll('.side-panel .sp-item')]; return { hs: its.map(i => Math.round(i.getBoundingClientRect().height)), list: document.querySelector('.side-panel .sp-list').scrollHeight, textW: Math.round(its[0].querySelector('.grow').getBoundingClientRect().width) }; });
    const before = await m(); await p.addStyleTag({ content: CSS }); await p.waitForTimeout(300); const after = await m();
    res[w] = { before: { min: Math.min(...before.hs), max: Math.max(...before.hs), list: before.list, textW: before.textW }, after: { min: Math.min(...after.hs), max: Math.max(...after.hs), list: after.list, textW: after.textW } };
    await p.screenshot({ path: path.join(OUT, `dark_probe_panel_${w}.png`) });
    await ctx.close();
  }
  console.log(JSON.stringify(res, null, 1)); await b.close();
})();
