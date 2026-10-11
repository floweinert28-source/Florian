/* Coach-Seiten gefüllt, auf Englisch (und Spanisch), mit echtem Server: keine deutschen Reste aus dem Wörterbuch */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path'); const http = require('http');
const PORT = 8796; const URLB = `http://127.0.0.1:${PORT}`; const DB = path.join(__dirname, 'coach-lang.sqlite'); try { fs.unlinkSync(DB); } catch (e) { /* frisch */ }
const keysFor = lang => { const m = {}; const d = path.join(__dirname, 'i18n', lang); fs.readdirSync(d).filter(f => /^part-.*\.json$/.test(f)).sort().forEach(f => Object.assign(m, JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')))); return Object.keys(m).filter(k => m[k] !== k && !/\{\d+\}/.test(k)); };
const health = () => new Promise(res => { http.get(URLB + '/api/mentor/health', r => res(r.statusCode === 200)).on('error', () => res(false)); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const srv = spawn('python3', ['-m', 'uvicorn', 'server.mentor_server:app', '--port', String(PORT), '--host', '127.0.0.1', '--log-level', 'warning'], { cwd: '/home/user/Florian', env: Object.assign({}, process.env, { MENTOR_APP_TOKEN: 'geheim', MENTOR_DB: DB, ANTHROPIC_API_KEY: 'x' }) });
  for (let i = 0; i < 60 && !(await health()); i++) await sleep(250);
  const b = await chromium.launch(); let pass = 0, fail = 0; const errs = [];
  const mk = async () => { const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); await require('./localfonts.js')(p); p.on('pageerror', e => errs.push(e.message)); await p.goto('file:///home/user/Florian/web/app.html', { waitUntil: 'load' }); await p.waitForTimeout(500); return p; };
  const M = await mk(), A = await mk();
  for (const [p, n] of [[M, 'Max'], [A, 'Anna']]) await p.evaluate(({ u, n }) => { Store.setSetting('mentor', { url: u, token: 'geheim' }); Store.setSetting('profile', Object.assign({}, Store.settings.profile, { firstName: n, username: n.toLowerCase() })); Store.saveNow(); }, { u: URLB, n });
  await A.evaluate(() => Store.installSample());
  const g = await M.evaluate(async () => { await Coach.me(); return (await Coach.api('/api/coach/groups', { method: 'POST', body: JSON.stringify({ name: 'Kurs' }) })).group; });
  await A.evaluate(async t => { await Coach.api(`/api/coach/invite/${t}/join`, { method: 'POST', body: JSON.stringify({ name: 'Anna', since: null }) }); await Coach.me(); await Coach.sync({ force: true }); }, g.invite_token);
  const sid = await A.evaluate(() => Store.data.coach.userId); const eid = await A.evaluate(() => Coach.sharedNotes()[0].id);
  await M.evaluate(async ({ gid, sid, eid }) => { await Coach.me(); const n = (await Coach.api(`/api/coach/groups/${gid}/students/${sid}/notes`, { method: 'POST', body: JSON.stringify({ entry_id: eid, text: 'Good.' }) })).note; await Coach.api(`/api/coach/notes/${n.id}/replies`, { method: 'POST', body: JSON.stringify({ text: 'More.' }) }); await Coach.api(`/api/coach/groups/${gid}/tasks`, { method: 'POST', body: JSON.stringify({ text: 'Task one', student_id: sid, due: '2026-12-31' }) }); }, { gid: g.id, sid, eid });
  await A.evaluate(() => Coach.sync({ force: true }));
  const check = async (p, lang, where, scope = '#main') => {
    const KEYS = new Set(keysFor(lang)); await p.waitForTimeout(250);
    /* Tooltips (data-tip) übersetzt die App erst beim Anzeigen; hier zählen Text, Platzhalter und aria-label. Tooltip-Texte prüft die Wörterbuch-Abdeckung unten */
    const left = await p.evaluate(({ keys, scope }) => { const K = new Set(keys); const out = new Set(); const root = document.querySelector(scope); if (!root) return ['(Bereich fehlt: ' + scope + ')']; const w = document.createTreeWalker(root, 4); let t; while ((t = w.nextNode())) { if (t.parentElement.closest('.no-i18n, .ql-editor, textarea, script, style')) continue; const s = t.textContent.replace(/\s+/g, ' ').trim(); if (s && K.has(s)) out.add(s); } root.querySelectorAll('[placeholder], [aria-label]').forEach(el => ['placeholder', 'aria-label'].forEach(a => { const v = (el.getAttribute(a) || '').trim(); if (v && K.has(v)) out.add('@' + a + ':' + v); }));
      /* Tooltips: jeder deutsche Tooltip-Text muss im Wörterbuch stehen */
      root.querySelectorAll('[data-tip]').forEach(el => { const v = el.getAttribute('data-tip').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); if (v && I18N.lookup(v) == null && /[a-zäöüß]{3}/.test(v) && /[äöüß]|\b(und|der|die|das|nur|mit)\b/.test(v)) out.add('@tip ohne Übersetzung:' + v); });
      return [...out]; }, { keys: [...KEYS], scope });
    const ok = !left.length; if (ok) pass++; else fail++; console.log(`${ok ? 'PASS' : 'FAIL'} [${lang}] ${where}${left.length ? ' · Reste: ' + left.join(' | ') : ''}`);
  };
  for (const lang of ['en', 'es']) {
    for (const p of [M, A]) { await p.evaluate(l => { Store.setLanguage ? Store.setLanguage(l) : Store.setSetting('language', l); I18N.setLang(l); App.rerender(); }, lang); await p.waitForTimeout(600); }
    await A.evaluate(() => { location.hash = '#/coach'; }); await A.waitForTimeout(1500); await check(A, lang, 'Schüler: Übersicht mit Aufgaben und Benachrichtigungen');
    await A.evaluate(() => Coach.data().tasks.forEach(t => { delete Coach.data().taskSeen[t.id]; }));
    await A.evaluate(id => { location.hash = '#/notebook'; setTimeout(() => { App.state.nb.folder = 'all'; App.state.nb.note = id; App.state.nb.view = 'note'; App.rerender(); }, 300); }, eid); await A.waitForTimeout(1500); await check(A, lang, 'Schüler: Notebook mit Notiz und Verlauf', '.mentor-notes.in-note');
    await M.evaluate(() => { location.hash = '#/coach'; }); await M.waitForTimeout(1500); await check(M, lang, 'Mentor: Übersicht');
    await M.evaluate(gid => { location.hash = '#/coach/g/' + gid; }, g.id); await M.waitForTimeout(1500); await check(M, lang, 'Mentor: Gruppe mit Statistik');
    await M.evaluate(({ gid, sid }) => { location.hash = `#/coach/g/${gid}/s/${sid}`; }, { gid: g.id, sid }); await M.waitForTimeout(1500); await check(M, lang, 'Mentor: Journal mit Aufgaben und Verlauf');
    if (lang === 'en') { await M.screenshot({ path: 'coach-journal-en.png', fullPage: false }); await A.evaluate(() => { location.hash = '#/coach'; }); await A.waitForTimeout(1200); await A.screenshot({ path: 'coach-hub-en.png' }); }
  }
  console.log(`${pass}/${pass + fail} PASS`); console.log(errs.length ? 'ERRORS ' + errs.join(' | ') : 'no errors'); await b.close(); srv.kill();
})().catch(e => { console.error('CRASH', e.message); process.exit(1); });
