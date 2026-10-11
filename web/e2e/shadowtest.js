const { chromium } = require('playwright');
const fs = require('fs');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/shadow-dev.html#/shadow';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
const ignore = m => /ERR_CERT|fonts\.googleapis|fonts\.gstatic|net::ERR|Error inlining remote css|Error loading remote stylesheet|Fetch API cannot load file|Error while reading CSS rules/.test(m); /* file:// und Google Fonts: nur in der Testumgebung */
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' }); /* Einblend-Animationen aus, damit Ganzseiten-Screenshots vollständig sind */ const p = await ctx.newPage();
  p.on('pageerror', e => { if (!ignore(e.message)) errs.push(e.message); }); p.on('console', m => { if (m.type() === 'error' && !ignore(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(500);
  /* Beispieldaten schalten die drei Vorschlagsregeln ein; die Suite beginnt bewusst ohne aktive Regel */
  await p.evaluate(() => { const r = Store.shadowRules(); for (const k of Object.keys(r)) if (r[k]) r[k].on = false; Store.setShadowRules(r); if (Store.saveNow) Store.saveNow(); }); await p.waitForTimeout(400); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(500);
  /* 1. Rendern, Leerzustand ohne aktive Regel */
  ok('Seite rendert mit Titel', (await p.textContent('.topbar h1')) === 'Schatten-Ich' && (await p.$$('.shadow-rule')).length === 7);
  ok('Keine Regel aktiv → Banner + Kacheln „—“', !!(await p.$('.banner.info')) && (await p.$eval('.shadow-main .val', e => e.textContent.trim())) === '—' && (await p.$$('.shadow-main')).length === 1 && !(await p.$('.shadow-tbl')));
  ok('Kopfreihe: Zeitraum + Konto, ohne „Trade loggen“ und Session', !!(await p.$('.page-head [data-pop=range]')) && !(await p.$('.page-head [data-action=new-trade]')) && !(await p.$('.page-head [data-action=start-session]')) && !(await p.$('.page-head .dh-tools')));
  ok('Kein zweiter Zeitraum-Schalter, keine Bildkarte', !(await p.$('[data-action=shadow-period]')) && !(await p.$('[data-action=shadow-card]')) && !(await p.$('.shadow-ctl')));
  /* 2. Regel einschalten → gespeichert, Zahlen da */
  await p.click('[data-action=shadow-rule-toggle][data-rule=maxTrades]'); await p.waitForTimeout(300);
  const r1 = await p.evaluate(() => JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => localStorage.getItem(k).includes('shadowRules')))).shadowRules);
  ok('Schalter speichert Regel (localStorage)', r1 && r1.maxTrades && r1.maxTrades.on === true && r1.maxTrades.value === 3, JSON.stringify(r1 && r1.maxTrades));
  ok('Schalter aria-checked', await p.$eval('[data-action=shadow-rule-toggle][data-rule=maxTrades]', e => e.getAttribute('aria-checked') === 'true'));
  const setRange = async preset => { await p.evaluate(k => { Store.setSetting('range', { preset: k, from: null, to: null }); App.rerender(); }, preset); await p.waitForTimeout(300); };
  await setRange('all');
  const t1 = await p.$$eval('.shadow-tiles .tile .val', els => els.map(e => e.textContent.trim()));
  ok('Kacheln zeigen Zahlen', t1.length === 4 && t1.every(x => x !== '—') && /€/.test(t1[1]) && /€/.test(t1[2]) && /^\d+$/.test(t1[3]), t1.join(' | '));
  const n1 = Number(t1[3]); const cost1 = await p.$eval('.shadow-main .val', e => e.textContent.trim());
  ok('Verstoßtabelle gefüllt (höchstens 10 je Seite)', (await p.$$('.shadow-tbl tbody tr')).length === Math.min(n1, 10) && n1 > 0 && (await p.$$eval('.shadow-tbl tbody tr', rows => rows.every(r => r.dataset.action === 'trade' && r.dataset.id && r.children.length === 6))));
  ok('Ranking mit Balken', (await p.$$('.shadow-rank .bar-row')).length === 1 && (await p.textContent('.shadow-rank .bar-row .bl')).includes('Max. Trades pro Tag') && (await p.textContent('.shadow-rank .bar-row .bl')).includes('×'));
  ok('Chart mit zwei Pfaden', (await p.$$('[data-id=shadow-curve] svg path')).length === 2 && (await p.$$('[data-id=shadow-curve] svg path[stroke="var(--accent)"]')).length === 1);
  /* 3. Feld ändern → andere Zahlen */
  await p.fill('input[data-change=shadow-rule-field][data-rule=maxTrades]', '1'); await p.press('input[data-change=shadow-rule-field][data-rule=maxTrades]', 'Enter'); await p.waitForTimeout(400);
  const r2 = await p.evaluate(() => Store.shadowRules().maxTrades); const n2 = Number(await p.$eval('.shadow-tiles .tile:nth-child(4) .val', e => e.textContent.trim())); const cost2 = await p.$eval('.shadow-main .val', e => e.textContent.trim());
  ok('Feld ändert Wert und Zahlen', r2.value === 1 && n2 > n1 && cost2 !== cost1, `${n1} → ${n2}, ${cost1} → ${cost2}`);
  ok('Feld zeigt gespeicherten Wert nach Neuaufbau', (await p.inputValue('input[data-change=shadow-rule-field][data-rule=maxTrades]')) === '1');
  /* 3b. Seiten wie im TradeLog */
  const rowsN = () => p.$$eval('.shadow-tbl tbody tr', r => r.length); const info = () => p.textContent('.shadow-detail .pager .pg-info');
  ok('Mehr als 10 Verstöße → 10 Zeilen + Seitenleiste', n2 > 10 && (await rowsN()) === 10 && (await info()).trim() === `1 – 10 von ${n2} Verstößen` && (await p.$eval('[data-action=shadow-page-nav][data-dir="-1"]', e => e.disabled)), await info());
  const firstId = await p.$eval('.shadow-tbl tbody tr', e => e.dataset.id);
  await p.click('[data-action=shadow-page-nav][data-dir="1"]'); await p.waitForTimeout(300);
  ok('Nächste Seite', (await info()).trim().startsWith('11 – ') && (await p.$eval('.shadow-tbl tbody tr', e => e.dataset.id)) !== firstId && (await p.inputValue('select[data-change=shadow-page]')) === '2', await info());
  await p.selectOption('select[data-change=shadow-page-size]', '25'); await p.waitForTimeout(300);
  ok('25 je Seite, zurück auf Seite 1', (await rowsN()) === Math.min(n2, 25) && (await info()).trim().startsWith('1 – ') && (await p.inputValue('select[data-change=shadow-page]')) === '1');
  const pagesN = await p.$$eval('select[data-change=shadow-page] option', o => o.length);
  await p.selectOption('select[data-change=shadow-page]', String(pagesN)); await p.waitForTimeout(300);
  ok('Letzte Seite über Auswahl', (await rowsN()) === n2 - (pagesN - 1) * 25 && (await p.$eval('[data-action=shadow-page-nav][data-dir="1"]', e => e.disabled)), `${pagesN} Seiten`);
  await p.selectOption('select[data-change=shadow-page-size]', '10'); await p.waitForTimeout(300);
  /* 4. Weitere Regeltypen: Einheit, Uhrzeit, Setups */
  await p.click('[data-action=shadow-rule-toggle][data-rule=dailyLoss]'); await p.waitForTimeout(300);
  ok('Einheit-Select mit drei Optionen', (await p.$$eval('select[data-rule=dailyLoss] option', o => o.map(x => x.textContent))).join('|') === 'R-Einheit|% vom Konto|Betrag (€)');
  await p.selectOption('select[data-rule=dailyLoss][data-field=unit]', 'pct'); await p.waitForTimeout(300);
  ok('Einheit gespeichert', await p.evaluate(() => Store.shadowRules().dailyLoss.unit === 'pct' && Store.shadowRules().dailyLoss.on === true));
  await p.click('[data-action=shadow-rule-toggle][data-rule=hours]'); await p.waitForTimeout(300); await p.fill('input[type=time][data-rule=hours][data-field=to]', '11:00'); await p.press('input[type=time][data-rule=hours][data-field=to]', 'Tab'); await p.waitForTimeout(400);
  /* Bei „max. 1 Trade/Tag“ war jeder Trade nach 11:00 schon ein Verstoß – die Zahl bleibt, aber der Grund wechselt zur Zeitregel (steht vorn in der Prüfreihenfolge) */
  const hoursRow = await p.$$eval('.shadow-rank .bar-row', rows => rows.map(r => r.textContent).find(t => t.includes('Erlaubte Handelszeiten')) || '');
  ok('Uhrzeit gespeichert und wirkt', await p.evaluate(() => Store.shadowRules().hours.to === '11:00') && /[1-9]\d*×/.test(hoursRow) && (await p.textContent('.shadow-tbl')).includes('Erlaubte Handelszeiten'), hoursRow.replace(/\s+/g, ' '));
  ok('Ranking jetzt drei Regeln, sortiert', (await p.$$('.shadow-rank .bar-row')).length === 3);
  await p.click('[data-action=shadow-rule-toggle][data-rule=setups]'); await p.waitForTimeout(300);
  ok('Setup-Chips + Hinweis ohne Auswahl', (await p.$$('[data-action=shadow-setup-toggle]')).length >= 5 && (await p.textContent('.shadow-rule.on .shadow-hint') || '').includes('Kein Setup gewählt'));
  await p.click('[data-action=shadow-setup-toggle][data-value=Pullback]'); await p.waitForTimeout(300);
  ok('Setup gespeichert + Chip gedrückt', await p.evaluate(() => JSON.stringify(Store.shadowRules().setups.list) === '["Pullback"]') && await p.$eval('[data-action=shadow-setup-toggle][data-value=Pullback]', e => e.getAttribute('aria-pressed') === 'true'));
  ok('„+ n weitere“ in der Tabelle', (await p.textContent('.shadow-tbl')).includes('weitere'));
  await p.click('[data-action=shadow-rule-toggle][data-rule=setups]'); await p.click('[data-action=shadow-rule-toggle][data-rule=maxRisk]'); await p.waitForTimeout(300);
  ok('Risiko-Regel: Hinweis zu Trades ohne Stop oder keiner', !(await p.textContent('#content')).includes('NaN'));
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(500);
  ok('Regeln bleiben nach Neuladen', await p.evaluate(() => { const r = Store.shadowRules(); return r.maxTrades.on && r.maxTrades.value === 1 && r.hours.to === '11:00' && r.dailyLoss.unit === 'pct'; }) && (await p.$$('[data-action=shadow-rule-toggle][aria-checked=true]')).length === 4);
  /* Zeitraum kommt aus der Kopfreihe (gespeichert wie auf allen Seiten) */
  ok('Zeitraum oben gilt nach Neuladen', (await p.textContent('.shadow-main .head .n')) === 'Gesamt');
  const tAll = await p.$$eval('.shadow-tiles .tile .val', els => els.map(e => e.textContent.trim())); const nTradesAll = await p.$eval('.shadow-tiles .tile:nth-child(2) .head .n', e => parseInt(e.textContent, 10));
  await setRange('last30');
  const t30 = await p.$$eval('.shadow-tiles .tile .val', els => els.map(e => e.textContent.trim())); const nTrades30 = await p.$eval('.shadow-tiles .tile:nth-child(2) .head .n', e => parseInt(e.textContent, 10));
  const exp30 = await p.evaluate(() => { const rg = App.range(); return Core.closedOnly(App.allTrades()).filter(t => t.close >= rg.from && t.close <= rg.to).length; });
  const curve30 = await p.evaluate(() => { const pts = UI.chartData['shadow-curve'].points; const rg = App.range(); return { n: pts.length, inside: pts.every(x => x.date >= rg.from && x.date <= rg.to) }; });
  ok('Letzte 30 Tage: Label, Trades, Verstöße und Kurve gefiltert', (await p.textContent('.shadow-main .head .n')) === (await p.evaluate(() => App.range().label)) && nTrades30 === exp30 && nTrades30 < nTradesAll && Number(t30[3]) <= Number(tAll[3]) && curve30.n === nTrades30 && curve30.inside, `${nTradesAll} → ${nTrades30} Trades (erwartet ${exp30}), Verstöße ${tAll[3]} → ${t30[3]}, Kurve ${JSON.stringify(curve30)}, Label ${await p.textContent('.shadow-main .head .n')}`);
  const sumOk = await p.evaluate(() => { const pts = UI.chartData['shadow-curve'].points; const rg = App.range(); const all = App.allTrades(); const byId = new Map(all.map(t => [t.id, t])); const res = ShadowScreen.evaluate(all); const rows = res.trades.filter(r => { const t = byId.get(r.id); return t && t.close >= rg.from && t.close <= rg.to; }); const real = rows.reduce((a, r) => a + r.realPnl, 0), shadow = rows.reduce((a, r) => a + r.shadowPnl, 0); const last = pts[pts.length - 1].v; return { ok: Math.abs(last.real - real) < 0.01 && Math.abs(last.shadow - shadow) < 0.01, last, real, shadow }; });
  ok('Kurve beginnt im Zeitraum bei 0 (Ende = Summe im Zeitraum)', sumOk.ok, JSON.stringify(sumOk));
  await setRange('all');
  await p.screenshot({ path: 'shadow-desktop.png', fullPage: true });
  /* 5. Zeile → Trade */
  await p.click('.shadow-tbl tbody tr'); await p.waitForTimeout(400); ok('Klick auf Zeile öffnet Trade', (await p.evaluate(() => location.hash)).startsWith('#/trades/'));
  await p.evaluate(() => { location.hash = '#/shadow'; }); await p.waitForTimeout(500);
  /* 7. Handy */
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(() => { location.hash = '#/shadow'; }); await p.waitForTimeout(600);
  const over = await p.evaluate(() => { const w = document.documentElement.scrollWidth; let worst = 0, who = ''; document.querySelectorAll('#content, #content *').forEach(e => { if (e.closest('.tbl-wrap')) return; const r = e.getBoundingClientRect(); if (r.right - 390 > worst) { worst = r.right - 390; who = e.tagName.toLowerCase() + '.' + (e.className.baseVal !== undefined ? e.className.baseVal : e.className); } }); return { w, worst: Math.round(worst), who }; });
  ok('Handy 390 px ohne Überlauf', over.w <= 390 && over.worst <= 0, JSON.stringify(over));
  await p.screenshot({ path: 'shadow-phone.png', fullPage: true });
  /* 8. Geld-blind-Modus */
  await p.setViewportSize({ width: 1440, height: 1000 }); await p.evaluate(() => { Store.setSetting('moneyBlind', true); App.rerender(); }); await p.waitForTimeout(500);
  const pageText = await p.evaluate(() => document.querySelector('#main').innerText);
  ok('Geld-blind: kein € auf der Seite, R statt Geld', !pageText.includes('€') && / R\b/.test(await p.$eval('.shadow-main .val', e => e.textContent)) && (await p.$$eval('select[data-rule=dailyLoss] option', o => o.map(x => x.textContent))).join('|') === 'R-Einheit|% vom Konto|Betrag', pageText.match(/.{0,20}€.{0,20}/g) ? pageText.match(/.{0,20}€.{0,20}/g).slice(0, 3).join(' / ') : '');
  /* 9. Leerzustand ohne Trades */
  await p.evaluate(() => { Store.data.trades = []; Store.saveNow(); App.rerender(); }); await p.waitForTimeout(400);
  ok('Ohne Trades: Leerzustand + Regelwerk bleibt', !!(await p.$('.empty')) && (await p.textContent('.empty b')) === 'Noch keine abgeschlossenen Trades' && (await p.$$('.shadow-rule')).length === 7);
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
