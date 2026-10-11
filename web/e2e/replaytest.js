const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('jy_features', '{"replay":true}'); } catch (e) {} }); /* Blind-Replay ist zurückgestellt: für diese Suite freischalten */ const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  /* Beispieldaten v2 bringen Replay-Screenshots und zwei Sessions mit; diese Suite prüft das Replay ab dem Leerzustand */
  await p.evaluate(() => { for (const t of Store.trades()) { t.screenshotPre = null; t.screenshots = []; } Store.data.replay.history = []; Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(300);
  await p.evaluate(() => { location.hash = '#/replay'; }); await p.waitForTimeout(700);
  ok('Replay-Seite in der Navigation und Leerzustand', (await p.textContent('.sidebar')).includes('Blind-Replay') && (await p.textContent('#main')).includes('Noch kein Trade mit „Screenshot vor Entry“') && !!(await p.$('.rh-steps')) && !(await p.$('.rh-facts')) && await p.$eval('[data-action=replay-start]', b => b.disabled));
  // 12 geschlossene Trades mit Screenshot vor Entry (kleines PNG als Blob)
  const n = await p.evaluate(async () => { const png = await (await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')).blob(); const closed = Store.trades().filter(t => t.closedAt).slice(0, 12); for (const t of closed) { t.screenshotPre = await Blobs.put(png); } Store.saveNow(); return closed.length; });
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(300); await p.evaluate(() => { location.hash = '#/replay'; }); await p.waitForTimeout(700);
  ok('Trades mit Screenshot vor Entry werden gezählt', (await p.textContent('#main')).includes(`${n} Trades bereit`) && !(await p.$eval('[data-action=replay-start]', b => b.disabled)));
  await p.click('[data-action=replay-start]'); await p.waitForTimeout(500);
  ok('Session mit 10 Trades, Trade 1', (await p.textContent('#main')).includes('Trade 1 von 10') && !!(await p.$('.replay-shot img')) && (await p.$$('.replay-progress i')).length === 10);
  ok('Kein Ergebnis sichtbar (kein R, kein Gewinn/Verlust)', !/Gewinner|Verlierer| R\b/.test(await p.textContent('.replay-card')));
  const setupShown = await p.$('.replay-meta .chip'); ok('Setup standardmäßig verborgen', !setupShown);
  await p.check('[data-change=replay-setup]'); await p.waitForTimeout(300);
  ok('Setup per Schalter einblendbar', await p.evaluate(() => App.state.replay.showSetup === true));
  await p.click('[data-action=replay-conf][data-value="3"]'); await p.waitForTimeout(200);
  await p.click('[data-action=replay-decide][data-value=take]'); await p.waitForTimeout(400);
  const res = await p.textContent('.replay-result');
  ok('Auflösung zeigt Urteil, Gewinner/Verlierer und Ergebnis', /Richtig|Daneben/.test(res) && /Gewinner|Verlierer/.test(res) && /R|€/.test(res) && /Gefühl:\s*Sicher/.test(res));
  const card = await p.evaluate(() => Store.replayHistory()[0]);
  ok('Karte gespeichert', card && card.decision === 'take' && card.confidence === 3 && typeof card.correct === 'boolean' && !!card.sessionId);
  for (let i = 0; i < 9; i++) { await p.click('[data-action=replay-next]'); await p.waitForTimeout(200); await p.click('[data-action=replay-decide][data-value=skip]'); await p.waitForTimeout(200); }
  await p.click('[data-action=replay-next]'); await p.waitForTimeout(400);
  ok('Auswertung nach 10 Karten', (await p.textContent('#main')).includes('von 10 richtig') && await p.evaluate(() => Store.replayHistory().length === 10));
  await p.click('[data-action=replay-close]'); await p.waitForTimeout(500);
  const stats = await p.textContent('#main');
  ok('Übersicht in Alltagssprache: richtig eingeschätzt, Setup-Balken, Gefühl in Worten, Lernstand', /Richtig eingeschätzt/.test(stats) && /\d+ von 10 Trades/.test(stats) && (await p.$$('.replay-bars .rb-row')).length >= 2 && /Unsicher|Eher sicher|Sicher/.test(stats) && !/Sicherheit \d|Fach \d|Karteikasten/.test(stats) && /Zum Üben\s*\d+/.test(await p.textContent('.rh-facts')));
  ok('Karteikasten: falsche Karten in Fach 1, richtige in Fach 2', await p.evaluate(() => { const b = Replay.boxes(Store.replayHistory()); const h = Store.replayHistory(); return h.every(c => (b.get(c.tradeId) || {}).box === (c.correct ? 2 : 1)); }));
  // zweite Session: deterministische Auswahl bevorzugt Fach 1 (statistisch über pick)
  ok('Ziehung bevorzugt falsch eingeschätzte Trades', await p.evaluate(() => { const el = Replay.eligible(App.allTrades()); const h = Store.replayHistory(); const wrong = new Set(h.filter(c => !c.correct).map(c => c.tradeId)); if (!wrong.size) return true; const bx = Replay.boxes(h); const W = Replay.WEIGHTS || { 1: 4, 2: 2, 3: 1, unseen: 3 }; const w = t => { const b = bx.get(t.id); return b ? (W[b.box] || 1) : (W.unseen != null ? W.unseen : W[0] != null ? W[0] : 3); }; const total = el.reduce((a, t) => a + w(t), 0); const expected = el.filter(t => wrong.has(t.id)).reduce((a, t) => a + w(t), 0) / total; let hits = 0; for (let s = 1; s <= 200; s++) { const first = Replay.pick(el, h, 1, Core.mulberry(s))[0]; if (first && wrong.has(first.id)) hits++; } return hits / 200 >= expected * 0.75 && hits / 200 > wrong.size / el.length * 0.9; }));
  // Export/Import behält Karten
  ok('Export/Import behält Replay-Karten', await p.evaluate(async () => { const txt = await Store.exportJSON(false); await Store.importJSON(txt, 'merge'); return Store.replayHistory().length === 10; }));
  // Trade-Ansicht: Feld Screenshot vor Entry
  const tid = await p.evaluate(() => Store.trades().find(t => t.screenshotPre).id);
  await p.evaluate(i => { location.hash = '#/trades/' + i; }, tid); await p.waitForTimeout(700);
  ok('Trade-Ansicht zeigt Karte „Screenshot vor Entry“ mit Bild', !!(await p.$('#pre-drop')) && (await p.textContent('#main')).includes('Screenshot vor Entry') && !!(await p.$('[data-action=delete-pre-shot]')));
  await p.click('[data-action=delete-pre-shot]'); await p.waitForTimeout(400);
  ok('Screenshot vor Entry löschbar', await p.evaluate(i => !Store.getTrade(i).screenshotPre, tid));
  // Handy
  await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => { location.hash = '#/replay'; }); await p.waitForTimeout(500); await p.click('[data-action=replay-start]'); await p.waitForTimeout(500);
  ok('Handy: Session ohne Überlauf', await p.evaluate(() => document.documentElement.scrollWidth <= 390 && !!document.querySelector('.replay-shot img')));
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no errors'); await browser.close(); })();
