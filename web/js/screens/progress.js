/* Fortschritt (Aufbau nach TradePath): Serie, Tagesfortschritt, Regeltreue, Aktivität, Checkliste, Regeln, Disziplin, Tilt-Profil */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;
  const WEEKS = 26;
  const arrow = (dir) => dir > 0 ? `<span class="trend up" aria-label="steigend">${I.arrowUp}</span>` : dir < 0 ? `<span class="trend down" aria-label="fallend">${I.arrowDown}</span>` : '';
  function ruleRate(rules, from, to) { const entries = Object.values(S.data.days).filter(d => d.rulesFollowed && (!from || (C.parseDayKey(d.key) >= from && C.parseDayKey(d.key) <= to))); return { n: entries.length, rate: rules.length && entries.length ? C.mean(entries.map(d => d.rulesFollowed.filter(id => rules.some(x => x.id === id)).length / rules.length)) : null }; }
  function activityGrid(activity, account) {
    const level = a => { if (!a.n) return a.checkIn || a.note ? 1 : 0; return a.n <= 1 ? 2 : a.n <= 3 ? 3 : a.n <= 5 ? 4 : 5; };
    const today = C.dayKey(new Date()); const start = activity[0].date; const weeks = Math.ceil((activity.length + ((start.getDay() + 6) % 7)) / 7);
    const cols = []; const c = new Date(start); c.setDate(c.getDate() - ((c.getDay() + 6) % 7)); const byKey = new Map(activity.map(a => [a.key, a]));
    for (let w = 0; w < weeks; w++) { const col = []; let label = ''; for (let d = 0; d < 7; d++) { const k = C.dayKey(c); const a = byKey.get(k); if (c.getDate() <= 7 && (d === 0 || w === 0) && !label) label = c.toLocaleDateString('de-DE', { month: 'short' }).replace('.', ''); col.push(a ? { a, k } : { k, future: k > today }); c.setDate(c.getDate() + 1); } cols.push({ col, label }); }
    const months = cols.map(x => `<span>${x.label}</span>`).join('');
    const rows = C.WEEKDAYS.map((wd, d) => `<span class="wl">${wd}</span>` + cols.map(x => { const cell = x.col[d]; if (!cell.a) return `<i class="${cell.future ? 'future' : ''}"></i>`; const a = cell.a; return `<i class="l${level(a)} ${a.key === today ? 'today' : ''}" data-tip="<b>${fmt.weekdayLong(a.date)}</b><br>${a.n ? `${a.n} Trade${a.n === 1 ? '' : 's'} · ${fmt.cur(a.pnl, { signed: true })}` : 'Keine Trades'}${a.checkIn ? '<br>Check-in ✓' : ''}${a.note ? '<br>Notiz ✓' : ''}" data-action="day" data-day="${a.key}"></i>`; }).join('')).join('');
    return `<div class="activity" style="--weeks:${weeks}"><div class="months"><span class="wl"></span>${months}</div><div class="cells">${rows}</div></div><div class="heat-legend"><span>Weniger</span><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><i class="l5"></i><span>Mehr</span></div>`;
  }
  App.screens.progress = {
    title: 'Fortschritt',
    mount(main) { const a = main.querySelector('.activity'); if (a) a.scrollLeft = a.scrollWidth; },
    render(ctx) {
      const all = ctx.all, list = ctx.inRange; const account = App.account(); const todayKey = C.dayKey(new Date()); const today = S.day(todayKey) || {}; const rules = S.data.rules.filter(r => r.active !== false);
      const activity = C.activityDays(all, S.checkInByDay(), S.notesByDay(), WEEKS); const streak = C.journalStreak(activity);
      const todayTrades = App.todayTrades(all); const sess = S.activeSession();
      const items = [
        { label: 'Check-in gemacht', done: !!today.checkIn, action: 'check-in' },
        { label: 'Session gestartet', done: !!sess || S.data.sessions.some(s => s.startedAt && s.startedAt.startsWith(todayKey)), action: sess ? null : 'start-session' },
        { label: 'Trades geloggt', done: todayTrades.length > 0, action: 'new-trade' },
        { label: 'Regeln abgehakt', done: !!(today.rulesFollowed && today.rulesFollowed.length) },
        { label: 'Tagesnotiz geschrieben', done: !!S.notesByDay()[todayKey], href: '#/notebook' },
      ];
      const doneN = items.filter(i => i.done).length; const pct = Math.round(doneN / items.length * 100);
      const r = App.range(); const cur = ruleRate(rules, r.from, r.to); let prev = null; if (r.from) { const len = r.to - r.from; prev = ruleRate(rules, new Date(r.from - len - 1), new Date(r.from - 1)); }
      const rateDir = cur.rate == null ? 0 : prev && prev.rate != null ? Math.sign(cur.rate - prev.rate) : (cur.rate >= 0.8 ? 1 : cur.rate < 0.5 ? -1 : 0);
      const disc = C.avgDiscipline(list); const weeks = C.weeklyDiscipline(all, 10); U.chartData['prog-weeks'] = { weeks };
      const tp = C.tiltProfile(all); const followed = today.rulesFollowed || [];
      const tilt = C.tiltCheck(todayTrades, { account, dailyLossLimitPct: S.settings.dailyLossLimitPct / 100 }); const kinds = new Set(tilt.warnings.map(w => w.kind));
      const auto = [['dailyLoss', 'Tagesverlustlimit eingehalten'], ['lossStreak', 'Keine drei Verluste in Folge'], ['sizeEscalation', 'Keine Größenerhöhung nach Verlust'], ['revenge', 'Kein sofortiger Wiedereinstieg nach Verlust'], ['rapidFire', 'Nicht mehr als drei Trades in 15 Minuten']];
      const rows = rules.map(rule => { const n = cur.n; const entries = Object.values(S.data.days).filter(d => d.rulesFollowed && (!r.from || (C.parseDayKey(d.key) >= r.from && C.parseDayKey(d.key) <= r.to))); const kept = entries.filter(d => d.rulesFollowed.includes(rule.id)).length; const broken = C.closedOnly(list).filter(t => t.rulesBroken.includes(rule.text)); return { rule, n, kept, brokenN: broken.length, brokenCost: C.sum(broken.map(t => t.pnl)) }; });
      return `<div class="grid three">
        ${U.card('Aktuelle Serie', `<div class="big-stat"><span>${streak} Tag${streak === 1 ? '' : 'e'}</span>${arrow(streak > 0 ? 1 : 0)}</div><div class="small muted">Werktage in Folge mit Trades, Check-in oder Notiz</div>`, { info: 'Wochenenden unterbrechen die Serie nicht.' })}
        ${U.card('Heutiger Fortschritt', `<div class="big-stat"><span>${doneN ? pct + ' %' : 'Keine Daten'}</span>${arrow(doneN >= 4 ? 1 : 0)}</div><div class="small muted">${doneN} von ${items.length} Schritten erledigt</div>`, { info: 'Check-in, Session, Trades, Regeln, Tagesnotiz.' })}
        ${U.card('% Regeln eingehalten', `<div class="row between" style="align-items:center"><div><div class="big-stat"><span>${cur.rate == null ? '0 %' : fmt.pct(cur.rate)}</span>${arrow(rateDir)}</div><div class="small muted">${rules.length ? (cur.n ? `${cur.n} Tage mit Regel-Check im Zeitraum` : 'Noch keine Tage mit Regel-Check') : 'Noch keine Regeln angelegt'}</div></div>${U.ring(cur.rate == null ? null : Math.round(cur.rate * 100), 84, 8)}</div>`, { info: 'Anteil der abgehakten Regeln an den Handelstagen im gewählten Zeitraum.' })}
      </div>
      ${U.card('Trading-Aktivität', activityGrid(activity, account), { info: 'Ein Kästchen pro Tag der letzten Monate. Je mehr Trades, desto kräftiger das Grün. Klick öffnet die Tagesansicht.' })}
      <div class="grid two">
        ${U.card('Tages-Checkliste', `<div class="small muted" style="margin-bottom:8px">${fmt.weekdayLong(new Date())}</div>${rules.length ? `<div class="checklist">${rules.map(rule => `<div class="it toggle ${followed.includes(rule.id) ? 'done' : ''}" data-action="day-rule" data-day="${todayKey}" data-rule="${rule.id}"><span class="box">${I.check}</span><span>${esc(rule.text)}</span></div>`).join('')}</div>` : `<div class="dashed">Noch keine Regeln. Lege unter Einstellungen deine Handelsregeln an, dann erscheinen sie hier als Checkliste.</div>`}
          <div class="caption" style="margin:14px 0 6px">Automatische Regeln</div>${todayTrades.length ? `<div class="checklist">${auto.map(([k, l]) => `<div class="it ${kinds.has(k) ? 'fail' : 'done'}"><span class="box">${kinds.has(k) ? I.close : I.check}</span><span>${l}</span></div>`).join('')}</div>` : `<div class="dashed">Noch keine Trades heute.</div>`}
          <div class="caption" style="margin:14px 0 6px">Dein Tag</div><div class="checklist">${items.map(it => `<${it.href ? 'a' : 'div'} class="it ${it.done ? 'done' : ''} ${it.action || it.href ? 'toggle' : ''}" ${it.href ? `href="${it.href}"` : it.action ? `data-action="${it.action}"` : ''}><span class="box">${I.check}</span><span>${it.label}</span></${it.href ? 'a' : 'div'}>`).join('')}</div>`, { trailing: `<a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>` })}
        ${U.card('Aktuelle Regeln', rules.length ? `<ol class="rules-list">${rules.map(rule => `<li>${esc(rule.text)}</li>`).join('')}</ol>` : U.empty('shield', 'Keine Regeln definiert', 'Lege deine Handelsregeln in den Einstellungen an.', `<a class="btn sm" href="#/settings">Regeln anlegen</a>`), { trailing: `<a class="btn sm" href="#/settings">${I.edit} Regeln bearbeiten</a>` })}
      </div>
      <div class="grid two">
        ${U.card('Disziplin pro Woche', `<div class="chart h220" data-chart="weeks" data-id="prog-weeks"></div>${disc != null ? `<div class="small muted" style="margin-top:6px">Ø Disziplin-Score der Trades im Zeitraum: <b style="color:${U.scoreColor(disc)}">${disc}</b></div>` : ''}`, { info: 'Durchschnittlicher Disziplin-Score der Trades je Woche.' })}
        ${U.card('Dein Tilt-Profil', tp.withStreak ? `<div class="row" style="gap:20px;margin-bottom:10px"><div><div class="caption">Tage mit 3 Verlusten in Folge</div><div class="score-big">${tp.withStreak}</div></div><div><div class="caption">davon negativ beendet</div><div class="score-big ${tp.losing / tp.withStreak >= 0.6 ? 'neg' : ''}">${tp.losing} <span class="muted small">(${fmt.pct(tp.losing / tp.withStreak)})</span></div></div><div><div class="caption">P&L nach der Serie</div><div class="score-big ${U.cls(tp.afterStreakPnL)}">${fmt.cur(tp.afterStreakPnL, { signed: true })}</div></div></div><p class="small muted">${tp.afterStreakPnL < 0 ? 'Weiterhandeln nach drei Verlusten hat dich bisher Geld gekostet. Ein hartes Tageslimit würde helfen.' : 'Nach Verlustserien hast du dich bisher gefangen. Bleib trotzdem wachsam.'}</p>` : '<div class="dashed">Noch keine Tage mit drei Verlusten in Folge. Gut so.</div>', { info: 'Aus deiner Historie gelernt: Wie enden Tage, an denen du drei Verluste in Folge hattest?' })}
      </div>
      ${rules.length ? U.card('Regeln im Detail', `<div class="tbl-wrap inset"><table class="tbl compact"><thead><tr><th>Regel</th><th class="r">Eingehalten (Tage)</th><th class="r">Gebrochen (Trades)</th><th class="r">Kosten</th></tr></thead><tbody>${rows.map(x => `<tr><td style="white-space:normal">${esc(x.rule.text)}</td><td class="r">${x.n ? `${x.kept} / ${x.n} (${fmt.pct(x.kept / x.n)})` : '—'}</td><td class="r">${x.brokenN}</td><td class="r">${x.brokenN ? U.pnl(x.brokenCost) : '—'}</td></tr>`).join('')}</tbody></table></div>`, { info: 'Wie oft jede Regel abgehakt wurde und was gebrochene Regeln gekostet haben.' }) : ''}`;
    },
  };
})(typeof self !== 'undefined' ? self : this);
