/* Dashboard-Widgets: zentrale Registry, Berechnungen, Diagramme und Bausteine.
   Neues Widget = ein Eintrag in TOP (oberer Bereich) oder MAIN (unterer Bereich): typ, name, desc, info, groesse, preview, render(d, inst). */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt;
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
  const emptyBox = (h = 220) => `<div class="empty" style="min-height:${h}px">${I.stats}<b>${NO_DATA}</b><span class="small">Logge Trades oder ändere den Zeitraum.</span></div>`;
  const tile = (e, value, o = {}) => U.tile(e.name, value, Object.assign({ info: e.info }, o));
  const card = (e, body, o = {}) => U.card(e.name, body, Object.assign({ info: e.info }, o));
  const pctText = f => (f < 0 ? '−' : '') + Math.abs(f * 100).toFixed(1).replace('.', ',') + ' %';
  const streakPills = (maxW, maxL, unit) => `<span class="pills col">${U.pill(`${maxL}<span class="u"> ${unit}</span>`, 'loss')}${U.pill(`${maxW}<span class="u"> ${unit}</span>`, 'win')}</span>`;
  const streakRing = (n, kind) => `<span class="streak-ring ${kind === 'loss' ? 'loss' : 'win'}">${n}</span>`;
  const durLabel = min => { const sec = Math.round(min * 60); if (sec < 60) return `${sec}s`; const m = Math.floor(sec / 60), sr = sec % 60; if (m < 60) return sr ? `${m}m:${String(sr).padStart(2, '0')}s` : `${m}m`; const h = Math.floor(m / 60), mr = m % 60; if (h < 24) return mr ? `${h}h:${String(mr).padStart(2, '0')}m` : `${h}h`; const dd = Math.floor(h / 24), hr = h % 24; return hr ? `${dd}d:${hr}h` : `${dd}d`; };
  const curCompact = v => { const a = Math.abs(v); const sym = fmt.cur(0, { compact: true }).replace(/[\d.,\s\u00a0−-]/g, ''); const num = a >= 10000 ? Math.round(a / 1000) + 'k' : a >= 1000 ? (a / 1000).toFixed(1).replace('.', ',').replace(',0', '') + 'k' : String(Math.round(a)); return (v < -C.EPS ? '−' : v > C.EPS ? '+' : '') + num + '\u00a0' + sym; };
  const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;
  const curShort = v => { const a = Math.abs(v); const s = a >= 1000 ? (a / 1000).toFixed(a >= 10000 ? 0 : 1).replace('.', ',').replace(',0', '') + 'k' : String(Math.round(a)); return (v < 0 ? '−' : '') + s; };
  const xTicks = (n, iw) => { const k = Math.max(2, Math.min(n, Math.floor(iw / 95) + 1)); if (n <= k) return Array.from({ length: n }, (_, i) => i); return Array.from({ length: k }, (_, i) => Math.round(i / (k - 1) * (n - 1))); };
  const gid = () => 'g' + Math.random().toString(36).slice(2, 8);
  const chartEmpty = el => { el.innerHTML = `<div class="empty" style="min-height:0;height:100%">${I.stats}<span class="small">${NO_DATA}</span></div>`; };
  function bindHover(el, svg, n, xf, yf, tipFn) {
    const hover = svg.querySelector('.hover'), hit = svg.querySelector('.hit'); if (!hover || !hit) return;
    const show = e => { const r = hit.getBoundingClientRect(); const cx = e.touches ? e.touches[0].clientX : e.clientX; const i = C.clamp(Math.round((cx - r.left) / r.width * (n - 1)), 0, n - 1); hover.classList.add('on'); const x = xf(i); const ln = hover.querySelector('line'); ln.setAttribute('x1', x); ln.setAttribute('x2', x); const c = hover.querySelector('circle'); if (c) { const y = yf(i); if (y == null) c.style.display = 'none'; else { c.style.display = ''; c.setAttribute('cx', x); c.setAttribute('cy', y); } } U.tipAt(el, x, yf(i) == null ? 20 : yf(i), tipFn(i)); };
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
    const n = pts.length; const x = i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw; const y = (u, v) => mt + (scale[u].y1 - v) / (scale[u].y1 - scale[u].y0 || 1) * ih;
    const path = s => { let out = '', open = false; pts.forEach((p, i) => { const v = p.v[s.key]; if (v == null || !isFinite(v)) { open = false; return; } out += `${open ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.unit, v).toFixed(1)}`; open = true; }); return out; };
    const bars = series.filter(s => s.type === 'bar'); const bw = Math.max(2, Math.min(14, iw / n * 0.6 / Math.max(1, bars.length)));
    const xt = U.xTicks(n, iw); const dots = n <= 120;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${U.axisLeft(scale[u0].ticks, v => y(u0, v), ml, W, mr, v => unitFmt(u0, v, true))}
      ${u1 ? `<g class="grid">${scale[u1].ticks.map(t => `<text x="${W - mr + 8}" y="${y(u1, t) + 3.5}">${unitFmt(u1, t, true)}</text>`).join('')}</g>` : ''}
      ${bars.map((s, bi) => pts.map((p, i) => { const v = p.v[s.key]; if (v == null || !isFinite(v)) return ''; const zero = y(s.unit, Math.max(scale[s.unit].y0, Math.min(scale[s.unit].y1, 0))); const yy = y(s.unit, v); return `<rect x="${(x(i) - bw * bars.length / 2 + bi * bw).toFixed(1)}" y="${Math.min(yy, zero).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1, Math.abs(yy - zero)).toFixed(1)}" rx="2" fill="${s.color}" fill-opacity=".8"/>`; }).join('')).join('')}
      ${series.filter(s => s.type !== 'bar').map(s => `<path d="${path(s)}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${dots ? pts.map((p, i) => { const v = p.v[s.key]; return v == null || !isFinite(v) ? '' : `<circle cx="${x(i).toFixed(1)}" cy="${y(s.unit, v).toFixed(1)}" r="3" fill="${s.color}"/>`; }).join('') : ''}`).join('')}
      ${xt.map(i => `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${fmt.dateShort(pts[i].date)}</text>`).join('')}
      <g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
    bindHover(el, el.firstElementChild, n, x, () => null, i => `<b>${d.periodLabel ? d.periodLabel(pts[i].date) : fmt.weekdayLong(pts[i].date)}</b>${series.map(s => `<br><i class="dot" style="background:${s.color}"></i>${esc(s.label)}: ${unitFmt(s.unit, pts[i].v[s.key])}`).join('')}`);
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
      ${pts.map(p => `<circle cx="${x(p.x).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="4" fill="var(--${p.y > C.EPS ? 'profit' : p.y < -C.EPS ? 'loss' : 'info'})" fill-opacity=".9" data-tip="${esc(p.tip)}"></circle>`).join('')}</svg>`;
  };
  /* Säulen je Handelstag */
  U.drawers.dbars = function (el, d, W, H) {
    const days = d && d.days || []; if (!days.length) { chartEmpty(el); return; }
    const vals = days.map(x => x.pnl); const ticks = U.niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 6); const y0 = Math.min(ticks[0], ...vals, 0), y1 = Math.max(ticks[ticks.length - 1], ...vals, 0);
    const ml = U.axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 30; const iw = W - ml - mr, ih = H - mt - mb;
    const n = days.length; const gap = iw / n; const bw = Math.max(2, Math.min(18, gap * 0.62)); const x = i => ml + i * gap + gap / 2, y = v => mt + (y1 - v) / (y1 - y0 || 1) * ih; const xt = U.xTicks(n, iw);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${U.axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>
      ${days.map((p, i) => `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${Math.min(y(p.pnl), y(0)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1.5, Math.abs(y(p.pnl) - y(0))).toFixed(1)}" rx="2" fill="var(--${p.pnl >= 0 ? 'profit' : 'loss'})" fill-opacity=".85" data-tip="<b>${fmt.weekdayLong(p.day)}</b><br>${fmt.cur(p.pnl, { signed: true })} · ${p.n} Trade${p.n === 1 ? '' : 's'}"></rect>`).join('')}
      ${xt.map(i => `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${fmt.dateShort(days[i].day)}</text>`).join('')}</svg>`;
  };
  /* Drawdown-Fläche */
  U.drawers.dd = function (el, d, W, H) {
    const pts = d && d.points || []; if (!pts.length) { chartEmpty(el); return; }
    const vals = pts.map(p => p.dd); const ticks = U.niceTicks(Math.min(...vals, -1), 0, 6); const y0 = Math.min(ticks[0], ...vals), y1 = 0; const n = pts.length;
    const ml = U.axisWidth(ticks.map(fmt.axisCur)), mr = 12, mt = 12, mb = 30; const iw = W - ml - mr, ih = H - mt - mb;
    const x = i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw, y = v => mt + (y1 - v) / (y1 - y0 || 1) * ih; const g = gid();
    const line = n === 1 ? `M${x(0) - 1},${y(pts[0].dd)}L${x(0) + 1},${y(pts[0].dd)}` : 'M' + pts.map((p, i) => `${x(i).toFixed(1)},${y(p.dd).toFixed(1)}`).join('L'); const xt = U.xTicks(n, iw);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--loss)" stop-opacity=".05"/><stop offset="1" stop-color="var(--loss)" stop-opacity=".45"/></linearGradient></defs>${U.axisLeft(ticks, y, ml, W, mr, fmt.axisCur)}
      <path d="${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z" fill="url(#${g})"/><path d="${line}" fill="none" stroke="var(--loss)" stroke-width="2" stroke-linejoin="round"/>
      ${xt.map(i => `<text x="${x(i)}" y="${H - 8}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${fmt.dateShort(pts[i].date)}</text>`).join('')}
      <g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/><circle r="4.5" fill="var(--loss)" stroke="var(--surface)" stroke-width="2"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
    bindHover(el, el.firstElementChild, n, x, i => y(pts[i].dd), i => `<b>${fmt.weekdayLong(pts[i].date)}</b><br>Drawdown: ${U.pnl(pts[i].dd)}<br><span class="muted">Kumuliert: ${fmt.cur(pts[i].cum, { signed: true })}</span>`);
  };

  /* ---------- Kalender-Bausteine ---------- */
  function calendarHTML(days, year, month, o = {}) {
    const weeks = C.calendarMonth(days, year, month); const today = C.dayKey(new Date()); const ext = !!o.weeks, mini = !!o.mini;
    let html = C.WEEKDAYS.map(w => `<div class="wd">${w}</div>`).join('') + (ext ? '<div class="wd wk">Woche</div>' : '');
    for (const wk of weeks) {
      html += wk.cells.map(c => { if (!c) return '<div class="d pad"></div>'; const e = c.entry; const k = e ? (e.pnl > C.EPS ? 'win' : e.pnl < -C.EPS ? 'loss' : 'be') : ''; return `<div class="d ${k} ${c.key === today ? 'today' : ''}" data-action="day" data-day="${c.key}" role="button" tabindex="0" ${mini && e ? `data-tip="<b>${fmt.dateFull(c.date)}</b><br>${fmt.cur(e.pnl, { signed: true })} · ${e.n} Trade${e.n === 1 ? '' : 's'}"` : ''}><span class="n">${c.date.getDate()}</span>${e && !mini ? `<span class="p ${U.cls(e.pnl)}">${fmt.cur(e.pnl, { signed: true, compact: Math.abs(e.pnl) >= 1000 })}</span><span class="c">${e.n} Trade${e.n === 1 ? '' : 's'}</span>` : ''}</div>`; }).join('');
      if (ext) html += `<div class="w"><span class="t">Woche ${wk.index}</span>${wk.days ? `<span class="p ${U.cls(wk.pnl)}">${fmt.cur(wk.pnl, { signed: true, compact: Math.abs(wk.pnl) >= 1000 })}</span><span class="days">${wk.days} Tag${wk.days === 1 ? '' : 'e'}</span>` : '<span class="p muted">—</span>'}</div>`;
    }
    return `<div class="cal ${ext ? 'ext' : ''} ${mini ? 'mini' : ''}">${html}</div>`;
  }
  const monthSub = (days, m) => { const inM = days.filter(d => d.day.getFullYear() === m.getFullYear() && d.day.getMonth() === m.getMonth()); const total = C.sum(inM.map(d => d.pnl)); return inM.length ? `<b class="${U.cls(total)}">${fmt.cur(total, { signed: true })}</b> · ${inM.length} Handelstage` : '<span class="muted">Keine Trades</span>'; };
  const calNav = (m, prevA, nextA, todayA, extra = '') => `<div class="cal-nav"><button type="button" class="btn round" data-action="${prevA}" aria-label="Voriger Monat">${I.chevL}</button><h3 style="font-size:15px;min-width:140px;text-align:center">${fmt.monthYear(m)}</h3><button type="button" class="btn round" data-action="${nextA}" aria-label="Nächster Monat">${I.chevR}</button>${todayA ? `<button type="button" class="btn sm hide-m" data-action="${todayA}">Heute</button>` : ''}${extra}</div>`;
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
  const preview = kind => `<svg viewBox="0 0 100 64" width="96" height="62" aria-hidden="true">${PV[kind] || PV.num}</svg>`;

  /* ---------- Oberer Bereich: Kennzahl-Kacheln ---------- */
  const TOP = [
    { typ: 'netto_pnl', name: 'Netto P&L', preview: 'num', desc: 'Realisierter Netto-Gewinn oder -Verlust aller geschlossenen Trades, mit Anzahl der Trades.', info: 'Summe der Netto-Ergebnisse (nach Gebühren) aller geschlossenen Trades im gewählten Zeitraum. Rechts die Anzahl der Trades.',
      render(d, inst, e) { return tile(e, d.empty ? noData() : U.pnl(d.s.total, '', { signed: false }), { n: d.empty ? null : `${d.s.n} Trade${d.s.n === 1 ? '' : 's'}`, foot: d.empty ? '' : `Ø ${fmt.cur(d.s.expectancy, { signed: true })} pro Trade` }); } },
    { typ: 'kontostand_pnl', name: 'Kontostand & P&L', preview: 'num', desc: 'Aktueller Kontostand (Startkapital plus Netto-P&L) und Gesamt-P&L.', info: 'Kontogröße aus den Einstellungen plus Netto-P&L des Zeitraums. Darunter der Gesamt-P&L.',
      render(d, inst, e) { return tile(e, d.empty ? noData() : fmt.cur(d.account + d.s.total), { foot: d.empty ? '' : `P&L: ${U.pnl(d.s.total)}` }); } },
    { typ: 'trade_trefferquote', name: 'Trade-Trefferquote', preview: 'gauge', desc: 'Anteil der Gewinn-Trades an allen Trades, als Halbkreis mit Gewinnern, Breakeven und Verlierern.', info: 'Gewinn-Trades geteilt durch alle geschlossenen Trades. Break-even-Trades zählen nicht als Gewinn.',
      render(d, inst, e) { const s = d.s; return tile(e, d.empty ? noData() : fmt.pct(s.winRate, 1), d.empty ? {} : { gauge: `<div class="gauge-stack">${U.semiGauge([{ v: s.wins, c: 'profit' }, { v: s.be, c: 'be' }, { v: s.losses, c: 'loss' }], '')}<span class="pills">${U.pill(s.wins, 'win')}${U.pill(s.be, 'be')}${U.pill(s.losses, 'loss')}</span></div>` }); } },
    { typ: 'profit_faktor', name: 'Profit-Faktor', preview: 'donut', desc: 'Summe aller Gewinne geteilt durch Summe aller Verluste, als Ring-Diagramm.', info: 'Bruttogewinn geteilt durch Bruttoverlust. Über 1,5 gilt als gut, unter 1 ist das Konto langfristig im Minus.',
      render(d, inst, e) { const s = d.s; return tile(e, d.empty ? noData() : fmt.factor(s.pf), d.empty ? {} : { gauge: `<div class="gauge-stack">${U.donut([{ v: s.gp, c: 'profit' }, { v: -s.gl, c: 'loss' }], 58, 8)}<span class="small muted nowrap"><span class="pos">${fmt.cur(s.gp, { compact: true })}</span> / <span class="neg">${fmt.cur(s.gl, { compact: true })}</span></span></div>` }); } },
    { typ: 'tages_trefferquote', name: 'Tages-Trefferquote', preview: 'gauge', desc: 'Gewinntage geteilt durch alle Handelstage.', info: 'Anteil der Handelstage mit positivem Netto-Ergebnis an allen Handelstagen im Zeitraum.',
      render(d, inst, e) { const ds = d.ds; const be = ds.days - ds.winDays - ds.lossDays; return tile(e, d.empty ? noData() : fmt.pct(ds.dayWinRate, 1), d.empty ? {} : { gauge: `<div class="gauge-stack">${U.semiGauge([{ v: ds.winDays, c: 'profit' }, { v: be, c: 'be' }, { v: ds.lossDays, c: 'loss' }], '')}<span class="pills">${U.pill(ds.winDays, 'win')}${U.pill(be, 'be')}${U.pill(ds.lossDays, 'loss')}</span></div>` }); } },
    { typ: 'avg_gewinn_verlust', name: 'Ø Gewinn / Ø Verlust', preview: 'wl', desc: 'Durchschnittlicher Gewinn und Verlust pro Trade als Balken im Verhältnis zueinander.', info: 'Durchschnittlicher Gewinn-Trade geteilt durch durchschnittlichen Verlust-Trade. Der Balken zeigt das Verhältnis.',
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
    { typ: 'score', name: 'Gesamt-Score', preview: 'radar', groesse: 'klein', desc: 'Punktzahl von 0 bis 100 aus Trefferquote, Profit-Faktor, Gewinn/Verlust-Verhältnis, Drawdown und Konstanz, als Netz-Diagramm.', info: 'Sechs Achsen von 0 bis 100: Trefferquote, Profit-Faktor, Gewinn/Verlust-Verhältnis, Konsistenz, Regeltreue und Drawdown. Der Score ist der Mittelwert.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox()); const sc = d.score; return card(e, `${U.radar(sc.axes, 230)}<div class="row" style="gap:16px;margin-top:8px;align-items:center"><div><div class="caption">Dein Score</div><div class="score-big" style="color:${U.scoreColor(sc.overall)}">${sc.overall}</div></div><div class="grow score-scale" style="margin:0 8px 14px"><div class="track"></div><div class="knob" style="left:${sc.overall}%"></div><div class="lbls"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div></div></div>`); } },
    { typ: 'kum_pnl', name: 'Kumulierter Tages-P&L', preview: 'area', groesse: 'klein', desc: 'Wie sich der Netto-P&L über die Zeit aufsummiert, als Flächendiagramm.', info: 'Kumuliertes Netto-Tagesergebnis im Zeitraum. Grün über Null, rot darunter.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-kum_pnl'] = { days: d.days, bars: false }; return card(e, `<div class="chart h280" data-chart="pnl" data-id="dash-kum_pnl"></div>`); } },
    { typ: 'verlauf_trefferquote', name: 'Trefferquote – Ø Gewinn – Ø Verlust', preview: 'line', groesse: 'klein', desc: 'Wie sich Trefferquote, Ø Gewinn und Ø Verlust über die Handelstage entwickeln.', info: 'Laufende Werte bis zum jeweiligen Handelstag: Trefferquote (rechte Achse), Ø Gewinn und Ø Verlust (linke Achse).',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); U.chartData['dash-verlauf'] = { points: d.running.map(r => ({ date: r.date, v: { avgWin: r.avgWin, avgLoss: r.avgLoss, winRate: r.winRate } })), series: [{ key: 'avgWin', label: 'Ø Gewinn', unit: 'cur', color: 'var(--profit)' }, { key: 'avgLoss', label: 'Ø Verlust', unit: 'cur', color: 'var(--loss)' }, { key: 'winRate', label: 'Trefferquote', unit: 'pct', color: 'var(--be)' }] }; return card(e, `<div class="chart h280" data-chart="lines" data-id="dash-verlauf"></div><div class="legend rep"><span><i style="background:var(--profit)"></i>Ø Gewinn</span><span><i style="background:var(--loss)"></i>Ø Verlust</span><span><i style="background:var(--be)"></i>Trefferquote</span></div>`); } },
    { typ: 'perf_uhrzeit', name: 'Performance nach Uhrzeit', preview: 'scatter', groesse: 'klein', desc: 'Punktdiagramm: Uhrzeit des Einstiegs oder Ausstiegs gegen P&L.', info: 'Jeder Punkt ist ein geschlossener Trade: waagerecht die Uhrzeit (Einstieg oder Ausstieg, wählbar über das Zahnrad), senkrecht das Netto-Ergebnis. Blau sind Break-even-Trades.',
      render(d, inst, e) {
        const exit = (inst.einstellungen || {}).zeit === 'exit'; const gear = `<div class="popwrap"><button type="button" class="btn ghost icon sm w-cfg" data-pop="uhrzeit" title="Einstellungen" aria-label="Uhrzeit wählen">${I.settings}</button><div class="popover" id="pop-uhrzeit"><button type="button" class="item" data-action="dash-w-opt" data-key="zeit" data-value="entry" aria-checked="${!exit}"><b>Einstiegszeit</b></button><button type="button" class="item" data-action="dash-w-opt" data-key="zeit" data-value="exit" aria-checked="${exit}"><b>Ausstiegszeit</b></button></div></div>`;
        if (d.empty) return card(e, emptyBox(280), { trailing: gear });
        const pts = d.closed.map(t => { const dt = exit ? t.close : t.open; return { x: dt.getHours() * 60 + dt.getMinutes(), y: t.pnl, tip: `<b>${esc(t.symbol)}</b> ${exit ? 'Ausstieg' : 'Einstieg'} ${fmt.time(dt)}<br>${fmt.cur(t.pnl, { signed: true })}` }; });
        const xs = pts.map(p => p.x); const lo = Math.min(...xs), hi = Math.max(...xs); const span = Math.max(30, hi - lo); const x0 = Math.max(0, lo - span * 0.04), x1 = Math.min(1440, hi + span * 0.04);
        const k = 9; const ticks = Array.from({ length: k }, (_, i) => { const v = x0 + (x1 - x0) * i / (k - 1); return { v, label: hhmm(v) }; });
        U.chartData['dash-uhrzeit'] = { points: pts, x0, x1, xTicks: ticks }; return card(e, `<div class="chart h280" data-chart="scatter" data-id="dash-uhrzeit"></div>`, { trailing: gear });
      } },
    { typ: 'perf_haltedauer', name: 'Performance nach Haltedauer', preview: 'scatter', groesse: 'klein', desc: 'Punktdiagramm: Haltedauer gegen P&L.', info: 'Jeder Punkt ist ein geschlossener Trade: waagerecht die Haltedauer (logarithmisch), senkrecht das Netto-Ergebnis. Blau sind Break-even-Trades.',
      render(d, inst, e) {
        if (d.empty) return card(e, emptyBox(280));
        const pts = d.closed.filter(t => t.holdingMin != null).map(t => ({ x: Math.log10(t.holdingMin * 60 + 1), y: t.pnl, tip: `<b>${esc(t.symbol)}</b> ${durLabel(t.holdingMin)}<br>${fmt.cur(t.pnl, { signed: true })}` }));
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
        const tab = App.state.recentTab || 'recent'; const open = d.all.filter(t => !t.closed).sort((a, b) => b.open - a.open); const recent = d.all.filter(t => t.closed).sort((a, b) => b.close - a.close).slice(0, 60); const rows = tab === 'open' ? open : recent;
        const table = rows.length ? `<div class="tbl-wrap inset recent-wrap"><table class="tbl compact" style="min-width:0"><thead><tr><th>${tab === 'open' ? 'Eröffnet' : 'Geschlossen'}</th><th>Symbol</th><th class="r">${tab === 'open' ? 'Risiko' : 'Netto-P&L'}</th></tr></thead><tbody>${rows.map((t, i) => `<tr class="link ${i >= 8 ? 'hidden' : ''}" data-action="trade" data-id="${t.id}"><td>${fmt.dateFull(tab === 'open' ? t.open : t.close)}</td><td class="sym">${esc(t.symbol)} ${U.badge(t.direction)}</td><td class="r">${tab === 'open' ? (t.risk ? fmt.cur(t.risk) : '—') : U.pnl(t.pnl)}</td></tr>`).join('')}</tbody></table></div>` : `<div class="empty recent-wrap" style="min-height:160px">${I.tradelog}<b>${tab === 'open' ? 'Keine offenen Positionen' : NO_DATA}</b></div>`;
        return U.card(e.name, `<div class="tabs sm" style="margin-bottom:12px">${[['recent', 'Letzte Trades'], ['open', `Offene Positionen${open.length ? ` (${open.length})` : ''}`]].map(([k, l]) => `<button type="button" data-action="recent-tab" data-value="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>`, { info: e.info, cls: 'recent-card' });
      } },
    { typ: 'kalender', name: 'Kalender', preview: 'calendar', groesse: 'mittel', hoch: true, desc: 'Monatsansicht: Tage grün, rot oder grau mit P&L und Anzahl Trades. Pfeile zum Monatswechsel.', info: 'Ein Feld pro Tag mit Netto-Ergebnis und Anzahl Trades: grün bei Gewinn, rot bei Verlust, grau bei Break-even. Klick öffnet die Tagesansicht.',
      render(d, inst, e, App) { const now = new Date(); const m = App.state.calMonth || new Date(now.getFullYear(), now.getMonth(), 1); return U.card(e.name, `<div class="row between" style="margin-bottom:12px">${calNav(m, 'cal-prev', 'cal-next', 'cal-today')}<div class="small muted">${monthSub(d.daysAll, m)}</div></div>${calendarHTML(d.daysAll, m.getFullYear(), m.getMonth())}`, { info: e.info }); } },
    { typ: 'kontostand', name: 'Kontostand-Verlauf', preview: 'line', groesse: 'klein', desc: 'Linie: Startkapital plus Netto-P&L über die Zeit.', info: 'Kontogröße aus den Einstellungen plus kumuliertes Netto-Ergebnis je Handelstag. Die gestrichelte Linie ist das Startkapital.',
      render(d, inst, e) { if (d.empty) return card(e, emptyBox(280)); let cum = 0; const pts = d.days.map(x => { cum += x.pnl; return { date: x.day, v: d.account + cum, pnl: x.pnl }; }); U.chartData['dash-kontostand'] = { points: pts, baseline: d.account }; return card(e, `<div class="legend top"><span><i style="background:var(--accent)"></i>Kontostand</span><span><i style="background:var(--loss)"></i>Startkapital</span></div><div class="chart h280" data-chart="line" data-id="dash-kontostand"></div>`); } },
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
        return card(e, `<div class="row between" style="margin-bottom:6px"><div class="big-stat" style="font-size:30px;margin:0"><span class="${U.cls(pnl)}">${fmt.cur(pnl, { signed: true })}</span></div>${status}</div>${ziel ? bar('Gewinnziel', goalF, `${fmt.pct(goalF)} von ${fmt.cur(ziel, { compact: true })}`, 'var(--profit)') : ''}${maxV ? bar('Maximaler Verlust', lossF, `${fmt.cur(lossUsed)} von ${fmt.cur(maxV, { compact: true })}`, 'var(--loss)') : ''}${tagV ? bar('Schlechtester Tag', C.clamp(-worstDay / tagV, 0, 1), `${fmt.cur(worstDay)} (Limit ${fmt.cur(-tagV)})`, 'var(--warn)') : ''}${list.length ? `<div class="small muted" style="margin-top:8px">${list.length} Trades · ${days.length} Handelstage</div>` : `<div class="small muted" style="margin-top:8px">${NO_DATA}</div>`}`, { trailing: settingsBtn() });
      } },
    { typ: 'mini_kalender', name: 'Mini-Kalender', preview: 'calendar', groesse: 'klein', desc: 'Kompakte Monatsansicht, nur grün und rot ohne Zahlen.', info: 'Kompakter Monatsblick: grün bei Gewinntag, rot bei Verlusttag, grau bei Break-even. Beim Drüberfahren erscheint das Ergebnis.',
      render(d, inst, e, App) { const now = new Date(); const m = App.state.calMonth || new Date(now.getFullYear(), now.getMonth(), 1); return U.card(e.name, `<div style="margin-bottom:8px">${calNav(m, 'cal-prev', 'cal-next', '')}</div>${calendarHTML(d.daysAll, m.getFullYear(), m.getMonth(), { mini: true })}<div class="small muted" style="margin-top:8px">${monthSub(d.daysAll, m)}</div>`, { info: e.info }); } },
    { typ: 'kalender_erweitert', name: 'Erweiterter Kalender', preview: 'calext', groesse: 'mittel', hoch: true, desc: 'Wie Kalender, mit einer zusätzlichen Spalte rechts mit dem P&L jeder Woche.', info: 'Monatsansicht mit Netto-Ergebnis je Tag und rechts das Wochenergebnis mit Anzahl der Handelstage.',
      render(d, inst, e, App) { const now = new Date(); const m = App.state.calMonth || new Date(now.getFullYear(), now.getMonth(), 1); return U.card(e.name, `<div class="row between" style="margin-bottom:12px">${calNav(m, 'cal-prev', 'cal-next', 'cal-today')}<div class="small muted">${monthSub(d.daysAll, m)}</div></div>${calendarHTML(d.daysAll, m.getFullYear(), m.getMonth(), { weeks: true })}`, { info: e.info }); } },
    { typ: 'regel_tracker', name: 'Regel-Tracker', preview: 'heat', groesse: 'klein', desc: 'Heatmap wie bei GitHub: je kräftiger, desto mehr Regeln an dem Tag eingehalten. Mit Tages-Score und Link zur Checkliste.', info: 'Ein Kästchen pro Tag der letzten 13 Wochen. Je mehr deiner Handelsregeln du an dem Tag abgehakt hast, desto kräftiger die Farbe. Der Tages-Score zählt die heute abgehakten Regeln. Regeln pflegst du in den Einstellungen, abhaken im Fortschritt-Tab.',
      render(d, inst, e) {
        const rules = S.data.rules.filter(r => r.active !== false); const todayKey = C.dayKey(new Date()); const today = S.day(todayKey) || {}; const doneToday = rules.length ? (today.rulesFollowed || []).filter(id => rules.some(r => r.id === id)).length : 0;
        const weeks = 13; const end = new Date(); end.setHours(0, 0, 0, 0); const start = C.weekStart(end); start.setDate(start.getDate() - (weeks - 1) * 7);
        const cols = []; const c = new Date(start);
        for (let w = 0; w < weeks; w++) { const col = { label: '', days: [] }; for (let i = 0; i < 7; i++) { const k = C.dayKey(c); if (c.getDate() <= 7 && !col.label && (i === 0 || w === 0)) col.label = c.toLocaleDateString('de-DE', { month: 'short' }).replace('.', ''); const day = S.day(k); const f = rules.length && day && day.rulesFollowed ? day.rulesFollowed.filter(id => rules.some(r => r.id === id)).length / rules.length : null; col.days.push({ k, date: new Date(c), f, future: c > end, wk: i >= 5 }); c.setDate(c.getDate() + 1); } cols.push(col); }
        const cell = x => { if (x.future) return '<i class="future"></i>'; const lvl = x.f == null ? '' : x.f >= 0.99 ? 'l4' : x.f >= 0.66 ? 'l3' : x.f >= 0.33 ? 'l2' : 'l1'; return `<i class="${lvl} ${x.wk ? 'wk' : ''} ${x.k === todayKey ? 'today' : ''}" data-tip="<b>${fmt.dateFull(x.date)}</b><br>${x.f == null ? 'Kein Regel-Check' : `${Math.round(x.f * rules.length)} von ${rules.length} Regeln eingehalten`}" data-action="day" data-day="${x.k}"></i>`; };
        const grid = `<div class="tracker" style="--weeks:${weeks}"><span class="tl"></span>${cols.map(x => `<span class="ml">${x.label}</span>`).join('')}${C.WEEKDAYS.map((wd, i) => `<span class="wl">${wd}</span>` + cols.map(x => cell(x.days[i])).join('')).join('')}</div><div class="heat-legend right"><span>Weniger</span><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>Mehr</span></div>`;
        const foot = `<div class="tracker-foot"><div><div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">Heutiger Score ${U.info('Heute abgehakte Regeln von allen aktiven Regeln.')}</div><div class="row" style="gap:12px;flex-wrap:nowrap"><b class="score-n">${doneToday}/${rules.length}</b><div class="bar-track"><i style="width:${rules.length ? Math.round(doneToday / rules.length * 100) : 0}%"></i></div></div></div><a class="btn" href="#/progress">Tages-Checkliste</a></div>`;
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
  ];
  const settingsBtn = () => `<button type="button" class="btn ghost icon sm w-cfg" data-action="dash-w-settings" title="Einstellungen" aria-label="Widget-Einstellungen">${I.settings}</button>`;

  const ALL = {}; for (const e of TOP) ALL[e.typ] = Object.assign(e, { area: 'oben' }); for (const e of MAIN) ALL[e.typ] = Object.assign(e, { area: 'unten' });

  root.Widgets = {
    SIZES, MAX_TOP, REPORT_GROUPS, REPORT_ALL, REPORT_COLORS, REPORT_DEFAULT, reportConfig, reportPanelHTML: reportPanel, ALL,
    list(area) { return (area === 'oben' ? TOP : MAIN).slice(); },
    get(typ) { return ALL[typ] || null; },
    data: makeData, preview, calendarHTML,
    render(inst, d, App) { const e = ALL[inst.typ]; if (!e) return U.card('Unbekanntes Widget', `<div class="small muted">Der Widget-Typ „${esc(inst.typ)}“ ist nicht bekannt.</div>`); try { return e.render(d, inst, e, App); } catch (err) { console.warn('Widget', inst.typ, err); return U.card(e.name, `<div class="small muted">Dieses Widget konnte nicht berechnet werden.</div>`, { info: e.info }); } },
  };
})(typeof self !== 'undefined' ? self : this);
