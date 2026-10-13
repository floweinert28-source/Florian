const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
  await p.goto(process.env.BASE, { waitUntil: 'load' });
  await p.evaluate(() => { Store.installSample(); Store.setSetting('language', 'de'); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo.trades' })); Store.saveNow(); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1000);
  const r = await p.evaluate(() => { const out = {}; const D = CertData; const p0 = D.period('month', '2026-10'); const m = D.compute('month', D.select(App.allTrades(), p0), p0);
    for (const f of ['square', 'story', 'wide']) { const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:0;top:0;z-index:9999'; host.innerHTML = Certificate.cardHTML(m, p0, { format: f, user: true, hide: false, account: 0 }); document.body.appendChild(host); const card = host.firstElementChild; const cr = card.getBoundingClientRect();
      const q = s => { const e = card.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: Math.round(r.left - cr.left), y: Math.round(r.top - cr.top), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom - cr.top), fs: cs.fontSize, fw: cs.fontWeight, ff: cs.fontFamily.split(',')[0], ls: cs.letterSpacing }; };
      out[f] = { card: [cr.width, cr.height], brandName: q('.cert-brand .name'), brandTag: q('.cert-brand .tag'), title: q('.ct-big'), sub: q('.ct-sub'), toK: q('.cert-to .k'), user: q('.cert-to .user'), valueSpan: q('.cert-value span'), period: q('.cert-period'), stats: q('.cert-stats'), statK: q('.cert-stats .st .k'), statV: q('.cert-stats .st .v'), foot: q('.cert-foot'), footV: q('.cert-foot .issue .v'), footK: q('.cert-foot .issue .k'), footVmono: q('.cert-foot .issue .v.mono'), frame: q('.cert-frame') };
      out[f].valueShadow = getComputedStyle(card.querySelector('.cert-value span')).boxShadow; host.remove(); }
    return out; });
  for (const [f, v] of Object.entries(r)) { console.log('==', f, JSON.stringify(v.card)); for (const [k, x] of Object.entries(v)) if (x && typeof x === 'object' && !Array.isArray(x)) console.log(k.padEnd(10), JSON.stringify(x)); console.log('shadow', v.valueShadow); }
  await b.close();
})();
