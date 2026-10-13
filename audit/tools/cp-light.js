const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'themes');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('language', 'de'); Store.setSetting('theme', 'light'); Store.setSetting('savedColors', ['#ffffff', '#f2f5f3', '#e8e4dc', '#3b82f6']); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  await p.goto(base + '#/settings/design'); await p.waitForTimeout(900);
  await p.click('label.dot.custom'); await p.waitForTimeout(600);
  const pop = await p.$('.popover.cp'); if (pop) { await p.evaluate(() => { const i = document.querySelector('.cp-hex input'); }); await pop.screenshot({ path: path.join(OUT, 'colorpicker_light.png') }); console.log('ok'); } else console.log('no pop');
  const info = await p.evaluate(() => [...document.querySelectorAll('.cp-c')].map(e => [e.style.cssText, getComputedStyle(e).boxShadow]));
  console.log(JSON.stringify(info));
  await b.close(); })();
