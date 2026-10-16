/* Widgets nach Vorlagen von 21st.dev: Trefferquote nach Wochentag (Mini Chart), Trades nach Setup (Pie), Trefferquote nach Setup (Radar),
   Trefferquote-Ring (Progress). Bibliothek, gleiche Zahlen wie Core, Hover, feste Setup-Farben, Hinweise, Animation, Englisch, Handy */
const { chromium } = require('playwright');
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('PASS ' + m); } else { fail++; console.log('FAIL ' + m); } };
const NEW = ['wochentag_quote', 'setup_verteilung', 'setup_radar', 'trefferquote_ring'];
const NAMES = ['Trefferquote nach Wochentag', 'Trades nach Setup', 'Trefferquote nach Setup', 'Trefferquote-Ring'];
const URL = 'file:///home/user/Florian/web/app.html#/dashboard';
const put = N => { const d = Store.dashboards().find(x => x.isDefault); d.layout.unten = N.map(t => ({ typ: t, groesse: 'klein' })).concat(d.layout.unten.filter(w => !N.includes(w.typ))); Store.data.settings.range = { preset: 'all', from: null, to: null }; Store.saveNow(); App.rerender(false); };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const watch = (p, tag) => { p.on('pageerror', e => errs.push(tag + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ': ' + m.text()); }); };
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1100 } }); const p = await ctx.newPage(); watch(p, 'desk'); try { await require('./localfonts.js')(p); } catch (e) {}
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(900);
  /* 0) Bestehendes bleibt: das Standard-Dashboard enthält die neuen Widgets nicht von selbst */
  ok(await p.evaluate(N => !Store.dashboards().some(d => d.layout.unten.some(w => N.includes(w.typ))), NEW), 'Standard-Dashboard unverändert (neue Widgets nur über „Widget hinzufügen“)');
  /* 2) Darstellung */
  await p.evaluate(put, NEW); await p.waitForTimeout(2200);
  const titles = await p.$$eval('.dash-main > .w .card-title', els => els.slice(0, 4).map(e => e.textContent.trim()));
  ok(JSON.stringify(titles) === JSON.stringify(NAMES), 'Vier Karten mit Titeln · ' + titles.join(' | '));
  const ov = await p.evaluate(() => [...document.querySelectorAll('.dash-main > .w')].slice(0, 4).map(w => { const c = w.querySelector('.card'); return [w.scrollHeight - w.clientHeight, c.scrollHeight - c.clientHeight, c.scrollWidth - c.clientWidth]; }));
  ok(ov.every(x => x.every(v => v <= 1)), 'Kein Überlauf in den Karten · ' + JSON.stringify(ov));
  ok(!(await p.evaluate(() => /konnte nicht berechnet werden|Unbekanntes Widget/.test(document.getElementById('content').textContent))), 'Keine Fehlerhinweise');
  /* 3) Mini Chart: gleiche Werte wie Core */
  const mc = await p.evaluate(() => { const list = App.allTrades(); const ta = Core.timeAnalysis(list).weekdays; const s = Core.summary(list); const cols = [...document.querySelectorAll('.mc-col')];
    const want = Core.WEEKDAYS.map((k, i) => ({ i, g: ta.find(g => g.key === k) })).filter(x => x.i < 5 || x.g);
    return { n: cols.length, wantN: want.length, all: document.querySelector('.mc-v.on').textContent.trim(), wantAll: UI.fmt.pct(s.winRate, 0), tips: cols.map(c => c.querySelector('.mc-tip').textContent.trim()), wantTips: want.map(x => x.g ? UI.fmt.pct(x.g.s.winRate, 0) : '—'), tallest: Math.max(...cols.map(c => parseFloat(c.querySelector('.mc-bar').style.height))) }; });
  ok(mc.n === mc.wantN && mc.all === mc.wantAll && JSON.stringify(mc.tips) === JSON.stringify(mc.wantTips) && Math.abs(mc.tallest - 100) < 0.01, `Mini Chart: ${mc.n} Balken, Gesamt ${mc.all}, Werte ${mc.tips.join(' ')} wie Core, höchster Balken füllt die Höhe`);
  await (await p.$('.mc-col[data-p="2"]')).hover(); await p.waitForTimeout(400);
  const hv = await p.evaluate(() => { const box = document.querySelector('.mc'); const on = [...document.querySelectorAll('.mc-col.on')].map(c => c.dataset.p); const nb = [...document.querySelectorAll('.mc-col.nb')].map(c => c.dataset.p); const tip = getComputedStyle(document.querySelector('.mc-col.on .mc-tip')).opacity; const bar = getComputedStyle(document.querySelector('.mc-col.on .mc-bar')).backgroundColor; const other = getComputedStyle(document.querySelector('.mc-col[data-p="0"] .mc-bar')).backgroundColor; return { hov: box.classList.contains('hov'), on, nb, tip, head: document.querySelector('.mc-l.on').textContent.trim(), val: document.querySelector('.mc-v.on').textContent.trim(), want: UI.fmt.pct(Core.timeAnalysis(App.allTrades()).weekdays.find(g => g.key === 'Mi').s.winRate, 0), bar, other }; });
  ok(hv.hov && hv.on.join() === '2' && hv.nb.sort().join() === '1,3' && +hv.tip > 0.9 && /^Mittwoch · \d+ Trades$/.test(hv.head) && hv.val === hv.want && hv.bar !== hv.other, `Hover Mittwoch: Balken hervorgehoben, Nachbarn 1 und 3, Tooltip sichtbar, Kopf „${hv.head}“ ${hv.val}`);
  await p.mouse.move(5, 5); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('.mc').classList.contains('hov') && document.querySelector('.mc-l.on').dataset.p === 'all'), 'Maus weg: zurück zu „Alle Tage“');
  /* 4) Pie: Segmente, Summen, Tooltip */
  const pie = await p.evaluate(() => { const c = Core.closedOnly(App.allTrades()); const segs = document.querySelectorAll('.pie-seg'); const leg = [...document.querySelectorAll('.pie-legend span')]; const sum = leg.reduce((a, s) => a + Number(s.querySelector('b').textContent.replace(/\D/g, '')), 0); const lbls = [...document.querySelectorAll('.pie-svg text')].map(t => t.textContent); const setups = new Set(c.map(t => t.setup).filter(Boolean)); return { segs: segs.length, leg: leg.length, sum, n: c.length, lbls, setups: setups.size, ink: getComputedStyle(document.querySelector('.pie-svg text')).fill, seg0: getComputedStyle(segs[0]).fill }; });
  ok(pie.segs === pie.leg && pie.segs === Math.min(pie.setups, 5) + (pie.setups > 5 ? 1 : 0) && pie.sum === pie.n, `Pie: ${pie.segs} Segmente = Legende, Summe ${pie.sum} = ${pie.n} geschlossene Trades`);
  ok(pie.ink !== pie.seg0 && pie.lbls.length >= 1, `Zahlen im Segment in eigener Kontrastfarbe (${pie.ink} auf ${pie.seg0})`);
  /* gleich breite Lücken: an jeder Trennlinie innen, mittig und außen gleich breit (Punkte knapp in der Lücke frei, knapp daneben im Segment) */
  const gaps = await p.evaluate(() => { const svg = document.querySelector('.pie-svg'); const segs = [...svg.querySelectorAll('path.pie-seg')]; const vb = svg.viewBox.baseVal; const cx = vb.width / 2, cy = vb.height / 2; const r1 = Math.min(vb.width, vb.height) / 2 - 4, r0 = r1 * 0.3; const gap = Math.round(Math.max(4, r1 * 0.045));
    const total = segs.length; const pts = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q; }; let a = -Math.PI / 2; const ns = [...document.querySelectorAll('.pie-legend b')].map(b => +b.textContent.replace(/\D/g, '')); const sum = ns.reduce((x, y) => x + y, 0); const res = [];
    ns.forEach((n, i) => { a += n / sum * 2 * Math.PI; const A = segs[i], B = segs[(i + 1) % total]; const u = [Math.cos(a), Math.sin(a)], nrm = [-Math.sin(a), Math.cos(a)];
      for (const t of [r0 + (r1 - r0) * 0.3, (r0 + r1) / 2, r0 + (r1 - r0) * 0.75]) { const at = h => pts(cx + t * u[0] + h * nrm[0], cy + t * u[1] + h * nrm[1]);
        res.push(!A.isPointInFill(at(-(gap / 2 - 1))) && !B.isPointInFill(at(gap / 2 - 1)) && A.isPointInFill(at(-(gap / 2 + 1.5))) && B.isPointInFill(at(gap / 2 + 1.5))); } });
    return { ok: res.length > 0 && res.every(Boolean), n: res.length, gap }; });
  ok(gaps.ok, `Pie: Lücken innen, mittig und außen gleich breit (${gaps.gap} px, ${gaps.n} Messpunkte)`);
  await (await p.$('.pie-seg')).hover(); await p.waitForTimeout(400);
  const ptip = await p.evaluate(() => { const t = document.getElementById('tip'); const s = [...document.querySelectorAll('.pie-seg')].map(x => getComputedStyle(x).opacity); return { on: t && t.classList.contains('on'), txt: t ? t.textContent : '', s }; });
  ok(ptip.on && /Trefferquote \d+\s?%/.test(ptip.txt) && /\d+ Trades/.test(ptip.txt) && +ptip.s[0] === 1 && ptip.s.slice(1).every(o => +o < 0.6), 'Pie-Hover: Tooltip mit Trades und Trefferquote, andere Segmente treten zurück · ' + ptip.txt);
  await p.mouse.move(5, 5);
  /* feste Farben: ein Setup behält seine Farbe, auch wenn der Zeitraum nur einen Teil der Setups enthält */
  const col1 = await p.evaluate(() => { const leg = [...document.querySelectorAll('.pie-legend span')]; return Object.fromEntries(leg.map(s => [s.childNodes[1].textContent.trim(), s.querySelector('i').style.background])); });
  await p.evaluate(() => { const c = Core.closedOnly(App.allTrades()).sort((a, b) => a.close - b.close); const keep = c[0].setup; const day = c.find(t => t.setup && t.setup !== keep) || c[0]; const k = Core.dayKey(day.close); Store.data.settings.range = { preset: 'custom', from: k, to: k }; Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(900);
  const col2 = await p.evaluate(() => { const leg = [...document.querySelectorAll('.pie-legend span')]; return Object.fromEntries(leg.map(s => [s.childNodes[1].textContent.trim(), s.querySelector('i').style.background])); });
  ok(Object.keys(col2).length >= 1 && Object.keys(col2).every(k => !col1[k] || col1[k] === col2[k]), 'Setup-Farben bleiben beim Zeitraumwechsel gleich · ' + JSON.stringify(col2));
  await p.evaluate(() => { Store.data.settings.range = { preset: 'all', from: null, to: null }; Store.saveNow(); App.rerender(false); }); await p.waitForTimeout(900);
  /* 5) Radar: Achsen, Werte, Tooltip */
  const rd = await p.evaluate(() => { const g = Core.groupBy(App.allTrades(), t => t.setup || null); const hits = [...document.querySelectorAll('.sr-hit')]; const lbls = [...document.querySelectorAll('.sr-lbl')].map(t => t.textContent); const svg = document.querySelector('.sr-svg').getBoundingClientRect(); const bb = document.querySelector('.sr-svg').getBBox(); return { n: hits.length, want: Math.min(8, g.length), lbls, names: g.map(x => x.key), fits: bb.x >= -1 && bb.x + bb.width <= svg.width + 1 }; });
  ok(rd.n === rd.want && rd.lbls.every(l => rd.names.some(n => n.startsWith(l.replace('…', '')))) && rd.fits, `Radar: ${rd.n} Achsen (${rd.lbls.join(', ')}), Beschriftungen passen in die Karte`);
  const hb = await (await p.$('.sr-hit[data-i="0"]')).boundingBox(); await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.waitForTimeout(400);
  const rtip = await p.evaluate(() => { const t = document.getElementById('tip'); return { on: t.classList.contains('on'), txt: t.textContent, dot: getComputedStyle(document.querySelector('.sr-dot[data-i="0"]')).opacity, lbl: document.querySelector('.sr-lbl[data-i="0"]').classList.contains('on') }; });
  ok(rtip.on && /Trefferquote \d+\s?%/.test(rtip.txt) && +rtip.dot > 0.9 && rtip.lbl, 'Radar-Hover: Tooltip, Punkt und Beschriftung hervorgehoben · ' + rtip.txt);
  await p.mouse.move(5, 5);
  /* weniger als drei Setups → Hinweis statt Netz; ohne Setups → Hinweis zum Eintragen */
  const hints = await p.evaluate(() => { const W = Widgets; const d = Widgets.data({ inRange: App.allTrades(), all: App.allTrades() }, App); const c = d.closed; const two = c.map((t, i) => Object.assign({}, t, { setup: i % 2 ? 'A' : 'B' })); const none = c.map(t => Object.assign({}, t, { setup: null }));
    const r = (typ, closed) => W.get(typ).render(Object.assign({}, d, { closed, empty: false, list: closed, all: closed }), { typ }, W.get(typ), App);
    return { two: r('setup_radar', two), none: r('setup_radar', none), pieNone: r('setup_verteilung', none) }; });
  ok(/Zu wenige Setups/.test(hints.two) && /Bisher: (A, B|B, A)/.test(hints.two) && /Noch keine Setups/.test(hints.none) && /Noch keine Setups/.test(hints.pieNone), 'Hinweise: unter drei Setups und ohne Setups');
  /* 6) Ring: Wert, Animation von 0, Fußzeile (nach dem Zeitraumwechsel erst die Animation auslaufen lassen) */
  await p.waitForTimeout(1700);
  const ring = await p.evaluate(() => { const s = Core.summary(App.allTrades()); const last = Core.closedOnly(App.allTrades()).sort((a, b) => b.close - a.close).slice(0, 20); return { v: document.querySelector('.wr-v').textContent, want: String(Math.round(s.winRate * 100)), aria: document.querySelector('.wr-svg').getAttribute('aria-valuenow'), sub: document.querySelector('.wr-s').textContent.trim(), wantSub: `${UI.fmt.int(s.wins)} von ${s.n} Trades`, foot: document.querySelector('.wr-foot b').textContent.replace(/[↑↓]\s?/, '').trim(), wantFoot: UI.fmt.pct(Core.summary(last).winRate, 0), off: +document.querySelector('.wr-bar').getAttribute('stroke-dashoffset'), wantOff: 2 * Math.PI * 80 * (1 - s.winRate) }; });
  ok(await p.evaluate(() => { const b = document.querySelector('.wr-bar'); return b.tagName === 'path' && !b.getAttribute('transform') && /^M100 20 /.test(b.getAttribute('d')) && !document.querySelector('.wr-svg [transform]'); }), 'Ring: Bogen beginnt oben ohne Drehung per transform (überall gleich gezeichnet)');
  ok(ring.v === ring.want && ring.aria === ring.want && ring.sub.replace(/\./g, '') === ring.wantSub.replace(/\./g, '') && ring.foot === ring.wantFoot && Math.abs(ring.off - ring.wantOff) < 0.05, `Ring: ${ring.v} % (${ring.sub}), letzte 20: ${ring.foot}, Bogen passt`);
  const anim = await b.newContext({ viewport: { width: 1440, height: 1100 } }); const q = await anim.newPage(); watch(q, 'anim'); try { await require('./localfonts.js')(q); } catch (e) {}
  await q.goto(URL, { waitUntil: 'load' }); await q.waitForTimeout(700); await q.evaluate(put, ['trefferquote_ring']);
  const early = await q.evaluate(() => new Promise(r => setTimeout(() => r(+document.querySelector('.wr-v').textContent), 250)));
  await q.waitForTimeout(1700); const late = await q.evaluate(() => ({ v: +document.querySelector('.wr-v').textContent, want: Math.round(Core.summary(App.allTrades()).winRate * 100) }));
  ok(Number.isFinite(early) && early < late.want && late.v === late.want, `Ring zählt hoch (${early} → ${late.v})`);
  await q.evaluate(() => App.rerender(false)); const again = await q.evaluate(() => new Promise(r => setTimeout(() => r(+document.querySelector('.wr-v').textContent), 60)));
  ok(again === late.want, 'Neu aufbauen ohne neuen Wert: keine erneute Animation');
  await anim.close();
  const rm = await b.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' }); const r = await rm.newPage(); watch(r, 'rm'); try { await require('./localfonts.js')(r); } catch (e) {}
  await r.goto(URL, { waitUntil: 'load' }); await r.waitForTimeout(700); await r.evaluate(put, ['trefferquote_ring']);
  const rmv = await r.evaluate(() => new Promise(res => setTimeout(() => res({ v: +document.querySelector('.wr-v').textContent, want: Math.round(Core.summary(App.allTrades()).winRate * 100) }), 80)));
  ok(rmv.v === rmv.want, 'Weniger Bewegung: Wert sofort, ohne Hochzählen');
  await rm.close();
  /* 7) Hell */
  await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'light')); await p.waitForTimeout(300);
  const lt = await p.evaluate(() => ({ p1: getComputedStyle(document.documentElement).getPropertyValue('--pie-1').trim(), area: getComputedStyle(document.querySelector('.sr-area')).fillOpacity }));
  ok(lt.p1 === '#2a78d6' && Math.abs(+lt.area - 0.32) < 0.01, `Helles Design: eigene Kategorie-Farben (${lt.p1}), Netz-Fläche leichter (${lt.area})`);
  await p.evaluate(() => document.documentElement.removeAttribute('data-theme'));
  /* 8) Englisch */
  await p.goto('file:///home/user/Florian/web/app.html#/settings/sprache', { waitUntil: 'load' }); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.lang-card[data-value="en"]').click()); await p.waitForTimeout(500);
  await p.goto(URL, { waitUntil: 'load' }); await p.waitForTimeout(1500);
  const en = await p.evaluate(() => ({ t: [...document.querySelectorAll('.dash-main > .w .card-title')].slice(0, 4).map(e => e.textContent.trim()), all: document.querySelector('.mc-l.on').textContent.trim(), wd: [...document.querySelectorAll('.mc-wd')].map(x => x.textContent), foot: document.querySelector('.wr-foot').textContent.trim(), sub: document.querySelector('.wr-s').textContent.trim() }));
  ok(en.t.join('|') === 'Win rate by weekday|Trades by setup|Win rate by setup|Win rate ring' && /^All days · [\d,]+ trades$/.test(en.all) && en.wd[0] === 'Mon' && /^Last 20 trades/.test(en.foot) && /^\d+ of [\d,]+ trades$/.test(en.sub), 'Englisch: Titel, Kopf, Wochentage und Ring übersetzt · ' + JSON.stringify(en));
  await (await p.$('.pie-seg')).hover(); await p.waitForTimeout(400);
  const entip = await p.evaluate(() => document.getElementById('tip').textContent);
  ok(/Win rate \d+\s?%/.test(entip) && /\d+ trades/.test(entip), 'Englisch: Tooltip übersetzt · ' + entip);
  await p.goto('file:///home/user/Florian/web/app.html#/settings/sprache', { waitUntil: 'load' }); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.lang-card[data-value="de"]').click()); await p.waitForTimeout(400);
  /* 9) Handy */
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const mp = await m.newPage(); watch(mp, 'mob'); try { await require('./localfonts.js')(mp); } catch (e) {}
  await mp.goto(URL, { waitUntil: 'load' }); await mp.waitForTimeout(900); await mp.evaluate(put, NEW); await mp.waitForTimeout(1500);
  ok(await mp.evaluate(() => document.documentElement.scrollWidth <= 390 && document.querySelectorAll('.mc-col').length >= 5 && document.querySelectorAll('.pie-seg').length >= 1 && !!document.querySelector('.sr-svg') && !!document.querySelector('.wr-svg')), 'Handy: kein Überlauf, alle vier Widgets gezeichnet');
  const col = await mp.$('.mc-col[data-p="1"]'); await col.scrollIntoViewIfNeeded(); await col.tap(); await mp.waitForTimeout(400);
  ok(await mp.evaluate(() => document.querySelector('.mc-col.on') && document.querySelector('.mc-col.on').dataset.p === '1' && /^Dienstag/.test(document.querySelector('.mc-l.on').textContent.trim())), 'Handy: Tippen auf einen Balken zeigt den Tag');
  await m.close();
  /* 10) Bibliothek (eigene Seite: der Bearbeitungsmodus bleibt sonst offen) */
  const lc = await b.newContext({ viewport: { width: 1440, height: 1100 } }); const lp = await lc.newPage(); watch(lp, 'lib'); try { await require('./localfonts.js')(lp); } catch (e) {} await lp.goto(URL, { waitUntil: 'load' }); await lp.waitForTimeout(900);
  await lp.click('.dash-head [data-pop=tpl]'); await lp.waitForTimeout(200); await lp.click('#pop-tpl [data-action="dash-tpl-edit"]'); await lp.waitForTimeout(400);
  await lp.click('.add-slot[data-area="unten"]'); await lp.waitForTimeout(500);
  const lib = await lp.evaluate(N => { const L = document.getElementById('dash-add-list'); const items = [...L.querySelectorAll('.sp-item')]; const names = items.map(x => (x.querySelector('b, .sp-name, h4') || x).textContent.trim()); return { found: N.map(n => names.some(t => t.startsWith(n))), pv: N.map(n => { const it = items.find(x => (x.querySelector('b, .sp-name, h4') || x).textContent.trim().startsWith(n)); return !!(it && it.querySelector('svg.wpv text')); }) }; }, NAMES);
  ok(lib.found.every(Boolean) && lib.pv.every(Boolean), 'Bibliothek: alle vier Widgets mit eigenem Vorschaubild · ' + JSON.stringify(lib));
  await lc.close();
  /* aufräumen: Standard-Dashboard ohne die neuen Widgets */
  await p.evaluate(N => { const d = Store.dashboards().find(x => x.isDefault); d.layout.unten = d.layout.unten.filter(w => !N.includes(w.typ)); Store.saveNow(); }, NEW);
  ok(!errs.length, 'keine Fehler ' + errs.join(' | '));
  console.log(`${pass}/${pass + fail} bestanden`); await b.close(); process.exit(fail ? 1 : 0);
})();
