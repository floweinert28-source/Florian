const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
const ROUTES = ['dashboard','stats','stats/days','stats/setups','stats/time','stats/mistakes','stats/regime','stats/state','stats/edge','stats/mc','trades','day','notebook','progress','shadow','prop','prop/analyse','prop/auswertung','prop/bilanz','prop/konten','prop/friedhof','settings/profil','settings/design','settings/trading','settings/regeln','settings/notebook','settings/konten','coupons','affiliate','news','mentor','ruhepunkt'];
(async () => { const b = await chromium.launch(); const out = {};
  for (const theme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('language','de'); Store.setSetting('theme', t); Store.saveNow(); }, theme); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  for (const r of ROUTES) {
    await p.goto(base + '#/' + r); await p.waitForTimeout(800);
    const res = await p.evaluate(() => {
      const main = document.getElementById('main'); const all = main.querySelectorAll('*'); const groups = {};
      const key = el => (el.tagName.toLowerCase() + '.' + [...el.classList].slice(0, 2).join('.'));
      for (const el of all) {
        const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue; const rc = el.getBoundingClientRect(); if (rc.width < 40 || rc.height < 30) continue;
        const sh = cs.boxShadow !== 'none'; const bw = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none'; const bg = cs.backgroundColor;
        const isBox = (bw || sh) && bg !== 'rgba(0, 0, 0, 0)' && (parseFloat(cs.borderTopLeftRadius) >= 8);
        if (!isBox) continue;
        let anc = el.parentElement, nest = null; while (anc && anc !== main) { const a = getComputedStyle(anc); if (a.boxShadow !== 'none' && a.backgroundColor !== 'rgba(0, 0, 0, 0)') { nest = key(anc); break; } anc = anc.parentElement; }
        const k = key(el); const g = groups[k] || (groups[k] = { n: 0, shadow: 0, border: 0, bg, nestedIn: {} , shadowVal: ''}); g.n++; if (sh) { g.shadow++; g.shadowVal = cs.boxShadow.slice(0, 90); } if (bw) g.border++; if (nest && sh) g.nestedIn[nest] = (g.nestedIn[nest] || 0) + 1;
      }
      return groups;
    });
    out[theme + ' ' + r] = res;
  }
  await ctx.close(); }
  fs.writeFileSync(path.join(__dirname, 'light-elev-probe.json'), JSON.stringify(out, null, 1)); await b.close(); console.log('DONE'); })();
