/* Oberfläche: Formatierung, Symbole, Bausteine, Diagramme, Modal, Tooltip */
(function (root) {
  'use strict';
  const C = root.Core;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Symbole ---------- */
  const sv = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const I = {
    logo: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3C10.5 3 6 7.4 6 12.9c0 6.5 7.6 13.4 9.3 14.9a1 1 0 0 0 1.4 0C18.4 26.3 26 19.4 26 12.9 26 7.4 21.5 3 16 3z" stroke="currentColor" stroke-width="2.2"/><path d="M11 14.5l3-3 2.5 2.5 4.5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    dashboard: sv('<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'),
    tradelog: sv('<path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="1"/>'),
    day: sv('<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/><rect x="7" y="13" width="4" height="4" rx="1"/>'),
    stats: sv('<path d="M3 17l5-6 4 3 5-7 4 4"/><path d="M3 21h18"/>'),
    journal: sv('<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 3v18M12 8h4M12 12h4"/>'),
    library: sv('<rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="14" rx="1"/><path d="M17 6l4 12"/>'),
    strategy: sv('<path d="M4 5h4l4 7 4 7h4M4 19h4l3-5M16 5h4l-3 5"/>'),
    progress: sv('<path d="M6 3h12M6 21h12M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>'),
    coach: sv('<path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8zM5 15l.6 1.4 1.4.6-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z"/>'),
    zen: sv('<circle cx="12" cy="5" r="2"/><path d="M12 8v6M12 14l-4 6M12 14l4 6M5 11l7 1 7-1"/>'),
    settings: sv('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'),
    sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    moon: sv('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'),
    minus: sv('<path d="M5 12h14"/>'),
    chev: sv('<path d="M6 9l6 6 6-6"/>'),
    chevR: sv('<path d="M9 6l6 6-6 6"/>'),
    chevL: sv('<path d="M15 6l-6 6 6 6"/>'),
    back: sv('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    search: sv('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    upload: sv('<path d="M12 16V4M6 10l6-6 6 6M4 20h16"/>'),
    download: sv('<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>'),
    mic: sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    stop: sv('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
    image: sv('<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>'),
    trash: sv('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    edit: sv('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13 7l4 4"/>'),
    close: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
    info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    check: sv('<path d="M5 12l5 5L20 7"/>'),
    warning: sv('<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17h.01"/>'),
    play: sv('<path d="M7 5l12 7-12 7z"/>'),
    layout: sv('<rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M3 10h18M10 10v11"/>'),
    filter: sv('<path d="M3 5h18l-7 8v6l-4 2v-8z"/>'),
    calendar: sv('<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    account: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'),
    menu: sv('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    flame: sv('<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>'),
    target: sv('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
    bolt: sv('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    folder: sv('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
    note: sv('<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6M9 13h6M9 17h6"/>'),
    external: sv('<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'),
    csv: sv('<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6M8 13h8M8 17h8"/>'),
    copy: sv('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/>'),
    more: sv('<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>'),
    dot: sv('<circle cx="12" cy="12" r="4" fill="currentColor"/>'),
    sparkle: sv('<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>'),
    shield: sv('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
    trend: sv('<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
    eye: sv('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: sv('<path d="M3 3l18 18M10 6a10 10 0 0 1 2-.2c6 0 10 6.2 10 6.2a17 17 0 0 1-3 3.5M6.6 6.6A16 16 0 0 0 2 12s4 6.2 10 6.2a9 9 0 0 0 4-1"/>'),
    arrowUp: sv('<path d="M12 19V5M5 12l7-7 7 7"/>'),
    arrowDown: sv('<path d="M12 5v14M5 12l7 7 7-7"/>'),
    dice: sv('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="16" cy="8" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="8" cy="16" r="1.3" fill="currentColor"/><circle cx="16" cy="16" r="1.3" fill="currentColor"/>'),
  };

  /* ---------- Formatierung ---------- */
  let currency = 'EUR';
  const fmt = {
    setCurrency(c) { currency = c || 'EUR'; },
    cur(v, o = {}) {
      if (v == null || isNaN(v)) return '—';
      const a = Math.abs(v); const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);
      let s; try { s = new Intl.NumberFormat('de-DE', { style: 'currency', currency, minimumFractionDigits: d, maximumFractionDigits: d }).format(a); } catch (e) { s = a.toFixed(d) + ' ' + currency; }
      return (v < -C.EPS ? '−' : (o.signed && v > C.EPS ? '+' : '')) + s;
    },
    pct(f, d = 0, signed = false) { if (f == null || isNaN(f)) return '—'; const s = new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: d, minimumFractionDigits: d }).format(Math.abs(f)); return (f < 0 ? '−' : signed && f > 0 ? '+' : '') + s; },
    r(v, signed = true) { if (v == null || isNaN(v)) return '—'; return (v < 0 ? '−' : (signed && v > 0 ? '+' : '')) + Math.abs(v).toFixed(2).replace('.', ',') + ' R'; },
    num(v, d = 2) { if (v == null || isNaN(v)) return '—'; return new Intl.NumberFormat('de-DE', { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(v); },
    int(v) { return v == null ? '—' : new Intl.NumberFormat('de-DE').format(Math.round(v)); },
    price(v) { if (v == null || isNaN(v)) return '—'; const a = Math.abs(v); return new Intl.NumberFormat('de-DE', { minimumFractionDigits: a < 10 ? 4 : a < 1000 ? 2 : 1, maximumFractionDigits: a < 10 ? 5 : 2 }).format(v); },
    factor(v) { return v == null ? '∞' : fmt.num(v, 2); },
    date(d) { return d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : '—'; },
    dateFull(d) { return d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'; },
    dateTime(d) { return d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ', ' + fmt.time(d) : '—'; },
    time(d) { return d ? new Date(d).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '—'; },
    dur(min) { if (min == null || isNaN(min)) return '—'; min = Math.round(min); if (min < 60) return `${min} min`; const h = Math.floor(min / 60), m = min % 60; if (h < 48) return m ? `${h} h ${m} min` : `${h} h`; return `${Math.round(h / 24)} T`; },
    weekdayLong(d) { return new Date(d).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); },
    monthYear(d) { return new Date(d).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }); },
    isoLocal(d) { const x = new Date(d); const p = n => String(n).padStart(2, '0'); return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`; },
    hm(sec) { const p = n => String(n).padStart(2, '0'); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.floor(sec % 60); return `${p(h)}:${p(m)}:${p(s)}`; },
  };
  const cls = v => v > C.EPS ? 'pos' : v < -C.EPS ? 'neg' : 'neu';
  const pnl = (v, extra = '', o = {}) => `<span class="${cls(v)} ${extra}">${fmt.cur(v, Object.assign({ signed: true }, o))}</span>`;
  const rText = (v, extra = '') => v == null ? `<span class="faint ${extra}">—</span>` : `<span class="${cls(v)} ${extra}">${fmt.r(v)}</span>`;

  /* ---------- Bausteine ---------- */
  const info = text => text ? `<span class="info" data-tip="${esc(text)}">${I.info}</span>` : '';
  const card = (title, body, o = {}) => `<section class="card ${o.cls || ''}" ${o.attrs || ''}>${title ? `<div class="card-head"><div><div class="card-title">${esc(title)}${info(o.info)}</div>${o.sub ? `<div class="card-sub">${o.sub}</div>` : ''}</div>${o.trailing ? `<div class="row">${o.trailing}</div>` : ''}</div>` : ''}${body}</section>`;
  const tile = (label, value, o = {}) => `<div class="tile"><div class="head"><span>${esc(label)}${info(o.info)}</span>${o.n != null ? `<span class="n">${o.n}</span>` : ''}</div><div class="body"><div><div class="val ${o.tint || ''}">${value}</div>${o.foot ? `<div class="foot">${o.foot}</div>` : ''}</div>${o.gauge ? `<div class="gauge">${o.gauge}</div>` : ''}</div></div>`;
  const pill = (text, kind = 'neutral') => `<span class="pill ${kind}">${text}</span>`;
  const badge = dir => `<span class="badge ${dir > 0 ? 'l' : 's'}">${dir > 0 ? 'LONG' : 'SHORT'}</span>`;
  const chip = (text, kind = '') => `<span class="chip ${kind}">${esc(text)}</span>`;
  const statusPill = st => ({ win: pill('Gewinn', 'win'), loss: pill('Verlust', 'loss'), be: pill('Break-even', 'be'), open: pill('Offen', 'open') })[st] || '';
  const empty = (icon, title, text, action = '') => `<div class="empty">${I[icon] || ''}<b>${esc(title)}</b><span class="small">${text}</span>${action}</div>`;
  const banner = (kind, title, text, o = {}) => `<div class="banner ${kind}">${I[o.icon || (kind === 'warn' || kind === 'loss' ? 'warning' : 'info')]}<div class="grow">${title ? `<b>${esc(title)}</b>` : ''}<span>${text}</span></div>${o.close ? `<button type="button" class="btn ghost icon sm close" data-action="${o.close}" aria-label="Schließen">${I.close}</button>` : ''}${o.trailing || ''}</div>`;
  const kv = (k, v) => `<div class="kv"><span>${esc(k)}</span><b>${v}</b></div>`;
  const barRow = (label, v, max, text, color = 'var(--accent)') => `<div class="bar-row"><div class="bl"><span>${esc(label)}</span><b>${text}</b></div><div class="track"><i style="width:${max > 0 ? Math.min(Math.abs(v) / max, 1) * 100 : 0}%;background:${color}"></i></div></div>`;
  const seg = (options, current, action, extra = '') => `<div class="seg ${extra}">${options.map(([k, l]) => `<button type="button" data-action="${action}" data-value="${esc(k)}" aria-pressed="${String(current) === String(k)}">${esc(l)}</button>`).join('')}</div>`;
  const tabs = (options, current, action) => `<div class="tabs">${options.map(([k, l]) => `<button type="button" data-action="${action}" data-value="${esc(k)}" aria-pressed="${current === k}">${esc(l)}</button>`).join('')}</div>`;
  const ring = (score, size = 92, lw = 9, sub = '') => { const r = 40, c = 2 * Math.PI * r; const col = score == null ? 'var(--faint)' : score < 50 ? 'var(--loss)' : score < 75 ? 'var(--warn)' : 'var(--accent)'; return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 92 92"><circle cx="46" cy="46" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${lw}"/><circle cx="46" cy="46" r="${r}" fill="none" stroke="${col}" stroke-width="${lw}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - (score || 0) / 100)}"/></svg><div class="n" style="font-size:${size * 0.28}px">${score == null ? '—' : score}${sub ? `<small>${sub}</small>` : ''}</div></div>`; };
  const scoreColor = s => s < 50 ? 'var(--loss)' : s < 75 ? 'var(--warn)' : 'var(--accent)';

  /* ---------- Diagramme ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function niceTicks(min, max, n = 4) { const span = max - min || 1; const raw = span / n; const p = 10 ** Math.floor(Math.log10(raw)); const s = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => span / s <= n + 1) || raw; const t = []; for (let v = Math.ceil(min / s) * s; v <= max + 1e-9; v += s) t.push(+v.toFixed(6)); return t; }
  const smooth = pts => { if (pts.length < 3) return 'M' + pts.map(p => p.join(',')).join('L'); let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]; d += `C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`; } return d; };
  const curShort = v => { const a = Math.abs(v); const s = a >= 1000 ? (a / 1000).toFixed(a >= 10000 ? 0 : 1).replace('.', ',').replace(',0', '') + 'k' : String(Math.round(a)); return (v < 0 ? '−' : '') + s; };
  const gid = () => 'g' + Math.random().toString(36).slice(2, 8);
  const chartData = {};
  const drawers = {};
  function drawCharts(scope) {
    (scope || document).querySelectorAll('.chart[data-chart]').forEach(el => { const k = el.dataset.chart; const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return; const data = chartData[el.dataset.id]; try { drawers[k] && drawers[k](el, data, W, H); } catch (e) { console.warn('Diagramm', k, e); } });
  }
  function hoverLine(el, svg, pts, xf, yf, tipFn, color) {
    const hover = svg.querySelector('.hover'), hit = svg.querySelector('.hit'); if (!hover || !hit) return;
    const show = e => { const r = hit.getBoundingClientRect(); const cx = (e.touches ? e.touches[0].clientX : e.clientX); const i = C.clamp(Math.round((cx - r.left) / r.width * (pts.length - 1)), 0, pts.length - 1); hover.classList.add('on'); const x = xf(i), y = yf(i); const ln = hover.querySelector('line'), c = hover.querySelector('circle'); ln.setAttribute('x1', x); ln.setAttribute('x2', x); c.setAttribute('cx', x); c.setAttribute('cy', y); if (color) c.setAttribute('fill', color(i)); tipAt(el, x, y, tipFn(i)); };
    hit.addEventListener('mousemove', show); hit.addEventListener('touchstart', show, { passive: true }); hit.addEventListener('touchmove', show, { passive: true });
    hit.addEventListener('mouseleave', () => { hover.classList.remove('on'); tipHide(); }); hit.addEventListener('touchend', () => { hover.classList.remove('on'); tipHide(); });
  }
  /* Täglicher (Balken) und kumulierter (Fläche) P&L */
  drawers.pnl = function (el, d, W, H) {
    const days = d && d.days || []; if (!days.length) { el.innerHTML = `<div class="empty" style="min-height:0;height:100%">${I.stats}<span class="small">Keine abgeschlossenen Trades im Zeitraum</span></div>`; return; }
    const ml = 8, mr = 56, mt = 12, mb = 26; const showBars = d.bars !== false, dots = !!d.dots;
    let cum = 0; const pts = days.map(x => { cum += x.pnl; return { day: x.day, pnl: x.pnl, cum, n: x.n }; });
    const vals = [0, ...pts.map(p => p.cum), ...(showBars ? pts.map(p => p.pnl) : [])]; const ticks = niceTicks(Math.min(...vals), Math.max(...vals), 4);
    const y0 = Math.min(ticks[0], ...vals), y1 = Math.max(ticks[ticks.length - 1], ...vals);
    const n = pts.length; const iw = W - ml - mr; const x = i => n === 1 ? ml + iw / 2 : ml + i / (n - 1) * iw; const y = v => mt + (y1 - v) / (y1 - y0 || 1) * (H - mt - mb);
    const bw = Math.max(2, Math.min(14, iw / n * 0.55));
    const line = n === 1 ? `M${x(0) - 1},${y(pts[0].cum)}L${x(0) + 1},${y(pts[0].cum)}` : smooth(pts.map((p, i) => [x(i), y(p.cum)]));
    const area = `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;
    const gp = gid(), gn = gid(), cp = gid(), cn = gid();
    const xt = n <= 6 ? pts.map((_, i) => i) : [0, Math.round((n - 1) / 4), Math.round((n - 1) / 2), Math.round((n - 1) * 3 / 4), n - 1];
    const last = pts[n - 1].cum, lastCol = last >= 0 ? 'var(--profit)' : 'var(--loss)';
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs>
      <linearGradient id="${gp}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--profit)" stop-opacity=".35"/><stop offset="1" stop-color="var(--profit)" stop-opacity=".02"/></linearGradient>
      <linearGradient id="${gn}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--loss)" stop-opacity=".35"/><stop offset="1" stop-color="var(--loss)" stop-opacity=".02"/></linearGradient>
      <clipPath id="${cp}"><rect x="0" y="0" width="${W}" height="${Math.max(0, y(0))}"/></clipPath><clipPath id="${cn}"><rect x="0" y="${y(0)}" width="${W}" height="${Math.max(0, H - y(0))}"/></clipPath></defs>
      <g class="grid">${ticks.map(t => `<line x1="${ml}" x2="${W - mr}" y1="${y(t)}" y2="${y(t)}"/><text x="${W - mr + 8}" y="${y(t) + 3.5}">${curShort(t)}</text>`).join('')}</g>
      <line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>
      ${showBars ? pts.map((p, i) => `<rect x="${x(i) - bw / 2}" y="${Math.min(y(p.pnl), y(0))}" width="${bw}" height="${Math.max(1.5, Math.abs(y(p.pnl) - y(0)))}" rx="2" fill="var(--${p.pnl >= 0 ? 'profit' : 'loss'})" fill-opacity=".55"/>`).join('') : ''}
      <path d="${area}" fill="url(#${gp})" clip-path="url(#${cp})"/><path d="${area}" fill="url(#${gn})" clip-path="url(#${cn})"/>
      <path d="${line}" fill="none" stroke="var(--profit)" stroke-width="2.2" clip-path="url(#${cp})" stroke-linejoin="round"/><path d="${line}" fill="none" stroke="var(--loss)" stroke-width="2.2" clip-path="url(#${cn})" stroke-linejoin="round"/>
      ${dots ? pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.cum)}" r="3" fill="var(--${p.cum >= 0 ? 'profit' : 'loss'})"/>`).join('') : `<circle cx="${x(n - 1)}" cy="${y(last)}" r="4" fill="${lastCol}" stroke="var(--surface)" stroke-width="2"/>`}
      ${xt.map(i => `<text x="${x(i)}" y="${H - 7}" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${fmt.date(pts[i].day)}</text>`).join('')}
      <g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/><circle r="4.5" stroke="var(--surface)" stroke-width="2"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
    hoverLine(el, el.firstElementChild, pts, x, i => y(pts[i].cum), i => { const p = pts[i]; return `<b>${fmt.weekdayLong(p.day)}</b><br>Tag: ${pnl(p.pnl)} · ${p.n} Trade${p.n === 1 ? '' : 's'}<br>Kumuliert: ${pnl(p.cum)}`; }, i => pts[i].cum >= 0 ? 'var(--profit)' : 'var(--loss)');
  };
  /* Equity pro Trade */
  drawers.equity = function (el, d, W, H) {
    const pts = d && d.points || []; if (pts.length < 2) { el.innerHTML = ''; return; } const ml = 8, mr = 56, mt = 12, mb = 26;
    const ys = pts.map(p => p.equity); const ticks = niceTicks(Math.min(0, ...ys), Math.max(0, ...ys), 4); const y0 = Math.min(ticks[0], ...ys, 0), y1 = Math.max(ticks[ticks.length - 1], ...ys, 0);
    const iw = W - ml - mr; const x = i => ml + i / (pts.length - 1) * iw, y = v => mt + (y1 - v) / (y1 - y0 || 1) * (H - mt - mb); const g = gid();
    const line = smooth(pts.map((p, i) => [x(i), y(p.equity)])); const last = pts[pts.length - 1].equity, col = last >= 0 ? 'var(--profit)' : 'var(--loss)';
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".3"/><stop offset="1" stop-color="${col}" stop-opacity=".02"/></linearGradient></defs><g class="grid">${ticks.map(t => `<line x1="${ml}" x2="${W - mr}" y1="${y(t)}" y2="${y(t)}"/><text x="${W - mr + 8}" y="${y(t) + 3.5}">${curShort(t)}</text>`).join('')}</g><line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/><path d="${line} L${x(pts.length - 1)},${y(y0)} L${x(0)},${y(y0)} Z" fill="url(#${g})"/><path d="${line}" fill="none" stroke="${col}" stroke-width="2.2"/><circle cx="${x(pts.length - 1)}" cy="${y(last)}" r="4" fill="${col}" stroke="var(--surface)" stroke-width="2"/>${[0, Math.round((pts.length - 1) / 2), pts.length - 1].map(i => `<text x="${x(i)}" y="${H - 7}" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}">${fmt.date(pts[i].date)}</text>`).join('')}<g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/><circle r="4.5" fill="${col}" stroke="var(--surface)" stroke-width="2"/></g><rect class="hit" x="${ml}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
    hoverLine(el, el.firstElementChild, pts, x, i => y(pts[i].equity), i => { const p = pts[i]; return `<b>${pnl(p.equity)}</b><br>${fmt.dateTime(p.date)}<br><span class="muted">${esc(p.t.symbol)} ${fmt.cur(p.pnl, { signed: true })}</span>`; });
  };
  /* Kleine Fläche (Tageskarte) */
  drawers.spark = function (el, d, W, H) {
    const vals = d && d.values || []; if (vals.length < 1) { el.innerHTML = ''; return; } const pts = [0, ...vals]; const mn = Math.min(0, ...pts), mx = Math.max(0, ...pts);
    const x = i => 4 + i / (pts.length - 1) * (W - 8), y = v => 6 + (mx - v) / (mx - mn || 1) * (H - 12); const g = gid(); const last = pts[pts.length - 1], col = last >= 0 ? 'var(--profit)' : 'var(--loss)';
    const line = pts.length > 1 ? smooth(pts.map((v, i) => [x(i), y(v)])) : '';
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity=".02"/></linearGradient></defs><line class="zero" x1="4" x2="${W - 4}" y1="${y(0)}" y2="${y(0)}"/><path d="${line} L${x(pts.length - 1)},${y(mn)} L${x(0)},${y(mn)} Z" fill="url(#${g})"/><path d="${line}" fill="none" stroke="${col}" stroke-width="2"/><circle cx="${x(pts.length - 1)}" cy="${y(last)}" r="3" fill="${col}"/></svg>`;
  };
  /* Senkrechte Balken je Gruppe */
  drawers.vbars = function (el, d, W, H) {
    const groups = d && d.groups || []; if (!groups.length) { el.innerHTML = `<div class="empty" style="min-height:0;height:100%"><span class="small">Keine Daten</span></div>`; return; } const perTrade = d.metric === 'expectancy';
    const vals = groups.map(g => perTrade ? g.s.expectancy : g.s.total); const ml = 8, mr = 52, mt = 12, mb = 26;
    const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 3); const y0 = Math.min(ticks[0], ...vals, 0), y1 = Math.max(ticks[ticks.length - 1], ...vals, 0);
    const y = v => mt + (y1 - v) / (y1 - y0 || 1) * (H - mt - mb); const gap = (W - ml - mr) / groups.length, bw = Math.min(44, gap * 0.62);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g class="grid">${ticks.map(t => `<line x1="${ml}" x2="${W - mr}" y1="${y(t)}" y2="${y(t)}"/><text x="${W - mr + 8}" y="${y(t) + 3.5}">${curShort(t)}</text>`).join('')}</g><line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/>${groups.map((g, i) => { const v = vals[i]; const top = Math.min(y(v), y(0)), h = Math.max(2, Math.abs(y(v) - y(0))); const cx = ml + i * gap + gap / 2; return `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${h}" rx="4" fill="var(--${v >= 0 ? 'profit' : 'loss'})" data-tip="<b>${esc(g.label || g.key)}</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}"></rect><text x="${cx}" y="${H - 7}" text-anchor="middle">${esc(g.label || g.key)}</text>`; }).join('')}</svg>`;
  };
  /* Waagerechte Balken */
  drawers.hbars = function (el, d, W, H) {
    const groups = d && d.groups || []; if (!groups.length) { el.innerHTML = `<div class="empty" style="min-height:0;height:100%"><span class="small">Keine Daten</span></div>`; return; } const perTrade = d.metric === 'expectancy';
    const vals = groups.map(g => perTrade ? g.s.expectancy : g.s.total); const ml = Math.min(130, W * 0.3), mr = 44, mt = 6, mb = 24;
    const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 4); const x0 = Math.min(ticks[0], ...vals, 0), x1 = Math.max(ticks[ticks.length - 1], ...vals, 0);
    const x = v => ml + (v - x0) / (x1 - x0 || 1) * (W - ml - mr); const rowH = (H - mt - mb) / groups.length, bh = Math.min(20, rowH * 0.62);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g class="grid">${ticks.map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="${mt}" y2="${H - mb}"/><text x="${x(t)}" y="${H - 7}" text-anchor="middle">${curShort(t)}</text>`).join('')}</g><line class="zero" x1="${x(0)}" x2="${x(0)}" y1="${mt}" y2="${H - mb}"/>${groups.map((g, i) => { const v = vals[i]; const cy = mt + i * rowH + rowH / 2; const left = Math.min(x(v), x(0)), w = Math.max(2, Math.abs(x(v) - x(0))); return `<text x="${ml - 10}" y="${cy + 4}" text-anchor="end" style="fill:var(--text-2);font-size:12px">${esc(String(g.label || g.key).slice(0, 18))}</text><rect x="${left}" y="${cy - bh / 2}" width="${w}" height="${bh}" rx="4" fill="var(--${v >= 0 ? 'profit' : 'loss'})" data-tip="<b>${esc(g.label || g.key)}</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${g.s.n} Trades · Win-Rate ${fmt.pct(g.s.winRate)}"></rect><text x="${v >= 0 ? x(v) + 6 : x(v) - 6}" y="${cy + 3.5}" text-anchor="${v >= 0 ? 'start' : 'end'}">${g.s.n}×</text>`; }).join('')}</svg>`;
  };
  /* Rollierender Edge */
  drawers.rolling = function (el, d, W, H) {
    const e = d && d.edge; const pts = e ? e.rolling : []; if (!pts.length) { el.innerHTML = `<div class="empty" style="min-height:0;height:100%"><span class="small">Mindestens ${e ? e.window : 20} Trades mit R-Wert nötig</span></div>`; return; } const ml = 8, mr = 56, mt = 16, mb = 26;
    const vs = pts.map(p => p.v); const ticks = niceTicks(Math.min(0, ...vs, e.mean), Math.max(0, ...vs, e.mean), 4); const y0 = Math.min(ticks[0], ...vs, 0), y1 = Math.max(ticks[ticks.length - 1], ...vs, e.mean);
    const x = i => ml + i / Math.max(1, pts.length - 1) * (W - ml - mr), y = v => mt + (y1 - v) / (y1 - y0 || 1) * (H - mt - mb); const line = smooth(pts.map((p, i) => [x(i), y(p.v)])); const g = gid();
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".25"/><stop offset="1" stop-color="var(--accent)" stop-opacity=".02"/></linearGradient></defs><g class="grid">${ticks.map(t => `<line x1="${ml}" x2="${W - mr}" y1="${y(t)}" y2="${y(t)}"/><text x="${W - mr + 8}" y="${y(t) + 3.5}">${fmt.r(t)}</text>`).join('')}</g><line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(0)}" y2="${y(0)}"/><line x1="${ml}" x2="${W - mr}" y1="${y(e.mean)}" y2="${y(e.mean)}" stroke="var(--${e.mean >= 0 ? 'profit' : 'loss'})" stroke-opacity=".7"/><text x="${W - mr - 4}" y="${y(e.mean) - 5}" text-anchor="end">Gesamt ${fmt.r(e.mean)}</text><path d="${line} L${x(pts.length - 1)},${y(y0)} L${x(0)},${y(y0)} Z" fill="url(#${g})"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2"/>${[0, Math.round((pts.length - 1) / 2), pts.length - 1].map(i => `<text x="${x(i)}" y="${H - 7}" text-anchor="${i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}">Trade ${pts[i].i}</text>`).join('')}<g class="hover"><line y1="${mt}" y2="${H - mb}" stroke="var(--text-2)" stroke-opacity=".5"/><circle r="4.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/></g><rect class="hit" x="${ml}" y="0" width="${W - ml - mr}" height="${H}" fill="transparent"/></svg>`;
    hoverLine(el, el.firstElementChild, pts, x, i => y(pts[i].v), i => `<b class="${cls(pts[i].v)}">${fmt.r(pts[i].v)}</b><br>Ø der Trades ${pts[i].i - e.window + 1} bis ${pts[i].i}`);
  };
  /* Monte Carlo Pfade */
  drawers.mc = function (el, d, W, H) {
    const mc = d && d.mc; if (!mc) { el.innerHTML = ''; return; } const ml = 8, mr = 58, mt = 12, mb = 26;
    const all = mc.curves.flat(); const ruinY = mc.start * (1 - mc.ruinPct); const ticks = niceTicks(Math.min(...all, ruinY), Math.max(...all), 4); const y0 = Math.min(ticks[0], ...all, ruinY), y1 = Math.max(ticks[ticks.length - 1], ...all);
    const x = i => ml + i / mc.horizon * (W - ml - mr), y = v => mt + (y1 - v) / (y1 - y0 || 1) * (H - mt - mb);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><g class="grid">${ticks.map(t => `<line x1="${ml}" x2="${W - mr}" y1="${y(t)}" y2="${y(t)}"/><text x="${W - mr + 8}" y="${y(t) + 3.5}">${curShort(t)}</text>`).join('')}</g>${mc.curves.map(c => `<polyline fill="none" stroke="var(--accent)" stroke-opacity=".3" stroke-width="1" points="${c.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`).join('')}<line class="zero" x1="${ml}" x2="${W - mr}" y1="${y(mc.start)}" y2="${y(mc.start)}"/><line x1="${ml}" x2="${W - mr}" y1="${y(ruinY)}" y2="${y(ruinY)}" stroke="var(--loss)" stroke-opacity=".8" stroke-dasharray="4 3"/><text x="${ml + 2}" y="${y(ruinY) - 5}" style="fill:var(--loss)">Ruin-Schwelle ${curShort(ruinY)}</text>${[0, Math.round(mc.horizon / 2), mc.horizon].map(i => `<text x="${x(i)}" y="${H - 7}" text-anchor="${i === 0 ? 'start' : i === mc.horizon ? 'end' : 'middle'}">${i} Trades</text>`).join('')}</svg>`;
  };
  drawers.hist = function (el, d, W, H) {
    const mc = d && d.mc; if (!mc) { el.innerHTML = ''; return; } const n = mc.hist.length, max = Math.max(1, ...mc.hist.map(b => b.n)); const mb = 20, gap = W / n;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${mc.hist.map((b, i) => { const h = b.n / max * (H - mb - 4); return `<rect x="${i * gap + 1}" y="${H - mb - h}" width="${Math.max(1, gap - 2)}" height="${Math.max(h, 0)}" rx="2" fill="var(--${b.lo >= mc.ruinPct ? 'loss' : 'accent'})" fill-opacity="${b.lo >= mc.ruinPct ? 1 : .75}" data-tip="Drawdown ${fmt.pct(b.lo, 0)} bis ${fmt.pct(b.hi, 0)}: ${b.n} Durchläufe"></rect>`; }).join('')}${[0, Math.floor(n / 2), n - 1].map(i => `<text x="${i * gap + gap / 2}" y="${H - 5}" text-anchor="middle">${fmt.pct(mc.hist[i].lo, 0)}</text>`).join('')}</svg>`;
  };
  /* Wochen-Disziplin */
  drawers.weeks = function (el, d, W, H) {
    const w = d && d.weeks || []; if (!w.length) { el.innerHTML = `<div class="empty" style="min-height:0;height:100%"><span class="small">Noch keine Wochen</span></div>`; return; } const mb = 18; const gap = W / w.length, bw = Math.min(28, gap * 0.6);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${w.map((p, i) => { const h = Math.max(2, p.score / 100 * (H - mb - 4)); return `<rect x="${i * gap + (gap - bw) / 2}" y="${H - mb - h}" width="${bw}" height="${h}" rx="4" fill="${scoreColor(p.score)}" fill-opacity=".85" data-tip="Woche ab ${fmt.date(p.week)}: Score ${Math.round(p.score)} (${p.n} Trades)"></rect><text x="${i * gap + gap / 2}" y="${H - 4}" text-anchor="middle">${fmt.date(p.week)}</text>`; }).join('')}</svg>`;
  };
  /* Halbkreis-Anzeige (Win-Rate) */
  function semiGauge(segments, label, size = 110) {
    const r = 42, cx = 60, cy = 58, lw = 11; const total = Math.max(1e-9, segments.reduce((a, s) => a + Math.max(0, s.v), 0)); let a = Math.PI;
    const pt = ang => [cx + r * Math.cos(ang), cy - r * Math.sin(ang)];
    const arcs = segments.filter(s => s.v > 0).map(s => { const span = s.v / total * Math.PI; const a1 = a - span; const [x0, y0] = pt(a), [x1, y1] = pt(a1); const dd = `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${span > Math.PI ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`; a = a1; return `<path d="${dd}" fill="none" stroke="var(--${s.c})" stroke-width="${lw}" stroke-linecap="butt"/>`; }).join('');
    return `<svg viewBox="0 0 120 66" width="${size}" height="${size * 0.55}" aria-hidden="true"><path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}" fill="none" stroke="var(--surface-3)" stroke-width="${lw}"/>${arcs}<text x="60" y="57" text-anchor="middle" style="font-size:15px;font-weight:700;fill:var(--text);font-family:var(--font-display)">${label}</text></svg>`;
  }
  function donut(segments, size = 56, lw = 8, center = '') {
    const r = (size - lw) / 2, c = 2 * Math.PI * r; const total = Math.max(segments.reduce((a, s) => a + Math.max(s.v, 0), 0), 1e-9); let acc = 0;
    const arcs = segments.map(s => { const f = Math.max(s.v, 0) / total; const len = Math.max(f * c - 2, 0); const e = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--${s.c})" stroke-width="${lw}" stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-acc * c + 1}"/>`; acc += f; return e; }).join('');
    return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${lw}"/>${arcs}</svg>${center ? `<div class="n" style="font-size:${size * 0.22}px">${center}</div>` : ''}</div>`;
  }
  function radar(axes, size = 240) {
    const pad = 64; const c = size / 2, r = size / 2 - 34, n = axes.length; const pt = (i, f) => { const a = -Math.PI / 2 + i / n * 2 * Math.PI; return [c + Math.cos(a) * r * f, c + Math.sin(a) * r * f]; };
    const ringP = f => `<polygon points="${axes.map((_, i) => pt(i, f).join(',')).join(' ')}" fill="none" stroke="var(--border-2)"/>`;
    const spokes = axes.map((_, i) => `<line x1="${c}" y1="${c}" x2="${pt(i, 1)[0]}" y2="${pt(i, 1)[1]}" stroke="var(--border)"/>`).join('');
    const area = axes.map((a, i) => pt(i, Math.max(a.score, 0.03)).join(',')).join(' ');
    const dots = axes.map((a, i) => { const [x, y] = pt(i, Math.max(a.score, 0.03)); return `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--accent)" stroke="var(--surface)" stroke-width="1.5" data-tip="<b>${esc(a.label)}</b>: ${esc(a.text)}<br>Teilscore ${Math.round(a.score * 100)}"/>`; }).join('');
    const labels = axes.map((a, i) => { const [x, y] = pt(i, 1.22); const anchor = Math.abs(x - c) < 4 ? 'middle' : x < c ? 'end' : 'start'; return `<text x="${x}" y="${y + 4}" text-anchor="${anchor}" style="font-size:11px;fill:var(--text-2);font-weight:600">${esc(a.label)}</text>`; }).join('');
    return `<svg viewBox="${-pad} 0 ${size + 2 * pad} ${size}" width="100%" style="max-width:${size + 2 * pad}px;height:auto;margin:0 auto;display:block" role="img" aria-label="Score-Radar">${[0.25, 0.5, 0.75, 1].map(ringP).join('')}${spokes}<polygon points="${area}" fill="var(--accent)" fill-opacity=".22" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>${dots}${labels}</svg>`;
  }
  function heatmap(activity, account) {
    const ref = Math.max(1, (account || 10000) * 0.01); const lvl = a => { if (!a.n) return a.checkIn || a.note ? 'l1' : ''; const f = Math.abs(a.pnl) / ref; return a.pnl >= 0 ? (f < 0.5 ? 'l2' : f < 1.5 ? 'l3' : 'l4') : (f < 0.5 ? 'n1' : f < 1.5 ? 'n2' : 'n3'); };
    const lead = activity.length ? (activity[0].date.getDay() + 6) % 7 : 0; const cells = Array(lead).fill('<i style="visibility:hidden"></i>').concat(activity.map(a => `<i class="${lvl(a)}" data-tip="<b>${fmt.dateFull(a.date)}</b><br>${a.n ? `${a.n} Trades · ${fmt.cur(a.pnl, { signed: true })}` : 'Keine Trades'}${a.checkIn ? '<br>Check-in ✓' : ''}${a.note ? '<br>Journal ✓' : ''}" data-action="day" data-day="${a.key}"></i>`));
    return `<div class="heat">${cells.join('')}</div>`;
  }

  /* ---------- Tooltip ---------- */
  function tipEl() { let t = document.getElementById('tip'); if (!t) { t = document.createElement('div'); t.id = 'tip'; document.body.appendChild(t); } return t; }
  function tipAt(el, lx, ly, html) { const tip = tipEl(); tip.innerHTML = html; tip.classList.add('on'); const r = el.getBoundingClientRect(); const x = r.left + lx, y = r.top + ly; tip.style.left = Math.min(x + 14, window.innerWidth - tip.offsetWidth - 10) + 'px'; tip.style.top = Math.max(8, y - tip.offsetHeight - 14) + 'px'; }
  function tipShowAt(clientX, clientY, html) { const tip = tipEl(); tip.innerHTML = html; tip.classList.add('on'); tip.style.left = Math.min(clientX + 14, window.innerWidth - tip.offsetWidth - 10) + 'px'; tip.style.top = Math.max(8, clientY - tip.offsetHeight - 12) + 'px'; }
  function tipHide() { const t = document.getElementById('tip'); if (t) t.classList.remove('on'); }
  function bindTips() {
    document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t) tipShowAt(e.clientX, e.clientY, t.dataset.tip); });
    document.addEventListener('mousemove', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t) tipShowAt(e.clientX, e.clientY, t.dataset.tip); });
    document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('[data-tip]')) tipHide(); });
  }

  /* ---------- Modal & Toast ---------- */
  const modals = [];
  function modal(html, o = {}) {
    const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.innerHTML = `<div class="modal ${o.cls || ''}" role="dialog" aria-modal="true">${html}</div>`;
    document.body.appendChild(bg); modals.push({ bg, o }); document.body.style.overflow = 'hidden';
    bg.addEventListener('mousedown', e => { if (e.target === bg && !o.locked) closeModal(); });
    if (o.onMount) o.onMount(bg.firstElementChild);
    const f = bg.querySelector('input:not([type=hidden]),select,textarea,button'); if (f && !o.noFocus) setTimeout(() => f.focus(), 30);
    return bg.firstElementChild;
  }
  function closeModal(all) { const m = all ? modals.splice(0) : [modals.pop()].filter(Boolean); for (const x of m) { x.bg.remove(); if (x.o.onClose) x.o.onClose(); } if (!modals.length) document.body.style.overflow = ''; }
  function toast(msg, kind = '') { let w = document.querySelector('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; document.body.appendChild(w); } const t = document.createElement('div'); t.className = `toast ${kind}`; t.textContent = msg; w.appendChild(t); setTimeout(() => t.remove(), 2600); }
  function confirmModal(title, text, o = {}) {
    return new Promise(res => {
      modal(`<div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><p class="muted">${text}</p><div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="button" class="btn ${o.danger ? 'danger' : 'primary'}" data-confirm>${esc(o.ok || 'Bestätigen')}</button></div>`, { cls: 'narrow', onMount(el) { el.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => { closeModal(); res(false); })); el.querySelector('[data-confirm]').addEventListener('click', () => { closeModal(); res(true); }); } });
    });
  }

  root.UI = { I, esc, fmt, cls, pnl, rText, info, card, tile, pill, badge, chip, statusPill, empty, banner, kv, barRow, seg, tabs, ring, scoreColor, chartData, drawers, drawCharts, semiGauge, donut, radar, heatmap, tipAt, tipHide, bindTips, modal, closeModal, toast, confirmModal, niceTicks, smooth };
})(typeof self !== 'undefined' ? self : this);
