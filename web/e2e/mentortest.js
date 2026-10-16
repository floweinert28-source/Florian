const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = []; const calls = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  let quota = { limit: 30, used: 2, remaining: 28, reset_at: '2026-10-01T00:00:00+02:00' }; let history = [{ role: 'user', content: 'Hallo Mentor', at: '2026-09-30T08:00:00Z' }, { role: 'assistant', content: 'Hallo Flo. **Wo stehst du gerade?**\n\n- vor dem Handelstag\n- nach einem Verlust', at: '2026-09-30T08:00:05Z' }]; let limitMode = false;
  await p.route('https://mentor.test/**', async route => {
    const req = route.request(); const url = new URL(req.url()); const auth = req.headers()['authorization']; calls.push({ method: req.method(), path: url.pathname + url.search, auth, body: req.postDataJSON ? (req.method() === 'POST' ? req.postDataJSON() : null) : null });
    const json = (status, body) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) });
    if (url.pathname === '/api/mentor/health') return json(200, { ok: true, model: 'claude-sonnet-5', limit: 30, prompt_loaded: true, auth: true });
    if (auth !== 'Bearer geheim') return json(401, { detail: { error: 'auth', message: 'Zugangstoken fehlt oder ist falsch.' } });
    if (url.pathname === '/api/mentor/history' && req.method() === 'GET') return json(200, { messages: history, quota });
    if (url.pathname === '/api/mentor/history' && req.method() === 'DELETE') { history = []; return json(200, { ok: true, deleted: 2 }); }
    if (url.pathname === '/api/mentor/chat') { if (limitMode) return json(429, { detail: { error: 'limit', message: 'Tageslimit von 30 Nachrichten erreicht.', quota: Object.assign({}, quota, { remaining: 0, used: 30 }) } }); const b = req.postDataJSON(); quota = Object.assign({}, quota, { used: quota.used + 1, remaining: quota.remaining - 1 }); const reply = 'Verstanden: ' + b.message; history.push({ role: 'user', content: b.message, at: '2026-09-30T09:00:00Z' }, { role: 'assistant', content: reply, at: '2026-09-30T09:00:03Z' }); return json(200, { reply, at: '2026-09-30T09:00:03Z', model: 'claude-sonnet-5', quota }); }
    return json(404, { detail: 'nope' });
  });
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(400);
  await p.evaluate(() => { Store.installSample(); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo', firstName: 'Florian' })); Store.saveNow(); });
  ok('Navigation: Mentor als eigener Bereich in der Leiste, Ruhepunkt in der Gruppe Training', !!(await p.$('.rail-item[data-rail=mentor]')) && (await p.$$eval('.sidebar .nav a', a => a.map(x => x.textContent.trim()).join(','))).includes('Schatten-Ich,Ruhepunkt'));
  await p.keyboard.press('8'); await p.waitForTimeout(500);
  ok('Ohne Server: Einrichtungshinweis', (await p.textContent('.mentor-setup h2')) === 'Mentor-Chat einrichten' && !!(await p.$('.mentor-setup a[href="#/settings/mentor"]')));
  await p.click('.mentor-setup a'); await p.waitForTimeout(500);
  ok('Einstellungen → Mentor', (await p.textContent('.set-head h2, .set-body h2')).includes('Mentor') && !!(await p.$('#mentor-url')));
  await p.fill('#mentor-url', 'https://mentor.test/'); await p.fill('#mentor-token', 'geheim'); await p.click('[data-action=mentor-test]'); await p.waitForTimeout(500);
  { const out = await p.textContent('#mentor-test-out'); ok('Verbindung testen: Grenze und Token, ohne Modellname', /^Verbunden\. \d+ Nachrichten pro Tag\./.test(out) && out.includes('Zugangstoken passt') && !/Modell|claude/i.test(out)); }
  await p.click('form[data-action=save-mentor] button[type=submit]'); await p.waitForTimeout(300);
  ok('Einstellungen gespeichert (ohne Schrägstrich am Ende)', await p.evaluate(() => Store.settings.mentor.url === 'https://mentor.test' && Store.settings.mentor.token === 'geheim'));
  const before = calls.length; await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(700);
  { const card = await p.$('.ai-consent'); const t = card ? await card.innerText() : ''; ok('Vor der Einwilligung: Karte mit KI-Hinweis, Daten und Ziel, noch keine Anfrage', !!card && /Der Mentor ist eine KI/.test(t) && /letzten 20 abgeschlossenen Trades/.test(t) && /Anthropic/.test(t) && t.includes('mentor.test') && calls.length === before && !(await p.$('#mentor-in')), t.slice(0, 60)); }
  await p.click('[data-action=ai-consent][data-scope=mentor]'); await p.waitForTimeout(700);
  ok('Nach Zustimmung: Einwilligung mit Datum gespeichert, Chat mit KI-Kennzeichen', await p.evaluate(() => !!Date.parse((Store.settings.aiConsent || {}).mentor)) && (await p.textContent('.mentor-head .ai-badge')).trim() === 'KI');
  ok('Verlauf geladen mit Kontingent', (await p.$$('.mentor-log .msg')).length === 2 && (await p.textContent('#mentor-quota')).includes('Noch 28 von 30') && calls.some(c => c.path.startsWith('/api/mentor/history?user=flo') && c.auth === 'Bearer geheim'));
  ok('Antwort mit Fett und Liste gerendert', !!(await p.$('.msg.ai b')) && (await p.$$('.msg.ai li')).length === 2);
  await p.fill('#mentor-in', 'Ich habe gerade zwei Verluste in Folge.'); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  const post = calls.find(c => c.method === 'POST');
  ok('Senden per Enter: Anfrage an den Server', !!post && post.body.user === 'flo' && post.body.message === 'Ich habe gerade zwei Verluste in Folge.' && post.body.context.app_name === 'Journalyst' && post.body.context.user_name === 'Florian' && post.body.context.glaubensmodus === true);
  ok('Journal-Kontext: letzte 20 Trades + Ruhepunkt', post.body.context.journal.startsWith('Letzte 20 abgeschlossene Trades') && (post.body.context.journal.match(/^- /gm) || []).length >= 20 && post.body.context.journal.includes('Regeln eingehalten') && post.body.context.journal.includes('Ruhepunkt heute') && post.body.context.journal.length < 8000, String(post.body.context.journal.length));
  ok('Antwort erscheint, Kontingent sinkt, Eingabe leer', (await p.textContent('.mentor-log .msg.ai:last-of-type')).includes('Verstanden: Ich habe gerade zwei Verluste') && (await p.textContent('#mentor-quota')).includes('Noch 27 von 30') && (await p.inputValue('#mentor-in')) === '');
  await p.screenshot({ path: 'mentor.png', clip: { x: 232, y: 0, width: 1208, height: 900 } });
  limitMode = true; await p.fill('#mentor-in', 'Noch eine Frage'); await p.click('.mentor-form button[type=submit]'); await p.waitForTimeout(600);
  ok('Tageslimit: Meldung + Eingabe gesperrt + Text bleibt', (await p.textContent('.mentor-err')).includes('alle Nachrichten an den Mentor verbraucht') && await p.$eval('#mentor-in', e => e.disabled) && (await p.textContent('#mentor-quota')).includes('Tageslimit von 30') && (await p.$$('.mentor-log .msg.user')).length === 2);
  limitMode = false;
  await p.click('[data-action=mentor-clear]'); await p.waitForTimeout(200); await p.click('.modal .btn.danger, .modal button.primary'); await p.waitForTimeout(500);
  ok('Verlauf löschen', calls.some(c => c.method === 'DELETE') && (await p.$$('.mentor-log .msg')).length === 0 && !!(await p.$('.mentor-intro')));
  /* Ruhepunkt → Mentor */
  await p.evaluate(() => { App.state.mentor.draft = ''; location.hash = '#/ruhepunkt'; }); await p.waitForTimeout(500); await p.click('.rp-choice:nth-child(3)'); await p.waitForTimeout(200); await p.click('.rp-nav .rp-go'); await p.waitForTimeout(200); await p.click('.rp-chip:has-text("Frust")'); await p.click('.rp-nav .rp-go'); await p.waitForTimeout(500);
  const mentorBtn = await p.$('.rp-nav .rp-primary'); ok('Ruhepunkt: „Mit dem Mentor besprechen“', !!mentorBtn && (await mentorBtn.textContent()) === 'Mit dem Mentor besprechen');
  await mentorBtn.click(); await p.waitForTimeout(700);
  ok('Mentor öffnet sich mit vorbereitetem Entwurf', (await p.evaluate(() => location.hash)) === '#/mentor' && (await p.inputValue('#mentor-in')).includes('Akut-Reset') && (await p.inputValue('#mentor-in')).includes('Frust'));
  await p.click('#mentor-in'); await p.keyboard.press('Enter'); await p.waitForTimeout(700); const last = calls.filter(c => c.method === 'POST').pop(); console.log('POSTs:', calls.filter(c => c.method === 'POST').length, '| journal tail:', last.body.context.journal.slice(-260).replace(/\n/g, ' | '));
  ok('Kontext enthält die Akut-Session', last.body.context.journal.includes('Akut-Reset') && last.body.context.journal.includes('Frust'));
  /* Falsches Token */
  await p.evaluate(() => { Store.setSetting('mentor', { url: 'https://mentor.test', token: 'falsch' }); App.state.mentor.messages = null; location.hash = '#/dashboard'; }); await p.waitForTimeout(300); await p.evaluate(() => { location.hash = '#/mentor'; }); await p.waitForTimeout(700);
  ok('Falsches Token: klare Meldung', (await p.textContent('.mentor-err')).includes('Zugangstoken'));
  /* Handy */
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(300); ok('Handy ohne Überlauf', await p.evaluate(() => document.documentElement.scrollWidth <= 390));
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
