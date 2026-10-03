/* Zeitraum-Auswahl „Benutzerdefiniert“ im Zeitraum-Menü: zwei Monate nebeneinander (auf dem Handy einer).
   Erster Klick setzt den Start, zweiter Klick das Ende (früherer Tag wird automatisch zum Start), „Anwenden“ übernimmt.
   Gleiche Optik wie der Kalender der Datumsfelder (datepicker.js); Monats- und Tagesnamen in der gewählten Sprache. */
(function (root) {
  'use strict';
  const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MONTHS_S = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
  const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const LOC = () => (root.I18N && root.I18N.lang() !== 'de' ? root.I18N.locale() : null);
  const fmtD = (o, d) => new Intl.DateTimeFormat(LOC(), o).format(d);
  const monthTitle = (y, m) => (LOC() ? fmtD({ month: 'long', year: 'numeric' }, new Date(y, m, 1)) : `${MONTHS[m]} ${y}`);
  const dayShort = d => (LOC() ? fmtD({ day: 'numeric', month: 'short', year: 'numeric' }, d) : `${d.getDate()}. ${MONTHS_S[d.getMonth()]} ${d.getFullYear()}`);
  const dayLong = d => (LOC() ? fmtD({ day: 'numeric', month: 'long', year: 'numeric' }, d) : `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`);
  const weekdays = () => (LOC() ? [0, 1, 2, 3, 4, 5, 6].map(i => fmtD({ weekday: 'short' }, new Date(2024, 0, 1 + i)).replace(/\.$/, '')) : WD);
  const pad = n => String(n).padStart(2, '0');
  const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = k => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(k || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC = { prev: svg('<path d="M15 6l-6 6 6 6"/>'), next: svg('<path d="M9 6l6 6-6 6"/>') };
  /* Zustand der offenen Auswahl: from/to als JJJJ-MM-TT, view = linker Monat */
  const st = { from: '', to: '', view: { y: 0, m: 0 } };
  let inited = false;

  function reset(from, to) {
    st.from = parse(from) ? from : ''; st.to = parse(to) ? to : '';
    if (st.from && st.to && st.to < st.from) [st.from, st.to] = [st.to, st.from];
    /* gespeicherter Zeitraum: Startmonat links; sonst Vormonat links, aktueller Monat rechts */
    const base = parse(st.from); const now = new Date();
    st.view = base ? { y: base.getFullYear(), m: base.getMonth() } : { y: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(), m: (now.getMonth() + 11) % 12 };
  }
  function monthHTML(y, m) {
    const first = new Date(y, m, 1); const lead = (first.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate(); const today = keyOf(new Date());
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const n = i - lead + 1;
      if (n < 1 || n > days) { cells += '<span class="rr-day blank"></span>'; continue; }
      const d = new Date(y, m, n); const k = keyOf(d); const c = ['rr-day'];
      if (k === today) c.push('today');
      if (k === st.from) c.push('start'); if (k === (st.to || '')) c.push('end');
      if (st.from && st.to && k > st.from && k < st.to) c.push('in');
      cells += `<button type="button" class="${c.join(' ')}" data-rr="day" data-k="${k}" aria-label="${dayLong(d)}"${k === st.from || k === st.to ? ' aria-pressed="true"' : ''}${k === today ? ' aria-current="date"' : ''}>${n}</button>`;
    }
    return `<div class="rr-m"><div class="rr-m-head"><button type="button" class="rr-nav rr-prev" data-rr="prev" aria-label="Voriger Monat">${IC.prev}</button><span class="rr-m-title">${monthTitle(y, m)}</span><button type="button" class="rr-nav rr-next" data-rr="next" aria-label="Nächster Monat">${IC.next}</button></div><div class="rr-week" aria-hidden="true">${weekdays().map(w => `<span>${w}</span>`).join('')}</div><div class="rr-grid">${cells}</div></div>`;
  }
  function inner() {
    const { y, m } = st.view; const y2 = m === 11 ? y + 1 : y, m2 = (m + 1) % 12;
    const f = parse(st.from), t = parse(st.to);
    const sum = f ? `<b>${dayShort(f)}</b><span class="rr-dash">–</span><b>${t ? dayShort(t) : '…'}</b>` : '';
    return `<div class="rr-months">${monthHTML(y, m)}${monthHTML(y2, m2)}</div>
      <div class="rr-foot"><span class="rr-sum">${sum ? `<span class="no-i18n rr-dates">${sum}</span>` : '<span>Start- und Enddatum wählen</span>'}</span><span class="rr-btns">${f ? '<button type="button" class="btn sm ghost" data-rr="clear">Zurücksetzen</button>' : ''}<button type="button" class="btn sm primary" data-action="range-custom" ${f ? '' : 'disabled'}>Anwenden</button></span></div>`;
  }
  /* Markup für das Zeitraum-Menü (bei jedem Seitenaufbau neu, mit dem gespeicherten Zeitraum) */
  function html(from, to) { reset(from, to); return `<div class="rr-range" data-rr-root>${inner()}</div>`; }
  function refresh(box) { if (box) box.innerHTML = inner(); }
  /* Vorschau beim Überfahren: zwischen Start und Mauszeiger hell markieren, solange das Ende fehlt */
  function preview(box, k) {
    box.querySelectorAll('.rr-day.pv').forEach(x => x.classList.remove('pv', 'pv-end'));
    if (!st.from || st.to || !k || k === st.from) return;
    const lo = k < st.from ? k : st.from, hi = k < st.from ? st.from : k;
    box.querySelectorAll('.rr-day[data-k]').forEach(x => { const kk = x.dataset.k; if (kk > lo && kk < hi) x.classList.add('pv'); if (kk === k) x.classList.add('pv-end'); });
  }
  function init() {
    if (inited || typeof document === 'undefined') return; inited = true;
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-rr]'); if (!b) return; const box = b.closest('[data-rr-root]'); if (!box) return;
      const a = b.dataset.rr;
      if (a === 'prev' || a === 'next') { const v = st.view; const t = new Date(v.y, v.m + (a === 'next' ? 1 : -1), 1); st.view = { y: t.getFullYear(), m: t.getMonth() }; }
      else if (a === 'clear') { st.from = ''; st.to = ''; }
      else if (a === 'day') {
        const k = b.dataset.k;
        if (!st.from || st.to) { st.from = k; st.to = ''; }
        else if (k < st.from) { st.to = st.from; st.from = k; }
        else st.to = k;
      }
      refresh(box);
    });
    document.addEventListener('mouseover', e => { const d = e.target.closest && e.target.closest('.rr-day[data-k]'); const box = d && d.closest('[data-rr-root]'); if (box) preview(box, d.dataset.k); });
  }
  /* gewählter Zeitraum; ohne Ende gilt der Starttag allein */
  const value = () => ({ from: st.from, to: st.to || st.from });
  root.RangePicker = { html, value, init };
})(typeof self !== 'undefined' ? self : this);
