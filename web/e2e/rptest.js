const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto(base, { waitUntil: 'load' }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(400);
  await p.evaluate(() => { Store.setSetting('profile', Object.assign({}, Store.settings.profile, { username: 'flo' })); Store.saveNow(); });
  ok('Navigation: Gruppen Übersicht, Journal, Training, Konten (Prop Firms, Mentor, News, Coach als Bereiche links, nicht im Konto-Menü)', (await p.$$eval('.sidebar .nav-title', a => a.map(x => x.textContent.trim()).join(','))) === 'Übersicht,Journal,Training,Konten' && (await p.$$eval('.sidebar .nav a', a => a.map(x => x.textContent.trim()).join(','))).endsWith('Schatten-Ich,Ruhepunkt,Coupon-Codes') && !(await p.$('#pop-user .item[href="#/coach"]')) && !!(await p.$('.rail-item[data-rail=coach]')) && !(await p.$('.sidebar .nav a[href="#/coach"]')) && !!(await p.$('.sidebar .nav a[href="#/ruhepunkt"] svg')));
  await p.keyboard.press('7'); await p.waitForTimeout(500); ok('Taste 7 öffnet die Seite', (await p.evaluate(() => location.hash)) === '#/ruhepunkt' && (await p.textContent('.topbar h1')) === 'Ruhepunkt');
  ok('Startseite: Frage + 3 Abläufe, unten nur „Hilfe und Beratung“ (keine Kerze)', (await p.textContent('.rp-q')) === 'Wo stehst du gerade?' && (await p.$$('.rp-choice')).length === 3 && !(await p.$('[data-action=rp-faith-toggle]')) && !(await p.$('.rp-candle')) && (await p.$$eval('.rp-foot > *', l => l.map(e => e.textContent.trim()).join('|'))) === 'Hilfe und Beratung');
  ok('Keine Kopfzeilen-Knöpfe, volle Breite, ein main', !(await p.$('.topbar [data-action=new-trade]')) && !(await p.$('.page-head')) && await p.evaluate(() => Math.round(document.querySelector('.rp').getBoundingClientRect().width) === 720 && document.querySelectorAll('main').length === 1));
  await p.screenshot({ path: 'rp-home.png', clip: { x: 232, y: 0, width: 1208, height: 640 } });
  /* Vor dem Trading */
  await p.click('.rp-choice:nth-child(1)'); await p.waitForTimeout(300);
  ok('Schritt 1 mit Atmung', (await p.textContent('.rp-title')) === 'Erst einmal ankommen.' && !!(await p.$('.rp-breath')) && (await p.textContent('.rp-where')).includes('Schritt 1 von 6'));
  await p.click('.rp-breath .rp-btn'); await p.waitForTimeout(500); ok('Atmung: sanfter Einstieg', (await p.textContent('.rp-breath .rp-phase')).startsWith('Gleich geht') && (await p.textContent('.rp-breath .rp-meta')).startsWith('Los in') && (await p.textContent('.rp-breath .rp-btn')) === 'Pausieren'); await p.waitForTimeout(3200); ok('Atmung läuft mit Rhythmus-Zeile', (await p.textContent('.rp-breath .rp-phase')) === 'Durch die Nase einatmen' && (await p.$$('.rp-seq-i')).length === 3 && !!(await p.$('.rp-seq-i.rp-on')) && (await p.textContent('.rp-next')).includes('Danach: Kurz nachziehen') && (await p.textContent('.rp-tempo')).includes('Sanft')); await p.waitForFunction(() => (document.querySelector('.rp-breath .rp-phase') || {}).textContent === 'Kurz ruhen.', null, { timeout: 25000 }); ok('Kurze Ruhe zwischen den Runden', (await p.textContent('.rp-breath .rp-meta')).includes('Runde 2 von 3'));
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(300);
  ok('Schritt 2 Check-in mit Ampel', (await p.textContent('.rp-title')) === 'Wie geht es dir heute wirklich?' && (await p.$$('.rp input[type=range]')).length === 3 && (await p.textContent('.rp-ampel')).includes('Ampel Grün'));
  await p.$eval('.rp input[type=range]', e => { e.value = '3'; e.dispatchEvent(new Event('input', { bubbles: true })); }); await p.waitForTimeout(100);
  ok('Ampel reagiert (Schlaf 3 → Rot)', (await p.textContent('.rp-ampel')).includes('Ampel Rot'));
  await p.screenshot({ path: 'rp-step2.png', clip: { x: 232, y: 0, width: 1208, height: 900 } });
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200); ok('Schritt 3 Box Breathing', (await p.textContent('.rp-title')) === 'Im Viereck atmen.');
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200); ok('Schritt 4 Regeln + Hinweis bei Ampel Rot', (await p.textContent('.rp-title')) === 'Deine Regeln für heute.' && (await p.textContent('.rp-callout')).includes('Ampel steht heute auf Rot'));
  await p.fill('.rp input[type=text]', '2R'); await p.fill('.rp input[type=number]', '3'); await p.waitForTimeout(100);
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200); ok('Schritt 5 Visualisierung mit 60 s', (await p.textContent('.rp-title')) === 'Den Tag einmal durchspielen.' && (await p.textContent('.rp-bigtime')) === '1:00');
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200);
  ok('Schritt 6 mit Bibelvers, Gebet und Plan', (await p.textContent('.rp-title')) === 'Mit Ausrichtung in den Tag.' && !!(await p.$('.rp-prayer')) && (await p.textContent('.rp-verse-ref')).includes('Luther 1912') && (await p.textContent('dl.rp-summary')).includes('2R'));
  await p.screenshot({ path: 'rp-step6.png', clip: { x: 232, y: 0, width: 1208, height: 900 } });
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(400);
  const e1 = await p.evaluate(() => Store.ruhepunkt()[0]);
  ok('Gespeichert-Seite mit Mentor-Knopf', (await p.textContent('.rp-title')) === 'Gespeichert.' && (await p.textContent('.rp-lead')).includes('Du bist vorbereitet') && (await p.textContent('.rp-nav .rp-primary')) === 'Mit dem Mentor besprechen');
  ok('Eintrag im Store mit Nutzer, Ampel, Regeln, Impuls', !!e1 && e1.typ === 'vor' && e1.userId === 'flo' && e1.ampel === 'rot' && e1.regeln.maxVerlust === '2R' && e1.impuls.art === 'bibelvers' && e1.glaubensmodus === true && !!e1.id, JSON.stringify(e1).slice(0, 160));
  ok('Verlauf-Log', await p.evaluate(() => Store.data.logs.some(l => l.type === 'Ruhepunkt' && l.action === 'gespeichert' && l.field === 'flo')));
  await p.click('.rp-nav .rp-ghost'); await p.waitForTimeout(300); ok('Zurück zur Übersicht mit Verlauf', (await p.$$('.rp-list li')).length === 1 && (await p.textContent('.rp-list li')).includes('Vor dem Trading') && (await p.textContent('.rp-list li')).includes('Ampel Rot'));
  /* Schalter */
  /* Christlicher Impuls nur noch in den Einstellungen: hier ausschalten, wie es der Schalter dort tut */
  await p.evaluate(() => { Store.setSetting('christlicherImpuls', false); App.rerender(); }); await p.waitForTimeout(200); ok('Einstellung aus → gespeichert', await p.evaluate(() => Store.settings.christlicherImpuls === false));
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(500); ok('Bleibt nach Neuladen aus, weiterhin ohne Kerze', await p.evaluate(() => Store.settings.christlicherImpuls === false) && !(await p.$('.rp-candle')));
  /* Nach dem Trading ohne Glaubensmodus */
  await p.click('.rp-choice:nth-child(2)'); await p.waitForTimeout(300); ok('Nach: Schritt 1', (await p.textContent('.rp-title')) === 'Wie war dein Handelstag?');
  await p.click('.rp-chip:has-text("Im Minus")'); await p.click('.rp-chip:has-text("Nein")'); await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200);
  ok('Nach: Runterfahren ohne Atemgebet', (await p.textContent('.rp-title')) === 'Runterfahren.' && (await p.textContent('.rp-breath .rp-seg')).includes('Ruhiges Atmen') && !(await p.textContent('.rp-breath .rp-seg')).includes('Atemgebet'));
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200); ok('Nach: Einordnung „Das tut doppelt weh.“ + Abweichungsfrage', (await p.textContent('.rp-callout h3')) === 'Das tut doppelt weh.' && (await p.textContent('.rp')).includes('Wann genau bin ich von meinem Plan abgewichen'));
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200); ok('Nach: Abschluss neutral mit Dankbarkeit + Leitsatz', (await p.textContent('.rp-title')) === 'Abschließen und abschalten.' && (await p.textContent('.rp')).includes('Drei Dinge, für die du heute dankbar bist') && !(await p.$('.rp-prayer')));
  await p.click('.rp-checks input'); await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(400);
  const e2 = await p.evaluate(() => Store.ruhepunkt()[0]); ok('Nach-Eintrag gespeichert', e2.typ === 'nach' && e2.ergebnis === 'minus' && e2.regelnEingehalten === 'nein' && e2.impuls.art === 'leitsatz' && e2.reflexion.dankbar && e2.abschalten.plattform === true && e2.glaubensmodus === false);
  await p.click('.rp-nav .rp-ghost'); await p.waitForTimeout(200);
  /* Akut */
  await p.click('.rp-choice:nth-child(3)'); await p.waitForTimeout(300); ok('Akut: Stopp', (await p.textContent('.rp-title')) === 'Stopp. Hände weg von Maus und Tastatur.');
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200); await p.click('.rp-chip:has-text("Wut")'); await p.click('.rp-timer .rp-btn'); await p.waitForTimeout(1400);
  ok('Akut: Gefühle + 15-Minuten-Pause läuft', (await p.textContent('.rp-bigtime')).startsWith('14:5') && (await p.textContent('.rp')).includes('Mentor-Chat'));
  await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(400); const e3 = await p.evaluate(() => Store.ruhepunkt()[0]);
  ok('Akut-Eintrag mit Pause gestartet', e3.typ === 'akut' && e3.gefuehle.includes('wut') && e3.pauseGestartet === true && (await p.textContent('.rp-lead')).includes('Gib dir die Pause'));
  await p.click('.rp-nav .rp-ghost'); await p.waitForTimeout(200); ok('Drei Einträge im Verlauf', (await p.$$('.rp-list li')).length === 3);
  await p.click('.rp-list li .rp-x'); await p.waitForTimeout(250); ok('Löschen fragt nach', !!(await p.$('.modal'))); await p.click('.modal .btn.danger, .modal button.primary'); await p.waitForTimeout(300); ok('Eintrag löschen', (await p.$$('.rp-list li')).length === 2 && await p.evaluate(() => Store.ruhepunkt().length === 2));
  /* Hilfe */
  await p.click('[data-action=rp-help]'); await p.waitForTimeout(200); ok('Hilfe-Dialog mit Nummern', (await p.textContent('.modal')).includes('0800 111 0 111') && (await p.textContent('.modal h2')) === 'Du musst das nicht allein tragen.'); await p.click('.modal [data-close]'); await p.waitForTimeout(200);
  /* Timer-Aufräumen beim Seitenwechsel */
  await p.click('.rp-choice:nth-child(1)'); await p.waitForTimeout(200); await p.click('.rp-breath .rp-btn'); await p.waitForTimeout(300);
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(600); await p.evaluate(() => { location.hash = '#/ruhepunkt'; }); await p.waitForTimeout(400);
  ok('Angefangene Session bleibt beim Zurückkommen', (await p.textContent('.rp-where')).includes('Schritt 1 von 6') && (await p.textContent('.rp-breath .rp-btn')) === 'Starten');
  await p.click('.rp-nav .rp-ghost'); await p.waitForTimeout(200); await p.click('.rp-choice:nth-child(3)'); await p.waitForTimeout(200); await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(200); await p.click('.rp-nav .rp-primary'); await p.waitForTimeout(400);
  await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(400); await p.evaluate(() => { location.hash = '#/ruhepunkt'; }); await p.waitForTimeout(400); ok('Nach „Gespeichert“ zurück → Übersicht', (await p.textContent('.rp-q')) === 'Wo stehst du gerade?');
  /* Einstellungen */
  await p.evaluate(() => { location.hash = '#/settings/profil'; }); await p.waitForTimeout(500);
  const sw = await p.$('[data-action=faith-toggle]'); ok('Schalter in Einstellungen → Profil', !!sw && (await sw.getAttribute('aria-checked')) === 'false');
  await sw.click(); await p.waitForTimeout(300); ok('Einstellungs-Schalter setzt denselben Wert', await p.evaluate(() => Store.settings.christlicherImpuls === true) && (await p.$eval('[data-action=faith-toggle]', e => e.getAttribute('aria-checked'))) === 'true');
  /* Backup */
  const exp = await p.evaluate(async () => JSON.parse(await Store.exportJSON(false))); ok('Export enthält Ruhepunkt-Einträge', !!(exp.data && exp.data.ruhepunkt && exp.data.ruhepunkt.length >= 2));
  /* Handy */
  await p.setViewportSize({ width: 390, height: 800 }); await p.evaluate(() => { location.hash = '#/ruhepunkt'; }); await p.waitForTimeout(500);
  ok('Handy ohne Überlauf', await p.evaluate(() => document.documentElement.scrollWidth <= 390)); await p.screenshot({ path: 'rp-mobile.png' });
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors'); await browser.close();
})().catch(e => { console.log(out.join('\n')); console.error('CRASH', e.message); process.exit(1); });
