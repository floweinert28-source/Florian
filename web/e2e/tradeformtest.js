/* Trade loggen = Ersatz für einen Broker-Sync: nur Trade-Daten. Plan, Setup, Bewertung und Tags am Trade selbst („Plan & Bewertung“) */
const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/sample-dev.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  try {
    await p.goto(base + '#/trades', { waitUntil: 'load' }); await p.waitForTimeout(1000);
    await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(400);
    const f = await p.evaluate(() => { const q = s => !!document.querySelector('#trade-form ' + s); return { data: ['#f-symbol-btn', '#f-symbol', '#f-dir', '#f-entry', '#f-exit', '#f-qty', '#f-open', '#f-close', '#f-mult', '#f-fees'].every(q), journal: ['#f-pstop', '#f-ptarget', '#f-setup', '#f-notes', '#f-reason', '#f-rating', '[data-chips=mistakes]', '[data-chips=emotions]', 'details'].filter(q), accounts: Store.data.accounts.length, accSel: q('#f-account'), focus: document.activeElement && document.activeElement.id, title: document.querySelector('.modal-head h2').textContent }; });
    ok('Trade loggen: nur Trade-Daten (Symbol, Richtung, Kurse, Kontrakte, Zeit, Punktwert, Gebühren)', f.data && f.title === 'Trade loggen', JSON.stringify(f));
    ok('Keine Notiz-, Plan-, Setup- oder Tag-Fragen im Fenster', f.journal.length === 0, f.journal.join(','));
    ok('Konto-Auswahl nur bei mehreren Konten; kein Feld vorausgewählt', f.accSel === (f.accounts > 1) && !['f-symbol-btn', 'f-entry'].includes(f.focus), JSON.stringify(f));
    /* Klick auf eine Beschriftung wählt das Feld nicht aus */
    await p.click('label[for=f-entry]'); await p.waitForTimeout(80);
    ok('Klick auf die Beschriftung „Einstieg“ wählt das Feld nicht aus', (await p.evaluate(() => document.activeElement && document.activeElement.id)) !== 'f-entry');
    /* Symbol als Auswahl */
    const last = await p.evaluate(() => { const t = Store.trades().filter(x => Number(x.multiplier) > 1).sort((a, b) => String(b.openedAt).localeCompare(String(a.openedAt)))[0]; return { sym: t.symbol, mult: t.multiplier }; });
    await p.click('#f-symbol-btn'); await p.waitForTimeout(300);
    const menu = await p.evaluate(() => { const m = document.getElementById('sym-menu'); return m && { caps: [...m.querySelectorAll('.sym-cap')].map(x => x.textContent).join(','), n: m.querySelectorAll('.sym-opt').length, first: m.querySelector('.sym-opt b').textContent, other: !!m.querySelector('.sym-new input'), fixed: getComputedStyle(m).position }; });
    ok('Klick auf Symbol öffnet die Auswahl (zuletzt gehandelt, weitere, anderes Symbol)', menu && /Zuletzt gehandelt/.test(menu.caps) && menu.n >= 5 && menu.other && menu.fixed === 'fixed', JSON.stringify(menu));
    await p.click(`#sym-menu .sym-opt[data-sym="${last.sym}"]`); await p.waitForTimeout(150);
    ok('Auswahl setzt Symbol und Punktwert, Liste schließt', (await p.inputValue('#f-symbol')) === last.sym && Number(await p.inputValue('#f-mult')) === Number(last.mult) && !(await p.$('#sym-menu')) && (await p.textContent('#f-symbol-btn')).includes(last.sym), JSON.stringify(last));
    await p.click('#f-symbol-btn'); await p.waitForTimeout(200); await p.fill('#sym-menu .sym-new input', 'xyz'); await p.press('#sym-menu .sym-new input', 'Enter'); await p.waitForTimeout(150);
    ok('„Anderes Symbol“: eigenes Symbol eintippen (Großbuchstaben)', (await p.inputValue('#f-symbol')) === 'XYZ' && !(await p.$('#sym-menu')));
    await p.click('#f-symbol-btn'); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    ok('Escape schließt nur die Liste, nicht das Fenster', !(await p.$('#sym-menu')) && !!(await p.$('.modal #trade-form')));
    await p.click('#f-symbol-btn'); await p.waitForTimeout(200); await p.click(`#sym-menu .sym-opt[data-sym="${last.sym}"]`); await p.waitForTimeout(150);
    await p.fill('#f-entry', '100'); await p.fill('#f-exit', '102'); await p.fill('#f-fees', '3');
    await p.evaluate(() => { const fx = x => { const d = new Date(x - x.getTimezoneOffset() * 6e4); return d.toISOString().slice(0, 16); }; document.querySelector('#f-open').value = fx(new Date(Date.now() - 3600e3)); document.querySelector('#f-close').value = fx(new Date()); });
    const n0 = await p.evaluate(() => Store.trades().length);
    /* Richtung: neu ist nichts gewählt; ohne Wahl wird nicht gespeichert */
    const dir0 = await p.evaluate(() => ({ dir: document.querySelector('#f-dir').dataset.dir, pressed: document.querySelectorAll('#f-dir [aria-pressed="true"]').length, val: document.querySelector('#trade-form [name=direction]').value, prev: document.querySelector('#trade-preview').textContent.trim(), slider: getComputedStyle(document.querySelector('#f-dir'), '::before').opacity }));
    ok('Neuer Trade: weder Long noch Short vorgewählt', dir0.dir === '0' && dir0.pressed === 0 && dir0.val === '' && dir0.slider === '0', JSON.stringify(dir0));
    await p.click('#trade-form button[type=submit]'); await p.waitForTimeout(400);
    ok('Speichern ohne Richtung: nicht gespeichert, Hinweis „Long oder Short wählen“, Schalter markiert', (await p.evaluate(() => Store.trades().length)) === n0 && !!(await p.$('.modal #trade-form')) && /Long oder Short wählen/.test(await p.textContent('.toast-wrap, #toasts, body')) && (await p.evaluate(() => document.querySelector('#f-dir').classList.contains('need'))));
    await p.click('#f-dir [data-value="1"]'); await p.waitForTimeout(300);
    ok('Long gewählt: Fläche erscheint, Markierung weg', (await p.evaluate(() => document.querySelector('#f-dir').dataset.dir === '1' && !document.querySelector('#f-dir').classList.contains('need') && getComputedStyle(document.querySelector('#f-dir'), '::before').opacity === '1')));
    await p.click('#trade-form button[type=submit]'); await p.waitForTimeout(500);
    const nt = await p.evaluate(() => { const t = Store.trades().slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0]; return { n: Store.trades().length, t: { sym: t.symbol, mult: t.multiplier, fees: t.fees, entry: t.entryPrice, exit: t.exitPrice, arrays: Array.isArray(t.mistakes) && Array.isArray(t.emotions) && Array.isArray(t.rulesBroken), stop: t.plannedStop, id: t.id } }; });
    ok('Speichern legt den Trade mit den Daten an (Journal-Felder leer, aber vorhanden)', nt.n === n0 + 1 && nt.t.sym === last.sym.toUpperCase() && Number(nt.t.mult) === Number(last.mult) && nt.t.fees === 3 && nt.t.entry === 100 && nt.t.exit === 102 && nt.t.arrays && nt.t.stop === null, JSON.stringify(nt));
    /* Bearbeiten eines Trades mit Plan und Tags: die Daten ändern, Plan/Tags bleiben erhalten */
    const rich = await p.evaluate(() => { const t = Store.trades().find(x => x.plannedStop != null && x.setup && (x.mistakes || []).length + (x.emotions || []).length > 0) || Store.trades().find(x => x.plannedStop != null && x.setup); return { id: t.id, stop: t.plannedStop, setup: t.setup, mistakes: (t.mistakes || []).slice(), emotions: (t.emotions || []).slice(), notes: t.notes, fees: t.fees }; });
    await p.evaluate(id => App.openTradeEditor(Store.getTrade(id)), rich.id); await p.waitForTimeout(400);
    ok('Trade bearbeiten: ebenfalls nur Trade-Daten', (await p.textContent('.modal-head h2')) === 'Trade bearbeiten' && !(await p.$('#trade-form #f-pstop, #trade-form [data-chips=mistakes]')));
    await p.fill('#f-fees', String((rich.fees || 0) + 1)); await p.click('#trade-form button[type=submit]'); await p.waitForTimeout(400);
    const after = await p.evaluate(id => { const t = Store.getTrade(id); return { stop: t.plannedStop, setup: t.setup, mistakes: t.mistakes, emotions: t.emotions, notes: t.notes, fees: t.fees }; }, rich.id);
    ok('Plan, Setup, Tags und Notiz bleiben beim Bearbeiten der Daten erhalten', after.stop === rich.stop && after.setup === rich.setup && JSON.stringify(after.mistakes) === JSON.stringify(rich.mistakes) && JSON.stringify(after.emotions) === JSON.stringify(rich.emotions) && after.notes === rich.notes && after.fees === (rich.fees || 0) + 1, JSON.stringify({ rich, after }));
    /* Plan & Bewertung am Trade */
    await p.evaluate(id => { location.hash = '#/trades/' + id; }, rich.id); await p.waitForTimeout(800);
    const btns = await p.$$eval('.card [data-action=trade-journal]', e => e.length);
    ok('Trade-Ansicht: „Bearbeiten“ an Plan- und Tags-Karte', btns === 2, String(btns));
    await p.click('.card [data-action=trade-journal]'); await p.waitForTimeout(400);
    ok('„Plan & Bewertung“ mit Stop, Ziel, Setup, Bewertung, Fehler-Tags, Emotionen', (await p.textContent('.modal-head h2')).startsWith('Plan & Bewertung') && !!(await p.$('#trade-form #f-pstop')) && !!(await p.$('#trade-form #f-setup')) && !!(await p.$('#trade-form [data-chips=mistakes]')) && !(await p.$('#trade-form #f-entry')));
    await p.fill('#f-pstop', String(rich.stop - 1)); await p.click('#trade-form [data-chips=emotions] .chip[data-value]'); await p.click('#trade-form button[type=submit]'); await p.waitForTimeout(400);
    const j = await p.evaluate(id => { const t = Store.getTrade(id); return { stop: t.plannedStop, emo: t.emotions.length, fees: t.fees }; }, rich.id);
    ok('Plan & Bewertung speichert Stop und Emotion, Trade-Daten bleiben', j.stop === rich.stop - 1 && j.emo !== rich.emotions.length && j.fees === (rich.fees || 0) + 1, JSON.stringify(j));
    await p.evaluate(([id, r]) => { Store.updateTrade(id, { plannedStop: r.stop, emotions: r.emotions, fees: r.fees }); const x = Store.trades().find(t => t.id === r.newId); }, [rich.id, rich]);
    await p.evaluate(id => { const t = Store.getTrade(id); if (t && Store.deleteTrade) Store.deleteTrade(id); Store.saveNow(); }, nt.t.id);
    /* Handy */
    await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(() => { location.hash = '#/trades'; App.openTradeEditor(null); }); await p.waitForTimeout(600);
    const ph = await p.evaluate(() => { const m = document.querySelector('.modal'); const btns = [...m.querySelectorAll('.modal-foot .btn')].map(x => Math.round(x.getBoundingClientRect().top)); return { over: m.scrollWidth > m.clientWidth + 1, sameRow: btns.length === 2 && btns[0] === btns[1], fits: m.scrollHeight <= innerHeight }; });
    ok('Handy: passt in Breite und Höhe, Knöpfe nebeneinander', !ph.over && ph.sameRow && ph.fits, JSON.stringify(ph));
    ok('keine Seitenfehler', !errors.length, errors.join(' | '));
  } catch (e) { console.log('CRASH ' + e.message); }
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors'); console.log(`${pass} PASS, ${fail} FAIL`);
  await b.close();
})();
