/* Hinweis-Punkte in der Seitenleiste (Gründe, Schalter in den Einstellungen) und Namensform der Begrüßung */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  const dots = () => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('#sidebar .nav a, #pop-user .item[href="#/coach"]')].map(a => [a.getAttribute('href').slice(2), (a.querySelector('.nav-dot') || {}).title || ''])));
  const today = await p.evaluate(() => Core.dayKey(new Date())); const wd = new Date().getDay(); const weekday = wd !== 0 && wd !== 6;
  console.log('Start:', JSON.stringify(await dots()));
  /* Ausgangslage festlegen: heute kein Trade, keine offene Position, kein Check-in */
  await p.evaluate(k => { const d = Store.day(k); if (d) { delete d.checkIn; delete d.rulesFollowed; } for (const t of Store.trades().filter(t => !t.closedAt)) Store.deleteTrade ? Store.deleteTrade(t.id) : null; App.rerender(); }, today); await p.waitForTimeout(400);
  let d = await dots();
  ok(!d.trades && !d.notebook && !d.progress, 'Ohne offene Position und ohne Trade heute: keine Punkte bei TradeLog, Notebook, Fortschritt');
  ok(weekday ? d.day === 'Check-in für heute fehlt' : !d.day, `Tagesansicht: ${weekday ? 'Check-in fehlt (Werktag)' : 'Wochenende, kein Punkt'}`);
  /* offene Position */
  await p.evaluate(() => { Store.addTrade({ symbol: 'NQ', direction: 1, quantity: 1, entryPrice: 20000, openedAt: new Date().toISOString(), screenshots: [], voiceNotes: [] }); App.rerender(); }); await p.waitForTimeout(300);
  d = await dots(); ok(d.trades === '1 offene Position', 'Offene Position: Punkt bei TradeLog „1 offene Position“ · ' + d.trades);
  /* geschlossener Trade heute: Tagesnotiz und Regeln fehlen */
  await p.evaluate(() => { const now = new Date(); const o = new Date(now.getTime() - 60 * 60000); Store.addTrade({ symbol: 'ES', direction: 1, quantity: 1, entryPrice: 5000, exitPrice: 5010, openedAt: o.toISOString(), closedAt: now.toISOString(), screenshots: [], voiceNotes: [] }); App.rerender(); }); await p.waitForTimeout(300);
  d = await dots(); const hasRules = await p.evaluate(() => (Store.data.rules || []).some(r => r.active !== false));
  ok(d.notebook === 'Tagesnotiz für heute fehlt', 'Trade heute ohne Tagesnotiz: Punkt bei Notebook');
  ok(hasRules ? d.progress === 'Regeln von heute noch nicht abgehakt' : !d.progress, 'Fortschritt: Punkt, solange die Regeln von heute fehlen');
  /* erledigen → Punkte verschwinden */
  await p.evaluate(k => { const n = Store.dayNote(k, true); Store.updateNote(n.id, { content: { ops: [{ insert: 'Heute ruhig gehandelt.\n' }] } }); const rules = (Store.data.rules || []).filter(r => r.active !== false); Store.setDay(k, { checkIn: { sleep: 7, mood: 3, goal: 'Plan halten', at: new Date().toISOString() }, rulesFollowed: rules.map(r => r.id) }); App.rerender(); }, today); await p.waitForTimeout(300);
  d = await dots(); ok(!d.notebook && !d.progress && !d.day, 'Erledigt (Notiz, Regeln, Check-in): Punkte weg · ' + JSON.stringify(d));
  /* Dashboard-Recap und Prop zur Information */
  console.log('Dashboard/Prop:', JSON.stringify({ dashboard: d.dashboard, prop: d.prop }));
  await p.screenshot({ path: 'langshots/dots-sidebar.png', clip: { x: 0, y: 0, width: 300, height: 1000 } });
  /* Einstellungen → Benachrichtigungen */
  await p.goto(BASE + '#/settings/benachrichtigungen', { waitUntil: 'load' }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => document.querySelectorAll('[data-action="navdot-toggle"]').length === 8 && [...document.querySelectorAll('[data-action="navdot-toggle"]')].some(b => b.dataset.key === 'coach')), 'Einstellungen: Hauptschalter plus 7 Bereiche (mit Coach)');
  await p.screenshot({ path: 'langshots/dots-settings.png', fullPage: true });
  await p.evaluate(() => document.querySelector('[data-action="navdot-toggle"][data-key="trades"]').click()); await p.waitForTimeout(300);
  d = await dots(); ok(!d.trades && await p.evaluate(() => Store.settings.navDots.trades === false), 'TradeLog-Punkt ausgeschaltet: verschwindet');
  await p.evaluate(() => document.querySelector('[data-action="navdot-toggle"][data-key="on"]').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('#sidebar .nav-dot') && document.querySelectorAll('[data-action="navdot-toggle"]').length === 1), 'Hauptschalter aus: keine Punkte, Bereichsschalter ausgeblendet');
  await p.evaluate(() => document.querySelector('[data-action="navdot-toggle"][data-key="on"]').click()); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('[data-action="navdot-toggle"][data-key="trades"]').click()); await p.waitForTimeout(300);
  d = await dots(); ok(d.trades === '1 offene Position', 'Wieder eingeschaltet: TradeLog-Punkt zurück');
  /* Mini-Modus */
  await p.evaluate(() => { Store.setSetting('sidebarMini', true); App.rerender(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => { const dt = document.querySelector('#sidebar .nav-dot'); return dt && getComputedStyle(dt).position === 'absolute'; }), 'Eingeklappt: Punkt oben rechts am Knopf');
  ok(await p.evaluate(() => { const dt = document.querySelector('#sidebar .nav-dot'); const r = dt && dt.getBoundingClientRect(); return !!r && r.width > 0 && r.height > 0; }), 'Eingeklappt: Hinweis sichtbar');
  await p.screenshot({ path: 'langshots/dots-mini.png', clip: { x: 0, y: 0, width: 110, height: 700 } });
  await p.evaluate(() => { Store.setSetting('sidebarMini', false); App.rerender(); });
  /* Begrüßung entfernt: keine Namensform-Auswahl mehr im Profil, Profil speichert weiter */
  await p.goto(BASE + '#/settings/profil', { waitUntil: 'load' }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => !document.getElementById('pf-greet') && !document.querySelector('#sidebar .sb-hello') && !!document.getElementById('pf-first') && !!document.getElementById('pf-tz') && !!document.getElementById('pf-bio')), 'Profil ohne Begrüßungs-Auswahl, übrige Felder da');
  await p.screenshot({ path: 'langshots/greet-profile.png', fullPage: true });
  /* Englisch */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); location.hash = '#/settings/benachrichtigungen'; }); await p.waitForTimeout(900);
  const en = await p.evaluate(() => ({ tip: (document.querySelector('#sidebar a[href="#/trades"] .nav-dot') || {}).title, head: [...document.querySelectorAll('.set-block h3')].map(h => h.textContent).join(' | ') }));
  ok(en.tip === '1 open position' && /Notification dots in the sidebar/.test(en.head), 'Englisch: Tooltip und Einstellungen übersetzt · ' + JSON.stringify(en));
  await p.evaluate(() => Store.setLanguage('de'));
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
