/* Dashboard-Filter: Fenster unter dem Knopf, Symbol per +, neue Filter, Anwenden, Zurücksetzen, alte Filter übernehmen */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); await require('./localfonts.js')(p);
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); Store.setSetting('dashFilter', null); App.rerender(); }); await p.waitForTimeout(400);
  const total = await p.evaluate(() => App.tradesInRange(App.allTrades()).length);
  const footN = () => p.evaluate(() => (document.querySelector('.fd-foot .fd-n') || {}).textContent);
  await p.click('[data-action="dash-f-open"]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => { const pop = document.querySelector('#fd-layer .fd-panel.fd-pop'); if (!pop) return false; const r = pop.getBoundingClientRect(), b = document.querySelector('[data-action="dash-f-open"]').getBoundingClientRect(); return !document.querySelector('.fd-panel .chip') && !document.querySelector('.side-panel.fd-panel, .panel-bg') && getComputedStyle(pop).position === 'absolute' && Math.abs(r.top - (b.bottom + 8)) <= 3 && Math.abs(r.right - b.right) <= 1 && r.width === 320 && r.height <= 460; }), 'Filter öffnet als Fenster direkt unter dem Knopf (wie die anderen Menüs), ohne Tag-Wolke');
  ok(await p.evaluate(() => [...document.querySelectorAll('.fd-group')].map(g => g.classList.contains('open')).join(',')) === 'true,false,false,false', 'Nur „Trade“ ist aufgeklappt');
  ok(await p.evaluate(() => document.querySelectorAll('.fd-pick[data-key="symbols"] .fd-chip').length === 0 && !!document.querySelector('.fd-pick[data-key="symbols"] .fd-add')), 'Symbole nicht aufgelistet, nur „+ Symbol“');
  ok((await footN()).includes(String(total)), 'Fuß zeigt alle Trades: ' + await footN());
  /* + Symbol: NQ suchen und wählen */
  await p.click('.fd-pick[data-key="symbols"] .fd-add'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.activeElement && document.activeElement.id === 'fd-q'), 'Suche hat sofort den Fokus');
  await p.keyboard.type('nq'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => [...document.querySelectorAll('#fd-opts .item')].map(x => x.textContent.trim()).every(t => /nq/i.test(t))), 'Suche filtert die Symbole');
  await p.click('#fd-opts [data-value="NQ"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => [...document.querySelectorAll('.fd-pick[data-key="symbols"] .fd-chip span')].map(x => x.textContent).join(',')) === 'NQ', 'NQ als Auswahl gesetzt');
  /* eigenes Symbol per Enter */
  await p.keyboard.type('zzz'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => [...document.querySelectorAll('.fd-pick[data-key="symbols"] .fd-chip span')].map(x => x.textContent).join(',')) === 'NQ,ZZZ', 'Eigenes Symbol per Enter (ZZZ)');
  await p.click('.fd-pick[data-key="symbols"] [data-value="ZZZ"]'); await p.waitForTimeout(150);
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#fd-layer .fd-panel') && !document.querySelector('.fd-drop')), 'Escape schließt nur die Suche');
  /* Richtung Long, Zeit: Di + Mi, Werte: R ≥ 0 */
  await p.click('[data-action="dash-f-set"][data-key="dir"][data-value="long"]'); await p.waitForTimeout(150);
  await p.click('[data-action="dash-f-group"][data-id="time"]'); await p.waitForTimeout(150);
  await p.click('[data-action="dash-f-toggle"][data-key="weekdays"][data-value="1"]'); await p.click('[data-action="dash-f-toggle"][data-key="weekdays"][data-value="2"]'); await p.waitForTimeout(150);
  await p.click('[data-action="dash-f-group"][data-id="vals"]'); await p.waitForTimeout(150);
  await p.fill('[data-key="rMin"]', '0'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.activeElement && document.activeElement.dataset.key === 'rMin'), 'Zahl eintippen: Fokus bleibt im Feld');
  const expect = await p.evaluate(() => DashFilter.apply(App.tradesInRange(App.allTrades()), { ...DashFilter.EMPTY(), symbols: ['NQ'], dir: 'long', weekdays: [1, 2], rMin: '0' }).length);
  ok((await footN()).includes(String(expect)) && expect > 0 && expect < total, `Fuß zählt live: ${await footN()} (erwartet ${expect})`);
  await p.screenshot({ path: 'langshots/filter-3.png' });
  /* Schließen verwirft den Entwurf */
  await p.click('.fd-panel [data-action="dash-f-close"]'); await p.waitForTimeout(200);
  await p.click('[data-action="dash-f-open"]'); await p.waitForTimeout(300); await p.mouse.click(1380, 860); await p.waitForTimeout(250);
  ok(!(await p.$('#fd-layer .fd-panel')), 'Klick neben das Fenster schließt den Filter');
  await p.click('[data-action="dash-f-open"]'); await p.waitForTimeout(300); await p.click('[data-action="dash-f-open"]'); await p.waitForTimeout(250);
  ok(!(await p.$('#fd-layer .fd-panel')), 'Filter-Knopf schaltet das Fenster um (zweiter Klick schließt)');
  ok(await p.evaluate(() => DashFilter.count(DashFilter.state()) === 0), 'Schließen ohne Anwenden ändert nichts');
  /* nochmal und anwenden */
  await p.click('[data-action="dash-f-open"]'); await p.waitForTimeout(300);
  await p.click('[data-action="dash-f-set"][data-key="dir"][data-value="long"]'); await p.click('[data-action="dash-f-set"][data-key="status"][data-value="win"]'); await p.waitForTimeout(150);
  const exp2 = await p.evaluate(() => DashFilter.apply(App.tradesInRange(App.allTrades()), { ...DashFilter.EMPTY(), dir: 'long', status: 'win' }).length);
  await p.click('[data-action="dash-f-apply"]'); await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({ open: !!document.querySelector('#fd-layer .fd-panel'), badge: (document.querySelector('[data-action="dash-f-open"] .cntb') || {}).textContent, tile: document.querySelector('.dash-top .tile .head .n, .dash-top .tile .tr') ? document.querySelector('.dash-top .tile').textContent : '' }));
  ok(!r.open && r.badge === '2', 'Anwenden: Leiste zu, Knopf zeigt 2 aktive Filter');
  ok(r.tile.includes(exp2 + ' Trades') || r.tile.includes(exp2 + ' Trade'), `Dashboard rechnet mit ${exp2} Trades`);
  /* wieder öffnen: Auswahl sichtbar; Zurücksetzen + Anwenden */
  await p.click('[data-action="dash-f-open"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelector('[data-key="dir"][data-value="long"]').getAttribute('aria-pressed') === 'true'), 'Gespeicherte Auswahl wieder sichtbar');
  await p.click('[data-action="dash-f-reset"]'); await p.click('[data-action="dash-f-apply"]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => DashFilter.count(DashFilter.state()) === 0 && !document.querySelector('[data-action="dash-f-open"] .cntb')), 'Zurücksetzen entfernt alle Filter');
  /* Logik: Uhrzeit über Mitternacht, Haltedauer in Stunden, Reviewed, Intraday, Volumen */
  const logic = await p.evaluate(() => { const all = App.allTrades(); const A = (f) => DashFilter.apply(all, Object.assign(DashFilter.EMPTY(), f));
    const night = A({ entryFrom: '22:00', entryTo: '02:00' }).every(t => { const m = t.open.getHours() * 60 + t.open.getMinutes(); return m >= 1320 || m <= 120; });
    const hold = A({ holdMin: '1', holdUnit: 'h' }).every(t => t.holdingMin >= 60);
    const rev = A({ reviewed: 'yes' }).every(DashFilter.isReviewed) && A({ reviewed: 'no' }).every(t => !DashFilter.isReviewed(t));
    const intra = A({ span: 'intraday' }).every(t => t.closed && Core.dayKey(t.close) === t.dayKey);
    const vol = A({ volMin: '100000' }).every(t => t.notional >= 100000);
    const parts = A({ reviewed: 'yes' }).length + A({ reviewed: 'no' }).length === all.length;
    return { night, hold, rev, intra, vol, parts }; });
  ok(Object.values(logic).every(Boolean), 'Logik: Mitternacht, Stunden, Reviewed, Intraday, Volumen ' + JSON.stringify(logic));
  /* alter gespeicherter Filter wird übernommen */
  const legacy = await p.evaluate(() => { Store.setSetting('dashFilter', { symbols: ['NQ'], dir: 'short', status: 'open', setups: [], tags: ['FOMO', 'Ruhig'] }); const f = DashFilter.state(); return [f.symbols.join(), f.dir, f.status, f.state, f.mistakes.join(), f.emotions.join(), 'tags' in f].join('|'); });
  ok(legacy === 'NQ|short||open|FOMO|Ruhig|false', 'Alter Filter übernommen: ' + legacy);
  await p.evaluate(() => { Store.setSetting('dashFilter', null); App.rerender(); });
  /* Handy */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); m.on('pageerror', e => errs.push(e.message));
  await m.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(700); await m.click('[data-action="dash-f-open"]'); await m.waitForTimeout(400);
  ok(await m.evaluate(() => { const pn = document.querySelector('.fd-panel').getBoundingClientRect(); const over = [...document.querySelectorAll('.fd-panel *')].some(e => e.getBoundingClientRect().right > innerWidth + 1); return pn.width <= innerWidth && !over; }), 'Handy: Leiste füllt den Bildschirm, nichts ragt heraus');
  await m.screenshot({ path: 'langshots/filter-mob.png' });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
