const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch();
  for (const width of [1440, 390]) {
    const mobile = width < 600; const dir = path.join(__dirname, 'shots', 'extra');
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); for (const e of Store.propExpenses().slice()) Store.deletePropExpense(e.id); for (const x of Store.propPayouts().slice()) Store.deletePropPayout(x.id); Store.saveNow(); });
    const go = async (h) => { await p.goto(base + h); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200); };
    const scrollShots = async (name) => { const H = await p.evaluate(() => document.documentElement.scrollHeight); const vh = mobile ? 844 : 900; let i = 0; for (let y = 0; y < H; y += vh - 100) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(500); await p.screenshot({ path: path.join(dir, `hicks-prop-${width}-${name}-s${i}.png`) }); console.log('ok', width, name, i); i++; if (i > 6) break; } };
    await go('#/prop/bilanz'); await scrollShots('bilanz_ohne_buchungen');
    await p.evaluate(() => { for (const a of Store.propAccounts().slice()) Store.deletePropAccount(a.id); Store.saveNow(); });
    await go('#/prop/bilanz'); await scrollShots('leer_bilanz');
    await ctx.close();
  }
  await b.close();
})();
