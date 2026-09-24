/* Bibliothek: Trades nach Merkmalen filtern, mit Screenshots */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;
  const FILTERS = [
    { key: 'weekday', label: 'Wochentag', icon: 'calendar', values: t => [C.WEEKDAYS[(t.open.getDay() + 6) % 7]], order: C.WEEKDAYS },
    { key: 'hour', label: 'Tageszeit', icon: 'clock', values: t => [t.open.getHours() < 12 ? 'Vormittag' : t.open.getHours() < 15 ? 'Mittag' : 'Nachmittag'], order: ['Vormittag', 'Mittag', 'Nachmittag'] },
    { key: 'size', label: 'Kontrakte / Stück', icon: 'layout', values: t => [t.quantity <= 1 ? '≤ 1' : t.quantity <= 5 ? '2–5' : t.quantity <= 20 ? '6–20' : '> 20'], order: ['≤ 1', '2–5', '6–20', '> 20'] },
    { key: 'rating', label: 'Bewertung', icon: 'sparkle', values: t => [t.rating ? '★'.repeat(t.rating) : 'ohne'], order: ['★★★★★', '★★★★', '★★★', '★★', '★', 'ohne'] },
    { key: 'setup', label: 'Setup', icon: 'target', values: t => [t.setup || 'Ohne Setup'] },
    { key: 'mistake', label: 'Fehler-Tags', icon: 'warning', values: t => t.mistakes.length ? t.mistakes : ['Ohne Fehler'] },
    { key: 'status', label: 'Gewinn / Verlust', icon: 'trend', values: t => [({ win: 'Gewinn', loss: 'Verlust', be: 'Break-even', open: 'Offen' })[t.status]], order: ['Gewinn', 'Verlust', 'Break-even', 'Offen'] },
    { key: 'symbol', label: 'Symbol', icon: 'tradelog', values: t => [t.symbol] },
    { key: 'hold', label: 'Haltedauer', icon: 'progress', values: t => [t.holdingMin == null ? 'offen' : t.holdingMin < 15 ? '< 15 min' : t.holdingMin < 60 ? '15–60 min' : t.holdingMin < 240 ? '1–4 h' : '> 4 h'], order: ['< 15 min', '15–60 min', '1–4 h', '> 4 h', 'offen'] },
    { key: 'direction', label: 'Richtung', icon: 'strategy', values: t => [t.direction > 0 ? 'Long' : 'Short'], order: ['Long', 'Short'] },
    { key: 'emotion', label: 'Emotion', icon: 'coach', values: t => t.emotions.length ? t.emotions : ['Ohne Angabe'] },
    { key: 'shots', label: 'Mit Screenshot', icon: 'image', values: t => [t.screenshots.length ? 'Ja' : 'Nein'], order: ['Ja', 'Nein'] },
  ];
  App.screens.library = {
    title: 'Bibliothek',
    render(ctx) {
      const all = ctx.all; const lf = App.state.library; const active = lf.filters; const q = (lf.q || '').toLowerCase();
      const match = t => Object.entries(active).every(([k, v]) => { const f = FILTERS.find(x => x.key === k); return !v || f.values(t).includes(v); }) && (!q || [t.symbol, t.setup, t.notes, t.strategy, ...t.mistakes, ...t.emotions].join(' ').toLowerCase().includes(q));
      const rows = all.filter(match).sort((a, b) => b.sortTime - a.sortTime);
      const tilesHTML = `<div class="lib-filters">${FILTERS.map(f => { const vals = [...new Set(all.flatMap(f.values))]; if (f.order) vals.sort((a, b) => f.order.indexOf(a) - f.order.indexOf(b)); else vals.sort(); const cur = active[f.key] || ''; return `<div class="popwrap"><button type="button" class="lib-filter" data-pop="lf-${f.key}" aria-pressed="${!!cur}">${I[f.icon]}<span>${f.label}${cur ? `: <span class="accent">${esc(cur)}</span>` : ''}</span><span class="cnt">${vals.length}</span></button><div class="popover left" id="pop-lf-${f.key}"><button type="button" class="item" data-action="lib-filter" data-key="${f.key}" data-value="" aria-checked="${!cur}">Alle</button>${vals.map(v => `<button type="button" class="item" data-action="lib-filter" data-key="${f.key}" data-value="${esc(v)}" aria-checked="${cur === v}">${esc(v)}<span class="muted small" style="margin-left:auto">${all.filter(t => f.values(t).includes(v)).length}</span></button>`).join('')}</div></div>`; }).join('')}<div class="lib-filter" style="padding:6px 10px"><span style="color:var(--accent);width:17px;height:17px">${I.search}</span><input class="input" id="lib-q" data-input="lib-q" value="${esc(lf.q || '')}" placeholder="Suchen" aria-label="Suchen" style="border:0;background:none;padding:6px 4px"></div></div>`;
      const s = C.summary(rows);
      const head = `<div class="row between"><div class="muted small">${rows.length} von ${all.length} Trades${rows.length ? ` · Netto ${U.pnl(s.total)} · Win-Rate ${fmt.pct(s.winRate)}` : ''}</div>${Object.values(active).some(Boolean) || q ? `<button type="button" class="btn sm ghost" data-action="lib-reset">${I.close} Filter zurücksetzen</button>` : ''}</div>`;
      const cards = rows.length ? `<div class="lib-grid">${rows.slice(0, 60).map(t => `<div class="lib-card" data-action="trade" data-id="${t.id}" role="button" tabindex="0"><div class="thumb">${t.screenshots.length ? `<img data-blob="${t.screenshots[0]}" alt="">` : miniChart(t)}</div><div class="meta"><div class="t"><span>${esc(t.symbol)} ${U.badge(t.direction)}</span><span class="${U.cls(t.pnl)}">${t.closed ? fmt.cur(t.pnl, { signed: true }) : 'offen'}</span></div><div class="small muted">${fmt.dateFull(t.open)} · ${fmt.time(t.open)}${t.setup ? ` · ${esc(t.setup)}` : ''}</div>${t.mistakes.length ? `<div class="chips">${t.mistakes.slice(0, 2).map(m => U.chip(m, 'mistake')).join('')}</div>` : ''}</div></div>`).join('')}</div>${rows.length > 60 ? `<div class="muted small center">Die ersten 60 von ${rows.length} Trades.</div>` : ''}` : U.empty('library', 'Keine Trades passen', 'Ändere die Filter.');
      return tilesHTML + head + cards;
    },
  };
  function miniChart(t) {
    const rng = C.mulberry(parseInt(String(t.id).replace(/\D/g, '').slice(-6) || '1', 10) + 1); const n = 28; const W = 160, H = 90; const dir = t.direction; const entry = t.entryPrice, exit = t.exitPrice != null ? t.exitPrice : entry; const span = Math.max(Math.abs(exit - entry), t.stopDist || Math.abs(entry) * 0.004, 1e-9) * 1.6;
    const c = []; let p = entry - dir * span * 0.3; for (let i = 0; i < n; i++) { const target = i < n * 0.4 ? entry : exit; p += (target - p) * 0.25 + (rng() - 0.5) * span * 0.25; const o = p, cl = p + (rng() - 0.5) * span * 0.2; c.push([o, cl, Math.max(o, cl) + rng() * span * 0.1, Math.min(o, cl) - rng() * span * 0.1]); }
    const lo = Math.min(...c.map(x => x[3])), hi = Math.max(...c.map(x => x[2])); const y = v => 6 + (hi - v) / (hi - lo || 1) * (H - 12); const bw = W / n;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${c.map((x, i) => { const up = x[1] >= x[0]; const cx = i * bw + bw / 2; return `<line x1="${cx}" x2="${cx}" y1="${y(x[2])}" y2="${y(x[3])}" stroke="var(--${up ? 'profit' : 'loss'})" stroke-width="1" opacity=".7"/><rect x="${cx - bw * 0.3}" y="${Math.min(y(x[0]), y(x[1]))}" width="${bw * 0.6}" height="${Math.max(1, Math.abs(y(x[0]) - y(x[1])))}" fill="var(--${up ? 'profit' : 'loss'})" opacity=".7"/>`; }).join('')}<line x1="0" x2="${W}" y1="${y(entry)}" y2="${y(entry)}" stroke="var(--text-2)" stroke-dasharray="3 3" stroke-width="1"/></svg>`;
  }
  Object.assign(App.actions, {
    'lib-filter'(el) { App.state.library.filters[el.dataset.key] = el.dataset.value; App.rerender(); },
    'lib-q'(el) { App.state.library.q = el.value; clearTimeout(App._lq); App._lq = setTimeout(() => { App.rerender(); const q = document.getElementById('lib-q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 250); },
    'lib-reset'() { App.state.library = { filters: {}, q: '' }; App.rerender(); },
  });
})(typeof self !== 'undefined' ? self : this);
