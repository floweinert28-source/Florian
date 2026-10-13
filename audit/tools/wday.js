const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch();
  for (const [w, mini] of [[1280, false], [1366, false], [1440, false], [1280, true]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(m => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.setSetting('sidebarMini', m); Store.saveNow(); }, mini); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
    for (const day of ['2026-10-12', '2026-08-17']) {
      await p.goto(base + '#/day/' + day); await p.waitForTimeout(800);
      const r = await p.evaluate(() => { const t = document.querySelector('#content .card table'); if (!t) return null; const wrap = t.closest('.tbl-wrap'); const ths = [...t.querySelectorAll('thead th')].map(th => th.textContent.trim() + ':' + Math.round(th.getBoundingClientRect().width)); const stats = document.querySelector('.day-card .stats'); const rows = {}; [...stats.children].forEach(k => { const tp = Math.round(k.getBoundingClientRect().top); rows[tp] = (rows[tp] || 0) + 1; }); return { tw: Math.round(t.getBoundingClientRect().width), sw: wrap.scrollWidth, cw: wrap.clientWidth, ths, kpiRows: Object.values(rows) }; });
      console.log(w, mini ? 'mini' : 'open', day, JSON.stringify(r));
      if (w === 1280 && !mini && day === '2026-08-17') await p.screenshot({ path: 'audit/shots/extra/w/1280-open-day_fehlerchips.png', fullPage: true });
    }
    await ctx.close();
  }
  await b.close();
})();
