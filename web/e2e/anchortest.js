/* Angeklicktes Element bleibt an seinem Platz: Schatten-Ich-Schalter (an/aus, gescrollt), Setup-Chips, künstlich wachsender/schrumpfender Inhalt darüber */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto('file:///home/user/Florian/web/app.html#/shadow', { waitUntil: 'load' }); await p.waitForTimeout(900);
  const click = async sel => { const el = await p.$(sel); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(100); const b1 = await el.boundingBox(); await p.mouse.click(b1.x + b1.width / 2, b1.y + b1.height / 2); await p.waitForTimeout(600); const el2 = await p.$(sel); const b2 = el2 ? await el2.boundingBox() : null; return { y1: Math.round(b1.y), y2: b2 ? Math.round(b2.y) : null, sy: await p.evaluate(() => scrollY) }; };
  /* 1) alle Regeln an, dann von unten nach oben aus- und wieder einschalten (gescrollt) */
  await p.evaluate(() => { const r = JSON.parse(JSON.stringify(Store.data.shadowRules)); for (const k of Object.keys(r)) if (r[k] && typeof r[k] === 'object' && 'on' in r[k]) r[k].on = true; Store.setShadowRules(r); App.rerender(false); }); await p.waitForTimeout(500);
  const keys = await p.$$eval('[data-action=shadow-rule-toggle]', els => els.map(e => e.dataset.rule));
  const moves = [];
  for (const k of keys) { const r = await click(`[data-action=shadow-rule-toggle][data-rule="${k}"]`); moves.push(`${k}:${r.y1}→${r.y2}`); }
  for (const k of keys) { const r = await click(`[data-action=shadow-rule-toggle][data-rule="${k}"]`); moves.push(`${k}:${r.y1}→${r.y2}`); }
  ok(moves.every(m => { const [a, c] = m.split(':')[1].split('→').map(Number); return Math.abs(a - c) <= 1; }), 'Schalter aus und wieder an: Schalter bleibt unter der Maus · ' + moves.join(' '));
  ok(!!(await p.$('.shadow-rules ~ .shadow-notes .banner.info')) === false && !(await p.$('#content > .banner.info')), 'Mit aktiven Regeln kein Hinweis; nie ein Hinweis oberhalb der Kacheln');
  /* 2) Setup-Chips */
  const chip = await p.$('[data-action=shadow-setup-toggle]'); if (chip) { const v = await chip.getAttribute('data-value'); const r = await click(`[data-action=shadow-setup-toggle][data-value="${v}"]`); ok(Math.abs(r.y1 - r.y2) <= 1, `Setup-Chip bleibt an seinem Platz (${r.y1}→${r.y2})`); }
  /* 3) Hinweis „Noch keine Regel aktiv“ steht unter den Schaltern */
  await p.evaluate(() => { const r = JSON.parse(JSON.stringify(Store.data.shadowRules)); for (const k of Object.keys(r)) if (r[k] && typeof r[k] === 'object' && 'on' in r[k]) r[k].on = false; Store.setShadowRules(r); App.rerender(false); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const bn = [...document.querySelectorAll('.banner.info')].find(x => /Noch keine Regel aktiv/.test(x.textContent)); const rows = document.querySelector('.shadow-rules'); return !!bn && !!rows && (rows.compareDocumentPosition(bn) & Node.DOCUMENT_POSITION_FOLLOWING) && !!bn.querySelector('[data-action=shadow-preset]'); }), 'Ohne Regel: Hinweis mit „Vorschlag übernehmen“ unter den Schaltern');
  /* 4) allgemein: Inhalt über dem Element wächst/schrumpft beim Neuaufbau → Scrollstand gleicht aus */
  await p.evaluate(() => { const orig = App.screens.shadow.render; window.__grow = 0; App.screens.shadow.render = function (ctx) { return `<div id="grow" style="height:${window.__grow}px"></div>` + orig.call(this, ctx); }; const act = App.actions['shadow-rule-toggle']; App.actions['shadow-rule-toggle'] = function (el) { window.__grow = window.__grow ? 0 : 140; return act.call(this, el); }; App.rerender(false); });
  await p.waitForTimeout(300); await p.evaluate(() => scrollTo(0, 500)); await p.waitForTimeout(200);
  const g = []; for (let i = 0; i < 4; i++) { const r = await click('[data-action=shadow-rule-toggle][data-rule="maxTrades"]'); g.push(`${r.y1}→${r.y2} (scroll ${r.sy})`); }
  ok(g.every(s => { const [a, c] = s.split(' ')[0].split('→').map(Number); return Math.abs(a - c) <= 1; }), 'Inhalt darüber wächst/schrumpft um 140 px: Schalter bleibt stehen · ' + g.join(' | '));
  /* 5) Anker greift nicht nach Navigation */
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(600); ok(await p.evaluate(() => scrollY === 0), 'Seitenwechsel: oben beginnen');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
