/* Beispieldaten v2: frische Installation, TradeLog mit NQ/ES, Sprachnotiz ohne Audio, Prop-Cockpit/Bilanz mit Payout-Planer/Friedhof,
   Blind-Replay mit Screenshots, Schatten-Ich, Entfernen (alle Sammlungen und Blobs leer), erneut laden (Determinismus), Upgrade-Pfad alter Daten. */
const { chromium } = require('playwright');
const path = require('path');
const base = 'file://' + path.join(__dirname, 'sample-dev.html');
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
const ignore = m => /ERR_CERT|fonts\.googleapis|fonts\.gstatic|net::ERR|Error inlining remote css|Error loading remote stylesheet|Fetch API cannot load file|Error while reading CSS rules/.test(m);
const norm = s => String(s || '').replace(/ /g, ' ');
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('jy_features', '{"replay":true}'); } catch (e) {} }); /* Blind-Replay ist zurückgestellt: für diese Suite freischalten */ const p = await ctx.newPage();
  p.on('pageerror', e => { if (!ignore(e.message)) errs.push(e.message); }); p.on('console', m => { if (m.type() === 'error' && !ignore(m.text())) errs.push('console: ' + m.text()); });
  const go = async (hash, ms = 500) => { await p.evaluate(h => { location.hash = h; }, hash); await p.waitForTimeout(ms); };
  const content = async () => norm(await p.evaluate(() => document.getElementById('content').innerText));
  const blobCount = () => p.evaluate(() => Blobs.open().then(db => new Promise(r => { const q = db.transaction('files').objectStore('files').count(); q.onsuccess = () => r(q.result); q.onerror = () => r(-1); })).catch(() => -1));
  const counts = () => p.evaluate(() => ({ trades: Store.trades().length, sample: Store.trades().filter(t => t.sample).length, nq: Store.trades().filter(t => t.symbol === 'NQ').length, es: Store.trades().filter(t => t.symbol === 'ES').length, acc: Store.propAccounts().length, ex: Store.propExpenses().length, po: Store.propPayouts().length, br: Store.propBreaches().length, hist: Store.replayHistory().length, shots: Store.trades().filter(t => t.screenshotPre).length, voice: Store.trades().filter(t => (t.voiceNotes || []).length).length, days: Object.keys(Store.data.days).length, notes: Store.data.notes.filter(n => n.sample).length }));

  /* 1. Frische Installation: localStorage und IndexedDB leer → Beispieldaten beim ersten Start */
  await p.goto(base + '#/dashboard', { waitUntil: 'load' });
  await p.evaluate(async () => { localStorage.clear(); if (Blobs._db) { Blobs._db.close(); Blobs._db = null; } await new Promise(r => { const q = indexedDB.deleteDatabase('trading-journal-blobs'); q.onsuccess = q.onerror = q.onblocked = () => r(); }); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  const c1 = await counts();
  ok('Dashboard rendert nach frischer Installation ohne Fehler (Standardbereich Monat; am Monatsersten vor dem ersten Abschluss zulässig leer)', c1.trades >= 150 && c1.sample === c1.trades && (await p.$$('.tile')).length >= 4 && errs.length === 0, JSON.stringify(c1));
  /* Zeitraum „Alle“: der Standardbereich „Monat“ enthält am Monatsersten nur die heutigen Trades */
  await p.evaluate(() => { Store.setSetting('range', { preset: 'all', from: null, to: null }); App.rerender(false); }); await p.waitForTimeout(400);
  ok('Dashboard mit Daten (Zeitraum Alle): ≥ 150 Trades, keine „Noch keine Daten“, Kennzahlen gefüllt', !(await content()).includes('Noch keine Daten') && (await p.$$('.tile .val')).length >= 4);
  ok('sampleInstalled und sampleVersion 3 gesetzt', await p.evaluate(() => Store.settings.sampleInstalled === true && Store.settings.sampleVersion === 3));
  const imgs = await p.evaluate(() => Store.sampleImages);
  const b1 = await blobCount();
  ok('Replay-Screenshots nachgelaufen: ≥ 50 PNGs in IndexedDB (pre + post)', imgs >= 50 && b1 === imgs && c1.shots * 2 === imgs, `${imgs} Bilder, ${b1} Blobs, ${c1.shots} Trades`);
  await p.screenshot({ path: 'sample-dashboard.png', fullPage: true });

  /* 2. TradeLog: NQ und ES */
  await go('#/trades', 600);
  const syms = await p.$$eval('select[data-key=symbol] option', o => o.map(x => x.value));
  const tbl = await p.$eval('.tbl tbody', e => e.textContent);
  ok('TradeLog zeigt NQ und ES (Symbolfilter und Tabelle)', syms.includes('NQ') && syms.includes('ES') && tbl.includes('NQ') && tbl.includes('ES') && c1.nq > c1.es && c1.es >= 20, `NQ ${c1.nq}, ES ${c1.es}`);
  const rows = await p.$$eval('.tbl tbody tr', rs => rs.map(r => { const open = [...r.querySelectorAll('td .faint')].some(x => x.textContent === 'offen'); return { txt: r.textContent, closed: !open, open }; })); /* ohne Status-Spalte: offen steht in „Geschlossen“ */
  const firstClosed = rows.find(r => r.closed);
  ok('Erste geschlossene Zeile (unabhängig von der Uhrzeit): Preise mit Nachkommastellen, P&L in € und R', !!firstClosed && /\d+,\d{2}/.test(firstClosed.txt) && /€/.test(firstClosed.txt) && /-?\d+,\d+ R/.test(firstClosed.txt), (firstClosed || {}).txt);
  /* Minor: kein geschlossener Trade mit Ausstieg in der Zukunft (werktags 15–22 Uhr läuft nur der offene NQ-Trade) */
  const fut = await p.evaluate(() => { const now = Date.now(); const t = Store.trades(); const h = new Date().getHours(), wd = new Date().getDay(); return { future: t.filter(x => x.closedAt && new Date(x.closedAt).getTime() > now).map(x => x.symbol + ' ' + x.closedAt), opened: t.filter(x => new Date(x.openedAt).getTime() > now).length, open: t.filter(x => !x.closedAt).map(x => x.symbol), expectOpen: wd !== 0 && wd !== 6 && h >= 15 && h < 22, gen: [10, 16, 18].map(hh => { const d = new Date(); d.setHours(hh, 30, 0, 0); return Sample.generate({ now: d }).trades.filter(x => x.closedAt && new Date(x.closedAt) > d).length; }) }; });
  ok('Heute: kein geschlossener Trade mit closedAt in der Zukunft (jetzt und generiert um 10:30/16:30/18:30), offener NQ-Trade nur in der US-Session', fut.future.length === 0 && fut.opened === 0 && fut.gen.every(n => n === 0) && (fut.expectOpen ? JSON.stringify(fut.open) === '["NQ"]' : fut.open.length === 0), JSON.stringify(fut));
  ok('Zeilen zeigen offene Trades nur als „Offen“ ohne P&L', rows.filter(r => r.open).every(r => !/€/.test(r.txt)) && rows.filter(r => r.open).length === fut.open.length);

  /* 3. Trade-Detail NQ mit Sprachnotiz ohne Audio */
  const vid = await p.evaluate(() => (Store.trades().find(t => t.symbol === 'NQ' && (t.voiceNotes || []).some(v => v.analysis && v.analysis.setup === 'Pullback')) || {}).id);
  await go('#/trades/' + vid, 700);
  const vtxt = await content();
  ok('NQ-Trade mit Sprachnotiz: Transkript, Stimmung, Vorschläge, kein Audio-Player, keine Fehler', !!vid && (await p.$$('.voice')).length === 1 && !(await p.$('.voice audio')) && vtxt.includes('24 s') && vtxt.includes('Pullback') && !!(await p.$('.voice .voice-sugs')) && !vtxt.includes('Keine Transkription') && errs.length === 0, errs.join(' | '));
  ok('Trade-Detail zeigt Stück × Punktwert (NQ: 20) und Screenshot-Karten', vtxt.includes('× 20') && vtxt.includes('Screenshot vor Entry'));
  ok('Breach-Trade (FTMO) mit Sprachnotiz und drei Fehler-Tags', await p.evaluate(() => { const b = Store.propBreaches()[0]; const t = Store.getTrade(b.tradeId); return !!t && t.voiceNotes.length === 1 && t.mistakes.length === 3 && t.propAccountIds.includes(b.accountId); }));
  const ftmo = await p.evaluate(() => { const list = Store.tradesForPropAccount('smpa-ftmo'); const b = Store.getTrade(Store.propBreaches()[0].tradeId); const acc = Store.propAccounts().find(a => a.id === 'smpa-ftmo'); return { n: list.length, syms: [...new Set(list.map(t => t.symbol))].sort(), breach: b.symbol + ' ×' + b.quantity, market: acc.market, mnqMax: Math.max(...Store.trades().filter(t => t.symbol === 'MNQ').map(t => t.quantity)), nqes: Store.trades().filter(t => ['NQ', 'ES'].includes(t.symbol)).every(t => t.quantity >= 1 && t.quantity <= 3) }; });
  ok('FTMO (Forex / CFD) bekommt nur DAX/EURUSD/AAPL-Trades, Breach-Trade ist DAX ×75; MNQ höchstens 5, NQ/ES 1–3 Kontrakte', ftmo.n >= 20 && ftmo.syms.every(x => ['DAX', 'EURUSD', 'AAPL'].includes(x)) && ftmo.syms.includes('DAX') && ftmo.breach === 'DAX ×75' && ftmo.market === 'forex' && ftmo.mnqMax <= 5 && ftmo.nqes, JSON.stringify(ftmo));

  /* 4. Prop Firms */
  await go('#/prop', 600);
  const cards = await p.$$eval('.prop-card', els => els.map(e => ({ st: [...e.classList].find(c => ['active', 'passed', 'breached', 'archived'].includes(c)), ampel: e.querySelector('.prop-ampel').dataset.ampel, firm: e.querySelector('.prop-head b').textContent, txt: e.textContent })));
  ok('Cockpit mit 4 Konten: Topstep, Apex, FTMO (geplatzt), MyFundedFutures (archiviert)', cards.length === 4 && cards.filter(c => c.st === 'breached').length === 1 && cards.filter(c => c.st === 'archived').length === 1 && cards.some(c => c.firm === 'Topstep') && cards.some(c => c.firm.includes('Apex')) && cards.some(c => c.firm === 'FTMO'), cards.map(c => `${c.firm}:${c.st}:${c.ampel}`).join(', '));
  ok('Ampeln: aktive Konten grün/gelb, keine Verletzung bei Topstep/Apex, Breach-Konto geplatzt', cards.filter(c => c.st === 'active').every(c => ['gruen', 'gelb'].includes(c.ampel) && !c.txt.includes('Regel verletzt')) && cards.find(c => c.st === 'breached').txt.includes('Geplatzt'));
  const topTxt = cards.find(c => c.firm === 'Topstep').txt; const prog = (topTxt.match(/Ziel\s*(\d+)\s*%/) || [])[1];
  ok('Topstep: Fortschritt ~40 % zum Ziel, Challenge 1', prog != null && Number(prog) >= 30 && Number(prog) <= 55 && topTxt.includes('Challenge 1'), `${prog} %`);
  ok('Apex: Funded, „Nächster Payout“ in der Karte', cards.find(c => c.firm.includes('Apex')).txt.includes('Funded') && cards.find(c => c.firm.includes('Apex')).txt.includes('Nächster Payout'));
  ok('Kacheln: 2 aktive Konten, 1 geplatzt; Copy-Trading-Gruppe sichtbar', (await p.textContent('.prop-tiles')).includes('Aktive Konten') && (await p.$$('.prop-group-title')).length === 1 && (await p.textContent('.prop-group-title')).includes('Copy'));
  await p.screenshot({ path: 'sample-prop.png', fullPage: true });
  await go('#/prop/bilanz', 600);
  const tiles = (await p.$$eval('.prop-tiles .tile', els => els.map(e => ({ k: e.querySelector('.head span').textContent.trim(), v: e.querySelector('.val').textContent.trim() })))).map(t => ({ k: norm(t.k), v: norm(t.v) }));
  ok('Bilanz: Netto positiv, ROI in %, Ausgaben (8) und Payouts (3) gelistet', tiles[0].k.startsWith('Netto') && /^\d/.test(tiles[0].v) && tiles[1].k.startsWith('ROI') && /^\d+ %/.test(tiles[1].v) && (await p.$$('form[data-action=prop-expense-add] ~ .tbl-wrap tbody tr')).length === 8 && (await p.$$('form[data-action=prop-payout-add] ~ .tbl-wrap tbody tr')).length === 3 && (await content()).includes('Beantragt'), tiles.map(t => `${t.k}=${t.v}`).join(' | '));
  await go('#/prop/payout', 600);
  await p.selectOption('#pp-acc-sel', 'smpa-apex'); await p.waitForTimeout(400);
  const ptxt = await content();
  ok('Payout-Planer in der Bilanz (Apex, funded): Payout-Bedingungen und Payout-Verlauf mit 3 Einträgen', ptxt.includes('Payout-Bedingungen') && ptxt.includes('Payouts dieses Kontos') && (await p.$$('.tbl-wrap.inset tbody tr')).length === 3);
  await go('#/prop/friedhof', 600);
  const gtxt = await content();
  ok('Friedhof: ein Grabstein (FTMO) mit Ursache Daily Loss, Lebensdauer und Trade-Link', (await p.$$('.prop-grave')).length === 1 && gtxt.includes('FTMO') && gtxt.includes('Daily Loss') && gtxt.includes('gelebt') && !!(await p.$('.prop-grave a[href^="#/trades/"]')) && gtxt.includes('Serie davor') && /Verlusttrade/.test(gtxt));
  await p.click('.prop-grave .pg-front .pg-turn'); await p.waitForTimeout(850); /* Trade-Link steht auf der Rückseite */
  await p.click('.prop-grave a[href^="#/trades/"]'); await p.waitForTimeout(600);
  ok('Trade-Link öffnet den auslösenden Trade (DAX, Verlust)', (await p.textContent('.topbar h1')) === 'Trade' && (await p.textContent('.detail-head .sym')) === 'DAX' && !!(await p.$('.detail-head .pill.loss, .detail-head [class*=loss]')));
  ok('FTMO-Karte im Cockpit zeigt „Forex / CFD“', cards.find(c => c.firm === 'FTMO').txt.includes('Forex / CFD'));
  ok('Auswertung nur noch mit Bilanz und Friedhof (Simulation und Vergleich entfallen)', await (async () => { await go('#/prop/simulation', 500); return (await p.$$eval('.prop-sub a', els => els.map(e => e.textContent.trim()).join(','))) === 'Bilanz,Friedhof' && !(await p.$('.prop-sim-result, .prop-cmp')); })());

  /* 5. Blind-Replay */
  await go('#/replay', 700);
  const rtxt = await content(); const nShots = Number((rtxt.match(/(\d+) Trades bereit/) || [])[1]);
  ok('Replay-Übersicht: ≥ 25 Trades mit Screenshot, richtig eingeschätzt > 0, 2 Runden, Lernstand belegt', nShots >= 25 && /Richtig eingeschätzt\s*\d+ %\s*\d+ von 20 Trades/.test(rtxt) && /Runden\s*2/.test(rtxt) && /Zum Üben\s*\d+/.test(rtxt), `${nShots} Trades`);
  ok('Setup-Balken und Verlauf als Säulen (zwei Runden)', (await p.$$('.replay-bars .rb-row')).length >= 2 && (await p.$$('.rh-rounds i')).length === 2);
  await p.screenshot({ path: 'sample-replay.png', fullPage: true });
  await p.click('[data-action=replay-start]'); await p.waitForTimeout(400);
  await p.waitForFunction(() => { const i = document.querySelector('.replay-shot img'); return i && i.src && i.src.startsWith('blob:') && i.complete && i.naturalWidth > 0; }, null, { timeout: 5000 }).catch(() => {});
  const img = await p.$eval('.replay-shot img', i => ({ src: i.src.slice(0, 5), w: i.naturalWidth, h: i.naturalHeight }));
  ok('Session: Bild aus IndexedDB (blob:, 720×405)', img.src === 'blob:' && img.w === 720 && img.h === 405, JSON.stringify(img));
  await p.click('[data-action=replay-decide][data-value=take]'); await p.waitForTimeout(400);
  ok('Auflösung zeigt „So ging es weiter“ mit zweitem Bild', /so ging es weiter/i.test(await content()) && (await p.$$('.replay-card .shots img')).length >= 1);
  await p.screenshot({ path: 'sample-replay-card.png' });
  await p.click('[data-action=replay-abort]'); await p.waitForTimeout(300);

  /* 6. Schatten-Ich */
  await go('#/shadow', 600);
  /* Beispieldaten schalten die Vorschlagsregeln ein (gemerkt in settings.sampleShadowRules, protokolliert); der Knopf „Vorschlag übernehmen“ erscheint deshalb nicht */
  ok('Schatten-Ich: Vorschlagsregeln mit den Beispieldaten aktiv, gemerkt und im Verlauf protokolliert, kein Vorschlag-Knopf', await p.evaluate(() => ['maxTrades', 'lossStreak', 'cooldown'].every(k => Store.shadowRules()[k] && Store.shadowRules()[k].on) && Store.settings.sampleShadowRules === true && Store.data.logs.some(l => l.type === 'Schatten-Ich' && l.source === 'Beispieldaten' && /eingeschaltet/.test(l.action))) && !(await p.$('[data-action=shadow-preset]')));
  /* Zeitraum kommt aus der Kopfreihe: kurz auf „Gesamt“, danach wieder wie vorher */
  const prevRange = await p.evaluate(() => { const r = Store.settings.range; Store.setSetting('range', { preset: 'all', from: null, to: null }); App.rerender(); return r || null; }); await p.waitForTimeout(400);
  const viol = await p.$$eval('.shadow-tiles .tile', els => { const t = els.find(e => e.textContent.includes('Verstöße')); return t ? Number(t.querySelector('.val').textContent) : -1; });
  ok('Schatten-Ich mit Vorschlagsregeln: Verstöße > 0, Tabelle und Ranking', viol >= 8 && (await p.$$('.shadow-tbl tbody tr')).length >= 8 && (await p.$$('.shadow-rank .bar-row')).length >= 1, `${viol} Verstöße`);
  await p.screenshot({ path: 'sample-shadow.png', fullPage: true });
  await p.evaluate(r => { if (r) Store.setSetting('range', r); else { delete Store.settings.range; Store.save(); } App.rerender(); }, prevRange);

  /* 7. Einstellungen → Beispieldaten entfernen → alles leer; vorher ein eigener Check-in auf einem Beispiel-Tag über die Tagesansicht */
  const editKey = await p.evaluate(() => Object.keys(Store.data.days).filter(k => Store.data.days[k].sample && Store.data.days[k].checkIn)[20]);
  await go('#/day/' + editKey, 600);
  if (await p.$('[data-action=check-in]')) { await p.click('[data-action=check-in]'); await p.waitForTimeout(300); }
  const viaUi = !!(await p.$('form[data-action=save-checkin] [name=note]'));
  if (viaUi) { await p.evaluate(() => { const d = document.querySelector('form[data-action=save-checkin] details'); if (d) d.open = true; }); await p.fill('form[data-action=save-checkin] [name=note]', 'EIGENER CHECK-IN'); await p.click('form[data-action=save-checkin] button[type=submit]'); await p.waitForTimeout(300); }
  else await p.evaluate(k => { Store.setDay(k, { checkIn: Object.assign({}, Store.data.days[k].checkIn, { note: 'EIGENER CHECK-IN', goal: '', createdAt: new Date().toISOString() }) }); }, editKey);
  ok('Tagesansicht: Check-in auf einem Beispiel-Tag bearbeitet (Tag bleibt als Beispiel-Tag markiert)', await p.evaluate(k => Store.data.days[k].checkIn.note === 'EIGENER CHECK-IN' && Store.data.days[k].sample === true, editKey), viaUi ? 'über das Formular' : 'über Store.setDay');
  await go('#/settings/profil', 600);
  ok('Einstellungen nennen Prop-Konten, Replay-Screenshots, Sprachnotizen und die Vorschlagsregeln', (await content()).includes('Prop-Konten') && (await content()).includes('Replay-Screenshots') && (await content()).includes('Sprachnotizen') && (await content()).includes('Vorschlagsregeln') && !!(await p.$('[data-action=remove-sample]')));
  await p.click('[data-action=remove-sample]'); await p.waitForTimeout(900);
  const c2 = await counts(); const b2 = await blobCount();
  ok('Entfernen: Trades, Prop-Konten, Ausgaben, Payouts, Breaches, Replay-Verlauf, Notizen und Blobs leer; nur der Tag mit dem eigenen Check-in bleibt', c2.trades === 0 && c2.acc === 0 && c2.ex === 0 && c2.po === 0 && c2.br === 0 && c2.hist === 0 && c2.days === 1 && c2.notes === 0 && b2 === 0 && (await p.evaluate(() => Store.settings.sampleInstalled === false)) && !!(await p.$('[data-action=install-sample]')), JSON.stringify(c2) + ` blobs ${b2}`);
  const kept = await p.evaluate(k => { const d = Store.data.days[k]; return d ? { note: d.checkIn && d.checkIn.note, sample: d.sample, fields: d.sampleFields, regime: d.regime, rules: d.rulesFollowed } : null; }, editKey);
  ok('Entfernen: bearbeiteter Check-in bleibt, Beispiel-Marktphase/-Häkchen und Beispiel-Markierung sind weg', !!kept && kept.note === 'EIGENER CHECK-IN' && kept.sample === undefined && kept.fields === undefined && kept.regime === undefined && kept.rules === undefined, JSON.stringify(kept));
  ok('Entfernen: Vorschlagsregeln des Schatten-Ichs wieder aus, Merker weg, protokolliert', await p.evaluate(() => !Object.values(Store.shadowRules()).some(r => r.on) && Store.settings.sampleShadowRules === undefined && Store.data.logs.some(l => l.type === 'Schatten-Ich' && /ausgeschaltet/.test(l.action))));

  /* 8. Erneut laden → identische Anzahl (Determinismus) */
  await p.click('[data-action=install-sample]'); await p.waitForTimeout(300);
  const imgs2 = await p.evaluate(() => Store.sampleImages); const c3 = await counts(); const b3 = await blobCount();
  ok('Erneut laden: identische Anzahl Trades/NQ/ES/Konten/Karten/Screenshots/Blobs', JSON.stringify(c3) === JSON.stringify(c1) && imgs2 === imgs && b3 === b1, `${JSON.stringify(c3)} vs ${JSON.stringify(c1)}; Bilder ${imgs2}/${imgs}, Blobs ${b3}/${b1}`);
  const ids = await p.evaluate(() => ({ a: Store.trades().slice(0, 5).map(t => t.id + ':' + t.entryPrice + ':' + t.exitPrice).join(','), br: Store.propBreaches()[0].tradeId }));
  ok('Erneut laden: gleiche Trade-IDs und Kurse, Breach zeigt auf denselben Trade', ids.a.includes('smp1:') && ids.br === (await p.evaluate(() => Store.propBreaches()[0].tradeId)) && (await p.evaluate(() => !!Store.getTrade(Store.propBreaches()[0].tradeId))));
  ok('Erneut laden: eigener Check-in gewinnt gegen den Beispiel-Check-in desselben Tages, Tag trägt die neuen Beispiel-Felder', await p.evaluate(k => { const d = Store.data.days[k]; return d.checkIn.note === 'EIGENER CHECK-IN' && d.sample === true && !!d.regime && !!d.sampleFields.regime && !d.sampleFields.checkIn; }, editKey));
  /* Nutzer ändert das Regelwerk nach dem Laden → Entfernen lässt es stehen */
  await p.evaluate(() => { const r = Store.shadowRules(); r.cooldown.on = false; r.maxTrades.value = 4; Store.setShadowRules(r); });
  await p.evaluate(() => { Store.removeSample(); }); await p.waitForTimeout(600);
  ok('Entfernen nach geändertem Regelwerk: Regeln bleiben wie vom Nutzer gesetzt (maxTrades 4, lossStreak an, cooldown aus)', await p.evaluate(() => { const r = Store.shadowRules(); return r.maxTrades.on && r.maxTrades.value === 4 && r.lossStreak.on && !r.cooldown.on && Store.settings.sampleShadowRules === undefined && Object.keys(Store.data.days).length === 1; }));
  await p.evaluate(() => { Store.setShadowRules(Shadow.defaultRules()); delete Store.data.days[Object.keys(Store.data.days)[0]]; Store.saveNow(); });

  /* 9. Upgrade-Pfad: alte Daten (sampleInstalled, kein sampleVersion, alte Trades) → nach Reload neue Daten, eigener Trade bleibt */
  await p.evaluate(() => {
    const own = { id: 'own1', accountId: 'main', symbol: 'DAX', direction: 1, openedAt: '2026-01-05T09:00:00.000Z', closedAt: '2026-01-05T10:00:00.000Z', entryPrice: 18000, exitPrice: 18020, quantity: 1, multiplier: 1, fees: 1, screenshots: [], voiceNotes: [], propAccountIds: ['smpa-apex'], notes: 'eigener Trade' };
    const old = { id: 'smpold', accountId: 'main', symbol: 'DAX', direction: 1, openedAt: '2026-02-02T09:00:00.000Z', closedAt: '2026-02-02T10:00:00.000Z', entryPrice: 18000, exitPrice: 18010, quantity: 1, multiplier: 1, fees: 1, sample: true, screenshots: [], voiceNotes: [] };
    const keys = Object.keys(Sample.generate({ accountId: 'main' }).days); const days = { '2026-02-02': { key: '2026-02-02', sample: true } };
    days[keys[40]] = { key: keys[40], sample: true, regime: { trend: 'up', vol: 'low' }, checkIn: { sleep: 8, stress: 1, mood: 5, note: 'EIGENER CHECK-IN auf einem v1-Beispiel-Tag' } };
    days[keys[41]] = { key: keys[41], sample: true, checkIn: { sleep: 7, stress: 2, mood: 4, note: '', createdAt: new Date(Core.parseDayKey(keys[41]).getTime() + 8 * 3600000).toISOString() } };
    window.__keys = keys;
    localStorage.setItem('trading-journal-web-v1', JSON.stringify({ version: 1, settings: { sampleInstalled: true, onboarded: true, theme: 'dark' }, trades: [old, own], days, notes: [], rules: [{ id: 'r9', text: 'Eigene Regel', active: true }] }));
  });
  const upKeys = await p.evaluate(() => window.__keys);
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
  const up = await p.evaluate(() => ({ v: Store.settings.sampleVersion, inst: Store.settings.sampleInstalled, own: !!Store.getTrade('own1'), ownProp: (Store.getTrade('own1') || {}).propAccountIds, old: !!Store.getTrade('smpold'), nq: Store.trades().filter(t => t.symbol === 'NQ').length, acc: Store.propAccounts().length, rule: Store.data.rules.some(r => r.text === 'Eigene Regel'), oldDay: !!Store.data.days['2026-02-02'], total: Store.trades().length }));
  const imgs3 = await p.evaluate(() => Store.sampleImages);
  ok('Upgrade: neue Beispieldaten installiert (sampleVersion 3), alter Beispiel-Trade weg, eigener Trade und eigene Regel bleiben, Bilder nachgelaufen', up.v === 3 && up.inst && up.own && up.ownProp.length === 1 && !up.old && up.nq > 30 && up.acc === 4 && up.rule && !up.oldDay && up.total === c1.trades + 1 && imgs3 === imgs, JSON.stringify(up) + ` Bilder ${imgs3}`);
  ok('Upgrade: Verlauf protokolliert den Import der Beispieldaten', await p.evaluate(() => (Store.data.logs || []).some(l => l.source === 'Beispieldaten' && l.ident.includes('Prop-Konten'))));
  const upDays = await p.evaluate(ks => { const a = Store.data.days[ks[40]], b = Store.data.days[ks[41]]; return { ownNote: a && a.checkIn && a.checkIn.note, ownHasSample: !!(a && a.sample && a.regime && a.sampleFields && !a.sampleFields.checkIn), genReplaced: !!(b && b.sample && (!b.checkIn || b.sampleFields.checkIn)) }; }, upKeys);
  ok('Upgrade: eigener Check-in auf einem v1-Beispiel-Tag bleibt, generiert aussehender v1-Check-in (8:00 Uhr, ohne Ziel) wird ersetzt', upDays.ownNote === 'EIGENER CHECK-IN auf einem v1-Beispiel-Tag' && upDays.ownHasSample && upDays.genReplaced, JSON.stringify(upDays));
  ok('Upgrade: Vorschlagsregeln eingeschaltet und protokolliert (nicht stillschweigend)', await p.evaluate(() => Store.settings.sampleShadowRules === true && Store.data.logs.some(l => l.type === 'Schatten-Ich' && l.source === 'Beispieldaten')));
  await p.evaluate(() => { localStorage.setItem('trading-journal-web-v1', JSON.stringify({ version: 1, settings: { sampleInstalled: true, sampleVersion: 3, onboarded: true }, trades: [], logs: [] })); });
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(500);
  ok('Aktuelle Version wird beim Laden nicht erneut installiert', await p.evaluate(() => Store.trades().length === 0 && (Store.data.logs || []).length === 0));

  /* 10. Handy */
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700); await p.evaluate(() => Store.sampleImages);
  let wide = []; for (const h of ['#/dashboard', '#/trades', '#/prop', '#/prop/friedhof', '#/replay']) { await go(h, 500); const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 390) wide.push(`${h}:${w}`); }
  ok('Handy 390 px ohne horizontalen Überlauf', wide.length === 0, wide.join(','));

  console.log(out.join('\n')); console.log(`${out.filter(x => x.startsWith('PASS')).length}/${out.length} bestanden`); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e); process.exit(1); });
