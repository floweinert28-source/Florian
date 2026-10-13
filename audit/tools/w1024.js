/* 1024x768 dunkel: Messung aller Nebenseiten (Überlauf, Raster, Seitenbreite) */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const OUT = path.join(__dirname, 'shots', 'extra', 'w');
const ROUTES = ['stats/days', 'stats/setups', 'stats/mistakes', 'stats/state', 'stats/edge', 'stats/mc', 'stats/regime', 'prop', 'prop/bilanz', 'prop/konten', 'prop/friedhof', 'news', 'mentor', 'ruhepunkt', 'coupons', 'affiliate', 'shadow', 'progress',
  'settings/profil', 'settings/design', 'settings/sprache', 'settings/benachrichtigungen', 'settings/abo', 'settings/konten', 'settings/trading', 'settings/regeln', 'settings/notebook', 'settings/mentor', 'settings/inhalte', 'settings/logs'];
const W = +(process.argv[2] || 1024), H = +(process.argv[3] || 768), MINI = process.argv[4] === 'mini';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, reducedMotion: 'reduce' }); const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(m => { Store.installSample(); Store.setSetting('theme', 'dark'); Store.setSetting('language', 'de'); Store.setSetting('sidebarMini', m); Store.saveNow(); }, MINI); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  const R = {};
  for (const r of ROUTES) {
    await p.goto(base + '#/' + r); await p.waitForTimeout(800);
    await p.evaluate(async () => { const el = document.scrollingElement; for (let y = 0; y < el.scrollHeight; y += 300) { el.scrollTop = y; await new Promise(r => setTimeout(r, 60)); } el.scrollTop = 0; }); await p.waitForTimeout(300);
    R[r] = await p.evaluate(() => { const root = document.querySelector('#content'); const sel = el => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
      const out = { docSW: document.documentElement.scrollWidth, vw: innerWidth, clip: [], grids: [], svg: [] };
      root.querySelectorAll('*').forEach(el => { if (el.closest('svg')) return; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (!r.width) return; if (['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 2 && !el.classList.contains('vh')) out.clip.push({ s: (el.parentElement ? sel(el.parentElement) + ' > ' : '') + sel(el), sw: el.scrollWidth, cw: el.clientWidth, ell: cs.textOverflow === 'ellipsis', t: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) }); if (r.right > innerWidth + 1 && cs.position !== 'fixed') out.over = (out.over || 0) + 1; });
      root.querySelectorAll('.grid, .stat-tiles, .kstrip, .theme-grid, .stats').forEach(g => { const kids = [...g.children].filter(k => k.getBoundingClientRect().width > 0); if (kids.length < 2) return; const rows = {}; kids.forEach(k => { const t = Math.round(k.getBoundingClientRect().top); const key = Object.keys(rows).find(x => Math.abs(x - t) < 4) || t; rows[key] = (rows[key] || 0) + 1; }); const c = Object.values(rows); if (c.length > 1 && c[c.length - 1] < c[0]) out.grids.push({ s: sel(g), rows: c, w: [...new Set(kids.map(k => Math.round(k.getBoundingClientRect().width)))] }); });
      root.querySelectorAll('svg').forEach(svg => { const ts = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent.trim(), r: t.getBoundingClientRect() })).filter(x => x.t && x.r.width > 0); for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) { const a = ts[i].r, b = ts[j].r; const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ox > 1 && oy > 2) out.svg.push([ts[i].t, ts[j].t]); } });
      return out; });
    if (/notebook|days|mistakes/.test(r)) await p.screenshot({ path: path.join(OUT, `${W}${MINI ? '-mini' : ''}-dark-${r.replace(/\//g, '_')}.png`), fullPage: true });
  }
  fs.writeFileSync(path.join(OUT, `m${W}${MINI ? '-mini' : ''}-dark.json`), JSON.stringify(R, null, 1)); await b.close(); console.log('DONE');
})();
