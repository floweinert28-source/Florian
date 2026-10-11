const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const dir = path.join(__dirname, 'shots', 'extra');
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.goto(base + '#/trades'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
  const id = await p.evaluate(() => document.querySelector('tr[data-action="trade"]').dataset.id); await p.goto(base + '#/trades/' + id); await p.waitForTimeout(800);
  await p.evaluate(async () => { const el = document.scrollingElement; for (let y = 0; y < el.scrollHeight; y += 250) { el.scrollTop = y; await new Promise(r => setTimeout(r, 100)); } el.scrollTop = el.scrollHeight; }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(dir, 'tl-1440-trade_detail_fuss.png'), fullPage: false });
  const dz = await p.evaluate(() => [...document.querySelectorAll('.dropzone svg')].map(s => s.getBoundingClientRect().width + 'x' + s.getBoundingClientRect().height));
  console.log('dropzone svg sizes', JSON.stringify(dz));
  await b.close(); console.log('TL3DONE'); })();
