/* Tooltips bleiben nicht hängen: Notebook-Spalte ein-/ausklappen mit echter Maus; Diagramm-Tooltips funktionieren weiter */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/notebook', { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.evaluate(() => { const nb = App.state.notebook || {}; App.rerender(); });
  const tip = () => p.evaluate(() => { const t = document.getElementById('tip'); return t && t.classList.contains('on') ? t.textContent : ''; });
  const center = async sel => { const bb = await (await p.$(sel)).boundingBox(); return [bb.x + bb.width / 2, bb.y + bb.height / 2]; };
  for (let round = 1; round <= 3; round++) {
    /* einklappen */
    let [x, y] = await center('.nb .col.left .collapse-left'); await p.mouse.move(x - 6, y); await p.mouse.move(x, y, { steps: 3 }); await p.waitForTimeout(150);
    const t1 = await tip(); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(250);
    const after1 = await tip(); await p.mouse.move(x + 1, y); await p.waitForTimeout(150); const moved1 = await tip();
    const under1 = await p.evaluate(([cx, cy]) => { const el = document.elementFromPoint(cx, cy); const t = el && el.closest('[data-tip]'); return t ? t.dataset.tip : ''; }, [x + 1, y]);
    ok(!!t1 && !after1 && moved1 === under1, `Runde ${round}: Einklappen – Tooltip „${t1}“ weg nach Klick; danach nur, was wirklich unter der Maus ist („${moved1}“)`);
    /* ausklappen */
    [x, y] = await center('.nb .col.mid [data-action="nb-left-toggle"]'); await p.mouse.move(x - 6, y); await p.mouse.move(x, y, { steps: 3 }); await p.waitForTimeout(150);
    const t2 = await tip(); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(250);
    const after2 = await tip(); await p.mouse.move(x + 1, y); await p.waitForTimeout(150); const moved2 = await tip();
    const under2 = await p.evaluate(([cx, cy]) => { const el = document.elementFromPoint(cx, cy); const t = el && el.closest('[data-tip]'); return t ? t.dataset.tip : ''; }, [x + 1, y]);
    ok(t2 === 'Ordner anzeigen' && !after2 && moved2 === under2, `Runde ${round}: Ausklappen – „Ordner anzeigen“ weg nach Klick; danach nur Passendes („${moved2}“)`);
  }
  /* weg vom Knopf: kein Tooltip */
  await p.mouse.move(900, 600, { steps: 4 }); await p.waitForTimeout(150);
  ok(!(await tip()), 'Maus woanders: kein Tooltip');
  /* Diagramm-Tooltip auf dem Dashboard */
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(1000);
  const hit = await p.$('.chart svg .hit, .chart .hit, .chart svg rect[data-i], .chart svg');
  let chartTip = '';
  if (hit) { const bb = await hit.boundingBox(); for (let i = 1; i < 8 && !chartTip; i++) { await p.mouse.move(bb.x + bb.width * i / 8, bb.y + bb.height / 2, { steps: 2 }); await p.waitForTimeout(120); chartTip = await tip(); } }
  ok(!!chartTip, 'Diagramm-Tooltip erscheint weiter beim Überfahren · ' + chartTip.slice(0, 40));
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
