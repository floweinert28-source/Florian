const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const dir = path.join(__dirname, 'shots', 'extra');
(async () => { const b = await chromium.launch();
  for (const [width, height] of [[1440, 2600], [390, 3400]]) {
    const mobile = width < 600; const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); });
    const shot = async name => { await p.waitForTimeout(600); await p.screenshot({ path: path.join(dir, `hicks-tr2-${width}-${name}.png`) }); console.log('ok', width, name); };
    await p.goto(base + '#/shadow'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200); await shot('shadow_lang');
    console.log('detail vorhanden:', await p.evaluate(() => !!document.querySelector('.shadow-detail')), 'pager:', await p.evaluate(() => !!document.querySelector('.pager')), 'violations:', await p.evaluate(() => document.querySelectorAll('.shadow-tbl tbody tr').length));
    if (mobile) { await p.goto(base + '#/progress'); await p.waitForTimeout(1200); await shot('progress_lang'); await p.goto(base + '#/ruhepunkt'); await p.waitForTimeout(1500); await shot('ruhepunkt_lang'); }
    await ctx.close(); }
  await b.close(); console.log('TR2DONE'); })();
