/* Prop Firms Phase 3: Friedhof und Challenge vs. Funded. Start: NODE_PATH=$(npm root -g) node friedhoftest.js (im Scratchpad) */
const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/friedhof-dev.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
const ignore = m => /ERR_CERT|fonts\.googleapis|fonts\.gstatic|net::ERR|Error inlining remote css|Error loading remote stylesheet|Fetch API cannot load file|Error while reading CSS rules/.test(m);
const norm = s => String(s || '').replace(/ /g, ' ');
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
  p.on('pageerror', e => { if (!ignore(e.message)) errs.push(e.message); }); p.on('console', m => { if (m.type() === 'error' && !ignore(m.text())) errs.push('console: ' + m.text()); });
  const go = async (tab) => { await p.evaluate(t => { location.hash = '#/prop/' + t; }, tab); await p.waitForTimeout(450); };
  const content = async () => norm(await p.evaluate(() => document.getElementById('content').innerText));
  const rerender = async () => { await p.evaluate(() => App.rerender()); await p.waitForTimeout(350); };
  await p.goto(base + '#/prop', { waitUntil: 'load' }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  /* Beispieldaten v2 bringen vier Prop-Konten mit Zuordnungen, Ausgaben, Payouts und Breach mit; diese Suite baut ihre Konten selbst ab dem Leerzustand auf */
  await p.evaluate(() => { Store.data.propAccounts = []; Store.data.propExpenses = []; Store.data.propPayouts = []; Store.data.propBreaches = []; for (const t of Store.trades()) t.propAccountIds = []; Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(300);

  /* 1. Registrierung und Leerzustände */
  const tabLabels = await p.$$eval('.prop-tabs a', els => els.map(e => e.textContent.trim()));
  await go('friedhof'); const subLabels = await p.$$eval('.prop-sub a', els => els.map(e => e.textContent.trim()));
  ok('Friedhof registriert: Bereich „Auswertung“ nur mit Bilanz und Friedhof', tabLabels.join(',') === 'Übersicht,Auswertung,Konten' && subLabels.join(',') === 'Bilanz,Friedhof' && (await p.$eval('.prop-tabs a[aria-pressed=true]', e => e.textContent.trim())) === 'Auswertung', tabLabels.join(',') + ' | ' + subLabels.join(','));
  ok('Friedhof leer: positiver Leerzustand mit Hinweis auf das Cockpit', (await p.$eval('.empty b', e => e.textContent)) === 'Noch kein Konto auf dem Friedhof' && (await content()).includes('Als geplatzt markieren') && !(await p.$('.prop-grave')) && errs.length === 0);
  await go('bilanz'); /* weg vom Friedhof, damit der nächste Aufruf neu rendert */

  /* 2. Erstes geplatztes Konto (Challenge, Daily Loss) */
  const fx = await p.evaluate(() => {
    const all = Core.deriveAll(Store.trades()).filter(t => t.closed).sort((a, b) => a.sortTime - b.sortTime);
    const count = new Map(); for (const t of all) count.set(t.symbol, (count.get(t.symbol) || 0) + 1); const sym = [...count.entries()].sort((a, b) => b[1] - a[1])[0][0];
    /* Beispieldaten v2 (Seed 19887): der erste NQ-Verlust ist der dritte Trade überhaupt; die Stichprobe braucht 4 bzw. 5 Vorgänger */
    const losses = all.filter(t => t.symbol === sym && t.status === 'loss' && all.findIndex(x => x.id === t.id) >= 5); const X = losses[0], Y = losses[Math.min(losses.length - 1, 3)];
    const ix = all.findIndex(t => t.id === X.id), iy = all.findIndex(t => t.id === Y.id);
    const aTrades = all.slice(Math.max(0, ix - 4), ix + 1).map(t => t.id), bTrades = all.slice(Math.max(0, iy - 5), iy + 1).map(t => t.id);
    const raw = id => Store.trades().find(t => t.id === id);
    Store.updateTrade(X.id, { emotions: ['Wut'], mistakes: ['Revenge-Trade'] });
    const A = Store.addPropAccount({ firmId: 'ftmo-100k', firm: 'FTMO', name: '100K', market: 'forex', size: 100000, currency: 'USD', phase: 'challenge1', status: 'active', startedAt: new Date(X.close.getTime() - 10 * 86400000).toISOString(), startBalance: 100000, rules: { dailyLoss: { value: 5, mode: 'pct', basis: 'equity', resetTime: '00:00', tz: 'Europe/Prague' }, drawdown: null, profitTarget: null, minTradingDays: null, maxContracts: null, consistency: null }, payout: {}, profitSplit: 0.8, group: '', tz: 'Europe/Prague', note: '' });
    Store.assignTradesToPropAccount(aTrades, A.id, true);
    Store.updatePropAccount(A.id, { status: 'breached', breachedAt: raw(X.id).closedAt });
    Store.addPropBreach({ accountId: A.id, tradeId: X.id, rule: 'dailyLoss', at: raw(X.id).closedAt, note: 'Daily Loss überschritten', auto: true });
    return { sym, X: { id: X.id, symbol: X.symbol, setup: X.setup || '', closedAt: raw(X.id).closedAt }, Y: { id: Y.id, symbol: Y.symbol, closedAt: raw(Y.id).closedAt }, aTrades, bTrades, aId: A.id };
  });
  await go('friedhof');
  let txt = await content();
  ok('Ein Grabstein: Firma, Phase, Regel „Daily Loss“, Symbol, Lebensdauer 10 Tage', (await p.$$('.prop-grave')).length === 1 && txt.includes('FTMO 100K') && txt.includes('Challenge 1') && txt.includes('Daily Loss') && txt.includes(fx.X.symbol) && txt.includes('gelebt 10 Tage') && txt.includes('Daily Loss überschritten'), txt.slice(0, 160).replace(/\n/g, ' | '));
  ok('Emotionen und Fehler als Chips, Link „Trade öffnen“ auf #/trades/<id>', (await p.$$eval('.prop-grave .chip.emotion', els => els.map(e => e.textContent))).includes('Wut') && (await p.$$eval('.prop-grave .chip.mistake', els => els.map(e => e.textContent))).includes('Revenge-Trade') && (await p.$eval('.prop-grave a[href^="#/trades/"]', e => e.getAttribute('href'))) === `#/trades/${fx.X.id}`);
  const stone = await p.$eval('.prop-grave', e => ({ stone: !!e.querySelector('.pg-stone .pg-rock') && !e.querySelector('.pg-crack'), rip: (e.querySelector('.pg-rip') || {}).textContent, dates: (e.querySelector('.pg-dates') || {}).textContent || '', cause: e.querySelector('.pg-cause b') ? e.querySelector('.pg-cause b').textContent : '', light: e.querySelectorAll('.pg-base .pg-candles .flame').length >= 10 && e.querySelectorAll('.pg-candles .candle .body[filter]').length >= 12 && e.querySelectorAll('.pg-candles .candle .runs[filter]').length >= 8, shape: e.querySelectorAll('.pg-face > .pg-rock .rock, .pg-face > .pg-rock .panel').length - e.querySelectorAll('.pg-rock [filter]').length * 10, mound: !!e.querySelector('.pg-mound'), ivy: !!e.querySelector('.pg-stone .pg-ivy'), step: e.querySelectorAll('.pg-base .pg-slab rect').length, epitaph: (e.querySelector('.pg-epitaph') || {}).textContent || '' }));
  ok('Grabstein: flacher Stein mit Schrifttafel (beide Seiten, ohne Struktur-Filter und Riss), R · I · P, * Start / † Breach, Todesursache, Inschrift, Steinsockel mit Stufe und Kerzenhaufen, ohne Efeu und Grashügel', stone.stone && stone.rip === 'R · I · P' && /^\* \d{2}\.\d{2}\.\d{4}† \d{2}\.\d{2}\.\d{4}$/.test(stone.dates) && stone.cause === 'Daily Loss' && stone.light && stone.shape === 4 && !stone.mound && !stone.ivy && stone.step === 2 && stone.epitaph.startsWith('„') && stone.epitaph.includes('Daily Loss überschritten'), JSON.stringify(stone));
  ok('Muster-Hinweis bei einem Grabstein („Ab zwei Grabsteinen“)', !!(await p.$('.prop-patterns-empty')) && txt.includes('Ab zwei Grabsteinen') && !(await p.$('.prop-patterns')));
  const tiles1 = (await p.$$eval('.prop-grave-tiles .tile', els => els.map(e => ({ v: e.querySelector('.val').textContent.trim(), f: (e.querySelector('.foot') || {}).textContent || '' })))).map(t => ({ v: norm(t.v), f: norm(t.f) }));
  ok('Kacheln: 1 Konto, Gebühren „—“ mit Hinweis, Lebensdauer 10 Tage, Regel Daily Loss', tiles1.length === 4 && tiles1[0].v === '1' && tiles1[1].v === '—' && tiles1[1].f.includes('Keine Ausgabe') && tiles1[2].v === '10 Tage' && tiles1[3].v === 'Daily Loss' && tiles1[3].f.includes('1 von 1'), JSON.stringify(tiles1));
  await go('bilanz');

  /* 3. Zweites geplatztes Konto (Funded, Drawdown), Ausgabe zugeordnet, Copy-Konto in Challenge 2 */
  await p.evaluate((fx) => {
    const raw = id => Store.trades().find(t => t.id === id); const Y = Core.derive(raw(fx.Y.id));
    const B = Store.addPropAccount({ firmId: 'apex-50k', firm: 'Apex Trader Funding', name: '50K', market: 'futures', size: 50000, currency: 'USD', phase: 'funded', status: 'active', startedAt: new Date(Y.close.getTime() - 24 * 86400000).toISOString(), startBalance: 50000, rules: { dailyLoss: null, drawdown: { value: 2500, mode: 'abs', type: 'trailing_lock', lockAt: 100, basis: 'intraday' }, profitTarget: null, minTradingDays: null, maxContracts: null, consistency: null }, payout: {}, profitSplit: 0.9, group: '', tz: 'America/Chicago', note: 'Zu groß nach Verlustserie' });
    Store.assignTradesToPropAccount(fx.bTrades, B.id, true);
    Store.updatePropAccount(B.id, { status: 'breached', breachedAt: raw(fx.Y.id).closedAt });
    Store.addPropBreach({ accountId: B.id, tradeId: fx.Y.id, rule: 'drawdown', at: raw(fx.Y.id).closedAt, note: '', auto: true });
    Store.addPropExpense({ type: 'challenge', amount: 540, date: '2026-03-01', firm: 'FTMO', accountId: fx.aId, note: '' });
    Store.addPropExpense({ type: 'challenge', amount: 999, date: '2026-03-01', firm: 'Andere', accountId: null, note: 'nicht zugeordnet' });
    const Cc = Store.addPropAccount({ firmId: '', firm: 'Copy', name: 'C2', market: 'forex', size: 100000, currency: 'USD', phase: 'challenge2', status: 'active', startedAt: new Date().toISOString(), startBalance: 100000, rules: {}, payout: {}, profitSplit: 0.8, group: '', tz: 'UTC', note: '' });
    Store.assignTradesToPropAccount(fx.aTrades, Cc.id, true);
  }, fx);
  await go('friedhof');
  txt = await content();
  const g = await p.evaluate(() => { const byId = new Map(Core.deriveAll(Store.trades()).map(t => [t.id, t])); const g = PropSim.graveyard(Store.propAccounts(), Store.propBreaches(), byId, { tradesOf: a => Store.tradesForPropAccount(a.id) }); const lifes = g.tombstones.map(t => t.lifetimeDays).filter(v => v != null); return { n: g.n, patterns: g.patterns, avg: UI.fmt.num(Core.mean(lifes), 0) + ' Tage', rules: g.tombstones.map(t => t.cause.rule), symbols: g.tombstones.map(t => t.cause.symbol), fee: UI.fmt.cur(540), results: g.tombstones.map(t => t.result), lifes }; });
  const graves = await p.$$eval('.prop-grave', els => els.map(e => e.textContent));
  ok('Zwei Grabsteine mit Regel, Symbol und Lebensdauer', graves.length === 2 && g.n === 2 && graves.some(t => t.includes('Daily Loss')) && graves.some(t => t.includes('Max. Drawdown')) && graves.every((t, i) => t.includes(g.symbols[i])) && graves.some(t => t.includes('gelebt 24 Tage')) && graves.some(t => t.includes('gelebt 10 Tage')) && txt.includes('Zu groß nach Verlustserie'), `${graves.length}/${g.n} · ${g.lifes.join(',')}`);
  const tiles2 = (await p.$$eval('.prop-grave-tiles .tile', els => els.map(e => ({ v: e.querySelector('.val').textContent.trim(), f: (e.querySelector('.foot') || {}).textContent || '' })))).map(t => ({ v: norm(t.v), f: norm(t.f) }));
  ok('Kacheln stimmen mit PropSim.graveyard überein (Anzahl, Gebühren nur zugeordnete, Ø Lebensdauer, Regel)', tiles2[0].v === String(g.n) && tiles2[1].v === norm(g.fee) && tiles2[1].f.includes('1 Ausgabe') && tiles2[2].v === g.avg && tiles2[2].v === '17 Tage' && ['Daily Loss', 'Max. Drawdown'].includes(tiles2[3].v) && tiles2[3].f.includes('1 von 2'), JSON.stringify(tiles2));
  const pat = await p.$$eval('.prop-patterns li', els => els.map(e => e.textContent));
  ok('Muster-Sätze erscheinen und entsprechen PropSim.graveyard().patterns', g.patterns.length > 0 && pat.length === g.patterns.length && pat.every((s, i) => s === g.patterns[i]) && pat.some(s => s.includes(fx.sym)), pat.join(' / '));
  ok('Ergebnis je Grabstein über U.pnl (kein erfundener Wert)', graves.every((t, i) => g.results[i] == null ? t.includes('Ergebnis—') || t.includes('Ergebnis\n—') || /Ergebnis\s*—/.test(t) : true));
  await p.screenshot({ path: 'friedhof.png', fullPage: true });

  /* 6. Trade-Link führt zum Trade-Detail */
  await go('friedhof');
  /* zweiseitiger Stein: vorne nur das Wesentliche, der Link steht hinten */
  const faces = await p.evaluate(() => { const st = document.querySelector('.pg-stone'); const f = st.querySelector('.pg-front'), bk = st.querySelector('.pg-back'); return { flipped: st.classList.contains('flipped'), fh: f.getAttribute('aria-hidden'), bh: bk.getAttribute('aria-hidden'), frontHasResult: /Ergebnis/.test(f.textContent), backHasResult: /Ergebnis/.test(bk.textContent), frontHasCause: /Todesursache/.test(f.textContent), h: Math.round(st.getBoundingClientRect().height) }; });
  ok('Grabstein vorne: Todesursache ja, Ergebnis nein; hinten das Ergebnis; Stein unter 560px hoch', !faces.flipped && faces.fh === 'false' && faces.bh === 'true' && faces.frontHasCause && !faces.frontHasResult && faces.backHasResult && faces.h < 560, JSON.stringify(faces));
  await p.click('.prop-grave .pg-front .pg-turn'); await p.waitForTimeout(850);
  ok('Umdrehen: Stein gedreht, Rückseite sichtbar', await p.evaluate(() => { const st = document.querySelector('.pg-stone'); return st.classList.contains('flipped') && st.querySelector('.pg-back').getAttribute('aria-hidden') === 'false' && st.querySelector('.pg-front').getAttribute('aria-hidden') === 'true'; }));
  await p.click('.prop-grave .pg-back a[href^="#/trades/"]'); await p.waitForTimeout(450);
  ok('„Trade öffnen“ navigiert zum Trade-Detail', (await p.evaluate(() => location.hash)).startsWith('#/trades/') && (await p.textContent('.topbar h1')) === 'Trade');

  /* 7. Geld-blind */
  await p.evaluate(() => { Store.setSetting('moneyBlind', true); }); let money = [];
  for (const t of ['friedhof']) { await go(t); const x = await content(); if (/[€$]/.test(x)) money.push(t); }
  ok('Geld-blind-Modus: kein €/$ im Friedhof', money.length === 0 && (await content()).includes('R'), money.join(','));
  await p.evaluate(() => { Store.setSetting('moneyBlind', false); });

  /* 8. Handy 390 px */
  await p.setViewportSize({ width: 390, height: 800 }); let wide = [];
  for (const t of ['friedhof']) { await go(t); const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > 390) wide.push(`${t}:${w}`); }
  ok('Handy 390 px ohne horizontalen Überlauf', wide.length === 0, wide.join(','));
  await go('friedhof'); await p.screenshot({ path: 'friedhof-phone.png', fullPage: true });

  /* 9. Helles Theme (nur Screenshots, Tokens) */
  await p.setViewportSize({ width: 1440, height: 1000 }); await p.evaluate(() => { Store.setSetting('theme', 'light'); Theme.apply(Store.settings); }); await p.waitForTimeout(200);
  await go('friedhof'); await p.screenshot({ path: 'friedhof-light.png', fullPage: true });
  await p.evaluate(() => { Store.setSetting('theme', 'dark'); Theme.apply(Store.settings); });

  /* 10. Prüfer-Fixes: Lebensdauer-Text, synthetischer Breach aus breachedAt, Größe 0/null, Markt-Label, Phase-Escaping, graveyard() als einzige Quelle */
  await p.evaluate(() => {
    /* a) nur per Status geplatzt (wie App.actions['prop-account-status']): kein Breach-Datensatz, kein breachedAt, Startdatum vorhanden */
    const S1 = Store.addPropAccount({ firm: 'StatusOnly', name: '', market: 'forex', size: 10000, currency: 'USD', phase: 'challenge1', status: 'active', startedAt: '2026-05-01T00:00:00.000Z', startBalance: 10000, rules: {}, payout: {}, profitSplit: 0.8, group: '', tz: 'UTC', note: '' });
    Store.updatePropAccount(S1.id, { status: 'breached' });
    /* b) breachedAt ohne Datensatz, ohne Größe (Import), Phase mit HTML (Import ungeprüft) */
    const S2 = Store.addPropAccount({ firm: 'Synth', name: '', market: 'futures', size: null, currency: 'USD', phase: '<img src=x onerror="window.__xss=1">', status: 'breached', startedAt: '2026-05-01T00:00:00.000Z', breachedAt: '2026-05-13T15:00:00.000Z', startBalance: null, rules: {}, payout: {}, profitSplit: 0.9, group: '', tz: 'UTC', note: '' });
    window.__S = { s1: S1.id, s2: S2.id };
  });
  await go('friedhof'); await rerender(); txt = await content();
  const gv = async firm => (await p.$$eval('.prop-grave', els => els.map(e => ({ id: e.dataset.id, text: e.innerText, html: e.innerHTML })))).find(x => x.text.includes(firm)) || { id: '', text: '', html: '' };
  const g1 = await gv('StatusOnly'), g2 = await gv('Synth');
  ok('Fix 1: Konto ohne Breach-Datum (Status-Aktion) → „Lebensdauer unbekannt (kein Breach-Datum)“, nicht „kein Startdatum“', g1.text.includes('Lebensdauer unbekannt (kein Breach-Datum)') && !g1.text.includes('kein Startdatum') && errs.length === 0, g1.text.match(/Lebensdauer[^\n]*/) ? g1.text.match(/Lebensdauer[^\n]*/)[0] : 'kein Lebensdauer-Text');
  ok('Fix 1: breachedAt ohne Datensatz → synthetischer Eintrag: „gelebt 13 Tage“ mit Datum, Ursache „—“, kein Trade-Link', g2.text.includes('gelebt 13 Tage') && /† 13\.05\.2026/.test(g2.text) && /Todesursache\s*\n?—/i.test(g2.text) && !g2.html.includes('#/trades/'), g2.text.replace(/\n/g, ' | ').slice(0, 160));
  const tiles10 = (await p.$$eval('.prop-grave-tiles .tile', els => els.map(e => ({ v: e.querySelector('.val').textContent.trim(), f: (e.querySelector('.foot') || {}).textContent || '' })))).map(t => ({ v: norm(t.v), f: norm(t.f) }));
  ok('Fix 1: Kachel Ø Lebensdauer nennt „Start- und Breach-Datum“ (nicht „mit Startdatum“), Konto mit breachedAt zählt mit', tiles10[2].f.includes('von 4 mit Start- und Breach-Datum') && tiles10[2].f.startsWith('3 von') && !tiles10[2].f.includes('mit Startdatum'), JSON.stringify(tiles10[2]));
  const src = await p.evaluate(() => { const r = PropFriedhof.graveyard(); const sb = PropFriedhof.breachesOf(Store.propAccounts()).filter(b => b.synthetic); return { n: r.g.n, hasById: r.byId instanceof Map, accs: Array.isArray(r.accs), synth: sb.map(b => [b.accountId, b.at, b.rule, b.tradeId]) }; });
  ok('Fix 6: PropFriedhof.graveyard() liefert { g, byId, accs } und ist dieselbe Quelle wie der Tab (Grabsteine = g.n); genau ein synthetischer Breach', src.hasById && src.accs && src.n === (await p.$$('.prop-grave')).length && src.synth.length === 1 && src.synth[0][0] === (await p.evaluate(() => window.__S.s2)) && src.synth[0][1] === '2026-05-13T15:00:00.000Z' && src.synth[0][2] === null && src.synth[0][3] === null, JSON.stringify(src));
  const head2 = norm(await p.$eval(`.prop-grave[data-id="${g2.id}"] .prop-grave-head .muted`, e => e.textContent));
  ok('Fix 3: Konto ohne Größe → „—“ statt „0,00 €“', head2.startsWith('—') && !/0,00/.test(head2), head2);
  ok('Fix 5: Markt über PropData.MARKETS („Forex / CFD“) statt hart kodiert', g1.text.includes('Forex / CFD') && head2.includes('Futures'), g1.text.split('\n').slice(0, 2).join(' | '));
  ok('Fix 6b: Phase-Pill escaped (HTML aus Import wird als Text gezeigt, kein <img>, kein onerror)', (await p.$eval(`.prop-grave[data-id="${g2.id}"] .pills .pill`, e => e.textContent)).includes('<img') && !(await p.$('.prop-grave img')) && (await p.evaluate(() => window.__xss)) == null);
  /* Geld-blind mit R-Einheit: Kontogröße nicht als R-Vielfaches */
  await p.evaluate(() => { Store.setSetting('moneyBlind', true); Store.setSetting('moneyBlindUnit', 100); UI.fmt.setMoneyBlind(true, 100); });
  await rerender();
  const headBlind = norm(await p.$eval(`.prop-grave[data-id="${g1.id}"] .prop-grave-head .muted`, e => e.textContent));
  ok('Fix 4: Geld-blind → Kontogröße „ausgeblendet“, nicht als R-Vielfaches', headBlind.includes('ausgeblendet') && !/\d\s?R/.test(headBlind) && !/[€$]/.test(await content()), headBlind);
  await p.evaluate(() => { Store.setSetting('moneyBlind', false); UI.fmt.setMoneyBlind(false, null); });
  /* Phasenverlauf: Trades, die vor dem Wechsel auf Funded geschlossen wurden, bleiben Challenge-Trades */
  const ph = await p.evaluate(() => {
    const all = Core.deriveAll(Store.trades()).filter(t => t.closed).sort((a, b) => a.sortTime - b.sortTime); const ids = all.slice(0, 6).map(t => t.id);
    const a = Store.addPropAccount({ firm: 'Phasen', name: 'Test', market: 'futures', size: 50000, currency: 'USD', phase: 'challenge1', status: 'active', startedAt: '2020-01-01T00:00:00.000Z', startBalance: 50000, rules: {}, payout: {}, profitSplit: 0.9, group: '', tz: 'UTC', note: '' });
    Store.assignTradesToPropAccount(ids, a.id, true);
    Store.updatePropAccount(a.id, { phase: 'funded' });
    const acc = Store.propAccounts().find(x => x.id === a.id); const old = all[0];
    return { phases: acc.phases.map(x => x.phase), atOld: Store.propPhaseAt(acc, old.close), atNow: Store.propPhaseAt(acc, new Date().toISOString()), ch: PropFriedhof.collect ? PropFriedhof.collect(['challenge1', 'challenge2']).filter(t => ids.includes(t.id)).length : null };
  });
  ok('Phasenverlauf: Wechsel gespeichert, alte Trades zählen zur Challenge, neue zu Funded', ph.phases.join(',') === 'challenge1,funded' && ph.atOld === 'challenge1' && ph.atNow === 'funded' && (ph.ch === null || ph.ch === 6), JSON.stringify(ph));
  await p.evaluate(() => { Store.deletePropAccount(window.__S.s1); Store.deletePropAccount(window.__S.s2); });

  /* 11. Zeitzone: Browser Europe/Berlin, Konto America/Chicago, Breach 23:30 Chicago (= 06:30 Berlin am Folgetag) → Wochentag, Datum und Uhrzeit aus derselben Zeitzone */
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', timezoneId: 'Europe/Berlin' }); const p2 = await ctx2.newPage();
  p2.on('pageerror', e => { if (!ignore(e.message)) errs.push('tz: ' + e.message); }); p2.on('console', m => { if (m.type() === 'error' && !ignore(m.text())) errs.push('tz console: ' + m.text()); });
  await p2.goto(base + '#/prop', { waitUntil: 'load' }); await p2.evaluate(() => { localStorage.clear(); }); await p2.reload({ waitUntil: 'load' }); await p2.waitForTimeout(600);
  await p2.evaluate(() => {
    const t1 = Store.addTrade({ symbol: 'NQ', direction: 1, openedAt: '2026-06-24T03:00:00.000Z', closedAt: '2026-06-24T04:30:00.000Z', entryPrice: 100, exitPrice: 90, quantity: 1, multiplier: 1, fees: 0, plannedStop: 95, setup: 'Breakout', mistakes: [], emotions: [], rulesBroken: [], screenshots: [], voiceNotes: [], notes: '' });
    const B = Store.addPropAccount({ firm: 'Apex', name: 'Nacht', market: 'futures', size: 50000, currency: 'USD', phase: 'funded', status: 'active', startedAt: '2026-06-01T00:00:00.000Z', startBalance: 50000, rules: {}, payout: {}, profitSplit: 0.9, group: '', tz: 'America/Chicago', note: '' });
    Store.assignTradesToPropAccount([t1.id], B.id, true);
    Store.updatePropAccount(B.id, { status: 'breached', breachedAt: t1.closedAt });
    Store.addPropBreach({ accountId: B.id, tradeId: t1.id, rule: 'drawdown', at: t1.closedAt, note: '', auto: true });
  });
  await p2.evaluate(() => { location.hash = '#/prop/friedhof'; }); await p2.waitForTimeout(450); await p2.evaluate(() => App.rerender()); await p2.waitForTimeout(350);
  const tzLine = norm((await p2.$$eval('.prop-grave', els => els.map(e => e.innerText))).map(s => (s.match(/(Mo|Di|Mi|Do|Fr|Sa|So)\. \d\d\.\d\d\.\d{4} · \d\d:\d\d/) || [''])[0]).filter(Boolean)[0] || '');
  ok('Fix 2 (Zeitzone): Breach-Zeile „Di. 23.06.2026 · 23:30“ komplett in der Konto-Zeitzone (Browser Berlin hätte Mi. 24.06.)', /Di\. 23\.06\.2026/.test(tzLine) && /23:30/.test(tzLine), tzLine);
  const tzLife = norm((await p2.$$eval('.prop-grave-life', els => els.map(e => e.innerText))).find(s => s.includes('†')) || '');
  ok('Fix 2 (Zeitzone): „† 23.06.2026“ nennt den Breach-Tag der Konto-Zeitzone', /† 23\.06\.2026/.test(tzLife) && errs.length === 0, tzLife);
  const di = await p2.evaluate(() => [PropFriedhof.dateIn('2026-06-24T04:30:00.000Z', 'America/Chicago'), PropFriedhof.dateIn('2026-06-24T04:30:00.000Z', null), PropFriedhof.dateIn('2026-06-24T04:30:00.000Z', 'Nope/Zone'), PropFriedhof.dateIn(null, 'UTC'), PropFriedhof.dateIn('kein datum', 'UTC')]);
  ok('Fix 2: dateIn → Konto-Zeitzone; ohne/mit ungültiger Zeitzone lokal (Berlin 24.06.); leer/ungültig „—“', di[0] === '23.06.2026' && di[1] === '24.06.2026' && di[2] === '24.06.2026' && di[3] === '—' && di[4] === '—', di.join(' / '));
  await ctx2.close();

  console.log(out.join('\n')); console.log(`${out.filter(x => x.startsWith('PASS')).length}/${out.length} bestanden`); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
