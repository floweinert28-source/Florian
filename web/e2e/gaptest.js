/* Bearbeitungsmodus: Entfernen hinterlässt eine Lücke, Hinzufügen füllt sie, Speichern schließt Lücken */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1000 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await require('./localfonts.js')(p);
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  const saved = () => p.evaluate(() => { const l = Store.activeDashboard().layout; return { oben: l.oben.map(x => x.typ), unten: l.unten.map(x => x.typ + ':' + x.groesse) }; });
  const before = await saved();
  await p.click('.dash-head [data-pop=tpl]'); await p.waitForTimeout(200); await p.click('#pop-tpl [data-action="dash-tpl-edit"]'); await p.waitForTimeout(500);
  const rect = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; }, sel);
  /* unten: zweites Widget entfernen */
  const second = await rect('.dash-main > .w[data-idx="1"]'); const thirdTyp = await p.evaluate(() => document.querySelector('.dash-main > .w[data-idx="2"]').dataset.typ); const thirdPos = await rect('.dash-main > .w[data-idx="2"]');
  await p.evaluate(() => document.querySelector('.dash-main > .w[data-idx="1"] [data-action="dash-remove"]').click()); await p.waitForTimeout(400);
  const gap = await rect('.dash-main > .add-slot.gap[data-slot="1"]');
  ok(gap && Math.abs(gap.x - second.x) < 2 && Math.abs(gap.y - second.y) < 2 && Math.abs(gap.w - second.w) < 2 && Math.abs(gap.h - second.h) < 2, 'Unten: Lücke an derselben Stelle und gleich groß wie das entfernte Widget ' + JSON.stringify([second, gap]));
  const thirdAfter = await p.evaluate(t => { const e = document.querySelector(`.dash-main > .w[data-typ="${t}"]`); const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top) }; }, thirdTyp);
  ok(thirdAfter.x === thirdPos.x && thirdAfter.y === thirdPos.y, 'Unten: nichts rutscht nach');
  /* oben: eine Kachel entfernen */
  const t1 = await rect('.dash-top > .w[data-idx="1"]'); await p.evaluate(() => document.querySelector('.dash-top > .w[data-idx="1"] [data-action="dash-remove"]').click()); await p.waitForTimeout(400);
  const tg = await rect('.dash-top > .add-slot.gap[data-slot="1"]');
  ok(tg && Math.abs(tg.x - t1.x) < 2 && Math.abs(tg.w - t1.w) < 2, 'Oben: Kachel-Lücke an derselben Stelle ' + JSON.stringify([t1, tg]));
  ok(await p.evaluate(() => document.querySelectorAll('.dash-top > .add-slot:not(.gap)').length === 0), 'Oben: kein zusätzlicher Platz, solange 5 Plätze belegt sind (inkl. Lücke)');
  /* Lücke unten anklicken und Widget einsetzen: landet in der Lücke */
  await p.click('.dash-main > .add-slot.gap[data-slot="1"]'); await p.waitForTimeout(500);
  const addTyp = await p.evaluate(() => { const b = document.querySelector('#dash-add-list [data-action="dash-add"]:not([disabled])'); const t = b.dataset.typ; b.click(); return t; }); await p.waitForTimeout(400);
  ok(await p.evaluate(t => { const e = document.querySelector('.dash-main > .w[data-idx="1"]'); return !!e && e.dataset.typ === t && !document.querySelector('.dash-main > .add-slot.gap'); }, addTyp), 'Widget aus der Lücke heraus eingesetzt: sitzt genau dort (' + addTyp + ')');
  await p.click('.side-panel [data-action="dash-add-close"]'); await p.waitForTimeout(300);
  /* noch eine Lücke unten lassen und speichern */
  const lastIdx = await p.evaluate(() => document.querySelectorAll('.dash-main > .w').length - 1);
  await p.evaluate(() => document.querySelector('.dash-main > .w[data-idx="0"] [data-action="dash-remove"]').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelectorAll('.dash-main > .add-slot.gap').length === 1 && document.querySelectorAll('.dash-top > .add-slot.gap').length === 1), 'Vor dem Speichern: je eine Lücke oben und unten');
  await p.screenshot({ path: 'langshots/gaps-edit.png' });
  await p.click('[data-action="dash-save"]'); await p.waitForTimeout(600);
  const after = await saved();
  ok(!JSON.stringify(after).includes('_luecke') && after.oben.length === before.oben.length - 1 && after.unten.length === before.unten.length - 1, 'Gespeichert ohne Lücken: oben ' + after.oben.length + ', unten ' + after.unten.length);
  ok(await p.evaluate(() => !document.querySelector('.add-slot') && document.querySelector('.dash-main > .w[data-idx="0"]') && document.querySelector('.dash-top > .w[data-idx="0"]')), 'Nach dem Speichern: Widgets aufgerückt, keine Platzhalter');
  await p.screenshot({ path: 'langshots/gaps-saved.png' });
  /* Abbrechen verwirft Lücken */
  await p.click('.dash-head [data-pop=tpl]'); await p.waitForTimeout(200); await p.click('#pop-tpl [data-action="dash-tpl-edit"]'); await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('.dash-main > .w[data-idx="0"] [data-action="dash-remove"]').click()); await p.waitForTimeout(300); await p.click('[data-action="dash-cancel"]'); await p.waitForTimeout(400);
  ok(JSON.stringify(await saved()) === JSON.stringify(after), 'Abbrechen: Layout unverändert');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
