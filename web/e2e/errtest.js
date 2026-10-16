/* Fehler freundlich melden: keine Statuscodes, Server-Texte mit Technik-Namen, Fehlerklassen oder Stacktraces in der Oberfläche.
   Mentor, Verbindung testen, News, Coach, Beispieldaten-Banner und Startfehler-Seite; Details nur in der Konsole */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
const SRV = 'https://mentor.test.invalid';
const RAW = /\b(4\d\d|5\d\d)\b|RuntimeError|TypeError|ANTHROPIC|VOICE_STT|undefined|stack|Failed to fetch|at \w+ \(/; /* was nie sichtbar sein darf */
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); const warns = []; p.on('console', m => { if (m.type() === 'warning' || m.type() === 'error') warns.push(m.text()); });
  try { await require('./localfonts.js')(p); } catch (e) {}
  /* gestellter Server: je nach Zustand Fehler mit technischen Details */
  let mode = 'model';
  await p.route(SRV + '/**', r => { const u = r.request().url();
    if (mode === 'down') return r.abort('connectionrefused');
    if (u.includes('/api/mentor/history')) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ messages: [], quota: { used: 0, limit: 30, remaining: 30 } }) });
    if (u.includes('/api/mentor/health')) return r.fulfill({ status: 503, contentType: 'application/json', body: '{"detail":"Service Unavailable"}' });
    if (u.includes('/api/news')) return r.fulfill({ status: 500, contentType: 'text/plain', body: 'Internal Server Error' });
    if (u.includes('/api/mentor/chat')) return mode === 'model' ? r.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ detail: { error: 'model', message: 'Das Sprachmodell hat nicht geantwortet: RuntimeError' } }) })
      : mode === 'key' ? r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ detail: { error: 'key', message: 'Auf dem Server ist kein ANTHROPIC_API_KEY gesetzt.' } }) })
      : mode === 'limit' ? r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ detail: { error: 'limit', message: 'Tageslimit von 30 Nachrichten erreicht.', quota: { used: 30, limit: 30, remaining: 0 } } }) })
      : r.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ detail: [{ loc: ['body', 'message'], msg: 'field required', type: 'value_error.missing' }] }) });
    return r.fulfill({ status: 404, body: 'Not Found' }); });
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(s => { Store.setSetting('mentor', { url: s, token: 'x' }); }, SRV);
  /* Mentor: Modell-Fehler (502 mit Fehlerklasse) */
  const send = async () => { await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(700); await p.fill('#mentor-in', 'Hallo'); await p.press('#mentor-in', 'Enter'); await p.waitForTimeout(900); return p.evaluate(() => { const e = document.querySelector('.mentor-err, .mentor .banner, [data-mentor-error]'); return (e ? e.textContent : '') + ' || ' + document.getElementById('main').innerText; }); };
  let t = await send();
  ok(/Der Mentor konnte gerade nicht antworten/.test(t) && !RAW.test(t), 'Mentor 502: freundlicher Satz, kein Status, keine Fehlerklasse');
  mode = 'key'; t = await send();
  ok(/noch nicht fertig eingerichtet/.test(t) && !RAW.test(t), 'Mentor 503 ohne Schlüssel: „noch nicht fertig eingerichtet“, kein Variablenname');
  mode = 'input'; t = await send();
  ok(/Die Angaben passen nicht/.test(t) && !/field required/.test(t), 'Mentor 422 (Prüffehler des Servers): kein englischer Technik-Text');
  mode = 'down'; t = await send();
  ok(/Keine Verbindung zum Server/.test(t) && !RAW.test(t), 'Mentor ohne Verbindung: „Keine Verbindung zum Server“');
  mode = 'limit'; t = await send();
  ok(/alle Nachrichten an den Mentor verbraucht/.test(t) && !RAW.test(t), 'Mentor 429: Limit freundlich erklärt');
  ok(await p.evaluate(() => document.getElementById('mentor-in').disabled), 'Nach dem Limit: Eingabe gesperrt');
  ok(warns.some(w => /\[mentor\]/.test(w) && /502|RuntimeError|Das Sprachmodell/.test(w)), 'Details landen in der Konsole · ' + warns.filter(w => /\[mentor\]/.test(w)).length + ' Einträge');
  /* Einstellungen → Mentor: Verbindung testen */
  mode = 'model'; await p.evaluate(() => { location.hash = '#/settings/mentor'; }); await p.waitForTimeout(700);
  await p.click('[data-action="mentor-test"]'); await p.waitForTimeout(900);
  t = await p.evaluate(() => document.getElementById('mentor-test-out').textContent);
  ok(/Der Server hat gerade ein Problem/.test(t) && !RAW.test(t), 'Verbindung testen (503): freundlich, ohne Status · ' + t);
  /* News: 500 als Text */
  await p.evaluate(() => { location.hash = '#/news'; }); await p.waitForTimeout(1200);
  t = await p.evaluate(() => document.getElementById('main').innerText);
  ok(/Der Server hat gerade ein Problem/.test(t) && !/\b500\b|Internal Server Error/.test(t), 'News 500: freundlicher Satz statt „Fehler 500“');
  /* Coach: nur Texte, die der Server für Nutzer schreibt, kommen durch */
  const coach = await p.evaluate(() => { const U = UI; return [U.friendly({ status: 404, code: 'invite', serverMessage: 'Dieser Einladungslink ist ungültig oder die Gruppe wurde geschlossen.' }, 'coach'), U.friendly({ status: 422, code: 'period', serverMessage: 'Zeitraum ist week, month oder all.' }, 'coach'), U.friendly({ status: 0 }, 'coach'), U.friendly({ status: 401, code: 'auth' }, 'coach')]; });
  ok(coach[0].startsWith('Dieser Einladungslink') && coach[1] === 'Die Angaben passen nicht. Prüf sie und versuch es noch einmal.' && /Keine Verbindung/.test(coach[2]) && /Zugang abgelehnt/.test(coach[3]), 'Coach: Nutzertext durch, Technik-Text ersetzt · ' + JSON.stringify(coach));
  /* Beispieldaten-Banner: kein Stack, Fehlerbericht zum Kopieren */
  await p.evaluate(() => { Store.settings.sampleError = { message: 'TypeError: x is undefined', stack: 'TypeError: x is undefined\n    at installSample (store.js:280:5)', at: '2026-10-16T10:00:00Z', ua: 'Test' }; location.hash = '#/dashboard'; App.rerender(); }); await p.waitForTimeout(700);
  t = await p.evaluate(() => { const bn = [...document.querySelectorAll('.banner')].find(x => /Beispieldaten/.test(x.textContent)); return bn ? bn.innerText + ' ' + bn.innerHTML : ''; });
  ok(/Deine eigenen Daten sind nicht betroffen/.test(t) && !/TypeError|installSample|undefined|<pre/.test(t) && /sample-error-copy/.test(t), 'Beispieldaten-Banner: freundlich, ohne Meldung und Stack, mit „Fehlerbericht kopieren“');
  await p.context().grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  await p.click('[data-action="sample-error-copy"]'); await p.waitForTimeout(400);
  const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  ok(/installSample/.test(clip) && /TypeError/.test(clip), 'Fehlerbericht enthält die technischen Details (nur in der Zwischenablage)');
  await p.evaluate(() => { delete Store.settings.sampleError; Store.save(); });
  /* Startfehler-Seite: Store.load wirft beim Start */
  const q = await b.newPage({ viewport: { width: 1280, height: 900 } }); try { await require('./localfonts.js')(q); } catch (e) {}
  await q.addInitScript(() => { Object.defineProperty(window, 'Store', { configurable: true, set(v) { v.load = () => { throw new TypeError('Cannot read properties of undefined (reading \'x\')'); }; Object.defineProperty(window, 'Store', { value: v, writable: true, configurable: true }); }, get() { return undefined; } }); });
  await q.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await q.waitForTimeout(800);
  const sf = await q.evaluate(() => ({ text: document.getElementById('main').innerText, btns: [...document.querySelectorAll('#main button')].map(x => x.id) }));
  ok(/Journalyst konnte nicht starten/.test(sf.text) && /Deine Daten sind nicht verloren/.test(sf.text) && !/TypeError|reading|Mozilla|at /.test(sf.text), 'Startfehler: freundlicher Text, kein Stack, keine Browser-Kennung · ' + sf.text.slice(0, 80));
  ok(sf.btns.join() === 'sf-reload,sf-sample,sf-copy,sf-reset', 'Startfehler: Neu laden, Beispieldaten entfernen, Fehlerbericht kopieren, Alles löschen · ' + sf.btns.join());
  await q.click('#sf-reset'); await q.waitForTimeout(200);
  ok(await q.evaluate(() => /Wirklich alles löschen/.test(document.getElementById('sf-reset').textContent) && localStorage.getItem('trading-journal-web-v1') !== null || /Wirklich alles löschen/.test(document.getElementById('sf-reset').textContent)), 'Alles löschen fragt erst nach (zweiter Klick), statt confirm()');
  await q.close();
  /* Englisch: freundliche Sätze übersetzt */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); location.hash = '#/news'; }); await p.waitForTimeout(1000);
  t = await p.evaluate(() => document.getElementById('main').innerText);
  ok(/The server is having a problem/.test(t), 'Englisch: „The server is having a problem …“');
  await p.evaluate(async () => { Store.setLanguage('de'); I18N.setLang('de'); await new Promise(r => setTimeout(r, 500)); });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
