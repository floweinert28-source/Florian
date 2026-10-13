const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 794, height: 1123 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' });
  for (const r of ['dashboard', 'stats']) {
    await p.goto(process.env.BASE + '#/' + r); await p.waitForTimeout(1500); await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(300);
    const res = await p.evaluate(() => { const vw = document.documentElement.clientWidth; const over = []; document.querySelectorAll('.main *').forEach(e => { const r = e.getBoundingClientRect(); if (r.width && r.right > vw + 2 && getComputedStyle(e).display !== 'none') { const par = e.parentElement; if (!(par && par.getBoundingClientRect().right > vw + 2)) over.push((e.className && e.className.baseVal === undefined ? e.className : e.tagName) + ' r=' + Math.round(r.right)); } }); const vis = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).display + ' ' + Math.round(e.getBoundingClientRect().height) + 'px' : 'fehlt'; }; const col = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).color : 'fehlt'; }; return { vw, over: over.slice(0, 12), topbar: vis('.topbar'), titlebar: [...document.querySelectorAll('header, .titlebar, .top, .page-top')].map(e => e.className + ':' + getComputedStyle(e).display).slice(0, 5), firstVisible: [...document.querySelector('.main').children].map(e => e.tagName + '.' + e.className + ':' + getComputedStyle(e).display).slice(0, 6), seg: col('.tabs button, .seg button'), btn: col('.btn'), btnIcon: (() => { const s = document.querySelector('.btn svg'); return s ? getComputedStyle(s).stroke + '/' + getComputedStyle(s).color : 'fehlt'; })(), muted: col('.muted'), kpiLbl: col('.kpi .k, .tile .k, .kpi-label, .tile .lbl') }; });
    console.log(r, JSON.stringify(res)); await p.emulateMedia({ media: 'screen' });
  }
  await b.close();
})();
