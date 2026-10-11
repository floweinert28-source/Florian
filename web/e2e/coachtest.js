/* Coach Mode Ende-zu-Ende gegen den echten Server (uvicorn, SQLite in einer Tempdatei):
   Mentor erstellt eine Gruppe, Schülerin tritt über den Link bei, Journal und Kurz-Stats kommen an, Mentor-Notiz landet
   im Notebook der Schülerin, Rechte-Trennung, Austritt, Gruppe schließen. Zwei Browser-Kontexte = zwei Geräte. */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const http = require('http');
const PORT = Number(process.env.COACH_PORT) || 8799; const URLB = `http://127.0.0.1:${PORT}`; const base = 'file:///home/user/Florian/web/app.html';
const DB = `/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/coach-e2e.sqlite`;
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
let n404 = 0; /* erwartete 404 (Rechte-Prüfung, alter Link) landen als Konsolenfehler; gezählt, damit eine Schleife auffällt */
const ignore = m => /ERR_CERT|fonts\.googleapis|fonts\.gstatic|net::ERR|fontshare/.test(m) || (/status of (404|403)/.test(m) && ++n404);
const health = () => new Promise(res => { http.get(URLB + '/api/mentor/health', r => res(r.statusCode === 200)).on('error', () => res(false)); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  try { fs.unlinkSync(DB); } catch (e) { /* frisch */ }
  const MAILS = __dirname + '/coach-mails.jsonl'; try { fs.unlinkSync(MAILS); } catch (e) { /* frisch */ }
  const SMTP_PORT = PORT + 100; const sink = spawn('python3', [__dirname + '/smtpsink.py', String(SMTP_PORT), MAILS]);
  const mails = () => { try { return fs.readFileSync(MAILS, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch (e) { return []; } };
  const srv = spawn('python3', ['-m', 'uvicorn', 'server.mentor_server:app', '--port', String(PORT), '--host', '127.0.0.1', '--log-level', process.env.ACCESSLOG ? 'info' : 'warning'], { cwd: '/home/user/Florian', env: Object.assign({}, process.env, { MENTOR_APP_TOKEN: 'geheim', MENTOR_DB: DB, ANTHROPIC_API_KEY: 'test', MENTOR_ALLOWED_ORIGINS: '*', COACH_SMTP_HOST: '127.0.0.1', COACH_SMTP_PORT: String(SMTP_PORT), COACH_SMTP_STARTTLS: '0', COACH_SMTP_FROM: 'Journalyst <coach@journalyst.test>', COACH_APP_URL: 'https://journalyst.test/app.html' }) });
  let slog = ''; srv.stderr.on('data', d => { slog += d; }); srv.stdout.on('data', d => { slog += d; });
  for (let i = 0; i < 60 && !(await health()); i++) await sleep(250);
  ok('Server läuft', await health(), slog.slice(-200));
  const browser = await chromium.launch(); const errs = [];
  const bad = {}; /* Antworten ab 400: welche Adressen (erwartet: Rechte-Prüfung, alter Link) */
  const mk = async name => { const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('response', r => { if (r.status() >= 400) { const k = name + ' ' + r.status() + ' ' + r.url().replace(/[0-9a-f-]{20,}/g, '…').replace(/\?.*$/, ''); bad[k] = (bad[k] || 0) + 1; } }); p.on('pageerror', e => { if (!ignore(e.message)) errs.push(name + ': ' + e.message); }); p.on('console', m => { if (m.type() === 'error' && !ignore(m.text())) errs.push(name + ' console: ' + m.text()); });
    await require('./localfonts.js')(p); /* Schriften lokal, sonst zählt jeder gesperrte Font-Abruf als 404 */
    await ctx.addInitScript(() => { window.__toasts = []; new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('toast')) window.__toasts.push(n.textContent.trim()); }))).observe(document, { childList: true, subtree: true }); });
    await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(400); return { ctx, p }; };
  const M = await mk('mentor'), A = await mk('anna'), L = await mk('lisa');
  const configure = (p, first, user) => p.evaluate(({ u, first, user }) => { Store.setSetting('mentor', { url: u, token: 'geheim' }); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { firstName: first, username: user })); Store.saveNow(); }, { u: URLB, first, user });
  const toast = p => p.evaluate(() => [...document.querySelectorAll('.toast')].map(t => t.textContent.trim()).pop() || '');
  const KEYS = new Set(); const collect = async (p, where) => { if (!process.env.COLLECT) return; const ks = await p.evaluate(w => { if (!window.__col) window.__col = I18N.startCollect(); window.__col.clear(); I18N.translate(document.body); document.querySelectorAll('[data-tip],[placeholder],[title],[aria-label]').forEach(el => ['data-tip', 'placeholder', 'title', 'aria-label'].forEach(a => { const v = el.getAttribute(a); if (v) I18N.lookup(v); })); return [...window.__col]; }, where); ks.forEach(k => KEYS.add(k)); };
  const go = async (p, h, ms = 700) => { await p.evaluate(h => { location.hash = h; }, h); await p.waitForTimeout(ms); };

  /* 1. Ohne Server-Einstellung: Einrichten-Hinweis; Navigation hat „Coach“ */
  await go(M.p, '#/coach');
  ok('Navigation: Coach im Konto-Menü unten, nicht in der Navigation', !!(await M.p.$('#pop-user .item[href="#/coach"]')) && !(await M.p.$('.sidebar .nav a[href="#/coach"]')));
  await collect(M.p, 'setup');
  ok('Ohne Server: Einrichten-Hinweis mit Link zu Einstellungen → Mentor', (await M.p.textContent('.mentor-setup h2')) === 'Coach Mode einrichten' && !!(await M.p.$('.mentor-setup a[href="#/settings/mentor"]')));
  ok('Kopfreihe ohne Zeitraum, Konto, Session und Trade loggen', !(await M.p.$('.page-head [data-pop=range]')) && !(await M.p.$('.page-head [data-action=new-trade]')) && !(await M.p.$('.page-head [data-action=start-session]')));

  /* 2. Mentor richtet ein und erstellt eine Gruppe */
  await configure(M.p, 'Max', 'coachmax'); await go(M.p, '#/dashboard', 300); await go(M.p, '#/coach', 1200);
  ok('Übersicht: Als Mentor / Als Schüler, Name aus dem Profil', (await M.p.$$eval('.coach-wrap .card-title', l => l.map(e => e.textContent.trim()))).join('|').includes('Als Mentor') && (await M.p.textContent('.coach-foot')).includes('Max'));
  await collect(M.p, 'hub-mentor'); await M.p.click('[data-action=coach-visibility]'); await M.p.waitForTimeout(300); await collect(M.p, 'visibility'); await M.p.evaluate(() => UI.closeModal(true)); await M.p.waitForTimeout(200);
  const keyM = await M.p.evaluate(() => Store.data.coach.key); ok('Geheimer Schlüssel angelegt (nur lokal, ≥ 24 Zeichen)', typeof keyM === 'string' && keyM.length >= 24);
  await M.p.click('[data-action=coach-create-group]'); await M.p.waitForTimeout(300); await collect(M.p, 'create'); await M.p.fill('.modal input[name=v]', 'Kurs Herbst 2026'); await M.p.click('.modal button[type=submit]'); await M.p.waitForTimeout(1200);
  ok('Gruppe erstellt → Gruppenseite mit Einladungslink', (await M.p.evaluate(() => location.hash)).startsWith('#/coach/g/') && (await M.p.textContent('.coach-title')) === 'Kurs Herbst 2026' && !!(await M.p.$('.coach-invite input')));
  const link = await M.p.$eval('.coach-invite input', e => e.value); const gid = (await M.p.evaluate(() => location.hash)).split('/')[3];
  ok('Einladungslink zeigt auf #/coach/join/<token>', link.startsWith('file:///home/user/Florian/web/app.html#/coach/join/') && link.length > 60, link);
  await collect(M.p, 'group-empty'); await M.p.click('[data-pop=coachmenu]'); await M.p.waitForTimeout(200); await collect(M.p, 'group-menu'); await M.p.keyboard.press('Escape'); await M.p.waitForTimeout(150);
  ok('Leerzustand: Noch kein Schüler', (await M.p.textContent('.coach-wrap .empty b')) === 'Noch kein Schüler');
  await M.p.click('[data-action=coach-copy-link]'); await M.p.waitForTimeout(300); ok('Link kopieren meldet sich', /Einladungslink kopiert|Kopieren nicht möglich/.test(await toast(M.p)));

  /* 3. Schülerin: Beispieldaten, Server, Einladung öffnen */
  await A.p.evaluate(() => { Store.installSample(); }); await configure(A.p, 'Anna', 'anna'); await go(A.p, '#/dashboard', 300);
  const token = link.split('#/coach/join/')[1];
  await go(A.p, '#/coach/join/' + token, 1500);
  const vis = await A.p.$$eval('.coach-vis tbody tr', rows => rows.map(r => ({ area: r.children[0].textContent.trim(), yes: !!r.querySelector('.coach-yes') })));
  ok('Beitritt: Einladung von Max, Gruppe, Sichtbarkeits-Liste (5 ja, 4 nein)', (await A.p.textContent('.coach-join-head h2')).includes('Max') && (await A.p.textContent('.coach-join-head p')).includes('Kurs Herbst 2026') && vis.length === 9 && vis.filter(v => v.yes).length === 5 && vis.find(v => v.area.startsWith('Einzelne Trades')).yes === false, JSON.stringify(vis.map(v => v.area.slice(0, 18) + ':' + v.yes)));
  await collect(A.p, 'join');
  ok('Name vorausgefüllt, „Nur ab heute“ vorgewählt', (await A.p.inputValue('#coach-name')) === 'Anna' && await A.p.$eval('input[name=since][value=today]', e => e.checked));
  await A.p.check('input[name=since][value=all]'); await A.p.click('.coach-join button[type=submit]'); await A.p.waitForTimeout(1500);
  ok('Beigetreten → Übersicht mit Gruppe und Mentor', (await A.p.evaluate(() => location.hash)) === '#/coach' && (await A.p.textContent('.coach-wrap')).includes('Kurs Herbst 2026') && (await A.p.textContent('.coach-wrap')).includes('Mentor: Max') && (await A.p.textContent('.coach-wrap')).includes('Alle Einträge'));
  await A.p.waitForFunction(() => Store.data.coach && Store.data.coach.lastSync, null, { timeout: 15000 }).catch(() => {}); await A.p.evaluate(() => App.rerender()); await A.p.waitForTimeout(300); await collect(A.p, 'hub-student');
  const snap = await A.p.evaluate(async () => { const s = await Coach.snapshot(); const keys = new Set(); s.days.forEach(d => Object.keys(d).forEach(k => keys.add(k))); return { entries: s.entries.length, days: s.days.length, dayKeys: [...keys], hasTradeNote: s.entries.some(e => e.id === 'smpn-trade'), notes: Coach.sharedNotes().length, trades: Store.trades().length, text: JSON.stringify(s) }; });
  ok('Abgeglichen: Einträge ohne Trade-Notiz, Tage nur als Summen in R und Prozent', !!(await A.p.evaluate(() => Store.data.coach.lastSync)) && snap.entries === snap.notes && snap.entries > 3 && !snap.hasTradeNote && snap.days > 10 && !snap.dayKeys.some(k => /pnl$|money|eur|usd|size|balance|symbol/.test(k)) && !/"symbol"|"entryPrice"|"accountId"|"pnlOverride"/.test(snap.text), `${snap.entries} Einträge, ${snap.days} Tage, Felder ${snap.dayKeys.join(',')}`);

  /* 4. Mentor sieht die Schülerin mit Kurz-Stats */
  await M.p.click('[data-action=coach-refresh]'); await M.p.waitForTimeout(1500);
  const row = await M.p.$eval('.coach-tbl tbody tr', r => ({ cells: [...r.children].map(c => c.textContent.trim()), pill: r.querySelector('.pill') ? r.querySelector('.pill').textContent.trim() : '' }));
  ok('Dashboard: Zeile Anna mit Trades, Winrate, Profit-Faktor, Ø R, Drawdown, letztem Eintrag und „neu“', row.cells[0].startsWith('Anna') && Number(row.cells[1]) > 0 && /%$/.test(row.cells[2]) && /\d/.test(row.cells[3]) && / R$/.test(row.cells[4]) && / R$/.test(row.cells[5]) && /^−.*%$/.test(row.cells[6]) && /\d{2}\.\d{2}\.\d{4}/.test(row.cells[7]) && /neu$/.test(row.pill), JSON.stringify(row));
  ok('Kein Geldbetrag auf der Seite', !/€|\$/.test(await M.p.evaluate(() => document.querySelector('#content').innerText)));
  await M.p.click('[data-action=coach-period][data-value=all]'); await M.p.waitForTimeout(1200);
  const allN = await M.p.$eval('.coach-tbl tbody tr td:nth-child(2)', e => Number(e.textContent));
  ok('Zeitraum Gesamt: mehr Trades als im Monat, Schalter markiert', allN >= Number(row.cells[1]) && await M.p.$eval('[data-action=coach-period][data-value=all]', e => e.getAttribute('aria-pressed') === 'true'), `${row.cells[1]} → ${allN}`);
  await collect(M.p, 'group'); await M.p.screenshot({ path: 'coach-group.png', fullPage: true });

  /* 5. Journal-Ansicht und Mentor-Notiz */
  await M.p.click('.coach-tbl tbody tr'); await M.p.waitForTimeout(1500);
  const entries = await M.p.$$('.coach-entry');
  ok('Journal: Einträge der Schülerin, nur lesen, mit Text', entries.length === snap.entries && (await M.p.textContent('.coach-title')) === 'Anna' && (await M.p.$$eval('.coach-entry .ql-editor', l => l.every(e => e.textContent.trim().length > 0))) && !(await M.p.$('.coach-entry .ql-editor[contenteditable="true"]')));
  ok('Neue Einträge markiert', (await M.p.$$('.coach-entry.is-new')).length === entries.length);
  const firstId = await M.p.$eval('.coach-entry', e => e.dataset.entry);
  await M.p.fill(`.coach-entry[data-entry="${firstId}"] textarea`, 'Gute Beobachtung. Warum erst nach dem dritten Verlust gestoppt?'); await M.p.click(`.coach-entry[data-entry="${firstId}"] [data-action=coach-note-send]`); await M.p.waitForTimeout(1200);
  ok('Notiz gesendet und unter dem Eintrag mit Badge „Mentor“, Name und Zeit', (await toast(M.p)) === 'Notiz gesendet' && (await M.p.$eval(`.coach-entry[data-entry="${firstId}"] .mentor-note`, e => e.querySelector('.pill').textContent + '|' + e.querySelector('.mn-head b').textContent + '|' + e.querySelector('.mn-text').textContent)) === 'Mentor|Max|Gute Beobachtung. Warum erst nach dem dritten Verlust gestoppt?');
  await M.p.click(`.coach-entry[data-entry="${firstId}"] [data-action=coach-note-edit]`); await M.p.waitForTimeout(300); await M.p.fill('.mn-edit', 'Gute Beobachtung. Warum erst nach dem dritten Verlust gestoppt? Schau dir den Stopp-Plan an.'); await M.p.click('[data-action=coach-note-save]'); await M.p.waitForTimeout(1000);
  ok('Notiz bearbeitet', (await M.p.textContent(`.coach-entry[data-entry="${firstId}"] .mn-text`)).endsWith('Stopp-Plan an.') && (await M.p.textContent(`.coach-entry[data-entry="${firstId}"] .mn-head`)).includes('bearbeitet'));
  await collect(M.p, 'journal'); await M.p.click(`.coach-entry[data-entry="${firstId}"] [data-action=coach-note-edit]`); await M.p.waitForTimeout(200); await collect(M.p, 'journal-edit'); await M.p.click('[data-action=coach-note-cancel]'); await M.p.waitForTimeout(200);
  await M.p.click(`.coach-entry[data-entry="${firstId}"] [data-action=coach-note-delete]`); await M.p.waitForTimeout(250); await collect(M.p, 'note-delete'); await M.p.evaluate(() => UI.closeModal(true)); await M.p.waitForTimeout(200);
  await M.p.screenshot({ path: 'coach-journal.png', fullPage: true });

  /* 6. Schülerin: Notiz kommt an, Hinweis-Punkt, im Notebook unter dem Eintrag */
  /* der Abgleich läuft auch von selbst (nach jeder Änderung und alle 5 Minuten); hier erzwungen, damit der Test nicht wartet */
  const synced = await A.p.evaluate(() => Coach.sync({ force: true }).then(r => r && r.notes.length)); await A.p.waitForTimeout(800);
  ok('Schülerin: Notiz gespeichert, ungelesen, Hinweis-Punkt am Notebook', synced === 1 && await A.p.evaluate(() => Store.data.coach.notes.length === 1 && Coach.unread().length === 1) && (await A.p.$eval('.sidebar .nav a[href="#/notebook"] .nav-dot', e => e.getAttribute('title'))) === '1 Neuigkeit von deinem Mentor', String(synced));
  await go(A.p, '#/notebook', 800); await A.p.evaluate(id => { App.state.nb.folder = 'all'; App.state.nb.note = id; App.state.nb.view = 'note'; App.rerender(); }, firstId); await A.p.waitForTimeout(800);
  ok('Notebook: Mentor-Notiz unter dem Eintrag, klar getrennt, nicht editierbar', !!(await A.p.$('.mentor-notes.in-note')) && (await A.p.textContent('.mentor-notes.in-note .mn-head')).includes('Mentor') && (await A.p.textContent('.mentor-notes.in-note .mn-head')).includes('Max') && (await A.p.textContent('.mentor-notes.in-note .mn-text')).includes('Stopp-Plan') && !(await A.p.$('.mentor-notes.in-note [data-action=coach-note-edit], .mentor-notes.in-note [data-action=coach-note-delete], .mentor-notes.in-note .mn-edit')) && !!(await A.p.$('.mentor-notes.in-note textarea[data-input=coach-reply-draft]')));
  /* der Notebook-Punkt kann danach noch den normalen Grund zeigen (z. B. „Tagesnotiz für heute fehlt“, je nach Uhrzeit der Beispieldaten) – nur der Mentor-Grund muss weg sein */
  const seen = await A.p.evaluate(() => ({ unread: Coach.unread().length, dot: (document.querySelector('.sidebar .nav a[href="#/notebook"] .nav-dot') || {}).title || '' }));
  ok('Nach dem Öffnen gelesen: Mentor-Punkt weg', seen.unread === 0 && !/Mentor/.test(seen.dot), JSON.stringify(seen));
  await collect(A.p, 'notebook-note'); await A.p.screenshot({ path: 'coach-student-note.png' });

  /* 6b. Antworten: Schülerin antwortet im Notebook, Mentor sieht es neu und antwortet zurück */
  const openNote = async (p, id) => { await go(p, '#/notebook', 700); await p.evaluate(id => { App.state.nb.folder = 'all'; App.state.nb.note = id; App.state.nb.view = 'note'; App.rerender(); }, id); await p.waitForTimeout(700); };
  await A.p.fill('.mentor-notes.in-note textarea[data-input=coach-reply-draft]', 'Ich hatte Angst, den Gewinn wieder herzugeben.'); await A.p.click('.mentor-notes.in-note [data-action=coach-reply-send]'); await A.p.waitForTimeout(1000);
  ok('Schülerin antwortet unter der Notiz („Du“)', (await toast(A.p)) === 'Antwort gesendet' && (await A.p.textContent('.mentor-notes.in-note .mn-reply.student .mr-head b')) === 'Du' && (await A.p.textContent('.mentor-notes.in-note .mn-reply.student .mr-text')).startsWith('Ich hatte Angst'));
  await collect(A.p, 'notebook-thread');
  await go(M.p, '#/coach/g/' + gid, 1400);
  ok('Mentor-Tabelle: „1 Antwort“ markiert', (await M.p.$$eval('.coach-tbl tbody tr .pill', l => l.map(e => e.textContent.trim()))).includes('1 Antwort'));
  await M.p.click('.coach-tbl tbody tr'); await M.p.waitForTimeout(1400);
  ok('Journal: Antwort der Schülerin als neu im Verlauf', (await M.p.textContent(`.coach-entry[data-entry="${firstId}"] .mn-reply.student .mr-text`)).startsWith('Ich hatte Angst') && !!(await M.p.$(`.coach-entry[data-entry="${firstId}"] .mn-reply.student.is-new`)));
  await M.p.fill(`.coach-entry[data-entry="${firstId}"] .mr-write textarea`, 'Verständlich. Teilgewinn mitnehmen, Rest mit Stopp laufen lassen.'); await M.p.click(`.coach-entry[data-entry="${firstId}"] [data-action=coach-reply-send]`); await M.p.waitForTimeout(1000);
  ok('Mentor antwortet zurück', (await M.p.$$(`.coach-entry[data-entry="${firstId}"] .mn-reply`)).length === 2 && (await M.p.textContent(`.coach-entry[data-entry="${firstId}"] .mn-reply.mentor .mr-text`)).startsWith('Verständlich'));
  await go(A.p, '#/dashboard', 600); /* nicht im Notebook: dort gilt eine Antwort zur offenen Notiz sofort als gelesen */
  const fresh1 = await A.p.evaluate(() => Coach.sync({ force: true }).then(() => Coach.unread().length)); await A.p.waitForTimeout(500);
  const dbg1 = await A.p.evaluate(() => ({ toasts: window.__toasts.slice(-3), dot: !!document.querySelector('.sidebar .nav a[href="#/notebook"] .nav-dot'), route: App.state.route }));
  ok('Schülerin: Antwort des Mentors kommt an, Toast und Punkt', fresh1 === 1 && dbg1.toasts.some(t => /Neue Antwort von Max/.test(t)) && dbg1.dot, JSON.stringify(Object.assign({ fresh1 }, dbg1)));
  await openNote(A.p, firstId);
  ok('Notebook: Verlauf mit beiden Antworten, danach gelesen', (await A.p.$$('.mentor-notes.in-note .mn-reply')).length === 2 && await A.p.evaluate(() => Coach.unread().length === 0));

  /* 6c. Aufgaben: an eine Schülerin und an alle; abhaken */
  await M.p.fill('.coach-taskform input[name=text]', 'Diese Woche höchstens 3 Trades pro Tag'); await M.p.evaluate(() => { const d = document.querySelector('.coach-taskform input[name=due]'); d.value = '2026-12-31'; }); await M.p.click('.coach-taskform button[type=submit]'); await M.p.waitForTimeout(1000);
  ok('Mentor gibt eine Aufgabe (offen, Datum)', (await toast(M.p)) === 'Aufgabe gegeben' && (await M.p.textContent('.coach-tasks')).includes('höchstens 3 Trades') && (await M.p.textContent('.coach-tasks')).includes('31.12.2026'));
  await collect(M.p, 'journal-tasks');
  await go(M.p, '#/coach/g/' + gid, 1400); await M.p.click('[data-action=coach-task-all]'); await M.p.waitForTimeout(300); await collect(M.p, 'task-all'); await M.p.fill('#ct-all-text', 'Jeden Abend eine Tagesnotiz'); await M.p.click('.modal button[type=submit]'); await M.p.waitForTimeout(1200);
  ok('Aufgabe an alle', (await toast(M.p)) === 'Aufgabe an 1 Schüler gegeben');
  await A.p.evaluate(() => Coach.sync({ force: true })); await A.p.waitForTimeout(800);
  ok('Schülerin: zwei Aufgaben, Punkt am Coach', await A.p.evaluate(() => Store.data.coach.tasks.length === 2) && (await A.p.$eval('#pop-user .item[href="#/coach"] .nav-dot', e => e.getAttribute('title'))) === '2 neue Aufgaben' && !!(await A.p.$('.sb-user .sb-av-dot')));
  await go(A.p, '#/coach', 1400);
  ok('Coach-Übersicht: Aufgaben-Karte mit 2 offenen, Punkt weg', (await A.p.$$('.coach-tasks .coach-task:not(.done)')).length === 2 && !(await A.p.$('#pop-user .item[href="#/coach"] .nav-dot')) && !(await A.p.$('.sb-user .sb-av-dot')));
  await A.p.click('.coach-tasks .coach-task:not(.done) [data-action=coach-task-toggle]'); await A.p.waitForTimeout(1000);
  ok('Abgehakt: eine offen, eine erledigt', (await A.p.$$('.coach-tasks > .coach-task:not(.done)')).length === 1 && (await A.p.textContent('.ct-done summary')).includes('1 erledigt'));
  await collect(A.p, 'hub-tasks'); await A.p.screenshot({ path: 'coach-student-hub.png', fullPage: true });
  await M.p.click('[data-action=coach-refresh]'); await M.p.waitForTimeout(1400);
  const taskCell = await M.p.$eval('.coach-tbl tbody tr td:last-child', e => e.innerText.replace(/\s+/g, ' ').trim());
  ok('Mentor-Tabelle: „1 offen von 2“', taskCell === '1 offen von 2', taskCell);

  /* 6d. Gruppen-Statistik nur für Mentoren */
  const gs = await M.p.$$eval('.coach-gs-tiles .tile', l => l.map(t => t.querySelector('.head span').textContent.trim() + '=' + t.querySelector('.val').textContent.trim()));
  ok('Gruppen-Statistik: Aktiv, Trades, Ø Winrate, Ø Profit-Faktor, Ø Drawdown, Journal', gs.length === 6 && gs[0] === 'Aktiv=1 / 1' && /^Trades=\d+$/.test(gs[1]) && /%$/.test(gs[2]) && /\d/.test(gs[3]) && /%$/.test(gs[4]), gs.join(' | '));
  await collect(M.p, 'group-stats'); await M.p.screenshot({ path: 'coach-group.png', fullPage: true });

  /* 6e. Co-Coach: Einladung, Sicht, Schülerin erfährt es, Entfernen */
  await M.p.click('[data-pop=coachmenu]'); await M.p.waitForTimeout(200); await M.p.click('[data-action=coach-cocoach]'); await M.p.waitForTimeout(900);
  const coLink = await M.p.$eval('.modal .coach-invite input', e => e.value); await collect(M.p, 'cocoach-modal');
  ok('Co-Coach-Fenster mit eigenem Link (#/coach/cojoin/…)', coLink.includes('#/coach/cojoin/') && coLink !== link && (await M.p.textContent('.modal .coach-list')).includes('Noch kein Co-Coach'));
  await M.p.evaluate(() => UI.closeModal(true)); await M.p.waitForTimeout(200);
  await configure(L.p, 'Lisa', 'lisa'); await go(L.p, '#/dashboard', 300); await go(L.p, '#/coach/cojoin/' + coLink.split('#/coach/cojoin/')[1], 1400);
  ok('Co-Coach-Einladung: „Max lädt dich als Co-Coach ein“, was du siehst und was nicht', (await L.p.textContent('.coach-join-head h2')).includes('Max') && (await L.p.$$('.coach-co-what .coach-yes')).length === 2 && (await L.p.$$('.coach-co-what .coach-no')).length === 2);
  await collect(L.p, 'cojoin'); await L.p.click('.coach-join button[type=submit]'); await L.p.waitForTimeout(1600);
  ok('Lisa ist Co-Coach: Gruppenseite mit Anna, ohne Einladungslink, Menü nur „Austreten“', (await L.p.evaluate(() => location.hash)) === '#/coach/g/' + gid && (await L.p.textContent('.coach-tbl tbody tr td')).startsWith('Anna') && !(await L.p.$('.coach-invite')) && (await L.p.$$('#pop-coachmenu .item')).length === 1 && (await L.p.textContent('.coach-head')).includes('du bist Co-Coach'));
  await collect(L.p, 'group-coach');
  await L.p.click('.coach-tbl tbody tr'); await L.p.waitForTimeout(1400);
  ok('Lisa sieht Notiz und Verlauf von Max, kann sie nicht bearbeiten', (await L.p.$$(`.coach-entry[data-entry="${firstId}"] .mentor-note`)).length === 1 && !(await L.p.$(`.coach-entry[data-entry="${firstId}"] [data-action=coach-note-edit]`)));
  await L.p.fill(`.coach-entry[data-entry="${firstId}"] .ce-write textarea`, 'Von mir als Co-Coach: guter Ansatz.'); await L.p.click(`.coach-entry[data-entry="${firstId}"] [data-action=coach-note-send]`); await L.p.waitForTimeout(1000);
  await A.p.evaluate(() => Coach.sync({ force: true })); await A.p.waitForTimeout(800);
  const coToasts = await A.p.evaluate(() => (window.__toasts || []).join(' | '));
  ok('Schülerin: erfährt vom Co-Coach und bekommt Lisas Notiz', /Lisa sieht jetzt als Co-Coach deine Einträge in „Kurs Herbst 2026“/.test(coToasts) && await A.p.evaluate(() => Store.data.coach.notes.some(n => n.mentor_name === 'Lisa')), coToasts);
  await go(A.p, '#/coach', 1400);
  ok('Übersicht der Schülerin: „Mentoren: Max, Lisa“', (await A.p.textContent('.coach-wrap')).includes('Mentoren: Max, Lisa'));
  await go(M.p, '#/coach/g/' + gid, 1200); await M.p.click('[data-pop=coachmenu]'); await M.p.waitForTimeout(200); await M.p.click('[data-action=coach-cocoach]'); await M.p.waitForTimeout(900);
  await M.p.click('.modal [data-action=coach-coach-remove]'); await M.p.waitForTimeout(1000);
  ok('Mentor entfernt Lisa', (await M.p.textContent('.modal .coach-list')).includes('Noch kein Co-Coach')); await M.p.evaluate(() => UI.closeModal(true));
  await L.p.click('[data-action=coach-refresh]'); await L.p.waitForTimeout(1200);
  ok('Lisa hat keinen Zugriff mehr', (await L.p.textContent('.coach-wrap')).includes('nicht Mentor'));

  /* 6f. Benachrichtigungen: E-Mail über den Server, Mitteilung im Browser */
  await go(A.p, '#/coach', 1400);
  ok('Benachrichtigungen: Server kann Mails, kein Hinweis', !!(await A.p.$('.coach-notify')) && !(await A.p.$('.coach-mailhint')));
  await A.p.fill('.coach-notify input[name=email]', 'anna@example.com'); await A.p.click('[data-action=coach-mail-toggle]'); await A.p.click('.coach-notify button[type=submit]'); await A.p.waitForTimeout(1000);
  ok('E-Mail eingeschaltet und gespeichert', (await toast(A.p)) === 'E-Mail-Benachrichtigung an' && await A.p.evaluate(() => Coach.api('/api/coach/me', { method: 'POST', body: '{}' }).then(r => r.user.email === 'anna@example.com' && r.user.notify_email === true)));
  await A.p.evaluate(() => { window.__notes = []; window.Notification = class { constructor(t, o) { window.__notes.push({ t, b: o && o.body }); } static requestPermission() { return Promise.resolve('granted'); } }; window.Notification.permission = 'default'; Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); });
  await A.p.evaluate(() => App.rerender()); await A.p.waitForTimeout(300);
  await A.p.click('[data-action=coach-browser-toggle]'); await A.p.waitForTimeout(500); await A.p.evaluate(() => { window.Notification.permission = 'granted'; });
  ok('Mitteilung im Browser eingeschaltet', await A.p.evaluate(() => Store.settings.coachBrowserNotify === true));
  await collect(A.p, 'hub-notify');
  const before = mails().length;
  await go(M.p, `#/coach/g/${gid}/s/${await A.p.evaluate(() => Store.data.coach.userId)}`, 1400);
  await M.p.fill(`.coach-entry[data-entry="${firstId}"] .ce-write textarea`, 'Nachtrag: Morgen bitte Check-in vor dem Open.'); await M.p.click(`.coach-entry[data-entry="${firstId}"] [data-action=coach-note-send]`); await M.p.waitForTimeout(1500);
  const got = mails().slice(before);
  ok('E-Mail an die Schülerin über den Server verschickt', got.length === 1 && got[0].to[0] === 'anna@example.com' && /Neue Notiz von Max/.test(got[0].data) && /Morgen bitte Check-in/.test(got[0].data) && /https:\/\/journalyst\.test\/app\.html/.test(got[0].data), JSON.stringify(got.map(m => m.to)));
  await A.p.evaluate(() => Coach.sync({ force: true })); await A.p.waitForTimeout(800);
  const bn = await A.p.evaluate(() => window.__notes);
  ok('Mitteilung im Browser bei neuer Notiz', bn.length === 1 && bn[0].t === 'Journalyst' && /Neue Mentor-Notiz von Max/.test(bn[0].b) && /Check-in vor dem Open/.test(bn[0].b), JSON.stringify(bn));
  await A.p.evaluate(() => { delete document.hidden; });
  await A.p.screenshot({ path: 'coach-student-hub.png', fullPage: true });

  /* 7. Rechte-Trennung: mit dem Schlüssel der Schülerin kommt man nicht an Mentor-Daten; der Server kennt keine Trade-Endpunkte */
  const rights = await A.p.evaluate(async ({ gid }) => { const s = await Coach.api(`/api/coach/groups/${gid}/students`).then(() => 'ok').catch(e => e.status); const t = await fetch(Coach.baseUrl() + '/api/coach/trades', { headers: { Authorization: 'Bearer geheim', 'X-Coach-Key': Coach.key() } }).then(r => r.status); return { s, t }; }, { gid });
  ok('Schülerin bekommt für Mentor-Endpunkte 404, Trade-Endpunkte gibt es nicht', rights.s === 404 && rights.t === 404, JSON.stringify(rights));
  const mentorSync = await M.p.evaluate(() => Coach.api('/api/coach/sync', { method: 'PUT', body: JSON.stringify({ entries: [], days: [] }) }).then(() => 'ok').catch(e => e.status));
  ok('Ohne Mitgliedschaft wird nichts hochgeladen (403)', mentorSync === 403);

  /* 8. Austritt: Mentor sieht nichts mehr, Notiz bleibt lokal */
  await go(A.p, '#/coach', 1200); await A.p.click('[data-action=coach-leave]'); await A.p.waitForTimeout(300); await collect(A.p, 'leave'); await A.p.click('.modal [data-confirm]'); await A.p.waitForTimeout(1200);
  ok('Verlassen: keine Gruppe mehr, Notizen als Kopie behalten, Aufgaben weg', await A.p.evaluate(() => Store.data.coach.groups.length === 0 && Store.data.coach.notes.length === 3 && Store.data.coach.notes.every(n => n.local === true) && Store.data.coach.tasks.length === 0) && (await A.p.textContent('.coach-wrap')).includes('Einladungslink'));
  await go(M.p, '#/coach/g/' + gid, 1500);
  ok('Mentor: Schülerin weg, Journal nicht mehr erreichbar', (await M.p.textContent('.coach-wrap .empty b')) === 'Noch kein Schüler' && (await M.p.evaluate(({ gid }) => Coach.api(`/api/coach/groups/${gid}/students`).then(r => r.students.length), { gid })) === 0);
  await go(A.p, '#/notebook', 800); await A.p.evaluate(id => { App.state.nb.folder = 'all'; App.state.nb.note = id; App.state.nb.view = 'note'; App.rerender(); }, firstId); await A.p.waitForTimeout(600);
  ok('Notebook der Schülerin zeigt die Notiz weiterhin', !!(await A.p.$('.mentor-notes.in-note')));

  /* 9. Umbenennen, Link erneuern, schließen */
  await M.p.click('[data-pop=coachmenu]'); await M.p.waitForTimeout(200); await M.p.click('[data-action=coach-rename]'); await M.p.waitForTimeout(300); await M.p.fill('.modal input[name=v]', 'Kurs Winter'); await M.p.click('.modal button[type=submit]'); await M.p.waitForTimeout(1200);
  ok('Umbenannt', (await M.p.textContent('.coach-title')) === 'Kurs Winter');
  await M.p.click('[data-pop=coachmenu]'); await M.p.waitForTimeout(200); await M.p.click('[data-action=coach-rotate]'); await M.p.waitForTimeout(300); await M.p.click('.modal [data-confirm]'); await M.p.waitForTimeout(1200);
  const link2 = await M.p.$eval('.coach-invite input', e => e.value); ok('Neuer Einladungslink', link2 !== link && link2.includes('#/coach/join/'));
  await M.p.click('[data-pop=coachmenu]'); await M.p.waitForTimeout(200); await M.p.click('[data-action=coach-rotate]'); await M.p.waitForTimeout(300); await collect(M.p, 'rotate'); await M.p.evaluate(() => { UI.closeModal(true); App.closePopovers(); }); await M.p.waitForTimeout(200);
  await go(A.p, '#/coach/join/' + token, 1200); await collect(A.p, 'join-invalid'); ok('Alter Link ungültig', (await A.p.textContent('.coach-wrap')).includes('ungültig'));
  /* Handy-Ansicht der Beitrittsseite */
  await A.p.setViewportSize({ width: 390, height: 844 }); await go(A.p, '#/coach/join/' + link2.split('#/coach/join/')[1], 1200);
  const over = await A.p.evaluate(() => ({ w: document.documentElement.scrollWidth, join: !!document.querySelector('.coach-join') }));
  ok('Handy: Beitrittsseite ohne Querscrollen', over.join && over.w <= 390, JSON.stringify(over)); await A.p.screenshot({ path: 'coach-join-phone.png', fullPage: true }); await A.p.setViewportSize({ width: 1440, height: 1000 });
  await M.p.evaluate(() => App.closePopovers()); await M.p.click('[data-pop=coachmenu]'); await M.p.waitForTimeout(200); await M.p.click('[data-action=coach-archive]'); await M.p.waitForTimeout(300); await collect(M.p, 'archive'); await M.p.click('.modal [data-confirm]'); await M.p.waitForTimeout(1200);
  ok('Gruppe geschlossen → Übersicht ohne Gruppen', (await M.p.evaluate(() => location.hash)) === '#/coach' && await M.p.evaluate(() => Store.data.coach.own.length === 0));
  await M.p.screenshot({ path: 'coach-hub.png' });

  ok('Keine Anfrage-Schleife (höchstens 8 erwartete 404/403)', n404 <= 8, String(n404) + ' ' + JSON.stringify(bad));
  sink.kill();
  if (process.env.COLLECT) { fs.writeFileSync('i18n/harvest-coach.json', JSON.stringify([...KEYS].sort(), null, 1)); console.log('gesammelt: ' + KEYS.size + ' Texte'); }
  if (process.env.ACCESSLOG) { const m = {}; slog.split('\n').filter(l => / (404|403) /.test(l)).forEach(l => { const k = l.replace(/^.*"(\w+) ([^ ?"]+)[^"]*".*$/, '$1 $2'); m[k] = (m[k] || 0) + 1; }); console.log('404/403 je Pfad: ' + JSON.stringify(m)); }
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close(); srv.kill();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
