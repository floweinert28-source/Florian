/* Ladeanzeigen: App-Start (Logo + Kurslinie), Startfehler weiterhin sichtbar, Kurslinie/Ring/Platzhalter-Glanz in dunkel und hell */
const { chromium } = require('playwright'); const fs = require('fs');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  /* 1) App-Start langsam: Ladeanzeige sichtbar, danach weg */
  const p = await b.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.route(/\/js\/app\.js$/, async r => { await new Promise(res => setTimeout(res, 1600)); r.continue(); });
  await p.goto(BASE + '#/dashboard', { waitUntil: 'commit' }); await p.waitForTimeout(900);
  const boot = await p.evaluate(() => { const bt = document.querySelector('#main .boot'); if (!bt) return null; const tiles = [...bt.querySelectorAll('.boot-tiles .skel')].filter(e => e.offsetWidth); const main = [...bt.querySelectorAll('.boot-main .skel')].filter(e => e.offsetWidth); const top = bt.querySelector('.boot-top'); return { op: getComputedStyle(bt).opacity, tiles: tiles.length, main: main.length, topH: top ? top.offsetHeight : 0, sheen: getComputedStyle(bt.querySelector('.skel'), '::after').animationName, sb: document.querySelectorAll('#sidebar .boot-sb .skel').length, ld: !!bt.querySelector('.ld') }; });
  ok(boot && +boot.op > .9 && boot.tiles === 5 && boot.main === 3 && boot.topH >= 60 && boot.sheen === 'skel-sheen' && boot.sb > 8 && !boot.ld, 'App-Start: Skelett (Titelzeile, 5 Kacheln, 3 Karten, Seitenleiste) statt Kurslinie · ' + JSON.stringify(boot));
  await p.screenshot({ path: 'langshots/load-boot.png' });
  await p.waitForSelector('.dash-head', { timeout: 15000 }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('.boot') && !document.querySelector('.boot-sb')), 'Nach dem Laden: Skelett (Seite und Seitenleiste) verschwunden');
  await p.close();
  /* 2) Startfehler: Meldung erscheint trotz Ladeanzeige */
  const e = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await e.route(/\/js\/app\.js$/, r => r.fulfill({ status: 200, contentType: 'text/javascript', body: 'throw new Error("Test-Startfehler")' }));
  await e.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await e.waitForTimeout(600);
  ok(await e.evaluate(() => /konnte nicht starten/.test(document.getElementById('main').textContent) && !document.querySelector('.boot')), 'Startfehler: Meldung statt Ladeanzeige');
  await e.close();
  /* 3) Bausteine in dunkel und hell */
  const d = await b.newPage({ viewport: { width: 900, height: 420 }, deviceScaleFactor: 2 }); d.on('pageerror', x => errs.push(x.message)); try { await require('./localfonts.js')(d); } catch (x) {}
  await d.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await d.waitForTimeout(800);
  for (const theme of ['dark', 'light']) {
    await d.evaluate(t => { Store.setSetting('theme', t); Theme.apply(Store.settings);
      const box = document.createElement('div'); box.id = 'ldemo'; box.style.cssText = 'position:fixed;inset:0;z-index:999;background:var(--bg);display:grid;grid-template-columns:repeat(3,1fr);gap:28px;padding:36px;align-content:start';
      box.innerHTML = `<div class="card" style="display:grid;place-items:center;gap:14px;padding:26px">${UI.loader('lg')}<span class="small muted">groß · App-Start</span></div>
        <div class="card" style="display:grid;place-items:center;gap:14px;padding:26px">${UI.loader()}<span class="small muted">mittel</span><span class="ld-row">${UI.loader('sm')}<span class="small muted">Wird ausgewertet …</span></span></div>
        <div class="card" style="display:grid;place-items:center;gap:14px;padding:26px"><button class="btn primary" disabled>${UI.spin()} Wird erstellt …</button><button class="btn" disabled>${UI.spin()} Wird erstellt …</button></div>
        <div class="skel" style="height:120px;grid-column:span 2"></div><div class="msg typing" style="align-self:start;justify-self:start;background:var(--surface-2);border-radius:14px"><i></i><i></i><i></i></div>`;
      document.body.appendChild(box); }, theme);
    await d.waitForTimeout(500); await d.screenshot({ path: `langshots/load-parts-${theme}.png` });
    if (theme === 'dark') {
      /* Bewegung: Strich wandert (dashoffset ändert sich), Ring dreht, Glanz wandert */
      const f = []; for (let i = 0; i < 3; i++) { f.push(await d.evaluate(() => ({ off: getComputedStyle(document.querySelector('#ldemo .ld.lg .ld-line')).strokeDashoffset, rot: getComputedStyle(document.querySelector('#ldemo .spin')).transform, sh: getComputedStyle(document.querySelector('#ldemo .skel'), '::after').transform }))); await d.waitForTimeout(230); }
      ok(new Set(f.map(x => x.off)).size === 3 && new Set(f.map(x => x.rot)).size === 3 && new Set(f.map(x => x.sh)).size >= 2, 'Bewegung: Linie, Ring und Glanz laufen · ' + JSON.stringify(f.map(x => x.off)));
      for (let i = 0; i < 4; i++) { await d.screenshot({ path: `langshots/load-frame-${i}.png`, clip: { x: 36, y: 36, width: 260, height: 170 } }); await d.waitForTimeout(260); }
    }
    await d.evaluate(() => document.getElementById('ldemo').remove());
  }
  await d.evaluate(() => Store.setSetting('theme', 'dark'));
  /* 4) Weniger Bewegung: ruhig */
  const r = await b.newPage({ viewport: { width: 600, height: 300 }, reducedMotion: 'reduce' });
  await r.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await r.waitForTimeout(600);
  const rm = await r.evaluate(() => { const box = document.createElement('div'); box.innerHTML = UI.loader() + '<div class="skel" style="height:40px"></div>'; document.body.appendChild(box); return { line: getComputedStyle(box.querySelector('.ld-line')).animationName, sheen: getComputedStyle(box.querySelector('.skel'), '::after').display }; });
  ok(rm.line === 'none' && rm.sheen === 'none', 'Weniger Bewegung: Linie steht, kein Glanz · ' + JSON.stringify(rm));
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
