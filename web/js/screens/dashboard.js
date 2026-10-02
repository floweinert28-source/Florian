/* Dashboard (Aufbau nach TradeZella): Vorlagen, oberer Bereich mit bis zu 5 Kacheln, unteres Raster mit 3 Spalten, Bearbeitungsmodus */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, W = root.Widgets;
  const MAX_TOP = W.MAX_TOP;
  const st = () => App.state.dash || (App.state.dash = { editing: false, draft: null, panel: null, q: '', menu: null, first: true, booted: false });
  const clone = o => JSON.parse(JSON.stringify(o));
  function active() { const s = st(); if (!s.booted) { s.booted = true; S.data.settings.dashboardId = S.defaultDashboard().id; } return S.activeDashboard(); }
  const layout = () => { const s = st(); return s.editing && s.draft ? s.draft : active().layout; };
  const caret = I.chev.replace('<svg', '<svg class="caret"');

  /* ---------- Vorlagen-Menü ---------- */
  function tplPopHTML() {
    const s = st(); const act = active();
    return `<button type="button" class="item" data-action="dash-tpl-edit" data-id="${act.id}">${I.edit}<span>Diese Vorlage bearbeiten</span></button><button type="button" class="item" data-action="dash-tpl-new">${I.plus}<span>Neue Vorlage erstellen</span></button><hr>
      ${S.dashboards().map(t => `<div class="tpl-row ${t.id === act.id ? 'on' : ''}"><button type="button" class="item name" data-action="dash-tpl-select" data-id="${t.id}"><span class="chk">${t.id === act.id ? I.check : ''}</span><span class="grow">${esc(t.name)}</span>${t.isDefault ? '<span class="star" title="Standard-Vorlage">★</span>' : ''}</button><button type="button" class="btn ghost icon sm" data-action="dash-tpl-edit" data-id="${t.id}" title="Bearbeiten" aria-label="Vorlage bearbeiten">${I.edit}</button><button type="button" class="btn ghost icon sm" data-action="dash-tpl-menu" data-id="${t.id}" title="Mehr" aria-label="Mehr" aria-expanded="${s.menu === t.id}">${I.more}</button></div>
      ${s.menu === t.id ? `<div class="tpl-menu"><button type="button" class="item" data-action="dash-tpl-rename" data-id="${t.id}">${I.edit}<span>Umbenennen</span></button><button type="button" class="item" data-action="dash-tpl-dup" data-id="${t.id}">${I.copy}<span>Duplizieren</span></button><button type="button" class="item" data-action="dash-tpl-default" data-id="${t.id}" ${t.isDefault ? 'disabled' : ''}><span class="star-i">★</span><span>${t.isDefault ? 'Ist Standard' : 'Als Standard festlegen'}</span></button><button type="button" class="item danger" data-action="dash-tpl-delete" data-id="${t.id}" ${S.dashboards().length <= 1 ? 'disabled' : ''}>${I.trash}<span>Löschen</span></button></div>` : ''}`).join('')}`;
  }
  function refreshPop() { const p = document.getElementById('pop-tpl'); if (p) { p.innerHTML = tplPopHTML(); p.classList.add('open'); } }

  /* ---------- Widgets und Bereiche ---------- */
  function wrap(area, i, inst, html, count) {
    const s = st(); const e = W.get(inst.typ) || {}; const size = area === 'unten' ? (inst.groesse || e.groesse || 'klein') : '';
    const bar = s.editing ? `<div class="w-bar"><button type="button" class="handle" title="Ziehen zum Verschieben" aria-label="Verschieben">${I.grip}</button><span class="w-name">${esc(e.name || inst.typ)}</span>${area === 'unten' ? `<div class="seg mini">${Object.entries(W.SIZES).map(([k, l]) => `<button type="button" data-action="dash-size" data-value="${k}" aria-pressed="${size === k}">${l}</button>`).join('')}</div>` : ''}<div class="mv"><button type="button" class="btn ghost icon sm" data-action="dash-move" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Nach vorn">${area === 'oben' ? I.chevL : I.arrowUp}</button><button type="button" class="btn ghost icon sm" data-action="dash-move" data-dir="1" ${i === count - 1 ? 'disabled' : ''} aria-label="Nach hinten">${area === 'oben' ? I.chevR : I.arrowDown}</button></div><button type="button" class="btn ghost icon sm rm" data-action="dash-remove" title="Entfernen" aria-label="Widget entfernen">${I.close}</button></div>` : '';
    return `<div class="w ${s.editing ? 'editing' : ''} ${size ? 'sz-' + size : ''} ${e.hoch ? 'tall' : ''} ${e.flach ? 'flat' : ''}" data-area="${area}" data-idx="${i}" data-typ="${esc(inst.typ)}">${bar}<div class="w-body">${html}</div></div>`;
  }
  function topArea(list, d) {
    const s = st(); const items = list.map((inst, i) => wrap('oben', i, inst, W.render(inst, d, App), list.length));
    if (s.editing && list.length < MAX_TOP) items.push(`<button type="button" class="add-slot" data-action="dash-add-open" data-area="oben">${I.plus}<span>Widget hinzufügen</span></button>`);
    if (!items.length) return '';
    return `<div class="dash-top" style="--n:${items.length}">${items.join('')}</div>`;
  }
  function mainArea(list, d) {
    const s = st(); const items = list.map((inst, i) => wrap('unten', i, inst, W.render(inst, d, App), list.length));
    if (s.editing) items.push(`<button type="button" class="add-slot big" data-action="dash-add-open" data-area="unten">${I.plus}<span>Widget hinzufügen</span></button>`);
    if (!items.length) return `<div class="dashed" style="text-align:center;padding:30px">Diese Vorlage hat noch keine Widgets. Über „Vorlage bearbeiten“ fügst du welche hinzu.</div>`;
    return `<div class="dash-main ${s.editing ? 'editing' : ''}">${items.join('')}</div>`;
  }
  function skeleton(lay) { return `<div class="dash-top" style="--n:${Math.max(1, lay.oben.length)}">${lay.oben.map(() => '<div class="skel" style="height:118px"></div>').join('')}</div><div class="dash-main">${lay.unten.map(w => { const e = W.get(w.typ) || {}; return `<div class="skel sz-${w.groesse || 'klein'} ${e.hoch ? 'tall' : ''} ${e.flach ? 'flat' : ''}"></div>`; }).join('')}</div>`; }
  function panelListHTML(area, lay, q) {
    const have = new Set(lay[area].map(x => x.typ)); const full = area === 'oben' && lay.oben.length >= MAX_TOP; const ql = q.trim().toLowerCase();
    const items = W.list(area).filter(e => !ql || (e.name + ' ' + e.desc).toLowerCase().includes(ql));
    return items.map(e => { const added = have.has(e.typ); return `<div class="sp-item"><div class="pv">${W.preview(e.preview)}</div><div class="grow"><b>${esc(e.name)}</b><span class="small muted">${esc(e.desc)}</span></div><button type="button" class="btn sm ${added ? 'added' : 'primary'}" data-action="dash-add" data-typ="${e.typ}" ${added || full ? 'disabled' : ''} title="${full && !added ? 'Maximal 5 Widgets – entferne zuerst eines' : ''}">${added ? `${I.check} Hinzugefügt` : 'Hinzufügen'}</button></div>`; }).join('') || `<div class="empty" style="min-height:120px">${I.search}<b>Kein Widget gefunden</b></div>`;
  }
  function addPanel(area, lay, q) {
    const full = area === 'oben' && lay.oben.length >= MAX_TOP;
    return `<div class="panel-bg" data-action="dash-add-close"></div><aside class="side-panel" role="dialog" aria-label="Widget hinzufügen"><div class="sp-head"><div><h2>Widget hinzufügen</h2><div class="small muted">${area === 'oben' ? 'Kennzahl-Kacheln für den oberen Bereich' : 'Diagramme, Kalender und Listen für den unteren Bereich'}</div></div><button type="button" class="btn ghost icon" data-action="dash-add-close" aria-label="Schließen">${I.close}</button></div><div class="nb-search"><div class="q">${I.search}<input class="input" id="dash-add-q" placeholder="Widget suchen …" value="${esc(q)}" data-input="dash-add-q" autocomplete="off"></div></div>${full ? `<div class="banner warn">${I.warning}<span>Maximal 5 Widgets – entferne zuerst eines.</span></div>` : ''}<div class="sp-list" id="dash-add-list">${panelListHTML(area, lay, q)}</div></aside>`;
  }

  /* Performance-Recaps: Vorwoche ab Montag, Vormonat ab dem 2. (mindestens 4 geschlossene Trades) */
  function recaps(all) {
    const n = S.settings.notifications || {}; const shown = S.settings.recapShown || {}; const out = []; const now = new Date(); const closed = C.closedOnly(all);
    const build = (kind, key, from, to, label) => { const list = closed.filter(t => t.close >= from && t.close <= to); if (list.length < 4) return; const s = C.summary(list); const days = C.dailyAggregation(list); const best = days.length ? days.reduce((a, b) => b.pnl > a.pnl ? b : a) : null; out.push({ kind, key, title: `${kind === 'week' ? 'Wochen' : 'Monats'}-Recap: ${label}`, text: `${s.n} Trades · Netto ${fmt.cur(s.total, { signed: true })} · Trefferquote ${fmt.pct(s.winRate)} · Profit-Faktor ${fmt.factor(s.pf)}${best ? ` · bester Tag ${fmt.dateShort(best.day)} mit ${fmt.cur(best.pnl, { signed: true })}` : ''}` }); };
    if (n.weekly !== false) { const monday = C.weekStart(now); const key = C.dayKey(monday); if (shown.week !== key) { const from = new Date(monday); from.setDate(from.getDate() - 7); const to = new Date(monday.getTime() - 1); build('week', key, from, to, `${fmt.dateShort(from)} bis ${fmt.dateShort(to)}`); } }
    if (n.monthly !== false && now.getDate() >= 2) { const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; if (shown.month !== key) { const from = new Date(now.getFullYear(), now.getMonth() - 1, 1); const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); build('month', key, from, to, from.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })); } }
    return out;
  }
  Object.assign(App.actions, { 'recap-dismiss'(el) { const shown = Object.assign({}, S.settings.recapShown || {}); shown[el.dataset.kind] = el.dataset.key; S.setSetting('recapShown', shown); App.rerender(); } });

  /* ---------- Filter (Symbol, Richtung, Status, Setup, Tags) ---------- */
  const FILTER_EMPTY = () => ({ symbols: [], dir: '', status: '', setups: [], tags: [] });
  function filterState() { return Object.assign(FILTER_EMPTY(), S.settings.dashFilter || {}); }
  function filterCount(f) { return f.symbols.length + f.setups.length + f.tags.length + (f.dir ? 1 : 0) + (f.status ? 1 : 0); }
  function applyFilter(list, f) {
    return list.filter(t => (!f.symbols.length || f.symbols.includes(t.symbol)) && (!f.dir || (f.dir === 'long' ? t.direction > 0 : t.direction < 0)) && (!f.status || t.status === f.status) && (!f.setups.length || f.setups.includes(t.setup || '')) && (!f.tags.length || f.tags.some(x => (t.mistakes || []).includes(x) || (t.emotions || []).includes(x))));
  }
  function filterPopHTML(all, f) {
    const uniq = a => [...new Set(a.filter(Boolean))]; const symbols = uniq(all.map(t => t.symbol)).sort(); const setups = uniq([...(S.data.tags.setups || []), ...all.map(t => t.setup)]); const tags = uniq([...(S.data.tags.mistakes || []), ...(S.data.tags.emotions || []), ...all.flatMap(t => [...(t.mistakes || []), ...(t.emotions || [])])]);
    const chips = (key, items, on) => items.length ? items.map(v => `<button type="button" class="chip sel" data-action="dash-filter" data-key="${key}" data-value="${esc(v)}" aria-pressed="${on(v)}">${esc(v)}</button>`).join('') : '<span class="small faint">Noch nichts vorhanden</span>';
    const sec = (label, body) => `<div class="fsec"><div class="lbl">${label}</div><div class="chips">${body}</div></div>`;
    const single = (key, opts) => opts.map(([v, l]) => `<button type="button" class="chip sel" data-action="dash-filter" data-key="${key}" data-value="${v}" aria-pressed="${f[key] === v}">${l}</button>`).join('');
    return `<div class="row between" style="margin-bottom:10px"><b>Filter</b>${filterCount(f) ? `<button type="button" class="btn xs ghost" data-action="dash-filter-clear">${I.close} Zurücksetzen</button>` : ''}</div>
      ${sec('Symbol', chips('symbols', symbols, v => f.symbols.includes(v)))}${sec('Richtung', single('dir', [['long', 'Long'], ['short', 'Short']]))}${sec('Status', single('status', [['win', 'Gewinn'], ['loss', 'Verlust'], ['be', 'Break-even'], ['open', 'Offen']]))}${sec('Setup', chips('setups', setups, v => f.setups.includes(v)))}${sec('Tags', chips('tags', tags, v => f.tags.includes(v)))}`;
  }
  Object.assign(App.actions, {
    'dash-filter'(el) { const f = filterState(); const k = el.dataset.key, v = el.dataset.value; if (Array.isArray(f[k])) f[k] = f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]; else f[k] = f[k] === v ? '' : v; S.setSetting('dashFilter', f); App.rerender(); const pop = document.getElementById('pop-dfilter'); if (pop) pop.classList.add('open'); },
    'dash-filter-clear'() { S.setSetting('dashFilter', FILTER_EMPTY()); App.rerender(); },
  });

  /* ---------- Bildschirm ---------- */
  App.screens.dashboard = {
    title: 'Dashboard',
    ownActions: true,
    titleBadge() { return S.settings.sampleInstalled ? `<span class="title-badge">Beispieldaten<button type="button" data-action="remove-sample" title="Beispieldaten entfernen">Entfernen</button></span>` : ''; },
    render(ctx) {
      const s = st(); const tpl = active(); const rawAll = ctx.all; const f = filterState(); const fN = filterCount(f); if (fN) ctx = Object.assign({}, ctx, { all: applyFilter(ctx.all, f), inRange: applyFilter(ctx.inRange, f) }); const d = W.data(ctx, App); const all = ctx.all; const parts = []; const todayKey = C.dayKey(new Date());
      if (s.editing) parts.push(`<div class="edit-bar"><div class="row"><span class="dot-live"></span><b>Bearbeitungsmodus</b><span class="muted">–</span><span>${esc(tpl.name)}</span></div><div class="row"><button type="button" class="btn" data-action="dash-cancel">Abbrechen</button><button type="button" class="btn primary" data-action="dash-save">${I.check} Speichern</button></div></div>`);
      else {
        /* Kopfzeile in einer ruhigen Reihe: links Kontext (Zeitraum, Konto, Filter, Vorlage), rechts Werkzeuge als Symbole und „Trade loggen“ */
        parts.push(`<div class="dash-head">
          <div class="row dh-context">${App.rangeControl()}${App.accountControl()}<div class="popwrap"><button type="button" class="btn ${fN ? 'accent' : ''}" data-pop="dfilter" aria-label="Filter">${I.filter}<span class="hide-m">Filter</span>${fN ? `<b class="cntb">${fN}</b>` : ''}${caret}</button><div class="popover left filter-pop" id="pop-dfilter">${filterPopHTML(rawAll, f)}</div></div><div class="popwrap"><button type="button" class="btn" data-pop="tpl" aria-label="Vorlage wählen" title="Vorlage">${I.layout}<span class="hide-m tpl-name">${esc(tpl.name)}</span>${caret}</button><div class="popover left tpl-pop" id="pop-tpl">${tplPopHTML()}</div></div></div>
          <div class="row dh-tools"><button type="button" class="btn icon-only" data-action="voice-last" title="Sprachnotiz zum letzten Trade" aria-label="Sprachnotiz zum letzten Trade">${I.mic}<span class="vh">Sprachnotiz</span></button><div class="popwrap"><button type="button" class="btn icon-only" data-pop="cert" title="Zertifikat erstellen" aria-label="Zertifikat erstellen">${I.shield}<span class="vh">Zertifikat</span></button><div class="popover" id="pop-cert">${root.Certificate.menuHTML({ day: todayKey })}</div></div>${App.sessionControl(true)}<span class="dh-sep" aria-hidden="true"></span>${App.newTradeButton()}</div>
        </div>`);
        if (S.settings.tiltWarnings) { const tilt = C.tiltCheck(App.todayTrades(all), { account: d.account, dailyLossLimitPct: S.settings.dailyLossLimitPct / 100, fmtMoney: v => fmt.cur(v) }); for (const wn of tilt.warnings) { if (S.data.dismissed[wn.kind] === todayKey) continue; parts.push(U.banner(wn.severity === 'critical' ? 'loss' : 'warn', wn.title, wn.text, { close: 'x' }).replace('data-action="x"', `data-action="dismiss" data-key="${wn.kind}"`)); } }
        for (const r of recaps(all)) parts.push(U.banner('info', r.title, r.text, { icon: 'bell', close: 'x', trailing: `<a class="btn sm" href="#/stats">Zur Statistik</a>` }).replace('data-action="x"', `data-action="recap-dismiss" data-kind="${r.kind}" data-key="${r.key}"`));
        if (S.settings.sampleError) parts.push(U.banner('warn', 'Beispieldaten konnten nicht geladen werden', `${esc(S.settings.sampleError.message || '')}<details class="small muted" style="margin-top:6px"><summary>Details</summary><pre style="white-space:pre-wrap;word-break:break-word;font-size:11px">${esc((S.settings.sampleError.stack || '') + '\n' + (S.settings.sampleError.ua || ''))}</pre></details>`, { icon: 'bell', trailing: `<button type="button" class="btn sm" data-action="sample-retry">Erneut versuchen</button><button type="button" class="btn sm ghost" data-action="sample-error-dismiss">Ausblenden</button>` }));
        if (!rawAll.length) parts.push(U.banner('accent', 'Willkommen', 'Dein Journal ist noch leer. Logge deinen ersten Trade, importiere eine CSV oder lade Beispieldaten, um alle Auswertungen zu sehen.', { icon: 'sparkle', trailing: `<button type="button" class="btn sm" data-action="import">${I.upload} CSV</button><button type="button" class="btn sm primary" data-action="install-sample">Beispieldaten laden</button>` }));
      }
      const lay = layout();
      if (s.first) parts.push(skeleton(lay)); else { parts.push(topArea(lay.oben, d)); parts.push(mainArea(lay.unten, d)); }
      if (s.panel && s.editing) parts.push(addPanel(s.panel, lay, s.q));
      return parts.join('');
    },
    mount(main) {
      const s = st();
      if (s.first) { setTimeout(() => { s.first = false; if (App.state.route === 'dashboard') App.render(); }, 160); return; } /* render statt rerender: die Kacheln blenden nach dem Skeleton gestaffelt ein */
      if (s.editing) bindDnD(main);
      fitRecent(main);
      const list = main.querySelector('#dash-add-list'); if (list && s.listScroll) { list.scrollTop = s.listScroll; s.listScroll = 0; }
    },
  };
  /* Beim Seitenwechsel: nächster Aufruf zeigt kurz Skeletons, Panel und Menü zu */
  window.addEventListener('hashchange', () => { const s = st(); s.first = true; s.panel = null; s.menu = null; });

  /* ---------- Drag & Drop (Desktop) ---------- */
  function bindDnD(main) {
    const s = st(); let drag = null; const clear = () => main.querySelectorAll('.w.over-l, .w.over-r, .add-slot.over').forEach(x => x.classList.remove('over-l', 'over-r', 'over'));
    main.querySelectorAll('.w.editing').forEach(w => {
      const h = w.querySelector('.handle'); h.addEventListener('mousedown', () => { w.draggable = true; }); h.addEventListener('mouseup', () => { w.draggable = false; });
      w.addEventListener('dragstart', e => { if (!w.draggable) { e.preventDefault(); return; } drag = { area: w.dataset.area, idx: Number(w.dataset.idx), el: w }; w.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', w.dataset.typ); } catch (_) { /* ältere Browser */ } });
      w.addEventListener('dragend', () => { w.classList.remove('drag'); w.draggable = false; clear(); drag = null; });
      w.addEventListener('dragover', e => { if (!drag || drag.area !== w.dataset.area || w === drag.el) return; e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const r = w.getBoundingClientRect(); const before = e.clientX - r.left < r.width / 2; w.classList.toggle('over-l', before); w.classList.toggle('over-r', !before); });
      w.addEventListener('dragleave', () => w.classList.remove('over-l', 'over-r'));
      w.addEventListener('drop', e => { if (!drag || drag.area !== w.dataset.area) return; e.preventDefault(); const r = w.getBoundingClientRect(); const before = e.clientX - r.left < r.width / 2; let to = Number(w.dataset.idx) + (before ? 0 : 1); const arr = s.draft[drag.area]; const [item] = arr.splice(drag.idx, 1); if (drag.idx < to) to--; arr.splice(to, 0, item); drag = null; App.rerender(); });
    });
    main.querySelectorAll('.add-slot').forEach(slot => {
      slot.addEventListener('dragover', e => { if (!drag || drag.area !== slot.dataset.area) return; e.preventDefault(); slot.classList.add('over'); });
      slot.addEventListener('dragleave', () => slot.classList.remove('over'));
      slot.addEventListener('drop', e => { if (!drag || drag.area !== slot.dataset.area) return; e.preventDefault(); const arr = s.draft[drag.area]; const [item] = arr.splice(drag.idx, 1); arr.push(item); drag = null; App.rerender(); });
    });
  }

  /* ---------- Bearbeiten ---------- */
  function startEdit(id) { const s = st(); const t = S.getDashboard(id); if (!t) return; S.setActiveDashboard(id); s.editing = true; s.draft = clone(t.layout); s.panel = null; s.menu = null; App.rerender(false); }
  function stopEdit() { const s = st(); s.editing = false; s.draft = null; s.panel = null; App.rerender(false); }
  const widgetOf = el => { const w = el.closest('.w'); return w ? { area: w.dataset.area, idx: Number(w.dataset.idx), w } : null; };
  const instOf = el => { const p = widgetOf(el); if (!p) return null; const lay = layout(); return { inst: lay[p.area][p.idx], lay }; };
  function persist(lay) { const s = st(); if (!s.editing) S.updateDashboard(active().id, { layout: clone(lay) }); }
  const repState = () => { const s = st(); return s.rep || (s.rep = { open: false, pick: null, q: '', groups: {} }); };
  /* „Letzte Trades“: so viele Zeilen zeigen, wie in die Karte passen */
  function fitRecent(main) {
    (main || document).querySelectorAll('.recent-wrap').forEach(w => { const rows = [...w.querySelectorAll('tbody tr')]; if (!rows.length) return; rows.forEach(r => r.classList.remove('hidden')); const bottom = w.getBoundingClientRect().bottom; let cut = false; for (const r of rows) { if (cut || r.getBoundingClientRect().bottom > bottom + 0.5) { r.classList.add('hidden'); cut = true; } } });
  }
  let fitTimer; window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(() => { if (App.state.route === 'dashboard') fitRecent(); }, 150); });

  function openWidgetSettings(inst, save) {
    const e = W.get(inst.typ); const cfg = inst.einstellungen || {};
    if (e.settings === 'challenge') {
      U.modal(`<div class="modal-head"><h2>Challenge einrichten</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><form data-action="dash-w-settings-save" class="stack"><div class="form-grid"><label class="field"><span>Gewinnziel</span><input class="input" type="number" step="1" min="0" name="ziel" value="${cfg.ziel || ''}" placeholder="z. B. 2500"></label><label class="field"><span>Maximaler Verlust</span><input class="input" type="number" step="1" min="0" name="maxVerlust" value="${cfg.maxVerlust || ''}" placeholder="z. B. 1500"></label><label class="field"><span>Tagesverlustlimit (optional)</span><input class="input" type="number" step="1" min="0" name="tagesVerlust" value="${cfg.tagesVerlust || ''}" placeholder="z. B. 500"></label><label class="field"><span>Startdatum (optional)</span><input class="input" type="date" name="start" value="${cfg.start || ''}"><span class="hint">Leer: gewählter Zeitraum des Dashboards</span></label></div><div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Speichern</button></div></form>`, { cls: 'narrow', onMount(el) { el.querySelector('form').addEventListener('submit', ev => { ev.preventDefault(); const fd = new FormData(ev.target); const out = {}; for (const k of ['ziel', 'maxVerlust', 'tagesVerlust']) { const v = Number(fd.get(k)); if (v > 0) out[k] = v; } if (fd.get('start')) out.start = fd.get('start'); save(out); U.closeModal(); }); } });
    }
  }

  Object.assign(App.actions, {
    /* Vorlagen */
    'dash-tpl-select'(el) { const s = st(); if (s.editing) return U.toast('Erst speichern oder abbrechen', 'err'); S.setActiveDashboard(el.dataset.id); s.menu = null; App.rerender(false); },
    'dash-tpl-edit'(el) { const s = st(); if (s.editing && el.dataset.id === active().id) return; if (s.editing) return U.toast('Erst speichern oder abbrechen', 'err'); startEdit(el.dataset.id); },
    'dash-tpl-menu'(el) { const s = st(); s.menu = s.menu === el.dataset.id ? null : el.dataset.id; refreshPop(); },
    'dash-tpl-new'() {
      const s = st(); if (s.editing) return U.toast('Erst speichern oder abbrechen', 'err'); s.menu = null;
      U.modal(`<div class="modal-head"><h2>Neue Vorlage</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><form class="stack"><label class="field"><span>Name</span><input class="input" name="name" placeholder="z. B. Scalping-Tag" required maxlength="60"></label><div class="field"><span class="lbl">Start</span><label class="check"><input type="radio" name="mode" value="empty" checked> Leer starten</label><label class="check"><input type="radio" name="mode" value="copy"> Von aktueller Vorlage kopieren („${esc(active().name)}“)</label></div><div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Erstellen und bearbeiten</button></div></form>`, { cls: 'narrow', onMount(el) { el.querySelector('form').addEventListener('submit', ev => { ev.preventDefault(); const fd = new FormData(ev.target); const name = String(fd.get('name') || '').trim(); if (!name) return; const t = S.addDashboard(name, fd.get('mode') === 'copy' ? active().layout : { oben: [], unten: [] }); U.closeModal(); U.toast(`Vorlage „${name}“ erstellt`, 'ok'); startEdit(t.id); }); } });
    },
    async 'dash-tpl-rename'(el) { const t = S.getDashboard(el.dataset.id); if (!t) return; const name = await U.promptModal('Vorlage umbenennen', { label: 'Name', value: t.name, ok: 'Umbenennen' }); if (name && name.trim()) { S.updateDashboard(t.id, { name: name.trim() }); st().menu = null; App.rerender(false); } },
    'dash-tpl-dup'(el) { const c = S.duplicateDashboard(el.dataset.id); if (c) { U.toast(`Vorlage „${c.name}“ erstellt`, 'ok'); st().menu = null; refreshPop(); } },
    'dash-tpl-default'(el) { S.setDefaultDashboard(el.dataset.id); st().menu = null; refreshPop(); U.toast('Standard-Vorlage festgelegt', 'ok'); },
    async 'dash-tpl-delete'(el) { const t = S.getDashboard(el.dataset.id); if (!t) return; if (S.dashboards().length <= 1) return U.toast('Die letzte Vorlage kann nicht gelöscht werden', 'err'); const ok = await U.confirmModal('Vorlage löschen', `Vorlage „${esc(t.name)}“ wirklich löschen?`, { ok: 'Löschen', danger: true }); if (!ok) return; const s = st(); if (s.editing && active().id === t.id) { s.editing = false; s.draft = null; s.panel = null; } S.deleteDashboard(t.id); s.menu = null; U.toast('Vorlage gelöscht'); App.rerender(false); },
    /* Bearbeitungsmodus */
    'dash-cancel'() { stopEdit(); },
    'dash-save'() { const s = st(); if (!s.editing) return; S.updateDashboard(active().id, { layout: clone(s.draft) }); U.toast('Vorlage gespeichert', 'ok'); stopEdit(); },
    'dash-remove'(el) { const s = st(); const p = widgetOf(el); if (!p || !s.draft) return; s.draft[p.area].splice(p.idx, 1); App.rerender(); },
    'dash-size'(el) { const s = st(); const p = widgetOf(el); if (!p || !s.draft) return; s.draft[p.area][p.idx].groesse = el.dataset.value; App.rerender(); },
    'dash-move'(el) { const s = st(); const p = widgetOf(el); if (!p || !s.draft) return; const arr = s.draft[p.area]; const to = p.idx + Number(el.dataset.dir); if (to < 0 || to >= arr.length) return; [arr[p.idx], arr[to]] = [arr[to], arr[p.idx]]; App.rerender(); },
    'dash-add-open'(el) { const s = st(); s.panel = el.dataset.area; s.q = ''; App.rerender(); },
    'dash-add-close'() { const s = st(); s.panel = null; App.rerender(); },
    'dash-add'(el) { const s = st(); if (!s.draft || !s.panel) return; const e = W.get(el.dataset.typ); if (!e) return; const arr = s.draft[s.panel]; if (arr.some(x => x.typ === e.typ)) return; if (s.panel === 'oben' && arr.length >= MAX_TOP) return U.toast('Maximal 5 Widgets – entferne zuerst eines', 'err'); arr.push(s.panel === 'oben' ? { typ: e.typ } : { typ: e.typ, groesse: e.groesse || 'klein' }); s.listScroll = (document.getElementById('dash-add-list') || {}).scrollTop || 0; App.rerender(); },
    'dash-add-q'(el) { const s = st(); s.q = el.value; const list = document.getElementById('dash-add-list'); if (list && s.draft) list.innerHTML = panelListHTML(s.panel, s.draft, s.q); },
    'dash-w-opt'(el) { const r = instOf(el); if (!r) return; r.inst.einstellungen = Object.assign({}, r.inst.einstellungen, { [el.dataset.key]: el.value != null && el.tagName === 'SELECT' ? el.value : el.dataset.value }); persist(r.lay); App.rerender(); },
    /* Report-Panel */
    'dash-rep-toggle'() { const rs = repState(); rs.open = !rs.open; rs.pick = null; rs.q = ''; App.rerender(); },
    'dash-rep-pick'(el) { const rs = repState(); const v = el.dataset.i === 'new' ? 'new' : Number(el.dataset.i); rs.pick = rs.pick === v ? null : v; rs.q = ''; App.rerender(); },
    'dash-rep-group'(el) { const rs = repState(); rs.groups[el.dataset.g] = !rs.groups[el.dataset.g]; App.rerender(); },
    'dash-rep-q'(el) { const rs = repState(); rs.q = el.value; const card = el.closest('.rep-card'); if (!card) return; const r = instOf(el); if (!r) return; const cfg = W.reportConfig(r.inst); const tmp = document.createElement('div'); tmp.innerHTML = W.reportPanelHTML(cfg.kennzahlen, rs); const fresh = tmp.querySelector('.rep-groups'); const cur = card.querySelector('.rep-groups'); if (fresh && cur) cur.replaceWith(fresh); },
    'dash-rep-set'(el) { const rs = repState(); const r = instOf(el); if (!r) return; const cfg = W.reportConfig(r.inst); const list = cfg.kennzahlen; if (rs.pick === 'new') { if (list.length >= 3) return; list.push({ key: el.dataset.key, color: W.REPORT_COLORS.find(c => !list.some(x => x.color === c)) || W.REPORT_COLORS[list.length % 3], typ: 'linie' }); } else if (list[rs.pick]) list[rs.pick].key = el.dataset.key; r.inst.einstellungen = { kennzahlen: list, aufloesung: cfg.aufloesung }; rs.pick = null; rs.q = ''; persist(r.lay); App.rerender(); },
    'dash-rep-remove'(el) { const r = instOf(el); if (!r) return; const cfg = W.reportConfig(r.inst); if (cfg.kennzahlen.length <= 1) return; cfg.kennzahlen.splice(Number(el.dataset.i), 1); r.inst.einstellungen = cfg; repState().pick = null; persist(r.lay); App.rerender(); },
    'dash-rep-color'(el) { const r = instOf(el); if (!r) return; const cfg = W.reportConfig(r.inst); if (cfg.kennzahlen[Number(el.dataset.i)]) cfg.kennzahlen[Number(el.dataset.i)].color = el.value; r.inst.einstellungen = cfg; persist(r.lay); App.rerender(); },
    'dash-rep-type'(el) { const r = instOf(el); if (!r) return; const cfg = W.reportConfig(r.inst); if (cfg.kennzahlen[Number(el.dataset.i)]) cfg.kennzahlen[Number(el.dataset.i)].typ = el.value; r.inst.einstellungen = cfg; persist(r.lay); App.rerender(); },
    'dash-rep-reset'(el) { const r = instOf(el); if (!r) return; r.inst.einstellungen = W.REPORT_DEFAULT(); repState().pick = null; persist(r.lay); App.rerender(); },
    'dash-w-settings'(el) { const s = st(); const p = widgetOf(el); if (!p) return; const lay = layout(); const inst = lay[p.area][p.idx]; if (!inst) return; openWidgetSettings(inst, cfg => { inst.einstellungen = cfg; if (!s.editing) S.updateDashboard(active().id, { layout: clone(lay) }); App.rerender(); }); },
    /* Widget-interne Navigation */
    'cal-prev'() { const m = App.state.calMonth || new Date(); App.state.calMonth = new Date(m.getFullYear(), m.getMonth() - 1, 1); App.rerender(); },
    'cal-next'() { const m = App.state.calMonth || new Date(); App.state.calMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1); App.rerender(); },
    'cal-today'() { App.state.calMonth = null; App.rerender(); },
    'recent-tab'(el) { App.state.recentTab = el.dataset.value; App.rerender(); },
    'dash-year'(el) { App.state.dashYear = (App.state.dashYear || new Date().getFullYear()) + Number(el.dataset.dir); App.rerender(); },
  });
  App.calendarHTML = W.calendarHTML;
})(typeof self !== 'undefined' ? self : this);
