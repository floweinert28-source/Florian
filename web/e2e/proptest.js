const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/prop-dev.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
const ignore = m => /ERR_CERT|fonts\.googleapis|fonts\.gstatic|net::ERR|Error inlining remote css|Error loading remote stylesheet|Fetch API cannot load file|Error while reading CSS rules/.test(m);
const norm = s => String(s || '').replace(/\u00a0/g, ' ');
const canon = o => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((a, x) => (a[x] = v[x], a), {}) : v);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
  p.on('pageerror', e => { if (!ignore(e.message)) errs.push(e.message); }); p.on('console', m => { if (m.type() === 'error' && !ignore(m.text())) errs.push('console: ' + m.text()); });
  const go = async (tab) => { await p.evaluate(t => { location.hash = '#/prop/' + t; }, tab); await p.waitForTimeout(450); };
  const content = () => p.evaluate(() => document.getElementById('content').innerText);
  await p.goto(base + '#/prop', { waitUntil: 'load' }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  /* Beispieldaten v2 bringen vier Prop-Konten mit Zuordnungen, Ausgaben, Payouts und Breach mit; diese Suite baut ihre Konten selbst ab dem Leerzustand auf */
  await p.evaluate(() => { Store.data.propAccounts = []; Store.data.propExpenses = []; Store.data.propPayouts = []; Store.data.propBreaches = []; for (const t of Store.trades()) t.propAccountIds = []; Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(300);

  /* 1. Leerzustand */
  ok('Seite rendert mit Titel und einer Leiste (Übersicht, Bilanz, Friedhof, Konten), kein Zeitraum/Konto, leer ohne Kopf-Werkzeuge', (await p.textContent('.topbar h1')) === 'Prop Firms' && /^Übersicht,Bilanz,(Friedhof,)?Konten$/.test(await p.$$eval('.page-head .prop-tabs a', els => els.map(e => e.textContent.trim()).join(','))) && !(await p.$('.prop-sub')) && !(await p.$('.page-head [data-action=new-trade], .page-head [data-action=prop-account-new], .page-head .session-ctl')) && (await p.$eval('.prop-tabs a[aria-pressed=true]', e => e.textContent.trim())) === 'Übersicht' && !(await p.$('.page-head [data-pop=range]')) && !(await p.$('.page-head [data-pop=account]')));
  ok('Leerzustand mit Knopf „Konto anlegen“', !!(await p.$('.empty [data-action=prop-account-new]')) && (await p.textContent('.empty b')) === 'Noch keine Prop-Konten' && (await p.textContent('.empty')).includes('Lege dein erstes Prop-Konto an') && (await p.$$('[data-action=prop-account-new]')).length === 1);

  /* 2. Konto aus eigenem Preset anlegen (eingebaute Firmen-Presets erscheinen nicht mehr) */
  await p.click('.empty [data-action=prop-account-new]'); await p.waitForTimeout(300);
  ok('Ohne eigene Presets: Konto-Dialog ohne Preset-Auswahl, Hinweiszeile, Kernregeln vorn, Rest unter „Mehr Optionen“ (zu), Anlegen im Bild', !(await p.$('.modal #pa-preset')) && !(await p.$('.modal .banner.info')) && (await p.textContent('.modal .prop-snap')).includes('Momentaufnahme') && (await p.$$eval('.modal .prop-rules-main .field', els => els.filter(e => !e.hidden).map(e => e.querySelector('span').textContent.trim()).join(','))) === 'Daily Loss,Max. Drawdown,Drawdown-Typ,Profit Target' && !!(await p.$('.modal details.prop-more:not([open])')) && !!(await p.$('.modal .prop-more #pa-status')) && await p.evaluate(() => { const b = document.querySelector('.modal button[type=submit]').getBoundingClientRect(); return b.bottom <= innerHeight && b.top >= 0; }) && (await p.evaluate(() => Store.propPresets().length)) === 0);
  await p.selectOption('.modal #pa-phase', 'funded'); await p.selectOption('.modal [name=dd_type]', 'trailing_lock'); await p.waitForTimeout(150);
  ok('Phase Funded zeigt Payout-Bedingungen statt Profit Target; Lock-Felder nur bei „Trailing mit Lock“', await p.evaluate(() => { const f = document.querySelector('.modal form'); const vis = n => !f.elements[n].closest('.field').hidden; return !vis('pt_value') && vis('po_minDays') && vis('po_minProfit') && vis('dd_lock') && vis('dd_basis'); }));
  await p.selectOption('.modal #pa-phase', 'challenge1'); await p.selectOption('.modal [name=dd_type]', 'static'); await p.waitForTimeout(150);
  ok('Zurück auf Challenge: Profit Target wieder vorn, Lock verborgen', await p.evaluate(() => { const f = document.querySelector('.modal form'); const vis = n => !f.elements[n].closest('.field').hidden; return vis('pt_value') && !vis('po_minDays') && !vis('dd_lock'); }));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.evaluate(() => { const c = JSON.parse(JSON.stringify(PropData.PRESETS.find(x => x.id === 'ftmo-100k'))); Store.addPropFirm(c); App.rerender(); }); await p.waitForTimeout(300);
  await p.click('.empty [data-action=prop-account-new]'); await p.waitForTimeout(300);
  ok('Mit eigenem Preset: Auswahl erscheint (nach Firma gruppiert)', !!(await p.$('.modal #pa-preset')) && (await p.$$('.modal #pa-preset optgroup')).length === 1 && (await p.$$('.modal #pa-preset option')).length === 2);
  await p.selectOption('#pa-preset', 'ftmo-100k'); await p.waitForTimeout(250);
  const filled = await p.evaluate(() => { const f = document.querySelector('.modal form'); const v = n => f.elements[n].value; return { firm: v('firm'), name: v('name'), size: v('size'), market: v('market'), cur: v('currency'), dl: v('dl_value'), dlm: v('dl_mode'), dlb: v('dl_basis'), dltz: v('dl_tz'), dd: v('dd_value'), ddm: v('dd_mode'), ddt: v('dd_type'), pt: v('pt_value'), ptm: v('pt_mode'), md: v('minDays'), split: v('profitSplit'), sb: v('startBalance') }; });
  ok('Preset füllt alle Regelfelder vor', filled.firm === 'FTMO' && filled.name === '100K' && filled.size === '100000' && filled.market === 'forex' && filled.cur === 'USD' && filled.dl === '5' && filled.dlm === 'pct' && filled.dlb === 'equity' && filled.dltz === 'Europe/Prague' && filled.dd === '10' && filled.ddm === 'pct' && filled.ddt === 'static' && filled.pt === '10' && filled.ptm === 'pct' && filled.md === '4' && filled.split === '80' && filled.sb === '100000', JSON.stringify(filled));
  ok('Hinweis „unverifiziert“ beim gewählten Preset', (await p.textContent('#pa-preset-hint')).includes('unverifiziert'));
  await p.click('.modal .prop-more > summary'); await p.fill('#pa-group', 'Copy A'); await p.fill('#pa-size', '100000'); /* bleibt editierbar */
  await p.click('.modal form button[type=submit]'); await p.waitForTimeout(450);
  const acc = await p.evaluate(() => Store.propAccounts()[0]); const preset = await p.evaluate(() => Store.propPresets().find(x => x.id === 'ftmo-100k'));
  ok('Konto gespeichert: Firma, Größe, Gruppe, Regel-Snapshot identisch zum Preset', !!acc && acc.firmId === 'ftmo-100k' && acc.firm === 'FTMO' && acc.size === 100000 && acc.startBalance === 100000 && acc.group === 'Copy A' && acc.phase === 'challenge1' && acc.status === 'active' && acc.tz === 'Europe/Prague' && acc.profitSplit === 0.8 && canon(acc.rules) === canon(preset.rules) && acc.payout && !!acc.id && !!acc.createdAt, JSON.stringify(acc && acc.rules).slice(0, 120));
  const snap = await p.evaluate(() => { const pr = Store.propPresets().find(x => x.id === 'ftmo-100k'); pr.rules.dailyLoss.value = 99; const v = Store.propAccounts()[0].rules.dailyLoss.value; pr.rules.dailyLoss.value = 5; return v; });
  ok('Snapshot: Preset-Änderung verändert das Konto nicht', snap === 5);
  ok('Cockpit zeigt Karte mit Firma, Phase, Status, Ampel, Balken', (await p.$$('.prop-card')).length === 1 && (await p.textContent('.prop-card')).includes('FTMO') && (await p.textContent('.prop-card .pills')).includes('Challenge 1') && !(await p.textContent('.prop-card .pills')).includes('Aktiv') && !!(await p.$('.prop-card .prop-ampel[data-ampel=gruen]')) && (await p.$$('.prop-card .prop-bar')).length === await p.evaluate(() => { const a = Store.propAccounts()[0]; const e = Prop.evaluate(a, Store.tradesForPropAccount(a.id), {}); return [e.dailyLoss, e.drawdown, e.target].filter(Boolean).length; }) && (await p.textContent('.prop-card .prop-bars')).includes('Ziel') && !(await p.textContent('.prop-card')).includes('keine Regel'));
  ok('Kacheln über den Karten', (await p.$$('.prop-tiles .tile')).length === 4 && (await p.textContent('.prop-tiles')).includes('Aktive Konten'));
  ok('Karte: Stift im Kopf, im Fuß nur „Trades zuordnen“; Kopfreihe mit „Trade loggen“ und „Konto anlegen“ als Textknopf', !!(await p.$('.prop-card .prop-head [data-action=prop-account-edit].icon')) && (await p.$$eval('.prop-card .prop-foot > *', els => els.map(e => e.textContent.trim()).join('|'))) === 'Trades zuordnen' && !!(await p.$('.page-head [data-action=new-trade]')) && !!(await p.$('.page-head .btn.ghost[data-action=prop-account-new]')) && !(await p.$('.page-head .session-ctl')));

  /* 3. Trades zuordnen */
  await p.click('.prop-card [data-action=prop-assign]'); await p.waitForTimeout(300);
  const nRows = (await p.$$('.prop-assign-row')).length; ok('Zuordnungs-Modal mit bis zu 50 Trades (Checkboxen)', nRows > 0 && nRows <= 50 && (await p.$$('.prop-assign-row input:checked')).length === 0, `${nRows} Zeilen`);
  await p.evaluate(() => { document.querySelectorAll('.prop-assign-row input').forEach((c, i) => { c.checked = i < 8; }); });
  await p.click('.modal form button[type=submit]'); await p.waitForTimeout(450);
  const assigned = await p.evaluate(() => Store.trades().filter(t => (t.propAccountIds || []).includes(Store.propAccounts()[0].id)).length);
  ok('8 Trades über S.assignTradesToPropAccount zugeordnet', assigned === 8, `${assigned}`);
  await p.click('.prop-card [data-action=prop-assign]'); await p.waitForTimeout(300);
  ok('Bereits zugeordnete Trades sind angehakt', (await p.$$('.prop-assign-row input:checked')).length === 8);
  await p.evaluate(() => { const c = document.querySelectorAll('.prop-assign-row input'); c[0].checked = false; }); await p.click('.modal form button[type=submit]'); await p.waitForTimeout(400);
  ok('Abhaken entfernt die Zuordnung', (await p.evaluate(() => Store.trades().filter(t => (t.propAccountIds || []).includes(Store.propAccounts()[0].id)).length)) === 7);
  const card = await p.evaluate(() => { const c = document.querySelector('.prop-card'); return { bal: c.querySelector('.prop-balance .val').textContent.trim(), pnl: c.querySelector('.prop-balance .val.sm').textContent.trim(), ampel: c.querySelector('.prop-ampel').dataset.ampel, bars: [...c.querySelectorAll('.prop-bar .track i')].map(i => i.style.width), stops: c.querySelector('.prop-stops').textContent.trim(), meta: c.querySelector('.prop-meta').textContent, n: c.querySelector('.prop-balance .small').textContent }; });
  const ev = await p.evaluate(() => { const a = Store.propAccounts()[0]; const tr = Store.tradesForPropAccount(a.id); return Prop.evaluate(a, tr, { stopSize: Prop.stopSize(tr, 0) }); });
  const balText = await p.evaluate(b => UI.fmt.cur(b, { currency: Store.propAccounts()[0].currency }), ev.balance); /* Balance in Kontowährung (USD), P&L in Journal-Währung */
  ok('Cockpit zeigt Balance, P&L, Ampel, Puffer in Stops, Fortschritt', card.bal === balText && card.bal.includes('$') && card.pnl.includes('€') && ['gruen', 'gelb', 'rot'].includes(card.ampel) && card.ampel === ev.buffer.ampel && card.bars.length === [ev.dailyLoss, ev.drawdown, ev.target].filter(Boolean).length && /noch \d+ Stop-Loss/.test(card.stops) && card.meta.includes('Bestehen') && card.n.includes(`${ev.n} Trades`), JSON.stringify(card));
  ok('Stops passen zur Engine', card.stops.includes(`noch ${ev.buffer.stops} Stop-Loss`), `${ev.buffer.stops}`);

  /* 4. Breach-Hinweis */
  await p.evaluate(() => { const a = Store.addPropAccount({ firmId: '', firm: 'Testfirma', name: 'Mini', market: 'futures', size: 1000, currency: 'EUR', phase: 'challenge1', status: 'active', startedAt: new Date().toISOString(), startBalance: 1000, rules: { dailyLoss: null, drawdown: { value: 1, mode: 'abs', type: 'static', lockAt: null, basis: 'intraday' }, profitTarget: { value: 100, mode: 'abs' }, minTradingDays: null, maxContracts: null, consistency: null }, payout: {}, profitSplit: 0.9, group: '', tz: 'UTC', note: '' }); const losses = Core.deriveAll(Store.trades()).filter(t => t.closed && t.pnl < -1).slice(0, 3).map(t => t.id); Store.assignTradesToPropAccount(losses, a.id, true); App.rerender(); }); await p.waitForTimeout(450);
  ok('Breach-Hinweis „Regel verletzt“ mit Knopf', (await p.$$('.prop-card')).length === 2 && !!(await p.$('.prop-card .banner.loss')) && (await p.textContent('.prop-card .banner.loss')).includes('Regel verletzt') && (await p.textContent('.prop-card .banner.loss')).includes('Max. Drawdown') && !(await p.$('.prop-card:has(.banner.loss) .prop-bars, .prop-card:has(.banner.loss) .prop-meta')) && !!(await p.$('[data-action=prop-mark-breached]')));
  await p.click('[data-action=prop-mark-breached]'); await p.waitForTimeout(450);
  const br = await p.evaluate(() => ({ st: Store.propAccounts()[1].status, b: Store.propBreaches() }));
  ok('„Als geplatzt markieren“ setzt Status und speichert Breach', br.st === 'breached' && br.b.length === 1 && br.b[0].rule === 'drawdown' && br.b[0].auto === true && !!br.b[0].tradeId && !(await p.$('[data-action=prop-mark-breached]')) && (await p.textContent('.prop-card.breached .pills')).includes('Geplatzt'));
  ok('Geplatztes Konto kompakt: keine Balken, kein Puffer, Link „Zum Grabstein“', !(await p.$('.prop-card.breached .prop-bars, .prop-card.breached .prop-meta')) && !!(await p.$('.prop-card.breached.compact a[href="#/prop/friedhof"]')));
  ok('Bis vier Konten keine Filter (einfacher Einstieg)', !(await p.$('select[data-change=prop-filter]')));
  /* Filter erscheinen erst ab fünf Konten: drei Hilfskonten dazu, Status-Filter prüfen, wieder entfernen */
  const tmp = await p.evaluate(() => { const ids = []; for (let i = 0; i < 3; i++) ids.push(Store.addPropAccount({ firmId: '', firm: 'Hilfe' + i, name: 'X', market: 'futures', size: 1000, currency: 'EUR', phase: 'challenge1', status: 'archived', startedAt: new Date().toISOString(), startBalance: 1000, rules: {}, payout: {}, profitSplit: 0.9, group: '', tz: 'UTC', note: '' }).id); App.rerender(); return ids; }); await p.waitForTimeout(300);
  await p.selectOption('select[data-change=prop-filter][data-key=status]', 'active'); await p.waitForTimeout(300); ok('Ab fünf Konten: Filter nach Status', (await p.$$('.prop-card')).length === 1);
  await p.selectOption('select[data-change=prop-filter][data-key=status]', ''); await p.waitForTimeout(300);
  await p.evaluate(ids => { for (const id of ids) Store.deletePropAccount(id); App.rerender(); }, tmp); await p.waitForTimeout(300);
  ok('Geplatztes Konto liegt eingeklappt unter „Abgeschlossen“', !!(await p.$('.prop-fold[data-fold=ended]:not([open]) .prop-card.breached')) && !!(await p.$('.prop-cards > .prop-card:not(.breached), .prop-group .prop-card:not(.breached)')));
  ok('Gruppierung nach Gruppe (Copy-Trading)', (await p.$$('.prop-group-title')).length === 1 && (await p.textContent('.prop-group-title')).includes('Copy A') && (await p.$$('.prop-card')).length === 2);
  await p.screenshot({ path: 'prop-cockpit.png', fullPage: true });

  /* 5. Bilanz */
  await go('bilanz');
  ok('Bilanz leer: ein Satz, „Ausgabe erfassen“ gefüllt, „oder Payout erfassen“ als Textknopf, keine Kacheln, kein offenes Formular, keine Kopf-Werkzeuge', !(await p.$('.prop-tiles')) && (await content()).includes('Noch keine Ausgaben oder Payouts') && !!(await p.$('.prop-bilanz-empty .btn.primary[data-action=prop-entry][data-value=expense]')) && !!(await p.$('.prop-bilanz-empty .btn.ghost[data-action=prop-entry][data-value=payout]')) && !(await p.$('.prop-entry:not([hidden])')) && !(await p.$('.page-head [data-action=new-trade], .page-head [data-action=prop-account-new]')));
  await p.click('.prop-bilanz-empty [data-action=prop-entry][data-value=expense]'); await p.waitForTimeout(250);
  ok('Ausgabe-Formular: Notiz unter „Mehr Optionen“, Firma nur ohne Konto', await p.evaluate(() => { const f = document.getElementById('prop-entry-expense'); const firm = f.querySelector('[data-firm]'); const a = !f.hidden && !firm.hidden && !!f.querySelector('.prop-more #pe-note'); const sel = f.querySelector('#pe-acc'); sel.value = sel.options[1].value; sel.dispatchEvent(new Event('change', { bubbles: true })); const b = firm.hidden; sel.value = ''; sel.dispatchEvent(new Event('change', { bubbles: true })); return a && b && !firm.hidden; }));
  await p.selectOption('#pe-type', 'challenge'); await p.fill('#pe-amount', '540'); await p.fill('#pe-firm', 'FTMO'); await p.click('form[data-action=prop-expense-add] button[type=submit]'); await p.waitForTimeout(450);
  const ex = await p.evaluate(() => Store.propExpenses()); ok('Ausgabe erfasst', ex.length === 1 && ex[0].type === 'challenge' && ex[0].amount === 540 && ex[0].firm === 'FTMO' && (await p.$$('form[data-action=prop-expense-add] ~ .tbl-wrap tbody tr')).length === 1);
  ok('Mit Buchung: volle Bilanz, „Ausgabe erfassen“ gefüllt, „Payout erfassen“ umrandet', (await p.$$('.prop-tiles .tile')).length === 5 && await p.evaluate(() => { const b = [...document.querySelectorAll('.card-head [data-action=prop-entry]')]; return b.length === 2 && !b.find(x => x.dataset.value === 'payout').classList.contains('primary'); }));
  await p.click('[data-action=prop-entry][data-value=payout]'); await p.waitForTimeout(250);
  ok('Nur ein Formular offen; Payout: Split, Netto, Erhalten und Status unter „Mehr Optionen“', await p.evaluate(() => document.getElementById('prop-entry-expense').hidden && !document.getElementById('prop-entry-payout').hidden && ['pp-split', 'pp-net', 'pp-rec', 'pp-status'].every(id => !!document.querySelector('#prop-entry-payout .prop-more #' + id))));
  await p.click('#prop-entry-payout .prop-more > summary'); await p.waitForTimeout(100);
  await p.fill('#pp-gross', '1000'); await p.waitForTimeout(100);
  ok('Payout: Netto automatisch aus Brutto × Split (80 %)', (await p.inputValue('#pp-net')) === '800.00' && (await p.inputValue('#pp-split')) === '80');
  await p.fill('#pp-rec', today()); await p.click('form[data-action=prop-payout-add] button[type=submit]'); await p.waitForTimeout(450);
  const po = await p.evaluate(() => Store.propPayouts()); ok('Payout erfasst (erhalten, netto 800)', po.length === 1 && po[0].net === 800 && po[0].split === 0.8 && po[0].status === 'received' && po[0].firm === 'FTMO');
  const tiles = (await p.$$eval('.prop-tiles .tile', els => els.map(e => e.querySelector('.val').textContent.trim()))).map(norm);
  ok('Kennzahlen: Netto, ROI, Kosten/bestandenes Konto, Quote, Break-even', tiles[0] === '260,00 €' && tiles[1] === '48 %' && tiles[2] === '—' && tiles[3] === '0 %' && tiles[4] === 'erreicht', tiles.join(' | '));
  ok('Pro Firma: FTMO', (await p.textContent('.grid.main-side')).includes('FTMO'));
  ok('Chart mit zwei Linien als Treppe', (await p.$$('[data-id=prop-balance] svg path')).length === 2 && (await p.$$('[data-id=prop-balance] svg path[stroke="var(--loss)"]')).length === 1 && (await p.$$('[data-id=prop-balance] svg path[stroke="var(--profit)"]')).length === 1 && /H[\d.]+V/.test(await p.getAttribute('[data-id=prop-balance] svg path[stroke="var(--loss)"]', 'd')));

  /* 6. Rechner entfallen: alte Adresse führt zur Übersicht, kein Bereich „Rechner“ mehr */
  await go('rechner');
  ok('Rechner entfernt: #/prop/rechner zeigt die Übersicht, Kopfreihe ohne „Rechner“', (await p.$eval('.prop-tabs a[aria-pressed=true]', e => e.textContent.trim())) === 'Übersicht' && !(await p.$('#prop-calc, .prop-calc-grid, a[data-area=rechner]')) && /^Übersicht,Bilanz,(Friedhof,)?Konten$/.test(await p.$$eval('.prop-tabs a', els => els.map(e => e.textContent.trim()).join(','))));

  /* 7. Payout-Planer (Abschnitt in der Bilanz; die alte Adresse #/prop/payout öffnet ihn) */
  await go('payout');
  ok('Alte Adresse #/prop/payout: Bilanz mit offenem Payout-Planer, kein Payout-Reiter', !!(await p.$('.prop-fold[data-fold=planer][open]')) && (await p.$eval('.prop-tabs a[aria-pressed=true]', e => e.textContent.trim())) === 'Bilanz' && !(await p.$('a[href="#/prop/payout"]')) && !!(await p.$('.prop-tiles')));
  await p.selectOption('#pp-acc-sel', acc.id); await p.waitForTimeout(400);
  const ptxt = await content();
  ok('Payout-Planer (Challenge): Bedingungen zum Bestehen, Handelstage, Profit Target', ptxt.includes('Bedingungen zum Bestehen') && ptxt.includes('Handelstage') && ptxt.includes('Profit Target') && ptxt.includes('Weg zum Bestehen') && /Vorschlag|erfüllt/.test(ptxt));
  ok('Planer (Challenge): Weg als Untertitel statt Banner, kein Profit Split', !(await p.$('.prop-fold[data-fold=planer] .banner.info')) && !ptxt.includes('Profit Split'));
  await p.evaluate(() => { const src = Store.propAccounts()[0]; const a = Store.addPropAccount({ firmId: 'apex-50k', firm: 'Apex Trader Funding', name: '50K', market: 'futures', size: 50000, currency: 'USD', phase: 'funded', status: 'active', startedAt: new Date().toISOString(), startBalance: 50000, rules: { dailyLoss: null, drawdown: { value: 2500, mode: 'abs', type: 'trailing_lock', lockAt: 100, basis: 'intraday' }, profitTarget: null, minTradingDays: null, maxContracts: null, consistency: { maxDayPct: 30 } }, payout: { minDays: 8, minProfit: 500, minBalance: null }, profitSplit: 0.9, group: '', tz: 'America/Chicago', note: '' }); const ids = Store.trades().filter(t => (t.propAccountIds || []).includes(src.id)).map(t => t.id); Store.assignTradesToPropAccount(ids, a.id, true); App.rerender(); }); await p.waitForTimeout(400);
  const funded = await p.evaluate(() => Store.propAccounts()[2].id); await p.selectOption('#pp-acc-sel', funded); await p.waitForTimeout(400);
  const ftxt = norm(await content()); const plan = await p.evaluate(() => { const a = Store.propAccounts()[2]; const tr = Store.tradesForPropAccount(a.id); const ev = Prop.evaluate(a, tr, {}); return Prop.payoutPlan(a, ev, { minDays: 8, minProfit: 500, consistencyPct: 30, fmtMoney: v => UI.fmt.cur(v) }); });
  ok('Payout-Planer (Funded): Payout-Bedingungen, Consistency-Warnung, Ø-Vorschlag', ftxt.includes('Payout-Bedingungen') && ftxt.includes('Consistency Rule') && (plan.consistencyWarning ? ftxt.includes(norm(plan.consistencyWarning)) : true) && (plan.suggestion.total > 0 ? ftxt.includes('Ø Gewinn pro Tag über') && ftxt.includes(`${plan.suggestion.days} Tag`) : ftxt.includes('Bereit')) && ftxt.includes('von 8'), (plan.consistencyWarning || '').slice(0, 80));
  ok('Planer (Funded): Profit Split da; ohne Payouts dieses Kontos keine leere Karte', ftxt.includes('Profit Split') && !ftxt.includes('Payouts dieses Kontos'));
  ok('Cockpit-Karte nennt „Nächster Payout“ für Funded-Konto', await (async () => { await go('cockpit'); const t = await p.$$eval('.prop-card', els => els.map(e => e.textContent)); return t.some(x => x.includes('Nächster Payout') && /in \d+ Handelstag|Gewinn fehlt|bereit|Consistency/.test(x)); })());

  /* 8. Konten-Tab: eigene Presets, Einstellungen */
  await go('konten');
  ok('Konten-Tab: Kontoliste, „Eigene Presets“ eingeklappt mit dem einen eigenen Preset, keine eingebauten', (await p.$$('.prop-acc-tbl tbody tr')).length === 3 && (await p.$$('.prop-presets tbody tr')).length === 1 && !(await p.$('.prop-presets .prop-builtin')) && (await p.textContent('.prop-fold[data-fold=presets] .pf-t')).includes('Eigene Presets') && !!(await p.$('.prop-fold[data-fold=presets]:not([open])')));
  await p.click('.prop-fold[data-fold=presets] > summary'); await p.click('.prop-fold[data-fold=ampel] > summary'); await p.waitForTimeout(250);
  await p.click('.prop-presets [data-action=prop-preset-edit]'); await p.waitForTimeout(300);
  ok('Eigenes Preset im Editor (bearbeitbar)', (await p.textContent('.modal h2')) === 'Preset bearbeiten' && !(await p.$eval('.modal #pp-firm', e => e.disabled)));
  await p.fill('.modal #pp-name', '100K geprüft'); await p.click('.modal .prop-more > summary'); await p.fill('.modal #pp-ver', today()); await p.click('.modal form button[type=submit]'); await p.waitForTimeout(450);
  const own = await p.evaluate(() => Store.data.propFirms[0]); ok('Eigenes Preset gespeichert und als geprüft markiert', own.name === '100K geprüft' && own.unverified === false && own.lastVerified === today() && own.custom === true && (await p.$$('.prop-presets tbody tr')).length === 1 && (await p.$$eval('.prop-presets .pill.win', els => els.length)) === 1);
  await p.click('.prop-presets [data-action=prop-preset-delete]'); await p.waitForTimeout(250); await p.click('.modal [data-confirm]'); await p.waitForTimeout(400); ok('Eigenes Preset gelöscht, Leerhinweis', (await p.evaluate(() => Store.data.propFirms.length)) === 0 && !(await p.$('.prop-presets')) && (await p.textContent('.prop-fold[data-fold=presets] .dashed')).includes('Noch keine eigenen Presets'));
  await p.fill('#ps-yellow', '60'); await p.fill('#ps-red', '30'); await p.fill('#ps-stop', '150'); await p.click('form[data-action=prop-settings-save] button[type=submit]'); await p.waitForTimeout(400);
  ok('Ampel-Schwellen und Stop-Größe gespeichert', await p.evaluate(() => Store.settings.propThresholds.yellow === 0.6 && Store.settings.propThresholds.red === 0.3 && Store.settings.propStopSize === 150));
  await go('cockpit'); ok('Manuelle Stop-Größe wirkt im Cockpit', norm(await p.getAttribute(`.prop-card[data-id="${acc.id}"] .prop-meta .prop-stops`, 'data-tip') || '').includes('/ 150,00 € je Stop-Loss'));
  await go('konten'); await p.click(`.prop-acc-tbl tr[data-id="${acc.id}"] td:first-child`); await p.waitForTimeout(250);
  ok('Konten: Zeile öffnet „Bearbeiten“, kein Papierkorb je Zeile, Status direkt nach Kontogröße, Löschen als Textknopf im Dialog', (await p.textContent('.modal h2')) === 'Konto bearbeiten' && !(await p.$('.prop-acc-tbl [data-action=prop-account-delete]')) && await p.evaluate(() => { const ids = [...document.querySelectorAll('.modal form > .form-grid .field')].map(f => (f.querySelector('input, select') || {}).name); return ids.indexOf('status') === ids.indexOf('size') + 1; }) && !!(await p.$('.modal .modal-foot .btn.ghost.left[data-action=prop-account-delete]')) && !(await p.$('.modal .btn.danger')) && (await p.textContent('.modal [data-action=prop-account-delete]')).trim() === 'Konto löschen');
  await p.keyboard.press('Escape'); await p.waitForTimeout(250); await go('cockpit');
  await p.click(`.prop-card[data-id="${acc.id}"] [data-action=prop-account-edit]`); await p.waitForTimeout(250); await p.selectOption('.modal #pa-status', 'archived'); await p.click('.modal form button[type=submit]'); await p.waitForTimeout(400);
  ok('Status im Konto-Modal manuell setzbar (archiviert)', (await p.evaluate(() => Store.propAccounts()[0].status)) === 'archived' && !!(await p.$(`.prop-card.archived[data-id="${acc.id}"]`)));
  await p.evaluate(() => { Store.updatePropAccount(Store.propAccounts()[0].id, { status: 'active' }); });

  /* 9. Geld-blind-Modus */
  await p.evaluate(() => { Store.setSetting('moneyBlind', true); App.rerender(); }); await p.waitForTimeout(300); let euro = [];
  for (const t of ['cockpit', 'bilanz', 'konten']) { await go(t); const txt = await content(); if (txt.includes('€')) euro.push(t); }
  await go('cockpit'); await p.click('.prop-card [data-action=prop-account-edit]'); await p.waitForTimeout(250); const modalEuro = (await p.evaluate(() => { const m = document.querySelector('.modal').cloneNode(true); m.querySelectorAll('option').forEach(o => o.remove()); return m.textContent; })).includes('€'); /* Währungsliste (EUR · Euro (€)) ist kein Betrag */ await p.click('.modal [data-close]'); await p.waitForTimeout(200);
  ok('Geld-blind-Modus: kein € auf allen Tabs und im Konto-Modal, Balance ausgeblendet', euro.length === 0 && !modalEuro && (await p.textContent('.prop-card .prop-balance .val')).includes('ausgeblendet') && ((await p.textContent('.prop-card .prop-meta')) + ' ' + ((await p.getAttribute('.prop-card .prop-meta .prop-stops', 'data-tip')) || '')).includes(' R'), euro.join(','));
  await p.evaluate(() => { Store.setSetting('moneyBlind', false); });

  /* 10. Handy 390 px */
  await p.setViewportSize({ width: 390, height: 800 }); let wide = [];
  for (const t of ['cockpit', 'bilanz', 'konten']) { await go(t); const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 390) wide.push(`${t}:${w}`); }
  ok('Handy 390 px ohne horizontalen Überlauf (alle Tabs)', wide.length === 0, wide.join(','));
  await go('cockpit'); await p.screenshot({ path: 'prop-phone.png', fullPage: true });
  ok('Handy: „Konto anlegen“ nicht in der Kopfreihe (über Konten erreichbar)', await p.evaluate(() => { const b = document.querySelector('.page-head [data-action=prop-account-new]'); return !b || getComputedStyle(b).display === 'none'; }));
  await go('konten'); ok('Handy: Konten-Tabelle ohne Start, Gruppe, Trades', await p.evaluate(() => [...document.querySelectorAll('.prop-acc-tbl thead th.opt')].every(th => getComputedStyle(th).display === 'none')));
  await p.click('.card [data-action=prop-account-new]'); await p.waitForTimeout(300);
  ok('Handy: Konto-Modal ohne Überlauf', await p.evaluate(() => document.documentElement.scrollWidth <= 390 && document.querySelector('.modal').scrollWidth <= document.querySelector('.modal').clientWidth + 1));
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  console.log(out.join('\n')); console.log(`${out.filter(x => x.startsWith('PASS')).length}/${out.length} bestanden`); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
