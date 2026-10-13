/* Probe: Ruhepunkt-Schrittleiste sticky am Handy; Schubladen-Schatten nur bei offener Schublade */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390');
const RP_CSS = `@media (max-width: 560px) {
  .rp-nav, .rp-open + .rp-nav { position: sticky; bottom: 0; z-index: 3; margin: 16px -16px 0; padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)); background: var(--bg); border-top: 1px solid var(--border); }
  .rp-nav .rp-btn { flex: 1 1 0; justify-content: center; }
}`;
const SB_CSS = `@media (max-width: 960px) { .sidebar { box-shadow: none; } .sidebar.open { box-shadow: var(--shadow); } }`;
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
    await p.goto(base + '#/ruhepunkt'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
    await p.addStyleTag({ content: RP_CSS + SB_CSS });
    await p.evaluate(() => document.querySelectorAll('.rp-choice')[0].click()); await p.waitForTimeout(700);
    for (let s = 0; s < 2; s++) {
      res[`${theme}_s${s}`] = await p.evaluate(() => [...document.querySelectorAll('.rp-nav .rp-btn')].map(e => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), y: Math.round(r.y), h: Math.round(r.height), w: Math.round(r.width) }; }));
      await p.screenshot({ path: path.join(OUT, `${theme}_probe_rp_s${s}.png`) });
      await p.evaluate(() => document.querySelector('.rp-nav .rp-primary').click()); await p.waitForTimeout(700); await p.evaluate(() => window.scrollTo(0, 0));
    }
    await p.goto(base + '#/settings/konten'); await p.waitForTimeout(700); await p.addStyleTag({ content: SB_CSS }); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, `${theme}_probe_sb_zu.png`) });
    res[`${theme}_strip`] = await p.evaluate(() => getComputedStyle(document.getElementById('sidebar')).boxShadow);
    await p.evaluate(() => document.querySelector('[data-action="sidebar"]').click()); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, `${theme}_probe_sb_offen.png`) });
    await ctx.close();
  }
  console.log(JSON.stringify(res)); await b.close();
})();
