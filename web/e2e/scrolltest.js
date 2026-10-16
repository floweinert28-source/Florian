/* Nichts springt nach oben: Notizen auswählen/öffnen, neue Notiz, Widget hinzufügen, Sprache wechseln, Notebook-Kopfreihe */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto('file:///home/user/Florian/web/app.html#/notebook', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* Kopfreihe: kein Zeitraum, kein Konto, Suche links */
  ok(await p.evaluate(() => !document.querySelector('#content [data-pop=range]') && !document.querySelector('#content [data-pop=account]') && !!document.querySelector('.page-head .dh-context #nb-q')), 'Notebook: kein Zeitraum, kein Konto, Suche in der Kopfreihe');
  /* genug Notizen, damit die Liste scrollt */
  await p.evaluate(() => { for (let i = 0; i < 25; i++) Store.addNote({ folderId: 'daily', title: 'Testnotiz ' + i }); App.rerender(); }); await p.waitForTimeout(300);
  const L = '.nb > .col.mid .col-body';
  const top = () => p.$eval(L, e => e.scrollTop);
  await p.$eval(L, e => { e.scrollTop = 400; }); await p.waitForTimeout(100);
  const t0 = await top(); ok(t0 > 300, 'Liste gescrollt: ' + t0);
  const R = '.nb > .col.right'; await p.$eval(R, e => { e.scrollTop = 100; }); const r0 = await p.$eval(R, e => e.scrollTop);
  await p.evaluate(() => document.querySelector('[data-action="nb-select-mode"]').click()); await p.waitForTimeout(300);
  ok(Math.abs(await top() - t0) < 5, 'Auswahlmodus an: Liste bleibt stehen (' + await top() + ')');
  const pick = () => p.evaluate(l => { const box = document.querySelector(l); const br = box.getBoundingClientRect(); const it = [...box.querySelectorAll('.note-item:not(.selected)[data-action="nb-select"]')].find(x => { const r = x.getBoundingClientRect(); return r.top > br.top + 20 && r.bottom < br.bottom - 20; }); if (!it) return null; const r0 = Math.round(it.getBoundingClientRect().top); it.click(); return { id: it.dataset.id, r0 }; }, L);
  const s1 = await pick(); await p.waitForTimeout(300);
  ok(s1 && Math.abs(await top() - t0) < 5, 'Notiz auswählen: Liste bleibt stehen (' + await top() + ')');
  const s2 = await pick(); await p.waitForTimeout(300);
  ok(r0 > 50 && Math.abs(await p.$eval(R, e => e.scrollTop) - r0) < 5, 'Notiz-Spalte rechts bleibt beim Auswählen stehen (' + r0 + ' → ' + await p.$eval(R, e => e.scrollTop) + ')');
  ok(s2 && Math.abs(await top() - t0) < 5 && await p.evaluate(() => document.querySelectorAll('.note-item.selected').length) === 2, 'Zweite Notiz auswählen: Liste bleibt, 2 gewählt');
  await p.evaluate(() => document.querySelector('[data-action="nb-select-all"]') && 0);
  await p.evaluate(() => { const f = [...document.querySelectorAll('button')].find(x => x.dataset.action === 'nb-select-mode'); if (f) f.click(); }); await p.waitForTimeout(300);
  /* Notiz öffnen: Liste bleibt, Notiz aktiv */
  const opened = await p.evaluate(l => { const box = document.querySelector(l); const br = box.getBoundingClientRect(); const it = [...box.querySelectorAll('.note-item:not(.active)[data-action="nb-open"]')].find(x => { const r = x.getBoundingClientRect(); return r.top > br.top + 20 && r.bottom < br.bottom - 20; }); if (!it) return null; it.click(); return it.dataset.id; }, L); await p.waitForTimeout(400);
  ok(opened && Math.abs(await top() - t0) < 5 && await p.evaluate(id => !!document.querySelector(`.note-item.active[data-id="${id}"]`), opened), 'Notiz öffnen: Liste bleibt stehen, Notiz aktiv (' + await top() + ')');
  /* neue Notiz: oben in der Liste und sichtbar */
  await p.evaluate(() => document.querySelector('[data-action="nb-new"]').click()); await p.waitForTimeout(500);
  ok(await p.evaluate(l => { const box = document.querySelector(l); const a = box.querySelector('.note-item.active'); if (!a) return false; const r = a.getBoundingClientRect(), br = box.getBoundingClientRect(); return r.top >= br.top - 1 && r.bottom <= br.bottom + 1; }, L), 'Neue Notiz ist in der Liste sichtbar');
  /* Widget hinzufügen: Einträge bleiben an ihrem Platz, auch wenn die obere Reihe voll wird */
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('.dash-head [data-pop=tpl]').click()); await p.waitForTimeout(250); await p.evaluate(() => { document.querySelector('#pop-tpl .tpl-row.on [data-action="dash-tpl-menu"]').click(); document.querySelector('#pop-tpl .tpl-menu [data-action="dash-tpl-edit"]').click(); }); await p.waitForTimeout(500);
  for (let i = 0; i < 2; i++) { await p.evaluate(() => { const r = document.querySelector('.dash-top [data-action="dash-remove"]'); if (r) r.click(); }); await p.waitForTimeout(250); }
  for (const area of ['unten', 'oben']) {
    const o = await p.$(`[data-action="dash-add-open"][data-area="${area}"]`); await o.scrollIntoViewIfNeeded(); await o.click(); await p.waitForTimeout(600);
    await p.evaluate(() => { const l = document.getElementById('dash-add-list'); l.scrollTop = Math.round((l.scrollHeight - l.clientHeight) / 3); }); await p.waitForTimeout(150);
    for (let k = 0; k < 2; k++) {
      const pos = () => p.evaluate(() => { const o = { y: scrollY }; document.querySelectorAll('#dash-add-list .sp-item').forEach(it => { o[it.querySelector('[data-typ]').dataset.typ] = Math.round(it.getBoundingClientRect().top); }); return o; });
      const typ = await p.evaluate(() => { const l = document.getElementById('dash-add-list'); const lr = l.getBoundingClientRect(); const bt = [...l.querySelectorAll('[data-action="dash-add"]:not([disabled])')].find(x => { const r = x.getBoundingClientRect(); return r.top > lr.top + 10 && r.bottom < lr.bottom - 10; }); return bt ? bt.dataset.typ : null; });
      if (!typ) { ok(false, `${area}: kein freier Knopf`); break; }
      const a0 = await pos(); const w0 = await p.$eval(`#dash-add-list [data-typ="${typ}"]`, e => e.getBoundingClientRect().width); await p.click(`#dash-add-list [data-typ="${typ}"]`); await p.waitForTimeout(400); const a1 = await pos();
      const moved = Object.keys(a0).filter(k2 => a1[k2] !== undefined && a1[k2] !== a0[k2]);
      const w1 = await p.$eval(`#dash-add-list [data-typ="${typ}"]`, e => e.getBoundingClientRect().width);
      ok(!moved.length && Math.abs(w1 - w0) < 1, `${area}: „Hinzufügen“ #${k + 1} – nichts verrutscht, Knopf gleich breit${moved.length ? ' · bewegt: ' + moved.slice(0, 3).join(', ') : ''}`);
    }
    await p.evaluate(() => { const c = document.querySelector('.side-panel [data-action="dash-add-close"]'); if (c) c.click(); }); await p.waitForTimeout(400);
  }
  /* Sprache wechseln: Einstellungen bleiben an der Stelle */
  await p.goto('file:///home/user/Florian/web/app.html#/settings/sprache', { waitUntil: 'load' }); await p.setViewportSize({ width: 1440, height: 360 }); await p.waitForSelector('[data-action="lang-set"]', { timeout: 15000 }); await p.waitForTimeout(900);
  const y0 = await p.evaluate(() => { const b2 = document.querySelector('[data-action="lang-set"][data-value="en"]') || document.querySelector('[data-action="lang-set"]'); b2.scrollIntoView({ block: 'center' }); return scrollY; });
  await p.evaluate(() => (document.querySelector('[data-action="lang-set"][data-value="en"]') || document.querySelector('[data-action="lang-set"]')).click()); await p.waitForTimeout(1200);
  const y1 = await p.evaluate(() => scrollY);
  ok(y0 > 30 && Math.abs(y1 - y0) < 40, `Sprache wechseln: Seite bleibt (${y0} → ${y1})`);
  await p.evaluate(() => (document.querySelector('[data-action="lang-set"][data-value="de"]')).click()); await p.waitForTimeout(800);
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
