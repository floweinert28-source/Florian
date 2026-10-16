/* KI-Funktion: Kennzeichnung vor der ersten Nachricht, Einwilligung (Mentor, Sprachnotizen), Abbrechen während der Antwort,
   Widerruf in Einstellungen → Mentor, englische Texte */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const BASE = 'file:///home/user/Florian/web/app.html';
const SRV = 'https://mentor.test';
(async () => { const b = await chromium.launch(); const errs = []; const calls = [];
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } }); p.on('pageerror', e => errs.push(e.message)); try { await require('./localfonts.js')(p); } catch (e) {}
  let slow = false;
  await p.route(SRV + '/**', async r => { const u = new URL(r.request().url()); calls.push(r.request().method() + ' ' + u.pathname);
    const json = (status, body) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (u.pathname === '/api/mentor/history') return json(200, { messages: [], quota: { used: 0, limit: 30, remaining: 30 } });
    if (u.pathname === '/api/mentor/chat') { if (slow) await new Promise(res => setTimeout(res, 2500)); return json(200, { reply: 'Okay.', at: new Date().toISOString(), quota: { used: 1, limit: 30, remaining: 29 } }).catch(() => {}); }
    if (u.pathname === '/api/voice/analyze') return json(200, { transcript: 'zu früh rein', emotion: 'ruhig', setup: '', mistakes: [], summary: 'kurz' });
    return json(404, {}); });
  await p.goto(BASE + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
  await p.evaluate(s => { Store.setSetting('mentor', { url: s, token: 'x' }); Store.setSetting('aiConsent', {}); }, SRV);
  /* vor der Einwilligung */
  await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(800);
  const card = await p.evaluate(() => { const c = document.querySelector('.ai-consent'); return c ? { text: c.innerText, h: document.activeElement && document.activeElement.tagName, btn: c.querySelector('[data-action=ai-consent]').getBoundingClientRect().height, badge: !!c.querySelector('.ai-badge') } : null; });
  ok(card && card.badge && /kein Mensch/.test(card.text) && /Wohin es geht/.test(card.text) && /widerrufen/.test(card.text), 'Einwilligungs-Karte: KI-Kennzeichen, „kein Mensch“, was und wohin, Widerruf');
  ok(card && card.btn >= 44, 'Zustimmen-Knopf groß genug (mind. 44 px) · ' + (card && card.btn));
  ok(!calls.length, 'Vor der Zustimmung keine Anfrage an den Server · ' + calls.join(','));
  await p.click('.ai-consent a[href="#/dashboard"]'); await p.waitForTimeout(500);
  ok(await p.evaluate(() => App.state.route === 'dashboard' && !(Store.settings.aiConsent || {}).mentor), '„Nicht jetzt“: zurück, keine Einwilligung gespeichert');
  await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(600); await p.click('[data-action=ai-consent][data-scope=mentor]'); await p.waitForTimeout(800);
  const intro = await p.evaluate(() => ({ badge: (document.querySelector('.mentor-head .ai-badge') || {}).textContent, intro: (document.querySelector('.mentor-intro') || {}).textContent || '', focus: document.activeElement && document.activeElement.id }));
  ok(intro.badge === 'KI' && /eine KI/.test(intro.intro), 'Chat: KI-Kennzeichen im Kopf, Begrüßung „… eine KI“ vor der ersten Nachricht · ' + JSON.stringify(intro).slice(0, 120));
  ok(calls.includes('GET /api/mentor/history'), 'Nach Zustimmung wird der Verlauf geladen');
  /* Abbrechen während der Antwort */
  slow = true; await p.fill('#mentor-in', 'Bin gerade nervös.'); await p.press('#mentor-in', 'Enter'); await p.waitForTimeout(400);
  const busy = await p.evaluate(() => ({ stop: !!document.querySelector('[data-action=mentor-cancel]'), send: !!document.querySelector('.mentor-form button[type=submit]'), typing: !!document.querySelector('.msg.ai.typing') }));
  ok(busy.stop && !busy.send && busy.typing, 'Während der Antwort: Stopp-Knopf statt Senden, Tipp-Anzeige · ' + JSON.stringify(busy));
  await p.click('[data-action=mentor-cancel]'); await p.waitForTimeout(500);
  const after = await p.evaluate(() => ({ notice: (document.querySelector('.mentor-notice') || {}).textContent || '', err: !!document.querySelector('.mentor-err'), typing: !!document.querySelector('.msg.ai.typing'), user: [...document.querySelectorAll('.msg.user')].map(m => m.textContent).join('|'), send: !!document.querySelector('.mentor-form button[type=submit]'), dis: document.getElementById('mentor-in').disabled }));
  ok(/abgebrochen/.test(after.notice) && !after.err && !after.typing && /nervös/.test(after.user) && after.send && !after.dis, 'Abgebrochen: ruhiger Hinweis statt Fehler, Nachricht bleibt, Eingabe wieder frei · ' + JSON.stringify(after).slice(0, 160));
  slow = false; await p.waitForTimeout(2500);
  /* Widerruf in den Einstellungen */
  await p.evaluate(() => { location.hash = '#/settings/mentor'; }); await p.waitForTimeout(700);
  const set = await p.evaluate(() => [...document.querySelectorAll('[data-action=ai-consent-revoke]')].map(x => x.dataset.scope));
  ok(set.join() === 'mentor', 'Einstellungen → Mentor: Einwilligung Mentor mit „Widerrufen“, Sprachnotizen noch offen · ' + set.join());
  await p.click('[data-action=ai-consent-revoke][data-scope=mentor]'); await p.waitForTimeout(400);
  await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(600);
  ok(await p.evaluate(() => !!document.querySelector('.ai-consent') && !document.getElementById('mentor-in')), 'Nach Widerruf: Mentor fragt wieder, bevor etwas gesendet wird');
  /* Sprachnotiz: „Erneut senden“ fragt erst */
  const tid = await p.evaluate(() => { const t = Store.trades().find(x => x.closedAt); t.voiceNotes = [{ id: 'vn1', blobId: null, mime: '', duration: 5, transcript: 'zu früh rein', sentiment: null, analysis: null, pending: true, error: 'x', createdAt: new Date().toISOString() }]; Store.saveNow(); return t.id; });
  await p.evaluate(i => { location.hash = '#/trades/' + i; }, tid); await p.waitForTimeout(800);
  const n0 = calls.filter(c => c.includes('voice')).length;
  await p.click('[data-action=voice-retry]'); await p.waitForTimeout(500);
  const dlg = await p.evaluate(() => { const m = document.querySelector('.modal'); return m ? m.innerText : ''; });
  ok(/Notiz auswerten lassen\?/.test(dlg) && /Anthropic/.test(dlg), 'Erneut senden ohne Einwilligung: Rückfrage mit Ziel der Daten');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(calls.filter(c => c.includes('voice')).length === n0, 'Abgelehnt: keine Anfrage');
  await p.click('[data-action=voice-retry]'); await p.waitForTimeout(400); await p.click('.modal .btn.primary'); await p.waitForTimeout(900);
  ok(calls.filter(c => c.includes('voice')).length === n0 + 1 && await p.evaluate(() => !!(Store.settings.aiConsent || {}).voice), 'Erlaubt: Auswertung gesendet, Einwilligung gespeichert');
  /* Englisch */
  await p.evaluate(async () => { Store.setLanguage('en'); I18N.setLang('en'); await new Promise(r => setTimeout(r, 900)); location.hash = '#/mentor'; }); await p.waitForTimeout(800);
  const en = await p.evaluate(() => (document.querySelector('.ai-consent') || {}).innerText || '');
  ok(/Before you write to the Mentor/.test(en) && /not a human/.test(en) && /Agree and start the Mentor/.test(en), 'Englisch: Einwilligungs-Karte übersetzt');
  await p.evaluate(async () => { Store.setLanguage('de'); I18N.setLang('de'); await new Promise(r => setTimeout(r, 500)); });
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
