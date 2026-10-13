const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); await require('../localfonts.js')(p);
  await p.goto('file:///home/user/Florian/web/app.html', { waitUntil: 'load' }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { await document.fonts.ready;
    const strs = ['+591,83 €', '+$1,826.39', '+1.826,39 €', '+$123,456.78', '+123.456,78 €', '+1.234.567,89 €', '−227,83 €'];
    return strs.map(s => { const sp = document.createElement('span'); sp.style.cssText = 'font-family:Onest;font-weight:700;font-size:100px;letter-spacing:-.02em;white-space:nowrap;position:absolute;padding:0 .5em'; sp.textContent = s; document.body.appendChild(sp); const w = sp.getBoundingClientRect().width; sp.remove(); return [s, s.length, +(w / 100).toFixed(2)]; }); });
  console.log(JSON.stringify(r)); await b.close();
})();
