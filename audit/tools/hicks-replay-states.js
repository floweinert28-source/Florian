const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch();
  for (const width of [1440, 390]) {
    const dir = path.join(__dirname, 'shots', 'extra'); const mobile = width < 600;
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); await ctx.addInitScript(() => { try { localStorage.setItem('jy_features', '{"replay":true}'); } catch (e) {} }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.goto(base + '#/replay'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1500);
    const shot = async (name, full) => { await p.waitForTimeout(600); await p.screenshot({ path: path.join(dir, `hicks-replay-${name}-${width}.png`), fullPage: !!full }); console.log('ok', name, width); };
    await p.click('[data-action="replay-start"]'); await p.waitForTimeout(2500);
    const info = await p.evaluate(() => { const i = document.querySelector('.replay-shot img'); return { src: i && i.src ? i.src.slice(0, 40) : null, nat: i ? i.naturalWidth : null, head: [...document.querySelectorAll('.dash-head button, .dash-head a')].map(x => (x.className + ' | ' + (x.getAttribute('aria-label') || x.textContent.trim())).slice(0, 80)) }; }); console.log(JSON.stringify(info));
    await shot('karte', true);
    await p.click('[data-action="replay-decide"][data-value="take"]'); await p.waitForTimeout(1200); await shot('aufloesung', true);
    for (let i = 0; i < 12; i++) { const nx = await p.$('[data-action="replay-next"]'); if (nx) { await nx.click(); await p.waitForTimeout(250); } const d = await p.$('[data-action="replay-decide"][data-value="skip"]'); if (d) { await d.click(); await p.waitForTimeout(250); } }
    const nx = await p.$('[data-action="replay-next"]'); if (nx) { await nx.click(); await p.waitForTimeout(600); }
    await shot('auswertung', true);
    // Variante: Trades vorhanden, keine mit Screenshot vor Entry, keine Historie
    await p.evaluate(() => { App.state.replay = null; for (const t of Store.trades()) t.screenshotPre = null; Store.data.replay = { history: [] }; Store.saveNow(); }); await p.goto(base + '#/dashboard'); await p.goto(base + '#/replay'); await p.waitForTimeout(1200); await shot('leer-ohne-pre', true);
    // Variante: Trades mit Screenshot, aber noch keine Historie
    await p.evaluate(() => { Store.removeSample(); Store.installSample(); Store.data.replay = { history: [] }; Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200); await shot('start-ohne-historie', true);
    await ctx.close(); }
  await b.close(); })();
