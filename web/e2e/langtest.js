/* Sprachen Etappe 1: jede Sprache durch Dashboard, TradeLog, Trade-Detail, Dialoge und Einstellungen klicken.
   Prüft: Sprache aktiv, keine deutschen Reste aus dem Wörterbuch, kein Querscrollen, keine abgeschnittenen Knöpfe/Navigation, keine Fehler. */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const LANGS = (process.argv[2] || 'en,es,zh,hi,pt').split(',');
const SHOTS = path.join(__dirname, 'langshots'); fs.mkdirSync(SHOTS, { recursive: true });
const KEYSALL = Object.keys(JSON.parse(fs.readFileSync(path.join(__dirname, 'i18n/strings-etappe1.json'), 'utf8')));
/* nur Texte, die in dieser Sprache wirklich anders lauten (Markennamen usw. bleiben gleich) */
const keysFor = lang => { const m = {}; const d = path.join(__dirname, 'i18n', lang); fs.readdirSync(d).filter(f => /^part-.*\.json$/.test(f)).sort().forEach(f => Object.assign(m, JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')))); return KEYSALL.filter(k => !/\{\d+\}/.test(k) && m[k] != null && m[k] !== k); };
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => {
  const b = await chromium.launch();
  for (const lang of LANGS) {
    const KEYS = keysFor(lang);
    for (const vp of [{ w: 1440, h: 900, tag: 'desk' }, { w: 390, h: 844, tag: 'mob', mobile: true }]) {
      const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: !!vp.mobile, isMobile: !!vp.mobile }); const p = await ctx.newPage();
      await require('./localfonts.js')(p);
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.goto('file:///home/user/Florian/web/app.html#/settings/sprache', { waitUntil: 'load' }); await p.waitForTimeout(700);
      await p.evaluate(l => { const c = document.querySelector(`.lang-card[data-value="${l}"]`); c.click(); }, lang); await p.waitForTimeout(500);
      const T = `[${lang} ${vp.tag}]`;
      ok(await p.evaluate(l => document.documentElement.dataset.lang === l && Store.settings.language === l, lang), `${T} Sprache aktiv und gespeichert`);
      /* Prüfer: deutsche Reste = sichtbare Texte, die noch genau einem deutschen Schlüssel entsprechen */
      const check = async (where, shot) => {
        await p.waitForTimeout(150);
        const r = await p.evaluate(keys => {
          const KS = new Set(keys); const SKIP = 'script,style,code,pre,textarea,input,.ql-editor,[contenteditable="true"],.no-i18n';
          const vis = el => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') return false; const rc = el.getBoundingClientRect(); return rc.width > 0 && rc.height > 0; };
          const left = []; const w = document.createTreeWalker(document.body, 4); let n;
          while ((n = w.nextNode())) { const pe = n.parentElement; if (!pe || pe.closest(SKIP) || !vis(pe)) continue; const t = n.nodeValue.replace(/\s+/g, ' ').trim(); if (t && KS.has(t)) left.push(t); }
          document.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => ['placeholder', 'title', 'aria-label'].forEach(a => { const v = el.getAttribute(a); if (v && KS.has(v.trim())) left.push('@' + a + ':' + v); }));
          const over = document.documentElement.scrollWidth > window.innerWidth + 1;
          const clipped = [];
          document.querySelectorAll('.sidebar .nav a, .btn, .seg button, .tabs button, .set-nav a, .lang-card, .page-head h1').forEach(el => { if (!vis(el)) return; const s = getComputedStyle(el); if (s.overflow === 'visible' && s.textOverflow !== 'ellipsis') { const rc = el.getBoundingClientRect(); const pr = el.parentElement.getBoundingClientRect(); if (rc.right > pr.right + 2 && getComputedStyle(el.parentElement).overflowX === 'visible' && !el.closest('.popover,.dash-head,.ph-actions,.tbl-wrap,.chips,.scroll-x')) clipped.push((el.textContent || '').trim().slice(0, 40)); } else if (el.scrollWidth > el.clientWidth + 2 && s.textOverflow !== 'ellipsis') clipped.push((el.textContent || '').trim().slice(0, 40)); });
          document.querySelectorAll('svg.radar-svg').forEach(svg => { const vb = svg.viewBox.baseVal; svg.querySelectorAll('text').forEach(t => { const b = t.getBBox(); if (b.x < vb.x - 1 || b.x + b.width > vb.x + vb.width + 1) clipped.push('Radar: ' + t.textContent); }); });
          return { left: [...new Set(left)].slice(0, 12), over, clipped: [...new Set(clipped)].slice(0, 8) };
        }, KEYS);
        ok(!r.left.length, `${T} ${where}: keine deutschen Reste${r.left.length ? ' → ' + r.left.join(' | ') : ''}`);
        ok(!r.over, `${T} ${where}: kein Querscrollen`);
        ok(!r.clipped.length, `${T} ${where}: nichts abgeschnitten${r.clipped.length ? ' → ' + r.clipped.join(' | ') : ''}`);
        if (shot) await p.screenshot({ path: path.join(SHOTS, `${lang}-${vp.tag}-${shot}.png`) });
      };
      const go = async h => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(800); };
      await check('Einstellungen/Sprache', 'sprache');
      await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); }); await go('#/dashboard'); await p.waitForTimeout(400);
      await check('Dashboard', 'dashboard');
      if (!vp.mobile) {
        for (const s of ['range', 'account', 'tpl']) { const el = await p.$(`.dash-head [data-pop=${s}]`); if (!el) continue; await el.click(); await p.waitForTimeout(250); await check('Dashboard-Menü ' + s, s === 'range' ? 'menu-range' : null); await p.keyboard.press('Escape'); await p.mouse.click(5, 880); }
        await p.click('#main [data-pop=range]'); await p.waitForTimeout(300);
        ok(await p.evaluate(() => { const t = document.querySelector('#pop-range .rr-m-title'); return !!t && !/[äöü]|Januar|Februar|März|Oktober|Dezember/.test(t.textContent); }), `${T} Kalender in Sprache: ${await p.evaluate(() => (document.querySelector('#pop-range .rr-m-title') || {}).textContent)}`);
        await p.screenshot({ path: path.join(SHOTS, `${lang}-desk-kalender.png`) }); await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.mouse.click(5, 880);
      }
      await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(500); await check('Trade-Editor', 'editor'); await p.evaluate(() => UI.closeModal(true)); await p.waitForTimeout(300);
      await go('#/trades'); await check('TradeLog', 'trades');
      const tid = await p.evaluate(() => App.allTrades().find(t => t.closed).id); await go('#/trades/' + tid); await check('Trade-Detail', 'detail');
      for (const s of ['profil', 'design', 'konten', 'trading', 'regeln', 'benachrichtigungen']) { await go('#/settings/' + s); await check('Einstellungen/' + s, s === 'design' || s === 'konten' ? 'set-' + s : null); }
      const title = await p.evaluate(() => document.title); ok(!/Einstellungen/.test(title), `${T} Fenstertitel übersetzt: ${title}`);
      /* Zahlen und Daten im Gebietsschema der Sprache */
      const loc = await p.evaluate(() => ({ cur: UI.fmt.cur(1234.5), loc: I18N.locale() })); console.log(`  ${T} Format ${loc.loc}: ${loc.cur}`);
      ok(!errs.length, `${T} keine Fehler${errs.length ? ' → ' + errs.join(' | ') : ''}`);
      /* zurück auf Deutsch */
      if (vp.tag === 'desk') { await go('#/settings/sprache'); await p.evaluate(() => document.querySelector('.lang-card[data-value="de"]').click()); await p.waitForTimeout(500);
        ok(await p.evaluate(() => document.documentElement.lang === 'de' && [...document.querySelectorAll('.sidebar .nav a')].some(a => /Statistiken/.test(a.textContent)) && /Einstellungen/.test(document.title)), `${T} zurück auf Deutsch vollständig`); }
      await ctx.close();
    }
  }
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0);
})();
