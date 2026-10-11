const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
const OUT = path.join(__dirname, 'shots', 'extra', 'propfh');
(async () => { const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' });
  await p.evaluate(() => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.saveNow(); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
  const where = async (label) => { const r = await p.evaluate(() => { const t = document.querySelector('.prop-tabs'); return t ? (t.closest('#tb-tools') ? 'topbar' : 'kopfreihe') : 'fehlt'; }); console.log(label, r); };
  for (const h of ['#/dashboard', '#/prop', '#/prop/friedhof', '#/prop/bilanz', '#/prop/konten', '#/stats', '#/prop/friedhof']) { await p.goto(base + h); await p.waitForTimeout(700); await where(h); }
  await p.goto(base + '#/prop/friedhof'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900); await where('reload friedhof');
  /* Breach-Karte im Cockpit, umgedrehter Grabstein, Payout-Deep-Link */
  await p.screenshot({ path: path.join(OUT, 'fh-1440.png') });
  await p.evaluate(() => { const s = document.querySelector('.pg-stone'); if (s) s.querySelector('.pg-turn').click(); }); await p.waitForTimeout(1000);
  const st = await p.evaluate(() => { const s = document.querySelector('.pg-stone'); const r = s.getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; });
  await p.evaluate(y => window.scrollTo(0, y - 100), st.y); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, 'fh-back-1440.png') });
  console.log('stone', JSON.stringify(st));
  const m = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { fs: c.fontSize, fw: c.fontWeight, ff: c.fontFamily.split(',')[0], color: c.color, lh: c.lineHeight, ls: c.letterSpacing }; };
    return { rip: q('.pg-rip'), head: q('.prop-grave-head b'), cause: q('.pg-cause b'), causeLbl: q('.pg-cause span'), dates: q('.pg-dates'), turn: q('.pg-turn'), facts: q('.pg-facts dd'), factsdt: q('.pg-facts dt'), sub: q('.prop-sub a'), subOn: q('.prop-sub a[aria-pressed="true"]'), tab: q('.prop-tabs a'), tileVal: q('.prop-tiles .tile .val'), tileFoot: q('.prop-tiles .tile .foot'), pat: q('.prop-patterns-empty'), cardTitle: q('.card-title') }; });
  console.log(JSON.stringify(m, null, 1));
  await b.close(); })();
