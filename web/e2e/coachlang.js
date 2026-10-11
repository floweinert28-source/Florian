/* Coach-Seiten in den fünf Sprachen ohne Server: Einrichten-Hinweis und Navigation ohne deutsche Reste */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const keysFor = lang => { const m = {}; const d = path.join(__dirname, 'i18n', lang); fs.readdirSync(d).filter(f => /^part-.*\.json$/.test(f)).sort().forEach(f => Object.assign(m, JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')))); return Object.keys(m).filter(k => m[k] !== k); };
(async () => { const b = await chromium.launch(); let pass = 0, fail = 0; const errs = [];
  for (const lang of ['en', 'es', 'zh', 'hi', 'pt']) { const KEYS = new Set(keysFor(lang)); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await require('./localfonts.js')(p); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///home/user/Florian/web/app.html#/settings/sprache', { waitUntil: 'load' }); await p.waitForTimeout(600); await p.evaluate(l => document.querySelector(`.lang-card[data-value="${l}"]`).click(), lang); await p.waitForTimeout(400);
    await p.evaluate(() => { location.hash = '#/coach'; }); await p.waitForTimeout(800);
    const left = await p.evaluate(keys => { const K = new Set(keys); const out = []; const w = document.createTreeWalker(document.querySelector('#main'), 4); let t; while ((t = w.nextNode())) { const s = t.textContent.replace(/\s+/g, ' ').trim(); if (s && K.has(s)) out.push(s); } return out; }, [...KEYS]);
    const nav = await p.$eval('#pop-user .item[href="#/coach"]', e => e.textContent.trim()); const h2 = await p.textContent('.mentor-setup h2');
    /* Texte mit Namen darin laufen über Platzhalter-Muster */
    const pat = await p.evaluate(() => [I18N.t('Du verlässt „Kurs Herbst 2026“. Dein Mentor sieht danach nichts mehr von dir; seine bisherigen Notizen behältst du.'), I18N.t('Neue Mentor-Notiz von Max'), I18N.t('Kurz-Stats nur in R und Prozent · ab 01.10.2026'), I18N.t('28 Einträge')]);
    const patOk = pat[0].includes('Kurs Herbst 2026') && !pat[0].startsWith('Du verlässt') && pat[1].includes('Max') && !pat[1].startsWith('Neue Mentor') && pat[2].includes('01.10.2026') && !pat[2].startsWith('Kurz-Stats') && /28/.test(pat[3]) && pat[3] !== '28 Einträge';
    if (!patOk) { fail++; console.log(`FAIL [${lang}] Platzhalter-Muster: ${JSON.stringify(pat)}`); } else pass++;
    const ok = !left.length && h2 !== 'Coach Mode einrichten'; if (ok) pass++; else fail++; console.log(`${ok ? 'PASS' : 'FAIL'} [${lang}] Coach-Einrichten übersetzt (${h2}, Navigation „${nav}“)${left.length ? ' · Reste: ' + left.join(' | ') : ''}`);
    await ctx.close(); }
  console.log(`${pass}/${pass + fail} PASS`); console.log(errs.length ? 'ERRORS ' + errs.join(' | ') : 'no errors'); await b.close(); })();
