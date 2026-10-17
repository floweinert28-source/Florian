/* Dashboard-Widgets: zentrale Registry, Berechnungen, Diagramme und Bausteine.
   Neues Widget = ein Eintrag in TOP (oberer Bereich) oder MAIN (unterer Bereich): typ, name, desc, info, groesse, preview, render(d, inst). */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt;
  /* Handy: kurze Tageszahl im Kalender („+2,1k“, „−486“); die Vollform (.p) bleibt für große Bildschirme */
  const SIZES = { klein: 'Klein', mittel: 'Mittel', gross: 'Groß' };
  const MAX_TOP = 5;
  const NO_DATA = 'Noch keine Daten';

  /* ---------- gemeinsame Daten je Render (werden erst bei Bedarf berechnet) ---------- */
  function makeData(ctx, App) {
    const d = { list: ctx.inRange, all: ctx.all, account: App.account(), range: App.range() };
    const lazy = (k, fn) => Object.defineProperty(d, k, { configurable: true, enumerable: true, get() { const v = fn(); Object.defineProperty(d, k, { value: v, enumerable: true }); return v; } });
    lazy('closed', () => C.closedOnly(d.list));
    lazy('empty', () => !d.closed.length);
    lazy('s', () => C.summary(d.list));
    lazy('days', () => C.dailyAggregation(d.list));
    lazy('ds', () => C.daySummary(d.days));
    lazy('daysAll', () => C.dailyAggregation(d.all));
    lazy('streaks', () => C.streaks(d.list));
    lazy('dayStreaks', () => C.dayStreaks(d.days));
    lazy('dd', () => C.drawdownStats(d.days, d.account));
    lazy('running', () => C.runningStats(d.days));
    lazy('score', () => C.traderScore(d.list, d.account));
    lazy('report', () => C.reportSeries(d.days));
    return d;
  }

  /* ---------- Bausteine ---------- */
  const noData = () => `<span class="nodata">${NO_DATA}</span>`;
  const emptyBox = (h = 220) => `<div class="empty" style="min-height:${h}px">${I.stats}<b>${NO_DATA}</b><span class="small">Ändere den Zeitraum oder logge Trades.</span></div>`;
  const tile = (e, value, o = {}) => U.tile(e.short || e.name, value, Object.assign({ info: e.info }, o)); /* short: kurzer Kacheltitel, der auch in engen Kacheln in eine Zeile passt */
  const card = (e, body, o = {}) => U.card(e.name, body, Object.assign({ info: e.info }, o));
  const pctText = f => (f < 0 ? '−' : '') + fmt.dec(Math.abs(f * 100), 1) + fmt.pctSuffix();
  const streakPills = (maxW, maxL, unit) => `<span class="pills col">${U.pill(`${maxL}<span class="u"> ${unit}</span>`, 'loss')}${U.pill(`${maxW}<span class="u"> ${unit}</span>`, 'win')}</span>`;
  const streakRing = (n, kind) => `<span class="streak-ring ${kind === 'loss' ? 'loss' : 'win'}">${n}</span>`;
  const durLabel = min => { const sec = Math.round(min * 60); if (sec < 60) return `${sec}s`; const m = Math.floor(sec / 60), sr = sec % 60; if (m < 60) return sr ? `${m}m:${String(sr).padStart(2, '0')}s` : `${m}m`; const h = Math.floor(m / 60), mr = m % 60; if (h < 24) return mr ? `${h}h:${String(mr).padStart(2, '0')}m` : `${h}h`; const dd = Math.floor(h / 24), hr = h % 24; return hr ? `${dd}d:${hr}h` : `${dd}d`; };
  const curCompact = v => { if (fmt.moneyBlind()) return fmt.cur(v, { compact: true, signed: true }); const a = Math.abs(v); const sym = fmt.cur(0, { compact: true }).replace(/[\d.,\s\u00a0−-]/g, ''); const num = a >= 10000 ? Math.round(a / 1000) + 'k' : a >= 1000 ? fmt.kilo(a, 1) : String(Math.round(a)); return (v < -C.EPS ? '−' : '') + (fmt.symbolFirst() ? sym + num : num + '\u00a0' + sym); };
  const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
  const curShort = v => { if (fmt.moneyBlind()) return fmt.cur(v, { compact: true }); const a = Math.abs(v); const s = a >= 1000 ? fmt.kilo(a, a >= 10000 ? 0 : 1) : String(Math.round(a)); return (v < 0 ? '−' : '') + s; };
  const xTicks = (n, iw) => { const k = Math.max(2, Math.min(n, Math.floor(iw / 95) + 1)); if (n <= k) return Array.from({ length: n }, (_, i) => i); return Array.from({ length: k }, (_, i) => Math.round(i / (k - 1) * (n - 1))); };
  const gid = () => 'g' + Math.random().toString(36).slice(2, 8);
  /* leeres Diagramm als Skeleton: blasse Achsen-Platzhalter, feine Gitterlinien, eine angedeutete Kurve mit leichtem Schimmer, mittig „Noch keine Daten“ */
  const SKEL_LINE = 'M0 78 C 30 74, 48 60, 80 62 S 130 40, 160 46 S 215 66, 245 50 S 300 22, 330 28 S 380 18, 400 12';
  const chartEmpty = el => { el.innerHTML = `<div class="chart-skel" role="img" aria-label="${NO_DATA}"><div class="cs-y">${'<i></i>'.repeat(5)}</div><div class="cs-plot"><div class="cs-grid">${'<i></i>'.repeat(5)}</div><svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><path class="cs-area" d="${SKEL_LINE} L400 100 L0 100 Z"/><path class="cs-line" d="${SKEL_LINE}" vector-effect="non-scaling-stroke"/></svg><span class="cs-note">${NO_DATA}</span></div><div class="cs-x">${'<i></i>'.repeat(5)}</div></div>`; };
  /* pick (optional): Anteil 0–1 über die Breite → Index; für Zeitachsen der nächste Punkt statt gleicher Abstände */
  function bindHover(el, svg, n, xf, yf, tipFn, pick) {
    const hover = svg.querySelector('.hover'), hit = svg.querySelector('.hit'); if (!hover || !hit) return;
    const show = e => { const r = hit.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const f = C.clamp((cx - r.left) / r.width, 0, 1); const i = pick ? pick(f) : C.clamp(Math.round(f * (n - 1)), 0, n - 1); hover.classList.add('on'); const x = xf(i); const ln = hover.querySelector('line'); ln.setAttribute('x1', x); ln.setAttribute('x2', x); const c = hover.querySelector('circle'); if (c) { const y = yf(i); if (y == null) c.style.display = 'none'; else { c.style.display = ''; c.setAttribute('cx', x); c.setAttribute('cy', y); } } U.tipAt(el, x, yf(i) == null ? 20 : yf(i), tipFn(i)); };
    hit.addEventListener('mousemove', show); hit.addEventListener('touchstart', show, { passive: true }); hit.addEventListener('touchmove', show, { passive: true });
    hit.addEventListener('mouseleave', () => { hover.classList.remove('on'); U.tipHide(); }); hit.addEventListener('touchend', () => { hover.classList.remove('on'); U.tipHide(); });
  }
  const unitFmt = (u, v, short) => v == null || isNaN(v) ? '—' : u === 'pct' ? fmt.pct(v, short ? 0 : 1) : u === 'cur' ? (short ? fmt.axisCur(v) : fmt.cur(v, { signed: true })) : u === 'int' ? fmt.int(v) : u === 'dur' ? fmt.dur(v) : fmt.num(v, 2);

  /* ---------- Diagramme (Achse links mit Beträgen, Aufbau nach TradeZella) ---------- */
  /* Mehrere Linien oder Balken mit bis zu zwei Achsen: erste Einheit links, zweite rechts */
  U.drawers.lines = function (el, d, W, H) {
    const pts = d && d.points || [], series = d && d.series || []; if (!pts.length || !series.length) { chartEmpty(el); return; }
    const units = [...new Set(series.map(s => s.unit))]; const u0 = units[0], u1 = units[1];
    const scale = {};
    units.forEach((u, ui) => { const vals = series.filter(s => s.unit === u).flatMap(s => pts.map(p => p.v[s.key]).concat(s.type === 'bar' ? [0] : [])).filter(v => v != null && isFinite(v)); if (!vals.length) vals.push(0); const lo = Math.min(...vals), hi = Math.max(...vals); const ticks = ui < 2 ? U.niceTicks(lo, hi === lo ? lo + 1 : hi, 6) : []; scale[u] = { ticks, y0: Math.min(ticks.length ? ticks[0] : lo, lo), y1: Math.max(ticks.length ? ticks[ticks.length - 1] : hi, hi) }; });
    const ml = U.axisWidth(scale[u0].ticks.map(t => unitFmt(u0, t, true))), mr = u1 ? U.axisWidth(scale[u1].ticks.map(t => unitFmt(u1, t, true))) : 12, mt = 12, mb = 30; const iw = W - ml - mr, ih = H - mt - mb;
    /* d.timeX: x nach echtem Datum statt gleicher Abstände; d.step: Treppe (Summen springen am Tag der Buchung), bewusst ohne Glättung */
    const n = pts.length; const tx = d.timeX && n > 1 ? pts.map(p => +new Date(p.date)) : null; const t0 = tx ? Math.min(...tx) : 0, t1 = tx ? Math.max(...tx) : 0;
    const x = i => n === 1 ? ml + iw / 2 : tx && t1 > t0 ? ml + (tx[i] - t0) / (t1 - t0) * iw : ml + i / (n - 1) * iw; const y = (u, v) => mt + (scale[u].y1 - v) / (scale[u].y1 - scale[u].y0 || 1) * ih;
    const stepPath = r => `M${r[0][0].toFixed(1)},${r[0][1].toFixed(1)}` + r.slice(1).map(([px, py]) => `H${px.toFixed(1)}V${py.toFixed(1)}`).join('');
    /* Lücken (fehlende Werte) trennen die Linie; jedes Stück mit leicht gerundeten Ecken wie die anderen Kurven */
    const path = s => { const runs = [[]]; pts.forEach((p, i) => { const v = p.v[s.key]; if (v == null || !isFinite(v)) { if (runs[runs.length - 1].length) runs.push([]); return; } runs[runs.length - 1].push([x(i), y(s.unit, v)]); }); return runs.filter(r => r.length).map(r => d.step ? stepPath(r) : U.smooth(r)).join(''); };
    const bars = series.filter(s => s.type === 'bar'); const bw = Math.max(2, Math.min(14, iw / n * 0.6 / Math.max(1, bars.length)));
    const xt = U.xTicks(n, iw); const dots = n <= 120;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${U.axisLeft(scale[u0].ticks, v => y(u0, v), ml, W, mr, v => unitFmt(u0, v, true))}
      ${u1 ? `<g class="grid">${scale[u1].ticks.map(t => `<text x="${W - mr + 8}" y="${y(u1, t) + 3.5}">${unitFmt(u1, t, true)}</text>`).join('')}</g>` : ''}
      ${bars.map((s, bi) => pts.map((p, i) => { const v = p.v[s.key]; if (v == null || !isFinite(v)) return ''; const zero = y(s.unit, Math.max(scale[s.unit].y0, Math.min(scale[s.unit].y1, 0))); const yy = y(s.unit, v); return `<rect x="${(x(i) - bw * bars.length / 2 + bi * bw).toFixed(1)}" y="${Math.min(yy, zero).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(yy - zero)).toFixed(1)}" rx="2" class="br${v >= 0 ? '' : ' dn'}" fill="${s.color}" fill-opacity=".8"/>`; }).join('')).join('')}
      ${series.filter(s => s.type !== 'bar').map(s => `<path d="${path(s)}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${dots ? pts.map((p, i) => { const v = p.v[s.key]; return v == null || !isFinite(v) ? '' : `<circle cx="${x(i).toFixed(1)}" cy="${y(s.unit, v).toFixed(1)}" r="1.8" fill="${s.color}"/>`; }).join('') : ''}`).join('')}
      ${U.dateAxis(n, x, i => pts[i].date, ml, W, mr, H)}
      <g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
    bindHover(el, el.firstElementChild, n, x, () => null, i => U.tipTable(d.periodLabel ? d.periodLabel(pts[i].date) : fmt.weekdayLong(pts[i].date), series.map(s => [`<i class="dot" style="background:${s.color}"></i>${esc(s.label)}`, unitFmt(s.unit, pts[i].v[s.key])])), tx ? f => { const sx = ml + f * iw; let best = 0; for (let i = 1; i < n; i++) if (Math.abs(x(i) - sx) < Math.abs(x(best) - sx)) best = i; return best; } : null);
  };
  /* Punktdiagramm (Uhrzeit, Haltedauer): Achse links, Beschriftungen unten schräg */
  U.drawers.scatter = function (el, d, W, H) {
    const pts = d && d.points || []; if (!pts.length) { chartEmpty(el); return; }
    const ys = pts.map(p => p.y); const ticks = U.niceTicks(Math.min(0, ...ys), Math.max(0, ...ys), 6); const y0 = Math.min(ticks[0], ...ys, 0), y1 = Math.max(ticks[ticks.length - 1], ...ys, 0);
    const ml = U.axisWidth(ticks.map(fmt.axisCur)), mr = 14, mt = 12, mb = 50; const iw = W - ml - mr, ih = H - mt - mb;
    const xs = pts.map(p => p.x); const x0 = d.x0 != null ? d.x0 : Math.min(...xs), x1 = d.x1 != null ? d.x1 : Math.max(...xs);
    const x = v => ml + (v - x0) / (x1 - x0 || 1) * iw, y = v => mt + (y1 - v) / (y1 - y0 || 1) * ih;
    const xt = (d.xTicks || []).filter(t => t.v >= x0 - 1e-9 && t.v <= x1 + 1e-9);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${U.axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>
      ${xt.map(t => `<text x="${x(t.v).toFixed(1)}" y="${H - mb + 18}" text-anchor="end" transform="rotate(-45 ${x(t.v).toFixed(1)} ${H - mb + 18})">${esc(t.label)}</text>`).join('')}
      ${pts.map(p => `<circle cx="${x(p.x).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="2.6" fill="var(--${p.y > C.EPS ? 'profit' : p.y < -C.EPS ? 'loss' : 'info'})" fill-opacity=".9" stroke="transparent" stroke-width="7" data-tip="${esc(p.tip)}"></circle>`).join('')}</svg>`;
  };
  /* Säulen je Handelstag */
  U.drawers.dbars = function (el, d, W, H) {
    const days = d && d.days || []; if (!days.length) { chartEmpty(el); return; }
    const vals = days.map(x => x.pnl); const ticks = U.niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 6); const y0 = Math.min(ticks[0], ...vals, 0), y1 = Math.max(ticks[ticks.length - 1], ...vals, 0);
    const ml = U.axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 30; const iw = W - ml - mr, ih = H - mt - mb;
    const n = days.length; const gap = iw / n; const bw = Math.max(2, Math.min(18, gap * 0.62)); const x = i => ml + i * gap + gap / 2, y = v => mt + (y1 - v) / (y1 - y0 || 1) * ih; const xt = U.xTicks(n, iw);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${U.axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>
      ${days.map((p, i) => `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${Math.min(y(p.pnl), y(0)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1.5, Math.abs(y(p.pnl) - y(0))).toFixed(1)}" rx="2" class="br${p.pnl >= 0 ? '' : ' dn'}" fill="var(--${p.pnl >= 0 ? 'profit' : 'loss'})" fill-opacity=".72" data-tip="<b>${fmt.weekdayLong(p.day)}</b><br>${fmt.cur(p.pnl, { signed: true })} · ${p.n} Trade${p.n === 1 ? '' : 's'}"></rect>`).join('')}
      ${U.dateAxis(n, x, i => days[i].day, ml, W, mr, H)}</svg>`;
  };
  /* Drawdown-Fläche */
  U.drawers.dd = function (el, d, W, H) {
    const pts = d && d.points || []; if (!pts.length) { chartEmpty(el); return; }
    const vals = pts.map(p => p.dd); const ticks = U.niceTicks(Math.min(...vals, -1), 0, 6); const y0 = Math.min(ticks[0], ...vals), y1 = 0; const n = pts.length;
    const ml = U.axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 30; const iw = W - ml - mr, ih = H - mt - mb;
    const x = i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw, y = v => mt + (y1 - v) / (y1 - y0 || 1) * ih; const g = gid();
    const line = n === 1 ? `M${x(0) - 1},${y(pts[0].dd)}L${x(0) + 1},${y(pts[0].dd)}` : 'M' + pts.map((p, i) => `${x(i).toFixed(1)},${y(p.dd).toFixed(1)}`).join('L'); const xt = U.xTicks(n, iw);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--loss)" stop-opacity=".02"/><stop offset="1" stop-color="var(--loss)" stop-opacity=".2"/></linearGradient></defs>${U.axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}
      <path d="${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z" fill="url(#${g})"/><path d="${line}" fill="none" stroke="var(--loss)" stroke-width="2" stroke-linejoin="round"/>
      ${U.dateAxis(n, x, i => pts[i].date, ml, W, mr, H)}
      <g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/><circle r="4.5" fill="var(--loss)" stroke="var(--surface)" stroke-width="2"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
    bindHover(el, el.firstElementChild, n, x, i => y(pts[i].dd), i => U.tipTable(fmt.weekdayLong(pts[i].date), [['Drawdown', U.pnl(pts[i].dd)], ['Kumuliert', fmt.cur(pts[i].cum, { signed: true })]]));
  };

  /* ---------- Widgets nach Vorlagen von 21st.dev (Mini Chart, Pie Chart, Radar Chart, Progress), im Stil der App nachgebaut:
     ohne React und ohne Zusatzbibliotheken, Farben über die Design-Tokens, Hover und Animation wie im Original ---------- */
  const LOCALE = () => (root.I18N ? root.I18N.locale() : 'de-DE');
  const calm = () => !(root.Motion && root.Motion.enabled); /* weniger Bewegung oder PC-Ansicht auf dem Handy: ohne Animation */
  const polar = (cx, cy, rr, a) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  const f2 = n => n.toFixed(2);
  /* Trefferquote je Wochentag; Samstag und Sonntag nur, wenn an dem Tag gehandelt wurde */
  function weekdayRates(list) {
    const by = new Map(C.timeAnalysis(list).weekdays.map(g => [g.key, g.s])); const short = fmt.weekdays();
    return C.WEEKDAYS.map((k, i) => ({ i, short: short[i], long: new Date(2024, 0, 1 + i).toLocaleDateString(LOCALE(), { weekday: 'long' }), s: by.get(k) || null })).filter(x => x.i < 5 || x.s);
  }
  /* Mini Chart: abgerundete Balken; Hover hebt den Balken hervor, die Nachbarn etwas, der Rest tritt zurück. Oben links Tag und Anzahl, rechts der Wert */
  U.drawers.wdbars = function (el, d) {
    const days = d && d.days || []; if (!days.some(x => x.s)) { chartEmpty(el); return; }
    const max = Math.max(...days.map(x => x.s ? x.s.winRate : 0)) || 1;
    const lbl = (p, name, n) => `<span class="mc-l${p === 'all' ? ' on' : ''}" data-p="${p}"><b>${esc(name)}</b> · <span>${n ? U.count(n, 'Trade', 'Trades') : 'Keine Trades'}</span></span>`;
    const val = (p, s) => `<span class="mc-v${p === 'all' ? ' on' : ''}" data-p="${p}">${s ? fmt.pct(s.winRate, 0) : '—'}</span>`;
    const cols = days.map((x, p) => { const h = x.s ? Math.max(4, x.s.winRate / max * 100) : 3;
      return `<div class="mc-col" data-p="${p}"${x.s ? '' : ' data-empty'} tabindex="0" role="img" aria-label="${esc(x.long)}: ${x.s ? fmt.pct(x.s.winRate, 0) : '—'}"><div class="mc-track"><i class="mc-bar" style="height:${h.toFixed(1)}%"></i><span class="mc-tip" style="bottom:calc(${h.toFixed(1)}% + 8px)">${x.s ? fmt.pct(x.s.winRate, 0) : '—'}</span></div><span class="mc-wd">${esc(x.short)}</span></div>`; }).join('');
    el.innerHTML = `<div class="mc"><div class="mc-head"><span class="mc-cap"><i class="mc-dot"></i><span class="mc-ls">${lbl('all', 'Alle Tage', d.all ? d.all.n : 0)}${days.map((x, p) => lbl(p, x.long, x.s ? x.s.n : 0)).join('')}</span></span><span class="mc-vs">${val('all', d.all)}${days.map((x, p) => val(p, x.s)).join('')}</span></div><div class="mc-bars">${cols}</div></div>`;
    const box = el.firstElementChild;
    const set = p => { box.classList.toggle('hov', p != null); box.querySelectorAll('.mc-col').forEach(c => { const k = +c.dataset.p; c.classList.toggle('on', k === p); c.classList.toggle('nb', p != null && Math.abs(k - p) === 1); }); box.querySelectorAll('.mc-l, .mc-v').forEach(s => s.classList.toggle('on', s.dataset.p === (p == null ? 'all' : String(p)))); };
    box.querySelectorAll('.mc-col').forEach(c => { const p = +c.dataset.p; c.addEventListener('pointerenter', () => set(p)); c.addEventListener('pointerdown', () => set(p)); c.addEventListener('focus', () => set(p)); c.addEventListener('blur', () => set(null)); });
    box.querySelector('.mc-bars').addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') set(null); });
  };
  /* Ringsegment mit überall gleich breiten Lücken: die Kanten laufen parallel zur Trennlinie (Abstand gap/2), statt als Winkel
     nach außen breiter zu werden; die Ecken sind rund (Eckkreise an Kante und Rand anliegend). Zu schmale Segmente werden zum Keil */
  function ringSegment(cx, cy, r0, r1, a0, a1, gap, cr) {
    const d = gap / 2, span = a1 - a0;
    const P = (a, s, t, h) => polar(cx, cy, Math.hypot(t, h), a + s * Math.atan2(h, t)).map(f2).join(' '); /* Punkt t entlang der Trennlinie bei a, h quer ins Segment */
    const R = (rr, a) => polar(cx, cy, rr, a).map(f2).join(' ');
    const lg = x => (x > Math.PI ? 1 : 0);
    let c = Math.min(cr, (r1 - r0) / 2 - 0.5), ok = false;
    for (let k = 0; k < 30 && c > 0.3; k++) { const ti = Math.sqrt(Math.max(0, (r0 + c) ** 2 - (d + c) ** 2)); if (r0 > d && span - 2 * Math.atan2(d + c, ti) > 0.02) { ok = true; break; } c *= 0.8; }
    if (ok) {
      const to = Math.sqrt((r1 - c) ** 2 - (d + c) ** 2), ti = Math.sqrt((r0 + c) ** 2 - (d + c) ** 2); const dO = Math.atan2(d + c, to), dI = Math.atan2(d + c, ti); const k = `${f2(c)} ${f2(c)} 0 0 1`;
      return `M${P(a0, 1, to, d)} A${k} ${R(r1, a0 + dO)} A${f2(r1)} ${f2(r1)} 0 ${lg(span - 2 * dO)} 1 ${R(r1, a1 - dO)} A${k} ${P(a1, -1, to, d)} L${P(a1, -1, ti, d)} A${k} ${R(r0, a1 - dI)} A${f2(r0)} ${f2(r0)} 0 ${lg(span - 2 * dI)} 0 ${R(r0, a0 + dI)} A${k} ${P(a0, 1, ti, d)} Z`;
    }
    /* sehr schmales Segment: ohne Rundung; reicht es nicht bis innen, endet es als Spitze, wo sich die beiden Kanten treffen */
    const to = Math.sqrt(Math.max(0, r1 * r1 - d * d)); const dO = Math.atan2(d, to);
    if (span - 2 * dO <= 0.002) return '';
    const ti = Math.sqrt(Math.max(0, r0 * r0 - d * d));
    if (r0 > d && span - 2 * Math.atan2(d, ti) > 0.002) return `M${P(a0, 1, to, d)} A${f2(r1)} ${f2(r1)} 0 ${lg(span - 2 * dO)} 1 ${P(a1, -1, to, d)} L${P(a1, -1, ti, d)} A${f2(r0)} ${f2(r0)} 0 ${lg(span)} 0 ${P(a0, 1, ti, d)} Z`;
    const tip = d / Math.sin(span / 2); return tip >= r1 ? '' : `M${P(a0, 1, to, d)} A${f2(r1)} ${f2(r1)} 0 ${lg(span - 2 * dO)} 1 ${P(a1, -1, to, d)} L${R(tip, (a0 + a1) / 2)} Z`;
  }
  /* Pie Chart: Ring mit kleinen Lücken und runden Ecken, Anzahl im Segment, Tooltip beim Drüberfahren; die anderen Segmente treten zurück */
  U.drawers.pie = function (el, d, W, H) {
    const sl = d && d.slices || []; const total = C.sum(sl.map(x => x.n)); if (!total) { chartEmpty(el); return; }
    const cx = W / 2, cy = H / 2, r1 = Math.min(W, H) / 2 - 4, r0 = r1 * 0.3, cr = Math.max(3, r1 * 0.07), gap = sl.length > 1 ? Math.round(Math.max(4, r1 * 0.045)) : 0;
    let a = -Math.PI / 2;
    const parts = sl.map(x => {
      const span = x.n / total * 2 * Math.PI; const a0 = a, a1 = a + span; a += span; const [lx, ly] = polar(cx, cy, (r0 + r1) / 2, (a0 + a1) / 2);
      const tip = `<b>${esc(x.label)}</b><br><span>${U.count(x.n, 'Trade', 'Trades')}</span> · ${fmt.pct(x.n / total, 0)}<br><span>Trefferquote</span> ${fmt.pct(x.s.winRate, 0)} · ${fmt.cur(x.s.total, { signed: true })}`;
      const shape = sl.length === 1 ? `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2((r0 + r1) / 2)}" fill="none" stroke="var(--pie-${x.c})" stroke-width="${f2(r1 - r0)}" class="pie-seg" data-tip="${esc(tip)}"/>` : `<path d="${ringSegment(cx, cy, r0, r1, a0, a1, gap, cr)}" fill="var(--pie-${x.c})" class="pie-seg" data-tip="${esc(tip)}"/>`;
      return shape + ((a1 - a0) * (r0 + r1) / 2 - gap >= 30 ? `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" style="fill:var(--pie-${x.c}-ink)">${fmt.int(x.n)}</text>` : '');
    });
    el.innerHTML = `<svg class="pie-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Trades nach Setup">${parts.join('')}</svg>`;
  };
  /* Breite eines Textes in der Schrift des Elements (Canvas), sonst geschätzt */
  function textWidth(el, font) { let ctx = null; try { ctx = document.createElement('canvas').getContext('2d'); ctx.font = `${font} ${getComputedStyle(el).fontFamily}`; } catch (e) { ctx = null; } return s => (ctx ? ctx.measureText(s).width : s.length * 6.6); }
  /* Gesamt-Score als Netz (Vorlage: 21st.dev heygaia/radar-chart, im Stil der App): Gitter als Vielecke, gewählter Zeitraum als Fläche in der
     Akzentfarbe mit 2-px-Rand, der Zeitraum davor gestrichelt; an jedem Punkt oben „jetzt / vorher“, darunter der Name. Jede Achse hat eine
     Trefferfläche mit Tooltip; der Punkt und die Beschriftung leuchten beim Darüberfahren auf */
  U.drawers.radar2 = function (el, d, W, H) {
    const ax = d && d.axes || []; if (ax.length < 3) { chartEmpty(el); return; }
    const T = s => tr(s); const two = !!d.prev; const n = ax.length; const rot = n % 4 === 0 ? Math.PI / n : 0; const ang = i => -Math.PI / 2 + rot + i * 2 * Math.PI / n;
    /* Schrift in der echten Größe messen (auch bei 200 % Schrift); schmale Karten bekommen kleinere Beschriftungen */
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16; const small = W < 15 * rem; const fv = (small ? 0.6875 : 0.75) * rem, fn = (small ? 0.625 : 0.6875) * rem;
    const twV = textWidth(el, `500 ${fv}px`), twN = textWidth(el, `400 ${fn}px`); const LH = Math.round(fv * 1.1);
    const pct = v => String(Math.round(v * 100)); const val = x => two ? `${pct(x.v)} / ${pct(x.p)}` : pct(x.v);
    const names = ax.map((x, i) => { const s = T(x.label); const side = Math.abs(Math.cos(ang(i))) > 0.3; if (twN(s) <= (side ? (small ? 52 : 66) : 104) || !/[ /-]/.test(s)) return [s]; let cut = -1; for (let k = 1; k < s.length - 1; k++) if (/[ /-]/.test(s[k]) && (cut < 0 || Math.abs(k - s.length / 2) < Math.abs(cut - s.length / 2))) cut = k; return s[cut] === ' ' ? [s.slice(0, cut), s.slice(cut + 1)] : [s.slice(0, cut + 1), s.slice(cut + 1)]; });
    const lines = ax.map((x, i) => [val(x), ...names[i]]); const wid = ax.map((x, i) => Math.max(twV(lines[i][0]), ...names[i].map(twN)));
    const R = Math.max(small ? 26 : 36, Math.min(...ax.map((x, i) => { const c = Math.abs(Math.cos(ang(i))), sn = Math.abs(Math.sin(ang(i))); const hx = c < 0.1 ? Infinity : (W / 2 - 4 - 10 * c - wid[i]) / c; const hy = sn < 0.1 ? Infinity : (H / 2 - 4 - 8 * sn - lines[i].length * LH) / sn; return Math.min(hx, hy); })));
    const cx = W / 2, cy = H / 2; const pt = (i, f) => polar(cx, cy, R * f, ang(i));
    const poly = f => ax.map((x, i) => pt(i, typeof f === 'number' ? f : f(x)).map(v => v.toFixed(1)).join(',')).join(' ');
    const grid = [0.25, 0.5, 0.75, 1].map(f => `<polygon points="${poly(f)}" class="r2-grid${f === 1 ? ' r2-outer' : ''}"/>`).join('') + ax.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${f2(cx)}" y1="${f2(cy)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="r2-grid"/>`; }).join('');
    const vv = x => Math.max(x.v, 0.02), pv = x => Math.max(x.p || 0, 0.02);
    const labels = ax.map((x, i) => { const [px, py] = pt(i, 1); const [ox, oy] = polar(0, 0, 10, ang(i)); const anchor = Math.abs(px - cx) < 6 ? 'middle' : px < cx ? 'end' : 'start'; const L = lines[i]; const tx = (px + ox).toFixed(1); const sn = Math.sin(ang(i));
      const y0 = sn < -0.3 ? py + oy - (L.length - 1) * LH - 2 : sn > 0.3 ? py + oy + 10 : py + 4 - (L.length - 1) * LH / 2;
      return `<text x="${tx}" y="${y0.toFixed(1)}" text-anchor="${anchor}" class="r2-lbl no-i18n" data-i="${i}">${L.map((l, k) => `<tspan x="${tx}" dy="${k ? LH : 0}" class="${k ? 'r2-n' : 'r2-v'}">${esc(l)}</tspan>`).join('')}</text>`; }).join('');
    const dots = ax.map((x, i) => { const [px, py] = pt(i, vv(x)); return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.5" class="r2-dot" data-i="${i}"/>`; }).join('');
    const hits = ax.map((x, i) => { const rr = R + 18; const [x0, y0] = polar(cx, cy, rr, ang(i) - Math.PI / n), [x1, y1] = polar(cx, cy, rr, ang(i) + Math.PI / n); const tip = `<b>${esc(T(x.label))}</b><br>${esc(d.curLabel)}: ${esc(x.text)} · ${esc(tr('Teilscore {0}', [pct(x.v)]))}${two ? `<br><span class="muted">${esc(d.prevLabel)}: ${esc(x.ptext)} · ${esc(tr('Teilscore {0}', [pct(x.p)]))}</span>` : ''}`; return `<path d="M${f2(cx)} ${f2(cy)} L${f2(x0)} ${f2(y0)} A${f2(rr)} ${f2(rr)} 0 0 1 ${f2(x1)} ${f2(y1)} Z" class="r2-hit" data-i="${i}" data-tip="${esc(tip)}"/>`; }).join('');
    el.innerHTML = `<svg class="r2-svg radar-svg${small ? ' r2-sm' : ''}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(d.aria || '')}">${grid}${two ? `<polygon points="${poly(pv)}" class="r2-prev"/>` : ''}<polygon points="${poly(vv)}" class="r2-cur"/>${dots}${labels}${hits}</svg>`;
    const svg = el.firstElementChild; const on = i => svg.querySelectorAll('.r2-dot, .r2-lbl').forEach(x => x.classList.toggle('on', x.dataset.i === i));
    svg.querySelectorAll('.r2-hit').forEach(h => h.addEventListener('pointerenter', () => on(h.dataset.i))); svg.addEventListener('pointerleave', () => on(null));
  };
  /* Zeitraum davor zum Vergleich: Monat, Quartal, Jahr als ganzer Vorgänger, Woche als Vorwoche, sonst gleich lang direkt davor; „Gesamt“ hat keinen */
  function prevRange(r) {
    if (!r || !r.from || !r.to) return null; const f = r.from, t = r.to; let pf, pt;
    if (r.preset === 'month') { pf = new Date(f.getFullYear(), f.getMonth() - 1, 1); pt = new Date(f.getFullYear(), f.getMonth(), 0, 23, 59, 59, 999); }
    else if (r.preset === 'quarter') { pf = new Date(f.getFullYear(), f.getMonth() - 3, 1); pt = new Date(f.getTime() - 1); }
    else if (r.preset === 'year') { pf = new Date(f.getFullYear() - 1, 0, 1); pt = new Date(f.getFullYear() - 1, 11, 31, 23, 59, 59, 999); }
    else if (r.preset === 'week') { pf = new Date(f); pf.setDate(pf.getDate() - 7); pt = new Date(f.getTime() - 1); }
    else { pt = new Date(f.getTime() - 1); pf = new Date(pt.getTime() - (t - f)); }
    const label = r.preset === 'month' ? fmt.monthYear(pf) : r.preset === 'year' ? String(pf.getFullYear()) : r.preset === 'today' ? fmt.date(pf) : `${fmt.date(pf)} – ${fmt.date(pt)}`;
    return { from: pf, to: pt, label };
  }
  /* Kumulierter P&L je Kalendertag ab „from“ (Handelstage tragen Punkte, Tage ohne Trades halten den Stand); bis „to“, höchstens bis heute */
  function cumDays(list, from, to) {
    const by = new Map(C.dailyAggregation(list).map(x => [x.key, x])); const out = []; const end = Math.min(to.getTime(), Date.now()); let cum = 0;
    for (const dt = new Date(from.getFullYear(), from.getMonth(), from.getDate()); dt.getTime() <= end; dt.setDate(dt.getDate() + 1)) { const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`; const x = by.get(k); if (x) cum += x.pnl; out.push({ date: new Date(dt), v: cum, trade: !!x }); }
    return out;
  }
  /* Vergleich für Score und „P&L im Vergleich“: immer ein zweiter Zeitraum. Normal der Zeitraum davor; bei „Gesamt“ die letzten 30 Tage;
     hat der Zeitraum davor keine Trades, Gesamt */
  const last30 = () => { const to = new Date(); to.setHours(23, 59, 59, 999); const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - 29); return { from, to }; };
  const closedIn = (all, r) => all.filter(t => t.closed && t.close >= r.from && t.close <= r.to);
  function compareRange(d) {
    if (!d.range.from) { const r = last30(); return { from: r.from, to: r.to, label: tr('Letzte 30 Tage'), list: closedIn(d.all, r), kind: 'recent' }; }
    const pr = prevRange(d.range); const list = pr ? closedIn(d.all, pr) : [];
    if (pr && list.length) return Object.assign(pr, { list, kind: 'prev' });
    return { from: null, to: null, label: tr('Gesamt'), list: C.closedOnly(d.all), kind: 'all' };
  }
  /* Progress: Ring mit gestrichelter Spur und durchgehendem Fortschritt; Zahl und Ring laufen vom zuletzt gezeigten Wert zum neuen (beim ersten Mal von 0) */
  const ringShown = {};
  /* Kreis als Pfad, der oben (12 Uhr) beginnt und im Uhrzeigersinn läuft: ohne Drehung per transform, die nicht jeder Browser gleich umsetzt */
  const RING_PATH = 'M100 20 A80 80 0 1 1 100 180 A80 80 0 1 1 100 20';
  const easeRing = t => { const x1 = 0.43, y1 = 0.13, x2 = 0.23, y2 = 0.96; let u = t; for (let k = 0; k < 8; k++) { const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3 - t; const dx = 3 * (1 - u) ** 2 * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2); if (Math.abs(dx) < 1e-6) break; u = C.clamp(u - x / dx, 0, 1); } return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3; };
  U.drawers.wring = function (el, d, W, H) {
    if (!d) { chartEmpty(el); return; }
    const size = Math.max(120, Math.min(184, W, H)), circ = 2 * Math.PI * 80;
    el.innerHTML = `<div class="wr"><svg class="wr-svg" viewBox="0 0 200 200" width="${size}" height="${size}" style="width:${size}px;height:${size}px" role="progressbar" aria-label="Trefferquote" aria-valuenow="${Math.round(d.rate * 100)}" aria-valuemin="0" aria-valuemax="100"><path d="${RING_PATH}" class="wr-track" stroke-dasharray="${f2(circ / 25 * 0.4)} ${f2(circ / 25 * 0.6)}"/><path d="${RING_PATH}" class="wr-bar" stroke-dasharray="${f2(circ)} ${f2(circ)}"/></svg><div class="wr-mid"><span class="wr-n"><span class="wr-v">0</span><small>%</small></span><span class="wr-s">${d.sub}</span></div></div>`;
    const bar = el.querySelector('.wr-bar'), num = el.querySelector('.wr-v'); const key = el.dataset.id;
    const paint = x => { bar.setAttribute('stroke-dashoffset', f2(circ * (1 - x))); bar.style.opacity = x > 0.001 ? '' : '0'; num.textContent = String(Math.round(x * 100)); };
    const from = ringShown[key] != null ? ringShown[key] : 0, to = d.rate; ringShown[key] = to;
    if (calm() || Math.abs(to - from) < 0.0005 || typeof requestAnimationFrame === 'undefined') { paint(to); return; }
    paint(from); const t0 = performance.now();
    const step = now => { if (!num.isConnected) return; const t = Math.min(1, (now - t0) / 1500); paint(from + (to - from) * easeRing(t)); if (t < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  /* Setups in fester Reihenfolge über alle Trades (häufigste zuerst): so behält jedes Setup seine Farbe, auch wenn sich der Zeitraum ändert */
  const PIE_SLOTS = 5;
  function setupOrder(all) { const m = new Map(); for (const t of C.closedOnly(all)) if (t.setup) m.set(t.setup, (m.get(t.setup) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).map(x => x[0]); }
  function setupSlices(closed, all) {
    const order = setupOrder(all).slice(0, PIE_SLOTS); const slot = new Map(order.map((k, i) => [k, i + 1])); const by = new Map();
    for (const t of closed) { const k = !t.setup ? '_ohne' : slot.has(t.setup) ? t.setup : '_andere'; (by.get(k) || by.set(k, []).get(k)).push(t); }
    const out = order.filter(k => by.has(k)).map(k => ({ label: k, c: slot.get(k), trades: by.get(k) }));
    if (by.has('_andere')) out.push({ label: 'Andere', c: 'o', trades: by.get('_andere') });
    if (by.has('_ohne')) out.push({ label: 'Ohne Setup', c: 'n', trades: by.get('_ohne') });
    return out.map(x => Object.assign(x, { n: x.trades.length, s: C.summary(x.trades) }));
  }
  /* Disziplin-Trichter (Vorlage: 21st.dev bklitai/funnel-chart, im Stil der App): jede Stufe zählt die Trades, die sie UND alle
     Stufen davor schaffen. Stufen, deren Angabe nie benutzt wird (kein Trade mit Setup, Stop oder Fehler-Tag, keine Regeln), fallen
     weg, damit der Trichter nicht grundlos auf null fällt. Höhe = Anzahl (äußere Schicht), Prozent immer bezogen auf alle Trades */
  const tr = (s, v) => (root.I18N && root.I18N.t ? root.I18N.t(s, v) : (v ? s.replace(/\{(\d+)\}/g, (_, i) => v[i]) : s));
  const hasStop = t => t.plannedStop != null && t.plannedStop !== '';
  const FUNNEL = [
    { key: 'all', label: 'Alle Trades' },
    { key: 'setup', label: 'Mit Setup', drop: 'Ohne Setup', ok: t => !!t.setup, used: h => h.some(t => t.setup) },
    { key: 'stop', label: 'Stop gehalten', drop: 'Stop nicht gehalten', ok: t => hasStop(t) && !(t.status === 'loss' && t.r != null && t.r < -1.15), used: h => h.some(hasStop) }, /* wie der Trade-Score: mehr als 1,15 R Verlust = Stop nicht gehalten */
    { key: 'rules', label: 'Regeln gehalten', drop: 'Regel gebrochen', ok: t => !t.rulesBroken.length, used: h => S.data.rules.some(r => r.active !== false) || h.some(t => t.rulesBroken.length) },
    { key: 'clean', label: 'Ohne Fehler', drop: 'Mit Fehler-Tag', ok: t => !t.mistakes.length, used: h => h.some(t => t.mistakes.length) },
  ];
  function funnelStages(closed, all) {
    const hist = C.closedOnly(all); const steps = FUNNEL.filter(s => !s.used || s.used(hist)); let cur = closed;
    const stages = steps.map((s, i) => { const pass = i ? cur.filter(s.ok) : cur; const drop = i ? cur.filter(t => !s.ok(t)) : []; cur = pass; return { key: s.key, label: s.label, drop: s.drop, n: pass.length, dropIds: drop.map(t => t.id) }; });
    return { stages, clean: cur, missing: steps.length < FUNNEL.length };
  }
  /* Farben: eine Farbe in Stufen (Akzent zur Kartenfarbe hin gemischt), folgt hell/dunkel und eigenen Farben; Verlauf je Abschnitt zur nächsten Stufe */
  const FN_MIX = [100, 86, 73, 61, 50];
  U.drawers.funnel = function (el, d, W, H) {
    const st = d && d.stages || []; const max = st.length ? st[0].n : 0; if (st.length < 2 || !max) { chartEmpty(el); return; }
    const n = st.length, gap = 4, segW = (W - gap * (n - 1)) / n, top = 28, bot = 38, half = (H - top - bot) / 2, mid = top + half;
    const step = i => FN_MIX[Math.round(i * (FN_MIX.length - 1) / (n - 1))]; const col = i => `color-mix(in oklab, var(--accent) ${step(i)}%, var(--surface))`;
    const path = (a, b, sc) => { const h0 = Math.max(a * half * sc, 1), h1 = Math.max(b * half * sc, 1), cx = segW * 0.55; return `M0 ${f2(mid - h0)} C${f2(cx)} ${f2(mid - h0)} ${f2(segW - cx)} ${f2(mid - h1)} ${f2(segW)} ${f2(mid - h1)} L${f2(segW)} ${f2(mid + h1)} C${f2(segW - cx)} ${f2(mid + h1)} ${f2(cx)} ${f2(mid + h0)} 0 ${f2(mid + h0)} Z`; };
    const uid = 'fn' + Math.random().toString(36).slice(2, 7);
    const segs = st.map((s, i) => { const a = s.n / max, b = (st[Math.min(i + 1, n - 1)].n) / max, x = i * (segW + gap);
      return `<linearGradient id="${uid}-${i}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" style="stop-color:${col(i)}"/><stop offset="1" style="stop-color:${col(Math.min(i + 1, n - 1))}"/></linearGradient>`
        + `<g class="fn-seg" data-i="${i}" transform="translate(${f2(x)} 0)"><path class="fn-l0" d="${path(a, b, 1)}" style="fill:${col(i)}" fill-opacity=".18"/><path class="fn-l1" d="${path(a, b, 0.883)}" style="fill:${col(i)}" fill-opacity=".5"/><path class="fn-l2" d="${path(a, b, 0.767)}" fill="url(#${uid}-${i})" fill-opacity=".9"/></g>`; });
    const cols = st.map((s, i) => { const pct = fmt.pct(s.n / max, 0), lost = s.dropIds.length;
      const tip = i ? `<b>${esc(tr(s.label))}</b><br>${tr('{0} Trades · {1} von allen', [fmt.int(s.n), pct])}<br>${lost === 1 ? tr('1 Trade fällt hier raus') : tr('{0} Trades fallen hier raus', [fmt.int(lost)])}${lost ? `<br><span class="muted">${tr('Klick zeigt sie im TradeLog')}</span>` : ''}` : `<b>${esc(tr(s.label))}</b><br>${tr('{0} Trades im Zeitraum', [fmt.int(s.n)])}`;
      return `<button type="button" class="fn-col" data-i="${i}" data-action="funnel-open" data-tip="${esc(tip)}" aria-label="${esc(tr('{0}: {1} von {2} Trades', [tr(s.label), fmt.int(s.n), fmt.int(max)]))}"><span class="fn-v">${fmt.int(s.n)}</span><span class="fn-p">${pct}</span><span class="fn-lb">${esc(tr(s.label))}</span></button>`; });
    el.innerHTML = `<div class="fn" style="--fn-n:${n}"><svg class="fn-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><defs>${segs.map(x => x.slice(0, x.indexOf('<g '))).join('')}</defs>${segs.map(x => x.slice(x.indexOf('<g '))).join('')}</svg><div class="fn-cols" role="group" aria-label="${esc(tr('Disziplin-Trichter'))}">${cols.join('')}</div></div>`;
    const box = el.firstElementChild;
    const set = i => { box.classList.toggle('hov', i != null); box.querySelectorAll('.fn-seg, .fn-col').forEach(x => x.classList.toggle('on', i != null && x.dataset.i === String(i))); };
    box.querySelectorAll('.fn-col').forEach(c => { const i = +c.dataset.i; c.addEventListener('pointerenter', () => set(i)); c.addEventListener('focus', () => set(i)); c.addEventListener('blur', () => set(null)); });
    box.querySelector('.fn-cols').addEventListener('pointerleave', () => set(null));
  };
  const SETUP_HINT = '<div class="fw-empty"><b>Noch keine Setups</b><span>Trage beim Loggen eines Trades ein Setup ein. Dann siehst du hier, wie sich deine Trades verteilen.</span></div>';
  /* ---------- Kalender-Bausteine ---------- */
  function calendarHTML(days, year, month, o = {}) {
    const weeks = C.calendarMonth(days, year, month); const today = C.dayKey(new Date()); const ext = !!o.weeks, mini = !!o.mini;
    let html = fmt.weekdays().map(w => `<div class="wd">${w}</div>`).join('') + (ext ? '<div class="wd wk">Woche</div>' : '');
    for (const wk of weeks) {
      html += wk.cells.map(c => { if (!c) return '<div class="d pad"></div>'; const e = c.entry; const k = e ? (e.pnl > C.EPS ? 'win' : e.pnl < -C.EPS ? 'loss' : 'be') : ''; return `<div class="d ${k} ${c.key === today ? 'today' : ''}" data-action="day" data-day="${c.key}" role="button" tabindex="0" ${mini && e ? `data-tip="<b>${fmt.dateFull(c.date)}</b><br>${fmt.cur(e.pnl, { signed: true })} · ${e.n} Trade${e.n === 1 ? '' : 's'} · ${fmt.pct(e.n ? e.wins / e.n : 0)}"` : ''}><span class="n">${c.date.getDate()}</span>${e && !mini ? `<span class="p ${U.cls(e.pnl)}">${fmt.cur(e.pnl, { signed: true, compact: Math.abs(e.pnl) >= 1000 })}</span><span class="pm ${U.cls(e.pnl)}">${curCompact(e.pnl).replace(/\u00a0/g, '')}</span><span class="c"><span>${e.n} Trade${e.n === 1 ? '' : 's'}</span><span class="wr" title="Trefferquote">${fmt.pct(e.n ? e.wins / e.n : 0)}</span></span>` : ''}</div>`; }).join('');
      if (ext) html += `<div class="w"><span class="t">Woche ${wk.index}</span>${wk.days ? `<span class="p ${U.cls(wk.pnl)}">${fmt.cur(wk.pnl, { signed: true, compact: Math.abs(wk.pnl) >= 1000 })}</span><span class="pm ${U.cls(wk.pnl)}">${curCompact(wk.pnl)}</span><span class="days">${wk.days} Tag${wk.days === 1 ? '' : 'e'}</span>` : '<span class="p muted">—</span>'}</div>`;
    }
    return `<div class="cal ${ext ? 'ext' : ''} ${mini ? 'mini' : ''}">${html}</div>`;
  }
  /* Monatssumme und Handelstage als ruhige Paare: Bezeichnung grau, Wert fett */
  const monthSub = (days, m) => { const inM = days.filter(d => d.day.getFullYear() === m.getFullYear() && d.day.getMonth() === m.getMonth()); const total = C.sum(inM.map(d => d.pnl)); return inM.length ? `<div class="cal-stats"><span class="cal-stat"><i>Im Monat</i><b class="${U.cls(total)}">${fmt.cur(total)}</b></span><span class="cal-sep" aria-hidden="true"></span><span class="cal-stat"><i>Handelstage</i><b>${fmt.int(inM.length)}</b></span></div>` : '<div class="cal-stats"><span class="cal-stat"><i>Keine Trades</i></span></div>'; };
  const calNav = (m, prevA, nextA, todayA, extra = '') => `<div class="cal-nav"><button type="button" class="cal-arr" data-action="${prevA}" aria-label="Voriger Monat">${I.chevL}</button><h3>${fmt.monthYear(m)}</h3><button type="button" class="cal-arr" data-action="${nextA}" aria-label="Nächster Monat">${I.chevR}</button>${todayA && C.dayKey(m).slice(0, 7) !== C.dayKey(new Date()).slice(0, 7) ? `<button type="button" class="btn sm ghost hide-m" data-action="${todayA}">Heute</button>` : ''}${extra}</div>`; /* „Heute“ nur, wenn ein anderer Monat gezeigt wird */
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  function yearRows(daysAll, ansicht) {
    const years = [...new Set(daysAll.map(d => d.day.getFullYear()))].sort((a, b) => b - a); if (!years.length) years.push(new Date().getFullYear());
    const agg = list => { const n = C.sum(list.map(d => d.n)), pnl = C.sum(list.map(d => d.pnl)), wins = C.sum(list.map(d => d.wins)); return { n, pnl, wr: n ? wins / n : 0 }; };
    const cell = (a, max, cls = '') => {
      if (!a.n) return `<div class="yc ${cls}"><b class="muted">--</b></div>`;
      let style = '', val = '';
      if (ansicht === 'pnl') { cls += a.pnl > C.EPS ? ' win' : a.pnl < -C.EPS ? ' loss' : ' be'; val = curCompact(a.pnl); }
      else if (ansicht === 'trefferquote') { style = `background: color-mix(in srgb, var(--info) ${Math.round(18 + 72 * a.wr)}%, var(--surface-2))`; val = fmt.pct(a.wr, 1); }
      else { style = `background: color-mix(in srgb, var(--info) ${Math.round(18 + 72 * (max ? a.n / max : 0))}%, var(--surface-2))`; val = fmt.int(a.n); }
      return `<div class="yc ${cls}" style="${style}"><b>${val}</b><small>${a.n} Trade${a.n === 1 ? '' : 's'}</small></div>`;
    };
    const head = `<div class="ycal-head"><span>Jahr</span>${MONTHS_SHORT.map(m => `<span>${m}</span>`).join('')}<span>Gesamt</span></div>`;
    const rows = years.map(y => { const inYear = daysAll.filter(d => d.day.getFullYear() === y); const months = Array.from({ length: 12 }, (_, m) => agg(inYear.filter(d => d.day.getMonth() === m))); const max = Math.max(1, ...months.map(a => a.n)); const tot = agg(inYear); return `<div class="ycal-row"><div class="yc year"><b>${y}</b></div>${months.map(a => cell(a, max)).join('')}${cell(tot, tot.n, 'total')}</div>`; }).join('');
    return `<div class="ycal">${head}${rows}</div>`;
  }

  /* ---------- Vorschaubilder für die Widget-Bibliothek ---------- */
  const PV = {
    num: '<rect x="8" y="10" width="30" height="6" rx="3" fill="var(--faint)"/><rect x="8" y="24" width="52" height="14" rx="4" fill="var(--text-2)"/><rect x="8" y="46" width="22" height="5" rx="2.5" fill="var(--faint)"/>',
    gauge: '<rect x="8" y="10" width="30" height="6" rx="3" fill="var(--faint)"/><rect x="8" y="24" width="30" height="12" rx="4" fill="var(--text-2)"/><path d="M56 48a18 18 0 0 1 36 0" fill="none" stroke="var(--surface-3)" stroke-width="7"/><path d="M56 48a18 18 0 0 1 22-17.5" fill="none" stroke="var(--profit)" stroke-width="7"/>',
    donut: '<rect x="8" y="10" width="30" height="6" rx="3" fill="var(--faint)"/><rect x="8" y="24" width="30" height="12" rx="4" fill="var(--text-2)"/><circle cx="74" cy="34" r="16" fill="none" stroke="var(--loss)" stroke-width="7"/><path d="M74 18a16 16 0 0 1 14 24" fill="none" stroke="var(--profit)" stroke-width="7"/>',
    wl: '<rect x="8" y="10" width="30" height="6" rx="3" fill="var(--faint)"/><rect x="8" y="24" width="24" height="12" rx="4" fill="var(--text-2)"/><rect x="48" y="26" width="44" height="7" rx="3.5" fill="var(--loss)"/><rect x="48" y="26" width="28" height="7" rx="3.5" fill="var(--profit)"/>',
    streak: '<rect x="8" y="10" width="30" height="6" rx="3" fill="var(--faint)"/><circle cx="26" cy="38" r="13" fill="none" stroke="var(--profit)" stroke-width="4"/><rect x="48" y="28" width="30" height="7" rx="3.5" fill="var(--loss-soft)"/><rect x="48" y="40" width="30" height="7" rx="3.5" fill="var(--accent-soft)"/>',
    radar: '<polygon points="50,8 86,30 76,58 24,58 14,30" fill="none" stroke="var(--border-2)"/><polygon points="50,20 74,32 68,52 32,52 26,32" fill="none" stroke="var(--border-2)"/><polygon points="50,14 70,34 62,52 38,48 30,34" fill="var(--accent)" fill-opacity=".3" stroke="var(--accent)" stroke-width="1.5"/>',
    area: '<path d="M8 50 L24 38 L38 44 L52 26 L66 30 L80 14 L92 20 L92 56 L8 56 Z" fill="var(--profit)" fill-opacity=".25"/><path d="M8 50 L24 38 L38 44 L52 26 L66 30 L80 14 L92 20" fill="none" stroke="var(--profit)" stroke-width="2"/>',
    line: '<path d="M8 44 L24 30 L38 36 L52 20 L66 26 L80 14 L92 18" fill="none" stroke="var(--accent)" stroke-width="2"/><path d="M8 30 L24 34 L38 28 L52 36 L66 30 L80 34 L92 28" fill="none" stroke="var(--loss)" stroke-width="2"/><path d="M8 20 L24 22 L38 18 L52 24 L66 18 L80 22 L92 24" fill="none" stroke="var(--be)" stroke-width="2"/>',
    scatter: '<line x1="8" x2="92" y1="34" y2="34" stroke="var(--border-2)" stroke-dasharray="3 3"/>' + [[16, 22, 'profit'], [24, 40, 'loss'], [32, 18, 'profit'], [40, 30, 'profit'], [48, 46, 'loss'], [56, 26, 'profit'], [64, 38, 'loss'], [72, 14, 'profit'], [80, 30, 'profit'], [88, 44, 'loss']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3" fill="var(--${c})"/>`).join(''),
    bars: [[10, 20, 'profit'], [20, 12, 'profit'], [30, -10, 'loss'], [40, 26, 'profit'], [50, -18, 'loss'], [60, 8, 'profit'], [70, -6, 'loss'], [80, 22, 'profit'], [90, 14, 'profit']].map(([x, h, c]) => `<rect x="${x - 3}" y="${h > 0 ? 34 - h : 34}" width="6" height="${Math.abs(h)}" rx="1.5" fill="var(--${c})"/>`).join('') + '<line x1="6" x2="94" y1="34" y2="34" stroke="var(--border-2)"/>',
    combo: '<path d="M8 46 L26 40 L44 44 L62 22 L80 26 L92 12 L92 56 L8 56 Z" fill="var(--profit)" fill-opacity=".2"/><path d="M8 46 L26 40 L44 44 L62 22 L80 26 L92 12" fill="none" stroke="var(--profit)" stroke-width="2"/>' + [[14, 8, 'profit'], [26, -6, 'loss'], [38, 10, 'profit'], [50, -12, 'loss'], [62, 14, 'profit'], [74, 6, 'profit'], [86, -8, 'loss']].map(([x, h, c]) => `<rect x="${x - 2.5}" y="${h > 0 ? 44 - h : 44}" width="5" height="${Math.abs(h)}" fill="var(--${c})" fill-opacity=".8"/>`).join(''),
    table: [12, 24, 36, 48].map(y => `<rect x="8" y="${y}" width="36" height="5" rx="2.5" fill="var(--faint)"/><rect x="52" y="${y}" width="18" height="5" rx="2.5" fill="var(--text-2)"/><rect x="76" y="${y}" width="16" height="5" rx="2.5" fill="var(--${y % 24 ? 'loss' : 'profit'})"/>`).join(''),
    calendar: Array.from({ length: 21 }, (_, i) => { const x = 10 + (i % 7) * 12, y = 12 + Math.floor(i / 7) * 14; const c = [1, 3, 8, 9, 11, 15, 17, 19].includes(i) ? 'profit' : [2, 6, 12, 16].includes(i) ? 'loss' : 'surface-3'; return `<rect x="${x}" y="${y}" width="10" height="11" rx="2" fill="var(--${c})" fill-opacity="${c === 'surface-3' ? 1 : .8}"/>`; }).join(''),
    calext: Array.from({ length: 21 }, (_, i) => { const x = 8 + (i % 7) * 10, y = 12 + Math.floor(i / 7) * 14; const c = [1, 3, 8, 9, 11, 15, 17, 19].includes(i) ? 'profit' : [2, 6, 12, 16].includes(i) ? 'loss' : 'surface-3'; return `<rect x="${x}" y="${y}" width="8" height="11" rx="2" fill="var(--${c})"/>`; }).join('') + [12, 26, 40].map((y, i) => `<rect x="80" y="${y}" width="12" height="11" rx="2" fill="var(--${i === 1 ? 'loss' : 'profit'})" fill-opacity=".5"/>`).join(''),
    year: Array.from({ length: 12 }, (_, i) => { const x = 8 + (i % 6) * 14.5, y = 12 + Math.floor(i / 6) * 24; return `<rect x="${x}" y="${y}" width="12" height="18" rx="2" fill="var(--${[0, 2, 3, 5, 8, 10].includes(i) ? 'profit' : [1, 6, 9].includes(i) ? 'loss' : 'surface-3'})" fill-opacity=".7"/>`; }).join(''),
    heat: Array.from({ length: 35 }, (_, i) => { const x = 8 + Math.floor(i / 5) * 12.5, y = 10 + (i % 5) * 10; const l = [0, .2, .45, .7, 1][(i * 7) % 5]; return `<rect x="${x}" y="${y}" width="9" height="8" rx="2" fill="var(--accent)" fill-opacity="${l || .08}"/>`; }).join(''),
    progress: '<rect x="8" y="14" width="40" height="5" rx="2.5" fill="var(--faint)"/><rect x="8" y="24" width="84" height="8" rx="4" fill="var(--surface-3)"/><rect x="8" y="24" width="56" height="8" rx="4" fill="var(--profit)"/><rect x="8" y="40" width="30" height="5" rx="2.5" fill="var(--faint)"/><rect x="8" y="50" width="84" height="8" rx="4" fill="var(--surface-3)"/><rect x="8" y="50" width="24" height="8" rx="4" fill="var(--loss)"/>',
    dd: '<line x1="8" x2="92" y1="12" y2="12" stroke="var(--border-2)"/><path d="M8 12 L20 28 L32 16 L44 40 L56 30 L68 12 L80 34 L92 22 L92 12 Z" fill="var(--loss)" fill-opacity=".3"/><path d="M8 12 L20 28 L32 16 L44 40 L56 30 L68 12 L80 34 L92 22" fill="none" stroke="var(--loss)" stroke-width="2"/>',
  };
  /* eigene Vorschau je Widget in js/widgetpreviews.js; ohne die Datei die alten Grundformen */
  const preview = (kind, typ) => (root.WidgetPreviews ? root.WidgetPreviews.svg(typ, kind) : `<svg viewBox="0 0 100 64" width="96" height="62" aria-hidden="true">${PV[kind] || PV.num}</svg>`);

  /* ---------- Oberer Bereich: Kennzahl-Kacheln ---------- */
  const TOP = [
    { typ: 'netto_pnl', name: 'Netto P&L', preview: 'num', desc: 'Realisierter Netto-Gewinn oder -Verlust aller geschlossenen Trades, mit Anzahl der Trades.', info: 'Summe der Netto-Ergebnisse (nach Gebühren) aller geschlossenen Trades im gewählten Zeitraum. Rechts die Anzahl der Trades.',
      render(d, inst, e) { return tile(e, d.empty ? noData() : U.pnl(d.s.total, '', { signed: false }), { n: d.empty ? null : `${d.s.n} Trade${d.s.n === 1 ? '' : 's'}`, foot: d.empty ? '' : `Ø ${fmt.cur(d.s.expectancy, { signed: true })} pro Trade` }); } },
    { typ: 'kontostand_pnl', name: 'Kontostand & P&L', preview: 'num', desc: 'Aktueller Kontostand (Startkapital plus Netto-P&L) und Gesamt-P&L.', info: 'Kontogröße aus den Einstellungen plus Netto-P&L des Zeitraums. Darunter der Gesamt-P&L.',
      render(d, inst, e) { return tile(e, d.empty ? noData() : fmt.balance(d.account + d.s.total), { foot: d.empty ? '' : `P&L: ${U.pnl(d.s.total)}` }); } },
    { typ: 'trade_trefferquote', name: 'Trade-Trefferquote', preview: 'gauge', desc: 'Anteil der Gewinn-Trades an allen Trades, als Halbkreis mit Gewinnern, Breakeven und Verlierern.', info: 'Gewinn-Trades geteilt durch alle geschlossenen Trades. Break-even-Trades zählen nicht als Gewinn.',
      render(d, inst, e) { const s = d.s; return tile(e, d.empty ? noData() : fmt.pct(s.winRate, 1), d.empty ? {} : { side: true, gauge: `<div class="gauge-stack">${U.semiGauge([{ v: s.wins, c: 'profit' }, { v: s.be, c: 'be' }, { v: s.losses, c: 'loss' }], '')}<span class="pills">${U.pill(s.wins, 'win')}${U.pill(s.be, 'be')}${U.pill(s.losses, 'loss')}</span></div>` }); } },
    /* gleiche Kennzahl-Art wie „Ø Gewinn/Verlust“ (Verhältnis zweier Beträge), deshalb dieselbe Form: Zweiteil-Balken */
    { typ: 'profit_faktor', name: 'Profit-Faktor', preview: 'donut', desc: 'Summe aller Gewinne geteilt durch Summe aller Verluste, als Ring-Diagramm.', info: 'Bruttogewinn geteilt durch Bruttoverlust. Über 1,5 gilt als gut, unter 1 ist das Konto langfristig im Minus.',
      render(d, inst, e) { const s = d.s; return tile(e, d.empty ? noData() : fmt.factor(s.pf), d.empty ? {} : { side: true, gauge: U.donut([{ v: s.gp, c: 'profit' }, { v: -s.gl, c: 'loss' }], 54, 6) }); } },
    { typ: 'tages_trefferquote', name: 'Tages-Trefferquote', preview: 'gauge', desc: 'Gewinntage geteilt durch alle Handelstage.', info: 'Anteil der Handelstage mit positivem Netto-Ergebnis an allen Handelstagen im Zeitraum.',
      render(d, inst, e) { const ds = d.ds; const be = ds.days - ds.winDays - ds.lossDays; return tile(e, d.empty ? noData() : fmt.pct(ds.dayWinRate, 1), d.empty ? {} : { side: true, gauge: `<div class="gauge-stack">${U.semiGauge([{ v: ds.winDays, c: 'profit' }, { v: be, c: 'be' }, { v: ds.lossDays, c: 'loss' }], '')}<span class="pills">${U.pill(ds.winDays, 'win')}${U.pill(be, 'be')}${U.pill(ds.lossDays, 'loss')}</span></div>` }); } },
    { typ: 'avg_gewinn_verlust', name: 'Gewinn/Verlust pro Trade', short: 'Ø Gewinn/Verlust', preview: 'wl', desc: 'Durchschnittlicher Gewinn und Verlust pro Trade als Balken im Verhältnis zueinander.', info: 'Durchschnittlicher Gewinn-Trade geteilt durch durchschnittlichen Verlust-Trade. Der Balken zeigt das Verhältnis.',
      render(d, inst, e) { const s = d.s; const wf = s.avgWin / (s.avgWin - s.avgLoss || 1) * 100; return tile(e, d.empty ? noData() : (s.payoff == null ? (s.avgWin > 0 ? '∞' : '—') : fmt.num(s.payoff, 2)), d.empty ? {} : { gauge: `<div class="wl-single"><div class="track"><i style="width:${wf}%;background:var(--profit)"></i><i style="flex:1;background:var(--loss)"></i></div><div class="lbl"><span class="pos">${fmt.cur(s.avgWin, { compact: s.avgWin >= 1000 })}</span><span class="neg">${fmt.cur(s.avgLoss, { compact: -s.avgLoss >= 1000 })}</span></div></div>` }).replace('class="tile"', 'class="tile wide"'); } },
    { typ: 'erwartungswert', name: 'Erwartungswert pro Trade', preview: 'num', desc: '(Trefferquote × Ø Gewinn) − (Verlustquote × Ø Verlust).', info: 'Trefferquote × Ø Gewinn minus Verlustquote × Ø Verlust. Was ein Trade im Schnitt einbringt.',
      render(d, inst, e) { const s = d.s; return tile(e, d.empty ? noData() : U.pnl(s.tradeExpectancy), { foot: d.empty ? '' : `${fmt.pct(s.winRate)} × ${fmt.cur(s.avgWin, { compact: true })} − ${fmt.pct(s.lossRate)} × ${fmt.cur(-s.avgLoss, { compact: true })}` }); } },
    { typ: 'tages_serie', name: 'Aktuelle Tages-Serie', preview: 'streak', desc: 'Gewinntage oder Verlusttage in Folge.', info: 'Handelstage in Folge mit gleichem Vorzeichen. Rot bei Verlusttagen, grün bei Gewinntagen. Die Pillen zeigen die längste Verlust- und Gewinnserie.',
      render(d, inst, e) { const st = d.dayStreaks; return tile(e, d.empty || !st.current ? noData() : `<span class="${st.kind === 'loss' ? 'neg' : 'pos'}">${st.current} Tag${st.current === 1 ? '' : 'e'}</span>`, d.empty ? {} : { gauge: streakPills(st.maxWin, st.maxLoss, 'Tage'), foot: st.current ? (st.kind === 'loss' ? 'Verlusttage in Folge' : 'Gewinntage in Folge') : '' }).replace('class="tile"', 'class="tile streak-tile"'); } },
    { typ: 'trade_serie', name: 'Aktuelle Trade-Serie', preview: 'streak', desc: 'Gewinn-Trades oder Verlust-Trades in Folge.', info: 'Geschlossene Trades in Folge mit gleichem Ergebnis. Break-even-Trades werden übersprungen. Die Pillen zeigen die längste Verlust- und Gewinnserie.',
      render(d, inst, e) { const st = d.streaks; return tile(e, d.empty || !st.current ? noData() : `<span class="${st.kind === 'loss' ? 'neg' : 'pos'}">${st.current} Trade${st.current === 1 ? '' : 's'}</span>`, d.empty ? {} : { gauge: streakPills(st.maxWin, st.maxLoss, 'Trades'), foot: st.current ? (st.kind === 'loss' ? 'Verluste in Folge' : 'Gewinne in Folge') : '' }).replace('class="tile"', 'class="tile streak-tile"'); } },
    { typ: 'serie', name: 'Aktuelle Serie', preview: 'streak', desc: 'Tages- und Trade-Serie kombiniert.', info: 'Links die aktuelle Tages-Serie, rechts die aktuelle Trade-Serie. Rot bei Verlusten, grün bei Gewinnen. Die Pillen zeigen jeweils die längste Verlust- und Gewinnserie.',
      render(d, inst, e) { const ds = d.dayStreaks, ts = d.streaks; const grp = (label, st, unit) => `<div class="sg"><div class="caption">${label}</div><div class="sr">${streakRing(st.current, st.kind)}${streakPills(st.maxWin, st.maxLoss, unit)}</div></div>`; return `<div class="tile serie-tile"><div class="head"><span>${esc(e.name)}${U.info(e.info)}</span></div><div class="body serie">${d.empty ? noData() : grp('Tage', ds, 'Tage') + grp('Trades', ts, 'Trades')}</div></div>`; } },
    { typ: 'max_drawdown', name: 'Maximaler Drawdown', preview: 'num', desc: 'Größter Rückgang vom Höchststand, in Währung und Prozent, mit Datum.', info: 'Größter Rückgang der kumulierten Ergebniskurve von einem Hoch bis zum folgenden Tief, in Währung und in Prozent des Kontostands am Hoch.',
      render(d, inst, e) { const dd = d.dd; return tile(e, d.empty ? noData() : `<span class="neg">${fmt.cur(dd.max)}</span><small class="neg sub">${pctText(dd.maxPct)}</small>`, { foot: d.empty ? '' : dd.maxAt ? fmt.dateFull(dd.maxAt) : 'Kein Drawdown' }); } },
    { typ: 'avg_drawdown', name: 'Durchschnittlicher Drawdown', preview: 'num', desc: 'Durchschnittlicher Rückgang vom Höchststand im gewählten Zeitraum.', info: 'Mittelwert aller Drawdown-Phasen (vom Hoch bis zum tiefsten Punkt) im Zeitraum. Darunter der aktuelle Abstand zum Hoch.',
      render(d, inst, e) { const dd = d.dd; return tile(e, d.empty ? noData() : `<span class="neg">${fmt.cur(dd.avg)}</span><small class="neg sub">${pctText(dd.avgPct)}</small>`, { foot: d.empty ? '' : `Aktuell${dd.currentAt ? ` (${fmt.dateFull(dd.currentAt)})` : ''}: <span class="${U.cls(dd.current)}">${fmt.cur(dd.current)}</span>` }); } },
  ];

  /* ---------- Unterer Bereich: Diagramme, Kalender, Listen ---------- */
  const HOLD_TICKS = [[1, '1 min'], [5, '5 min'], [15, '15 min'], [30, '30 min'], [60, '1 h'], [120, '2 h'], [240, '4 h'], [480, '8 h'], [1440, '1 T'], [4320, '3 T'], [10080, '1 W']];
  const REPORT_GROUPS = [
    { id: 'zeit', name: 'Zeitanalyse', items: [
      ['avg_haltedauer', 'Ø Haltedauer (kumuliert)', 'dur', r => r.avgHold], ['max_haltedauer', 'Längste Haltedauer (kumuliert)', 'dur', r => r.maxHold], ['avg_tagesdauer', 'Ø Dauer Handelstag (kumuliert)', 'dur', r => r.avgDayDur], ['max_tagesdauer', 'Max. Dauer Handelstag (kumuliert)', 'dur', r => r.maxDayDur] ] },
    { id: 'profit', name: 'Profitabilität', items: [
      ['netto_pnl', 'Netto-P&L (kumuliert)', 'cur', r => r.cum], ['tages_pnl', 'Tages-Netto-P&L', 'cur', r => r.dayPnl], ['avg_tages_pnl', 'Ø Tages-Netto-P&L (kumuliert)', 'cur', r => r.avgDayPnl], ['avg_tages_wl', 'Ø Tages-Gewinn/Verlust (kumuliert)', 'num', r => r.avgDayWL],
      ['avg_gewinn', 'Ø Gewinn (kumuliert)', 'cur', r => r.avgWin], ['avg_verlust', 'Ø Verlust (kumuliert)', 'cur', r => r.avgLoss], ['avg_trade', 'Ø Netto-P&L pro Trade (kumuliert)', 'cur', r => r.avgTrade], ['payoff', 'Ø Trade-Gewinn/Verlust (kumuliert)', 'num', r => r.payoff],
      ['groesster_gewinn', 'Größter Gewinn-Trade (kumuliert)', 'cur', r => r.largestWin], ['groesster_verlust', 'Größter Verlust-Trade (kumuliert)', 'cur', r => r.largestLoss], ['profit_faktor', 'Profit-Faktor (kumuliert)', 'num', r => r.pf], ['erwartungswert', 'Erwartungswert (kumuliert)', 'cur', r => r.expectancy] ] },
    { id: 'risiko', name: 'Risiko & Drawdown', items: [
      ['drawdown', 'Drawdown (kumuliert)', 'cur', r => r.dd], ['avg_tages_dd', 'Ø Tages-Drawdown (kumuliert)', 'cur', r => r.avgDayDD], ['max_tages_dd', 'Max. Tages-Drawdown (kumuliert)', 'cur', r => r.maxDayDD], ['avg_geplant_r', 'Ø geplantes R-Multiple (kumuliert)', 'num', r => r.avgPlannedR], ['avg_realisiert_r', 'Ø realisiertes R-Multiple (kumuliert)', 'num', r => r.avgR],
      ['be_trades', 'Break-even-Trades (kumuliert)', 'int', r => r.beTrades], ['be_tage', 'Break-even-Tage (kumuliert)', 'int', r => r.beDays], ['verlusttage', 'Verlusttage (kumuliert)', 'int', r => r.lossDays] ] },
    { id: 'aktivitaet', name: 'Trading-Aktivität & Volumen', items: [
      ['trades', 'Trades (kumuliert)', 'int', r => r.trades], ['gewinn_trades', 'Gewinn-Trades (kumuliert)', 'int', r => r.winTrades], ['verlust_trades', 'Verlust-Trades (kumuliert)', 'int', r => r.lossTrades], ['longs', 'Long-Trades (kumuliert)', 'int', r => r.longs], ['shorts', 'Short-Trades (kumuliert)', 'int', r => r.shorts],
      ['long_gewinner', 'Long-Gewinner (kumuliert)', 'int', r => r.longWins], ['short_gewinner', 'Short-Gewinner (kumuliert)', 'int', r => r.shortWins], ['volumen', 'Volumen (kumuliert)', 'num', r => r.volume], ['avg_tagesvolumen', 'Ø Tagesvolumen (kumuliert)', 'num', r => r.avgDayVolume], ['handelstage', 'Handelstage (kumuliert)', 'int', r => r.tradingDays], ['kontostand', 'Kontostand', 'cur', (r, d) => d.account + r.cum] ] },
    { id: 'serien', name: 'Serien & Konstanz', items: [
      ['trefferquote', 'Trefferquote (kumuliert)', 'pct', r => r.winRate], ['avg_tages_trefferquote', 'Ø Tages-Trefferquote (kumuliert)', 'pct', r => r.avgDayWinRate], ['long_trefferquote', 'Long-Trefferquote (kumuliert)', 'pct', r => r.longWinRate], ['short_trefferquote', 'Short-Trefferquote (kumuliert)', 'pct', r => r.shortWinRate], ['gewinntage', 'Gewinntage (kumuliert)', 'int', r => r.winDays],
      ['max_gewinne_folge', 'Max. Gewinne in Folge (kumuliert)', 'int', r => r.maxW], ['max_verluste_folge', 'Max. Verluste in Folge (kumuliert)', 'int', r => r.maxL], ['max_gewinntage_folge', 'Max. Gewinntage in Folge (kumuliert)', 'int', r => r.maxWD], ['max_verlusttage_folge', 'Max. Verlusttage in Folge (kumuliert)', 'int', r => r.maxLD] ] },
  ].map(g => Object.assign(g, { items: g.items.map(([key, label, unit, get]) => ({ key, label, short: label.replace(/ \(kumuliert\)$/, ''), unit, get, group: g.id })) }));
  const REPORT_ALL = {}; for (const g of REPORT_GROUPS) for (const it of g.items) REPORT_ALL[it.key] = it;
  const REPORT_COLORS = ['#3d6bff', '#f5a53a', '#4fd1a5'];
  const REPORT_DEFAULT = () => ({ kennzahlen: [{ key: 'trefferquote', color: REPORT_COLORS[0], typ: 'linie' }, { key: 'avg_gewinn', color: REPORT_COLORS[1], typ: 'linie' }], aufloesung: 'tag' });
  /* Einstellungen lesen (alte Form: Liste von Schlüsseln) */
  function reportConfig(inst) {
    const raw = inst.einstellungen || {}; let list = Array.isArray(raw.kennzahlen) ? raw.kennzahlen : REPORT_DEFAULT().kennzahlen;
    list = list.map((x, i) => typeof x === 'string' ? { key: x, color: REPORT_COLORS[i % 3], typ: 'linie' } : Object.assign({ color: REPORT_COLORS[i % 3], typ: 'linie' }, x)).filter(x => REPORT_ALL[x.key]).slice(0, 3);
    if (!list.length) list = REPORT_DEFAULT().kennzahlen;
    return { kennzahlen: list, aufloesung: ['tag', 'woche', 'monat'].includes(raw.aufloesung) ? raw.aufloesung : 'tag' };
  }
  function reportPanel(rows, st) {
    const used = new Set(rows.map(r => r.key)); const q = (st.q || '').trim().toLowerCase(); const openG = st.groups || {};
    const pick = st.pick != null ? `<div class="rep-pick"><div class="nb-search"><div class="q">${I.search}<input class="input" id="rep-q" placeholder="Suchen" value="${esc(st.q || '')}" data-input="dash-rep-q" autocomplete="off"></div></div><div class="rep-groups">${REPORT_GROUPS.map(g => { const items = g.items.filter(it => !q || it.label.toLowerCase().includes(q)); if (q && !items.length) return ''; const open = q ? true : !!openG[g.id]; return `<button type="button" class="rep-g" data-action="dash-rep-group" data-g="${g.id}" aria-expanded="${open}"><span>${g.name}</span>${I.chev}</button>${open ? items.map(it => `<button type="button" class="rep-it" data-action="dash-rep-set" data-key="${it.key}" ${used.has(it.key) && !(rows[st.pick] && rows[st.pick].key === it.key) ? 'disabled' : ''}>${esc(it.label)}</button>`).join('') : ''}`; }).join('')}</div></div>` : '';
    return `<div class="rep-panel">${rows.map((r, i) => `<div class="rep-row"><label class="rep-color" style="background:${esc(r.color)}" title="Farbe"><input type="color" value="${esc(r.color)}" data-change="dash-rep-color" data-i="${i}" aria-label="Farbe"></label><button type="button" class="rep-sel ${st.pick === i ? 'on' : ''}" data-action="dash-rep-pick" data-i="${i}" style="border-left-color:${esc(r.color)}" title="${esc(REPORT_ALL[r.key].label)}"><span>${esc(REPORT_ALL[r.key].short)}</span>${I.chev}</button><select class="select sm rep-type" data-change="dash-rep-type" data-i="${i}" aria-label="Darstellung"><option value="linie" ${r.typ !== 'balken' ? 'selected' : ''}>Linie</option><option value="balken" ${r.typ === 'balken' ? 'selected' : ''}>Balken</option></select><button type="button" class="btn ghost icon sm rep-x" data-action="dash-rep-remove" data-i="${i}" aria-label="Entfernen" ${rows.length <= 1 ? 'disabled' : ''}>${I.close}</button></div>`).join('')}<div class="rep-foot"><button type="button" class="btn ghost rep-reset" data-action="dash-rep-reset">Auf Standard zurücksetzen</button><button type="button" class="btn primary sm ${st.pick === 'new' ? 'on' : ''}" data-action="dash-rep-pick" data-i="new" ${rows.length >= 3 ? 'disabled' : ''}>${I.plus} Kennzahl hinzufügen</button></div>${pick}</div>`;
  }
  const MAIN = [
    { typ: 'score', name: 'Gesamt-Score', preview: 'radar', groesse: 'klein', settings: 'score', desc: 'Punktzahl von 0 bis 100 als Netz-Diagramm, mit dem Zeitraum davor zum Vergleich. Die Punkte wählst du selbst (mindestens 3).', info: 'Jeder Punkt geht von 0 bis 100: standardmäßig Trefferquote, Profit-Faktor, Gewinn/Verlust-Verhältnis, Konsistenz, Regeltreue und Drawdown. Über das Zahnrad wählst du andere oder weitere Punkte, mindestens 3. Der Score ist der Mittelwert. Gestrichelt zum Vergleich: der Zeitraum davor (z. B. der Vormonat), bei „Gesamt“ die letzten 30 Tage.',
      render(d, inst, e) {
        if (d.empty) return card(e, emptyBox(), { trailing: settingsBtn() }); const keys = (inst.einstellungen || {}).achsen; const sc = C.scoreAxes(d.list, d.account, keys);
        const pr = compareRange(d); const ps = pr.list.length ? C.scoreAxes(pr.list, d.account, keys) : null;
        const curLabel = d.range.label === 'Gesamt' ? tr('Gesamt') : d.range.label;
        const shortM = dt => new Intl.DateTimeFormat(LOCALE(), { month: 'short', year: 'numeric' }).format(dt); const legCur = d.range.preset === 'month' ? shortM(d.range.from) : curLabel, legPrev = pr.kind === 'prev' && d.range.preset === 'month' ? shortM(pr.from) : pr.label;
        U.chartData['dash-score'] = { aria: tr('Gesamt-Score {0} von 100', [sc.overall]), prev: !!ps, curLabel, prevLabel: pr.label, axes: sc.axes.map((a, i) => ({ key: a.key, label: a.label, v: a.score, text: a.text, p: ps ? ps.axes[i].score : 0, ptext: ps ? ps.axes[i].text : '' })) };
        const delta = ps ? sc.overall - ps.overall : null;
        const legend = ps ? `<div class="legend r2-legend"><span><i class="r2-k cur"></i><span class="no-i18n">${esc(legCur)}</span></span><span><i class="r2-k prev"></i><span class="no-i18n">${esc(legPrev)}</span></span></div>` : '';
        const dl = delta == null ? '' : `<span class="r2-delta" data-tip="${esc(pr.label + ': ' + ps.overall)}">${delta > 0 ? '+' + delta : delta < 0 ? '−' + Math.abs(delta) : '±0'}</span>`;
        return card(e, `<div class="chart score-radar" data-chart="radar2" data-id="dash-score"></div>${legend}<div class="row" style="gap:16px;margin-top:8px;align-items:center"><div><div class="score-lbl">Dein Score</div><div class="row r2-big"><div class="score-big">${sc.overall}</div>${dl}</div></div><div class="grow score-scale" style="margin:0 8px 14px;--p:${sc.overall}"><div class="track"></div><div class="fill"></div><div class="knob"></div><div class="lbls"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div></div></div>`, { trailing: settingsBtn() });
      } },
    { typ: 'pnl_vergleich', name: 'P&L im Vergleich', preview: 'pnlcmp', groesse: 'klein', desc: 'Kumulierter P&L des Zeitraums als Linie, gestrichelt derselbe Zeitraum davor. Neben dem Titel der Unterschied zum gleichen Zeitpunkt.', info: 'Durchgezogen: kumuliertes Netto-Ergebnis im gewählten Zeitraum. Gestrichelt: derselbe Zeitraum davor (z. B. der Vormonat), Tag für Tag darübergelegt. Die Zahl neben dem Titel zeigt, wie viel besser oder schlechter du jetzt stehst als am gleichen Tag des Zeitraums davor. Bei „Gesamt“: die letzten 30 Tage gegen die vorherigen 30 Tage.',
      render(d, inst, e) {
        if (d.empty) return card(e, emptyBox(280)); const recent = !d.range.from; const r = recent ? Object.assign({ preset: 'last30', label: tr('Letzte 30 Tage') }, last30()) : d.range; const pr = recent ? Object.assign(prevRange(r), { label: tr('Vorherige 30 Tage') }) : prevRange(r);
        const first = d.days.length ? d.days[0].day : new Date(); const from = r.from || first, to = r.to || new Date();
        const cur = cumDays(recent ? closedIn(d.all, r) : d.list, from, to); const prevList = pr ? closedIn(d.all, pr) : []; const prev = pr && prevList.length ? cumDays(prevList, pr.from, pr.to) : null;
        const len = r.from && r.to ? Math.round((new Date(r.to.getFullYear(), r.to.getMonth(), r.to.getDate()) - new Date(r.from.getFullYear(), r.from.getMonth(), r.from.getDate())) / 864e5) + 1 : cur.length;
        const dates = Array.from({ length: Math.max(len, cur.length, prev ? prev.length : 0) }, (_, i) => { const dt = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i); return dt; });
        const curLabel = r.label === 'Gesamt' ? tr('Gesamt') : r.label;
        const pdates = pr ? Array.from({ length: dates.length }, (_, i) => new Date(pr.from.getFullYear(), pr.from.getMonth(), pr.from.getDate() + i)) : [];
        U.chartData['dash-pnlcmp'] = { cur, prev, len, dates, pdates, curLabel, prevLabel: pr ? pr.label : '', aria: tr('Kumulierter P&L im Vergleich zum Zeitraum davor') };
        /* Pille: Stand heute gegen den Stand am gleichen Tag des Zeitraums davor */
        const now = cur.length ? cur[cur.length - 1].v : 0, then = prev ? prev[Math.min(cur.length, prev.length) - 1].v : null; const diff = then == null ? null : now - then;
        const pill = diff == null ? '' : `<span class="pc-pill ${diff >= 0 ? 'up' : 'down'}" data-tip="${esc(tr('Stand am gleichen Tag im Zeitraum davor: {0}', [fmt.cur(then, { signed: true })]))}">${diff >= 0 ? '↗' : '↘'} ${fmt.cur(diff, { signed: true, compact: Math.abs(diff) >= 10000 })}</span>`;
        const shortM = dt => new Intl.DateTimeFormat(LOCALE(), { month: 'short', year: 'numeric' }).format(dt); const subCur = r.preset === 'month' ? shortM(r.from) : curLabel, subPrev = pr ? (r.preset === 'month' ? shortM(pr.from) : pr.label) : '';
        /* Legende: beide Linien mit eigenem Linien-Schlüssel; das genaue Datum steht im Tooltip */
        const span = (a, b) => `${fmt.dateFull(a)} – ${fmt.dateFull(b)}`; const key = (cls, label, tip) => `<span class="pc-li" data-tip="${esc(tip)}"><i class="pc-k ${cls}"></i><span class="no-i18n">${esc(label)}</span></span>`;
        const sub = prev ? `<span class="pc-leg">${key('cur', subCur, span(from, to))}${key('prev', subPrev, span(pr.from, pr.to))}</span>` : `<span class="no-i18n">${esc(subCur)}</span>`;
        return card(e, `<div class="chart h280 pc-chart" data-chart="pnlcmp" data-id="dash-pnlcmp"></div>`, { badge: pill, sub });
      } },
    { typ: 'kum_pnl', name: 'Kumulierter Tages-P&L', preview: 'area', groesse: 'klein', desc: 'Wie sich der Netto-P&L über die Zeit aufsummiert, als Flächendiagramm.', info: 'Kumuliertes Netto-Tagesergebnis im Zeitraum. Grün über Null, rot darunter.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-kum_pnl'] = { days: d.days, bars: false }; return card(e, `<div class="chart h280" data-chart="pnl" data-id="dash-kum_pnl"></div>`); } },
    { typ: 'verlauf_trefferquote', name: 'Trefferquote – Ø Gewinn – Ø Verlust', preview: 'line', groesse: 'klein', desc: 'Wie sich Trefferquote, Ø Gewinn und Ø Verlust über die Handelstage entwickeln.', info: 'Laufende Werte bis zum jeweiligen Handelstag: Trefferquote (rechte Achse), Ø Gewinn und Ø Verlust (linke Achse).',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-verlauf'] = { points: d.running.map(r => ({ date: r.date, v: { avgWin: r.avgWin, avgLoss: r.avgLoss, winRate: r.winRate } })), series: [{ key: 'avgWin', label: 'Ø Gewinn', unit: 'cur', color: 'var(--profit)' }, { key: 'avgLoss', label: 'Ø Verlust', unit: 'cur', color: 'var(--loss)' }, { key: 'winRate', label: 'Trefferquote', unit: 'pct', color: 'var(--be)' }] }; return card(e, `<div class="chart h280" data-chart="lines" data-id="dash-verlauf"></div><div class="legend rep"><span><i style="background:var(--profit)"></i>Ø Gewinn</span><span><i style="background:var(--loss)"></i>Ø Verlust</span><span><i style="background:var(--be)"></i>Trefferquote</span></div>`); } },
    { typ: 'perf_uhrzeit', name: 'Performance nach Uhrzeit', preview: 'scatter', groesse: 'klein', desc: 'Punktdiagramm: Uhrzeit des Einstiegs oder Ausstiegs gegen P&L.', info: 'Jeder Punkt ist ein geschlossener Trade: waagerecht die Uhrzeit (Einstieg oder Ausstieg, wählbar über das Zahnrad), senkrecht das Netto-Ergebnis. Blau sind Break-even-Trades.',
      render(d, inst, e) {
        const exit = (inst.einstellungen || {}).zeit === 'exit'; const gear = `<div class="popwrap"><button type="button" class="btn ghost icon sm w-cfg" data-pop="uhrzeit" title="Einstellungen" aria-label="Uhrzeit wählen">${I.settings}</button><div class="popover" id="pop-uhrzeit"><button type="button" class="item" data-action="dash-w-opt" data-key="zeit" data-value="entry" aria-checked="${!exit}"><b>Einstiegszeit</b></button><button type="button" class="item" data-action="dash-w-opt" data-key="zeit" data-value="exit" aria-checked="${exit}"><b>Ausstiegszeit</b></button></div></div>`;
        if (d.empty) return card(e, emptyBox(280), { trailing: gear });
        const pts = d.closed.map(t => { const dt = exit ? t.close : t.open; return { x: dt.getHours() * 60 + dt.getMinutes(), y: t.pnl, tip: `<b>${esc(t.symbol)}</b> ${exit ? 'Ausstieg' : 'Einstieg'} ${fmt.time(dt)}<br>${fmt.cur(t.pnl, { signed: true, r: t.r })}` }; });
        const xs = pts.map(p => p.x); const lo = Math.min(...xs), hi = Math.max(...xs); const span = Math.max(30, hi - lo); const x0 = Math.max(0, lo - span * 0.04), x1 = Math.min(1440, hi + span * 0.04);
        const k = 9; const ticks = Array.from({ length: k }, (_, i) => { const v = x0 + (x1 - x0) * i / (k - 1); return { v, label: hhmm(v) }; });
        U.chartData['dash-uhrzeit'] = { points: pts, x0, x1, xTicks: ticks }; return card(e, `<div class="chart h280" data-chart="scatter" data-id="dash-uhrzeit"></div>`, { trailing: gear });
      } },
    { typ: 'perf_haltedauer', name: 'Performance nach Haltedauer', preview: 'scatter', groesse: 'klein', desc: 'Punktdiagramm: Haltedauer gegen P&L.', info: 'Jeder Punkt ist ein geschlossener Trade: waagerecht die Haltedauer (logarithmisch), senkrecht das Netto-Ergebnis. Blau sind Break-even-Trades.',
      render(d, inst, e) {
        if (d.empty) return card(e, emptyBox(280));
        const pts = d.closed.filter(t => t.holdingMin != null).map(t => ({ x: Math.log10(t.holdingMin * 60 + 1), y: t.pnl, tip: `<b>${esc(t.symbol)}</b> ${durLabel(t.holdingMin)}<br>${fmt.cur(t.pnl, { signed: true, r: t.r })}` }));
        const xs = pts.map(p => p.x); const lo = Math.min(...xs), hi = Math.max(...xs); const span = Math.max(0.5, hi - lo); const x0 = Math.max(0, lo - span * 0.04), x1 = hi + span * 0.04;
        const k = 11; const ticks = Array.from({ length: k }, (_, i) => { const v = x0 + (x1 - x0) * i / (k - 1); return { v, label: durLabel((10 ** v - 1) / 60) }; });
        U.chartData['dash-haltedauer'] = { points: pts, x0, x1, xTicks: ticks }; return card(e, `<div class="chart h280" data-chart="scatter" data-id="dash-haltedauer"></div>`);
      } },
    { typ: 'pnl_pro_tag', name: 'Netto-P&L pro Tag', preview: 'bars', groesse: 'klein', desc: 'Säulendiagramm mit grünen und roten Säulen je Handelstag.', info: 'Netto-Ergebnis je Handelstag im Zeitraum. Grüne Säulen sind Gewinntage, rote Verlusttage.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-tag'] = { days: d.days }; return card(e, `<div class="chart h280" data-chart="dbars" data-id="dash-tag"></div>`); } },
    { typ: 'taeglich_kumuliert', name: 'Täglicher & kumulierter P&L', preview: 'combo', groesse: 'klein', desc: 'Säulen für den Tages-P&L und Fläche für den kumulierten P&L in einem Diagramm.', info: 'Säulen: Netto-Ergebnis je Handelstag. Fläche und Linie: kumuliertes Ergebnis im Zeitraum.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-combo'] = { days: d.days, bars: true }; return card(e, `<div class="chart h280" data-chart="pnl" data-id="dash-combo"></div>`); } },
    { typ: 'letzte_trades', name: 'Letzte Trades & offene Positionen', preview: 'table', groesse: 'klein', desc: 'Tabelle mit Datum, Symbol und P&L. Tabs für letzte Trades und offene Positionen.', info: 'Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Mehr anzeigen“ öffnet das TradeLog.',
      render(d, inst, e, App) {
        /* Reiter „Offene Positionen“ nur bei offenen Positionen; ein hängender Reiterzustand fällt auf „Letzte Trades“ zurück */
        const open = d.all.filter(t => !t.closed).sort((a, b) => b.open - a.open); const tab = open.length && App.state.recentTab === 'open' ? 'open' : 'recent'; const recent = d.all.filter(t => t.closed).sort((a, b) => b.close - a.close).slice(0, 60); const rows = tab === 'open' ? open : recent;
        const table = rows.length ? `<div class="tbl-wrap inset recent-wrap"><table class="tbl compact" style="min-width:0"><thead><tr><th>${tab === 'open' ? 'Eröffnet' : 'Geschlossen'}</th><th colspan="2">Symbol</th><th class="r">${tab === 'open' ? 'Risiko' : 'Netto-P&L'}</th></tr></thead><tbody>${rows.map((t, i) => `<tr class="link ${i >= 8 ? 'hidden' : ''}" data-action="trade" data-id="${t.id}"><td>${fmt.dateFull(tab === 'open' ? t.open : t.close)}</td><td class="sym">${esc(t.symbol)}</td><td class="dir-cell">${U.badge(t.direction)}</td><td class="r">${tab === 'open' ? (t.risk ? fmt.cur(t.risk, { r: 1 }) : '—') : U.pnl(t.pnl, '', { r: t.r })}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty recent-wrap" style="min-height:160px">${I.tradelog}<b>${tab === 'open' ? 'Keine offenen Positionen' : NO_DATA}</b></div>`;
        return U.card(e.name, `${open.length ? `<div class="tabs sm" style="margin-bottom:12px">${[['recent', 'Letzte Trades'], ['open', `Offene Positionen (${open.length})`]].map(([k, l]) => `<button type="button" data-action="recent-tab" data-value="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>` : ''}${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>`, { info: e.info, cls: 'recent-card' });
      } },
    { typ: 'kalender', name: 'Kalender', preview: 'calendar', groesse: 'mittel', hoch: true, desc: 'Monatsansicht: Tage grün, rot oder grau mit P&L und Anzahl Trades. Pfeile zum Monatswechsel.', info: 'Ein Feld pro Tag mit Netto-Ergebnis und Anzahl Trades: grün bei Gewinn, rot bei Verlust, grau bei Break-even. Klick öffnet die Tagesansicht.',
      render(d, inst, e, App) { const now = new Date(); const m = App.state.calMonth || new Date(now.getFullYear(), now.getMonth(), 1); return U.card(e.name, `<div class="cal-head">${calNav(m, 'cal-prev', 'cal-next', 'cal-today')}${monthSub(d.daysAll, m)}</div>${calendarHTML(d.daysAll, m.getFullYear(), m.getMonth())}`, { info: e.info }); } },
    { typ: 'kontostand', name: 'Kontostand-Verlauf', preview: 'line', groesse: 'klein', desc: 'Linie: Startkapital plus Netto-P&L über die Zeit.', info: 'Kontogröße aus den Einstellungen plus kumuliertes Netto-Ergebnis je Handelstag. Die gestrichelte Linie ist das Startkapital.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); if (fmt.moneyBlind()) return card(e, `<div class="empty" style="min-height:280px">${I.stats}<b>Kontostand ausgeblendet</b><span class="small">Im Geld-blind-Modus wird der Kontostand nicht angezeigt.</span></div>`); let cum = 0; const pts = d.days.map(x => { cum += x.pnl; return { date: x.day, v: d.account + cum, pnl: x.pnl }; }); U.chartData['dash-kontostand'] = { points: pts, baseline: d.account }; return card(e, `<div class="legend top"><span><i style="background:var(--accent)"></i>Kontostand</span><span><i style="background:var(--loss)"></i>Startkapital</span></div><div class="chart h280" data-chart="line" data-id="dash-kontostand"></div>`); } },
    { typ: 'drawdown_verlauf', name: 'Drawdown-Verlauf', preview: 'dd', groesse: 'klein', desc: 'Flächendiagramm des Rückgangs vom Höchststand über die Handelstage.', info: 'Abstand der kumulierten Ergebniskurve zu ihrem bisherigen Hoch je Handelstag. Null heißt: neues Hoch.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-dd'] = { points: d.dd.series }; return card(e, `<div class="chart h280" data-chart="dd" data-id="dash-dd"></div><div class="small muted" style="margin-top:6px">Max. Drawdown: <b class="neg">${fmt.cur(d.dd.max)}</b>${d.dd.maxAt ? ` am ${fmt.dateFull(d.dd.maxAt)}` : ''}</div>`); } },
    { typ: 'challenge', name: 'Challenge', preview: 'progress', groesse: 'klein', settings: 'challenge', desc: 'Fortschrittsbalken zu einem eigenen Ziel, z. B. Gewinnziel und maximaler Verlust einer Prop-Firm-Challenge.', info: 'Gewinnziel und Verlustlimit legst du über das Zahnrad fest. Der obere Balken zeigt den Weg zum Ziel, der untere, wie viel vom erlaubten Verlust verbraucht ist. Optional ab einem Startdatum.',
      render(d, inst, e) {
        const cfg = inst.einstellungen || {}; const ziel = Number(cfg.ziel) || 0, maxV = Number(cfg.maxVerlust) || 0, tagV = Number(cfg.tagesVerlust) || 0;
        if (!ziel && !maxV) return card(e, `<div class="dashed" style="min-height:120px;display:grid;place-items:center;text-align:center">Noch kein Ziel festgelegt.<br><span class="small">Klicke auf das Zahnrad und trage Gewinnziel und maximalen Verlust ein.</span></div>`, { trailing: settingsBtn() });
        const from = cfg.start ? C.parseDayKey(cfg.start) : null; const list = from ? C.closedOnly(d.all).filter(t => t.close >= from) : d.closed; const days = C.dailyAggregation(list); const pnl = C.sum(days.map(x => x.pnl)); const dd = C.drawdownStats(days, d.account); const worstDay = days.length ? Math.min(...days.map(x => x.pnl)) : 0;
        const goalF = ziel ? C.clamp(pnl / ziel, 0, 1) : 0; const lossUsed = Math.max(0, -Math.min(pnl, dd.max)); const lossF = maxV ? C.clamp(lossUsed / maxV, 0, 1) : 0;
        const status = maxV && lossUsed >= maxV ? `<span class="pill loss">Verlustlimit verletzt</span>` : ziel && pnl >= ziel ? `<span class="pill win">Ziel erreicht</span>` : `<span class="pill neutral">Läuft${from ? ` seit ${fmt.dateFull(from)}` : ''}</span>`;
        const bar = (label, f, text, color) => `<div class="bar-row"><div class="bl"><span>${label}</span><b>${text}</b></div><div class="track"><i style="width:${(f * 100).toFixed(1)}%;background:${color}"></i></div></div>`;
        return card(e, `<div class="row between" style="margin-bottom:6px"><div class="big-stat" style="font-size:var(--fs-32);margin:0"><span class="${U.cls(pnl)}">${fmt.cur(pnl, { signed: true })}</span></div>${status}</div>${ziel ? bar('Gewinnziel', goalF, `${fmt.pct(goalF)} von ${fmt.cur(ziel, { compact: true })}`, 'var(--profit)') : ''}${maxV ? bar('Maximaler Verlust', lossF, `${fmt.cur(lossUsed)} von ${fmt.cur(maxV, { compact: true })}`, 'var(--loss)') : ''}${tagV ? bar('Schlechtester Tag', C.clamp(-worstDay / tagV, 0, 1), `${fmt.cur(worstDay)} (Limit ${fmt.cur(-tagV)})`, 'var(--warn)') : ''}${list.length ? `<div class="small muted" style="margin-top:8px">${U.count(list.length, 'Trade', 'Trades')} · ${U.count(days.length, 'Handelstag', 'Handelstage')}</div>` : `<div class="small muted" style="margin-top:8px">${NO_DATA}</div>`}`, { trailing: settingsBtn() });
      } },
    { typ: 'mini_kalender', name: 'Mini-Kalender', preview: 'calendar', groesse: 'klein', desc: 'Kompakte Monatsansicht, nur grün und rot ohne Zahlen.', info: 'Kompakter Monatsblick: grün bei Gewinntag, rot bei Verlusttag, grau bei Break-even. Beim Drüberfahren erscheint das Ergebnis.',
      render(d, inst, e, App) { const now = new Date(); const m = App.state.calMonth || new Date(now.getFullYear(), now.getMonth(), 1); return U.card(e.name, `<div class="cal-head mini">${calNav(m, 'cal-prev', 'cal-next', '')}</div>${calendarHTML(d.daysAll, m.getFullYear(), m.getMonth(), { mini: true })}<div class="cal-foot">${monthSub(d.daysAll, m)}</div>`, { info: e.info }); } },
    { typ: 'kalender_erweitert', name: 'Erweiterter Kalender', preview: 'calext', groesse: 'mittel', hoch: true, desc: 'Wie Kalender, mit einer zusätzlichen Spalte rechts mit dem P&L jeder Woche.', info: 'Monatsansicht mit Netto-Ergebnis je Tag und rechts das Wochenergebnis mit Anzahl der Handelstage.',
      render(d, inst, e, App) { const now = new Date(); const m = App.state.calMonth || new Date(now.getFullYear(), now.getMonth(), 1); return U.card(e.name, `<div class="cal-head">${calNav(m, 'cal-prev', 'cal-next', 'cal-today')}${monthSub(d.daysAll, m)}</div>${calendarHTML(d.daysAll, m.getFullYear(), m.getMonth(), { weeks: true })}`, { info: e.info }); } },
    { typ: 'regel_tracker', name: 'Regel-Tracker', preview: 'heat', groesse: 'klein', desc: 'Heatmap wie bei GitHub: je kräftiger, desto mehr Regeln an dem Tag eingehalten. Mit Tages-Score und Link zur Checkliste.', info: 'Ein Kästchen pro Tag der letzten 13 Wochen. Je mehr deiner Handelsregeln du an dem Tag abgehakt hast, desto kräftiger die Farbe. Der Tages-Score zählt die heute abgehakten Regeln. Regeln pflegst du in den Einstellungen, abhaken im Fortschritt-Tab.',
      render(d, inst, e) {
        const rules = S.data.rules.filter(r => r.active !== false); const todayKey = C.dayKey(new Date()); const today = S.day(todayKey) || {}; const doneToday = rules.length ? (today.rulesFollowed || []).filter(id => rules.some(r => r.id === id)).length : 0;
        const weeks = 13; const end = new Date(); end.setHours(0, 0, 0, 0); const start = C.weekStart(end); start.setDate(start.getDate() - (weeks - 1) * 7);
        const cols = []; const c = new Date(start);
        for (let w = 0; w < weeks; w++) { const col = { label: '', days: [] }; for (let i = 0; i < 7; i++) { const k = C.dayKey(c); if (c.getDate() <= 7 && !col.label && (i === 0 || w === 0)) col.label = c.toLocaleDateString((root.I18N ? root.I18N.locale() : 'de-DE'), { month: 'short' }).replace('.', ''); const day = S.day(k); const f = rules.length && day && day.rulesFollowed ? day.rulesFollowed.filter(id => rules.some(r => r.id === id)).length / rules.length : null; col.days.push({ k, date: new Date(c), f, future: c > end, wk: i >= 5 }); c.setDate(c.getDate() + 1); } cols.push(col); }
        const cell = x => { if (x.future) return '<i class="future"></i>'; const lvl = x.f == null ? '' : x.f >= 0.99 ? 'l4' : x.f >= 0.66 ? 'l3' : x.f >= 0.33 ? 'l2' : 'l1'; return `<i class="${lvl} ${x.wk ? 'wk' : ''} ${x.k === todayKey ? 'today' : ''}" data-tip="<b>${fmt.dateFull(x.date)}</b><br>${x.f == null ? 'Kein Regel-Check' : `${Math.round(x.f * rules.length)} von ${rules.length} Regeln eingehalten`}" data-action="day" data-day="${x.k}"></i>`; };
        const grid = `<div class="tracker" style="--weeks:${weeks}"><span class="tl"></span>${cols.map(x => `<span class="ml">${x.label}</span>`).join('')}${fmt.weekdays().map((wd, i) => `<span class="wl">${wd}</span>` + cols.map(x => cell(x.days[i])).join('')).join('')}</div><div class="heat-legend right"><span>Weniger</span><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>Mehr</span></div>`;
        const foot = `<div class="tracker-foot"><div><div class="caption" style="text-transform:none;letter-spacing:0;font-size:var(--fs-13);font-weight:600;color:var(--text-2)">Heutiger Score ${U.info('Heute abgehakte Regeln von allen aktiven Regeln.')}</div><div class="row" style="gap:12px;flex-wrap:nowrap"><b class="score-n">${doneToday}/${rules.length}</b><div class="bar-track"><i style="width:${rules.length ? Math.round(doneToday / rules.length * 100) : 0}%"></i></div></div></div><a class="btn" href="#/progress">Tages-Checkliste</a></div>`;
        return card(e, grid + foot + (!rules.length ? `<div class="small muted" style="margin-top:8px">Noch keine Regeln angelegt. <a href="#/settings">Regeln in den Einstellungen anlegen</a>.</div>` : ''), { trailing: `<a class="more-link" href="#/progress">Mehr anzeigen</a>` });
      } },
    { typ: 'report', name: 'Report', preview: 'line', groesse: 'klein', settings: 'report', desc: 'Bis zu drei Kennzahlen nach Wahl als Linie oder Balken im Zeitverlauf, nach Tag, Woche oder Monat.', info: 'Laufende Werte je Handelstag (oder Woche/Monat) für die gewählten Kennzahlen. Über das Zahnrad wählst du bis zu drei Kennzahlen, Farbe und Darstellung.',
      render(d, inst, e, App) {
        const cfg = reportConfig(inst); const rows = cfg.kennzahlen; const st = App.state.dash && App.state.dash.rep || {};
        const trailing = `<select class="select sm" data-change="dash-w-opt" data-key="aufloesung" aria-label="Auflösung">${[['tag', 'Tag'], ['woche', 'Woche'], ['monat', 'Monat']].map(([k, l]) => `<option value="${k}" ${cfg.aufloesung === k ? 'selected' : ''}>${l}</option>`).join('')}</select><button type="button" class="btn icon sm w-cfg" data-action="dash-rep-toggle" title="Kennzahlen wählen" aria-label="Kennzahlen wählen" aria-expanded="${!!st.open}">${I.settings}</button>`;
        const panel = st.open ? reportPanel(rows, st) : '';
        if (d.empty) return card(e, panel + emptyBox(280), { trailing, cls: 'rep-card' });
        const series = rows.map(r => { const m = REPORT_ALL[r.key]; return { key: r.key, label: m.short, unit: m.unit, color: r.color, type: r.typ === 'balken' ? 'bar' : 'line' }; });
        const pts = C.aggregateSeries(d.report, cfg.aufloesung).map(r => ({ date: r.date, v: Object.fromEntries(rows.map(x => [x.key, REPORT_ALL[x.key].get(r, d)])) }));
        U.chartData['dash-report'] = { points: pts, series, periodLabel: cfg.aufloesung === 'monat' ? dt => fmt.monthYear(dt) : cfg.aufloesung === 'woche' ? dt => `Woche ab ${fmt.dateFull(dt)}` : null };
        return card(e, `${panel}<div class="chart h280" data-chart="lines" data-id="dash-report"></div><div class="legend rep">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join('')}</div>`, { trailing, cls: 'rep-card' });
      } },
    { typ: 'jahreskalender', name: 'Jahreskalender', preview: 'year', groesse: 'gross', flach: true, desc: 'Eine Zeile pro Jahr mit allen zwölf Monaten und Gesamt, umschaltbar zwischen Trefferquote, P&L und Trades.', info: 'Jede Zeile ist ein Jahr, jedes Kästchen ein Monat mit Anzahl Trades. P&L: grün bei Gewinn, rot bei Verlust. Trefferquote und Trades: je kräftiger das Blau, desto höher der Wert. Rechts das Jahresergebnis.',
      render(d, inst, e) { const ansicht = (inst.einstellungen || {}).ansicht || 'pnl'; const seg = `<div class="seg mini">${[['trefferquote', 'Trefferquote'], ['pnl', 'P&L'], ['trades', 'Trades']].map(([k, l]) => `<button type="button" data-action="dash-w-opt" data-key="ansicht" data-value="${k}" aria-pressed="${ansicht === k}">${l}</button>`).join('')}</div>`; return U.card(e.name, yearRows(d.daysAll, ansicht), { info: e.info, trailing: seg }); } },
    /* Vorlagen von 21st.dev, im Stil der App nachgebaut (Zeichnen und Hover: U.drawers.wdbars, pie, wring; der Gesamt-Score nutzt U.drawers.radar2 nach heygaia/radar-chart) */
    { typ: 'wochentag_quote', name: 'Trefferquote nach Wochentag', preview: 'bars', groesse: 'klein', desc: 'Ein abgerundeter Balken je Wochentag. Beim Drüberfahren erscheinen Wert und Anzahl Trades.', info: 'Anteil der Gewinn-Trades je Wochentag im gewählten Zeitraum. Der höchste Wert füllt die Höhe. Samstag und Sonntag erscheinen nur, wenn du an diesen Tagen gehandelt hast.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-wdq'] = { days: weekdayRates(d.list), all: d.s }; return card(e, `<div class="chart h280 mc-chart" data-chart="wdbars" data-id="dash-wdq"></div>`); } },
    { typ: 'setup_verteilung', name: 'Trades nach Setup', preview: 'donut', groesse: 'klein', desc: 'Ring mit runden Segmenten: wie sich deine Trades auf die Setups verteilen.', info: 'Anzahl geschlossener Trades je Setup im gewählten Zeitraum. Die fünf Setups, die du insgesamt am häufigsten handelst, haben je eine feste Farbe, der Rest steht unter „Andere“. Beim Drüberfahren siehst du Anteil, Trefferquote und P&L.',
      render(d, inst, e) {
        if (d.empty) return card(e, emptyBox(280)); const sl = setupSlices(d.closed, d.all); if (!sl.some(x => x.c !== 'n')) return card(e, SETUP_HINT);
        U.chartData['dash-setups'] = { slices: sl };
        return card(e, `<div class="chart h240 pie-chart" data-chart="pie" data-id="dash-setups"></div><div class="legend pie-legend">${sl.map(x => `<span><i style="background:var(--pie-${x.c})"></i>${esc(x.label)} <b>${fmt.int(x.n)}</b></span>`).join('')}</div>`);
      } },
    { typ: 'disziplin_trichter', name: 'Disziplin-Trichter', preview: 'funnel', groesse: 'mittel', desc: 'Trichter von allen Trades über Setup, gehaltenen Stop und eingehaltene Regeln bis zu den Trades ohne Fehler. Darunter die Trefferquote der sauberen Trades.', info: 'Jede Stufe zählt die Trades, die sie und alle Stufen davor schaffen: mit Setup, Stop geplant und gehalten (Verlust höchstens 1,15 R), ohne gebrochene Regel, ohne Fehler-Tag. Prozent beziehen sich auf alle Trades im Zeitraum. Klick auf eine Stufe zeigt im TradeLog die Trades, die dort rausfallen. Stufen, die du nie erfasst, fehlen.',
      render(d, inst, e) {
        if (d.empty) return card(e, emptyBox(280)); const f = funnelStages(d.closed, d.all);
        if (f.stages.length < 2) return card(e, '<div class="fw-empty" style="min-height:280px"><b>Noch keine Stufen</b><span>Erfasse beim Loggen Setup, Stop, Regeln oder Fehler. Dann zeigt der Trichter, wo deine Disziplin wegbricht.</span></div>');
        const rest = d.closed.filter(t => !f.clean.includes(t)); const cs = C.summary(f.clean), rs = C.summary(rest);
        U.chartData['dash-funnel'] = { stages: f.stages, cleanIds: f.clean.map(t => t.id) };
        const line = !f.clean.length ? tr('Noch kein Trade hat alle Stufen geschafft.') : !rest.length ? tr('Alle Trades haben alle Stufen geschafft.') : tr('Saubere Trades gewinnen {0}, alle anderen {1}.', [fmt.pct(cs.winRate, 0), fmt.pct(rs.winRate, 0)]);
        return card(e, `<div class="chart h240 fn-chart" data-chart="funnel" data-id="dash-funnel"></div><div class="fn-foot"><span class="fn-say">${esc(line)}</span>${f.clean.length ? '<button type="button" class="more-link" data-action="funnel-open" data-i="clean">Saubere Trades ansehen</button>' : ''}</div>${f.missing ? '<div class="small muted fn-miss">Weitere Stufen erscheinen, sobald du Setup, Stop, Regeln oder Fehler beim Loggen erfasst.</div>' : ''}`);
      } },
    { typ: 'trefferquote_ring', name: 'Trefferquote-Ring', preview: 'gauge', groesse: 'klein', desc: 'Großer Ring mit deiner Trefferquote, der beim Laden hochzählt, darunter die letzten 20 Trades.', info: 'Anteil der Gewinn-Trades an allen geschlossenen Trades im gewählten Zeitraum. Darunter dieselbe Quote für die letzten 20 Trades, mit Pfeil, wenn sie um mindestens 3 Punkte abweicht.',
      render(d, inst, e) {
        const trailing = `<span class="wr-ico" aria-hidden="true">${I.target}</span>`;
        if (d.empty) return card(e, emptyBox(280), { trailing, cls: 'wr-card' });
        const s = d.s; const last = d.closed.slice().sort((a, b) => b.close - a.close).slice(0, 20); const recent = C.summary(last).winRate;
        const down = s.winRate - recent >= 0.03, up = recent - s.winRate >= 0.03;
        U.chartData['dash-wring'] = { rate: s.winRate, sub: `${fmt.int(s.wins)} von ${U.count(s.n, 'Trade', 'Trades')}` };
        const foot = s.n > 20 ? `<div class="wr-foot"><span>Letzte 20 Trades</span> <b class="${down ? 'neg' : up ? 'pos' : ''}">${down ? '↓ ' : up ? '↑ ' : ''}${fmt.pct(recent, 0)}</b></div>` : `<div class="wr-foot"><span>${U.count(s.n, 'Trade', 'Trades')}</span> <span>im Zeitraum</span></div>`;
        return card(e, `<div class="chart wr-chart" data-chart="wring" data-id="dash-wring"></div>${foot}`, { trailing, cls: 'wr-card' });
      } },
  ];
  /* ---------- Bereiche der App als Widgets: Schatten-Ich, Blind-Replay, Prop Firms, Ruhepunkt, Mentor ----------
     Gleiche Rechnung wie auf den Seiten (ShadowScreen, Replay, PropScreen, Ruhepunkt); fehlt ein Bereich, zeigt das Widget einen ruhigen Hinweis.
     Kennzahlen folgen dem Zeitraum des Dashboards, wo das Sinn ergibt (Schatten-Ich); Replay, Prop und Ruhepunkt zeigen den aktuellen Stand. */
  const more = (href, label = 'Öffnen') => `<a class="more-link" href="${href}">${label}</a>`;
  const missing = (e, what) => card(e, `<div class="dashed fw-missing">${what} ist hier nicht geladen.</div>`);
  /* Schatten-Ich im Dashboard-Zeitraum: Summen, Verstöße und Kurve nur über die Trades im Zeitraum */
  function shadowRange(d) {
    const SS = root.ShadowScreen; if (!SS) return null; const res = SS.evaluate(d.all); if (!res.active) return { active: false };
    const ids = new Set(d.closed.map(t => t.id)); const rows = res.trades.filter(r => ids.has(r.id)); const rowById = new Map(rows.map(r => [r.id, r]));
    const real = C.sum(rows.map(r => r.realPnl)), shadow = C.sum(rows.map(r => r.shadowPnl)); const violations = res.violations.filter(v => ids.has(v.tradeId)).length;
    let cr = 0, cs = 0; const curve = res.curve.filter(p => rowById.has(p.id)).map(p => { const r = rowById.get(p.id); cr += r.realPnl; cs += r.shadowPnl; return { date: p.date, real: cr, shadow: cs }; });
    return { active: true, real, shadow, cost: shadow - real, violations, n: rows.length, curve, view: SS.costView(shadow - real) };
  }
  const ampelDot = a => `<span class="prop-ampel ${a}" data-ampel="${a}"></span>`;
  function propActive() { const PS = root.PropScreen; if (!PS) return null; return PS.accounts().filter(a => a.status === 'active').map(a => ({ a, ev: PS.evalOf(a, true).ev, name: PS.accName(a) })); }
  function rpToday() { const RP = root.Ruhepunkt; const list = typeof S.ruhepunkt === 'function' ? S.ruhepunkt() : []; const k = C.dayKey(new Date()); const at = e => new Date(e.gestartet || e.createdAt); const today = list.filter(e => C.dayKey(at(e)) === k); return { RP, list, today, at, vor: today.find(e => e.typ === 'vor'), nach: today.find(e => e.typ === 'nach') }; }
  const MENTOR_Q = ['Wie war meine Woche?', 'Ich bin gerade im Tilt.', 'Was mache ich morgen besser?'];

  const FEATURE_TOP = [
    { typ: 'disziplin_kosten', name: 'Disziplin-Kosten', gruppe: 'bereiche', preview: 'num', desc: 'Schatten-Ich: was Regelbrüche dich im Zeitraum gekostet oder gebracht haben.', info: 'Schatten-Ich minus echt im gewählten Zeitraum. Dein Schatten-Ich handelt wie du, hält aber dein Regelwerk zu 100 % ein.',
      render(d, inst, e) { const r = shadowRange(d); if (!r) return tile(e, noData()); if (!r.active) return tile(e, '<span class="nodata">Keine Regel aktiv</span>', { foot: '<a href="#/shadow">Regelwerk festlegen</a>' }); if (!r.n) return tile(e, noData()); return tile(e, `<span class="${r.view.cls}">${r.view.text}</span>`, { n: r.violations === 1 ? '1 Verstoß' : `${fmt.int(r.violations)} Verstöße`, foot: r.view.foot }); } },
    { typ: 'replay_quote', feature: 'replay', name: 'Blind-Replay', gruppe: 'bereiche', preview: 'num', desc: 'Wie oft du im Blind-Replay richtig eingeschätzt hast, mit den letzten 20 Trades.', info: 'Anteil richtig eingeschätzter Trades im Blind-Replay (Gewinner genommen, Verlierer geskippt). Rechts die letzten 20.',
      render(d, inst, e) { const R = root.Replay; if (!R) return tile(e, noData()); const st = R.stats(S.replayHistory(), d.all); if (!st.n) return tile(e, '<span class="nodata">Noch keine Runde</span>', { foot: '<a href="#/replay">Jetzt üben</a>' }); return tile(e, fmt.pct(st.hitRate, 0), { n: st.n > 20 ? `Letzte 20: ${fmt.pct(st.recent, 0)}` : '', foot: `${fmt.int(st.correct)} von ${fmt.int(st.n)} richtig` }); } },
    { typ: 'prop_status', name: 'Prop-Konten', gruppe: 'bereiche', preview: 'num', desc: 'Aktive Prop-Konten mit Ampel: wie viele im grünen, gelben oder roten Bereich sind.', info: 'Aktive Prop-Konten und ihre Ampel aus dem Prop-Firm-Bereich. Rot heißt: wenig Puffer bis zur nächsten Regel oder Regel verletzt.',
      render(d, inst, e) { const list = propActive(); if (!list) return tile(e, noData()); if (!list.length) return tile(e, '<span class="nodata">Kein aktives Konto</span>', { foot: '<a href="#/prop/konten">Konto anlegen</a>' }); const cnt = { gruen: 0, gelb: 0, rot: 0 }; for (const x of list) { const k = x.ev.status === 'breached' ? 'rot' : x.ev.buffer.ampel; if (cnt[k] != null) cnt[k]++; } return tile(e, fmt.int(list.length), { n: 'aktiv', foot: `<span class="fw-ampels">${['gruen', 'gelb', 'rot'].map(k => `<span>${ampelDot(k)}${cnt[k]}</span>`).join('')}</span>` }); } },
  ];
  const FEATURE_MAIN = [
    { typ: 'schatten_ich', name: 'Schatten-Ich', gruppe: 'bereiche', preview: 'line', groesse: 'klein', desc: 'Echt gegen Schatten-Ich im Zeitraum: was Regelbrüche gekostet haben, mit Verlauf und Verstößen.', info: 'Dein Schatten-Ich handelt wie du, hält aber dein Regelwerk zu 100 % ein. Die Kurven zeigen echt und Schatten-Ich im gewählten Zeitraum.',
      render(d, inst, e) {
        const r = shadowRange(d); if (!r) return missing(e, 'Das Schatten-Ich');
        if (!r.active) return card(e, `<div class="fw-empty"><b>Noch keine Regel aktiv</b><span>Leg fest, was für dich gilt. Dann rechnet dein Schatten-Ich, was Regelbrüche kosten.</span><a class="btn sm" href="#/shadow">Regelwerk festlegen</a></div>`);
        if (!r.n) return card(e, emptyBox(300), { trailing: more('#/shadow') });
        U.chartData['dash-schatten'] = { points: r.curve.map(p => ({ date: p.date, v: { real: p.real, shadow: p.shadow } })), series: [{ key: 'real', label: 'Echt', unit: 'cur', color: 'var(--text-2)' }, { key: 'shadow', label: 'Schatten-Ich', unit: 'cur', color: 'var(--accent)' }], periodLabel: dt => fmt.dateTime(dt) };
        return card(e, `<div class="fw-stats"><div><span>Disziplin-Kosten</span><b class="${r.view.cls}">${r.view.text}</b></div><div><span>Echt</span><b>${U.pnl(r.real)}</b></div><div><span>Schatten-Ich</span><b>${U.pnl(r.shadow)}</b></div><div><span>Verstöße</span><b>${fmt.int(r.violations)}</b></div></div><div class="chart fw-chart" data-chart="lines" data-id="dash-schatten"></div>`, { trailing: more('#/shadow') });
      } },
    { typ: 'blind_replay', feature: 'replay', name: 'Blind-Replay', gruppe: 'bereiche', preview: 'bars', groesse: 'klein', desc: 'Deine Trefferquote im Blind-Replay, die letzten Runden und der Start einer neuen Runde.', info: 'Du siehst alte Trades ohne Ergebnis und entscheidest: nehmen oder skippen. Richtig ist, Gewinner zu nehmen und Verlierer zu skippen.',
      render(d, inst, e) {
        const R = root.Replay; if (!R) return missing(e, 'Das Blind-Replay');
        const st = R.stats(S.replayHistory(), d.all);
        /* derselbe Start wie auf der Seite (Hick's 12): nie ein toter Knopf, dazu ein Satz */
        const cta = root.ReplayScreen ? root.ReplayScreen.startCta(d.all, 'fw-go', 'replay-go') : { ready: 0, btn: '', lead: '', note: '' }; const go = cta.btn;
        if (!st.n) return card(e, `<div class="fw-empty"><b>Trainiere dein Bauchgefühl</b><span>${cta.lead}</span>${go}${cta.note ? `<span class="small muted">${cta.note}</span>` : ''}</div>`, { trailing: more('#/replay') });
        const tl = st.timeline.slice(-14);
        const rounds = tl.length >= 2 ? `<div class="fw-rounds-wrap"><div class="rh-rounds fw-rounds" aria-label="Trefferquote je Runde">${tl.map((x, i) => `<i class="${i === tl.length - 1 ? 'cur' : ''}" style="height:${Math.max(4, Math.round((x.hitRate || 0) * 100))}%" data-tip="Runde ${st.timeline.length - tl.length + i + 1}: ${fmt.pct(x.hitRate, 0)}"></i>`).join('')}</div><div class="rh-rounds-l">Runden</div></div>` : `<div class="fw-rounds-empty">Ab zwei Runden siehst du hier deinen Verlauf.</div>`;
        const down = st.recent != null && st.hitRate - st.recent >= 0.03, up = st.recent != null && st.recent - st.hitRate >= 0.03;
        return card(e, `<div class="fw-replay"><div class="fw-hero"><span class="fw-lbl">Richtig eingeschätzt</span><b class="fw-big">${fmt.pct(st.hitRate, 0)}</b><span class="fw-sub">${fmt.int(st.correct)} von ${U.count(st.n, 'Trade', 'Trades')}</span></div>${rounds}</div>
          <div class="fw-facts">${st.n > 20 ? `<span>Letzte 20 <b class="${down ? 'neg' : up ? 'pos' : ''}">${down ? '↓ ' : up ? '↑ ' : ''}${fmt.pct(st.recent, 0)}</b></span>` : ''}<span>Runden <b>${fmt.int(st.timeline.length)}</b></span><span>Zum Üben <b>${fmt.int(st.boxes[1] || 0)}</b></span></div>${go}`, { trailing: more('#/replay') });
      } },
    { typ: 'prop_konten', name: 'Prop-Konten', gruppe: 'bereiche', preview: 'table', groesse: 'klein', desc: 'Deine aktiven Prop-Konten mit Ampel, Balance und Puffer bis zur nächsten Regel.', info: 'Aus dem Prop-Firm-Bereich: je aktivem Konto die Ampel, die Balance und wie viel Spielraum bis Daily Loss oder Drawdown bleibt.',
      render(d, inst, e) {
        const list = propActive(); if (!list) return missing(e, 'Der Prop-Firm-Bereich');
        if (!list.length) return card(e, `<div class="fw-empty"><b>Kein aktives Prop-Konto</b><span>Leg ein Konto an, dann siehst du hier Ampel, Balance und Puffer.</span><a class="btn sm" href="#/prop/konten">Konto anlegen</a></div>`, { trailing: more('#/prop') });
        const order = { rot: 0, gelb: 1, gruen: 2, aus: 3 }; list.sort((x, y) => (order[x.ev.status === 'breached' ? 'rot' : x.ev.buffer.ampel] || 0) - (order[y.ev.status === 'breached' ? 'rot' : y.ev.buffer.ampel] || 0));
        const shown = list.slice(0, 4);
        const rows = shown.map(({ a, ev, name }) => { const b = ev.buffer; const amp = ev.status === 'breached' ? 'rot' : b.ampel; const f = b.ratio == null ? null : C.clamp(b.ratio, 0, 1); const col = amp === 'rot' ? 'var(--loss)' : amp === 'gelb' ? 'var(--warn)' : 'var(--profit)';
          return `<a class="fw-acc" href="#/prop/cockpit">${ampelDot(amp)}<span class="fw-acc-n"><b>${esc(name)}</b><span>${ev.status === 'breached' ? '<span class="neg">Regel verletzt</span>' : b.stops != null ? `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` : f != null ? `${fmt.pct(f, 0)} Puffer` : 'keine Verlustregel'}</span></span><span class="fw-acc-v">${fmt.balance(ev.balance, { currency: a.currency })}</span><span class="fw-acc-bar"><i style="width:${f == null ? 0 : Math.round(f * 100)}%;background:${col}"></i></span></a>`; }).join('');
        return card(e, `<div class="fw-accs">${rows}</div>${list.length > shown.length ? `<a class="small muted fw-more" href="#/prop">+ ${list.length - shown.length} weitere</a>` : ''}`, { trailing: more('#/prop') });
      } },
    { typ: 'ruhepunkt', name: 'Ruhepunkt', gruppe: 'bereiche', preview: 'progress', groesse: 'klein', desc: 'Heute schon im Ruhepunkt gewesen? Vor und nach dem Trading mit einem Klick starten, Akut-Reset inklusive.', info: 'Kurze geführte Sessions aus dem Ruhepunkt: vor dem Trading (Ampel und Limits), nach dem Trading (abschalten) und ein Akut-Reset, wenn es zu viel wird.',
      render(d, inst, e) {
        const t = rpToday(); if (!t.RP) return missing(e, 'Der Ruhepunkt');
        const F = t.RP.FLOWS, AM = t.RP.AMPEL || {};
        const row = (key, entry, extra) => `<div class="fw-rp ${entry ? 'done' : ''}"><span class="fw-rp-i">${entry ? I.check : ''}</span><span class="fw-rp-t"><b>${esc(F[key] ? F[key].name : key)}</b><span>${entry ? `<span>heute ${fmt.time(t.at(entry))}</span>${extra || ''}` : 'heute noch offen'}</span></span>${entry ? '' : `<button type="button" class="btn sm" data-action="rp-open" data-flow="${key}">Starten</button>`}</div>`;
        const amp = t.vor && t.vor.ampel && AM[t.vor.ampel] ? ` <span>· Ampel ${esc(AM[t.vor.ampel].label)}</span>` : '';
        const last = t.list[0]; const lastTxt = last && !t.today.length ? `<div class="small muted fw-rp-last"><span>Zuletzt:</span> <b>${esc(F[last.typ] ? F[last.typ].name : last.typ)}</b> <span>${fmt.dateTime(t.at(last))}</span></div>` : '';
        return card(e, `<div class="fw-rps">${row('vor', t.vor, amp)}${row('nach', t.nach)}</div>${lastTxt}<button type="button" class="btn ghost fw-reset" data-action="rp-open" data-flow="akut">${esc(F.akut ? F.akut.name : 'Akut-Reset')}<span class="small muted">wenn es gerade zu viel wird</span></button>`, { trailing: more('#/ruhepunkt') });
      } },
    { typ: 'mentor', name: 'Mentor', gruppe: 'bereiche', preview: 'table', groesse: 'klein', desc: 'Schnell eine Frage an deinen Trading-Psychologie-Mentor, direkt vom Dashboard.', info: 'Deine Frage landet im Mentor. Er kennt deine letzten 20 Trades und deinen heutigen Check-in. Abschicken kannst du dort.',
      render(d, inst, e) {
        /* Der Mentor läuft über den eigenen Server; ohne Adresse erst einrichten (Schlüssel bleibt auf dem Server) */
        const mc = S.settings.mentor || {}; if (!/^https?:\/\//.test(String(mc.url || '').trim())) return card(e, `<div class="fw-empty"><b>Mentor noch nicht eingerichtet</b><span>Der Mentor läuft über deinen eigenen Server. Einmal einrichten, dann fragst du ihn direkt von hier.</span><a class="btn sm" href="#/mentor">Einrichten</a></div>`, { trailing: more('#/mentor') });
        return card(e, `<form class="fw-mentor" data-action="mentor-ask"><textarea class="input" name="q" rows="3" maxlength="4000" placeholder="Was beschäftigt dich gerade?"></textarea><button type="submit" class="btn">${I.chevR} Zum Mentor</button></form>
          <div class="fw-chips">${MENTOR_Q.map(q => `<button type="button" class="chip-btn" data-action="mentor-ask" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>`, { trailing: more('#/mentor') });
      } },
  ];
  TOP.push(...FEATURE_TOP); MAIN.push(...FEATURE_MAIN);

  const settingsBtn = () => `<button type="button" class="btn ghost icon sm w-cfg" data-action="dash-w-settings" title="Einstellungen" aria-label="Widget-Einstellungen">${I.settings}</button>`;

  const ALL = {}; for (const e of TOP) ALL[e.typ] = Object.assign(e, { area: 'oben' }); for (const e of MAIN) ALL[e.typ] = Object.assign(e, { area: 'unten' });

  const visible = e => !e.feature || !root.App || root.App.on(e.feature);
  root.Widgets = {
    SIZES, MAX_TOP, REPORT_GROUPS, REPORT_ALL, REPORT_COLORS, REPORT_DEFAULT, reportConfig, reportPanelHTML: reportPanel, ALL,
    /* Widgets zurückgestellter Bereiche (feature: 'replay' …) tauchen weder in der Bibliothek noch auf dem Dashboard auf */
    list(area) { return (area === 'oben' ? TOP : MAIN).filter(visible); },
    get(typ) { const e = ALL[typ]; return e && visible(e) ? e : null; },
    data: makeData, preview, calendarHTML,
    render(inst, d, App) { const e = ALL[inst.typ]; if (e && !visible(e)) return null; if (!e) return U.card('Unbekanntes Widget', `<div class="small muted">Der Widget-Typ „${esc(inst.typ)}“ ist nicht bekannt.</div>`); try { return e.render(d, inst, e, App); } catch (err) { console.warn('Widget', inst.typ, err); return U.card(e.name, `<div class="small muted">Dieses Widget konnte nicht berechnet werden.</div>`, { info: e.info }); } },
  };
})(typeof self !== 'undefined' ? self : this);
