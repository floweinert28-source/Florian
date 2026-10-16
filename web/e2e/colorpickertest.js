/* Eigener Farbwähler (statt System-Fenster), eigene Farben (gemerkt, höchstens 8, löschbar), Erscheinungsbild „Eigenes“,
   Meine Designs (speichern, anwenden, löschen, höchstens 6) */
const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
let pass = 0, fail = 0; const ok = (n, c, extra = '') => { if (c) { pass++; console.log('PASS ' + n); } else { fail++; console.log('FAIL ' + n + (extra ? ' · ' + extra : '')); } };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.evaluate(() => { localStorage.clear(); }); await p.reload({ waitUntil: 'load' });
  await p.evaluate(() => { location.hash = '#/settings/design'; }); await p.waitForTimeout(900);
  const cp = () => p.evaluate(() => { const e = document.getElementById('pop-cp'); return !!e && e.classList.contains('open') && !e.classList.contains('closing'); });
  const outside = async () => { const h = await p.$('.set-block h3'); const bb = await h.boundingBox(); await p.mouse.click(bb.x + 4, bb.y + 4); await p.waitForTimeout(350); };
  const accent = () => p.evaluate(() => Store.settings.colors.accent);
  const save = async () => { await p.click('#pop-cp [data-cp=save]'); await p.waitForTimeout(300); };

  /* 1. Akzent „+“ öffnet den eigenen Farbwähler */
  await p.click('.dot.custom'); await p.waitForTimeout(350);
  ok('Akzent „+“ öffnet den eigenen Farbwähler (kein System-Fenster)', await cp());
  ok('Farbwähler: Fläche, Farbton-Regler, Vorschau und Hex-Feld', await p.$$eval('#pop-cp .cp-sv, #pop-cp .cp-hue, #pop-cp .cp-prev, #pop-cp .cp-hex input', e => e.length) === 4);
  const box = await p.$eval('#pop-cp', e => { const r = e.getBoundingClientRect(); return { h: r.height, top: r.top, bottom: r.bottom }; });
  ok('Farbwähler vollständig im Fenster (nicht zusammengedrückt)', box.h > 200 && box.top >= 0 && box.bottom <= 900, JSON.stringify(box));
  await p.fill('#pop-cp .cp-hex input', 'ff7a59'); await p.waitForTimeout(200);
  ok('Hex-Feld wirkt sofort (Akzent live)', (await accent()) === '#ff7a59', await accent());
  ok('Unten „Abbrechen“ und „Speichern“', await p.$$eval('#pop-cp .cp-foot [data-cp=cancel], #pop-cp .cp-foot [data-cp=save]', e => e.length) === 2);
  await save();
  ok('„Speichern“ schließt und merkt die Farbe', !(await cp()) && JSON.stringify(await p.evaluate(() => Store.settings.savedColors)) === '["#ff7a59"]');
  ok('Eigene Farbe in der Akzentreihe (nach den Vorgaben, mit Löschen)', await p.$$eval('#saved-colors .dot[data-value="#ff7a59"]', e => e.length) === 1 && await p.$$eval('#saved-colors .dot-x', e => e.length) === 1);

  /* 2. Ziehen auf der Fläche ändert die Farbe; Escape nimmt zurück */
  await p.click('.dot.custom'); await p.waitForTimeout(300);
  const sv = await p.$eval('#pop-cp .cp-sv', e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  await p.mouse.move(sv.x + sv.w * 0.2, sv.y + sv.h * 0.2); await p.mouse.down(); await p.mouse.move(sv.x + sv.w * 0.9, sv.y + sv.h * 0.3, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(150);
  const dragged = await accent();
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok('Ziehen ändert die Farbe live, Escape nimmt sie zurück', dragged !== '#ff7a59' && (await accent()) === '#ff7a59' && !(await cp()), `${dragged} → ${await accent()}`);
  /* Klick daneben und „Abbrechen“ verwerfen, Enter im Hex-Feld speichert */
  await p.click('.dot.custom'); await p.waitForTimeout(250); await p.fill('#pop-cp .cp-hex input', 'abcdef'); await p.waitForTimeout(150);
  const prev1 = await accent(); await outside();
  ok('Klick daneben verwirft: alte Farbe zurück, nichts gemerkt', prev1 === '#abcdef' && (await accent()) === '#ff7a59' && !(await cp()) && JSON.stringify(await p.evaluate(() => Store.settings.savedColors)) === '["#ff7a59"]', `${prev1} → ${await accent()}`);
  await p.click('.dot.custom'); await p.waitForTimeout(250); await p.fill('#pop-cp .cp-hex input', '123abc'); await p.waitForTimeout(150); await p.click('#pop-cp [data-cp=cancel]'); await p.waitForTimeout(300);
  ok('„Abbrechen“ verwirft', (await accent()) === '#ff7a59' && !(await cp()) && !(await p.evaluate(() => Store.settings.savedColors)).includes('#123abc'));
  ok('Markierung stimmt nach dem Verwerfen (eigene Farbe weiter gewählt)', await p.$eval('#saved-colors .dot[data-value="#ff7a59"]', e => e.getAttribute('aria-pressed') === 'true'));
  await p.click('.dot.custom'); await p.waitForTimeout(250); await p.fill('#pop-cp .cp-hex input', '0a7bcc'); await p.press('#pop-cp .cp-hex input', 'Enter'); await p.waitForTimeout(300);
  ok('Enter im Hex-Feld speichert', (await accent()) === '#0a7bcc' && !(await cp()) && (await p.evaluate(() => Store.settings.savedColors))[0] === '#0a7bcc');

  /* 3. Höchstens 8 eigene Farben, neueste vorne */
  for (const c of ['111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999']) { await p.click('.dot.custom'); await p.waitForTimeout(150); await p.fill('#pop-cp .cp-hex input', c); await p.waitForTimeout(80); await save(); }
  const sc = await p.evaluate(() => Store.settings.savedColors);
  ok('Eigene Farben: höchstens 8, neueste vorne', sc.length === 8 && sc[0] === '#999999' && !sc.includes('#ff7a59'), JSON.stringify(sc));
  ok('Akzentreihe zeigt höchstens 8 eigene Farben', await p.$$eval('#saved-colors .dot', e => e.length) === 8);

  /* 4. Löschen: in der Akzentreihe und im Farbwähler */
  await p.hover('#saved-colors .dot-wrap:first-of-type'); await p.click('#saved-colors .dot-x[data-value="#999999"]'); await p.waitForTimeout(250);
  ok('× in der Akzentreihe löscht die Farbe', !(await p.evaluate(() => Store.settings.savedColors)).includes('#999999') && await p.$$eval('#saved-colors .dot', e => e.length) === 7);
  await p.click('.dot.custom'); await p.waitForTimeout(300);
  ok('Farbwähler zeigt die eigenen Farben', await p.$$eval('#pop-cp .cp-c', e => e.length) === 7);
  await p.hover('#pop-cp .cp-s:first-child'); await p.click('#pop-cp .cp-x[data-v="#888888"]'); await p.waitForTimeout(200);
  ok('× im Farbwähler löscht, Farbwähler bleibt offen', !(await p.evaluate(() => Store.settings.savedColors)).includes('#888888') && await cp() && await p.$$eval('#pop-cp .cp-c', e => e.length) === 6);
  await p.click('#pop-cp .cp-c[data-v="#777777"]'); await p.waitForTimeout(150); await save();
  ok('Klick auf eigene Farbe übernimmt sie', (await accent()) === '#777777');

  /* 5. Gewinn-Farbe nutzt denselben Farbwähler */
  await p.click('.cpick input[data-key="profit"]'); await p.waitForTimeout(300);
  ok('Gewinn/Verlust-Farbe: eigener Farbwähler', await cp()); await p.keyboard.press('Escape'); await p.waitForTimeout(250);

  /* 6. Erscheinungsbild „Eigenes“ */
  ok('Vier Karten: Graphit, Schwarz, Weiß, Eigenes (ohne Farbe gestrichelt mit Plus)', await p.$$eval('[data-action="appearance"]', e => e.map(x => x.dataset.value).join(',')) === 'graphit,schwarz,light,custom' && await p.$eval('.theme-card.t-custom', e => e.classList.contains('is-new')));
  /* erstes Mal „Eigenes“, dann daneben klicken: alles wie vorher (Graphit, Karte wieder mit Plus) */
  await p.click('.theme-card.t-custom'); await p.waitForTimeout(300); await p.fill('#pop-cp .cp-hex input', 'aa3355'); await p.waitForTimeout(200);
  const tmp = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()); await outside(); /* Grundfarbe = --bg; das Fenster selbst hat in dunklen Designs die Farbe der Leiste ganz links */
  ok('„Eigenes“ verwerfen: zurück zu Graphit, Karte wieder leer', tmp === '#aa3355' && await p.evaluate(() => !Store.settings.customLook && !Store.settings.customBg && getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#0e0d0b') && await p.$eval('.theme-card.t-custom', e => e.classList.contains('is-new') && e.getAttribute('aria-pressed') === 'false') && await p.$eval('.theme-card.t-graphit', e => e.getAttribute('aria-pressed') === 'true'), tmp);
  await p.click('.theme-card.t-custom'); await p.waitForTimeout(300);
  ok('„Eigenes“ öffnet den Farbwähler', await cp());
  await p.fill('#pop-cp .cp-hex input', '1b2a3f'); await p.waitForTimeout(250);
  const live = await p.evaluate(() => [Store.settings.customLook, getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(), document.querySelector('.theme-card.t-custom').getAttribute('aria-pressed'), getComputedStyle(document.body).backgroundColor === getComputedStyle(document.querySelector('.rail')).backgroundColor]);
  ok('Grundfarbe wirkt sofort: Hintergrund, Karte gewählt', live[0] === true && live[1] === '#1b2a3f' && live[2] === 'true' && live[3], JSON.stringify(live));
  await save();
  const sf = await p.evaluate(() => { const cs = getComputedStyle(document.documentElement); return [cs.getPropertyValue('--surface').trim(), cs.getPropertyValue('--border').trim(), document.documentElement.dataset.theme]; });
  ok('Grundfarbe landet nicht bei den eigenen Akzentfarben', !(await p.evaluate(() => Store.settings.savedColors)).includes('#1b2a3f'));
  ok('Flächen und Ränder aus der Grundfarbe abgeleitet (dunkel)', sf[0] && sf[0] !== '#151412' && sf[2] === 'dark', JSON.stringify(sf));
  ok('Karte „Eigenes“ zeigt Vorschau in der Grundfarbe', await p.$eval('.theme-card.t-custom', e => !e.classList.contains('is-new') && !!e.querySelector('.tc-win') && e.style.getPropertyValue('--c0') === Theme.shade('#1b2a3f', -0.55))); /* Fenster der Vorschau wie die Leiste ganz links */
  /* helle Grundfarbe → helles Design */
  await p.click('.theme-card.t-custom'); await p.waitForTimeout(300); await p.fill('#pop-cp .cp-hex input', 'efe6d8'); await p.waitForTimeout(200); await save();
  ok('Helle Grundfarbe → helles Design', await p.evaluate(() => Store.settings.theme === 'light' && document.documentElement.dataset.theme === 'light' && getComputedStyle(document.body).backgroundColor === 'rgb(239, 230, 216)'));
  /* zurück zu Graphit, eigenes bleibt gespeichert und ist mit einem Klick wieder da */
  await p.click('[data-action="appearance"][data-value="graphit"]'); await p.waitForTimeout(300);
  ok('Graphit: eigenes aus, Grundfarbe bleibt gespeichert', await p.evaluate(() => !Store.settings.customLook && Store.settings.customBg === '#efe6d8' && getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#0e0d0b' && getComputedStyle(document.body).backgroundColor === getComputedStyle(document.querySelector('.rail')).backgroundColor));
  await p.click('.theme-card.t-custom'); await p.waitForTimeout(300);
  ok('Klick auf „Eigenes“ wendet die gespeicherte Grundfarbe an (ohne Farbwähler)', !(await cp()) && await p.evaluate(() => Store.settings.customLook && getComputedStyle(document.body).backgroundColor === 'rgb(239, 230, 216)'));

  /* 7. Meine Designs */
  ok('Meine Designs: leer mit Speichern-Knopf', await p.$$eval('.design-card', e => e.length) === 0 && !!(await p.$('[data-action="design-save"]:not([disabled])')));
  await p.click('[data-action="design-save"]'); await p.waitForTimeout(300); await p.fill('#design-name', 'Sand'); await p.click('.modal button[type=submit]'); await p.waitForTimeout(400);
  await p.click('[data-action="appearance"][data-value="schwarz"]'); await p.waitForTimeout(300); await p.click('.font-card[data-value="system"]'); await p.waitForTimeout(300);
  await p.click('[data-action="design-save"]'); await p.waitForTimeout(300); await p.click('.modal button[type=submit]'); await p.waitForTimeout(400);
  const ds = await p.evaluate(() => Store.settings.designs.map(d => [d.name, d.customLook, d.darkStyle, d.font]));
  ok('Zwei Designs gespeichert (eigenes und Schwarz/System)', ds.length === 2 && ds[0][0] === 'Sand' && ds[0][1] === true && ds[1][2] === 'schwarz' && ds[1][3] === 'system', JSON.stringify(ds));
  ok('Aktuelles Design als gewählt markiert', await p.$eval(`.design-card[data-id="${await p.evaluate(() => Store.settings.designs[1].id)}"]`, e => e.getAttribute('aria-pressed') === 'true'));
  await p.click(`.design-card[data-id="${await p.evaluate(() => Store.settings.designs[0].id)}"]`); await p.waitForTimeout(400);
  ok('Design anwenden stellt alles wieder her (Grundfarbe, Schrift, Farben)', await p.evaluate(() => Store.settings.customLook && Store.settings.customBg === '#efe6d8' && Store.settings.font !== 'system' && Store.settings.colors.accent === '#777777' && getComputedStyle(document.body).backgroundColor === 'rgb(239, 230, 216)'));
  for (let i = 0; i < 4; i++) { await p.click('[data-action="design-save"]'); await p.waitForTimeout(250); await p.click('.modal button[type=submit]'); await p.waitForTimeout(300); }
  ok('Höchstens 6 Designs: Knopf gesperrt, Hinweis', (await p.evaluate(() => Store.settings.designs.length)) === 6 && !!(await p.$('[data-action="design-save"][disabled]')) && (await p.$eval('.design-grid', e => e.parentElement.textContent)).includes('Höchstens 6'));
  await p.hover('.design-wrap:last-child'); await p.click('.design-wrap:last-child .dot-x'); await p.waitForTimeout(300); await p.click('.modal [data-confirm]'); await p.waitForTimeout(400);
  ok('Design löschen, danach wieder speicherbar', (await p.evaluate(() => Store.settings.designs.length)) === 5 && !!(await p.$('[data-action="design-save"]:not([disabled])')));

  /* 8. Nach Neuladen alles noch da */
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(900);
  const rl = await p.evaluate(() => [Store.settings.customLook, getComputedStyle(document.body).backgroundColor, Store.settings.savedColors.length, Store.settings.designs.length]); ok('Nach Neuladen: eigenes Erscheinungsbild, eigene Farben und Designs bleiben', rl[0] && rl[1] === 'rgb(239, 230, 216)' && rl[2] === 6 && rl[3] === 5, JSON.stringify(rl));

  /* 9. Hell/Dunkel-Schalter verlässt „Eigenes“ */
  await p.evaluate(() => App.actions.theme.call(App, { dataset: { value: 'dark' } })); await p.waitForTimeout(300);
  ok('Hell/Dunkel-Schalter wählt die festen Designs (Graphit; Fensterhintergrund in der Farbe der Leiste ganz links)', await p.evaluate(() => !Store.settings.customLook && document.documentElement.dataset.dark === 'graphit' && getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#0e0d0b' && getComputedStyle(document.body).backgroundColor === getComputedStyle(document.querySelector('.rail')).backgroundColor));

  /* 10. Andere Farbfelder (Notebook-Ordner) nutzen den Farbwähler ebenfalls */
  const other = await p.evaluate(() => { const i = document.createElement('input'); i.type = 'color'; i.value = '#123456'; i.id = 'tmp-color'; document.body.appendChild(i); return true; });
  await p.click('#tmp-color'); await p.waitForTimeout(300);
  ok('Jedes Farbfeld öffnet den eigenen Farbwähler', other && await cp()); await p.keyboard.press('Escape');

  /* 11. Kalender klappt nach oben, ohne zusammengedrückt zu werden */
  await p.setViewportSize({ width: 1440, height: 520 }); await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(700);
  await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(500);
  await p.$eval('#f-close', e => e.scrollIntoView({ block: 'end' })); await p.click('#f-close'); await p.waitForTimeout(350);
  const dpH = await p.$eval('#pop-dp', e => e.getBoundingClientRect().height);
  ok('Kalender (auch nach oben geklappt) in voller Höhe', dpH > 250, String(dpH));
  /* Akzentfarbe ändert nur Hervorhebungen, nie Long, Gewinn oder „gut“ */
  await p.keyboard.press('Escape'); await p.setViewportSize({ width: 1600, height: 1000 });
  await p.evaluate(() => { Store.settings.colors = { accent: '#ff00ff' }; Store.saveNow(); Theme.apply(Store.settings); location.hash = '#/trades'; }); await p.waitForTimeout(800);
  const sem = await p.evaluate(() => { const mag = e => !!e && ['color', 'backgroundColor', 'borderColor'].some(k => getComputedStyle(e)[k].includes('255, 0, 255')); const pick = s => document.querySelector(s);
    return { long: mag(pick('.badge.l')) || mag(pick('.badge.l .bi')), win: mag(pick('.pill.win')), ring: /accent/.test(UI.ring(90)), score: /accent/.test(UI.scoreColor(90)), scale: /accent/.test(App.scaleColor(5)), sleep: /accent/.test(App.sleepZone(8).color), btn: (s => { const c = (s.match(/[\d.]+/g) || []).map(Number).map(v => s.startsWith('color(') ? v * 255 : v); return c[0] > 200 && c[1] < 120 && c[2] > 200; })(getComputedStyle(pick('.sb-new .btn')).backgroundColor) }; /* Trade loggen ist in der Akzentfarbe gefüllt */ });
  ok('Akzent geändert: Long, Gewinn, Score und Skalen bleiben in Gewinnfarbe, nur Hervorhebungen (Trade loggen) folgen dem Akzent', !sem.long && !sem.win && !sem.ring && !sem.score && !sem.scale && !sem.sleep && sem.btn, JSON.stringify(sem));
  await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(500);
  ok('Trade loggen: Long-Schalter in Gewinnfarbe, nicht im Akzent', await p.evaluate(() => { const o = document.querySelector('.dir-opt.l'); return !!o && !getComputedStyle(o).getPropertyValue('--oc').includes('accent') && !getComputedStyle(document.querySelector('.dir-switch')).getPropertyValue('--dir-c').includes('255, 0, 255'); }));
  await p.keyboard.press('Escape'); await p.evaluate(() => { Store.settings.colors = {}; Store.saveNow(); Theme.apply(Store.settings); });
  ok('Keine Fehler', errs.length === 0, errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close();
})();
