/* App-Rahmen: Router, Seitenleiste, Kopfzeile, Aktionen, Dialoge */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt;
  const M = root.Motion || { enabled: false, scan() {}, transition(fn) { fn(); }, leave(el, c, d, done) { done(); } };

  /* Seitenleiste in Gruppen: was ist los, was habe ich gehandelt, woran arbeite ich, welche Konten */
  const NAV_GROUPS = [
    ['Übersicht', [['dashboard', 'Dashboard', 'dashboard'], ['stats', 'Statistiken', 'stats'], ['progress', 'Fortschritt', 'progress']]],
    ['Journal', [['trades', 'TradeLog', 'tradelog'], ['day', 'Tagesansicht', 'day'], ['notebook', 'Notebook', 'journal']]],
    ['Training', [['shadow', 'Schatten-Ich', 'shadow'], ['replay', 'Blind-Replay', 'replay'], ['mentor', 'Mentor', 'chat'], ['ruhepunkt', 'Ruhepunkt', 'calm']]],
    ['Konten', [['prop', 'Prop Firms', 'prop'], ['coupons', 'Coupon-Codes', 'coupon']]],
  ]; /* Coach steht nicht in der Navigation, sondern im Konto-Menü unten (userCard) */
  const TREND_LABELS = { up: 'Aufwärts', down: 'Abwärts', trending: 'Trend', ranging: 'Seitwärts' };
  const PRESETS = { today: 'Heute', week: 'Diese Woche', month: 'Dieser Monat', last30: 'Letzte 30 Tage', quarter: 'Dieses Quartal', year: 'Dieses Jahr', all: 'Gesamt', custom: 'Benutzerdefiniert' };

  /* Hinweis-Punkte der Seitenleiste: Bereich, Bezeichnung und Erklärung für Einstellungen → Benachrichtigungen */
  const NAV_DOT_AREAS = [
    ['dashboard', 'Dashboard', 'Ein neuer Wochen- oder Monats-Recap wartet.'],
    ['trades', 'TradeLog', 'Es gibt offene Positionen.'],
    ['day', 'Tagesansicht', 'Der Check-in für heute fehlt (Montag bis Freitag).'],
    ['notebook', 'Notebook', 'Heute gehandelt, aber noch keine Tagesnotiz.'],
    ['progress', 'Fortschritt', 'Heute gehandelt, aber die Regeln noch nicht abgehakt.'],
    ['prop', 'Prop Firms', 'Ein aktives Prop-Konto steht auf Rot oder hat eine Regel verletzt.'],
  ];

  const App = {
    NAV_DOT_AREAS,
    /* Prüfungen je Bereich: liefern einen kurzen Grund (Tooltip) oder null. Bereiche mit eigenen Daten melden sich über navDot an */
    dots: {
      trades: c => { const n = c.all.filter(t => !t.closed).length; return n ? (n === 1 ? '1 offene Position' : `${n} offene Positionen`) : null; },
      day: c => { const wd = new Date().getDay(); if (wd === 0 || wd === 6) return null; return (S.day(c.key) || {}).checkIn ? null : 'Check-in für heute fehlt'; },
      notebook: c => (!c.todays.length || S.notesByDay()[c.key] ? null : 'Tagesnotiz für heute fehlt'),
      progress: c => { const rules = (S.data.rules || []).filter(r => r.active !== false); if (!rules.length || !c.todays.length) return null; const f = (S.day(c.key) || {}).rulesFollowed; return f && f.length ? null : 'Regeln von heute noch nicht abgehakt'; },
    },
    navDot(key, fn) { this.dots[key] = fn; },
    TREND_LABELS, TREND_OPTIONS: [['up', 'Aufwärts'], ['down', 'Abwärts'], ['ranging', 'Seitwärts']],
    screens: {}, actions: {}, state: { route: 'dashboard', params: [], sidebarOpen: false, calMonth: null, tradeSort: { key: 'openedAt', dir: -1 }, tradeFilter: { q: '', symbol: '', setup: '', status: '', mistake: '', view: 'trades' }, statsTab: 'summary', journal: { folder: 'daily', note: null }, recentTab: 'recent' },
    /* ---------- Daten ---------- */
    allTrades() { const acc = S.settings.accountId; return C.deriveAll(S.trades().filter(t => acc === 'all' || !acc || t.accountId === acc)); },
    /* rr: anderer Zeitraum als der gespeicherte (Vorschau im Zeitraum-Menü) */
    range(rr) {
      const r = rr || S.settings.range || { preset: 'month' }; const now = new Date(); const start = new Date(now); start.setHours(0, 0, 0, 0); const end = new Date(now); end.setHours(23, 59, 59, 999);
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
    /* R-Einheit für den Geld-blind-Modus: Einstellung, sonst Median des Risikos aller Trades mit Stop; null, wenn nichts bekannt */
    rUnit(all) { const set = Number(S.settings.blindRUnit); if (set > 0) return set; const risks = (all || this.allTrades()).filter(t => t.risk > 0).map(t => t.risk).sort((a, b) => a - b); if (!risks.length) return null; const m = Math.floor(risks.length / 2); return risks.length % 2 ? risks[m] : (risks[m - 1] + risks[m]) / 2; },
    navigate(hash) { if (location.hash === hash) this.render(); else location.hash = hash; },
    parseRoute() { const h = location.hash.replace(/^#\/?/, ''); if (h.startsWith('share_')) { this.state.route = 'share'; this.state.params = [h.slice(6)]; return; } const parts = h.split('/').filter(Boolean); if (parts[0] === 'journal') parts[0] = 'notebook'; const route = parts[0] && this.screens[parts[0]] ? parts[0] : 'dashboard'; this.state.route = route; this.state.params = parts.slice(1).map(decodeURIComponent); },
    /* ---------- Rendern ---------- */
    render(o) {
      const enter = !o || o.enter !== false; /* neue Seite: Inhalte gleiten ein; Neuaufbau nach Eingaben: nur, was noch unter dem Fenster liegt */
      if (root.DatePicker) root.DatePicker.close(true);
      if (this._screen && this._screen.unmount) { try { this._screen.unmount(); } catch (e) { console.warn(e); } }
      this.parseRoute(); fmt.setCurrency(S.currency()); root.Theme.apply(S.settings); C.setBreakEven(S.settings.beOffset);
      /* gleiche Seite, andere Parameter (Tag vor/zurück, Reiter): kein gestaffelter Einzug der Karten, nur ein kurzes ruhiges Einblenden
         des Inhalts; Diagramme zeichnen sich nur beim echten Seitenwechsel */
      const routeChanged = this._lastRoute !== this.state.route || !!(o && o.first); const prevParam = this._lastParam; this._lastRoute = this.state.route; const scr0 = this.screens[this.state.route]; this._lastParam = this.state.params[0] || (scr0 && scr0.defaultParam ? scr0.defaultParam() : '');
      const swap = enter && !routeChanged && !(o && o.keep) ? 'swap' : '';
      const screen = this.screens[this.state.route]; this._screen = screen; const ctx = { params: this.state.params, all: this.allTrades() }; ctx.inRange = this.tradesInRange(ctx.all);
      fmt.setMoneyBlind(S.settings.moneyBlind, this.rUnit(ctx.all));
      const main = document.getElementById('main'); const title = typeof screen.title === 'function' ? screen.title(ctx) : screen.title;
      document.title = `${root.I18N ? root.I18N.t(title) : title} · Journalyst`;
      const body = screen.render(ctx); /* zuerst der Inhalt: er kann ctx.headLeft für die Kopfreihe setzen (Notebook: Suche) */
      /* Neuaufbau: alte Höhe halten, bis die Bilder (Screenshots) geladen sind – sonst ist die Seite kurz zu kurz und die Scrollposition rutscht auf 0 */
      const keep = o && o.keep; const hold = keep ? main.offsetHeight : 0; const tok = this._holdTok = (this._holdTok || 0) + 1;
      main.style.minHeight = hold ? hold + 'px' : '';
      main.innerHTML = `${this.topbar(title, screen, ctx)}<div class="content${swap ? ' ' + swap : ''}" id="content">${screen.ownActions ? '' : this.pageHead(screen, ctx)}${body}</div>`;
      this.translateNow(main); /* sofort übersetzen: Scrollstand und Höhen gelten für den übersetzten Text, nicht für das deutsche Zwischenbild */
      M.scan(main.querySelector('#content'), enter && !swap);
      this.renderSidebar();
      /* Diagramme zeichnen sich nur beim Seitenwechsel ein (nicht beim Neuaufbau nach Eingaben); bei „Bewegung reduzieren“ nie */
      U.enterCharts(enter && routeChanged && M.enabled !== false && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)); U.drawCharts(main); U.enterCharts(false); const imgs = this.loadBlobImages(main); const short = keep ? this.restoreScroll(main, keep) : []; if (screen.mount) screen.mount(main, ctx); this.catchUpScroll(short);
      window.scrollTo({ top: keep ? keep.y : 0 });
      if (keep && keep.anchor) this.keepAnchor(main, keep.anchor);
      if (hold) this.releaseHeight(main, imgs, tok, short);
    },
    /* gehaltene Höhe freigeben, sobald alle Bilder da sind (höchstens 2 s); ein neuerer Aufbau übernimmt das Halten */
    releaseHeight(main, imgs, tok, short) {
      /* Freigeben, aber nie unter das, was das Fenster gerade zeigt: wird die Seite kürzer (z. B. eine Tabelle unten fällt weg),
         würde der Browser den Scrollstand kürzen und alles rutschen. Der Rest bleibt als Luft unten bis zum nächsten Aufbau. */
      const done = () => { if (this._holdTok !== tok) return; this.catchUpScroll(short); const c = main.querySelector('#content'); const mt = main.getBoundingClientRect().top; const natural = c ? c.getBoundingClientRect().bottom - mt + (parseFloat(getComputedStyle(main).paddingBottom) || 0) : 0; const need = Math.ceil(window.innerHeight - mt); main.style.minHeight = need > natural + 1 ? need + 'px' : ''; };
      Promise.resolve(imgs).catch(() => {}).then(() => Promise.race([
        Promise.all([...main.querySelectorAll('img')].filter(i => !i.complete).map(i => new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))),
        new Promise(r => setTimeout(r, 2000)),
      ])).then(done);
    },
    /* Neu eingefügten Inhalt sofort in die gewählte Sprache übersetzen (der Beobachter in i18n.js käme erst nach dem Skript dran;
       bis dahin wäre der deutsche Text da, oft länger – und der Browser richtet Scrollstände am falschen Layout aus) */
    translateNow(el) { if (root.I18N && root.I18N.lang() !== 'de' && el) root.I18N.translate(el); },
    /* Scrollstand über einen Neuaufbau retten: das Fenster und jeder gescrollte Bereich im Inhalt (Notizliste, Spalten, Tabellen,
       Listen in Seitenleisten). Wiedergefunden wird ein Bereich über seinen Weg im Baum: id, sonst Tag + erste Klasse + Position
       unter gleichartigen Geschwistern. data-keep-scroll merkt einen Bereich auch in Ausgangsstellung (z. B. ganz links). */
    scrollPath(el, box) {
      const path = [];
      for (let e = el; e && e !== box; e = e.parentElement) {
        if (e.id) { path.unshift({ id: e.id }); break; }
        const c = e.classList[0] || ''; let i = 0; for (let s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName && (s.classList[0] || '') === c) i++;
        path.unshift({ tag: e.tagName, c, i });
      }
      return path;
    },
    saveScroll(box) {
      const areas = []; if (box) box.querySelectorAll('*').forEach(e => { if (e.scrollTop > 0 || e.scrollLeft > 0 || e.hasAttribute('data-keep-scroll')) areas.push({ path: this.scrollPath(e, box), top: e.scrollTop, left: e.scrollLeft }); });
      return { y: window.scrollY, areas };
    },
    restoreScroll(box, keep) {
      const short = [];
      for (const a of keep.areas) {
        let el = box;
        for (const p of a.path) { if (!el) break; el = p.id ? box.querySelector('#' + CSS.escape(p.id)) : [...el.children].filter(k => k.tagName === p.tag && (k.classList[0] || '') === p.c)[p.i] || null; }
        if (el && el !== box) { el.scrollTop = a.top; el.scrollLeft = a.left; el.dataset.scrollKept = '1'; if (el.scrollTop < a.top - 1 || el.scrollLeft < a.left - 1) short.push({ el, a, t: el.scrollTop, l: el.scrollLeft }); }
      }
      return short;
    },
    /* Bereiche, die beim Setzen noch zu kurz waren (der Notiz-Editor entsteht erst im mount, Bilder laden später), nachziehen –
       nur wenn dort seitdem niemand gescrollt hat (auch mount nicht, z. B. Mentor-Verlauf ans Ende) */
    catchUpScroll(short) {
      for (const x of short) { if (!x.el.isConnected || x.el.scrollTop !== x.t || x.el.scrollLeft !== x.l) continue; x.el.scrollTop = x.a.top; x.el.scrollLeft = x.a.left; x.t = x.el.scrollTop; x.l = x.el.scrollLeft; }
    },
    /* Popover in seiner Box halten: ragt ein rechtsbündiges Menü links aus dem nächsten scrollenden Rahmen (z. B. der Notiz-Spalte), klappt es nach rechts auf */
    fitPopover(pop) {
      if (pop.id === 'pop-user') { const mini = document.documentElement.classList.contains('sb-mini'); const card = pop.parentElement.querySelector('.sb-user'); if (mini && card) { const r = card.getBoundingClientRect(), sb = document.getElementById('sidebar').getBoundingClientRect(); pop.style.left = `${Math.round(sb.right + 8)}px`; pop.style.bottom = `${Math.round(window.innerHeight - r.bottom)}px`; } else { pop.style.left = ''; pop.style.bottom = ''; } return; }
      const fixedLeft = pop.classList.contains('left') && !pop.dataset.autoLeft; pop.style.left = '';
      if (!fixedLeft) { pop.classList.remove('left'); delete pop.dataset.autoLeft; }
      let left = 0, right = Math.min(document.documentElement.clientWidth, window.innerWidth, screen.width || Infinity); /* nicht innerWidth allein: auf dem Handy wächst es mit überstehendem Inhalt */
      for (let a = pop.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/(auto|scroll|hidden|clip)/.test(cs.overflowX + ' ' + cs.overflowY)) { const b = a.getBoundingClientRect(); left = b.left; right = Math.min(right, b.right); break; } }
      if (!fixedLeft && pop.getBoundingClientRect().left < left + 4) { pop.classList.add('left'); pop.dataset.autoLeft = '1'; }
      /* links verankerte Menüs (Vorlagen, Sortierung …) ragen auf dem Handy rechts hinaus: so weit nach links schieben, dass sie im Bild bleiben */
      const r = pop.getBoundingClientRect(); const over = r.right - (right - 8); if (over > 0 && pop.classList.contains('left')) pop.style.left = `${-Math.round(Math.min(over, Math.max(0, r.left - left - 8)))}px`;
    },
    /* offene Popover ausblenden und dann schließen; except = Popover, das gerade umgeschaltet wird */
    closePopovers(except) { document.querySelectorAll('.popover.open:not(.closing)').forEach(p => { if (p.id === except) return; M.leave(p, 'closing', '--dur-1', () => p.classList.remove('open', 'closing')); }); },
    /* Schalter gleiten lassen, auch wenn die Aktion die Seite neu aufbaut: den neuen Schalter kurz in den alten Zustand setzen und dann umschalten */
    switchMark(el) { if (!el.matches('.switch[role="switch"]')) return null; const sel = '.switch' + [...el.attributes].filter(a => a.name.startsWith('data-') && a.name !== 'data-tip').map(a => `[${a.name}="${CSS.escape(a.value)}"]`).join(''); return { el, sel, was: el.getAttribute('aria-checked') }; },
    glideSwitch(sw) {
      if (sw.el.isConnected) return; const n = document.querySelector(sw.sel); if (!n) return; const now = n.getAttribute('aria-checked'); if (now === sw.was) return;
      const tile = n.closest('.shadow-rule'); n.classList.add('no-anim'); n.setAttribute('aria-checked', sw.was); void n.offsetWidth; n.classList.remove('no-anim'); n.setAttribute('aria-checked', now);
      if (tile) { const on = tile.classList.contains('on'); tile.style.transition = 'none'; tile.classList.toggle('on', !on); void tile.offsetWidth; tile.style.transition = ''; tile.classList.toggle('on', on); }
    },
    rerender(keepScroll = true) { const keep = keepScroll ? this.saveScroll(document.getElementById('main')) : null; if (keep) keep.anchor = this.takeAnchor(); this.render({ enter: false, keep }); },
    /* Angeklicktes Element an seinem Platz halten: Ändert sich durch die Aktion etwas darüber (ein Hinweis verschwindet, eine Karte wächst),
       gleicht der Scrollstand das aus – das Element bleibt unter der Maus. Nur für Elemente im normalen Seitenfluss (nicht in Dialogen,
       Menüs, festen Leisten oder eigenen Scrollbereichen); gemessen ohne Transformationen (Einblend-Animationen), über offsetTop */
    anchorKey(el) {
      const A = ['data-action', 'data-change', 'data-input', 'data-rule', 'data-field', 'data-value', 'data-key', 'data-id', 'data-typ', 'data-symbol', 'data-area'];
      const parts = A.filter(a => el.hasAttribute(a)).map(a => `[${a}="${CSS.escape(el.getAttribute(a))}"]`); return parts.length ? el.tagName.toLowerCase() + parts.join('') : null;
    },
    docTop(el) { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; },
    inPageFlow(el) {
      const main = document.getElementById('main'); if (!main || !main.contains(el) || el.closest('.modal-bg, .modal, .popover, .side-panel, [data-no-anchor]')) return false;
      for (let a = el.parentElement; a && a !== main; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.position === 'fixed' || cs.position === 'sticky' || /(auto|scroll)/.test(cs.overflowY)) return false; }
      return true;
    },
    noteAnchor(el) { this._anchor = null; try { const key = this.anchorKey(el); if (!key || !this.inPageFlow(el)) return; this._anchor = { key, top: this.docTop(el) - window.scrollY, y: window.scrollY, route: this.state.route, hash: location.hash, t: Date.now() }; } catch (e) { this._anchor = null; } },
    takeAnchor() { const a = this._anchor; this._anchor = null; return a && a.y === window.scrollY && a.hash === location.hash && Date.now() - a.t < 3000 ? a : null; }, /* nur direkt nach der Aktion, ohne Scrollen dazwischen */
    keepAnchor(main, a) {
      if (!a || a.route !== this.state.route) return; const hits = main.querySelectorAll(a.key); if (hits.length !== 1 || !this.inPageFlow(hits[0])) return;
      const d = Math.round(this.docTop(hits[0]) - window.scrollY - a.top); if (Math.abs(d) >= 1) window.scrollTo({ top: Math.max(0, window.scrollY + d) });
    },
    renderSidebar() {
      const sb = document.getElementById('sidebar'); const cur = this.state.route; const theme = S.settings.theme || 'dark';
      /* Hinweis-Punkte: nur wenn eingeschaltet (Einstellungen → Benachrichtigungen); Grund steht im Tooltip */
      const nd = Object.assign({ on: true }, S.settings.navDots || {}); const all = nd.on ? this.allTrades() : null;
      const dctx = all ? { all, todays: this.todayTrades(all), key: C.dayKey(new Date()) } : null;
      const why = key => { if (!dctx || nd[key] === false || !this.dots[key]) return null; try { return this.dots[key](dctx) || null; } catch (e) { console.warn(e); return null; } };
      const dot = key => { const w = why(key); return w ? `<span class="nav-dot" role="img" title="${esc(w)}" aria-label="${esc(w)}"></span>` : ''; };
      const item = ([key, label, icon]) => `<a href="#/${key}" class="${cur === key ? 'active' : ''}" title="${label}" data-action="nav-close">${I[icon]}<span>${label}</span>${dot(key)}</a>`;
      /* Mini-Modus (nur Symbole) auf dem Desktop, gemerkt in den Einstellungen; auf dem Handy bleibt die Leiste ein Einblend-Menü */
      const desk = window.matchMedia('(min-width: 961px)').matches; const mini = !!S.settings.sidebarMini && desk; document.documentElement.classList.toggle('sb-mini', mini);
      sb.innerHTML = `<div class="brand"><span class="mark">${I.logo}</span><span class="brand-text"><span class="name no-i18n">Journal<em>yst</em></span><span class="sub no-i18n">Trading Journal App</span></span>${desk ? `<button type="button" class="sb-toggle" data-action="sb-toggle" aria-label="${mini ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen'}" title="${mini ? 'Ausklappen' : 'Einklappen'}">${I.panel}</button>` : `<button type="button" class="sb-toggle" data-action="sb-toggle" aria-label="Menü schließen" title="Schließen">${I.close}</button>`}</div><hr class="sb-sep">${NAV_GROUPS.map(([title, items]) => `<nav class="nav nav-group" aria-label="${title}"><div class="nav-title">${title}</div>${items.map(item).join('')}</nav>`).join('')}<div class="spacer"></div>${this.userCard(theme, why('coach'))}`;
      this.loadBlobImages(sb);
      const open = this.state.sidebarOpen; sb.classList.toggle('open', open); const scrim = document.getElementById('scrim'); scrim.hidden = false; scrim.classList.toggle('show', open);
      document.querySelectorAll('.menu-btn').forEach(b => b.setAttribute('aria-expanded', String(open)));
    },
    /* Konto-Karte unten in der Seitenleiste: Profilbild, Name, E-Mail; Klick öffnet das Menü mit Profil, Coach, Einstellungen,
       Benachrichtigungen, Sprache und Hell/Dunkel. Ersetzt den früheren Einstellungen-Eintrag und den Hell/Dunkel-Schalter.
       coachWhy: Grund für den Hinweis-Punkt bei Coach (neue Aufgabe) – dann auch ein Punkt am Profilbild */
    userCard(theme, coachWhy) {
      const st = S.settings, pr = st.profile || {}; const cur = this.state.route;
      const full = [pr.firstName, pr.lastName].map(x => String(x || '').trim()).filter(Boolean).join(' '); const user = String(pr.username || '').trim().replace(/^@/, '');
      const name = full || user || (st.name && st.name !== 'Trader' ? String(st.name).trim() : '') || 'Trader';
      const mail = String(pr.email || '').trim(); const sub = mail || (user ? '@' + user : '');
      const initials = name.split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
      const chev = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
      const cdot = coachWhy ? `<span class="nav-dot" role="img" title="${esc(coachWhy)}" aria-label="${esc(coachWhy)}"></span>` : '';
      const link = (href, icon, label, extra = '', on = false) => `<a class="item${on ? ' on' : ''}" role="menuitem" href="${href}" data-action="nav-close">${I[icon]}<span>${label}</span>${extra}</a>`;
      return `<div class="popwrap sb-userwrap"><button type="button" class="sb-user${cur === 'settings' || cur === 'coach' ? ' active' : ''}" data-pop="user" aria-haspopup="menu" aria-label="Konto und Einstellungen" title="Konto und Einstellungen">
        <span class="sb-avwrap"><span class="sb-av">${st.avatarId ? `<img data-blob="${esc(st.avatarId)}" alt="">` : `<span class="no-i18n">${esc(initials)}</span>`}</span>${coachWhy ? cdot.replace('nav-dot', 'nav-dot sb-av-dot') : ''}</span>
        <span class="sb-who"><b class="no-i18n">${esc(name)}</b>${sub ? `<span class="no-i18n">${esc(sub)}</span>` : '<span>Profil vervollständigen</span>'}</span>
        <span class="sb-chev">${chev('M7 14l5-5 5 5')}${chev('M7 10l5 5 5-5')}</span></button>
        <div class="popover up sb-menu" id="pop-user" role="menu">${link('#/settings/profil', 'account', 'Profil')}${link('#/coach', 'coach', 'Coach', cdot, cur === 'coach')}${link('#/settings', 'settings', 'Einstellungen')}${link('#/settings/benachrichtigungen', 'bell', 'Benachrichtigungen')}${link('#/settings/sprache', 'globe', 'Sprache')}
          <div class="sb-menu-sep"></div><div class="sb-menu-row"><span>Design</span><div class="theme-toggle" role="group" aria-label="Erscheinungsbild"><button type="button" data-action="theme" data-value="dark" aria-pressed="${theme === 'dark'}" aria-label="Dunkel">${I.moon}</button><button type="button" data-action="theme" data-value="light" aria-pressed="${theme === 'light'}" aria-label="Hell">${I.sun}</button></div></div></div></div>`;
    },
    /* Vorgabe für das Zeitraum-Menü: Schlüssel, Name und Tage (JJJJ-MM-TT) zum Markieren im Kalender; „Gesamt“ ohne Tage */
    presetPick(key) { const r = this.range({ preset: key }); return { key, label: PRESETS[key] || key, from: r.from ? C.dayKey(r.from) : '', to: r.from && r.to ? C.dayKey(r.to) : '' }; },
    /* Bausteine der Kopfreihe: Zeitraum, Konto, Session, neuer Trade (Dashboard ordnet sie selbst an, alle anderen Seiten über pageHead) */
    rangeControl() {
      const r = this.range();
      return `<div class="popwrap"><button type="button" class="btn" data-pop="range">${I.calendar}<span>${esc(r.label)}</span>${I.chev.replace('<svg', '<svg class="caret"')}</button><div class="popover range-pop" id="pop-range"><div class="rr-presets">${Object.entries(PRESETS).filter(([k]) => k !== 'custom').map(([k, l]) => `<button type="button" class="item" data-action="range" data-value="${k}" aria-checked="${r.preset === k}">${l}</button>`).join('')}</div><div class="rr-cal"><div class="sec">Benutzerdefiniert</div>${root.RangePicker ? (r.preset === 'custom' ? root.RangePicker.html((S.settings.range || {}).from, (S.settings.range || {}).to) : root.RangePicker.html('', '', this.presetPick(r.preset))) : ''}</div></div></div>`;
    },
    /* o.mobile: auch auf dem Handy zeigen (sonst nur ab Tablet-Breite) */
    accountControl(o = {}) {
      const acc = S.settings.accountId; const accounts = S.data.accounts; const accName = acc === 'all' || !acc ? (accounts.length > 1 ? 'Alle Konten' : (accounts[0] || {}).name || 'Konto') : ((accounts.find(a => a.id === acc) || {}).name || 'Konto');
      return `<div class="popwrap${o.mobile ? '' : ' hide-m'}"><button type="button" class="btn" data-pop="account" title="Konto: ${esc(accName)}">${I.account}<span>${esc(accName)}</span>${I.chev.replace('<svg', '<svg class="caret"')}</button><div class="popover" id="pop-account">${accounts.length > 1 ? `<button type="button" class="item" data-action="account" data-value="all" aria-checked="${acc === 'all'}">Alle Konten</button>` : ''}${accounts.map(a => `<button type="button" class="item" data-action="account" data-value="${a.id}" aria-checked="${acc === a.id}">${esc(a.name)}<span class="muted small" style="margin-left:auto">${fmt.cur(a.size, { compact: true })}</span></button>`).join('')}<hr><a class="item" href="#/settings">${I.settings} Konten verwalten</a></div></div>`;
    },
    /* iconOnly: nur Symbol mit Tooltip, der Text bleibt für Screenreader im Knopf (Klasse vh) */
    sessionControl(iconOnly) {
      const sess = S.activeSession();
      if (sess) return `<button type="button" class="btn" data-action="end-session" title="Session beenden">${I.stop}<span id="session-timer">${fmt.hm((Date.now() - new Date(sess.startedAt)) / 1000)}</span></button>`;
      return iconOnly ? `<button type="button" class="btn icon-only" data-action="start-session" title="Session starten" aria-label="Session starten">${I.play}<span class="vh">Session starten</span></button>`
        : `<button type="button" class="btn hide-m" data-action="start-session">${I.play}<span>Session starten</span></button>`;
    },
    newTradeButton() { return `<button type="button" class="btn accent tl" data-action="new-trade">${I.plus}<span>Trade loggen</span></button>`; },
    /* Kopfreihe unter dem Seitentitel wie beim Dashboard: links Zeitraum und Konto, rechts die Knöpfe der Seite, Session und „Trade loggen“.
       screen.head schaltet Teile ab und kann einen kurzen Hinweis zeigen (Mentor: nur das Konto, weil es bestimmt, welche Trades der Mentor sieht) */
    pageHead(screen, ctx) {
      const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '' }, screen.head);
      const own = screen.actions ? screen.actions(ctx) : '';
      const left = `${h.range ? this.rangeControl() : ''}${h.account ? this.accountControl({ mobile: !h.range }) : ''}${ctx.headLeft || ''}${h.note ? `<span class="ph-note">${esc(h.note)}</span>` : ''}`;
      const right = `${own}${h.session ? this.sessionControl(true) : ''}${h.trade ? `${own || h.session ? '<span class="dh-sep" aria-hidden="true"></span>' : ''}${this.newTradeButton()}` : ''}`;
      return `<div class="dash-head page-head${right ? '' : ' compact'}">${left ? `<div class="row dh-context">${left}</div>` : ''}${right ? `<div class="row dh-tools">${right}</div>` : ''}</div>`;
    },
    topbar(title, screen, ctx) {
      const initials = (S.settings.name || 'T').split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();
      return `<header class="topbar"><button type="button" class="btn ghost icon menu-btn" data-action="sidebar" aria-label="Menü">${I.menu}</button><h1>${esc(title)}</h1>${screen.titleBadge ? screen.titleBadge(ctx) : ''}<div class="actions">
        <a class="avatar" href="#/settings/profil" title="Profil">${S.settings.avatarId ? `<img data-blob="${esc(S.settings.avatarId)}" alt="">` : esc(initials)}</a></div></header>`;
    },
    async loadBlobImages(scope) { const imgs = scope.querySelectorAll('img[data-blob]'); for (const img of imgs) { const u = await root.Blobs.url(img.dataset.blob).catch(() => null); if (u) { img.addEventListener('load', () => img.classList.add('loaded'), { once: true }); img.src = u; if (img.complete && img.naturalWidth) img.classList.add('loaded'); } else img.closest('.shot, .thumb, .lib-card')?.classList.add('missing'); } const auds = scope.querySelectorAll('audio[data-blob]'); for (const a of auds) { const u = await root.Blobs.url(a.dataset.blob).catch(() => null); if (u) a.src = u; } },

    /* ---------- Aktionen ---------- */
    bind() {
      S.touchLogin(); /* Sitzungsbeginn für „Letzter Login“; beim Verlassen das letzte Lebenszeichen merken */
      window.addEventListener('pagehide', () => S.markSeen()); document.addEventListener('visibilitychange', () => { if (document.hidden) S.markSeen(); });
      document.addEventListener('click', e => {
        const pop = e.target.closest('[data-pop]'); if (pop) { const id = 'pop-' + pop.dataset.pop; this.closePopovers(id); const target = document.getElementById(id); if (target) { if (target.classList.contains('open') && !target.classList.contains('closing')) this.closePopovers(); else { target.classList.remove('closing'); target.classList.add('open'); this.fitPopover(target); } } return; }
        if (!e.target.closest('.popover')) this.closePopovers();
        const stopEl = e.target.closest('[data-stop]'); const closeEl = e.target.closest('[data-close]'); const el = e.target.closest('[data-action]');
        const inside = x => !!x && x !== stopEl && stopEl.contains(x);
        if (stopEl && !inside(closeEl) && !inside(el)) return; /* data-stop schirmt nur äußere Aktionen ab, nicht Knöpfe darin */
        if (closeEl) { if (closeEl.isConnected) U.closeModal(); return; }
        if (!el || el.tagName === 'FORM') return;
        const fn = this.actions[el.dataset.action]; if (fn) { e.preventDefault(); this.noteAnchor(el); const sw = this.switchMark(el); fn.call(this, el, e); if (sw) this.glideSwitch(sw); }
      });
      document.addEventListener('submit', e => { const f = e.target.closest('form[data-action]'); if (f) { const fn = this.actions[f.dataset.action]; if (fn) { e.preventDefault(); fn.call(this, f, e); } } });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') { U.closeModal(); this.closePopovers(); if (this.state.sidebarOpen) { this.state.sidebarOpen = false; this.renderSidebar(); } } });
      /* Fenster breiter als die Mobil-Grenze: ein offen gebliebenes Menü zurücksetzen */
      window.matchMedia('(min-width: 961px)').addEventListener('change', () => { this.state.sidebarOpen = false; this.renderSidebar(); });
      if (root.RangePicker) root.RangePicker.init(); /* Zeitraum „Benutzerdefiniert“ mit zwei Monaten */
      if (root.DatePicker) root.DatePicker.init(); /* eigener Kalender für Datumsfelder, nach dem Klick-Handler oben registriert */
      document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (el) { const fn = this.actions[el.dataset.input]; if (fn) fn.call(this, el, e); } });
      document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el) { const fn = this.actions[el.dataset.change]; if (fn) { this.noteAnchor(el); fn.call(this, el, e); } } });
      /* Seitenwechsel mit Überblendung der ganzen Seite; innerhalb derselben Seite (Tag vor/zurück, Reiter) ohne – dort blendet nur der
         Inhalt kurz und ruhig ein (keine Verschiebung, keine Schnappschüsse: Schrift bleibt scharf, nichts rüttelt) */
      window.addEventListener('hashchange', () => {
        this.state.sidebarOpen = false; const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean); const route = parts[0] === 'journal' ? 'notebook' : parts[0];
        if (this._lastRoute !== route) M.transition(() => this.render()); else this.render();
      });
      /* Wörterbuch einer neu gewählten Sprache ist nachgeladen: Seite neu aufbauen (Fenstertitel, Diagramm-Beschriftungen) */
      window.addEventListener('i18n-ready', () => this.rerender());
      let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => U.drawCharts(document.getElementById('main')), 120); });
      setInterval(() => { const t = document.getElementById('session-timer'); const s = S.activeSession(); if (t && s) t.textContent = fmt.hm((Date.now() - new Date(s.startedAt)) / 1000); }, 1000);
      U.bindTips();
    },
  };

  Object.assign(App.actions, {
    sidebar() { this.state.sidebarOpen = !this.state.sidebarOpen; this.renderSidebar(); },
    /* Knopf in der Marke: Desktop klappt auf Symbole zusammen, Handy schließt das Menü */
    'sb-toggle'() { if (window.matchMedia('(min-width: 961px)').matches) { S.settings.sidebarMini = !S.settings.sidebarMini; S.save(); this.renderSidebar(); } else { this.state.sidebarOpen = false; this.renderSidebar(); } },
    scrim() { this.state.sidebarOpen = false; this.renderSidebar(); },
    /* Link in der Seitenleiste: Navigation läuft normal über href; nur das mobile Menü schließen */
    'nav-close'(el) { const h = el.getAttribute('href'); this.closePopovers(); if (this.state.sidebarOpen) { this.state.sidebarOpen = false; this.renderSidebar(); } if (h && location.hash !== h) location.hash = h; },
    /* Erscheinungsbild in den Einstellungen: Graphit oder Schwarz (beide dunkel) oder Weiß (hell); der Schalter im Konto-Menü wechselt nur Dunkel/Hell und behält die dunkle Variante */
    appearance(el) { const v = el.dataset.value; if (v !== 'light') S.setSetting('darkStyle', v === 'schwarz' ? 'schwarz' : 'graphit'); this.actions.theme.call(this, { dataset: { value: v === 'light' ? 'light' : 'dark' } }); },
    theme(el) { S.setSetting('theme', el.dataset.value); root.Theme.apply(S.settings); /* Schalter nicht neu aufbauen, damit der Knopf hinübergleitet */ document.querySelectorAll('.theme-toggle button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === S.settings.theme))); if (this.state.route === 'settings') this.rerender(); else U.drawCharts(document.getElementById('main')); },
    /* Vorgabe links nur markieren und im Kalender zeigen; übernommen wird erst mit „Anwenden“ */
    range(el) { const pop = el.closest('.range-pop'); if (!pop || !root.RangePicker) return; pop.querySelectorAll('.rr-presets [data-action="range"]').forEach(b => b.setAttribute('aria-checked', String(b === el))); root.RangePicker.setPreset(pop.querySelector('[data-rr-root]'), this.presetPick(el.dataset.value)); },
    'range-custom'() { const v = root.RangePicker ? root.RangePicker.value() : { from: '' }; if (v.preset) S.setSetting('range', { preset: v.preset, from: null, to: null }); else if (!v.from) return U.toast('Bitte ein Startdatum wählen', 'err'); else S.setSetting('range', { preset: 'custom', from: v.from, to: v.to || v.from }); this.closePopovers(); this.rerender(); },
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
    'sample-retry'() { try { S.installSample(); U.toast('Beispieldaten geladen', 'ok'); } catch (e) { S.settings.sampleError = { message: String(e && e.message || e), stack: String(e && e.stack || '').slice(0, 1200), at: new Date().toISOString(), ua: navigator.userAgent }; S.save(); U.toast('Beispieldaten konnten nicht geladen werden', 'err'); } this.rerender(false); },
    'sample-error-dismiss'() { delete S.settings.sampleError; S.settings.sampleVersion = (root.Sample && root.Sample.VERSION) || S.settings.sampleVersion; S.save(); this.rerender(false); },
    'remove-sample'() { S.removeSample(); U.toast('Beispieldaten entfernt'); this.rerender(false); },
    import() { this.openImport(); },
  });

  /* ---------- Trade-Editor ---------- */
  App.openTradeEditor = function (trade, preset = {}) {
    const t = trade || Object.assign({ symbol: '', direction: 1, openedAt: new Date().toISOString(), closedAt: null, entryPrice: '', exitPrice: '', quantity: 1, multiplier: 1, fees: 0, plannedEntry: '', plannedStop: '', plannedTarget: '', plannedReason: '', mae: '', mfe: '', setup: '', strategy: '', mistakes: [], emotions: [], rulesBroken: [], rating: null, notes: '', accountId: S.defaultAccountId() }, preset);
    const tags = S.data.tags; const rules = S.data.rules.filter(r => r.active !== false);
    const chips = (kind, list, sel, cls) => `<div class="chips" data-chips="${kind}">${list.map(x => `<button type="button" class="chip sel ${cls}" data-action="toggle-chip" data-value="${esc(x)}" aria-pressed="${sel.includes(x)}">${esc(x)}</button>`).join('')}<button type="button" class="chip sel" data-action="add-chip" data-kind="${kind}">${I.plus} Neu</button></div>`;
    const html = `<form id="trade-form" data-action="save-trade" data-id="${t.id || ''}"><div class="modal-head"><h2>${trade ? 'Trade bearbeiten' : 'Trade loggen'}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      <div class="stack" style="gap:16px">
      <div class="form-grid">
        <div class="field"><label for="f-symbol">Symbol</label><input class="input" id="f-symbol" name="symbol" value="${esc(t.symbol)}" placeholder="z. B. DAX, NQ, EURUSD" required autocapitalize="characters"></div>
        <div class="field"><span class="lbl">Richtung</span><div class="seg" id="f-dir">${U.seg([[1, 'Long'], [-1, 'Short']], t.direction, 'set-dir')}</div><input type="hidden" name="direction" value="${t.direction}"></div>
        <div class="field"><label for="f-account">Konto</label><select class="select" id="f-account" name="accountId">${S.data.accounts.map(a => `<option value="${a.id}" ${a.id === t.accountId ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>
        ${(S.propAccounts ? S.propAccounts() : []).filter(a => a.status !== 'archived').length ? `<div class="field" style="grid-column:1 / -1"><span class="lbl">Prop-Konten <span class="muted">(Copy-Trading: mehrere möglich)</span></span><div class="chips" data-chips="propAccountIds">${S.propAccounts().filter(a => a.status !== 'archived').map(a => `<button type="button" class="chip sel" data-action="toggle-chip" data-value="${esc(a.id)}" aria-pressed="${(t.propAccountIds || []).includes(a.id)}">${esc(`${a.firm || ''} ${a.name || ''}`.trim() || 'Prop-Konto')}</button>`).join('')}</div></div>` : ''}
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
    /* Prop-Konten: die Chips zeigen nur nicht archivierte Konten. Zuordnungen zu archivierten Konten (oder ohne Chip-Block) bleiben erhalten. */
    const propWrap = form.querySelector('[data-chips="propAccountIds"]'); const prevProp = ((form.dataset.id && S.getTrade(form.dataset.id)) || {}).propAccountIds || []; const shownProp = propWrap ? [...propWrap.querySelectorAll('[data-value]')].map(b => b.dataset.value) : [];
    const opened = new Date(fd.get('openedAt')); const closedRaw = fd.get('closedAt'); const closed = closedRaw ? new Date(closedRaw) : null;
    return {
      symbol: String(fd.get('symbol') || '').trim().toUpperCase(), direction: Number(fd.get('direction')) === -1 ? -1 : 1, accountId: fd.get('accountId'), openedAt: isNaN(opened) ? new Date().toISOString() : opened.toISOString(), closedAt: closed && !isNaN(closed) ? closed.toISOString() : null,
      entryPrice: num('entryPrice'), exitPrice: num('exitPrice'), quantity: Math.abs(num('quantity') || 0), multiplier: num('multiplier') || 1, fees: Math.abs(num('fees') || 0),
      plannedEntry: num('plannedEntry'), plannedStop: num('plannedStop'), plannedTarget: num('plannedTarget'), plannedReason: String(fd.get('plannedReason') || ''), mae: num('mae'), mfe: num('mfe'),
      setup: String(fd.get('setup') || '').trim(), rating: num('rating'), mistakes: chips('mistakes'), emotions: chips('emotions'), rulesBroken: chips('rulesBroken'), propAccountIds: propWrap ? [...prevProp.filter(id => !shownProp.includes(id)), ...chips('propAccountIds')] : prevProp.slice(), notes: String(fd.get('notes') || ''),
    };
  };
  /* Vorschau des gerade bearbeiteten Trades. Geld-blind: P&L mit dem exakten R des derive-Ergebnisses (ohne Stop „– R“), Risiko = 1 R per Definition; das kleine R neben dem P&L entfällt dann, weil es doppelt wäre */
  App.updateTradePreview = function (el) { const f = el.querySelector('#trade-form'); if (!f) return; const d = C.derive(Object.assign({ mistakes: [], emotions: [], rulesBroken: [] }, App.readTradeForm(f))); const p = el.querySelector('#trade-preview'); if (!d.closed) { p.innerHTML = `<span class="muted small">Offener Trade · Risiko ${d.risk ? fmt.cur(d.risk, { r: 1 }) : '—'}${d.plannedR ? ` · geplant ${fmt.r(d.plannedR, false)}` : ''}</span>`; return; } p.innerHTML = `<span class="small muted">Netto-P&L</span> ${U.pnl(d.pnl, '', { r: d.r })} ${d.r != null && !fmt.moneyBlind() ? `<span class="small muted">·</span> ${U.rText(d.r)}` : ''} <span class="small muted">· Disziplin ${C.discipline(d).score}</span>`; };
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
  App.checkTiltAfterSave = function () { if (!S.settings.tiltWarnings) return; const res = C.tiltCheck(this.todayTrades(), { account: this.account(), dailyLossLimitPct: S.settings.dailyLossLimitPct / 100, fmtMoney: v => fmt.cur(v) }); const w = res.warnings.find(x => x.severity === 'critical' || x.severity === 'high'); if (w) U.toast('⚠ ' + w.title, 'err'); };

  /* ---------- Session & Check-in ---------- */
  App.openSessionStart = function () {
    const key = C.dayKey(new Date()); const d = S.day(key) || {}; const ci = d.checkIn || {}; const rules = S.data.rules.filter(r => r.active !== false);
    U.modal(`<form data-action="session-start"><div class="modal-head"><h2>Session starten</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><p class="muted">Kurzer Check-in, bevor du handelst. Das Journal zeigt dir später, wie dein Zustand mit deinem Ergebnis zusammenhängt.</p>
      ${App.checkInFields(ci)}
      <div class="field"><label for="s-goal">Fokus für heute</label><input class="input" id="s-goal" name="goal" value="${esc(ci.goal || '')}" placeholder="z. B. Nur A-Setups, nach 2 Verlusten Schluss"></div>
      ${rules.length ? `<div class="fieldset"><div class="legend">Deine Regeln</div><div class="checklist">${rules.map(r => `<div class="it"><span class="box">${I.check}</span><span>${esc(r.text)}</span></div>`).join('')}</div></div>` : ''}
      <div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">${I.play} Session starten</button></div></form>`);
  };
  /* Schlaf-Gesicht im Linienstil der Symbole: fünf klare Zustände, weicher Wechsel per Überblendung */
  App.sleepZone = function (h) { return h < 4.5 ? { key: 'exhausted', label: 'Deutlich zu wenig Schlaf', color: 'var(--loss)' } : h < 7 ? { key: 'tired', label: 'Etwas zu wenig Schlaf', color: 'var(--warn)' } : h <= 9 ? { key: 'fit', label: 'Optimal, 7 bis 9 Stunden', color: 'var(--accent)' } : h <= 11 ? { key: 'over', label: 'Etwas zu viel Schlaf', color: 'var(--be)' } : { key: 'wired', label: 'Viel zu viel Schlaf', color: 'var(--be)' }; };
  App.SLEEP_FACES = {
    exhausted: { color: 'var(--loss)', parts: '<path d="M14,20 h8M26,20 h8"/><path d="M15,24 q3,2 6,0M27,24 q3,2 6,0" opacity=".55"/><path d="M19,32 h10"/>' },
    tired: { color: 'var(--warn)', parts: '<path d="M14,21 q4,-3 8,0M26,21 q4,-3 8,0"/><path d="M18,33 q6,-3 12,0"/>' },
    fit: { color: 'var(--accent)', parts: '<circle cx="18" cy="19" r="1.6" fill="currentColor" stroke="none"/><circle cx="30" cy="19" r="1.6" fill="currentColor" stroke="none"/><path d="M16,29 q8,8 16,0"/>' },
    over: { color: 'var(--be)', parts: '<circle cx="18" cy="19" r="3.2"/><circle cx="30" cy="19" r="3.2"/><circle cx="19.2" cy="20.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="28.8" cy="20.2" r="1.1" fill="currentColor" stroke="none"/><path d="M17,31 q3,-3 6,0 t6,0"/>' },
    wired: { color: 'var(--be)', parts: '<circle cx="18" cy="20" r="4"/><circle cx="30" cy="20" r="4"/><circle cx="18" cy="20" r="1" fill="currentColor" stroke="none"/><circle cx="30" cy="20" r="1" fill="currentColor" stroke="none"/><path d="M13,15 l7,-3M35,15 l-7,-3"/><path d="M16,32 q3,-4 6,0 t6,0 t4,-2"/>' },
  };
  App.sleepFaceHTML = function (h) {
    const active = App.sleepZone(h).key;
    return Object.entries(App.SLEEP_FACES).map(([k, f]) => `<svg viewBox="0 0 48 48" class="sleep-face ${k === active ? 'on' : ''}" data-state="${k}" style="color:${f.color}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="20"/>${f.parts}</svg>`).join('');
  };
  App.sleepFaceIcon = function (h, size = 26) { const z = App.sleepZone(Number(h)); const f = App.SLEEP_FACES[z.key]; return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" style="color:${f.color};vertical-align:middle;flex:0 0 auto" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="20"/>${f.parts}</svg>`; };
  /* Farbe für 1–5-Skalen: gut = grün, schlecht = rot; bei Stress ist hoch schlecht */
  App.scaleColor = function (n, highIsBad) { const v = Number(n); if (!v) return 'var(--muted)'; const i = highIsBad ? 6 - v : v; return ['var(--loss)', '#ff8c5c', 'var(--warn)', 'color-mix(in srgb, var(--accent) 70%, var(--warn))', 'var(--accent)'][i - 1]; };
  App.checkInFields = function (ci) {
    const scale = (name, val, labels) => `<div class="seg pill" data-chips="${name}">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-action="seg-set" data-name="${name}" data-value="${n}" aria-pressed="${Number(val) === n}" title="${labels[n - 1]}">${n}</button>`).join('')}</div><input type="hidden" name="${name}" value="${val || ''}">`;
    const sleep = ci.sleep == null ? 7 : Number(ci.sleep); const pct = sleep / 14 * 100; const zone = App.sleepZone(sleep);
    return `<div class="ci-stack">
      <div class="field"><label for="ci-sleep">Schlaf (Stunden)</label><div class="sleep-row"><div class="face-wrap" id="ci-face">${App.sleepFaceHTML(sleep)}</div><div class="grow"><div class="slider"><input type="range" id="ci-sleep" name="sleep" min="0" max="14" step="0.5" value="${sleep}" style="--p:${pct}%" data-input="ci-sleep" aria-valuetext="${fmt.num(sleep, 1)} Stunden"><b class="sv" id="ci-sleep-val" data-v="${sleep}">${fmt.num(sleep, 1)} h</b></div><div class="ticks"><span>0 h</span><span>7 h</span><span>14 h</span></div><div class="zone" id="ci-zone" style="color:${zone.color}">${zone.label}</div></div></div></div>
      <div class="field"><span class="lbl">Stress (1 entspannt – 5 sehr gestresst)</span>${scale('stress', ci.stress, ['entspannt', 'leicht', 'mittel', 'hoch', 'sehr hoch'])}</div>
      <div class="field"><span class="lbl">Stimmung (1 schlecht – 5 sehr gut)</span>${scale('mood', ci.mood, ['schlecht', 'mäßig', 'neutral', 'gut', 'sehr gut'])}</div>
      <div class="field"><label for="ci-note">Notiz</label><input class="input" id="ci-note" name="note" value="${esc(ci.note || '')}" placeholder="Wie fühlst du dich?"></div></div>`;
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
      <div class="fieldset"><div class="legend">Marktphase heute</div><div class="form-grid"><div class="field"><span class="lbl">Trend</span>${U.seg(App.TREND_OPTIONS, reg.trend || '', 'seg-set-name')}<input type="hidden" name="trend" value="${reg.trend || ''}"></div><div class="field"><span class="lbl">Volatilität</span>${U.seg([['low', 'niedrig'], ['normal', 'normal'], ['high', 'hoch']], reg.vol || '', 'seg-set-name')}<input type="hidden" name="vol" value="${reg.vol || ''}"></div></div></div>
      <div class="field"><label for="se-notes">Reflexion <span class="faint">(wird in die Tagesnotiz im Notebook geschrieben)</span></label><textarea class="input" id="se-notes" name="notes" placeholder="Was lief gut, was nicht, was nimmst du mit?"></textarea></div>
      <div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">${I.check} Session beenden</button></div></form>`);
  };
  Object.assign(App.actions, {
    'ci-sleep'(el) {
      const v = Number(el.value); el.style.setProperty('--p', v / 14 * 100 + '%'); el.setAttribute('aria-valuetext', fmt.num(v, 1) + ' Stunden');
      const form = el.closest('form'); const out = form.querySelector('#ci-sleep-val'); const face = form.querySelector('#ci-face'); const zoneEl = form.querySelector('#ci-zone');
      const z = App.sleepZone(v); if (face) face.querySelectorAll('.sleep-face').forEach(f => f.classList.toggle('on', f.dataset.state === z.key)); if (zoneEl) { zoneEl.textContent = z.label; zoneEl.style.color = z.color; }
      if (!out) return; const from = Number(out.dataset.v) || 0; out.dataset.v = v; const start = performance.now(); const dur = 260;
      cancelAnimationFrame(out._raf);
      const step = now => { const k = Math.min(1, (now - start) / dur); const e = 1 - Math.pow(1 - k, 3); const cur = from + (v - from) * e; out.textContent = fmt.num(Math.round(cur * 10) / 10, 1) + ' h'; if (k < 1) out._raf = requestAnimationFrame(step); };
      out._raf = requestAnimationFrame(step);
    },
    'seg-set'(el) { const name = el.dataset.name; const wrap = el.closest('form'); wrap.querySelector(`input[name="${name}"]`).value = el.dataset.value; el.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === el)); },
    'seg-set-name'(el) { const field = el.closest('.field'); const inp = field.querySelector('input[type=hidden]'); inp.value = inp.value === el.dataset.value ? '' : el.dataset.value; field.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.value === inp.value)); },
    'session-start'(form) { const ci = App.readCheckIn(form); const key = C.dayKey(new Date()); S.setDay(key, { checkIn: ci }); S.startSession({ goal: ci.goal }); U.closeModal(); U.toast('Session läuft. Viel Erfolg.', 'ok'); App.rerender(); },
    'session-end'(form) { const fd = new FormData(form); const key = C.dayKey(new Date()); const followed = [...form.querySelectorAll('input[name=rule]:checked')].map(i => i.value); const trend = fd.get('trend') || null, vol = fd.get('vol') || null; const patch = { rulesFollowed: followed }; if (trend || vol) patch.regime = { trend: trend || undefined, vol: vol || undefined }; S.setDay(key, patch); const refl = String(fd.get('notes') || '').trim(); if (refl) { const n = S.dayNote(key, true); S.updateNote(n.id, { content: { ops: [...(n.content.ops || []).filter((o, i, a) => !(i === a.length - 1 && o.insert === '\n' && a.length === 1)), { insert: 'Session-Reflexion' }, { attributes: { header: 3 }, insert: '\n' }, { insert: refl + '\n' }] } }); } S.endSession({ rulesFollowed: followed }); U.closeModal(); U.toast('Session beendet', 'ok'); App.rerender(); },
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
      /* Die Vorschau zeigt die Rohdaten der Datei als Geld, auch im Geld-blind-Modus: sie dient der Kontrolle von Spaltenzuordnung und Dezimaltrennzeichen gegen die Datei (Eingabe, kein Ergebnis) */
      const p = state.parsed; const preview = C.mapRows(p.rows, state.mapping, { decimal: state.decimal, dayFirst: state.dayFirst }); const existing = new Set(S.trades().map(C.dedupeKey)); const dup = preview.trades.filter(t => existing.has(C.dedupeKey(t))).length; state.preview = preview; state.dup = dup;
      const fieldOpts = h => `<select class="select" data-map="${esc(h)}"><option value="">Ignorieren</option>${Object.entries(C.FIELDS).map(([f, def]) => `<option value="${f}" ${state.mapping[f] === h ? 'selected' : ''}>${esc(def.label)}${def.required ? ' *' : ''}</option>`).join('')}</select>`;
      body.innerHTML = `<div class="row between"><div class="muted small">${p.rows.length} Zeilen, Trennzeichen „${p.delimiter === '\t' ? 'Tab' : p.delimiter}“</div><div class="row"><label class="field" style="flex-direction:row;align-items:center;gap:6px"><span class="lbl">Dezimal</span><select class="select" id="imp-dec" style="width:auto"><option value="auto" ${state.decimal === 'auto' ? 'selected' : ''}>automatisch</option><option value="," ${state.decimal === ',' ? 'selected' : ''}>Komma (1.234,56)</option><option value="." ${state.decimal === '.' ? 'selected' : ''}>Punkt (1,234.56)</option></select></label><label class="field" style="flex-direction:row;align-items:center;gap:6px"><span class="lbl">Datum</span><select class="select" id="imp-day" style="width:auto"><option value="1" ${state.dayFirst ? 'selected' : ''}>Tag.Monat.Jahr</option><option value="0" ${!state.dayFirst ? 'selected' : ''}>Monat/Tag/Jahr</option></select></label><label class="field" style="flex-direction:row;align-items:center;gap:6px"><span class="lbl">Konto</span><select class="select" id="imp-acc" style="width:auto">${S.data.accounts.map(a => `<option value="${a.id}" ${a.id === state.account ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></label></div></div>
        <div class="fieldset"><div class="legend">Spalten zuordnen</div><div class="map-row caption" style="border-bottom:1px solid var(--border)"><span>Spalte in der Datei</span><span>Beispielwert</span><span>Feld im Journal</span></div>${p.headers.map(h => `<div class="map-row"><b>${esc(h)}</b><span class="sample">${esc((p.rows[0] || {})[h] || '')}</span>${fieldOpts(h)}</div>`).join('')}</div>
        ${preview.errors.length ? `<div class="banner warn">${I.warning}<div><b>${preview.errors.length} Zeilen können nicht gelesen werden</b>${preview.errors.slice(0, 4).map(e => `<div class="small">Zeile ${e.line}: ${esc(e.msg)}</div>`).join('')}${preview.errors.length > 4 ? `<div class="small">…</div>` : ''}</div></div>` : ''}
        ${preview.trades.length ? `<div class="tbl-wrap"><table class="tbl compact"><thead><tr><th>Symbol</th><th>Eröffnung</th><th>Schluss</th><th class="r">Einstieg</th><th class="r">Ausstieg</th><th class="r">Stück</th><th class="r">Netto-P&L</th></tr></thead><tbody>${preview.trades.slice(0, 6).map(t => { const d = C.derive(t); return `<tr><td class="sym">${esc(t.symbol)} ${U.badge(d.direction)}</td><td>${fmt.dateTime(d.open)}</td><td>${d.close ? fmt.dateTime(d.close) : '<span class="faint">offen</span>'}</td><td class="r">${fmt.price(d.entryPrice)}</td><td class="r">${d.exitPrice != null ? fmt.price(d.exitPrice) : '—'}</td><td class="r">${fmt.num(d.quantity, 4)}</td><td class="r">${d.closed ? U.pnl(d.pnl, '', { money: true }) : '—'}</td></tr>`; }).join('')}</tbody></table></div><div class="muted small">${preview.trades.length} Trades erkannt${dup ? `, davon ${dup} bereits vorhanden (werden übersprungen)` : ''}.</div>` : `<div class="empty">${I.csv}<b>Noch keine Trades erkannt</b><span class="small">Ordne mindestens Symbol, Eröffnung und Einstiegskurs zu.</span></div>`}`;
      body.querySelectorAll('[data-map]').forEach(sel => sel.addEventListener('change', () => { const h = sel.dataset.map; for (const f of Object.keys(state.mapping)) if (state.mapping[f] === h) delete state.mapping[f]; if (sel.value) state.mapping[sel.value] = h; render(el); }));
      body.querySelector('#imp-dec').addEventListener('change', e => { state.decimal = e.target.value; render(el); }); body.querySelector('#imp-day').addEventListener('change', e => { state.dayFirst = e.target.value === '1'; render(el); }); body.querySelector('#imp-acc').addEventListener('change', e => { state.account = e.target.value; });
      el.querySelector('#import-go').disabled = !preview.trades.length || preview.trades.length === dup; el.querySelector('#import-go').hidden = false; el.querySelector('#import-reset').hidden = false;
    };
    const readFile = f => { state.fileName = f.name; const r = new FileReader(); r.onload = () => { state.text = r.result; parse(); }; r.readAsText(f); };
    const parse = () => { state.parsed = C.parseCSV(state.text); if (!state.parsed.headers.length) { U.toast('Datei ist leer oder unlesbar', 'err'); state.parsed = null; return; } state.mapping = C.guessMapping(state.parsed.headers); render(modalEl); };
    const modalEl = U.modal(`<div class="modal-head"><h2>CSV importieren</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div id="import-body"></div><div class="modal-foot"><button type="button" class="btn ghost left" id="import-reset" hidden>Andere Datei</button><button type="button" class="btn" data-close>Abbrechen</button><button type="button" class="btn primary" id="import-go" hidden>Importieren</button></div>`, { cls: 'wide', onMount(el) { render(el); el.querySelector('#import-reset').addEventListener('click', () => { state.parsed = null; el.querySelector('#import-go').hidden = true; el.querySelector('#import-reset').hidden = true; render(el); }); el.querySelector('#import-go').addEventListener('click', () => { const existing = new Set(S.trades().map(C.dedupeKey)); const fresh = state.preview.trades.filter(t => !existing.has(C.dedupeKey(t))); fresh.forEach(t => { t.accountId = state.account; if (t.setup) S.addTag('setups', t.setup); }); S.addTrades(fresh, 'CSV-Import'); S.addImport({ source: 'CSV', file: state.fileName || 'Eingefügter Text', accountId: state.account, count: fresh.length, dup: state.dup || 0, status: 'Erfolg' }); U.closeModal(); U.toast(`${fresh.length} Trades importiert`, 'ok'); App.rerender(false); }); } });
  };

  root.App = App;
})(typeof self !== 'undefined' ? self : this);
