/* Mentor-Antwort nach und nach (Streaming) und „Alles löschen“ mit den Daten auf dem eigenen Server.
   Ein kleiner Test-Server schickt die Antwort in Stücken mit Pausen, damit das schrittweise Anzeigen und der Abbruch sichtbar sind */
const { chromium } = require('playwright');
const http = require('http');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
const calls = []; let mode = 'stream', closedEarly = 0;
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Coach-Key', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, PATCH' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  calls.push(req.method + ' ' + u.pathname);
  const json = (st, b) => { res.writeHead(st, Object.assign({ 'Content-Type': 'application/json' }, cors)); res.end(JSON.stringify(b)); };
  if (u.pathname === '/api/mentor/history' && req.method === 'GET') return json(200, { messages: [], quota: { used: 0, limit: 30, remaining: 30 } });
  if (u.pathname === '/api/mentor/history' && req.method === 'DELETE') return mode === 'down' ? json(500, { detail: { error: 'x', message: 'kaputt' } }) : json(200, { ok: true, deleted: 2 });
  if (u.pathname === '/api/coach/me' && req.method === 'DELETE') return json(200, { ok: true, deleted: { users: 1 } });
  if (u.pathname === '/api/mentor/chat') return json(200, { reply: 'Am Stück.', at: new Date().toISOString(), quota: { used: 1, limit: 30, remaining: 29 } });
  if (u.pathname === '/api/mentor/chat/stream') {
    if (mode === 'old') return json(404, { detail: 'Not Found' });
    res.writeHead(200, Object.assign({ 'Content-Type': 'application/x-ndjson' }, cors));
    const parts = mode === 'error' ? ['Halb'] : ['Atme ', 'kurz ', 'durch.']; let i = 0, gone = false; req.on('close', () => { if (!res.writableEnded) { gone = true; closedEarly++; } });
    const tick = () => { if (gone) return; if (i < parts.length) { res.write(JSON.stringify({ t: 'delta', text: parts[i++] }) + '\n'); return setTimeout(tick, mode === 'slow' ? 1500 : 500); }
      res.end(JSON.stringify(mode === 'error' ? { t: 'error', error: 'model', message: 'kaputt' } : { t: 'done', reply: parts.join(''), at: new Date().toISOString(), quota: { used: 1, limit: 30, remaining: 29 } }) + '\n'); };
    return tick();
  }
  json(404, {});
});
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const URLS = 'http://127.0.0.1:' + srv.address().port;
  const b = await chromium.launch(); const errs = []; const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(700);
  await p.evaluate(s => { Store.setSetting('mentor', { url: s, token: 'x' }); Store.setSetting('aiConsent', { mentor: new Date().toISOString() }); }, URLS);
  await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(800);
  /* 1: Antwort erscheint Stück für Stück */
  await p.fill('#mentor-in', 'Bin nervös.'); await p.press('#mentor-in', 'Enter'); await p.waitForTimeout(800);
  const mid = await p.evaluate(() => { const s = document.querySelector('.msg.ai.streaming'); return { text: s ? s.textContent : '', busy: s && s.getAttribute('aria-busy'), stop: !!document.querySelector('[data-action=mentor-cancel]') }; });
  ok(/^Atme/.test(mid.text) && !/durch\./.test(mid.text) && mid.busy === 'true' && mid.stop, 'Während der Antwort: erste Stücke sichtbar, Rest kommt noch, Stopp-Knopf da · ' + JSON.stringify(mid));
  await p.waitForTimeout(1600);
  const end = await p.evaluate(() => ({ last: [...document.querySelectorAll('.msg.ai')].pop().textContent, streaming: !!document.querySelector('.msg.ai.streaming'), send: !!document.querySelector('.mentor-form button[type=submit]') }));
  ok(/Atme kurz durch\./.test(end.last) && !end.streaming && end.send, 'Fertig: ganze Antwort als normale Nachricht, Senden wieder da · ' + JSON.stringify(end));
  /* 2: Abbruch mitten in der Antwort: Server merkt es, Hinweis sagt „zählt nicht“ */
  mode = 'slow'; await p.fill('#mentor-in', 'Noch eine Frage.'); await p.press('#mentor-in', 'Enter'); await p.waitForTimeout(700);
  await p.click('[data-action=mentor-cancel]'); await p.waitForTimeout(800);
  const ab = await p.evaluate(() => ({ notice: (document.querySelector('.mentor-notice') || {}).textContent || '', err: !!document.querySelector('.mentor-err'), streaming: !!document.querySelector('.msg.ai.streaming, .msg.ai.typing'), user: [...document.querySelectorAll('.msg.user')].map(m => m.textContent).join('|') }));
  ok(/zählt nicht/.test(ab.notice) && !ab.err && !ab.streaming && /Noch eine Frage/.test(ab.user) && closedEarly === 1, 'Abbruch: Verbindung beendet, Hinweis „zählt nicht für dein Tageslimit“, Nachricht bleibt sichtbar · ' + JSON.stringify(ab) + ' closed=' + closedEarly);
  /* 3: Fehler mitten in der Antwort: freundliche Meldung, Text zurück ins Eingabefeld */
  mode = 'error'; await p.fill('#mentor-in', 'Dritte.'); await p.press('#mentor-in', 'Enter'); await p.waitForTimeout(1500);
  const er = await p.evaluate(() => ({ err: (document.querySelector('.mentor-err') || {}).textContent || '', draft: document.getElementById('mentor-in').value, half: !!document.querySelector('.msg.ai.streaming') }));
  ok(/konnte gerade nicht antworten/.test(er.err) && er.draft === 'Dritte.' && !er.half && !/kaputt/.test(er.err), 'Fehler: freundlich, ohne Server-Text, Nachricht wieder im Eingabefeld · ' + JSON.stringify(er));
  /* 4: älterer Server ohne Streaming: Antwort am Stück */
  mode = 'old'; await p.fill('#mentor-in', 'Vierte.'); await p.press('#mentor-in', 'Enter'); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => /Am Stück\./.test([...document.querySelectorAll('.msg.ai')].pop().textContent)) && calls.includes('POST /api/mentor/chat'), 'Älterer Server (404): normale Anfrage, Antwort am Stück');
  /* 5: Alles löschen: Liste im Fenster, erst Server (Mentor, Coach), dann Browser */
  mode = 'stream'; await p.evaluate(() => { Coach.data().key = 'testkey-0123456789abcdef'; Store.saveNow(); location.hash = '#/settings/profil'; }); await p.waitForTimeout(700);
  const n0 = Object.keys(calls).length; const before = await p.evaluate(() => Store.trades().length);
  await p.evaluate(() => { App.actions.wipe.call(App); }); await p.waitForTimeout(500);
  const dlg = await p.evaluate(() => [...document.querySelectorAll('.modal .wipe-li')].map(x => x.textContent));
  ok(dlg.length === 3 && /Browser/.test(dlg[0]) && /Mentor/.test(dlg[1]) && /Coach Mode/.test(dlg[2]), 'Löschen: Fenster nennt Browser, Mentor-Verlauf und Coach-Daten · ' + dlg.join(' | '));
  await p.click('.modal .btn.danger'); await p.waitForTimeout(1200);
  const after = calls.slice(n0); const wiped = await p.evaluate(() => Store.trades().length);
  ok(after.includes('DELETE /api/mentor/history') && after.includes('DELETE /api/coach/me') && wiped < before, 'Bestätigt: Mentor-Verlauf und Coach-Daten auf dem Server gelöscht, dann der Browser · ' + after.join(','));
  /* 6: Server nicht erreichbar: erst fragen, Abbrechen löscht nichts */
  await p.evaluate(s => { Store.installSample(); Store.setSetting('mentor', { url: s, token: 'x' }); Store.saveNow(); }, URLS); await p.waitForTimeout(300); mode = 'down'; /* nach dem Löschen ist auch die Server-Adresse weg */
  const b2 = await p.evaluate(() => Store.trades().length);
  await p.evaluate(() => { App.actions.wipe.call(App); }); await p.waitForTimeout(400); await p.click('.modal .btn.danger'); await p.waitForTimeout(800);
  const q = await p.evaluate(() => (document.querySelector('.modal h2') || {}).textContent || '');
  ok(/Server nicht erreichbar/.test(q), 'Server-Fehler: Rückfrage „Server nicht erreichbar“');
  await p.click('.modal [data-close].btn'); await p.waitForTimeout(400);
  ok(await p.evaluate(n => Store.trades().length === n, b2), 'Abgebrochen: im Browser bleibt alles');
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); srv.close(); process.exit(fail ? 1 : 0); })();
