/* Dashboard (Aufbau nach TradeZella) */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;

  App.screens.dashboard = {
    title: 'Dashboard',
    actions() { const w = S.settings.widgets; return `<div class="popwrap hide-m"><button type="button" class="btn" data-pop="layout">${I.layout}<span>Layout</span></button><div class="popover" id="pop-layout"><div class="sec">Widgets</div>${Object.entries(S.WIDGETS).map(([k, l]) => `<button type="button" class="item" data-action="widget" data-value="${k}" aria-checked="${w[k] !== false}">${w[k] !== false ? I.check : '<span style="width:15px"></span>'} ${esc(l)}</button>`).join('')}</div></div>`; },
    render(ctx) {
      const list = ctx.inRange, all = ctx.all; const w = S.settings.widgets; const s = C.summary(list); const days = C.dailyAggregation(list); const ds = C.daySummary(days); const account = App.account();
      const parts = []; const todayKey = C.dayKey(new Date()); const sess = S.activeSession();
      /* Tilt-Warnungen */
      if (S.settings.tiltWarnings) { const tilt = C.tiltCheck(App.todayTrades(all), { account, dailyLossLimitPct: S.settings.dailyLossLimitPct / 100 }); for (const wn of tilt.warnings) { if (S.data.dismissed[wn.kind] === todayKey) continue; parts.push(U.banner(wn.severity === 'critical' ? 'loss' : 'warn', wn.title, wn.text, { close: 'x' }).replace('data-action="x"', `data-action="dismiss" data-key="${wn.kind}"`)); } }
      if (!all.length) parts.push(U.banner('accent', 'Willkommen', 'Dein Journal ist noch leer. Logge deinen ersten Trade, importiere eine CSV oder lade Beispieldaten, um alle Auswertungen zu sehen.', { icon: 'sparkle', trailing: `<button type="button" class="btn sm" data-action="import">${I.upload} CSV</button><button type="button" class="btn sm primary" data-action="install-sample">Beispieldaten laden</button>` }));
      /* Kopfzeile: Hinweis links, „Tag starten“ rechts */
      const lastTrade = all.length ? all.slice().sort((a, b) => b.sortTime - a.sortTime)[0] : null;
      parts.push(`<div class="row between"><div class="small muted">${S.settings.sampleInstalled ? `Beispieldaten geladen, alle Zahlen sind Beispiele. <button type="button" class="btn xs ghost" data-action="remove-sample">Entfernen</button>` : lastTrade ? `<b>Letzter Trade:</b> ${fmt.dateTime(lastTrade.close || lastTrade.open)}` : ''}</div><div class="row">${sess ? `<button type="button" class="btn" data-action="end-session">${I.stop} Session beenden</button>` : `<button type="button" class="btn" data-action="start-session">${I.play} Tag starten</button>`}</div></div>`);

      /* Kennzahlen */
      if (w.kpis !== false) {
        const maxWL = Math.max(s.avgWin, -s.avgLoss, 1e-9); const wf = s.avgWin / (s.avgWin - s.avgLoss || 1) * 100;
        parts.push(`<div class="grid tiles">
          ${U.tile('Netto-P&L', U.pnl(s.total, '', { signed: false }), { n: `${s.n}`, info: 'Summe aller abgeschlossenen Trades im Zeitraum nach Gebühren.' })}
          ${U.tile('Trade-Win-Rate', fmt.pct(s.winRate, 1), { info: 'Anteil der Gewinn-Trades. Break-even-Trades zählen nicht als Gewinn.', gauge: U.semiGauge([{ v: s.wins, c: 'profit' }, { v: s.be, c: 'be' }, { v: s.losses, c: 'loss' }], ''), foot: `<span class="pills">${U.pill(s.wins, 'win')}${U.pill(s.be, 'be')}${U.pill(s.losses, 'loss')}</span>` })}
          ${U.tile('Profit-Faktor', s.n ? fmt.factor(s.pf) : '—', { info: 'Bruttogewinn geteilt durch Bruttoverlust. Über 1,5 ist gut.', gauge: U.donut([{ v: s.gp, c: 'profit' }, { v: -s.gl, c: 'loss' }], 58, 8) })}
          ${U.tile('Tages-Win-Rate', fmt.pct(ds.dayWinRate, 1), { info: 'Anteil der Handelstage mit positivem Ergebnis.', gauge: U.semiGauge([{ v: ds.winDays, c: 'profit' }, { v: ds.days - ds.winDays - ds.lossDays, c: 'be' }, { v: ds.lossDays, c: 'loss' }], ''), foot: `<span class="pills">${U.pill(ds.winDays, 'win')}${U.pill(ds.days - ds.winDays - ds.lossDays, 'be')}${U.pill(ds.lossDays, 'loss')}</span>` })}
          ${U.tile('Ø Gewinn / Verlust', s.payoff == null ? (s.avgWin > 0 ? '∞' : '—') : fmt.num(s.payoff, 2), { info: 'Durchschnittlicher Gewinn-Trade geteilt durch durchschnittlichen Verlust-Trade.', gauge: `<div class="wl-single"><div class="track"><i style="width:${s.n ? wf : 50}%;background:var(--profit)"></i><i style="flex:1;background:var(--loss)"></i></div><div class="lbl"><span class="pos">${fmt.cur(s.avgWin, { compact: s.avgWin >= 1000 })}</span><span class="neg">${fmt.cur(s.avgLoss, { compact: -s.avgLoss >= 1000 })}</span></div></div>` })}
        </div>`);
      }
      /* Score, kumulierter P&L, Kontostand */
      const row2 = [];
      if (w.score !== false) { const sc = C.traderScore(list, account); row2.push(U.card('Journal-Score', `${U.radar(sc.axes, 230)}<div class="row" style="gap:16px;margin-top:8px;align-items:center"><div><div class="caption">Dein Score</div><div class="score-big" style="color:${U.scoreColor(sc.overall)}">${sc.overall}</div></div><div class="grow score-scale" style="margin:0 8px 14px"><div class="track"></div><div class="knob" style="left:${sc.overall}%"></div><div class="lbls"><span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div></div></div>`, { info: 'Sechs Achsen von 0 bis 100: Win-Rate, Profit-Faktor, Gewinn/Verlust-Verhältnis, Konsistenz, Regeltreue und Drawdown.' })); }
      if (w.pnl !== false) { U.chartData['dash-pnl'] = { days, bars: false }; row2.push(U.card('Kumulierter Netto-P&L', `<div class="chart h280" data-chart="pnl" data-id="dash-pnl"></div>`, { info: 'Kumuliertes Tagesergebnis im Zeitraum. Grün über Null, rot darunter.' })); }
      if (w.balance !== false) { const start = account; let cum = 0; const pts = days.map(d => { cum += d.pnl; return { date: d.day, v: start + cum, pnl: d.pnl }; }); U.chartData['dash-balance'] = { points: pts, baseline: start, baselineLabel: 'Startkapital' }; row2.push(U.card('Kontostand', `<div class="chart h280" data-chart="line" data-id="dash-balance"></div><div class="legend"><span><i style="background:var(--accent)"></i>Kontostand</span><span><i style="background:var(--muted)"></i>Startkapital</span></div>`, { info: 'Kontogröße aus den Einstellungen plus kumuliertes Ergebnis im Zeitraum.' })); }
      if (row2.length) parts.push(`<div class="grid three">${row2.join('')}</div>`);
      /* Letzte Trades + Kalender */
      const row3 = [];
      if (w.recent !== false) {
        const tab = App.state.recentTab; const open = all.filter(t => !t.closed).sort((a, b) => b.open - a.open); const recent = all.filter(t => t.closed).sort((a, b) => b.close - a.close).slice(0, 8);
        const rows = tab === 'open' ? open : recent;
        const table = rows.length ? `<div class="tbl-wrap inset"><table class="tbl compact" style="min-width:0"><thead><tr><th>${tab === 'open' ? 'Eröffnet' : 'Geschlossen'}</th><th>Symbol</th><th class="r">${tab === 'open' ? 'Risiko' : 'Netto-P&L'}</th></tr></thead><tbody>${rows.map(t => `<tr class="link" data-action="trade" data-id="${t.id}"><td>${fmt.dateFull(tab === 'open' ? t.open : t.close)}</td><td class="sym">${esc(t.symbol)} ${U.badge(t.direction)}</td><td class="r">${tab === 'open' ? (t.risk ? fmt.cur(t.risk) : '—') : U.pnl(t.pnl)}</td></tr>`).join('')}</tbody></table></div>` : U.empty('tradelog', tab === 'open' ? 'Keine offenen Positionen' : 'Keine Trades', tab === 'open' ? '' : 'Logge deinen ersten Trade.');
        row3.push(`<section class="card"><div class="tabs" style="margin-bottom:12px">${[['recent', 'Letzte Trades'], ['open', `Offene Positionen${open.length ? ` (${open.length})` : ''}`]].map(([k, l]) => `<button type="button" data-action="recent-tab" data-value="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>${table}</section>`);
      }
      if (w.calendar !== false) { const now = new Date(); const m = App.state.calMonth || new Date(now.getFullYear(), now.getMonth(), 1); const daysAll = C.dailyAggregation(all); row3.push(U.card('', `<div class="row between" style="margin-bottom:14px"><div class="cal-nav"><button type="button" class="btn round" data-action="cal-prev" aria-label="Voriger Monat">${I.chevL}</button><h3 style="font-size:16px;min-width:150px;text-align:center">${fmt.monthYear(m)}</h3><button type="button" class="btn round" data-action="cal-next" aria-label="Nächster Monat">${I.chevR}</button><button type="button" class="btn sm" data-action="cal-today">Dieser Monat</button></div><div class="small muted">${monthSub(daysAll, m)}</div></div>${calendarHTML(daysAll, m.getFullYear(), m.getMonth())}`)); }
      if (row3.length) parts.push(`<div class="grid side-main">${row3.join('')}</div>`);
      return parts.join('');
    },
  };
  function monthSub(days, m) { const inM = days.filter(d => d.day.getFullYear() === m.getFullYear() && d.day.getMonth() === m.getMonth()); const total = C.sum(inM.map(d => d.pnl)); return inM.length ? `<b class="${U.cls(total)}">${fmt.cur(total, { signed: true })}</b> · ${inM.length} Handelstage` : ''; }
  function calendarHTML(days, year, month) {
    const weeks = C.calendarMonth(days, year, month); const today = C.dayKey(new Date());
    let html = C.WEEKDAYS.map(w => `<div class="wd">${w}</div>`).join('');
    for (const wk of weeks) html += wk.cells.map(c => { if (!c) return '<div class="d pad"></div>'; const e = c.entry; const k = e ? (e.pnl > C.EPS ? 'win' : e.pnl < -C.EPS ? 'loss' : 'be') : ''; return `<div class="d ${k} ${c.key === today ? 'today' : ''}" data-action="day" data-day="${c.key}" role="button" tabindex="0"><span class="n">${c.date.getDate()}</span>${e ? `<span class="p ${U.cls(e.pnl)}">${fmt.cur(e.pnl, { signed: true, compact: Math.abs(e.pnl) >= 1000 })}</span><span class="c">${e.n} Trade${e.n === 1 ? '' : 's'}</span>` : ''}</div>`; }).join('');
    return `<div class="cal">${html}</div>`;
  }
  App.calendarHTML = calendarHTML;
  Object.assign(App.actions, {
    widget(el) { const w = Object.assign({}, S.settings.widgets); w[el.dataset.value] = w[el.dataset.value] === false; S.setSetting('widgets', w); App.rerender(); },
    'cal-prev'() { const m = App.state.calMonth || new Date(); App.state.calMonth = new Date(m.getFullYear(), m.getMonth() - 1, 1); App.rerender(); },
    'cal-next'() { const m = App.state.calMonth || new Date(); App.state.calMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1); App.rerender(); },
    'cal-today'() { App.state.calMonth = null; App.rerender(); },
    'recent-tab'(el) { App.state.recentTab = el.dataset.value; App.rerender(); },
  });
})(typeof self !== 'undefined' ? self : this);
