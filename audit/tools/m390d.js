/* Nachfinder Handy 390, Teil 4: Probe für Einstellungs-Tabellen ohne seitliches Scrollen */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'm390');
const CSS = `@media (max-width: 560px) { .set-tbl { min-width: 0; } .set-tbl .ph-hide { display: none; } .set-tbl td.wrap { white-space: normal; } .set-tbl th, .set-tbl td { padding-left: 8px; padding-right: 8px; } .set-tbl th:first-child, .set-tbl td:first-child { padding-left: 12px; } }`;
/* je Tabelle: auszublendende Spalten (0-basiert) und Spalten, die umbrechen dürfen */
const PLAN = { konten: { hide: [2, 3, 4], wrap: [0] }, kategorien: { hide: [], wrap: [] }, tags: { hide: [1, 3], wrap: [0] }, imports: { hide: [0, 1, 3, 5], wrap: [2] }, verlauf: { hide: [3, 5, 6, 7, 8], wrap: [2, 4] } };
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.addImport && Store.addImport({ source: 'CSV', file: 'tradovate-oktober.csv', accountId: Store.data.accounts[0].id, count: 42, dup: 3, status: 'Erfolg' }); Store.saveNow(); }, theme);
    await p.goto(base + '#/settings/konten'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
    const apply = async key => { await p.addStyleTag({ content: CSS }); return p.evaluate(({ plan }) => { const w = document.querySelector('#content .tbl-wrap'); const t = w.querySelector('table'); t.classList.add('set-tbl'); t.querySelectorAll('tr').forEach(tr => [...tr.children].forEach((c, i) => { if (plan.hide.includes(i)) c.classList.add('ph-hide'); if (plan.wrap.includes(i) && c.tagName === 'TD') c.classList.add('wrap'); })); return { wrapW: w.clientWidth, scrollW: w.scrollWidth, cols: [...t.querySelectorAll('thead th')].filter(th => th.offsetParent).map(th => th.textContent.trim() || '(Aktionen)') }; }, { plan: PLAN[key] }); };
    const go = async (route, key, pre) => { await p.goto(base + '#/' + route); await p.waitForTimeout(700); if (pre) { await p.evaluate(pre); await p.waitForTimeout(500); } res[`${theme}_${key}`] = await apply(key); await p.waitForTimeout(200); await p.screenshot({ path: path.join(OUT, `${theme}_probe_tbl_${key}.png`) }); };
    await go('settings/konten', 'konten');
    await go('settings/inhalte', 'kategorien', () => document.querySelector('[data-action="content-tab"][data-value="kategorien"]').click());
    await go('settings/inhalte', 'tags', () => document.querySelector('[data-action="content-tab"][data-value="tags"]').click());
    await go('settings/logs', 'imports', () => document.querySelector('[data-action="log-tab"][data-value="imports"]').click());
    await go('settings/logs', 'verlauf', () => document.querySelector('[data-action="log-tab"][data-value="verlauf"]').click());
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'meas4.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await b.close();
})();
