const { chromium } = require('playwright'); const path = require('path');
const base = process.env.BASE || 'file:///home/user/Florian/web/app.html';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  p.on('console', m => console.log('CONSOLE', m.type(), m.text().slice(0, 300)));
  p.on('requestfailed', r => console.log('REQFAIL', r.url().slice(0, 150), r.failure() && r.failure().errorText));
  await p.goto(base, { waitUntil: 'load' });
  await p.evaluate(() => { Store.installSample(); Store.setSetting('language', 'de'); Store.saveNow(); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.evaluate(() => Certificate.open('day', '2026-10-12')); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => {
    const card = document.querySelector('#cert-preview .cert'); const out = {};
    const cs = getComputedStyle(document.documentElement); out.font = cs.getPropertyValue('--font'); out.fontNum = cs.getPropertyValue('--font-num'); out.fontDisplay = cs.getPropertyValue('--font-display');
    out.titleFont = getComputedStyle(card.querySelector('.ct-big')).fontFamily; out.valFont = getComputedStyle(card.querySelector('.cert-value')).fontFamily;
    out.sheets = [...document.styleSheets].map(s => { let n = -1; try { n = s.cssRules.length; } catch (e) { n = 'ERR ' + e.name; } return (s.href || 'inline').slice(0, 90) + ' rules=' + n; });
    try { const css = await htmlToImage.getFontEmbedCSS(card); out.embedLen = css.length; out.embedFams = [...new Set((css.match(/font-family:\s*[^;]+/g) || []))]; } catch (e) { out.embedErr = String(e && e.message || e); }
    try { const bl = await htmlToImage.toBlob(card, { pixelRatio: 1, width: 1080, height: 1080, cacheBust: false }); out.noSkip = bl ? bl.size : 'null'; } catch (e) { out.noSkipErr = String(e && (e.message || e.type) || e); }
    return out; });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
