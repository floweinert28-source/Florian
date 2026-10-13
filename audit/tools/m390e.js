/* Nachfinder Handy 390, Teil 5: Ruhepunkt-Schritte (beide Designs), Widget-Panel-Probe */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390');
const LOG = []; const log = m => { LOG.push(m); console.log(m); }; const MEAS = {};
const PANEL_CSS = `@media (max-width: 560px) {
  .sp-item { display: grid; grid-template-columns: 104px minmax(0, 1fr); column-gap: 12px; row-gap: 8px; align-items: start; }
  .sp-item .pv { grid-row: 1 / span 2; order: 0; }
  .sp-item .grow { grid-column: 2; order: 0; }
  .sp-item .btn { grid-column: 2; justify-self: start; order: 0; }
}`;
(async () => {
  const b = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); p.on('pageerror', e => log(`ERR ${theme}: ${e.message}`)); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
    await p.goto(base + '#/ruhepunkt'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    const shot = async (name, full) => { await p.waitForTimeout(400); await p.screenshot({ path: path.join(OUT, `${theme}_${name}.png`), fullPage: !!full }); log(`ok ${theme} ${name}`); };
    const navPos = () => p.evaluate(() => { const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { t: e.textContent.trim().slice(0, 30), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }; return { title: R(document.querySelector('.rp-title')), content: R(document.querySelector('.rp-content')), nav: [...document.querySelectorAll('.rp-nav .rp-btn')].map(R), inner: [...document.querySelectorAll('.rp-content .rp-btn, .rp-content button.rp-primary')].map(R), docH: document.documentElement.scrollHeight }; });
    for (let fi = 0; fi < 3; fi++) {
      try { await p.goto(base + '#/ruhepunkt'); await p.waitForTimeout(700); await p.evaluate(i => document.querySelectorAll('.rp-choice')[i].click(), fi); await p.waitForTimeout(700);
        for (let s = 0; s < 3; s++) { MEAS[`${theme}_rp${fi}_s${s}`] = await navPos(); await p.evaluate(() => window.scrollTo(0, 0)); await shot(`rp${fi}_s${s}`, false); const ok = await p.evaluate(() => { const n = document.querySelector('.rp-nav .rp-primary'); if (!n) return false; n.click(); return true; }); if (!ok) break; await p.waitForTimeout(700); }
      } catch (e) { log('rp fail ' + e.message); }
    }
    /* Widget-Panel mit Probe-CSS */
    try { await p.goto(base + '#/dashboard'); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-pop="tpl"]').click()); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('#pop-tpl [data-action="dash-tpl-edit"]').click()); await p.waitForTimeout(700); await p.evaluate(() => document.querySelector('[data-action="dash-add-open"]').click()); await p.waitForTimeout(700);
      await p.addStyleTag({ content: PANEL_CSS }); await p.waitForTimeout(300);
      MEAS[`${theme}_panel_probe`] = await p.evaluate(() => { const its = [...document.querySelectorAll('.side-panel .sp-item')]; return { heights: its.slice(0, 6).map(i => Math.round(i.getBoundingClientRect().height)), listH: document.querySelector('.side-panel .sp-list').scrollHeight }; });
      await p.evaluate(() => { document.querySelector('.side-panel .sp-list').scrollTop = 1200; }); await shot('probe_panel'); } catch (e) { log('panel probe fail ' + e.message); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'meas5.json'), JSON.stringify(MEAS, null, 1)); fs.writeFileSync(path.join(OUT, 'log5.txt'), LOG.join('\n')); await b.close(); console.log('M390EDONE');
})();
