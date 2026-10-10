/* News: Wirtschaftskalender der kommenden Tage (Journal → News).
   Die Termine kommen über den eigenen Journalyst-Server (/api/news), der den öffentlichen Wochen-Export des
   ForexFactory-Kalenders lädt: diese Woche und, sobald veröffentlicht, die nächste. Der Browser darf die Quelle nicht
   direkt abrufen. Ohne eingerichteten Server zeigt die Seite eine deutlich markierte Beispielansicht ohne Werte.
   Filter (Wichtigkeit, Währung) bleiben in den Einstellungen (newsFilter). */
(function (root) {
  'use strict';
  const S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;
  const TTL = 10 * 60 * 1000; /* nach 10 Minuten neu laden */
  const IMPACTS = [['high', 'Hoch'], ['medium', 'Mittel'], ['low', 'Niedrig'], ['holiday', 'Feiertage']];
  const LEVEL = { high: 3, medium: 2, low: 1, holiday: 0 };
  const cfg = () => Object.assign({ url: '', token: '' }, S.settings.mentor || {});
  const baseUrl = () => cfg().url.trim().replace(/\/+$/, '');
  const configured = () => /^https?:\/\//.test(baseUrl());
  /* Zustand je Serveradresse: eine geänderte Adresse lädt neu */
  const st = () => { const u = baseUrl(); if (!App.state.news || App.state.news.url !== u) App.state.news = { url: u, events: null, updated: null, stale: false, loading: false, error: '', at: 0, tried: 0 }; return App.state.news; };
  const filt = () => { const f = Object.assign({ impact: ['high', 'medium'], cur: [] }, S.settings.newsFilter || {}); f.impact = Array.isArray(f.impact) ? f.impact : ['high', 'medium']; f.cur = Array.isArray(f.cur) ? f.cur : []; return f; };
  const pad = n => String(n).padStart(2, '0');
  const dayKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  async function load(force) {
    const s = st(); if (s.loading || !configured()) return;
    /* ohne „force“ höchstens alle 10 Minuten, nach einem Fehler frühestens nach einer Minute erneut */
    if (!force && s.tried && Date.now() - s.tried < (s.events && !s.error ? TTL : 60000)) return;
    s.loading = true; s.error = ''; s.tried = Date.now();
    try {
      const h = {}; if (cfg().token) h.Authorization = 'Bearer ' + cfg().token.trim();
      let r; try { r = await fetch(baseUrl() + '/api/news', { headers: h }); } catch (e) { throw new Error('Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor.'); }
      if (r.status === 401) throw new Error('Zugangstoken fehlt oder ist falsch (Einstellungen → Mentor).');
      if (r.status === 404) throw new Error('Dein Server kennt die News noch nicht. Bitte den Server auf den neuen Stand bringen.');
      if (!r.ok) throw new Error('Der Server antwortet mit Fehler ' + r.status + '.');
      const body = await r.json(); s.events = Array.isArray(body.events) ? body.events : []; s.updated = body.updated_at || null; s.stale = !!body.stale; s.at = Date.now();
    } catch (e) { s.error = e.message || 'Laden fehlgeschlagen.'; }
    finally { s.loading = false; if (App.state.route === 'news') App.rerender(); }
  }

  /* Beispielansicht ohne Server: typische Termine der nächsten Werktage, ohne Prognose- und Vorwerte, klar als Beispiel markiert */
  function examples() {
    const out = []; const base = new Date(); base.setHours(0, 0, 0, 0);
    const plan = [[0, '14:30', 'USD', 'high', 'Beispiel: Verbraucherpreise (CPI)'], [0, '16:00', 'USD', 'medium', 'Beispiel: Verbrauchervertrauen'], [1, '10:00', 'EUR', 'medium', 'Beispiel: Konjunkturerwartungen'], [1, '14:30', 'USD', 'high', 'Beispiel: Erstanträge Arbeitslosenhilfe'], [2, '20:00', 'USD', 'high', 'Beispiel: Zinsentscheid der Notenbank'], [3, '08:00', 'GBP', 'medium', 'Beispiel: BIP vorläufig'], [3, '14:15', 'EUR', 'high', 'Beispiel: Pressekonferenz der Notenbank'], [4, '14:30', 'USD', 'high', 'Beispiel: Arbeitsmarktbericht']];
    let d = new Date(base); let i = 0; const days = [];
    while (days.length < 5) { if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); d.setDate(d.getDate() + 1); if (++i > 10) break; }
    for (const [di, hm, cur, imp, title] of plan) { const t = new Date(days[di]); const [h, m] = hm.split(':'); t.setHours(+h, +m, 0, 0); out.push({ id: 'ex' + out.length, title, currency: cur, time: t.toISOString(), impact: imp, forecast: '', previous: '', actual: '', sample: true }); }
    return out;
  }

  /* Währungskürzel bleiben unübersetzt, nur „ALL“ (alle Währungen) wird zu „Alle“ */
  const curTag = c => c === 'ALL' ? '<span class="nw-cur">Alle</span>' : `<span class="nw-cur no-i18n">${esc(c)}</span>`;
  const bars = imp => imp === 'holiday' ? `<span class="nw-imp hol" title="Feiertag">${I.calendar}</span>` : `<span class="nw-imp l${LEVEL[imp] || 1}" title="${imp === 'high' ? 'Hohe Wichtigkeit' : imp === 'medium' ? 'Mittlere Wichtigkeit' : 'Niedrige Wichtigkeit'}"><i></i><i></i><i></i></span>`;
  function inText(ms) { const m = Math.round(ms / 60000); if (m < 1) return 'jetzt'; if (m < 60) return `in ${m} Min.`; const h = Math.floor(m / 60), r = m % 60; if (h < 24) return r ? `in ${h} Std. ${r} Min.` : `in ${h} Std.`; const dd = Math.round(h / 24); return dd === 1 ? 'morgen' : `in ${dd} Tagen`; }
  function dayTitle(d, today) {
    const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - today) / 86400000);
    const label = diff === 0 ? 'Heute' : diff === 1 ? 'Morgen' : '';
    return `${label ? `<span class="nw-rel">${label}</span>` : ''}<span class="nw-dn">${fmt.dayLong(d)}</span>`;
  }
  function row(e, now) {
    const t = new Date(e.time); const past = t < now; const allDay = e.impact === 'holiday';
    /* immer drei Plätze (Ist, Prognose, Vorher), damit die Spalten untereinander stehen; leere bleiben frei */
    const vals = [['Ist', e.actual], ['Prognose', e.forecast], ['Vorher', e.previous]].map(([k, v]) => v ? `<span class="nw-v"><small>${k}</small><b class="no-i18n">${esc(v)}</b></span>` : '<span class="nw-v e" aria-hidden="true"></span>').join('');
    return `<div class="nw-row${past ? ' past' : ''} imp-${e.impact}"><span class="nw-time">${allDay ? 'Ganztägig' : fmt.time(t)}</span>${bars(e.impact)}${curTag(e.currency)}<span class="nw-title${e.sample ? '' : ' no-i18n'}">${esc(e.title)}</span><span class="nw-vals">${vals}</span></div>`;
  }

  App.screens.news = {
    title: 'News',
    head: { range: false, account: false },
    unmount() { if (App._newsTick) { clearInterval(App._newsTick); App._newsTick = null; } },
    render() {
      const s = st(); const ok = configured(); if (ok) load(false);
      const sample = !ok; const events = sample ? examples() : (s.events || []);
      const f = filt(); const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const upcoming = events.filter(e => new Date(e.time) >= today); /* ab heute, vergangene Tage der Woche nicht */
      const curs = [...new Set(upcoming.map(e => e.currency))].sort((a, b) => (a === 'ALL') - (b === 'ALL') || a.localeCompare(b));
      const shown = upcoming.filter(e => f.impact.includes(e.impact) && (!f.cur.length || f.cur.includes(e.currency)));
      const next = shown.find(e => e.impact === 'high' && new Date(e.time) > now) || shown.find(e => new Date(e.time) > now && e.impact !== 'holiday');

      const IMP_COL = { high: 'var(--loss)', medium: 'var(--warn)', low: 'var(--text-2)', holiday: 'var(--be)' };
      const chip = (key, v, l, on) => `<button type="button" class="chip sel" data-action="news-f" data-key="${key}" data-value="${esc(v)}" aria-pressed="${on}"${key === 'impact' ? ` style="--lc:${IMP_COL[v]}"` : ''}>${l}</button>`;
      const filters = `<div class="nw-filters"><div class="nw-fg"><span class="lbl">Wichtigkeit</span><div class="chips">${IMPACTS.map(([v, l]) => chip('impact', v, l, f.impact.includes(v))).join('')}</div></div>${curs.length ? `<div class="nw-fg"><span class="lbl">Währung</span><div class="chips">${chip('cur', '', 'Alle', !f.cur.length)}${curs.map(c => chip('cur', c, c === 'ALL' ? 'Alle Währungen' : `<span class="no-i18n">${esc(c)}</span>`, f.cur.includes(c))).join('')}</div></div>` : ''}</div>`;

      const groups = []; for (const e of shown) { const d = new Date(e.time); const k = dayKey(d); let g = groups[groups.length - 1]; if (!g || g.k !== k) { g = { k, d, items: [] }; groups.push(g); } g.items.push(e); }
      const list = groups.map(g => `<section class="nw-day"><h3 class="nw-dh">${dayTitle(g.d, today)}<span class="nw-n">${g.items.length}</span></h3><div class="nw-rows">${g.items.map(e => row(e, now)).join('')}</div></section>`).join('');

      const hero = next ? `<div class="nw-next"><span class="nw-next-ico">${I.bell}</span><div class="grow"><div class="caption">Nächste wichtige News</div><div class="nw-next-t">${curTag(next.currency)}<b${next.sample ? '' : ' class="no-i18n"'}>${esc(next.title)}</b></div></div><div class="nw-next-when"><b data-news-in="${esc(next.time)}">${inText(new Date(next.time) - now)}</b><small>${fmt.dayLong(new Date(next.time))}, ${fmt.time(new Date(next.time))}</small></div></div>` : '';

      let body;
      if (ok && s.error && !s.events) body = U.empty('warning', 'News konnten nicht geladen werden', s.error, `<button type="button" class="btn sm" data-action="news-reload">${I.refresh} Erneut versuchen</button>`);
      else if (ok && !s.events) body = `<div class="nw-loading">${U.spin()} Termine werden geladen …</div>`;
      else body = `${hero}${filters}${shown.length ? `<div class="nw-list">${list}</div>` : U.empty('calendar', 'Keine Termine für diese Auswahl', upcoming.length ? 'Ändere die Filter, um mehr zu sehen.' : 'Für die kommenden Tage liegen noch keine Termine vor. Die nächste Woche erscheint in der Regel zum Wochenende.')}`;

      const banner = sample
        ? `<div class="nw-banner"><span>${I.info}</span><div class="grow"><b>Beispielansicht.</b> Echte Termine kommen über deinen Journalyst-Server (derselbe wie für den Mentor). <span class="muted">Die Beispiele haben keine Prognose- oder Vorwerte.</span></div><a class="btn sm" href="#/settings/mentor">Server einrichten</a></div>`
        : s.error && s.events ? `<div class="nw-banner warn"><span>${I.warning}</span><div class="grow"><span>${esc(s.error)}</span> <span>Angezeigt wird der letzte Stand.</span></div></div>`
        : s.stale ? `<div class="nw-banner warn"><span>${I.warning}</span><div class="grow">Die Quelle war zuletzt nicht erreichbar. Angezeigt wird der letzte Stand.</div></div>` : '';
      const foot = !sample && s.events ? `<div class="nw-foot small muted"><span><span>Quelle: ForexFactory-Wirtschaftskalender</span>${s.updated ? ` · <span>Stand ${fmt.time(new Date(s.updated))}</span>` : ''} · <span>Diese Woche und, sobald veröffentlicht, die nächste</span> · <span>Zeiten in deiner Zeitzone</span></span><button type="button" class="btn sm ghost" data-action="news-reload"${s.loading ? ' disabled' : ''}>${I.refresh} Aktualisieren</button></div>` : '';

      /* Countdown der nächsten News jede halbe Minute nachführen, ohne Neuaufbau; ist der Termin vorbei, kommt der nächste */
      if (App._newsTick) clearInterval(App._newsTick);
      App._newsTick = setInterval(() => { const el = document.querySelector('[data-news-in]'); if (!el) return; const left = new Date(el.dataset.newsIn) - new Date(); if (left < -60000 && App.state.route === 'news') { App.rerender(); return; } /* Termin vorbei: nächste News zeigen */ el.textContent = inText(left); }, 30000);
      return `<div class="nw-wrap">${banner}${body}${foot}</div>`;
    },
  };

  Object.assign(App.actions, {
    'news-f'(el) {
      const f = filt(); const k = el.dataset.key, v = el.dataset.value;
      if (k === 'impact') { const has = f.impact.includes(v); f.impact = has ? f.impact.filter(x => x !== v) : [...f.impact, v]; if (!f.impact.length) f.impact = [v]; }
      else f.cur = !v ? [] : f.cur.includes(v) ? f.cur.filter(x => x !== v) : [...f.cur, v];
      S.setSetting('newsFilter', f); App.rerender();
    },
    'news-reload'() { load(true); App.rerender(); },
  });
})(typeof self !== 'undefined' ? self : this);
