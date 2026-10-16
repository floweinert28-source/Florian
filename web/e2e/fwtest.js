/* Bereichs-Widgets auf dem Dashboard: Migration, Darstellung, Bibliothek, Knöpfe (Replay, Ruhepunkt, Mentor), gleiche Zahlen wie die Seiten, Handy */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FEAT = ['schatten_ich', 'blind_replay', 'prop_konten', 'ruhepunkt', 'mentor'];
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } }); await p.addInitScript(() => { try { localStorage.setItem('jy_features', '{"replay":true}'); } catch (e) {} }); /* Blind-Replay ist zurückgestellt: für diese Suite freischalten */ p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'warning' && /Widget/.test(m.text())) errs.push(m.text()); });
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* 1) Migration */
  await p.evaluate(F => { const d = JSON.parse(localStorage.getItem('trading-journal-web-v1')); d.dashboardsVersion = 3; d.dashboards.forEach(x => { x.layout.unten = x.layout.unten.filter(w => !F.includes(w.typ)); }); d.settings.range = { preset: 'all', from: null, to: null }; localStorage.setItem('trading-journal-web-v1', JSON.stringify(d)); }, FEAT);
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200);
  const lay = await p.evaluate(() => Store.dashboards().find(d => d.isDefault).layout.unten.map(w => w.typ));
  ok(FEAT.every(t => lay.filter(x => x === t).length === 1) && lay.indexOf('schatten_ich') > lay.indexOf('kalender'), 'Migration: fünf Bereichs-Karten einmal am Ende des Standard-Dashboards · ' + lay.join(','));
  await p.evaluate(() => { const d = Store.dashboards().find(x => x.isDefault); d.layout.unten = d.layout.unten.filter(w => w.typ !== 'mentor'); Store.saveNow(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => !Store.dashboards().find(d => d.isDefault).layout.unten.some(w => w.typ === 'mentor') && Store.data.dashboardsVersion >= 4), 'Entfernte Karte bleibt entfernt (keine Wiederholung der Migration)');
  await p.evaluate(() => { const d = Store.dashboards().find(x => x.isDefault); d.layout.unten.push({ typ: 'mentor', groesse: 'klein' }); Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(800);
  /* 2) Darstellung */
  const cards = await p.evaluate(F => F.map(t => { const w = [...document.querySelectorAll('.dash-main > .w')].find(x => x.querySelector('.card-title') && x.dataset && (x.dataset.typ === t || x.querySelector(`[data-typ="${t}"]`)) ); return null; }), FEAT);
  const titles = await p.$$eval('.dash-main .card-title', els => els.map(e => e.textContent.trim()));
  ok(['Schatten-Ich', 'Blind-Replay', 'Prop-Konten', 'Ruhepunkt', 'Mentor'].every(t => titles.includes(t)), 'Alle fünf Karten sichtbar · ' + titles.join(' | '));
  ok(!(await p.evaluate(() => /konnte nicht berechnet werden|ist hier nicht geladen|Unbekanntes Widget/.test(document.getElementById('content').textContent))), 'Keine Fehler- oder Fehlt-Hinweise in den Karten');
  ok(await p.evaluate(() => !!document.querySelector('[data-id="dash-schatten"] svg') && document.querySelectorAll('.fw-rounds i').length >= 2 && document.querySelectorAll('.fw-acc').length >= 1 && document.querySelectorAll('.fw-rp').length === 2 && (!!document.querySelector('form.fw-mentor') || /Mentor noch nicht eingerichtet/.test(document.getElementById('content').textContent))), 'Inhalte: Schatten-Kurve, Replay-Runden, Prop-Konten, Ruhepunkt-Zeilen, Mentor-Feld oder Einrichten-Hinweis');
  /* gleiche Zahl wie die Schatten-Ich-Seite (Zeitraum Gesamt) */
  await p.evaluate(() => { Store.data.settings.range = { preset: 'all', from: null, to: null }; Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(600); /* Zeitraum über die App setzen: ein Speichern beim Neuladen kann den Eintrag im localStorage überschreiben */
  const sh = await p.evaluate(() => { const res = ShadowScreen.evaluate(App.allTrades()); const all = res.periods.all; const cost = all.cost != null ? all.cost : all.shadow - all.real; return { want: ShadowScreen.costView(cost).text, got: document.querySelector('.fw-stats b').textContent.trim() }; });
  ok(sh.want === sh.got, `Disziplin-Kosten wie auf der Schatten-Ich-Seite (${sh.got}${sh.want !== sh.got ? " ≠ Seite " + sh.want : ""})`);
  const rp = await p.evaluate(() => { const st = Replay.stats(Store.replayHistory(), App.allTrades()); return { want: UI.fmt.pct(st.hitRate, 0), got: document.querySelector('.fw-big').textContent.trim() }; });
  ok(rp.want === rp.got, `Replay-Trefferquote wie auf der Replay-Seite (${rp.got})`);
  /* 3) Kacheln oben */
  await p.evaluate(() => { const ob = Store.dashboards().find(x => x.isDefault).layout.oben; ob.splice(2, 3, { typ: 'disziplin_kosten' }, { typ: 'replay_quote' }, { typ: 'prop_status' }); Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(700);
  const tiles = await p.$$eval('.dash-top .tile', els => els.map(e => e.querySelector('.head span').textContent.trim() + '=' + e.querySelector('.val').textContent.trim()));
  ok(tiles.some(t => t.startsWith('Disziplin-Kosten=')) && tiles.some(t => /^Blind-Replay=\d+\s?%/.test(t)) && tiles.some(t => /^Prop-Konten=\d+/.test(t)), 'Kacheln: Disziplin-Kosten, Blind-Replay, Prop-Konten · ' + tiles.join(' | '));
  /* 4) Bibliothek */
  await p.click('.dash-head [data-pop=tpl]'); await p.waitForTimeout(200); await p.click('#pop-tpl .tpl-row.on [data-action="dash-tpl-menu"]'); await p.waitForTimeout(120); await p.click('#pop-tpl .tpl-menu [data-action="dash-tpl-edit"]'); await p.waitForTimeout(400);
  await p.click('.add-slot[data-area="unten"]'); await p.waitForTimeout(500);
  const lib = await p.evaluate(() => { const L = document.getElementById('dash-add-list'); const g = [...L.querySelectorAll('.sp-group')].map(x => x.textContent); const first = [...L.children]; const idx = first.findIndex(x => x.classList.contains('sp-group') && x.textContent === 'Bereiche der App'); const feat = first.slice(idx + 1).filter(x => x.classList.contains('sp-item')).map(x => x.querySelector('b').textContent); const pv = [...L.querySelectorAll('.sp-item')].slice(0, 5).every(x => x.querySelector('svg.wpv text')); return { g, feat, pv }; });
  ok(lib.g.join('|') === 'Auswertungen|Bereiche der App' && lib.feat.slice().sort().join(',') === 'Blind-Replay,Mentor,Prop-Konten,Ruhepunkt,Schatten-Ich' && lib.pv, 'Widget-Bibliothek: erst „Auswertungen“, dann „Bereiche der App“, mit Vorschaubildern · ' + JSON.stringify(lib));
  await p.fill('#dash-add-q', 'ruhe'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => { const L = document.getElementById('dash-add-list'); return L.querySelectorAll('.sp-item').length === 1 && L.querySelectorAll('.sp-group').length === 1; }), 'Suche „ruhe“: nur Ruhepunkt, nur eine Gruppe');
  await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* 5) Knöpfe */
  await p.evaluate(() => document.querySelector('[data-action="replay-go"]').click()); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => location.hash === '#/replay' && /Trade 1 von 10/.test(document.getElementById('content').textContent) && !!document.querySelector('.replay-shot img')), 'Session starten: Replay öffnet direkt mit Trade 1 von 10');
  await p.evaluate(() => { App.state.replay.session = null; location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('.fw-rp [data-action="rp-open"][data-flow="vor"]').click()); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => location.hash === '#/ruhepunkt' && !!Ruhepunkt.session() && !document.getElementById('rp-homebtn').hidden), 'Ruhepunkt „Vor dem Trading“: Ablauf startet direkt');
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => /Mentor noch nicht eingerichtet/.test(document.getElementById('content').textContent) && !!document.querySelector('.dash-main a[href="#/mentor"].btn')), 'Mentor ohne Server: Karte sagt „noch nicht eingerichtet“ mit Einrichten-Knopf');
  await p.evaluate(() => { Store.setSetting('mentor', { url: 'http://127.0.0.1:9', token: '' }); App.rerender(false); }); await p.waitForTimeout(500); /* Testadresse: niemand antwortet, die Seite bleibt bedienbar */
  await p.evaluate(() => document.querySelector('.fw-chips [data-action="mentor-ask"]').click()); await p.waitForTimeout(2500);
  ok(await p.evaluate(() => location.hash === '#/mentor' && !!document.querySelector('.ai-consent') && App.state.mentor.draft === 'Wie war meine Woche?'), 'Mentor-Vorschlag ohne Einwilligung: erst die KI-Einwilligung, der Vorschlag wartet als Entwurf');
  await p.evaluate(() => document.querySelector('[data-action="ai-consent"]').click()); await p.waitForTimeout(800);
  ok(await p.evaluate(() => document.getElementById('mentor-in') && document.getElementById('mentor-in').value === 'Wie war meine Woche?'), 'Mentor-Vorschlag: nach Zustimmung im Eingabefeld des Mentors');
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('form.fw-mentor button[type=submit]').click()); await p.waitForTimeout(400);
  ok(await p.evaluate(() => location.hash === '#/dashboard'), 'Leere Frage: bleibt auf dem Dashboard (Hinweis statt Sprung)');
  /* 6) Handy */
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true }); await m.addInitScript(() => { try { localStorage.setItem('jy_features', '{"replay":true}'); } catch (e) {} }); /* Blind-Replay ist zurückgestellt: für diese Suite freischalten */ m.on('pageerror', e => errs.push('phone ' + e.message));
  await m.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await m.waitForTimeout(1200);
  ok(await m.evaluate(() => document.documentElement.scrollWidth <= 390 && document.querySelectorAll('.fw-rp').length === 2), 'Handy: kein Überlauf, Karten da');
  await p.evaluate(() => Store.setSetting('mentor', { url: '', token: '' }));
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
