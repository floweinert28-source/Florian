const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (name, cond, extra = '') => out.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' · ' + extra : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); await require('./localfonts.js')(ctx); /* Schriften lokal: der Proxy blockiert Google Fonts */ const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto(base + '#/trades', { waitUntil: 'load' }); await p.waitForTimeout(300);
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(110); /* Seitenwechsel läuft als View Transition, der Aufbau kommt einen Frame später */
  ok('Kein Skeleton beim Wechsel aufs Dashboard: Kacheln stehen sofort (nichts springt)', (await p.$$eval('.skel', e => e.length)) === 0 && (await p.$$eval('.dash-top > .w', e => e.length)) > 0);
  await p.waitForTimeout(600);
  ok('Auch danach kein Skeleton', await p.$$eval('.skel', e => e.length) === 0);
  const top = await p.$$eval('.dash-top > .w', e => e.length), main = await p.$$eval('.dash-main > .w', e => e.length);
  ok('Standard-Vorlage: 5 oben, 9 unten (Bereichs-Karten ohne das zurückgestellte Blind-Replay)', top === 5 && main === 9, `${top}/${main}`);
  ok('Vorlage-Button zeigt Namen', (await p.textContent('[data-pop=tpl]')).includes('Standard'));
  ok('Info-Symbole vorhanden', await p.$$eval('.dash-top span.info, .dash-main span.info', e => e.length) >= 10);
  /* Monatsanfang: der Standardbereich „Monat“ enthält vor dem ersten Abschluss des Tages keine geschlossenen Trades (Beispieldaten v2 haben keinen Ausstieg in der Zukunft mehr) → letzte 30 Tage wie weiter unten */
  await p.evaluate(() => { Store.setSetting('range', { preset: 'last30', from: null, to: null }); App.rerender(); }); await p.waitForTimeout(300);
  ok('Charts gezeichnet', await p.$$eval('.dash-main .chart svg', e => e.length) >= 2);
  ok('Kachel-Diagramme auf Höhe des Werts, 12px vom Rand abgerückt', await p.evaluate(() => [...document.querySelectorAll('.tile.side')].length >= 2 && [...document.querySelectorAll('.tile.side')].every(t => { const v = t.querySelector('.val').getBoundingClientRect(), g = t.querySelector('.gauge').getBoundingClientRect(), T = t.getBoundingClientRect(); return Math.abs((v.top + v.height / 2) - (g.top + g.height / 2)) < 1.5 && Math.round(T.right - g.right) >= 26; })));
  await p.screenshot({ path: 'dash-1.png', fullPage: true });
  /* Bearbeitungsmodus */
  await p.click('[data-pop=tpl]'); await p.waitForTimeout(150); await p.click('#pop-tpl .tpl-row.on [data-action="dash-tpl-menu"]'); await p.waitForTimeout(120); await p.click('#pop-tpl .tpl-menu [data-action="dash-tpl-edit"]'); await p.waitForTimeout(300);
  ok('Edit-Bar sichtbar', !!(await p.$('.edit-bar')) && (await p.textContent('.edit-bar')).includes('Standard'));
  ok('Handles + X pro Widget', await p.$$eval('.w.editing .handle', e => e.length) === 14 && await p.$$eval('.w.editing .rm', e => e.length) === 14);
  ok('Größenauswahl nur unten', await p.$$eval('.dash-main .seg.mini', e => e.length) === 9 && await p.$$eval('.dash-top .seg.mini', e => e.length) === 0);
  ok('Add-Slot unten, oben nicht (voll)', !!(await p.$('.dash-main .add-slot')) && !(await p.$('.dash-top .add-slot')));
  await p.screenshot({ path: 'dash-2-edit.png', fullPage: true });
  // Widget oben entfernen -> Add-Slot erscheint
  await p.click('.dash-top .w[data-idx="4"] .rm'); await p.waitForTimeout(200);
  ok('Oben entfernt → 4 + Add-Slot', await p.$$eval('.dash-top > .w', e => e.length) === 4 && !!(await p.$('.dash-top .add-slot')));
  // Panel öffnen
  await p.click('.dash-top .add-slot'); await p.waitForTimeout(300);
  ok('Seitenpanel offen mit 14 oberen Widgets (Blind-Replay zurückgestellt)', !!(await p.$('.side-panel')) && await p.$$eval('.side-panel .sp-item', e => e.length) === 14);
  ok('4 als Hinzugefügt markiert', await p.$$eval('.side-panel .btn.added', e => e.length) === 4);
  await p.screenshot({ path: 'dash-3-panel.png' });
  await p.fill('#dash-add-q', 'drawdown'); await p.waitForTimeout(150);
  ok('Suche filtert', await p.$$eval('.side-panel .sp-item', e => e.length) === 2);
  await p.click('.side-panel .sp-item .btn.primary'); await p.waitForTimeout(300);
  ok('Widget hinzugefügt → 5 oben, alle weiteren ausgegraut', await p.$$eval('.dash-top > .w', e => e.length) === 5 && !!(await p.$('.side-panel .banner.warn')) && await p.$$eval('.side-panel .sp-item .btn:not(.added)', b => b.every(x => x.disabled)));
  await p.click('.side-panel [data-action="dash-add-close"]'); await p.waitForTimeout(200);
  // Unten: Größe ändern und verschieben
  await p.click('.dash-main .w[data-idx="0"] .seg.mini button[data-value="gross"]'); await p.waitForTimeout(200);
  ok('Größe groß gesetzt', await p.$eval('.dash-main .w[data-idx="0"]', e => e.classList.contains('sz-gross')));
  await p.$eval('.dash-main .w[data-idx="1"] .mv button[data-dir="1"]', e => e.click()); await p.waitForTimeout(200);
  const order = await p.$$eval('.dash-main > .w', e => e.map(x => x.dataset.typ));
  ok('Pfeil verschiebt Widget', order[2] === 'pnl_vergleich', order.join(','));
  // Alle unteren Widgets hinzufügen
  await p.click('.dash-main .add-slot'); await p.waitForTimeout(250);
  for (let i = 0; i < 30; i++) { const b = await p.$('.side-panel .sp-item .btn.primary'); if (!b) break; await b.click(); await p.waitForTimeout(150); }
  ok('Alle 26 unteren Widgets drin (Blind-Replay zurückgestellt)', await p.$$eval('.dash-main > .w', e => e.length) === 26);
  await p.click('.side-panel [data-action="dash-add-close"]'); await p.waitForTimeout(200);
  // Drag & Drop oben: Widget 0 hinter Widget 2
  await p.dragAndDrop('.dash-top .w[data-idx="0"] .handle', '.dash-top .w[data-idx="2"]', { targetPosition: { x: 200, y: 40 } }); await p.waitForTimeout(300);
  const topOrder = await p.$$eval('.dash-top > .w', e => e.map(x => x.dataset.typ));
  ok('Drag & Drop oben', topOrder[2] === 'netto_pnl', topOrder.join(','));
  await p.screenshot({ path: 'dash-4-full.png', fullPage: true });
  // Speichern
  await p.click('[data-action="dash-save"]'); await p.waitForTimeout(300);
  ok('Gespeichert: kein Edit-Bar, 26 unten', !(await p.$('.edit-bar')) && await p.$$eval('.dash-main > .w', e => e.length) === 26);
  ok('Persistiert', await p.evaluate(() => Store.activeDashboard().layout.unten.length === 27 && Store.activeDashboard().layout.oben.length === 5));
  ok('Keine Fehler in Widgets', await p.$$eval('.dash-main .card', c => c.filter(x => x.textContent.includes('nicht berechnet')).length) === 0);
  ok('Jahreskalender: Zeile pro Jahr mit 14 Kästchen', await p.$$eval('.ycal-row', e => e.length) >= 1 && await p.$$eval('.ycal-row', e => e.every(r => r.querySelectorAll('.yc').length === 14)));
  await p.click('.w[data-typ="jahreskalender"] [data-key="ansicht"][data-value="trefferquote"]'); await p.waitForTimeout(300);
  ok('Jahreskalender: Umschalten auf Trefferquote', (await p.textContent('.ycal-row')).includes('%') && await p.evaluate(() => Store.activeDashboard().layout.unten.find(w => w.typ === 'jahreskalender').einstellungen.ansicht === 'trefferquote'));
  await p.evaluate(() => { const t = Store.activeDashboard(); t.layout.oben[4] = { typ: 'serie' }; Store.save(); App.rerender(false); }); await p.waitForTimeout(300);
  ok('Serie: Tage und Trades nebeneinander', await p.$$eval('.serie .sg', g => g.length === 2 && Math.abs(g[0].getBoundingClientRect().top - g[1].getBoundingClientRect().top) < 2 && g[1].getBoundingClientRect().left > g[0].getBoundingClientRect().right));
  ok('Letzte Trades: Zeilen passen, Mehr anzeigen', await p.$eval('.recent-wrap', w => { const rows = [...w.querySelectorAll('tbody tr')]; const vis = rows.filter(r => !r.classList.contains('hidden')); const b = w.getBoundingClientRect().bottom; return vis.length >= 3 && vis.every(r => r.getBoundingClientRect().bottom <= b + 1); }) && await p.$eval('.recent-card .more-link', a => a.getAttribute('href') === '#/trades'));
  ok('Achse links mit Beträgen', await p.$eval('.w[data-typ="pnl_pro_tag"] .chart svg', svg => [...svg.querySelectorAll('.grid text')].some(t => /€/.test(t.textContent) && t.getAttribute('text-anchor') === 'end')));
  ok('Uhrzeit-Achse schräg', await p.$eval('.w[data-typ="perf_uhrzeit"] .chart svg', svg => [...svg.querySelectorAll('text')].some(t => (t.getAttribute('transform') || '').includes('rotate(-45'))));
  await p.click('.w[data-typ="perf_uhrzeit"] [data-pop="uhrzeit"]'); await p.waitForTimeout(150); await p.click('#pop-uhrzeit [data-value="exit"]'); await p.waitForTimeout(300);
  ok('Uhrzeit: Ausstiegszeit gewählt', await p.evaluate(() => Store.activeDashboard().layout.unten.find(w => w.typ === 'perf_uhrzeit').einstellungen.zeit === 'exit'));
  ok('Regel-Tracker: Raster, Score, Checkliste-Link', await p.$$eval('.tracker i', e => e.length >= 85) && !!(await p.$('.tracker-foot .score-n')) && await p.$eval('.tracker-foot a', a => a.getAttribute('href') === '#/progress') && await p.$eval('.w[data-typ="regel_tracker"] .card-head .more-link', a => a.getAttribute('href') === '#/progress'));
  ok('Erweiterter Kalender hat Wochen-Spalte', await p.$$eval('.cal.ext .w', e => e.length) >= 4);
  await p.screenshot({ path: 'dash-5-saved.png', fullPage: true });
  // Challenge-Einstellungen
  await p.click('.w[data-typ="challenge"] [data-action="dash-w-settings"]'); await p.waitForTimeout(200);
  await p.fill('input[name=ziel]', '3000'); await p.fill('input[name=maxVerlust]', '1500'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(300);
  ok('Challenge konfiguriert', (await p.textContent('.w[data-typ="challenge"]')).includes('Gewinnziel') && await p.evaluate(() => Store.activeDashboard().layout.unten.find(w => w.typ === 'challenge').einstellungen.ziel === 3000));
  // Report-Panel
  await p.click('.w[data-typ="report"] [data-action="dash-rep-toggle"]'); await p.waitForTimeout(300);
  ok('Report-Panel offen mit 2 Zeilen', !!(await p.$('.rep-panel')) && await p.$$eval('.rep-row', e => e.length) === 2);
  await p.click('.rep-panel [data-action="dash-rep-pick"][data-i="new"]'); await p.waitForTimeout(250);
  ok('Kennzahl-Liste mit 5 Gruppen', await p.$$eval('.rep-g', e => e.length) === 5 && await p.$$eval('.rep-it', e => e.length) === 0);
  await p.click('.rep-g[data-g="risiko"]'); await p.waitForTimeout(250);
  ok('Gruppe aufgeklappt', await p.$$eval('.rep-it', e => e.length) === 8);
  await p.fill('#rep-q', 'trefferquote'); await p.waitForTimeout(150);
  ok('Suche filtert Kennzahlen', await p.$$eval('.rep-it', e => e.length === 4 && e.some(x => x.disabled)));
  await p.click('.rep-it[data-key="long_trefferquote"]'); await p.waitForTimeout(350);
  ok('Dritte Kennzahl hinzugefügt, Button gesperrt', await p.$$eval('.rep-row', e => e.length) === 3 && await p.$eval('.rep-panel [data-i="new"]', b => b.disabled) && await p.evaluate(() => Store.activeDashboard().layout.unten.find(w => w.typ === 'report').einstellungen.kennzahlen.length === 3));
  await p.evaluate(() => { Store.setSetting('range', { preset: 'last30', from: null, to: null }); App.rerender(); }); await p.waitForTimeout(300); /* Monatsanfang: sonst zu wenige Tage für Balken */
  await p.selectOption('.rep-row:nth-child(2) .rep-type', 'balken'); await p.waitForTimeout(350);
  ok('Balken-Darstellung', await p.$$eval('.w[data-typ="report"] .chart rect[rx="2"]', e => e.length > 5));
  await p.selectOption('.w[data-typ="report"] [data-key="aufloesung"]', 'woche'); await p.waitForTimeout(350);
  ok('Auflösung Woche', await p.evaluate(() => Store.activeDashboard().layout.unten.find(w => w.typ === 'report').einstellungen.aufloesung === 'woche') && await p.$$eval('.w[data-typ="report"] .chart circle', e => e.length < 30));
  ok('Report: zwei Achsen', await p.$eval('.w[data-typ="report"] .chart svg', svg => { const t = [...svg.querySelectorAll('.grid text')]; return t.some(x => /%/.test(x.textContent)) && t.some(x => /€/.test(x.textContent)); }));
  await p.click('.rep-panel [data-action="dash-rep-remove"][data-i="2"]'); await p.waitForTimeout(300);
  await p.click('.rep-panel [data-action="dash-rep-reset"]'); await p.waitForTimeout(300);
  ok('Zurückgesetzt', await p.evaluate(() => { const k = Store.activeDashboard().layout.unten.find(w => w.typ === 'report').einstellungen.kennzahlen; return k.length === 2 && k[0].key === 'trefferquote'; }));
  await p.click('.w[data-typ="report"] [data-action="dash-rep-toggle"]'); await p.waitForTimeout(200);
  ok('Panel geschlossen', !(await p.$('.rep-panel')));
  // Abbrechen verwirft
  await p.click('[data-pop=tpl]'); await p.waitForTimeout(150); await p.click('#pop-tpl .tpl-row.on [data-action="dash-tpl-menu"]'); await p.waitForTimeout(120); await p.click('#pop-tpl .tpl-menu [data-action="dash-tpl-edit"]'); await p.waitForTimeout(250); await p.click('.dash-main .w[data-idx="0"] .rm'); await p.waitForTimeout(150); await p.click('[data-action="dash-cancel"]'); await p.waitForTimeout(250);
  ok('Abbrechen verwirft Änderung', await p.$$eval('.dash-main > .w', e => e.length) === 26);
  /* Vorlagen */
  await p.click('[data-pop=tpl]'); await p.waitForTimeout(150);
  ok('Dropdown mit Neu + Standard ★ ✓', !!(await p.$('#pop-tpl.open')) && (await p.textContent('#pop-tpl')).includes('Neue Vorlage') && !!(await p.$('.tpl-row .star')) && !!(await p.$('.tpl-row.on .chk svg')));
  await p.screenshot({ path: 'dash-6-tplpop.png', clip: { x: 700, y: 60, width: 740, height: 260 } });
  await p.click('[data-action="dash-tpl-new"]'); await p.waitForTimeout(200);
  await p.fill('.modal input[name=name]', 'Scalping'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(350);
  ok('Neue Vorlage leer + Bearbeitungsmodus', !!(await p.$('.edit-bar')) && (await p.textContent('.edit-bar')).includes('Scalping') && await p.$$eval('.dash-main > .w', e => e.length) === 0 && !!(await p.$('.dash-top .add-slot')));
  await p.click('.dash-top .add-slot'); await p.waitForTimeout(200); await p.click('.side-panel .sp-item .btn.primary'); await p.waitForTimeout(200); await p.click('.side-panel [data-action="dash-add-close"]'); await p.waitForTimeout(150);
  await p.click('[data-action="dash-save"]'); await p.waitForTimeout(300);
  ok('Scalping gespeichert mit 1 oben', await p.evaluate(() => { const t = Store.dashboards().find(d => d.name === 'Scalping'); return t && t.layout.oben.length === 1 && Store.activeDashboard().id === t.id; }));
  await p.click('[data-pop=tpl]'); await p.waitForTimeout(150);
  const rows = await p.$$('.tpl-row'); ok('Zwei Vorlagen im Menü', rows.length === 2);
  // Kopie erstellen
  await p.click('[data-action="dash-tpl-new"]'); await p.waitForTimeout(200); await p.fill('.modal input[name=name]', 'Kopie'); await p.click('.modal input[value=copy]'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(350);
  ok('Von aktueller kopiert', await p.$$eval('.dash-top > .w', e => e.length) === 1);
  await p.click('[data-action="dash-cancel"]'); await p.waitForTimeout(250);
  // Menü: Bearbeiten, Umbenennen, Duplizieren, Standard (nur bei Nicht-Standard), Löschen (nur ab zwei Vorlagen)
  await p.click('[data-pop=tpl]'); await p.waitForTimeout(150);
  const menuBtns = await p.$$('[data-action="dash-tpl-menu"]'); await menuBtns[1].click(); await p.waitForTimeout(150);
  ok('···-Menü zeigt 5 Einträge, „Bearbeiten“ zuerst, keine deaktivierten', await p.$$eval('.tpl-menu .item', e => e.length === 5 && e[0].dataset.action === 'dash-tpl-edit' && !e.some(x => x.disabled)) && !(await p.$('.tpl-row [data-action="dash-tpl-edit"]')) && !!(await p.$('#pop-tpl.open')));
  await p.click('[data-action="dash-tpl-rename"]'); await p.waitForTimeout(200); await p.fill('.modal input[name=v]', 'Scalping Pro'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(300);
  ok('Umbenannt', await p.evaluate(() => Store.dashboards().some(d => d.name === 'Scalping Pro')));
  await p.click('[data-pop=tpl]'); await p.waitForTimeout(150); console.log('rows:', await p.$$eval('.tpl-row', r => r.map(x => x.textContent.trim()).join(' | ')), 'pop open:', !!(await p.$('#pop-tpl.open'))); await (await p.$$('[data-action="dash-tpl-menu"]'))[1].click(); await p.waitForTimeout(150); console.log('menu for:', await p.$eval('.tpl-menu', e => e.previousElementSibling.textContent.trim()).catch(() => 'none')); await p.click('[data-action="dash-tpl-default"]'); await p.waitForTimeout(200); console.log('defaults:', await p.evaluate(() => Store.dashboards().map(d => d.name + ':' + d.isDefault).join(' ')));
  ok('Als Standard festgelegt', await p.evaluate(() => Store.defaultDashboard().name === 'Scalping Pro'));
  await (await p.$$('[data-action="dash-tpl-menu"]'))[1].click(); await p.waitForTimeout(100); await p.click('[data-action="dash-tpl-dup"]'); await p.waitForTimeout(200);
  ok('Dupliziert', await p.evaluate(() => Store.dashboards().length === 4 && Store.dashboards().some(d => d.name === 'Scalping Pro (Kopie)')));
  // Standard-Vorlage löschen -> nächste wird Standard
  await (await p.$$('[data-action="dash-tpl-menu"]'))[1].click(); await p.waitForTimeout(100); await p.click('[data-action="dash-tpl-delete"]'); await p.waitForTimeout(200);
  ok('Löschen fragt nach', (await p.textContent('.modal')).includes('wirklich löschen'));
  await p.click('.modal [data-confirm]'); await p.waitForTimeout(300);
  ok('Gelöscht, neuer Standard', await p.evaluate(() => Store.dashboards().length === 3 && !Store.dashboards().some(d => d.name === 'Scalping Pro') && Store.dashboards().filter(d => d.isDefault).length === 1));
  // Vorlage wechseln
  await p.click('[data-pop=tpl]'); await p.waitForTimeout(150); await p.click('.tpl-row .item.name'); await p.waitForTimeout(300);
  ok('Wechsel lädt Standard (26 unten)', await p.$$eval('.dash-main > .w', e => e.length) === 26 && (await p.textContent('[data-pop=tpl]')).includes('Standard'));
  // Neuladen: Standard-Vorlage (isDefault) wird geladen
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  ok('Nach Neuladen Standard-Vorlage (Stern) geladen', await p.evaluate(() => Store.activeDashboard().isDefault));
  // Leerer Zustand: Beispieldaten entfernen
  await p.evaluate(() => { Store.removeSample(); }); await p.waitForTimeout(100); await p.evaluate(() => App.rerender(false)); await p.waitForTimeout(300);
  const wc = await p.evaluate(() => { const c = document.querySelector('.dash-welcome'); return { c: !!c, h: c && c.querySelector('h2').textContent, btn: c ? [...c.querySelectorAll('.btn')].map(b => b.className.replace('btn', '').trim() + ':' + b.dataset.action) : [], grid: !!document.querySelector('.dash-main, .dash-top'), head: !!document.querySelector('.dash-head'), banner: !!document.querySelector('.banner') }; });
  ok('Leer: nur eine Willkommens-Karte (Trade loggen gefüllt, CSV umrandet, Beispieldaten leise), kein Raster, keine Kopfreihe, kein Banner', wc.c && wc.h === 'Willkommen' && wc.btn.join() === 'accent:new-trade,:import,ghost:install-sample' && !wc.grid && !wc.head && !wc.banner, JSON.stringify(wc));
  await p.screenshot({ path: 'dash-7-empty.png', fullPage: true });
  await p.evaluate(() => { Store.installSample(); });
  /* Handy */
  const m = await browser.newContext({ viewport: { width: 400, height: 820 } }); await require('./localfonts.js')(m); const mp = await m.newPage(); mp.on('pageerror', e => errs.push('phone ' + e.message));
  await mp.goto(base + '#/dashboard', { waitUntil: 'load' }); await mp.waitForTimeout(700);
  ok('Handy: keine Seitenbreite-Überlauf', await mp.evaluate(() => document.documentElement.scrollWidth <= 400 + 1), String(await mp.evaluate(() => document.documentElement.scrollWidth)));
  ok('Handy: obere Reihe als Raster mit zwei Spalten (kein Karussell)', await mp.$eval('.dash-top', e => { const cs = getComputedStyle(e); return cs.display === 'grid' && cs.gridTemplateColumns.split(' ').length === 2 && e.scrollWidth <= e.clientWidth; }));
  ok('Handy: untere Widgets volle Breite', await mp.$$eval('.dash-main > .w', ws => ws.every(w => Math.abs(w.getBoundingClientRect().width - ws[0].getBoundingClientRect().width) < 2)));
  await mp.screenshot({ path: 'dash-8-phone.png' });
  await mp.click('[data-pop=tpl]'); await mp.waitForTimeout(150); await mp.click('#pop-tpl .tpl-row.on [data-action="dash-tpl-menu"]'); await mp.waitForTimeout(120); await mp.click('#pop-tpl .tpl-menu [data-action="dash-tpl-edit"]'); await mp.waitForTimeout(300);
  ok('Handy: Pfeile statt Handle', await mp.$eval('.w.editing .mv', e => getComputedStyle(e).display !== 'none') && await mp.$eval('.w.editing .handle', e => getComputedStyle(e).display === 'none'));
  await mp.screenshot({ path: 'dash-9-phone-edit.png' });
  await mp.click('.dash-main .add-slot'); await mp.waitForTimeout(300); await mp.screenshot({ path: 'dash-10-phone-panel.png' });
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e); process.exit(1); });
