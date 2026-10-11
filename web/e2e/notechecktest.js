/* Fortschritt → Dein Tag: „Tagesnotiz geschrieben“ per Klick abhaken (kein Sprung ins Notebook), Notiz von heute hakt automatisch ab; Diagramm-Kurven bleiben im Bild */
const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/sample-dev.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  try {
    await p.goto(base + '#/progress', { waitUntil: 'load' }); await p.waitForTimeout(900);
    /* ohne Notiz von heute starten */
    await p.evaluate(() => { const k = Core.dayKey(new Date()); Store.data.notes.filter(n => n.dateKey === k).forEach(n => { n.dateKey = null; }); const d = Store.day(k); if (d) { delete d.notes; delete d.noteDone; } Store.saveNow(); App.rerender(); }); await p.waitForTimeout(400);
    const item = () => p.evaluateHandle(() => [...document.querySelectorAll('.checklist .it')].find(x => x.textContent.trim() === 'Tagesnotiz geschrieben'));
    let it = await item();
    ok('„Tagesnotiz geschrieben“ ist ein Knopf zum Abhaken, kein Link', await it.evaluate(x => x.tagName === 'DIV' && x.dataset.action === 'day-note-check' && x.classList.contains('toggle') && !x.classList.contains('done') && !x.hasAttribute('href')));
    await it.click(); await p.waitForTimeout(400); it = await item();
    ok('Klick hakt ab und bleibt auf Fortschritt', (await p.evaluate(() => location.hash)) === '#/progress' && await it.evaluate(x => x.classList.contains('done')) && await p.evaluate(() => Store.day(Core.dayKey(new Date())).noteDone === true));
    await p.reload(); await p.waitForTimeout(900); it = await item();
    ok('Häkchen bleibt nach Neuladen', await it.evaluate(x => x.classList.contains('done')));
    await it.click(); await p.waitForTimeout(400); it = await item();
    ok('Zweiter Klick löst das Häkchen wieder', await it.evaluate(x => !x.classList.contains('done')) && await p.evaluate(() => Store.day(Core.dayKey(new Date())).noteDone === false));
    await p.evaluate(() => { const k = Core.dayKey(new Date()); Store.setDay(k, { notes: 'Heute ruhig gehandelt.' }); App.rerender(); }); await p.waitForTimeout(400); it = await item();
    ok('Notiz von heute hakt automatisch ab (nicht mehr klickbar)', await it.evaluate(x => x.classList.contains('done') && !x.dataset.action));
    /* Diagramme: keine Kurve ragt aus dem Bild */
    await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(900);
    const out = [];
    for (const pre of ['week', 'month', 'quarter', 'year', 'all']) {
      await p.evaluate(pre => { Store.settings.range = { preset: pre, from: null, to: null }; App.rerender(); }, pre); await p.waitForTimeout(400);
      out.push(await p.evaluate(() => [...document.querySelectorAll('.chart svg')].reduce((a, svg) => { const h = svg.getBoundingClientRect().height; svg.querySelectorAll('path').forEach(pa => { if (!pa.getAttribute('d') || pa.closest('clipPath')) return; const bb = pa.getBBox(); if (bb.y < -0.5 || bb.y + bb.height > h + 0.5) a++; }); return a; }, 0)));
    }
    ok('Statistiken: keine Kurve oben oder unten abgeschnitten (alle Zeiträume)', out.every(x => x === 0), out.join(','));
    await p.evaluate(() => { Store.settings.range = { preset: 'month', from: null, to: null }; Store.saveNow(); });
    ok('keine Seitenfehler', !errors.length, errors.join(' | '));
  } catch (e) { console.log('CRASH ' + e.message); }
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors'); console.log(`${pass} PASS, ${fail} FAIL`);
  await b.close();
})();
