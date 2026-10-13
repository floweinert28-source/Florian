const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE, { waitUntil: 'load' });
  await p.evaluate(() => { Store.installSample(); Store.setSetting('language', 'de'); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo.trades' })); Store.saveNow(); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1000);
  await p.evaluate(() => Certificate.open('day', '2026-10-12')); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { const st = document.createElement('style'); st.id = 'probe'; document.head.prepend(st); const card = document.querySelector('#cert-preview .cert'); const css = await htmlToImage.getFontEmbedCSS(card); const blob = await Certificate.toBlob(card, Certificate.FORMATS.square); const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); }); return { len: css.length, fams: [...new Set(css.match(/font-family:\s*[^;]+/g) || [])], data }; });
  console.log(r.len, JSON.stringify(r.fams)); fs.writeFileSync(path.join(__dirname, 'shots/extra/cert/_probe_mit_inline_style_day_square.png'), Buffer.from(r.data.split(',')[1], 'base64'));
  await b.close();
})();
