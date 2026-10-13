const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE, { waitUntil: 'load' }); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { const out = {}; for (const u of ['https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap', 'https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap', 'https://fonts.gstatic.com/local/Onest-700.woff2', 'https://cdn.fontshare.com/local/Satoshi-Bold.woff2']) { try { const res = await fetch(u); const t = await res.text(); out[u.slice(8, 40)] = res.status + ' ' + t.length; } catch (e) { out[u.slice(8, 40)] = 'ERR ' + e.message; } try { const res = await fetch(u, { cache: 'no-cache' }); out['nc ' + u.slice(8, 40)] = res.status; } catch (e) { out['nc ' + u.slice(8, 40)] = 'ERR ' + e.message; } } return out; });
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
