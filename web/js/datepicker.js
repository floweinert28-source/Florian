/* Kalender im Journalyst-Design für Datumsfelder (Datum, Datum mit Uhrzeit, Monat).
   Datum mit Uhrzeit: rechts neben dem Kalender zwei Spalten für Stunde und Minute; ein Klick setzt den Wert sofort,
   der Kalender bleibt offen, bis „Fertig“, „Jetzt“, Enter oder ein Klick daneben ihn schließt.
   Das native Feld bleibt zum Tippen und für Formulare (Wert, Pflichtfeld, Ereignisse), ersetzt wird nur das Aufklapp-Fenster des Browsers.
   Auf Touch-Geräten bleibt der System-Kalender, der dort zur Bedienung passt. Von/Bis-Paare markieren sich über data-dp-group. */
(function (root) {
  'use strict';
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MONTHS_S = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const TYPES = { date: 1, 'datetime-local': 1, month: 1 };
  /* Monats- und Tagesnamen in der gewählten Sprache (i18n.js); Deutsch nutzt die festen Listen oben */
  const LOC = () => (root.I18N && root.I18N.lang() !== 'de' ? root.I18N.locale() : null);
  const fmtD = (o, d) => new Intl.DateTimeFormat(LOC(), o).format(d);
  const monthTitle = (y, m) => LOC() ? fmtD({ month: 'long', year: 'numeric' }, new Date(y, m, 1)) : `${MONTHS[m]} ${y}`;
  const monthShort = m => LOC() ? fmtD({ month: 'short' }, new Date(2020, m, 1)) : MONTHS_S[m];
  const dayLabel = d => LOC() ? fmtD({ day: 'numeric', month: 'long', year: 'numeric' }, d) : `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const monthLabel = (y, m) => LOC() ? fmtD({ month: 'long', year: 'numeric' }, new Date(y, m, 1)) : `${MONTHS[m]} ${y}`;
  const weekdays = () => LOC() ? [0, 1, 2, 3, 4, 5, 6].map(i => fmtD({ weekday: 'short' }, new Date(2024, 0, 1 + i))) : WD;
  const pad = n => String(n).padStart(2, '0');
  const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = k => { const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(k || ''); return m ? new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1) : null; };
  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
  const fine = () => !root.matchMedia || root.matchMedia('(pointer: fine)').matches;
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = { prev: svg('<path d="M15 6l-6 6 6 6"/>'), next: svg('<path d="M9 6l6 6-6 6"/>'), caret: svg('<path d="M6 9l6 6 6-6"/>') };
  let el = null, input = null, view = null, focusKey = '', inited = false;
  const isDT = () => !!input && input.type === 'datetime-local';
  const nowHM = () => { const n = new Date(); return `${pad(n.getHours())}:${pad(n.getMinutes())}`; };

  const isField = t => !!t && t.tagName === 'INPUT' && !!TYPES[t.type] && !t.disabled && !t.readOnly;
  const isOpen = () => !!el && el.classList.contains('open') && !el.classList.contains('closing');
  /* gewählter Tag als JJJJ-MM-TT (beim Monatsfeld der Erste des Monats) */
  const dayOf = inp => { const v = (inp && inp.value) || ''; return inp && inp.type === 'month' ? (v ? v.slice(0, 7) + '-01' : '') : v.slice(0, 10); };
  /* Partnerfeld eines Zeitraums: gleiche data-dp-group im selben Formular */
  const partner = inp => { const g = inp && inp.dataset.dpGroup; if (!g) return null; const scope = inp.form || document; return [...scope.querySelectorAll('input[data-dp-group]')].find(x => x !== inp && x.dataset.dpGroup === g) || null; };
  const limits = inp => { const f = v => (v ? (inp.type === 'month' ? v.slice(0, 7) + '-01' : v.slice(0, 10)) : ''); return { min: f(inp.min), max: f(inp.max) }; };

  function daysHTML() {
    const first = new Date(view.y, view.m, 1); const start = new Date(view.y, view.m, 1 - (first.getDay() + 6) % 7);
    const sel = dayOf(input), today = keyOf(new Date()), p = partner(input), pk = p ? dayOf(p) : '';
    const lo = sel && pk ? (sel < pk ? sel : pk) : '', hi = sel && pk ? (sel < pk ? pk : sel) : '';
    const { min, max } = limits(input);
    /* Tastaturfokus bleibt im sichtbaren Monat */
    const ym = `${view.y}-${pad(view.m + 1)}`; if (!focusKey || focusKey.slice(0, 7) !== ym) focusKey = sel.slice(0, 7) === ym ? sel : today.slice(0, 7) === ym ? today : keyOf(first);
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i); const k = keyOf(d);
      const c = ['dp-day']; if (d.getMonth() !== view.m) c.push('out'); if (k === today) c.push('today'); if (k === sel) c.push('sel'); else if (k === pk) c.push('edge'); if (lo && k > lo && k < hi) c.push('in');
      const off = (min && k < min) || (max && k > max);
      cells += `<button type="button" class="${c.join(' ')}" data-dp="day" data-k="${k}" tabindex="${k === focusKey ? '0' : '-1'}" aria-label="${dayLabel(d)}"${k === sel ? ' aria-pressed="true"' : ''}${k === today ? ' aria-current="date"' : ''}${off ? ' disabled' : ''}>${d.getDate()}</button>`;
    }
    return `<div class="dp-week" aria-hidden="true">${weekdays().map(w => `<span>${w}</span>`).join('')}</div><div class="dp-grid">${cells}</div>`;
  }
  function monthsHTML() {
    const s = parse(dayOf(input)), now = new Date(); const { min, max } = limits(input);
    return `<div class="dp-months">${MONTHS_S.map((n, m) => {
      const mk = `${view.y}-${pad(m + 1)}`; const sel = !!s && s.getFullYear() === view.y && s.getMonth() === m; const cur = now.getFullYear() === view.y && now.getMonth() === m;
      const off = (min && mk < min.slice(0, 7)) || (max && mk > max.slice(0, 7));
      return `<button type="button" class="dp-month${sel ? ' sel' : ''}${cur ? ' today' : ''}" data-dp="month" data-m="${m}" aria-label="${monthLabel(view.y, m)}"${sel ? ' aria-pressed="true"' : ''}${off ? ' disabled' : ''}>${monthShort(m)}</button>`;
    }).join('')}</div>`;
  }
  /* Stunde und Minute als Spalten; ohne Wert ist nichts markiert, die Spalten stehen dann auf der aktuellen Uhrzeit */
  function timeHTML() {
    const t = (input.value || '').slice(11, 16); const cur = { hour: t ? +t.slice(0, 2) : -1, min: t ? +t.slice(3, 5) : -1 };
    const col = (kind, n, label) => `<div class="dp-tcol" data-col="${kind}" role="group" aria-label="${label}">${Array.from({ length: n }, (_, i) => `<button type="button" class="dp-t${i === cur[kind] ? ' sel' : ''}" data-dp="${kind}" data-v="${i}" tabindex="${i === Math.max(0, cur[kind]) ? '0' : '-1'}"${i === cur[kind] ? ' aria-pressed="true"' : ''}>${pad(i)}</button>`).join('')}</div>`;
    return `<div class="dp-time"><div class="dp-thead"><span class="dp-tval${t ? '' : ' empty'}">${t || '--:--'}</span></div><div class="dp-week dp-tweek" aria-hidden="true"><span>Std</span><span>Min</span></div><div class="dp-tcols">${col('hour', 24, 'Stunde')}${col('min', 60, 'Minute')}</div></div>`;
  }
  /* gewählte (sonst aktuelle) Stunde und Minute mittig in ihre Spalte holen */
  function centerTimes() {
    if (!el) return; const now = new Date();
    el.querySelectorAll('.dp-tcol').forEach(c => { const b = c.querySelector('.dp-t.sel') || c.querySelector(`.dp-t[data-v="${c.dataset.col === 'hour' ? now.getHours() : now.getMinutes()}"]`); if (b) c.scrollTop = b.offsetTop - (c.clientHeight - b.offsetHeight) / 2; });
  }
  function render() {
    if (!el || !input) return;
    const keep = [...el.querySelectorAll('.dp-tcol')].map(c => c.scrollTop); const dt = isDT();
    const months = view.mode === 'months', monthField = input.type === 'month';
    const title = months ? String(view.y) : monthTitle(view.y, view.m);
    const head = `<div class="dp-head">${monthField ? `<span class="dp-title">${title}</span>` : `<button type="button" class="dp-title" data-dp="mode" aria-label="${months ? 'Zurück zu den Tagen' : 'Monat und Jahr wählen'}">${title}${IC.caret}</button>`}<div class="dp-nav"><button type="button" data-dp="prev" aria-label="${months ? 'Vorheriges Jahr' : 'Vorheriger Monat'}">${IC.prev}</button><button type="button" data-dp="next" aria-label="${months ? 'Nächstes Jahr' : 'Nächster Monat'}">${IC.next}</button></div></div>`;
    const clear = input.required ? '<span></span>' : '<button type="button" class="dp-link" data-dp="clear">Löschen</button>';
    const foot = dt ? `<div class="dp-foot">${clear}<span class="dp-foot-r"><button type="button" class="dp-link" data-dp="today">Jetzt</button><button type="button" class="dp-link accent" data-dp="done">Fertig</button></span></div>`
      : `<div class="dp-foot">${clear}<button type="button" class="dp-link accent" data-dp="today">${monthField ? 'Dieser Monat' : 'Heute'}</button></div>`;
    const cal = head + (months ? monthsHTML() : daysHTML());
    el.innerHTML = dt ? `<div class="dp-body"><div class="dp-cal">${cal}</div>${timeHTML()}</div>${foot}` : cal + foot;
    el.classList.toggle('months', months); el.classList.toggle('dt', dt);
    el.querySelectorAll('.dp-tcol').forEach((c, i) => { if (keep[i] != null) c.scrollTop = keep[i]; }); /* Neuaufbau behält die Scrollstände der Uhrzeit-Spalten */
    el.setAttribute('aria-label', monthField ? 'Monat wählen' : 'Datum wählen');
  }
  /* unter dem Feld, links bündig; reicht der Platz nach unten nicht, klappt der Kalender nach oben */
  function place() {
    if (!isOpen() || !input) return;
    if (!input.isConnected) { close(true); return; }
    const r = input.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) { close(true); return; }
    const w = el.offsetWidth, h = el.offsetHeight;
    const left = Math.max(8, Math.min(r.left, vw - w - 8)); let top = r.bottom + 6;
    const up = top + h > vh - 8 && r.top - h - 6 >= 8;
    if (up) top = r.top - h - 6; else if (top + h > vh - 8) top = Math.max(8, vh - h - 8);
    el.style.left = Math.round(left) + 'px'; el.style.top = Math.round(top) + 'px'; el.classList.toggle('up', up);
  }
  function focusCurrent() { const t = el && el.querySelector('.dp-day[tabindex="0"], .dp-month.sel, .dp-month.today, .dp-month'); if (t) t.focus({ preventScroll: true }); }

  /* Wert schreiben wie eine Eingabe: input- und change-Ereignis */
  function write(inp, v) { if (inp.value !== v) { inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); } }
  function refocus(inp) { try { inp.focus({ preventScroll: true }); } catch (e) { /* ohne Fokus-Optionen */ } }
  /* Tag übernehmen; Uhrzeit bei Datum mit Uhrzeit bleibt erhalten. stay: Kalender bleibt offen (Uhrzeit noch wählbar) */
  function commit(k, stay) {
    const inp = input; if (!inp) return; let v = '';
    if (k) {
      if (inp.type === 'month') v = k.slice(0, 7);
      else if (inp.type === 'datetime-local') v = k + 'T' + ((inp.value || '').slice(11, 16) || nowHM());
      else v = k;
    }
    if (stay) { focusKey = k || focusKey; write(inp, v); render(); return; }
    close(); write(inp, v); refocus(inp);
  }
  /* Stunde oder Minute setzen; ohne Datum gilt der markierte Tag im Kalender (sonst heute) */
  function setTime(kind, n) {
    const inp = input; const v = inp.value || ''; const day = v.slice(0, 10) || focusKey || keyOf(new Date()); const t = v.slice(11, 16) || nowHM();
    write(inp, `${day}T${kind === 'hour' ? pad(n) : t.slice(0, 2)}:${kind === 'min' ? pad(n) : t.slice(3, 5)}`); render();
  }
  function done() { const inp = input; close(); if (inp && inp.isConnected) refocus(inp); }
  function onClick(e) {
    /* Klicks bleiben im Kalender: ein Neuaufbau löst das Ziel aus dem Baum, die App würde ihn sonst als Klick daneben werten */
    e.stopPropagation();
    const b = e.target.closest('[data-dp]'); if (!b || b.disabled || !input) return; const a = b.dataset.dp;
    if (a === 'prev' || a === 'next') { const s = a === 'prev' ? -1 : 1; if (view.mode === 'months') view.y += s; else { const d = new Date(view.y, view.m + s, 1); view.y = d.getFullYear(); view.m = d.getMonth(); } render(); place(); }
    else if (a === 'mode') { view.mode = view.mode === 'months' ? 'days' : 'months'; render(); place(); }
    else if (a === 'month') { const m = +b.dataset.m; if (input.type === 'month') commit(`${view.y}-${pad(m + 1)}-01`); else { view.m = m; view.mode = 'days'; focusKey = ''; render(); place(); } }
    else if (a === 'day') commit(b.dataset.k, isDT());
    else if (a === 'hour' || a === 'min') setTime(a, +b.dataset.v);
    else if (a === 'today') { if (isDT()) { const inp = input; close(); write(inp, `${keyOf(new Date())}T${nowHM()}`); refocus(inp); } else commit(keyOf(new Date())); }
    else if (a === 'done') done();
    else if (a === 'clear') commit('');
  }
  /* Pfeile: Tag und Woche, Bild auf/ab: Monat, Pos1/Ende: Wochenanfang und -ende */
  function onKey(e) {
    /* Uhrzeit-Spalten: Pfeil hoch/runter wählt die Nachbarzeit, Enter schließt */
    const tb = e.target.closest && e.target.closest('.dp-t');
    if (tb) {
      const kind = tb.dataset.dp, max = kind === 'hour' ? 24 : 60;
      if (e.key === 'Enter') { e.preventDefault(); done(); return; }
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault(); const n = (+tb.dataset.v + (e.key === 'ArrowUp' ? -1 : 1) + max) % max; setTime(kind, n);
      const nb = el.querySelector(`.dp-t[data-dp="${kind}"][data-v="${n}"]`); if (nb) { nb.focus({ preventScroll: true }); nb.scrollIntoView({ block: 'nearest' }); }
      return;
    }
    const b = e.target.closest && e.target.closest('.dp-day'); if (!b || view.mode !== 'days') return;
    const d = parse(b.dataset.k); const wd = (d.getDay() + 6) % 7;
    const shiftMonth = s => { const y = d.getFullYear(), m = d.getMonth() + s; const day = Math.min(d.getDate(), daysIn(y, m)); d.setFullYear(y, m, day); };
    switch (e.key) {
      case 'ArrowLeft': d.setDate(d.getDate() - 1); break;
      case 'ArrowRight': d.setDate(d.getDate() + 1); break;
      case 'ArrowUp': d.setDate(d.getDate() - 7); break;
      case 'ArrowDown': d.setDate(d.getDate() + 7); break;
      case 'PageUp': shiftMonth(-1); break;
      case 'PageDown': shiftMonth(1); break;
      case 'Home': d.setDate(d.getDate() - wd); break;
      case 'End': d.setDate(d.getDate() + 6 - wd); break;
      default: return;
    }
    e.preventDefault(); focusKey = keyOf(d); view.y = d.getFullYear(); view.m = d.getMonth(); render(); place(); focusCurrent();
  }
  function ensure() {
    if (el) return;
    el = document.createElement('div'); el.className = 'popover dp'; el.id = 'pop-dp'; el.setAttribute('role', 'dialog');
    el.addEventListener('mousedown', e => e.preventDefault()); /* Fokus bleibt im Feld, Tippen geht weiter */
    el.addEventListener('click', onClick); el.addEventListener('keydown', onKey);
    document.body.appendChild(el);
  }
  function open(inp, keyboard) {
    if (!isField(inp)) return;
    if (isOpen() && input === inp) { if (keyboard) focusCurrent(); return; }
    ensure(); input = inp;
    const p = partner(inp); const cur = parse(dayOf(inp)) || (p && parse(dayOf(p))) || new Date();
    view = { y: cur.getFullYear(), m: cur.getMonth(), mode: inp.type === 'month' ? 'months' : 'days' }; focusKey = dayOf(inp);
    render(); el.classList.remove('closing'); el.classList.add('open'); place(); centerTimes();
    if (keyboard) focusCurrent();
  }
  function close(now) {
    input = null; if (!el || !el.classList.contains('open')) return;
    const M = root.Motion; if (!now && M && M.enabled && M.leave) M.leave(el, 'closing', '--dur-1', () => el.classList.remove('open', 'closing')); else el.classList.remove('open', 'closing');
  }
  /* einmal nach App.bind: der eigene Klick-Handler läuft nach dem der App, die beim Klick neben ein Popover alle schließt */
  function init() {
    if (inited || typeof document === 'undefined') return; inited = true;
    document.addEventListener('click', e => { const t = e.target; if (!isField(t) || !fine()) return; e.preventDefault(); open(t, false); });
    document.addEventListener('keydown', e => { const t = e.target; if (!isField(t) || !fine()) return; if ((e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) || e.key === 'F4') { e.preventDefault(); e.stopPropagation(); open(t, true); } }, true);
    document.addEventListener('mousedown', e => { if (isOpen() && !el.contains(e.target) && e.target !== input) close(); }, true);
    document.addEventListener('focusin', e => { if (isOpen() && !el.contains(e.target) && e.target !== input) close(); });
    /* Escape schließt nur den Kalender, nicht auch Popover oder Dialog darunter */
    window.addEventListener('keydown', e => { if (e.key !== 'Escape' || !isOpen()) return; e.preventDefault(); e.stopImmediatePropagation(); const inp = input; close(); if (inp && inp.isConnected) { try { inp.focus({ preventScroll: true }); } catch (x) { /* ohne Fokus-Optionen */ } } }, true);
    /* getippte Werte zeigt der offene Kalender sofort an */
    document.addEventListener('input', e => { if (!isOpen() || e.target !== input) return; const d = parse(dayOf(input)); if (d) { view.y = d.getFullYear(); view.m = d.getMonth(); focusKey = keyOf(d); } render(); place(); });
    window.addEventListener('resize', () => place());
    document.addEventListener('scroll', () => place(), true);
  }
  root.DatePicker = { init, open, close, isOpen };
})(typeof self !== 'undefined' ? self : this);
