/* News: Journal → News, Wirtschaftskalender über den eigenen Server (/api/news), Beispielansicht ohne Server, Filter, Fehlerfall */
const { chromium } = require('playwright');
const base = 'file:///tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad/sample-dev.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
const H = 3600e3;
function feed() {
  const now = Date.now(); const day = new Date(); day.setHours(0, 0, 0, 0);
  const at = (d, h, m) => { const t = new Date(day); t.setDate(t.getDate() + d); t.setHours(h, m, 0, 0); return t.toISOString(); };
  return [
    { id: 'y', title: 'Gestern-Termin', currency: 'USD', time: at(-1, 10, 0), impact: 'high', forecast: '', previous: '', actual: '' },
    { id: 'p', title: 'Vorbei heute', currency: 'EUR', time: new Date(now - 3 * H).toISOString(), impact: 'medium', forecast: '', previous: '', actual: '0.4%' },
    { id: 'n', title: 'CPI m/m', currency: 'USD', time: new Date(now + 2 * H + 60e3).toISOString(), impact: 'high', forecast: '0.3%', previous: '0.2%', actual: '' },
    { id: 'm', title: 'ZEW Economic Sentiment', currency: 'EUR', time: at(1, 11, 0), impact: 'medium', forecast: '-8.5', previous: '-12.1', actual: '' },
    { id: 'l', title: 'Trade Balance', currency: 'JPY', time: at(1, 1, 50), impact: 'low', forecast: '', previous: '', actual: '' },
    { id: 'h', title: 'Bank Holiday', currency: 'GBP', time: at(2, 0, 0), impact: 'holiday', forecast: '', previous: '', actual: '' },
  ].sort((a, b) => a.time.localeCompare(b.time));
}
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(String(e)));
  let mode = 'ok', calls = 0, lastAuth = '';
  await p.route('http://news.test/**', async r => {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET, OPTIONS' };
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
    calls++; lastAuth = r.request().headers().authorization || '';
    if (mode === '401') return r.fulfill({ status: 401, headers: cors, contentType: 'application/json', body: '{"detail":"x"}' });
    return r.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify({ events: feed(), updated_at: new Date().toISOString(), stale: mode === 'stale', source: 'ForexFactory-Wirtschaftskalender' }) });
  });
  try {
    await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(700);
    await p.evaluate(() => { Store.setSetting('mentor', { url: '', token: '' }); Store.setSetting('newsFilter', null); App.state.news = null; });
    ok('Navigation: „News“ als eigener Bereich in der Leiste links, mit Symbol', !(await p.$('.sidebar a[href="#/news"]')) && !!(await p.$('.rail-item[data-rail=news] svg')));
    await p.click('.rail-item[data-rail=news]'); await p.waitForTimeout(500);
    ok('Bereich News: im Vollbild ohne Seitenleiste, Symbol in der Leiste aktiv', await p.evaluate(() => document.documentElement.classList.contains('sb-off') && getComputedStyle(document.getElementById('sidebar')).display === 'none') && !!(await p.$('.rail-item[data-rail=news].active')));
    ok('Titel „News“, kein Zeitraum-/Konto-Kopf', (await p.textContent('.topbar h1')).trim() === 'News' && !(await p.$('#content [data-action=range-open]')));
    /* ohne Server: Beispielansicht */
    const sample = await p.evaluate(() => ({ banner: (document.querySelector('.nw-banner') || {}).textContent || '', link: !!document.querySelector('.nw-banner a[href="#/settings/mentor"]'), titles: [...document.querySelectorAll('.nw-title')].map(t => t.textContent), vals: document.querySelectorAll('.nw-v:not(.e)').length }));
    ok('Ohne Server: Beispielansicht klar markiert, Link „Server einrichten“', /Beispielansicht/.test(sample.banner) && sample.link, sample.banner);
    ok('Beispiele: alle Titel mit „Beispiel:“, keine Prognose-/Vorwerte', sample.titles.length > 0 && sample.titles.every(t => t.startsWith('Beispiel:')) && sample.vals === 0, JSON.stringify(sample));
    ok('Ohne Server kein Abruf', calls === 0);
    /* mit Server */
    await p.evaluate(() => { Store.setSetting('mentor', { url: 'http://news.test/', token: 'geheim' }); App.rerender(); });
    await p.waitForTimeout(700);
    ok('Abruf über den eigenen Server mit Zugangstoken', calls === 1 && lastAuth === 'Bearer geheim', `${calls} ${lastAuth}`);
    const v = await p.evaluate(() => ({ banner: !!document.querySelector('.nw-banner'), days: [...document.querySelectorAll('.nw-day')].map(d => [d.querySelector('.nw-rel') ? d.querySelector('.nw-rel').textContent.trim() : '', [...d.querySelectorAll('.nw-title')].map(t => t.textContent)]), foot: (document.querySelector('.nw-foot') || {}).textContent || '' }));
    ok('Kein Beispiel-Hinweis mehr; Quelle und Stand im Fuß', !v.banner && /ForexFactory/.test(v.foot) && /Stand/.test(v.foot), v.foot);
    /* Erwartung je nach Uhrzeit: „in 2 Std.“ kann nach Mitternacht fallen (dann steht CPI unter Morgen), „vor 3 Std.“ vor Mitternacht */
    const sameDay = (a, b) => a.toDateString() === b.toDateString(); const nowD = new Date(); const cpiToday = sameDay(new Date(Date.now() + 2 * H + 60e3), nowD), pastToday = sameDay(new Date(Date.now() - 3 * H), nowD);
    const expDays = [['Heute', [pastToday ? 'Vorbei heute' : null, cpiToday ? 'CPI m/m' : null].filter(Boolean)], ['Morgen', [cpiToday ? null : 'CPI m/m', 'ZEW Economic Sentiment'].filter(Boolean)]].filter(g => g[1].length);
    ok('Nach Tagen gruppiert: Heute, Morgen; gestern nicht; Standardfilter ohne Niedrig und Feiertage', JSON.stringify(v.days) === JSON.stringify(expDays), JSON.stringify(v.days) + ' erwartet ' + JSON.stringify(expDays));
    ok('Vergangene Termine heute sind abgeblendet', await p.$eval('.nw-row:has(.nw-title)', r => r.classList.contains('past') && getComputedStyle(r).opacity < 0.7));
    const next = await p.evaluate(() => ({ t: document.querySelector('.nw-next-t b').textContent, when: document.querySelector('[data-news-in]').textContent.trim() }));
    ok('Karte „Nächste wichtige News“: CPI in 2 Std.', next.t === 'CPI m/m' && /^in 2 Std\./.test(next.when), JSON.stringify(next));
    const cpi = await p.evaluate(() => { const r = [...document.querySelectorAll('.nw-row')].find(x => x.querySelector('.nw-title').textContent === 'CPI m/m'); return { vals: [...r.querySelectorAll('.nw-v:not(.e)')].map(x => x.querySelector('small').textContent + '=' + x.querySelector('b').textContent), imp: r.querySelector('.nw-imp').className, cur: r.querySelector('.nw-cur').textContent }; });
    ok('Zeile: Prognose und Vorher, Wichtigkeit „hoch“ (3 Balken), Währung', cpi.vals.join(',') === 'Prognose=0.3%,Vorher=0.2%' && /\bl3\b/.test(cpi.imp) && cpi.cur === 'USD', JSON.stringify(cpi));
    ok('Ist-Wert bei veröffentlichtem Termin', await p.evaluate(() => [...document.querySelectorAll('.nw-row')].find(x => x.querySelector('.nw-title').textContent === 'Vorbei heute').querySelector('.nw-v small').textContent === 'Ist'));
    /* Filter */
    await p.click('[data-action=news-f][data-key=impact][data-value=low]'); await p.waitForTimeout(300);
    ok('Filter „Niedrig“ zeigt den Termin mit niedriger Wichtigkeit und wird gespeichert', (await p.$$eval('.nw-title', t => t.map(x => x.textContent))).includes('Trade Balance') && (await p.evaluate(() => Store.settings.newsFilter.impact.includes('low'))));
    await p.click('[data-action=news-f][data-key=impact][data-value=holiday]'); await p.waitForTimeout(300);
    ok('Feiertage mit Kalender-Symbol und „Ganztägig“', !!(await p.$('.nw-row.imp-holiday .nw-imp.hol svg')) && (await p.textContent('.nw-row.imp-holiday .nw-time')).trim() === 'Ganztägig');
    await p.click('[data-action=news-f][data-key=cur][data-value=USD]'); await p.waitForTimeout(300);
    ok('Währung USD: nur USD-Termine', (await p.$$eval('.nw-cur', c => c.filter(x => x.closest('.nw-row')).map(x => x.textContent))).every(c => c === 'USD') && (await p.$$('.nw-row')).length === 1);
    await p.click('[data-action=news-f][data-key=cur][data-value=""]'); await p.waitForTimeout(300);
    ok('„Alle“ setzt die Währungen zurück', (await p.$$('.nw-row')).length === 5 && (await p.evaluate(() => Store.settings.newsFilter.cur.length === 0)));
    ok('Ausgewählte Wichtigkeit-Chips leuchten in ihrer Farbe (Hoch rot)', (await p.$eval('[data-action=news-f][data-value=high]', b => b.style.getPropertyValue('--lc'))) === 'var(--loss)');
    /* letzter Wahl-Chip lässt sich nicht abwählen */
    await p.evaluate(() => { Store.setSetting('newsFilter', { impact: ['high'], cur: [] }); App.rerender(); }); await p.waitForTimeout(200);
    await p.click('[data-action=news-f][data-key=impact][data-value=high]'); await p.waitForTimeout(200);
    ok('Mindestens eine Wichtigkeit bleibt gewählt', await p.evaluate(() => Store.settings.newsFilter.impact.join() === 'high'));
    await p.evaluate(() => { Store.setSetting('newsFilter', null); App.rerender(); });
    /* Zwischenspeicher: Neuaufbau ruft nicht erneut ab, „Aktualisieren“ schon */
    const c0 = calls; await p.evaluate(() => { App.rerender(); App.rerender(); }); await p.waitForTimeout(300);
    ok('Neuaufbau lädt nicht neu (10 Minuten Zwischenspeicher)', calls === c0);
    await p.click('.nw-foot [data-action=news-reload]'); await p.waitForTimeout(500);
    ok('„Aktualisieren“ lädt neu', calls === c0 + 1);
    /* veralteter Stand */
    mode = 'stale'; await p.click('.nw-foot [data-action=news-reload]'); await p.waitForTimeout(500);
    ok('Quelle nicht erreichbar: Hinweis „letzter Stand“', /letzte Stand/.test(await p.textContent('.nw-banner.warn')));
    /* Fehler: falsches Token, keine Endlosschleife */
    mode = '401'; await p.evaluate(() => { App.state.news = null; App.rerender(); }); await p.waitForTimeout(600);
    const c1 = calls; await p.waitForTimeout(1500);
    ok('Falsches Token: klare Meldung mit „Erneut versuchen“', /Zugangstoken/.test(await p.textContent('#content .empty')) && !!(await p.$('#content .empty [data-action=news-reload]')));
    ok('Nach einem Fehler kein Dauer-Abruf', calls === c1, `${c1} → ${calls}`);
    mode = 'ok'; await p.click('#content .empty [data-action=news-reload]'); await p.waitForTimeout(600);
    ok('„Erneut versuchen“ lädt und zeigt Termine', (await p.$$('.nw-row')).length === 3);
    /* andere Serveradresse: neuer Abruf */
    const c2 = calls; await p.evaluate(() => { Store.setSetting('mentor', { url: 'http://news.test/other', token: 'geheim' }); App.rerender(); }); await p.waitForTimeout(600);
    ok('Geänderte Serveradresse lädt neu', calls === c2 + 1);
    /* Englisch */
    await p.evaluate(() => Store.setSetting('language', 'en')); await p.waitForTimeout(400); await p.goto('file:///home/user/Florian/web/app.html#/news', { waitUntil: 'load' }); await p.waitForTimeout(1500);
    const en = await p.evaluate(() => ({ h: document.querySelector('.topbar h1').textContent.trim(), cap: document.querySelector('.nw-next .caption').textContent.trim(), rel: document.querySelector('.nw-rel').textContent.trim(), title: document.querySelector('.nw-title').textContent }));
    ok('Englisch: Oberfläche übersetzt, Termin-Titel unverändert', en.cap !== 'Nächste wichtige News' && en.rel === 'Today' && en.title === 'Vorbei heute', JSON.stringify(en));
    const enAll = await p.evaluate(() => [...document.querySelectorAll('#content *')].filter(e => e.children.length === 0 && !e.closest('.no-i18n') && /[ÄÖÜäöüß]|Wichtigkeit|Beispiel|Termine|Quelle|Stand /.test(e.textContent)).map(e => e.textContent));
    ok('Englisch: keine deutschen Reste auf der Seite', enAll.length === 0, JSON.stringify(enAll));
    await p.evaluate(() => Store.setSetting('language', 'de')); await p.waitForTimeout(400); await p.goto(base + '#/news', { waitUntil: 'load' }); await p.waitForTimeout(1200);
    await p.screenshot({ path: 'news_desk.png', fullPage: true });
    /* Handy */
    await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(500);
    ok('Handy: kein seitliches Scrollen', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await p.screenshot({ path: 'news_phone.png', fullPage: true });
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.evaluate(() => { Store.setSetting('theme', 'light'); Theme.apply(Store.settings); App.rerender(); }); await p.waitForTimeout(400);
    await p.screenshot({ path: 'news_light.png', fullPage: true });
    await p.evaluate(() => { Store.setSetting('theme', 'dark'); Store.setSetting('mentor', { url: '', token: '' }); Store.setSetting('newsFilter', null); Theme.apply(Store.settings); });
  } catch (e) { console.log('CRASH ' + e.stack); }
  console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'no errors');
  console.log(`${pass} PASS, ${fail} FAIL`);
  await b.close();
})();
