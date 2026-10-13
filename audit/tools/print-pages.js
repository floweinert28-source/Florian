const { chromium } = require('playwright'); const path = require('path'); const { execFileSync } = require('child_process');
const D1 = path.join(__dirname, 'shots', 'extra', 'druck');
const rast = (pdf, prefix) => execFileSync('python3', ['-I', '-c', `import pypdfium2 as p,sys\nd=p.PdfDocument(sys.argv[1])\nprint(len(d))\nfor i in range(min(len(d),4)):\n  d[i].render(scale=1.1).to_pil().save(sys.argv[2]+'_s%d.png'%(i+1))`, pdf, prefix]).toString().trim();
(async () => {
  const b = await chromium.launch();
  for (const theme of ['dark', 'light']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
    await p.goto(process.env.BASE, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme); await p.reload({ waitUntil: 'load' });
    for (const r of ['dashboard', 'stats', 'day']) {
      await p.goto(process.env.BASE + '#/' + r); await p.waitForTimeout(2200);
      await p.emulateMedia({ media: 'print' });
      for (const bg of [false, true]) { const f = path.join(D1, `${theme}_${r}${bg ? '_hintergrund' : ''}.pdf`); await p.pdf({ path: f, format: 'A4', printBackground: bg }); console.log(theme, r, bg, rast(f, f.replace('.pdf', ''))); }
      await p.emulateMedia({ media: null });
    }
    await ctx.close();
  }
  await b.close();
})();
