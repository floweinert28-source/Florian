const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 794, height: 1123 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' });
  await p.goto(process.env.BASE + '#/dashboard'); await p.waitForTimeout(1500); await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(300);
  const res = await p.evaluate(() => { const out = []; const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = walk.nextNode())) { if (n.textContent.trim() === 'Dashboard') { const e = n.parentElement; const r = e.getBoundingClientRect(); const chain = []; let x = e; while (x && x !== document.body) { chain.push(x.tagName + '.' + String(x.className).slice(0, 30) + ':' + getComputedStyle(x).display); x = x.parentElement; } out.push({ y: Math.round(r.top), h: Math.round(r.height), chain: chain.slice(0, 6) }); } } return out; });
  console.log(JSON.stringify(res, null, 1));
  await p.pdf({ path: '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/audit/shots/extra/druck/_probe794_dashboard.pdf', format: 'A4' });
  await b.close();
})();
