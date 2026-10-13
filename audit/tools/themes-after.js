const { chromium } = require('playwright'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'themes');
const PATCH = () => { const T = Theme; const { lum, shade, isLightBase } = T;
  const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const usableBase = h => { let x = h.toLowerCase(); let i = 0; if (isLightBase(x)) { while (lum(x) < 0.72 && i++ < 20) x = shade(x, 0.12); } else { while (lum(x) > 0.012 && i++ < 20) x = shade(x, -0.12); } return x; };
  const ink = (b, ref, target, lt) => { for (let k = 0; k <= 100; k++) { const c = shade(b, lt ? -k / 100 : k / 100); if (cr(c, ref) >= target) return c; } return lt ? '#000000' : '#ffffff'; };
  const b = usableBase(Store.settings.customBg); const lt = isLightBase(b);
  const s = lt ? { '--bg': b, '--bg-2': shade(b, -0.03), '--surface': shade(b, 0.72), '--surface-2': shade(b, 0.38), '--surface-3': shade(b, -0.04), '--border': shade(b, -0.10), '--border-2': shade(b, -0.19), '--field': shade(b, 0.72) }
    : { '--bg': b, '--bg-2': shade(b, 0.025), '--surface': shade(b, 0.05), '--surface-2': shade(b, 0.085), '--surface-3': shade(b, 0.12), '--border': shade(b, 0.10), '--border-2': shade(b, 0.17), '--field': shade(b, 0.015) };
  s['--text'] = ink(b, s['--surface-2'], 13, lt); s['--text-2'] = ink(b, s['--surface-2'], 8, lt); s['--muted'] = ink(b, s['--surface-3'], 4.6, lt); s['--faint'] = ink(b, s['--surface'], 2.3, lt);
  for (const k in s) document.documentElement.style.setProperty(k, s[k]); return s; };
(async () => { const b = await chromium.launch();
  for (const [name, bg, theme] of [['eigen-mittel', '#3a4a5a', 'dark'], ['eigen-hell', '#e8e4dc', 'light']]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(([bg, theme]) => { Store.installSample(); Store.setSetting('language', 'de'); Store.setSetting('customLook', true); Store.setSetting('customBg', bg); Store.setSetting('theme', theme); Store.saveNow(); }, [bg, theme]); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
    for (const r of ['trades', 'notebook']) { await p.goto(base + '#/' + r); await p.waitForTimeout(800); const s = await p.evaluate(PATCH); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, `${name}_${r}_nachher.png`) }); console.log(name, r, JSON.stringify(s)); }
    await ctx.close(); }
  await b.close(); })();
