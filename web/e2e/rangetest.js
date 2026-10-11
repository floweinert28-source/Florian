/* Zeitraum „Benutzerdefiniert“: zwei Monate nebeneinander, Start/Ende per Klick, Anwenden */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
(async () => { const b = await chromium.launch(); const errs = [];
  for (const vp of [{ w: 1440, h: 900, tag: 'desk' }, { w: 390, h: 844, tag: 'mob', mobile: true }]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await require('./localfonts.js')(p);
    const T = `[${vp.tag}]`;
    await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(800);
    await p.click('[data-pop=range]'); await p.waitForTimeout(350);
    const months = await p.evaluate(() => [...document.querySelectorAll('#pop-range .rr-m')].filter(m => getComputedStyle(m).display !== 'none').map(m => m.querySelector('.rr-m-title').textContent));
    ok(vp.mobile ? months.length === 1 : months.length === 2, `${T} ${vp.mobile ? 'ein Monat' : 'zwei Monate nebeneinander'}: ${months.join(' | ')}`);
    ok(await p.evaluate(() => !document.querySelector('#pop-range input[type=date]')), `${T} keine Datumsfelder mehr`);
    ok(await p.evaluate(() => { const pre = document.querySelector('#pop-range [data-action="range"][aria-checked="true"]'); return !!pre && pre.dataset.value === Store.settings.range.preset && document.querySelector('#pop-range .rr-sum').textContent.includes(pre.textContent.trim()); }), `${T} beim Öffnen ist der aktuelle Zeitraum markiert und unten genannt`);
    await p.click('#pop-range [data-rr="clear"]'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => document.querySelector('#pop-range [data-action="range-custom"]').disabled && !document.querySelector('#pop-range [data-action="range"][aria-checked="true"]')), `${T} Zurücksetzen: nichts gewählt, Anwenden aus`);
    if (!vp.mobile) { const r = await p.evaluate(() => { const a = document.querySelectorAll('#pop-range .rr-m'); const x = a[0].getBoundingClientRect(), y = a[1].getBoundingClientRect(); return Math.abs(x.top - y.top) < 2 && y.left > x.right; }); ok(r, `${T} Monate stehen nebeneinander`); }
    /* Monat zurück, dann 5. bis 18. wählen */
    await p.click('#pop-range [data-rr="prev"]'); await p.waitForTimeout(150);
    const days = await p.evaluate(() => [...document.querySelectorAll('#pop-range .rr-m')].filter(m => getComputedStyle(m).display !== 'none')[0].querySelectorAll('.rr-day[data-k]').length);
    const k = n => p.evaluate(n => [...document.querySelectorAll('#pop-range .rr-m')].filter(m => getComputedStyle(m).display !== 'none')[0].querySelectorAll('.rr-day[data-k]')[n - 1].dataset.k, n);
    const k18 = await k(18), k5 = await k(5);
    await p.click(`#pop-range .rr-day[data-k="${k18}"]`); await p.waitForTimeout(120);
    if (!vp.mobile) { await p.hover(`#pop-range .rr-day[data-k="${k5}"]`); await p.waitForTimeout(120); ok(await p.evaluate(() => document.querySelectorAll('#pop-range .rr-day.pv').length >= 12), `${T} Vorschau beim Überfahren`);
      /* über mehrere Tage ziehen: nur der Tag unter der Maus hat den Rahmen, die vorigen nicht mehr */
      for (const n of [9, 12, 3, 25, 7]) { await p.hover(`#pop-range .rr-day[data-k="${await k(n)}"]`); await p.waitForTimeout(40); }
      ok(await p.evaluate(() => document.querySelectorAll('#pop-range .rr-day.pv-end').length === 1), `${T} Rahmen nur am Tag unter der Maus`);
      await p.mouse.move(5, 5); await p.waitForTimeout(80);
      ok(await p.evaluate(() => document.querySelectorAll('#pop-range .rr-day.pv, #pop-range .rr-day.pv-end').length === 0), `${T} Maus raus: keine Vorschau mehr`);
      await p.hover(`#pop-range .rr-day[data-k="${k5}"]`); await p.waitForTimeout(80); }
    await p.click(`#pop-range .rr-day[data-k="${k5}"]`); await p.waitForTimeout(150);
    const sel = await p.evaluate(() => ({ s: (document.querySelector('#pop-range .rr-day.start') || {}).dataset?.k, e: (document.querySelector('#pop-range .rr-day.end') || {}).dataset?.k, inn: document.querySelectorAll('#pop-range .rr-day.in').length, sum: document.querySelector('#pop-range .rr-sum').textContent.trim(), open: document.getElementById('pop-range').classList.contains('open') }));
    ok(sel.s === k5 && sel.e === k18 && sel.inn === 12 && sel.open, `${T} früherer Tag wird Start: ${sel.s} – ${sel.e}, ${sel.inn} Tage dazwischen, Menü bleibt offen`);
    ok(/–/.test(sel.sum), `${T} Zusammenfassung: ${sel.sum}`);
    if (!vp.mobile) await p.screenshot({ path: 'langshots/range-pop.png', clip: await p.evaluate(() => { const r = document.getElementById('pop-range').getBoundingClientRect(); return { x: Math.max(0, r.left - 10), y: Math.max(0, r.top - 10), width: r.width + 20, height: r.height + 20 }; }) });
    else await p.screenshot({ path: 'langshots/range-pop-mob.png' });
    await p.click('#pop-range [data-action="range-custom"]'); await p.waitForTimeout(500);
    const saved = await p.evaluate(() => Object.assign({}, Store.settings.range, { open: !!document.querySelector('#pop-range.open'), label: document.querySelector('[data-pop=range] span').textContent }));
    ok(saved.preset === 'custom' && saved.from === k5 && saved.to === k18 && !saved.open, `${T} Anwenden speichert ${saved.from} bis ${saved.to}, Menü zu, Knopf: ${saved.label}`);
    /* wieder öffnen: gespeicherter Zeitraum ist markiert */
    await p.click('[data-pop=range]'); await p.waitForTimeout(300);
    ok(await p.evaluate(([a, z]) => { const s = document.querySelector('#pop-range .rr-day.start'), e = document.querySelector('#pop-range .rr-day.end'); return !!s && s.dataset.k === a && !!e && e.dataset.k === z; }, [k5, k18]), `${T} gespeicherter Zeitraum wieder markiert`);
    /* fester Zeitraum funktioniert weiter */
    /* Vorgabe links: erst markieren (Kalender zeigt die Tage), übernommen wird erst mit „Anwenden“ */
    await p.click('#pop-range [data-action="range"][data-value="week"]'); await p.waitForTimeout(300);
    const wk = await p.evaluate(() => ({ preset: Store.settings.range.preset, open: document.getElementById('pop-range').classList.contains('open'), checked: document.querySelector('#pop-range [data-action="range"][aria-checked="true"]').dataset.value, sum: document.querySelector('#pop-range .rr-sum').textContent, start: !!document.querySelector('#pop-range .rr-day.start'), can: !document.querySelector('#pop-range [data-action="range-custom"]').disabled }));
    ok(wk.preset === 'custom' && wk.open && wk.checked === 'week' && /Diese Woche/.test(wk.sum) && wk.start && wk.can, `${T} Vorgabe nur markiert, nicht übernommen · ${wk.sum}`);
    /* eigener Tag statt Vorgabe: Markierung links weg */
    await p.click('#pop-range .rr-m:not([style*="none"]) .rr-day[data-k]'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => !document.querySelector('#pop-range [data-action="range"][aria-checked="true"]') && !!document.querySelector('#pop-range .rr-day.start') && !document.querySelector('#pop-range .rr-pname')), `${T} Tag gewählt: Vorgabe links nicht mehr markiert`);
    await p.click('#pop-range [data-action="range"][data-value="all"]'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => Store.settings.range.preset === 'custom' && /Gesamt/.test(document.querySelector('#pop-range .rr-sum').textContent)), `${T} Gesamt markiert, noch nicht übernommen`);
    await p.click('#pop-range [data-action="range-custom"]'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => Store.settings.range.preset === 'all' && !document.getElementById('pop-range').classList.contains('open')), `${T} Anwenden übernimmt die Vorgabe, Menü zu`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${T} kein Querscrollen`);
    await ctx.close();
  }
  /* Englisch: Monatsnamen übersetzt */
  { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///home/user/Florian/web/app.html#/dashboard', { waitUntil: 'load' }); await p.waitForTimeout(500);
    await p.evaluate(() => { Store.setSetting('language', 'en'); I18N.setLang('en'); }); await p.waitForTimeout(600); await p.evaluate(() => App.render({ enter: false })); await p.waitForTimeout(300);
    await p.click('[data-pop=range]'); await p.waitForTimeout(300);
    const t = await p.evaluate(() => [document.querySelector('#pop-range .rr-m-title').textContent, document.querySelector('#pop-range .rr-week span').textContent, document.querySelector('#pop-range .rr-sum').textContent.trim(), document.querySelector('#pop-range .sec').textContent].join(' | '));
    ok(/^[A-Z][a-z]+ \d{4} \| Mon \| This month[A-Z][a-z]{2} \d+, \d{4} – [A-Z][a-z]{2} \d+, \d{4} \| Custom$/.test(t), 'Englisch: ' + t);
    await p.evaluate(() => { Store.setSetting('language', 'de'); }); }
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0); })();
