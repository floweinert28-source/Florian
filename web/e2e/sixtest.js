const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { Store.installSample(); Store.data.accounts.push({ id: 'acc2', name: 'Zweitkonto', size: 10000, currency: 'USD' }); /* zweites Konto: erst dann gibt es die Konto-Wahl */ Store.saveNow(); });
  /* 6. Dashboard-Kopf */
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  ok('Kopfreihe: Zeitraum und Konto links, Filter als Symbol rechts; Titelzeile ohne „Trade loggen“', !!(await p.$('.dash-head .dh-context [data-pop=range]')) && !!(await p.$('.dash-head .dh-context [data-pop=account]')) && !!(await p.$('.dash-head .dh-tools [data-action=dash-f-open].icon-only')) && !(await p.$('.topbar [data-action=new-trade]')) && !!(await p.$('.topbar .avatar')));
  ok('Zeitraum auf Höhe des Zertifikats', await p.evaluate(() => { const a = document.querySelector('.dash-head [data-pop=cert]').getBoundingClientRect(), r = document.querySelector('.dash-head [data-pop=range]').getBoundingClientRect(); return Math.abs((a.top + a.bottom) / 2 - (r.top + r.bottom) / 2) < 3 && r.right < a.left; }));
  const head = await p.$eval('.dash-head', e => ({ tpl: !!e.querySelector('[data-pop=tpl].icon-only'), cert: !!e.querySelector('[data-pop=cert].icon-only'), filter: !!e.querySelector('[data-action=dash-f-open]'), nt: !!e.querySelector('[data-action=new-trade]'), sess: !!e.querySelector('[data-action=start-session]'), voice: !!e.querySelector('[data-action=voice-last]'), range: !!e.querySelector('[data-pop=range]'), acc: !!e.querySelector('[data-pop=account]'), edit: !!e.querySelector('[data-action=dash-tpl-menu]'), txt: e.textContent }));
  ok('Dashboard-Reihe: Zeitraum, Konto, Vorlage (Symbol), Zertifikat (Symbol), Filter, Trade loggen', head.tpl && head.cert && head.nt && head.edit && head.filter && !head.sess && !head.voice && head.range && head.acc);
  ok('Kein „Tag starten“, kein Session-Knopf', !head.txt.includes('Tag starten') && !head.txt.includes('Session starten'));
  ok('Vorlage und Zertifikat stehen nebeneinander', await p.evaluate(() => { const t = document.querySelector('.dash-head [data-pop=tpl]').getBoundingClientRect(), c = document.querySelector('.dash-head [data-pop=cert]').getBoundingClientRect(); return c.left - t.right < 14 && c.left > t.right; }));
  await p.evaluate(() => { Store.setDay(Core.dayKey(new Date()), { checkIn: { sleep: 7, stress: 2, mood: 4 } }); App.rerender(); }); await p.waitForTimeout(300);
  ok('Kein „Check-in bearbeiten“ auf dem Dashboard', !(await p.$('.dash-head [data-action=check-in]')));
  const fits = await p.evaluate(() => { const h = document.querySelector('.dash-head').getBoundingClientRect(); return [...document.querySelectorAll('.dash-head .btn')].filter(b => !b.closest('.popover') && b.getClientRects().length).every(b => { const r = b.getBoundingClientRect(); return r.left >= h.left - 1 && r.right <= h.right + 1; }); });
  ok('Reihe passt in die Breite', fits);
  /* Beispieldaten v2: Zeitraum „Gesamt“, damit mehrere Symbole im Zeitraum liegen (am Monatsersten hat „Dieser Monat“ sonst nur einen Trade) */
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); App.rerender(false); }); await p.waitForTimeout(300);
  const pnlBefore = await p.textContent('.dash-top .tile .val');
  await p.click('[data-action=dash-f-open]'); await p.waitForTimeout(400); ok('Filter-Leiste offen', !!(await p.$('#fd-layer .fd-panel')) && (await p.$$('.fd-group')).length === 4);
  await p.click('.fd-pick[data-key="symbols"] .fd-add'); await p.waitForTimeout(200);
  const sym = await p.$eval('#fd-opts .item[data-value]', e => e.dataset.value); await p.click('#fd-opts .item[data-value]'); await p.waitForTimeout(150);
  await p.click('[data-action=dash-f-apply]'); await p.waitForTimeout(500);
  ok('Symbol-Filter aktiv nach Anwenden', !(await p.$('#fd-layer .fd-panel')) && (await p.textContent('[data-action=dash-f-open] .cntb')) === '1' && await p.evaluate(() => Store.settings.dashFilter.symbols.length === 1));
  const pnlAfter = await p.textContent('.dash-top .tile .val'); ok('Widgets nach Filter anders', pnlBefore !== pnlAfter, `${pnlBefore} → ${pnlAfter}`);
  ok('Letzte Trades nur mit Symbol', await p.$$eval('.recent-card tbody tr', (rows, s) => rows.length > 0 && rows.every(r => r.textContent.includes(s)), sym));
  await p.click('[data-action=dash-f-open]'); await p.waitForTimeout(300); await p.click('[data-action=dash-f-set][data-key=dir][data-value=long]'); await p.click('[data-action=dash-f-apply]'); await p.waitForTimeout(400); ok('Richtung dazu = 2 Filter', (await p.textContent('[data-action=dash-f-open] .cntb')) === '2');
  await p.click('[data-action=dash-f-open]'); await p.waitForTimeout(300); await p.click('[data-action=dash-f-reset]'); await p.click('[data-action=dash-f-apply]'); await p.waitForTimeout(400); ok('Zurücksetzen', !(await p.$('[data-action=dash-f-open] .cntb')) && (await p.textContent('.dash-top .tile .val')) === pnlBefore);
  await p.screenshot({ path: 'six-dash.png', clip: { x: 232, y: 0, width: 1208, height: 520 } });
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(500);
  ok('Andere Seiten: Knöpfe in der Reihe unter dem Titel', !!(await p.$('#content > .page-head [data-pop=range]')) && !!(await p.$('#content > .page-head [data-action=new-trade]')) && !(await p.$('.topbar .actions .btn')));
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(500);
  ok('Statistiken: kein „Trade loggen“ und kein ▷ (nicht die Aufgabe der Seite)', !(await p.$('#content > .page-head [data-action=new-trade]')) && !(await p.$('#content > .page-head [data-action=start-session]')) && !!(await p.$('#content > .page-head [data-pop=range]')));
  await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(500);
  ok('Mentor: Kopfreihe nur mit Konto und Hinweis', await p.evaluate(() => { const h = document.querySelector('#content > .page-head'); return !!h && h.classList.contains('compact') && !!h.querySelector('[data-pop=account]') && !h.querySelector('[data-pop=range]') && !h.querySelector('[data-action=new-trade]') && !h.querySelector('[data-action=start-session]') && /20 Trades/.test(h.textContent); }));
  await p.evaluate(() => { location.hash = '#/stats'; }); await p.waitForTimeout(500);
  /* 4. Statistik-Kacheln */
  ok('Kennzahlen als 16 Kacheln ohne Gitter', (await p.$$('.stat-tiles .stat-tile')).length === 16 && !(await p.$('.stat-grid')));
  const gap = await p.evaluate(() => { const t = document.querySelectorAll('.stat-tile'); return t[1].getBoundingClientRect().left - t[0].getBoundingClientRect().right; }); ok('Abstand zwischen Kacheln', gap >= 12, String(gap));
  await p.screenshot({ path: 'six-stats.png', clip: { x: 232, y: 60, width: 1208, height: 560 } });
  /* 3. Aktivität */
  await p.evaluate(() => { location.hash = '#/progress'; }); await p.waitForTimeout(500);
  const act = await p.evaluate(() => { const a = document.querySelector('.activity'); const cells = a.querySelectorAll('.cells i, .cells .c, .cells > *'); let bottom = 0; cells.forEach(c => { bottom = Math.max(bottom, c.getBoundingClientRect().bottom); }); return { gap: a.getBoundingClientRect().bottom - bottom, pad: getComputedStyle(a).paddingBottom, sbw: getComputedStyle(a).scrollbarWidth }; });
  ok('Keine sichtbare Scroll-Leiste unter den Kästchen (scrollbar-width: none), Luft bleibt', act.sbw === 'none' && act.gap >= 8, JSON.stringify(act));
  /* 1. Notebook Zähler */
  await p.evaluate(() => { location.hash = '#/notebook'; }); await p.waitForTimeout(500);
  ok('Keine Zähler in der Ordnerliste', (await p.$$('.nb .folder .cnt')).length === 0 && !(await p.$('.nb .trash-link .small')));
  /* 2. Tags per Klick */
  await (await p.$$('.nb .note-item'))[0].click(); await p.waitForTimeout(400);
  ok('Kein Tag-Textfeld mehr', !(await p.$('.nb .tag-in')) && !!(await p.$('.nb .tag-add')));
  await p.click('.nb .tag-add'); await p.waitForTimeout(200); ok('Tag-Liste offen', !!(await p.$('#pop-nbtags.open')) && (await p.$$('#pop-nbtags .item[data-action=nb-tag-toggle]')).length > 0);
  const before = await p.$$eval('.nb .tags-row .chip', e => e.length);
  const firstFree = await p.$('#pop-nbtags .item[data-action=nb-tag-toggle][aria-checked=false]'); const tname = (await firstFree.textContent()).trim(); await firstFree.click(); await p.waitForTimeout(400);
  ok('Tag per Klick zugewiesen, Liste bleibt offen', (await p.$$eval('.nb .tags-row .chip', e => e.length)) === before + 1 && !!(await p.$('#pop-nbtags.open')) && (await p.textContent('.nb .tags-row')).includes(tname));
  await p.click(`#pop-nbtags .item[aria-checked=true]`); await p.waitForTimeout(400); ok('Nochmal Klick entfernt', (await p.$$eval('.nb .tags-row .chip', e => e.length)) === before);
  await p.click('#pop-nbtags [data-action=nb-tag-new]'); await p.waitForTimeout(250); await p.fill('.modal input[name=v]', 'Sixtest'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(400);
  ok('Neuer Tag über Dialog', (await p.textContent('.nb .tags-row')).includes('Sixtest') && await p.evaluate(() => Store.noteTags().some(t => t.name === 'Sixtest')));
  await p.screenshot({ path: 'six-nb.png', clip: { x: 232, y: 60, width: 1208, height: 520 } });
  /* 5. Profilbild */
  await p.evaluate(() => { location.hash = '#/settings/profil'; }); await p.waitForTimeout(500);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mNk+M/wn4EBCBgAAB8AA/1zmSMAAAAASUVORK5CYII=', 'base64');
  await p.setInputFiles('form[data-action="save-profile"] input[type=file]', { name: 'me.png', mimeType: 'image/png', buffer: png }); await p.waitForTimeout(900);
  const info = await p.evaluate(async () => { const id = Store.settings.avatarId; const rec = await Blobs.get(id); const b = rec && rec.blob ? rec.blob : rec; return { id: !!id, type: b && b.type, size: b && b.size }; });
  ok('Profilbild als kleines JPEG gespeichert', info.id && info.type === 'image/jpeg' && info.size > 100 && info.size < 60000, JSON.stringify(info));
  const idBefore = await p.evaluate(() => Store.settings.avatarId);
  await p.setInputFiles('form[data-action="save-profile"] input[type=file]', { name: 'foto.heic', mimeType: 'image/heic', buffer: Buffer.from('nicht lesbar') }); await p.waitForTimeout(700);
  ok('Unlesbares Format: Hinweis, Bild bleibt', (await p.textContent('.toast-wrap, body')).includes('Bildformat') && await p.evaluate((b) => Store.settings.avatarId === b, idBefore));
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
