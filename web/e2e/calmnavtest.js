/* Ruhiger Seitenwechsel: Seitenleiste und Kopfzeile stehen still (eigene View-Transition-Namen nur während des Wechsels),
   echte Überblendung (gleiche Dauer alt/neu), sichtbarer Inhalt sofort da (kein Einzug Karte für Karte), kein Dashboard-Skeleton */
const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/sample-dev.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  try {
    await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(1500);
    const src = require('fs').readFileSync('/home/user/Florian/web/css/app.css', 'utf8');
    const css = { old: (/::view-transition-old\(root\)\s*\{([^}]*)\}/.exec(src) || [])[1], nu: (/::view-transition-new\(root\)\s*\{([^}]*)\}/.exec(src) || [])[1] };
    const dur = s => (String(s).match(/var\(--dur-\d\)/) || [''])[0];
    ok('Überblendung alt/neu mit gleicher Dauer (nichts wird kurz dunkler)', !!css.old && dur(css.old) && dur(css.old) === dur(css.nu), JSON.stringify(css));
    const routes = ['stats', 'progress', 'trades', 'prop', 'affiliate', 'dashboard'];
    let names = [], after = [], vis = [];
    for (const r of routes) {
      const during = await p.evaluate(r => { const a = document.querySelector(`.sidebar a[href="#/${r}"], .rail a[href="#/${r}"]`); if (a) a.click(); else location.hash = '#/' + r; /* Seite in einem anderen Bereich der Leiste: direkt hin */ return new Promise(res => setTimeout(() => res({ on: document.documentElement.classList.contains('vt-on'), sb: getComputedStyle(document.querySelector('.sidebar')).viewTransitionName, tb: document.querySelector('.topbar') ? getComputedStyle(document.querySelector('.topbar')).viewTransitionName : null }), 30)); }, r);
      names.push(during);
      await p.waitForTimeout(120);
      vis.push(await p.evaluate(() => [...document.querySelectorAll('#content .rv')].filter(e => e.getBoundingClientRect().top < innerHeight - 10).length));
      await p.waitForTimeout(700);
      after.push(await p.evaluate(() => ({ on: document.documentElement.classList.contains('vt-on'), sb: getComputedStyle(document.querySelector('.sidebar')).viewTransitionName })));
    }
    const vtSupported = await p.evaluate(() => !!document.startViewTransition);
    ok('Während des Wechsels: Seitenleiste und Kopfzeile mit eigenem Namen (stehen still)', !vtSupported || names.every(n => n.on && n.sb === 'jy-sidebar' && n.tb === 'jy-topbar'), JSON.stringify(names));
    ok('Danach: Namen wieder weg (keine Nebenwirkung auf Menüs)', after.every(a => !a.on && a.sb === 'none'), JSON.stringify(after));
    ok('Sichtbarer Inhalt sofort da, kein Einzug Karte für Karte', vis.every(n => n === 0), JSON.stringify(vis));
    ok('Dashboard ohne Skeleton', (await p.$$eval('.skel', e => e.length)) === 0 && (await p.$$eval('.dash-top > .w', e => e.length)) > 0);
    /* Unterhalb des Fensters blendet weiterhin beim Reinscrollen ein */
    await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(900);
    const below = await p.evaluate(() => [...document.querySelectorAll('#content .rv')].length);
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1200);
    ok('Unterhalb des Fensters: blendet beim Reinscrollen ein', below > 0 && (await p.evaluate(() => document.querySelectorAll('#content .rv').length)) === 0, `vorher ${below}`);
    /* Wechsel innerhalb einer Seite: Menü/Reiter und Kopfreihe stehen still, nur der Teil darunter blendet (nicht aus ganz unsichtbar) */
    const inPage = async (start, sel, still, moving) => { await p.evaluate(h => { location.hash = h; }, start); await p.waitForTimeout(800); await p.click(sel); await p.waitForTimeout(40);
      return p.evaluate(([still, moving]) => { const an = q => { const e = document.querySelector(q); return e ? getComputedStyle(e).animationName : 'fehlt'; }; return { still: still.map(an), moving: moving.map(an), from: (() => { for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) if (r.name === 'swap-in') return r.cssRules[0].style.opacity; } catch (e) { return 'n/a'; } } return null; })() }; }, [still, moving]); };
    const s1 = await inPage('#/settings/profil', '.set-nav a[href="#/settings/design"]', ['.set-nav', '.content'], ['.set-body']);
    ok('Einstellungen: Menü links steht still, nur der Bereich rechts blendet', s1.still.every(x => x === 'none') && s1.moving.every(x => x === 'swap-in'), JSON.stringify(s1));
    const s2 = await inPage('#/stats/summary', '.tabs[data-subnav] a[href="#/stats/days"]', ['.tabs[data-subnav]', '.content > .card', '.page-head'], ['.tabs[data-subnav] ~ *']);
    ok('Statistiken: Diagramm oben, Reiter und Kopfreihe stehen still, nur der Reiter-Inhalt blendet', s2.still.every(x => x === 'none') && s2.moving.every(x => x === 'swap-in'), JSON.stringify(s2));
    const s3 = await inPage('#/prop/cockpit', '.prop-tabs a[data-area="konten"]', ['.page-head'], ['.content > :not(.page-head)']);
    ok('Prop Firms: Kopfreihe mit Bereichen steht still', s3.still.every(x => x === 'none') && s3.moving.every(x => x === 'swap-in'), JSON.stringify(s3));
    const s4 = await inPage('#/affiliate', '.aff-top a[href="#/affiliate/creator"]', ['.aff-top'], ['.aff-top ~ *']);
    ok('Affiliate: Umschalter steht still', s4.still.every(x => x === 'none') && s4.moving.every(x => x === 'swap-in'), JSON.stringify(s4));
    /* Reiter antippen: Seite springt nicht nach oben, Reiterleiste bleibt, gewählter Reiter sichtbar, kein Scrollbalken */
    await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => { location.hash = '#/stats/summary'; }); await p.waitForTimeout(900);
    await p.evaluate(() => { const t = document.querySelector('.tabs[data-subnav]'); scrollTo(0, t.getBoundingClientRect().top + scrollY - 300); t.scrollLeft = 220; }); await p.waitForTimeout(400);
    const b0 = await p.evaluate(() => { const t = document.querySelector('.tabs[data-subnav]'); return { y: Math.round(scrollY), x: t.scrollLeft, top: Math.round(t.getBoundingClientRect().top), sbw: getComputedStyle(t).scrollbarWidth }; });
    await p.click('.tabs[data-subnav] a[href="#/stats/mistakes"]'); await p.waitForTimeout(600);
    const b1 = await p.evaluate(() => { const t = document.querySelector('.tabs[data-subnav]'); const a = t.querySelector('[aria-pressed="true"]').getBoundingClientRect(), r = t.getBoundingClientRect(); return { y: Math.round(scrollY), x: t.scrollLeft, top: Math.round(r.top), vis: a.left >= r.left - 1 && a.right <= r.right + 1 }; });
    ok('Statistik-Reiter antippen: Seite und Reiterleiste bleiben stehen, gewählter Reiter sichtbar, kein Scrollbalken', b0.y > 0 && b1.y === b0.y && b1.top === b0.top && b1.vis && b1.x > 0 && b0.sbw === 'none', JSON.stringify({ b0, b1 }));
    await p.evaluate(() => { location.hash = '#/settings/profil'; }); await p.waitForTimeout(800); await p.evaluate(() => scrollTo(0, 400)); await p.waitForTimeout(200);
    await p.evaluate(() => document.querySelector('.set-nav a[href="#/settings/design"]').click()); await p.waitForTimeout(600);
    ok('Einstellungen: neuer Bereich beginnt oben', (await p.evaluate(() => scrollY)) === 0);
    await p.setViewportSize({ width: 1440, height: 900 });
    const css2 = require('fs').readFileSync('/home/user/Florian/web/css/app.css', 'utf8');
    ok('Einblenden beginnt nicht bei ganz unsichtbar (kein Aufblitzen)', /@keyframes swap-in \{ from \{ opacity: \.35; \} \}/.test(css2));
    ok('keine Seitenfehler', !errors.length, errors.join(' | '));
  } catch (e) { console.log('CRASH ' + e.message); }
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors'); console.log(`${pass} PASS, ${fail} FAIL`);
  await b.close();
})();
