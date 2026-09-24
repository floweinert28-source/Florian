/* App-Rahmen: Router, Seitenleiste, Kopfzeile, Aktionen, Dialoge */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt;

  const NAV = [
    ['dashboard', 'Dashboard', 'dashboard'], ['trades', 'TradeLog', 'tradelog'], ['day', 'Tagesansicht', 'day'], ['stats', 'Statistiken', 'stats'],
    ['journal', 'Journal', 'journal'], ['library', 'Bibliothek', 'library'], ['strategy', 'Strategien', 'strategy'], ['progress', 'Fortschritt', 'progress'],
  ];
  const NAV2 = [['coach', 'Coach', 'coach'], ['zen', 'Zen-Modus', 'zen'], ['settings', 'Einstellungen', 'settings']];
  const PRESETS = { today: 'Heute', week: 'Diese Woche', month: 'Dieser Monat', last30: 'Letzte 30 Tage', quarter: 'Dieses Quartal', year: 'Dieses Jahr', all: 'Gesamt', custom: 'Benutzerdefiniert' };

  const App = {
    screens: {}, actions: {}, state: { route: 'dashboard', params: [], sidebarOpen: false, calMonth: null, tradeSort: { key: 'openedAt', dir: -1 }, tradeFilter: { q: '', symbol: '', setup: '', status: '', mistake: '', view: 'trades' }, statsTab: 'summary', journal: { folder: 'daily', note: null }, library: { filters: {} }, zenTimer: null },
    /* ---------- Daten ---------- */
    allTrades() { const acc = S.settings.accountId; return C.deriveAll(S.trades().filter(t => acc === 'all' || !acc || t.accountId === acc)); },
    range() {
      const r = S.settings.range || { preset: 'month' }; const now = new Date(); const start = new Date(now); start.setHours(0, 0, 0, 0); const end = new Date(now); end.setHours(23, 59, 59, 999);
      let from = null, to = end;
      switch (r.preset) {
        case 'today': from = start; break;
        case 'week': from = C.weekStart(start); break;
        case 'month': from = new Date(start.getFullYear(), start.getMonth(), 1); to = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999); break;
        case 'last30': from = new Date(start); from.setDate(from.getDate() - 29); break;
        case 'quarter': from = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1); break;
        case 'year': from = new Date(start.getFullYear(), 0, 1); to = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999); break;
        case 'custom': from = r.from ? C.parseDayKey(r.from) : null; to = r.to ? new Date(C.parseDayKey(r.to).getTime() + 86399999) : end; break;
        default: from = null; to = null;
      }
      const label = r.preset === 'all' ? 'Gesamt' : r.preset === 'custom' && from ? `${fmt.date(from)} – ${fmt.date(to)}` : r.preset === 'month' ? fmt.monthYear(start) : r.preset === 'today' ? 'Heute' : `${fmt.date(from)} – ${fmt.date(to)}`;
      return { preset: r.preset, from, to, label };
    },
    tradesInRange(all) { const r = this.range(); const list = all || this.allTrades(); if (!r.from) return list; return list.filter(t => { const d = t.close || t.open; return d >= r.from && d <= r.to; }); },
    todayTrades(all) { const k = C.dayKey(new Date()); return (all || this.allTrades()).filter(t => t.dayKey === k); },
    account() { return S.accountSize(); },
    /* ---------- Navigation ---------- */
    navigate(hash) { if (location.hash === hash) this.render(); else location.hash = hash; },
    parseRoute() { const h = location.hash.replace(/^#\/?/, ''); const parts = h.split('/').filter(Boolean); const route = parts[0] && this.screens[parts[0]] ? parts[0] : 'dashboard'; this.state.route = route; this.state.params = parts.slice(1).map(decodeURIComponent); },
    /* ---------- Rendern ---------- */
    render() {
      this.parseRoute(); fmt.setCurrency(S.currency()); document.documentElement.dataset.theme = S.settings.theme || 'dark';
      const screen = this.screens[this.state.route]; const ctx = { params: this.state.params, all: this.allTrades() }; ctx.inRange = this.tradesInRange(ctx.all);
      const main = document.getElementById('main'); const title = typeof screen.title === 'function' ? screen.title(ctx) : screen.title;
      document.title = `${title} · Trading Journal`;
      main.innerHTML = `${this.topbar(title, screen, ctx)}<div class="content" id="content">${screen.render(ctx)}</div>`;
      this.renderSidebar();
      U.drawCharts(main); this.loadBlobImages(main); if (screen.mount) screen.mount(main, ctx);
      if (this.state.route !== 'zen') this.stopZenTimer();
      window.scrollTo({ top: 0 });
    },
    rerender(keepScroll = true) { const y = window.scrollY; this.render(); if (keepScroll) window.scrollTo({ top: y }); },
    renderSidebar() {
      const sb = document.getElementById('sidebar'); const cur = this.state.route; const theme = S.settings.theme || 'dark';
      const item = ([key, label, icon]) => `<a href="#/${key}" class="${cur === key ? 'active' : ''}">${I[icon]}<span>${label}</span></a>`;
      sb.innerHTML = `<div class="brand"><span class="mark">${I.logo}</span><span>Trade<em>Journal</em></span></div><hr><nav class="nav">${NAV.map(item).join('')}</nav><hr><nav class="nav">${NAV2.map(item).join('')}</nav><div class="spacer"></div>
        <div class="theme-toggle" role="group" aria-label="Erscheinungsbild"><button type="button" data-action="theme" data-value="dark" aria-pressed="${theme === 'dark'}" aria-label="Dunkel">${I.moon}</button><button type="button" data-action="theme" data-value="light" aria-pressed="${theme === 'light'}" aria-label="Hell">${I.sun}</button></div>`;
      sb.classList.toggle('open', this.state.sidebarOpen); const scrim = document.getElementById('scrim'); scrim.hidden = !this.state.sidebarOpen;
    },
    topbar(title, screen, ctx) {
      const r = this.range(); const sess = S.activeSession(); const acc = S.settings.accountId; const accounts = S.data.accounts; const accName = acc === 'all' || !acc ? (accounts.length > 1 ? 'Alle Konten' : (accounts[0] || {}).name || 'Konto') : ((accounts.find(a => a.id === acc) || {}).name || 'Konto');
      const initials = (S.settings.name || 'T').split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();
      return `<header class="topbar"><button type="button" class="btn ghost icon menu-btn" data-action="sidebar" aria-label="Menü">${I.menu}</button><h1>${esc(title)}</h1><div class="actions">
        ${screen.actions ? screen.actions(ctx) : ''}
        <button type="button" class="btn accent tl" data-action="new-trade">${I.plus}<span>Trade loggen</span></button>
        ${sess ? `<button type="button" class="btn" data-action="end-session" title="Session beenden">${I.stop}<span id="session-timer">${fmt.hm((Date.now() - new Date(sess.startedAt)) / 1000)}</span></button>` : `<button type="button" class="btn hide-m" data-action="start-session">${I.play}<span>Session starten</span></button>`}
        <div class="popwrap"><button type="button" class="btn" data-pop="range">${I.calendar}<span>${esc(r.label)}</span>${I.chev.replace('<svg', '<svg class="caret"')}</button><div class="popover" id="pop-range">${Object.entries(PRESETS).filter(([k]) => k !== 'custom').map(([k, l]) => `<button type="button" class="item" data-action="range" data-value="${k}" aria-checked="${r.preset === k}">${l}</button>`).join('')}<hr><div class="sec">Benutzerdefiniert</div><form class="range-form" data-action="range-custom"><input class="input" type="date" id="range-from" value="${(S.settings.range || {}).from || ''}" aria-label="Von"><input class="input" type="date" id="range-to" value="${(S.settings.range || {}).to || ''}" aria-label="Bis"><button type="submit" class="btn sm primary">Anwenden</button></form></div></div>
        <div class="popwrap hide-m"><button type="button" class="btn" data-pop="account">${I.account}<span>${esc(accName)}</span>${I.chev.replace('<svg', '<svg class="caret"')}</button><div class="popover" id="pop-account">${accounts.length > 1 ? `<button type="button" class="item" data-action="account" data-value="all" aria-checked="${acc === 'all'}">Alle Konten</button>` : ''}${accounts.map(a => `<button type="button" class="item" data-action="account" data-value="${a.id}" aria-checked="${acc === a.id}">${esc(a.name)}<span class="muted small" style="margin-left:auto">${fmt.cur(a.size, { compact: true })}</span></button>`).join('')}<hr><a class="item" href="#/settings">${I.settings} Konten verwalten</a></div></div>
        <a class="avatar" href="#/settings" title="Einstellungen">${esc(initials)}</a></div></header>`;
    },
    async loadBlobImages(scope) { const imgs = scope.querySelectorAll('img[data-blob]'); for (const img of imgs) { const u = await root.Blobs.url(img.dataset.blob).catch(() => null); if (u) img.src = u; else img.closest('.shot, .thumb, .lib-card')?.classList.add('missing'); } const auds = scope.querySelectorAll('audio[data-blob]'); for (const a of auds) { const u = await root.Blobs.url(a.dataset.blob).catch(() => null); if (u) a.src = u; } },
    stopZenTimer() { if (this.state.zenTimer) { clearInterval(this.state.zenTimer); this.state.zenTimer = null; } },

    /* ---------- Aktionen ---------- */
    bind() {
      document.addEventListener('click', e => {
        const pop = e.target.closest('[data-pop]'); if (pop) { const id = 'pop-' + pop.dataset.pop; document.querySelectorAll('.popover.open').forEach(p => { if (p.id !== id) p.classList.remove('open'); }); document.getElementById(id)?.classList.toggle('open'); return; }
        if (!e.target.closest('.popover')) document.querySelectorAll('.popover.open').forEach(p => p.classList.remove('open'));
        const el = e.target.closest('[data-action]'); if (!el || el.tagName === 'FORM') return;
        const fn = this.actions[el.dataset.action]; if (fn) { e.preventDefault(); fn.call(this, el, e); }
        if (e.target.closest('[data-close]')) U.closeModal();
      });
      document.addEventListener('submit', e => { const f = e.target.closest('form[data-action]'); if (f) { const fn = this.actions[f.dataset.action]; if (fn) { e.preventDefault(); fn.call(this, f, e); } } });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') { U.closeModal(); document.querySelectorAll('.popover.open').forEach(p => p.classList.remove('open')); } });
      document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (el) { const fn = this.actions[el.dataset.input]; if (fn) fn.call(this, el, e); } });
      document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el) { const fn = this.actions[el.dataset.change]; if (fn) fn.call(this, el, e); } });
      window.addEventListener('hashchange', () => { this.state.sidebarOpen = false; this.render(); });
      let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => U.drawCharts(document.getElementById('main')), 120); });
      setInterval(() => { const t = document.getElementById('session-timer'); const s = S.activeSession(); if (t && s) t.textContent = fmt.hm((Date.now() - new Date(s.startedAt)) / 1000); }, 1000);
      U.bindTips();
    },
  };

  Object.assign(App.actions, {
    sidebar() { this.state.sidebarOpen = !this.state.sidebarOpen; this.renderSidebar(); },
    scrim() { this.state.sidebarOpen = false; this.renderSidebar(); },
    theme(el) { S.setSetting('theme', el.dataset.value); document.documentElement.dataset.theme = el.dataset.value; this.renderSidebar(); U.drawCharts(document.getElementById('main')); },
    range(el) { S.setSetting('range', { preset: el.dataset.value, from: null, to: null }); this.rerender(); },
    'range-custom'(f) { const from = f.querySelector('#range-from').value, to = f.querySelector('#range-to').value; if (!from) return U.toast('Bitte ein Startdatum wählen', 'err'); S.setSetting('range', { preset: 'custom', from, to: to || from }); this.rerender(); },
    account(el) { S.setSetting('accountId', el.dataset.value); this.rerender(); },
    nav(el) { this.navigate(el.dataset.href); },
    day(el) { this.navigate('#/day/' + el.dataset.day); },
    trade(el) { this.navigate('#/trades/' + el.dataset.id); },
    'new-trade'() { this.openTradeEditor(null); },
    'edit-trade'(el) { this.openTradeEditor(S.getTrade(el.dataset.id)); },
    async 'delete-trade'(el) { if (await U.confirmModal('Trade löschen?', 'Der Trade und seine Anhänge werden dauerhaft entfernt.', { ok: 'Löschen', danger: true })) { await S.deleteTrade(el.dataset.id); U.toast('Trade gelöscht'); this.navigate('#/trades'); } },
    'start-session'() { this.openSessionStart(); },
    'end-session'() { this.openSessionEnd(); },
    'check-in'(el) { this.openCheckIn(el.dataset.day || C.dayKey(new Date())); },
    dismiss(el) { S.data.dismissed[el.dataset.key] = C.dayKey(new Date()); S.save(); this.rerender(); },
    'install-sample'() { S.installSample(); U.toast('Beispieldaten geladen', 'ok'); this.rerender(false); },
    'remove-sample'() { S.removeSample(); U.toast('Beispieldaten entfernt'); this.rerender(false); },
    import() { this.openImport(); },
  });

  /* ---------- Trade-Editor ---------- */
  App.openTradeEditor = function (trade, preset = {}) {
    const t = trade || Object.assign({ symbol: '', direction: 1, openedAt: new Date().toISOString(), closedAt: null, entryPrice: '', exitPrice: '', quantity: 1, multiplier: 1, fees: 0, plannedEntry: '', plannedStop: '', plannedTarget: '', plannedReason: '', mae: '', mfe: '', setup: '', strategy: '', mistakes: [], emotions: [], rulesBroken: [], rating: null, notes: '', accountId: S.defaultAccountId() }, preset);
    const tags = S.data.tags; const rules = S.data.rules.filter(r => r.active !== false); const strategies = S.data.strategies;
    const chips = (kind, list, sel, cls) => `<div class="chips" data-chips="${kind}">${list.map(x => `<button type="button" class="chip sel ${cls}" data-action="toggle-chip" data-value="${esc(x)}" aria-pressed="${sel.includes(x)}">${esc(x)}</button>`).join('')}<button type="button" class="chip sel" data-action="add-chip" data-kind="${kind}">${I.plus} Neu</button></div>`;
    const html = `<form id="trade-form" data-action="save-trade" data-id="${t.id || ''}"><div class="modal-head"><h2>${trade ? 'Trade bearbeiten' : 'Trade loggen'}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      <div class="stack" style="gap:16px">
      <div class="form-grid">
        <div class="field"><label for="f-symbol">Symbol</label><input class="input" id="f-symbol" name="symbol" value="${esc(t.symbol)}" placeholder="z. B. DAX, NQ, EURUSD" required autocapitalize="characters"></div>
        <div class="field"><span class="lbl">Richtung</span><div class="seg" id="f-dir">${U.seg([[1, 'Long'], [-1, 'Short']], t.direction, 'set-dir')}</div><input type="hidden" name="direction" value="${t.direction}"></div>
        <div class="field"><label for="f-account">Konto</label><select class="select" id="f-account" name="accountId">${S.data.accounts.map(a => `<option value="${a.id}" ${a.id === t.accountId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
        <div class="field"><label for="f-open">Eröffnung</label><input class="input" type="datetime-local" id="f-open" name="openedAt" value="${fmt.isoLocal(t.openedAt)}" required></div>
        <div class="field"><label for="f-close">Schluss <span class="faint">(leer = offen)</span></label><input class="input" type="datetime-local" id="f-close" name="closedAt" value="${t.closedAt ? fmt.isoLocal(t.closedAt) : ''}"></div>
        <div class="field"><label for="f-entry">Einstiegskurs</label><input class="input" type="number" step="any" id="f-entry" name="entryPrice" value="${t.entryPrice}" required inputmode="decimal"></div>
        <div class="field"><label for="f-exit">Ausstiegskurs</label><input class="input" type="number" step="any" id="f-exit" name="exitPrice" value="${t.exitPrice == null ? '' : t.exitPrice}" inputmode="decimal"></div>
        <div class="field"><label for="f-qty">Stückzahl / Kontrakte</label><input class="input" type="number" step="any" min="0" id="f-qty" name="quantity" value="${t.quantity}" required inputmode="decimal"></div>
        <div class="field"><label for="f-mult">Punktwert</label><input class="input" type="number" step="any" min="0" id="f-mult" name="multiplier" value="${t.multiplier || 1}" inputmode="decimal"><span class="hint">P&L = (Ausstieg − Einstieg) × Stück × Punktwert</span></div>
        <div class="field"><label for="f-fees">Gebühren</label><input class="input" type="number" step="any" min="0" id="f-fees" name="fees" value="${t.fees || 0}" inputmode="decimal"></div>
      </div>
      <div class="fieldset"><div class="legend">Plan</div><div class="form-grid">
        <div class="field"><label for="f-pentry">Geplanter Einstieg</label><input class="input" type="number" step="any" id="f-pentry" name="plannedEntry" value="${t.plannedEntry == null ? '' : t.plannedEntry}" inputmode="decimal"></div>
        <div class="field"><label for="f-pstop">Stop</label><input class="input" type="number" step="any" id="f-pstop" name="plannedStop" value="${t.plannedStop == null ? '' : t.plannedStop}" inputmode="decimal"></div>
        <div class="field"><label for="f-ptarget">Ziel</label><input class="input" type="number" step="any" id="f-ptarget" name="plannedTarget" value="${t.plannedTarget == null ? '' : t.plannedTarget}" inputmode="decimal"></div>
        <div class="field span2"><label for="f-reason">Begründung</label><input class="input" id="f-reason" name="plannedReason" value="${esc(t.plannedReason || '')}" placeholder="Warum dieser Trade?"></div>
        <div class="field"><label for="f-mae">Tiefster Kurs gegen dich (MAE)</label><input class="input" type="number" step="any" id="f-mae" name="mae" value="${t.mae == null ? '' : t.mae}" inputmode="decimal"></div>
        <div class="field"><label for="f-mfe">Bester Kurs für dich (MFE)</label><input class="input" type="number" step="any" id="f-mfe" name="mfe" value="${t.mfe == null ? '' : t.mfe}" inputmode="decimal"></div>
      </div></div>
      <div class="form-grid">
        <div class="field"><label for="f-setup">Setup</label><input class="input" id="f-setup" name="setup" list="setup-list" value="${esc(t.setup || '')}" placeholder="Pullback, Breakout …"><datalist id="setup-list">${tags.setups.map(s => `<option value="${esc(s)}">`).join('')}</datalist></div>
        <div class="field"><label for="f-strategy">Strategie</label><select class="select" id="f-strategy" name="strategy"><option value="">Keine</option>${strategies.map(s => `<option value="${esc(s.name)}" ${s.name === t.strategy ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
        <div class="field"><span class="lbl">Bewertung</span><div class="rating" id="f-rating">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-action="set-rating" data-value="${n}" aria-pressed="${t.rating >= n}">★</button>`).join('')}</div><input type="hidden" name="rating" value="${t.rating || ''}"></div>
      </div>
      <div class="field"><span class="lbl">Fehler-Tags</span>${chips('mistakes', tags.mistakes, t.mistakes || [], 'mistake')}</div>
      <div class="field"><span class="lbl">Emotionen</span>${chips('emotions', tags.emotions, t.emotions || [], 'emotion')}</div>
      ${rules.length ? `<div class="field"><span class="lbl">Gebrochene Regeln</span><div class="chips" data-chips="rulesBroken">${rules.map(r => `<button type="button" class="chip sel mistake" data-action="toggle-chip" data-value="${esc(r.text)}" aria-pressed="${(t.rulesBroken || []).includes(r.text)}">${esc(r.text)}</button>`).join('')}</div></div>` : ''}
      <div class="field"><label for="f-notes">Notizen</label><textarea class="input" id="f-notes" name="notes" placeholder="Was ist passiert, was hast du gelernt?">${esc(t.notes || '')}</textarea></div>
      </div>
      <div class="modal-foot"><div class="left row" id="trade-preview"></div><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">${trade ? 'Speichern' : 'Trade speichern'}</button></div></form>`;
    U.modal(html, { onMount(el) { const upd = () => App.updateTradePreview(el); el.addEventListener('input', upd); upd(); } });
  };
  App.readTradeForm = function (form) {
    const fd = new FormData(form); const num = k => { const v = fd.get(k); return v === '' || v == null ? null : Number(v); };
    const chips = kind => [...form.querySelectorAll(`[data-chips="${kind}"] [aria-pressed="true"]`)].map(b => b.dataset.value);
    const opened = new Date(fd.get('openedAt')); const closedRaw = fd.get('closedAt'); const closed = closedRaw ? new Date(closedRaw) : null;
    return {
      symbol: String(fd.get('symbol') || '').trim().toUpperCase(), direction: Number(fd.get('direction')) === -1 ? -1 : 1, accountId: fd.get('accountId'), openedAt: isNaN(opened) ? new Date().toISOString() : opened.toISOString(), closedAt: closed && !isNaN(closed) ? closed.toISOString() : null,
      entryPrice: num('entryPrice'), exitPrice: num('exitPrice'), quantity: Math.abs(num('quantity') || 0), multiplier: num('multiplier') || 1, fees: Math.abs(num('fees') || 0),
      plannedEntry: num('plannedEntry'), plannedStop: num('plannedStop'), plannedTarget: num('plannedTarget'), plannedReason: String(fd.get('plannedReason') || ''), mae: num('mae'), mfe: num('mfe'),
      setup: String(fd.get('setup') || '').trim(), strategy: String(fd.get('strategy') || ''), rating: num('rating'), mistakes: chips('mistakes'), emotions: chips('emotions'), rulesBroken: chips('rulesBroken'), notes: String(fd.get('notes') || ''),
    };
  };
  App.updateTradePreview = function (el) { const f = el.querySelector('#trade-form'); if (!f) return; const d = C.derive(Object.assign({ mistakes: [], emotions: [], rulesBroken: [] }, App.readTradeForm(f))); const p = el.querySelector('#trade-preview'); if (!d.closed) { p.innerHTML = `<span class="muted small">Offener Trade · Risiko ${d.risk ? fmt.cur(d.risk) : '—'}${d.plannedR ? ` · geplant ${fmt.r(d.plannedR, false)}` : ''}</span>`; return; } p.innerHTML = `<span class="small muted">Netto-P&L</span> ${U.pnl(d.pnl)} ${d.r != null ? `<span class="small muted">·</span> ${U.rText(d.r)}` : ''} <span class="small muted">· Disziplin ${C.discipline(d).score}</span>`; };
  Object.assign(App.actions, {
    'set-dir'(el) { const f = el.closest('form'); f.querySelector('input[name=direction]').value = el.dataset.value; f.querySelectorAll('#f-dir button').forEach(b => b.setAttribute('aria-pressed', b === el)); App.updateTradePreview(f.closest('.modal')); },
    'set-rating'(el) { const f = el.closest('form'); const v = Number(el.dataset.value); const cur = Number(f.querySelector('input[name=rating]').value) || 0; const nv = cur === v ? 0 : v; f.querySelector('input[name=rating]').value = nv || ''; f.querySelectorAll('#f-rating button').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.value) <= nv)); },
    'toggle-chip'(el) { el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') !== 'true'); const m = el.closest('.modal'); if (m) App.updateTradePreview(m); },
    'add-chip'(el) { const kind = el.dataset.kind; const wrap = el.parentElement; if (wrap.querySelector('input.inline-new')) return; const inp = document.createElement('input'); inp.className = 'input inline-new'; inp.placeholder = 'Name, Enter'; inp.style.width = '160px'; inp.style.padding = '4px 10px'; wrap.insertBefore(inp, el); inp.focus(); const done = () => { const v = inp.value.trim(); if (v) { S.addTag(kind, v); const b = document.createElement('button'); b.type = 'button'; b.className = `chip sel ${kind === 'mistakes' ? 'mistake' : kind === 'emotions' ? 'emotion' : ''}`; b.dataset.action = 'toggle-chip'; b.dataset.value = v; b.setAttribute('aria-pressed', 'true'); b.textContent = v; wrap.insertBefore(b, el); } inp.remove(); }; inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(); } if (e.key === 'Escape') inp.remove(); }); inp.addEventListener('blur', done); },
    'save-trade'(form) {
      const t = App.readTradeForm(form); if (!t.symbol) return U.toast('Symbol fehlt', 'err'); if (t.entryPrice == null) return U.toast('Einstiegskurs fehlt', 'err'); if (t.closedAt && t.exitPrice == null) return U.toast('Ausstiegskurs fehlt für geschlossenen Trade', 'err');
      if (t.setup) S.addTag('setups', t.setup);
      const id = form.dataset.id; if (id) { S.updateTrade(id, t); U.toast('Trade gespeichert', 'ok'); } else { const n = S.addTrade(Object.assign({ screenshots: [], voiceNotes: [] }, t)); U.toast('Trade gespeichert', 'ok'); U.closeModal(); App.checkTiltAfterSave(); if (App.state.route === 'trades' && App.state.params[0]) App.navigate('#/trades/' + n.id); else App.rerender(); return; }
      U.closeModal(); App.rerender();
    },
  });
  App.checkTiltAfterSave = function () { if (!S.settings.tiltWarnings) return; const res = C.tiltCheck(this.todayTrades(), { account: this.account(), dailyLossLimitPct: S.settings.dailyLossLimitPct / 100 }); const w = res.warnings.find(x => x.severity === 'critical' || x.severity === 'high'); if (w) U.toast('⚠ ' + w.title, 'err'); };

  /* ---------- Session & Check-in ---------- */
  App.openSessionStart = function () {
    const key = C.dayKey(new Date()); const d = S.day(key) || {}; const ci = d.checkIn || {}; const rules = S.data.rules.filter(r => r.active !== false);
    U.modal(`<form data-action="session-start"><div class="modal-head"><h2>Session starten</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><p class="muted">Kurzer Check-in, bevor du handelst. Das Journal zeigt dir später, wie dein Zustand mit deinem Ergebnis zusammenhängt.</p>
      ${App.checkInFields(ci)}
      <div class="field"><label for="s-goal">Fokus für heute</label><input class="input" id="s-goal" name="goal" value="${esc(ci.goal || '')}" placeholder="z. B. Nur A-Setups, nach 2 Verlusten Schluss"></div>
      ${rules.length ? `<div class="fieldset"><div class="legend">Deine Regeln</div><div class="checklist">${rules.map(r => `<div class="it"><span class="box">${I.check}</span><span>${esc(r.text)}</span></div>`).join('')}</div></div>` : ''}
      <div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">${I.play} Session starten</button></div></form>`);
  };
  App.checkInFields = function (ci) {
    const scale = (name, val, labels) => `<div class="seg pill" data-chips="${name}">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-action="seg-set" data-name="${name}" data-value="${n}" aria-pressed="${Number(val) === n}" title="${labels[n - 1]}">${n}</button>`).join('')}</div><input type="hidden" name="${name}" value="${val || ''}">`;
    return `<div class="form-grid"><div class="field"><label for="ci-sleep">Schlaf (Stunden)</label><input class="input" type="number" step="0.5" min="0" max="14" id="ci-sleep" name="sleep" value="${ci.sleep == null ? '' : ci.sleep}" inputmode="decimal"></div>
      <div class="field"><span class="lbl">Stress (1 entspannt – 5 sehr gestresst)</span>${scale('stress', ci.stress, ['entspannt', 'leicht', 'mittel', 'hoch', 'sehr hoch'])}</div>
      <div class="field"><span class="lbl">Stimmung (1 schlecht – 5 sehr gut)</span>${scale('mood', ci.mood, ['schlecht', 'mäßig', 'neutral', 'gut', 'sehr gut'])}</div>
      <div class="field span2"><label for="ci-note">Notiz</label><input class="input" id="ci-note" name="note" value="${esc(ci.note || '')}" placeholder="Wie fühlst du dich?"></div></div>`;
  };
  App.readCheckIn = function (form) { const fd = new FormData(form); const n = k => fd.get(k) === '' || fd.get(k) == null ? null : Number(fd.get(k)); return { sleep: n('sleep'), stress: n('stress'), mood: n('mood'), note: String(fd.get('note') || ''), goal: String(fd.get('goal') || ''), createdAt: new Date().toISOString() }; };
  App.openCheckIn = function (key) {
    const d = S.day(key) || {}; const ci = d.checkIn || {};
    U.modal(`<form data-action="save-checkin" data-day="${key}"><div class="modal-head"><h2>Check-in ${fmt.dateFull(C.parseDayKey(key))}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>${App.checkInFields(ci)}<div class="modal-foot">${d.checkIn ? `<button type="button" class="btn ghost left" data-action="delete-checkin" data-day="${key}">Entfernen</button>` : ''}<button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Speichern</button></div></form>`, { cls: 'narrow' });
  };
  App.openSessionEnd = function () {
    const key = C.dayKey(new Date()); const d = S.day(key) || {}; const rules = S.data.rules.filter(r => r.active !== false); const followed = d.rulesFollowed || rules.map(r => r.id); const reg = d.regime || {};
    const today = this.todayTrades(); const s = C.summary(today);
    U.modal(`<form data-action="session-end"><div class="modal-head"><h2>Session beenden</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      <div class="row" style="gap:18px"><div><div class="caption">Heute</div><div class="score-big">${U.pnl(s.total)}</div></div><div><div class="caption">Trades</div><div class="score-big">${s.n}</div></div><div><div class="caption">Win-Rate</div><div class="score-big">${fmt.pct(s.winRate)}</div></div></div>
      ${rules.length ? `<div class="fieldset"><div class="legend">Welche Regeln hast du heute eingehalten?</div><div class="checklist" data-chips="rules">${rules.map(r => `<label class="it toggle"><input type="checkbox" name="rule" value="${r.id}" ${followed.includes(r.id) ? 'checked' : ''} class="hidden"><span class="box">${I.check}</span><span>${esc(r.text)}</span></label>`).join('')}</div></div>` : ''}
      <div class="fieldset"><div class="legend">Marktphase heute</div><div class="form-grid"><div class="field"><span class="lbl">Trend</span>${U.seg([['trending', 'Trend'], ['ranging', 'Seitwärts']], reg.trend || '', 'seg-set-name')}<input type="hidden" name="trend" value="${reg.trend || ''}"></div><div class="field"><span class="lbl">Volatilität</span>${U.seg([['low', 'niedrig'], ['normal', 'normal'], ['high', 'hoch']], reg.vol || '', 'seg-set-name')}<input type="hidden" name="vol" value="${reg.vol || ''}"></div></div></div>
      <div class="field"><label for="se-notes">Reflexion</label><textarea class="input" id="se-notes" name="notes" placeholder="Was lief gut, was nicht, was nimmst du mit?">${esc(d.notes || '')}</textarea></div>
      <div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">${I.check} Session beenden</button></div></form>`);
  };
  Object.assign(App.actions, {
    'seg-set'(el) { const name = el.dataset.name; const wrap = el.closest('form'); wrap.querySelector(`input[name="${name}"]`).value = el.dataset.value; el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el)); },
    'seg-set-name'(el) { const field = el.closest('.field'); const inp = field.querySelector('input[type=hidden]'); inp.value = inp.value === el.dataset.value ? '' : el.dataset.value; field.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.value === inp.value)); },
    'session-start'(form) { const ci = App.readCheckIn(form); const key = C.dayKey(new Date()); S.setDay(key, { checkIn: ci }); S.startSession({ goal: ci.goal }); U.closeModal(); U.toast('Session läuft. Viel Erfolg.', 'ok'); App.rerender(); },
    'session-end'(form) { const fd = new FormData(form); const key = C.dayKey(new Date()); const followed = [...form.querySelectorAll('input[name=rule]:checked')].map(i => i.value); const trend = fd.get('trend') || null, vol = fd.get('vol') || null; const patch = { rulesFollowed: followed, notes: String(fd.get('notes') || '') }; if (trend || vol) patch.regime = { trend: trend || undefined, vol: vol || undefined }; S.setDay(key, patch); S.endSession({ rulesFollowed: followed }); U.closeModal(); U.toast('Session beendet', 'ok'); App.rerender(); },
    'save-checkin'(form) { const ci = App.readCheckIn(form); S.setDay(form.dataset.day, { checkIn: ci }); U.closeModal(); U.toast('Check-in gespeichert', 'ok'); App.rerender(); },
    'delete-checkin'(el) { const d = S.day(el.dataset.day); if (d) { delete d.checkIn; S.save(); } U.closeModal(); App.rerender(); },
  });
  document.addEventListener('change', e => { const cb = e.target.closest('.checklist input[type=checkbox]'); if (cb) cb.closest('.it').classList.toggle('done', cb.checked); });

  /* ---------- CSV-Import ---------- */
  App.openImport = function () {
    const state = { text: '', parsed: null, mapping: {}, decimal: 'auto', dayFirst: true, account: S.defaultAccountId() };
    const render = el => {
      const body = el.querySelector('#import-body');
      if (!state.parsed) { body.innerHTML = `<div class="dropzone" id="import-drop">${I.csv}<div><b>CSV-Datei hierher ziehen</b> oder klicken zum Auswählen</div><div class="small faint" style="margin-top:6px">Exporte von Brokern und Plattformen: Spalten werden automatisch erkannt.</div><input type="file" id="import-file" accept=".csv,.txt,text/csv" class="hidden"></div><details style="margin-top:8px"><summary class="muted small" style="cursor:pointer">Oder Text einfügen</summary><textarea class="input" id="import-text" placeholder="Symbol;Richtung;Eröffnung;Schluss;Einstieg;Ausstieg;Stück;Gebühren"></textarea><button type="button" class="btn sm" id="import-parse" style="margin-top:8px">Einlesen</button></details>`; const dz = body.querySelector('#import-drop'), fi = body.querySelector('#import-file'); dz.addEventListener('click', () => fi.click()); dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); }); dz.addEventListener('dragleave', () => dz.classList.remove('over')); dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) readFile(f); }); fi.addEventListener('change', () => { if (fi.files[0]) readFile(fi.files[0]); }); body.querySelector('#import-parse').addEventListener('click', () => { state.text = body.querySelector('#import-text').value; parse(); }); return; }
      const p = state.parsed; const preview = C.mapRows(p.rows, state.mapping, { decimal: state.decimal, dayFirst: state.dayFirst }); const existing = new Set(S.trades().map(C.dedupeKey)); const dup = preview.trades.filter(t => existing.has(C.dedupeKey(t))).length; state.preview = preview; state.dup = dup;
      const fieldOpts = h => `<select class="select" data-map="${esc(h)}"><option value="">Ignorieren</option>${Object.entries(C.FIELDS).map(([f, def]) => `<option value="${f}" ${state.mapping[f] === h ? 'selected' : ''}>${esc(def.label)}${def.required ? ' *' : ''}</option>`).join('')}</select>`;
      body.innerHTML = `<div class="row between"><div class="muted small">${p.rows.length} Zeilen, Trennzeichen „${p.delimiter === '\t' ? 'Tab' : p.delimiter}“</div><div class="row"><label class="field" style="flex-direction:row;align-items:center;gap:6px"><span class="lbl">Dezimal</span><select class="select" id="imp-dec" style="width:auto"><option value="auto" ${state.decimal === 'auto' ? 'selected' : ''}>automatisch</option><option value="," ${state.decimal === ',' ? 'selected' : ''}>Komma (1.234,56)</option><option value="." ${state.decimal === '.' ? 'selected' : ''}>Punkt (1,234.56)</option></select></label><label class="field" style="flex-direction:row;align-items:center;gap:6px"><span class="lbl">Datum</span><select class="select" id="imp-day" style="width:auto"><option value="1" ${state.dayFirst ? 'selected' : ''}>Tag.Monat.Jahr</option><option value="0" ${!state.dayFirst ? 'selected' : ''}>Monat/Tag/Jahr</option></select></label><label class="field" style="flex-direction:row;align-items:center;gap:6px"><span class="lbl">Konto</span><select class="select" id="imp-acc" style="width:auto">${S.data.accounts.map(a => `<option value="${a.id}" ${a.id === state.account ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label></div></div>
        <div class="fieldset"><div class="legend">Spalten zuordnen</div><div class="map-row caption" style="border-bottom:1px solid var(--border)"><span>Spalte in der Datei</span><span>Beispielwert</span><span>Feld im Journal</span></div>${p.headers.map(h => `<div class="map-row"><b>${esc(h)}</b><span class="sample">${esc((p.rows[0] || {})[h] || '')}</span>${fieldOpts(h)}</div>`).join('')}</div>
        ${preview.errors.length ? `<div class="banner warn">${I.warning}<div><b>${preview.errors.length} Zeilen können nicht gelesen werden</b>${preview.errors.slice(0, 4).map(e => `<div class="small">Zeile ${e.line}: ${esc(e.msg)}</div>`).join('')}${preview.errors.length > 4 ? `<div class="small">…</div>` : ''}</div></div>` : ''}
        ${preview.trades.length ? `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Symbol</th><th>Eröffnung</th><th>Schluss</th><th class="r">Einstieg</th><th class="r">Ausstieg</th><th class="r">Stück</th><th class="r">Netto-P&L</th></tr></thead><tbody>${preview.trades.slice(0, 6).map(t => { const d = C.derive(t); return `<tr><td class="sym">${esc(t.symbol)} ${U.badge(d.direction)}</td><td>${fmt.dateTime(d.open)}</td><td>${d.close ? fmt.dateTime(d.close) : '<span class="faint">offen</span>'}</td><td class="r">${fmt.price(d.entryPrice)}</td><td class="r">${d.exitPrice != null ? fmt.price(d.exitPrice) : '—'}</td><td class="r">${fmt.num(d.quantity, 4)}</td><td class="r">${d.closed ? U.pnl(d.pnl) : '—'}</td></tr>`; }).join('')}</tbody></table></div><div class="muted small">${preview.trades.length} Trades erkannt${dup ? `, davon ${dup} bereits vorhanden (werden übersprungen)` : ''}.</div>` : `<div class="empty">${I.csv}<b>Noch keine Trades erkannt</b><span class="small">Ordne mindestens Symbol, Eröffnung und Einstiegskurs zu.</span></div>`}`;
      body.querySelectorAll('[data-map]').forEach(sel => sel.addEventListener('change', () => { const h = sel.dataset.map; for (const f of Object.keys(state.mapping)) if (state.mapping[f] === h) delete state.mapping[f]; if (sel.value) state.mapping[sel.value] = h; render(el); }));
      body.querySelector('#imp-dec').addEventListener('change', e => { state.decimal = e.target.value; render(el); }); body.querySelector('#imp-day').addEventListener('change', e => { state.dayFirst = e.target.value === '1'; render(el); }); body.querySelector('#imp-acc').addEventListener('change', e => { state.account = e.target.value; });
      el.querySelector('#import-go').disabled = !preview.trades.length || preview.trades.length === dup; el.querySelector('#import-go').hidden = false; el.querySelector('#import-reset').hidden = false;
    };
    const readFile = f => { const r = new FileReader(); r.onload = () => { state.text = r.result; parse(); }; r.readAsText(f); };
    const parse = () => { state.parsed = C.parseCSV(state.text); if (!state.parsed.headers.length) { U.toast('Datei ist leer oder unlesbar', 'err'); state.parsed = null; return; } state.mapping = C.guessMapping(state.parsed.headers); render(modalEl); };
    const modalEl = U.modal(`<div class="modal-head"><h2>CSV importieren</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div id="import-body"></div><div class="modal-foot"><button type="button" class="btn ghost left" id="import-reset" hidden>Andere Datei</button><button type="button" class="btn" data-close>Abbrechen</button><button type="button" class="btn primary" id="import-go" hidden>Importieren</button></div>`, { cls: 'wide', onMount(el) { render(el); el.querySelector('#import-reset').addEventListener('click', () => { state.parsed = null; el.querySelector('#import-go').hidden = true; el.querySelector('#import-reset').hidden = true; render(el); }); el.querySelector('#import-go').addEventListener('click', () => { const existing = new Set(S.trades().map(C.dedupeKey)); const fresh = state.preview.trades.filter(t => !existing.has(C.dedupeKey(t))); fresh.forEach(t => { t.accountId = state.account; if (t.setup) S.addTag('setups', t.setup); }); S.addTrades(fresh); U.closeModal(); U.toast(`${fresh.length} Trades importiert`, 'ok'); App.rerender(false); }); } });
  };

  root.App = App;
})(typeof self !== 'undefined' ? self : this);
