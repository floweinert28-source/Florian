/* Affiliate: eigener Bereich in der Gruppe Konten mit zwei Ansichten (Alle Creator / Creator-Ansicht), Beispieldaten, Provision je Creator */
const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/sample-dev.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
const num = s => Number(String(s).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  try {
    await p.goto(base + '#/affiliate', { waitUntil: 'load' }); await p.waitForTimeout(900);
    await p.evaluate(() => { Store.setSetting('affiliate', { pct: {}, creatorId: '' }); App.rerender(); }); await p.waitForTimeout(300);
    const nav = await p.evaluate(() => [...document.querySelectorAll('.sidebar .nav a')].map(a => a.getAttribute('href')));
    const um = await p.evaluate(() => [...document.querySelectorAll('#pop-user .item')].map(a => a.getAttribute('href') + (a.classList.contains('on') ? '*' : '')));
    ok('Affiliate als Bereich unten in der Leiste (aktiv), nicht im Konto-Menü', nav.join(',') === '#/affiliate' && !!(await p.$('.rail-item[data-rail=affiliate].active svg')) && !um.some(h => /affiliate|coach/.test(h)) && !(await p.$('.sb-user.active')), JSON.stringify({ nav, um }));
    ok('Titel „Affiliate“, kein Zeitraum-/Konto-Kopf, Marke „Beispieldaten“', (await p.textContent('.topbar h1')).trim() === 'Affiliate' && !(await p.$('#content [data-action=range-open]')) && (await p.textContent('.aff-top .pill')).trim() === 'Beispieldaten');
    ok('Umschalter: „Alle Creator“ aktiv, „Creator-Ansicht“ als zweiter Reiter', (await p.$$eval('.aff-top .prop-tabs a', a => a.map(x => x.textContent.trim() + ':' + x.getAttribute('aria-pressed')).join(','))) === 'Alle Creator:true,Creator-Ansicht:false');
    /* Admin: Kennzahlen stimmen mit den Daten überein */
    const exp = await p.evaluate(() => { const d = AffiliateData.build(new Date()); const by = Object.fromEntries(d.creators.map(c => [c.id, c])); let rev = 0, earned = 0; for (const k of d.customers) { rev += k.amount; earned += k.amount * by[k.creatorId].pct / 100; } return { creators: d.creators.length, n: d.customers.length, rev, earned }; });
    const tiles = await p.$$eval('.kstrip .tile', ts => ts.map(t => [t.querySelector('.head span').textContent.trim(), t.querySelector('.val').textContent.trim()]));
    ok('Kacheln: Kunden, Umsatz, Provisionen, Offen; „n Creator“ am Kartenkopf; Zeile öffnet den Creator', tiles.map(t => t[0]).join(',') === 'Kunden,Umsatz,Provisionen,Offen' && num(tiles[0][1]) === exp.n && Math.abs(num(tiles[1][1]) - exp.rev) < 1 && Math.abs(num(tiles[2][1]) - exp.earned) < 0.01 && (await p.textContent('.card:has(.aff-tbl) .card-head')).includes(`${exp.creators} Creator`) && (await p.$$('.aff-tbl tbody tr.link[data-action=aff-view]')).length === exp.creators, JSON.stringify({ tiles, exp }));
    const rows = await p.$$eval('.aff-tbl tbody tr', rs => rs.map(r => [...r.children].map(td => td.textContent.trim())));
    const head = await p.$$eval('.aff-tbl thead th', a => a.map(x => x.textContent.trim()).join(','));
    ok('Tabelle je Creator: Name, Code, Kunden, Umsatz, Provision, Verdient, Offen; nach Verdienst sortiert', head === 'Creator,Code,Kunden,Umsatz,Provision,Verdient,Offen,' && rows.length === exp.creators && rows.every((r, i) => i === 0 || num(rows[i - 1][5]) >= num(r[5])) && rows.reduce((a, r) => a + num(r[2]), 0) === exp.n, head + ' ' + JSON.stringify(rows[0]));
    const r0 = rows[0]; ok('Verdient = Umsatz × Provision', Math.abs(num(r0[3]) * num(r0[4]) / 100 - num(r0[5])) < 0.02, JSON.stringify(r0));
    ok('Diagramm „Provisionen je Monat“ mit 8 Balken', (await p.$$('.chart[data-chart=affbars] rect')).length === 8 && (await p.textContent('.chart[data-chart=affbars]')).length > 0);
    /* Provision ändern */
    const firstId = await p.getAttribute('.aff-tbl tbody tr:first-child [data-action=aff-pct]', 'data-id');
    await p.click('.aff-tbl tbody tr:first-child [data-action=aff-pct]'); await p.waitForTimeout(300);
    ok('Provision-Dialog mit Prozentfeld (0–100)', !!(await p.$('.modal input#aff-pct-in[type=number][min="0"][max="100"]')));
    await p.fill('#aff-pct-in', '150'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(250);
    ok('Ungültiger Wert (150) wird abgelehnt, Dialog bleibt offen', !!(await p.$('.modal')) && (await p.$eval('#aff-pct-in', i => !i.validity.valid)) && (await p.evaluate(id => Store.settings.affiliate.pct[id] == null, firstId)));
    await p.fill('#aff-pct-in', '40'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(400);
    const after = await p.evaluate(id => { const tr = document.querySelector(`.aff-tbl [data-id="${id}"]`).closest('tr'); return { pct: tr.children[4].textContent.trim(), rev: tr.children[3].textContent.trim(), earned: tr.children[5].textContent.trim(), saved: Store.settings.affiliate.pct[id] }; }, firstId);
    ok('Neue Provision gespeichert (40 %) und Verdient neu berechnet', !(await p.$('.modal')) && after.saved === 40 && num(after.pct) === 40 && Math.abs(num(after.rev) * 0.4 - num(after.earned)) < 0.02, JSON.stringify(after));
    await p.reload(); await p.waitForTimeout(800);
    ok('Provision bleibt nach Neuladen erhalten', await p.evaluate(id => Store.settings.affiliate.pct[id] === 40, firstId));
    /* Creator-Ansicht über den Pfeil */
    const name = await p.textContent('.aff-tbl tbody tr:nth-child(2) .aff-name');
    await p.click('.aff-tbl tbody tr:nth-child(2) [data-action=aff-view].btn'); await p.waitForTimeout(700);
    ok('Pfeil öffnet die Creator-Ansicht dieses Creators', (await p.evaluate(() => location.hash)) === '#/affiliate/creator' && (await p.$eval('.aff-pick', s => s.options[s.selectedIndex].textContent)) === name, name);
    const c = await p.evaluate(() => { const d = AffiliateData.build(new Date()); return d.creators.find(x => x.id === Store.settings.affiliate.creatorId); });
    ok('Eine Teilen-Karte: Link als Ticket, darunter „oder Code“ mit Kopier-Symbol', (await p.textContent('.aff-share .aff-ticket .cpn-code')).trim() === 'https://journalyst.app/?ref=' + c.code && (await p.textContent('.aff-code-row b')).trim() === c.code && (await p.$$('.aff-share .aff-ticket')).length === 1);
    await p.click('.aff-code-row [data-action=aff-copy]'); await p.waitForTimeout(300);
    ok('Klick auf den Code kopiert ihn', /Code kopiert|Kopieren nicht möglich/.test(await p.textContent('.toast-wrap')));
    const ct = await p.$$eval('.kstrip .tile', ts => ts.map(t => t.querySelector('.head span').textContent.trim()).join(','));
    ok('Creator-Kacheln: Verdient, Offen, Kunden (Link/Code), Provision', ct === 'Verdient,Offen,Kunden,Provision' && /Link \d+ · Code \d+/.test(await p.textContent('.kstrip .tile:nth-child(3) .foot')), ct);
    const crow = await p.$$eval('.aff-tbl tbody tr', rs => rs.length);
    ok('Kundenliste: 10 Einträge, „Mehr anzeigen“ lädt weitere', crow === 10 && !!(await p.$('[data-action=aff-more]')));
    await p.click('[data-action=aff-more]'); await p.waitForTimeout(300);
    ok('Nach „Mehr anzeigen“ mehr Einträge', (await p.$$eval('.aff-tbl tbody tr', rs => rs.length)) > 10);
    ok('Status: laufender Monat offen, ältere ausgezahlt', await p.evaluate(() => { const m = new Date(); const cur = `${String(m.getMonth() + 1).padStart(2, '0')}.${m.getFullYear()}`; return [...document.querySelectorAll('.aff-tbl tbody tr')].every(tr => { const d = tr.children[0].textContent.trim(); const st = tr.lastElementChild.textContent.trim(); return d.endsWith(cur) ? st === 'Offen' : st === 'Ausgezahlt'; }); }));
    /* Auswahl wechseln */
    await p.selectOption('.aff-pick', { index: 0 }); await p.waitForTimeout(400);
    const sel = await p.evaluate(() => Store.settings.affiliate.creatorId);
    ok('Creator-Auswahl wechselt die Ansicht und wird gemerkt', !!sel && (await p.textContent('.aff-code-row b')).trim() === (await p.evaluate(id => AffiliateData.build(new Date()).creators.find(x => x.id === id).code, sel)));
    await p.screenshot({ path: 'affiliate-creator.png', fullPage: true });
    await p.evaluate(() => { Store.setSetting('affiliate', { pct: {}, creatorId: '' }); });
    ok('keine Seitenfehler', !errors.length, errors.join(' | '));
  } catch (e) { console.log('CRASH ' + e.message); }
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no errors'); console.log(`${pass} PASS, ${fail} FAIL`);
  await b.close();
})();
