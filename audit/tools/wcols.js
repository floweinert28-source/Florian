/* Spaltenbreiten der abgeschnittenen Tabellen bei 1024x768 dunkel, plus Aufnahmen */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'w');
const W = +(process.argv[2] || 1024), H = +(process.argv[3] || 768);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  const R = {};
  for (const r of ['prop/bilanz', 'prop/konten', 'settings/konten', 'settings/inhalte', 'settings/logs', 'shadow', 'trades', 'dashboard']) {
    await p.goto(base + '#/' + r); await p.waitForTimeout(900);
    await p.evaluate(async () => { const el = document.scrollingElement; for (let y = 0; y < el.scrollHeight; y += 300) { el.scrollTop = y; await new Promise(r => setTimeout(r, 60)); } el.scrollTop = 0; }); await p.waitForTimeout(300);
    R[r] = await p.evaluate(() => [...document.querySelectorAll('#content table')].map(t => { const wrap = t.closest('.tbl-wrap, .tbl-scroll'); return { cls: t.className, minW: getComputedStyle(t).minWidth, tw: Math.round(t.getBoundingClientRect().width), wrapW: wrap && wrap.clientWidth, cols: [...t.querySelectorAll('thead th')].map(th => th.textContent.trim() + ':' + Math.round(th.getBoundingClientRect().width)) }; }));
    if (/prop\/bilanz|prop\/konten|settings\/inhalte/.test(r)) await p.screenshot({ path: path.join(OUT, `${W}-dark-${r.replace(/\//g, '_')}.png`), fullPage: true });
  }
  fs.writeFileSync(path.join(OUT, `cols${W}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1)); await b.close();
})();
