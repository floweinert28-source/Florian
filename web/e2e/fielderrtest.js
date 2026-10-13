/* Zustände und Bedienung: Feldfehler am Feld statt Toast, eingebaute Prüfung ohne Browser-Blase, Rückfrage vor endgültigem Löschen, Tastatur */
const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); await require('./localfonts.js')(ctx); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '#/trades', { waitUntil: 'load' }); await p.waitForTimeout(800);
  const n0 = await p.evaluate(() => Store.trades().length);
  await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelector('#f-entry').value = ''; });
  await p.click('#trade-form button[type=submit]'); await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ inv: [...document.querySelectorAll('#trade-form .field.invalid')].map(f => f.querySelector('.field-err').textContent), aria: document.querySelector('#f-entry').getAttribute('aria-invalid'), desc: document.querySelector('#f-entry').getAttribute('aria-describedby'), focus: document.activeElement && document.activeElement.id, toast: [...document.querySelectorAll('.toast')].map(t => t.textContent).join('|'), border: getComputedStyle(document.querySelector('#f-entry')).borderTopColor, loss: getComputedStyle(document.documentElement).getPropertyValue('--loss').trim() }));
  ok('Leeres Trade-Formular: Fehler an Symbol, Richtung und Einstieg zugleich', ['Symbol wählen', 'Long oder Short wählen', 'Einstieg eintragen'].every(t => st.inv.includes(t)), JSON.stringify(st.inv));
  ok('Kein Toast, nichts gespeichert', !st.toast && (await p.evaluate(() => Store.trades().length)) === n0, st.toast);
  ok('aria-invalid und aria-describedby am Feld, Fokus aufs erste Feld', st.aria === 'true' && st.desc === 'f-entry-err' && st.focus === 'f-symbol-btn', JSON.stringify(st));
  await p.fill('#f-entry', '100'); await p.waitForTimeout(150);
  const after = await p.evaluate(() => ({ entry: document.querySelector('#f-entry').closest('.field').classList.contains('invalid'), n: document.querySelectorAll('#trade-form .field.invalid').length }));
  ok('Eingabe im Feld nimmt nur dessen Fehler weg', !after.entry && after.n >= 2, JSON.stringify(after));
  await p.evaluate(() => UI.closeModal(true)); await p.waitForTimeout(300);
  /* eingebaute Prüfung in anderen Formularen */
  await p.evaluate(() => { window.__pr = UI.promptModal('Testname', { value: '' }); }); await p.waitForTimeout(300);
  await p.click('.modal button[type=submit]'); await p.waitForTimeout(200);
  const nat = await p.evaluate(() => ({ err: (document.querySelector('.modal .field-err') || {}).textContent, open: !!document.querySelector('.modal input[name=v]') }));
  ok('Pflichtfeld ohne Browser-Blase: „Pflichtfeld“ am Feld, Fenster bleibt offen', nat.err === 'Pflichtfeld' && nat.open, JSON.stringify(nat));
  await p.evaluate(() => UI.closeModal(true)); await p.waitForTimeout(300);
  /* Rückfrage vor endgültigem Löschen */
  await p.evaluate(() => { location.hash = '#/settings/regeln'; }); await p.waitForTimeout(700);
  const r0 = await p.evaluate(() => Store.rules ? Store.rules().length : (Store.data.rules || []).length);
  await p.click('[data-action=delete-rule]'); await p.waitForTimeout(300);
  const dlg = await p.evaluate(() => ({ h: (document.querySelector('.modal h2') || {}).textContent, btn: (document.querySelector('.modal [data-confirm]') || {}).className }));
  ok('Regel löschen fragt nach („Regel löschen?“, roter Knopf)', dlg.h === 'Regel löschen?' && /danger/.test(dlg.btn), JSON.stringify(dlg));
  await p.click('.modal [data-close]:not(.icon)'); await p.waitForTimeout(300);
  const r1 = await p.evaluate(() => Store.rules ? Store.rules().length : (Store.data.rules || []).length);
  ok('Abbrechen: Regel bleibt', r1 === r0 && r0 > 0, r0 + ' → ' + r1);
  await p.click('[data-action=delete-rule]'); await p.waitForTimeout(300); await p.click('.modal [data-confirm]'); await p.waitForTimeout(400);
  const r2 = await p.evaluate(() => Store.rules ? Store.rules().length : (Store.data.rules || []).length);
  ok('Bestätigen: Regel gelöscht', r2 === r0 - 1, r0 + ' → ' + r2);
  /* Tastatur: Sprunglink, Fokus-Ring in Textfarbe, Abhakzeilen per Enter */
  await p.goto('about:blank'); await p.goto(base + '#/day', { waitUntil: 'load' }); await p.waitForTimeout(800); /* frisch geladen, Fokus noch nirgends */
  await p.keyboard.press('Tab'); await p.waitForTimeout(150);
  const sk = await p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { cls: a.className, top: r.top, ring: getComputedStyle(a).outlineColor, text: getComputedStyle(document.documentElement).color }; });
  ok('Erstes Tab: Sprunglink „Zum Inhalt springen“ sichtbar', sk.cls === 'skip-link' && sk.top >= 0, JSON.stringify(sk));
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok('Enter auf dem Sprunglink: Fokus im Inhalt', await p.evaluate(() => document.activeElement && document.activeElement.id === 'content'));
  const ring = await p.evaluate(() => { const b = document.querySelector('#content button, #content a[href]'); b.focus(); const cs = getComputedStyle(b); const probe = document.createElement('span'); probe.style.color = 'var(--focus)'; document.body.appendChild(probe); const want = getComputedStyle(probe).color; probe.remove(); return { style: cs.outlineStyle, color: cs.outlineColor, want, accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() }; });
  ok('Fokus-Ring: 2px in Textfarbe (--focus), nicht Grün', ring.style === 'solid' && ring.color === ring.want, JSON.stringify(ring));
  const tg = await p.$('.it.toggle[role=checkbox]');
  if (tg) { const b0 = await tg.getAttribute('aria-checked'); await tg.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(400); const b1 = await p.evaluate(() => (document.querySelector('.it.toggle[role=checkbox]') || {}).getAttribute && document.querySelector('.it.toggle[role=checkbox]').getAttribute('aria-checked'));
    ok('Regel-Abhakzeile: role=checkbox, Enter schaltet um', b0 !== b1, b0 + ' → ' + b1); } else ok('Regel-Abhakzeile: role=checkbox vorhanden', false, 'keine .it.toggle auf #/day');
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e); process.exit(1); });
