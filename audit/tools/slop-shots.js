const { chromium } = require('playwright'); const path = require('path');
const out = path.join(__dirname, 'shots', 'extra', 'slop');
(async () => { const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto('file:///home/user/Florian/web/app.html', { waitUntil: 'load' });
  await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'light'); Store.setSetting('language', 'de'); Store.saveNow(); });
  await p.goto('file:///home/user/Florian/web/index.html', { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(out, 'landing_light.png'), fullPage: true });
  const info = await p.evaluate(() => { const h = document.querySelector('.lp .hero h1'); return { theme: document.documentElement.dataset.theme, color: getComputedStyle(h).color, bg: getComputedStyle(document.body).backgroundColor }; });
  console.log(JSON.stringify(info));
  await p.goto('file:///home/user/Florian/web/app.html', { waitUntil: 'load' }); await p.evaluate(() => { Store.setSetting('theme', 'dark'); Store.saveNow(); });
  await p.goto('file:///home/user/Florian/web/index.html', { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(out, 'landing_dark.png'), fullPage: true });
  await ctx.close(); await b.close(); })();
