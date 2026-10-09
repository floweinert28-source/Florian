/* Dashboard-Filter: Fenster unter dem Filter-Knopf (wie Zeitraum, Konto und Vorlage) mit vier Bereichen (Trade, Zeit, Werte, Tags).
   Klick daneben, Escape oder ein Seitenwechsel schließen es; der Inhalt scrollt im Fenster, Anwenden/Zurücksetzen stehen unten.
   Änderungen landen in einem Entwurf; erst „Anwenden“ filtert das Dashboard. Unten steht live, wie viele Trades im Zeitraum passen.
   Symbole und Tags werden nicht alle aufgelistet, sondern über „+ hinzufügen“ mit Suche gewählt.
   Gespeichert in Store.settings.dashFilter; ältere Filter (symbols, dir, status, setups, tags) werden übernommen. */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;

  const EMPTY = () => ({
    symbols: [], dir: '', status: '', state: '', span: '', reviewed: '', ratings: [],
    weekdays: [], months: [], entryFrom: '', entryTo: '', exitFrom: '', exitTo: '', holdMin: '', holdMax: '', holdUnit: 'min',
    entryMin: '', entryMax: '', exitMin: '', exitMax: '', rMin: '', rMax: '', qtyMin: '', qtyMax: '', volMin: '', volMax: '',
    setups: [], mistakes: [], emotions: [],
  });
  const LISTS = ['symbols', 'ratings', 'weekdays', 'months', 'setups', 'mistakes', 'emotions'];
  const RANGES = [['entryFrom', 'entryTo'], ['exitFrom', 'exitTo'], ['holdMin', 'holdMax'], ['entryMin', 'entryMax'], ['exitMin', 'exitMax'], ['rMin', 'rMax'], ['qtyMin', 'qtyMax'], ['volMin', 'volMax']];
  const SINGLES = ['dir', 'status', 'state', 'span', 'reviewed'];

  /* gespeicherten Filter lesen, alte Felder übernehmen */
  function normalize(raw) {
    const f = Object.assign(EMPTY(), raw || {});
    for (const k of LISTS) f[k] = Array.isArray(f[k]) ? f[k].slice() : [];
    if (f.status === 'open') { f.status = ''; if (!f.state) f.state = 'open'; }
    if (Array.isArray(f.tags) && f.tags.length) {
      const em = new Set((S.data.tags && S.data.tags.emotions) || []);
      for (const t of f.tags) (em.has(t) ? f.emotions : f.mistakes).push(t);
    }
    delete f.tags;
    f.ratings = f.ratings.map(Number).filter(n => n >= 1 && n <= 5); f.weekdays = f.weekdays.map(Number); f.months = f.months.map(Number);
    return f;
  }
  const state = () => normalize(S.settings.dashFilter);
  function count(f) {
    let n = 0; for (const k of LISTS) n += f[k].length ? 1 : 0; for (const k of SINGLES) n += f[k] ? 1 : 0; for (const [a, b] of RANGES) n += (f[a] !== '' || f[b] !== '') ? 1 : 0;
    return n;
  }
  const num = v => (v === '' || v == null || isNaN(Number(v)) ? null : Number(v));
  const inRange = (v, lo, hi) => (lo == null || v >= lo) && (hi == null || v <= hi);
  const minutes = s => { const m = /^(\d{1,2}):(\d{2})/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : null; };
  /* Uhrzeit-Spanne; „von“ nach „bis“ (z. B. 22:00–02:00) geht über Mitternacht */
  const inTime = (d, from, to) => { const a = minutes(from), b = minutes(to); if (a == null && b == null) return true; const v = d.getHours() * 60 + d.getMinutes(); if (a != null && b != null && a > b) return v >= a || v <= b; return (a == null || v >= a) && (b == null || v <= b); };
  /* Reviewed = Bewertung vergeben oder Notiz geschrieben */
  const isReviewed = t => Number(t.rating) > 0 || !!String(t.notes || '').replace(/<[^>]*>/g, '').trim();
  const todayKey = () => C.dayKey(new Date());

  function apply(list, f) {
    if (!count(f)) return list;
    const hu = f.holdUnit === 'h' ? 60 : f.holdUnit === 'd' ? 1440 : 1;
    const hMin = num(f.holdMin), hMax = num(f.holdMax);
    return list.filter(t => {
      if (f.symbols.length && !f.symbols.includes(t.symbol)) return false;
      if (f.dir && (f.dir === 'long' ? t.direction < 0 : t.direction > 0)) return false;
      if (f.status && t.status !== f.status) return false;
      if (f.state && (f.state === 'open' ? t.closed : !t.closed)) return false;
      if (f.span) { const multi = t.closed ? C.dayKey(t.close) !== t.dayKey : t.dayKey < todayKey(); if (f.span === 'intraday' ? (multi || !t.closed) : !multi) return false; }
      if (f.reviewed && (f.reviewed === 'yes') !== isReviewed(t)) return false;
      if (f.ratings.length && !f.ratings.includes(Number(t.rating) || 0)) return false;
      if (f.weekdays.length && !f.weekdays.includes((t.open.getDay() + 6) % 7)) return false;
      if (f.months.length && !f.months.includes(t.open.getMonth())) return false;
      if ((f.entryFrom || f.entryTo) && !inTime(t.open, f.entryFrom, f.entryTo)) return false;
      if (f.exitFrom || f.exitTo) { if (!t.close || !inTime(t.close, f.exitFrom, f.exitTo)) return false; }
      if (hMin != null || hMax != null) { if (t.holdingMin == null || !inRange(t.holdingMin, hMin == null ? null : hMin * hu, hMax == null ? null : hMax * hu)) return false; }
      if (!inRange(t.entryPrice, num(f.entryMin), num(f.entryMax))) return false;
      if (num(f.exitMin) != null || num(f.exitMax) != null) { if (t.exitPrice == null || !inRange(t.exitPrice, num(f.exitMin), num(f.exitMax))) return false; }
      if (num(f.rMin) != null || num(f.rMax) != null) { if (t.r == null || !inRange(t.r, num(f.rMin), num(f.rMax))) return false; }
      if (!inRange(t.quantity, num(f.qtyMin), num(f.qtyMax))) return false;
      if (!inRange(t.notional, num(f.volMin), num(f.volMax))) return false;
      if (f.setups.length && !f.setups.includes(t.setup || '')) return false;
      if (f.mistakes.length && !f.mistakes.some(x => (t.mistakes || []).includes(x))) return false;
      if (f.emotions.length && !f.emotions.some(x => (t.emotions || []).includes(x))) return false;
      return true;
    });
  }

  /* ---------- Seitenleiste ---------- */
  const ui = () => App.state.dashFilterUI || (App.state.dashFilterUI = { open: false, draft: null, pick: null, q: '', closed: {} });
  const uniq = a => [...new Set(a.filter(Boolean))];
  function options(key, all) {
    if (key === 'symbols') return uniq(all.map(t => t.symbol)).sort();
    if (key === 'setups') return uniq([...(S.data.tags.setups || []), ...all.map(t => t.setup)]);
    if (key === 'mistakes') return uniq([...(S.data.tags.mistakes || []), ...all.flatMap(t => t.mistakes || [])]);
    if (key === 'emotions') return uniq([...(S.data.tags.emotions || []), ...all.flatMap(t => t.emotions || [])]);
    return [];
  }
  const PICK_LABEL = { symbols: 'Symbol', setups: 'Setup', mistakes: 'Fehler', emotions: 'Emotion' };
  const CHIP_CLS = { symbols: '', setups: 'setup', mistakes: 'mistake', emotions: 'emotion' };
  function pickerHTML(key, f, all) {
    const u = ui(); const sel = f[key];
    const chips = sel.map(v => `<span class="fd-chip ${CHIP_CLS[key]}"><span>${esc(v)}</span><button type="button" data-action="dash-f-del" data-key="${key}" data-value="${esc(v)}" aria-label="Entfernen">${I.close}</button></span>`).join('');
    let drop = '';
    if (u.pick === key) {
      const ql = u.q.trim().toLowerCase(); const opts = options(key, all).filter(v => !sel.includes(v) && (!ql || v.toLowerCase().includes(ql)));
      const own = key === 'symbols' && ql && !options(key, all).some(v => v.toLowerCase() === ql) ? `<button type="button" class="item" data-action="dash-f-add" data-key="${key}" data-value="${esc(u.q.trim().toUpperCase())}">${I.plus}<span>„${esc(u.q.trim().toUpperCase())}“ hinzufügen</span></button>` : '';
      drop = `<div class="fd-drop"><div class="q">${I.search}<input class="input" id="fd-q" placeholder="Suchen …" value="${esc(u.q)}" data-input="dash-f-q" autocomplete="off"></div><div class="fd-opts" id="fd-opts">${optsHTML(key, opts) + own || '<div class="small faint" style="padding:8px 10px">Nichts gefunden</div>'}</div></div>`;
    }
    return `<div class="fd-pick" data-key="${key}">${chips}<button type="button" class="fd-add ${u.pick === key ? 'on' : ''}" data-action="dash-f-pick" data-key="${key}">${I.plus}<span>${PICK_LABEL[key]}</span></button>${drop}</div>`;
  }
  const optsHTML = (key, opts) => opts.slice(0, 60).map(v => `<button type="button" class="item" data-action="dash-f-add" data-key="${key}" data-value="${esc(v)}">${esc(v)}</button>`).join('');
  const seg = (key, f, opts) => `<div class="fd-seg">${opts.map(([v, l]) => `<button type="button" data-action="dash-f-set" data-key="${key}" data-value="${v}" aria-pressed="${f[key] === v}">${l}</button>`).join('')}</div>`;
  const toggles = (key, f, opts, cls = '') => `<div class="fd-tog ${cls}">${opts.map(([v, l]) => `<button type="button" data-action="dash-f-toggle" data-key="${key}" data-value="${v}" aria-pressed="${f[key].includes(v)}">${l}</button>`).join('')}</div>`;
  const pair = (a, b, f, o = {}) => `<div class="fd-pair"><input class="input" type="${o.type || 'number'}" ${o.step ? `step="${o.step}"` : 'step="any"'} placeholder="${o.ph1 || 'Min'}" value="${esc(f[a])}" data-input="dash-f-input" data-key="${a}" aria-label="${o.l1 || 'Von'}"><span class="fd-dash">–</span><input class="input" type="${o.type || 'number'}" ${o.step ? `step="${o.step}"` : 'step="any"'} placeholder="${o.ph2 || 'Max'}" value="${esc(f[b])}" data-input="dash-f-input" data-key="${b}" aria-label="${o.l2 || 'Bis'}">${o.after || ''}</div>`;
  const row = (label, body, hint) => `<div class="fd-row"><div class="fd-l">${label}${hint ? `<span class="fd-hint">${hint}</span>` : ''}</div><div class="fd-c">${body}</div></div>`;
  function group(id, title, active, body) {
    const u = ui(); const open = !u.closed[id];
    return `<section class="fd-group ${open ? 'open' : ''}"><button type="button" class="fd-gh" data-action="dash-f-group" data-id="${id}" aria-expanded="${open}"><span>${title}</span>${active ? `<b class="cntb">${active}</b>` : ''}${I.chev}</button>${open ? `<div class="fd-gb">${body}</div>` : ''}</section>`;
  }
  const activeIn = (f, keys) => keys.reduce((n, k) => n + (Array.isArray(k) ? ((f[k[0]] !== '' || f[k[1]] !== '') ? 1 : 0) : Array.isArray(f[k]) ? (f[k].length ? 1 : 0) : (f[k] ? 1 : 0)), 0);
  function bodyHTML(f, all) {
    const wd = fmt.weekdays(); const loc = root.I18N ? root.I18N.locale() : 'de-DE';
    const mon = [...Array(12)].map((_, m) => { const s = new Intl.DateTimeFormat(loc, { month: 'short' }).format(new Date(2024, m, 1)).replace(/\.$/, ''); return [m, s]; });
    const trade = group('trade', 'Trade', activeIn(f, ['symbols', 'dir', 'status', 'state', 'span', 'reviewed', 'ratings']),
      row('Symbol', pickerHTML('symbols', f, all)) +
      row('Richtung', seg('dir', f, [['', 'Alle'], ['long', 'Long'], ['short', 'Short']])) +
      row('Ergebnis', seg('status', f, [['', 'Alle'], ['win', 'Gewinn'], ['loss', 'Verlust'], ['be', 'Break-even']])) +
      row('Offen / Geschlossen', seg('state', f, [['', 'Alle'], ['open', 'Offen'], ['closed', 'Geschlossen']])) +
      row('Intraday / Multiday', seg('span', f, [['', 'Alle'], ['intraday', 'Intraday'], ['multiday', 'Multiday']])) +
      row('Reviewed', seg('reviewed', f, [['', 'Alle'], ['yes', 'Reviewed'], ['no', 'Unreviewed']]), 'Bewertung oder Notiz vorhanden') +
      row('Trade-Bewertung', toggles('ratings', f, [1, 2, 3, 4, 5].map(n => [n, '★'.repeat(n)]), 'stars')));
    const time = group('time', 'Zeit', activeIn(f, ['weekdays', 'months', ['entryFrom', 'entryTo'], ['exitFrom', 'exitTo'], ['holdMin', 'holdMax']]),
      row('Wochentag', toggles('weekdays', f, wd.map((w, i) => [i, w]), 'wd')) +
      row('Monat', toggles('months', f, mon, 'mon')) +
      row('Einstiegszeit', pair('entryFrom', 'entryTo', f, { type: 'time', step: '60', ph1: '', ph2: '' })) +
      row('Ausstiegszeit', pair('exitFrom', 'exitTo', f, { type: 'time', step: '60', ph1: '', ph2: '' })) +
      row('Haltedauer', pair('holdMin', 'holdMax', f, { after: `<select class="select fd-unit" data-change="dash-f-input" data-key="holdUnit" aria-label="Einheit">${[['min', 'Min.'], ['h', 'Std.'], ['d', 'Tage']].map(([v, l]) => `<option value="${v}" ${f.holdUnit === v ? 'selected' : ''}>${l}</option>`).join('')}</select>` })));
    const vals = group('vals', 'Werte', activeIn(f, [['entryMin', 'entryMax'], ['exitMin', 'exitMax'], ['rMin', 'rMax'], ['qtyMin', 'qtyMax'], ['volMin', 'volMax']]),
      row('Einstiegspreis', pair('entryMin', 'entryMax', f)) +
      row('Ausstiegspreis', pair('exitMin', 'exitMax', f)) +
      row('R-Multiple', pair('rMin', 'rMax', f, { ph1: 'z. B. −1', ph2: 'z. B. 3' })) +
      row('Positionsgröße', pair('qtyMin', 'qtyMax', f), 'Stück / Kontrakte') +
      row('Volumen', pair('volMin', 'volMax', f), 'Positionswert: Stück × Kurs × Punktwert'));
    const tags = group('tags', 'Tags', activeIn(f, ['setups', 'mistakes', 'emotions']),
      row('Setup', pickerHTML('setups', f, all)) + row('Fehler', pickerHTML('mistakes', f, all)) + row('Emotionen', pickerHTML('emotions', f, all)));
    return trade + time + vals + tags;
  }
  const rangeTrades = () => App.tradesInRange(App.allTrades());
  function footHTML(f) {
    const n = apply(rangeTrades(), f).length;
    return `<button type="button" class="btn ghost" data-action="dash-f-reset" ${count(f) ? '' : 'disabled'}>Zurücksetzen</button><button type="button" class="btn primary" data-action="dash-f-apply">${I.check}<span>Anwenden</span><span class="fd-n">${n === 1 ? '1 Trade' : fmt.int(n) + ' Trades'}</span></button>`;
  }
  function panelHTML() {
    const u = ui(); const f = u.draft; const all = App.allTrades(); const n = count(f);
    return `<aside class="fd-panel fd-pop" id="fd-pop" role="dialog" aria-label="Filter"><div class="sp-head"><div><h2>Filter${n ? ` <b class="cntb">${n}</b>` : ''}</h2><div class="small muted">Gilt für alle Widgets im gewählten Zeitraum</div></div><button type="button" class="btn ghost icon" data-action="dash-f-close" aria-label="Schließen">${I.close}</button></div><div class="fd-body" id="fd-body">${bodyHTML(f, all)}</div><div class="fd-foot" id="fd-foot">${footHTML(f)}</div></aside>`;
  }
  function layer() { let l = document.getElementById('fd-layer'); if (!l) { l = document.createElement('div'); l.id = 'fd-layer'; document.body.appendChild(l); } return l; }
  /* Fenster unter den Filter-Knopf setzen: linksbündig zum Knopf, im Bild gehalten; auf dem Handy volle Breite mit 8px Rand.
     Absolut im Dokument, damit es beim Scrollen am Knopf bleibt; Höhe bis knapp über den unteren Fensterrand, der Inhalt scrollt */
  function place() {
    const pop = document.getElementById('fd-pop'), btn = document.querySelector('[data-action="dash-f-open"]'); if (!pop || !btn) return;
    const r = btn.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight, phone = vw <= 560;
    const w = phone ? vw - 16 : Math.min(440, vw - 16), left = phone ? 8 : Math.min(Math.max(8, r.left), vw - w - 8), top = r.bottom + 8;
    Object.assign(pop.style, { left: `${Math.round(left + window.scrollX)}px`, top: `${Math.round(top + window.scrollY)}px`, width: `${Math.round(w)}px`, maxHeight: `${Math.round(Math.max(340, Math.min(phone ? 9999 : 620, vh - top - 16)))}px` });
  }
  /* Inhalt neu zeichnen, Scrollposition behalten; Kopfzähler und Fuß mitziehen */
  function refresh(focusQ) {
    const u = ui(); const l = document.getElementById('fd-layer'); if (!u.open || !l) return;
    const body = l.querySelector('#fd-body'); if (!body) { l.innerHTML = panelHTML(); App.translateNow(l); place(); return; }
    const top = body.scrollTop; body.innerHTML = bodyHTML(u.draft, App.allTrades()); App.translateNow(body); body.scrollTop = top;
    l.querySelector('#fd-foot').innerHTML = footHTML(u.draft);
    const h = l.querySelector('.sp-head h2'); const n = count(u.draft); if (h) h.innerHTML = `Filter${n ? ` <b class="cntb">${n}</b>` : ''}`;
    if (focusQ) { const q = l.querySelector('#fd-q'); if (q) { q.focus({ preventScroll: true }); q.setSelectionRange(q.value.length, q.value.length); } }
  }
  /* beim Öffnen: „Trade“ offen, die anderen Bereiche nur, wenn darin schon gefiltert wird */
  const GROUP_KEYS = { time: ['weekdays', 'months', ['entryFrom', 'entryTo'], ['exitFrom', 'exitTo'], ['holdMin', 'holdMax']], vals: [['entryMin', 'entryMax'], ['exitMin', 'exitMax'], ['rMin', 'rMax'], ['qtyMin', 'qtyMax'], ['volMin', 'volMax']], tags: ['setups', 'mistakes', 'emotions'] };
  function open() { const u = ui(); u.open = true; u.draft = state(); u.pick = null; u.q = ''; u.closed = { trade: false }; for (const [g, keys] of Object.entries(GROUP_KEYS)) u.closed[g] = !activeIn(u.draft, keys); App.closePopovers(); layer().innerHTML = panelHTML(); place(); }
  function close() { const u = ui(); u.open = false; u.draft = null; u.pick = null; const l = document.getElementById('fd-layer'); if (l) l.innerHTML = ''; }
  window.addEventListener('hashchange', close);
  window.addEventListener('resize', () => { if (ui().open) place(); });
  /* Klick neben das Fenster schließt es (Entwurf verworfen, wie bei den anderen Menüs); der Filter-Knopf selbst schaltet um */
  document.addEventListener('pointerdown', e => { if (!ui().open || !e.target.closest) return; if (e.target.closest('#fd-layer') || e.target.closest('[data-action="dash-f-open"]')) return; close(); }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui().open) { if (ui().pick) { ui().pick = null; refresh(); } else close(); } });

  Object.assign(App.actions, {
    'dash-f-open'() { if (ui().open) close(); else open(); },
    'dash-f-close'() { close(); },
    'dash-f-group'(el) { const u = ui(); u.closed[el.dataset.id] = !u.closed[el.dataset.id]; refresh(); },
    'dash-f-set'(el) { const u = ui(); u.draft[el.dataset.key] = el.dataset.value; refresh(); },
    'dash-f-toggle'(el) { const u = ui(); const k = el.dataset.key; const v = Number(el.dataset.value); const a = u.draft[k]; u.draft[k] = a.includes(v) ? a.filter(x => x !== v) : [...a, v].sort((x, y) => x - y); refresh(); },
    'dash-f-pick'(el) { const u = ui(); u.pick = u.pick === el.dataset.key ? null : el.dataset.key; u.q = ''; refresh(true); },
    'dash-f-q'(el) { const u = ui(); u.q = el.value; const k = u.pick; if (!k) return; const all = App.allTrades(); const ql = u.q.trim().toLowerCase(); const opts = options(k, all).filter(v => !u.draft[k].includes(v) && (!ql || v.toLowerCase().includes(ql))); const box = document.getElementById('fd-opts'); if (!box) return; const own = k === 'symbols' && ql && !options(k, all).some(v => v.toLowerCase() === ql) ? `<button type="button" class="item" data-action="dash-f-add" data-key="${k}" data-value="${esc(u.q.trim().toUpperCase())}">${I.plus}<span>„${esc(u.q.trim().toUpperCase())}“ hinzufügen</span></button>` : ''; box.innerHTML = optsHTML(k, opts) + own || '<div class="small faint" style="padding:8px 10px">Nichts gefunden</div>'; },
    'dash-f-add'(el) { const u = ui(); const k = el.dataset.key, v = el.dataset.value; if (!u.draft[k].includes(v)) u.draft[k] = [...u.draft[k], v]; u.q = ''; refresh(true); },
    'dash-f-del'(el) { const u = ui(); const k = el.dataset.key; u.draft[k] = u.draft[k].filter(x => x !== el.dataset.value); refresh(); },
    /* Zahlen und Uhrzeiten: ohne Neuzeichnen (Fokus bleibt), nur Zähler und Fuß aktualisieren */
    'dash-f-input'(el) { const u = ui(); if (!u.draft) return; u.draft[el.dataset.key] = el.value; const l = document.getElementById('fd-layer'); if (!l) return; l.querySelector('#fd-foot').innerHTML = footHTML(u.draft); const h = l.querySelector('.sp-head h2'); const n = count(u.draft); if (h) h.innerHTML = `Filter${n ? ` <b class="cntb">${n}</b>` : ''}`; },
    'dash-f-reset'() { const u = ui(); u.draft = EMPTY(); u.pick = null; refresh(); },
    'dash-f-apply'() { const u = ui(); const f = u.draft; S.setSetting('dashFilter', count(f) ? f : EMPTY()); close(); App.rerender(); },
  });
  /* Enter in der Suche: ersten Treffer (oder eigenes Symbol) übernehmen */
  document.addEventListener('keydown', e => { if (e.key !== 'Enter' || !e.target || e.target.id !== 'fd-q') return; e.preventDefault(); const first = document.querySelector('#fd-opts [data-action="dash-f-add"]'); if (first) first.click(); });

  root.DashFilter = { EMPTY, normalize, state, count, apply, isReviewed, open, close };
})(typeof self !== 'undefined' ? self : this);
