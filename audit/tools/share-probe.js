const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const link = fs.readFileSync(path.join(__dirname, 'shots/extra/share/link.txt'), 'utf8'); const hash = link.slice(link.indexOf('#'));
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE + hash, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => { const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { y: Math.round(r.top + scrollY), h: Math.round(r.height), b: Math.round(r.bottom + scrollY), x: Math.round(r.left), w: Math.round(r.width), sh: e.scrollHeight, ch: e.clientHeight, ov: cs.overflowY, hgt: cs.height, disp: cs.display, par: e.parentElement.className }; }; return { content: R('.content'), sec: R('.nb-share-view'), cont: R('.nb-share-view .ql-container'), ed: R('.nb-share-view .ql-editor'), div: R('.nb-share-view .divider'), btn: R('.nb-share-view a.btn'), pageHead: R('.page-head'), main: R('.main'), contentCls: document.querySelector('.content').className, scrollEl: (() => { const m = document.querySelector('.main'); return { sh: m.scrollHeight, ch: m.clientHeight }; })() }; });
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
