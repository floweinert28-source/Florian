/* Fortschritt: Serie, Tagesfortschritt, Regeltreue, Aktivität, Disziplin, Tilt-Profil */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;
  App.screens.progress = {
    title: 'Fortschritt',
    render(ctx) {
      const all = ctx.all; const list = ctx.inRange; const account = App.account(); const todayKey = C.dayKey(new Date()); const today = S.day(todayKey) || {}; const rules = S.data.rules.filter(r => r.active !== false);
      const activity = C.activityDays(all, S.checkInByDay(), S.notesByDay(), 26); const streak = C.journalStreak(activity);
      const todayTrades = App.todayTrades(all); const sess = S.activeSession();
      const items = [
        { label: 'Check-in gemacht', done: !!today.checkIn, action: 'check-in' },
        { label: 'Session gestartet', done: !!sess || S.data.sessions.some(s => s.startedAt && s.startedAt.startsWith(todayKey)), action: sess ? null : 'start-session' },
        { label: 'Trades geloggt', done: todayTrades.length > 0, action: 'new-trade' },
        { label: 'Regeln abgehakt', done: !!(today.rulesFollowed && today.rulesFollowed.length), href: '#/day/' + todayKey },
        { label: 'Tagesjournal geschrieben', done: !!(today.notes && today.notes.trim()) || S.data.notes.some(n => n.dateKey === todayKey && n.body), href: '#/day/' + todayKey },
      ];
      const doneN = items.filter(i => i.done).length;
      /* Regeltreue: Anteil abgehakter Regeln über Handelstage im Zeitraum */
      const r = App.range(); const dayEntries = Object.values(S.data.days).filter(d => d.rulesFollowed && (!r.from || (C.parseDayKey(d.key) >= r.from && C.parseDayKey(d.key) <= r.to)));
      const ruleRate = rules.length && dayEntries.length ? C.mean(dayEntries.map(d => d.rulesFollowed.filter(id => rules.some(x => x.id === id)).length / rules.length)) : null;
      const disc = C.avgDiscipline(list); const weeks = C.weeklyDiscipline(all, 10); U.chartData['prog-weeks'] = { weeks };
      const tp = C.tiltProfile(all); const rows = rules.map(rule => { const n = dayEntries.length; const kept = dayEntries.filter(d => d.rulesFollowed.includes(rule.id)).length; const broken = C.closedOnly(list).filter(t => t.rulesBroken.includes(rule.text)); return { rule, n, kept, brokenN: broken.length, brokenCost: C.sum(broken.map(t => t.pnl)) }; });
      return `<div class="grid three">
        ${U.card('Aktuelle Serie', `<div class="streak"><span class="big" style="color:var(--accent)">${streak}</span><span class="muted">Tag${streak === 1 ? '' : 'e'} in Folge journaliert</span></div><p class="small muted" style="margin-top:8px">Zählt Werktage mit Trades, Check-in oder Journal. Wochenenden unterbrechen die Serie nicht.</p>`, { info: 'Konstanz ist die Grundlage jeder Auswertung.' })}
        ${U.card('Heutiger Fortschritt', `<div class="row between" style="margin-bottom:10px"><span class="muted small">${doneN} von ${items.length} erledigt</span><span class="accent small"><b>${Math.round(doneN / items.length * 100)} %</b></span></div><div class="checklist">${items.map(it => `<${it.href ? 'a' : 'div'} class="it ${it.done ? 'done' : ''} ${it.action || it.href ? 'toggle' : ''}" ${it.href ? `href="${it.href}"` : it.action ? `data-action="${it.action}"` : ''}><span class="box">${I.check}</span><span>${it.label}</span></${it.href ? 'a' : 'div'}>`).join('')}</div>`)}
        ${U.card('Regeln eingehalten', `<div class="row" style="gap:18px;align-items:center">${U.ring(ruleRate == null ? null : Math.round(ruleRate * 100), 100, 10, '%')}<div class="grow small">${rules.length ? (dayEntries.length ? `Über ${dayEntries.length} Tage mit Regel-Check im Zeitraum.` : 'Noch keine Tage mit abgehakten Regeln. Beende eine Session oder hake sie in der Tagesansicht ab.') : 'Lege zuerst Regeln in den Einstellungen an.'}<div class="divider"></div><div class="kv"><span>Disziplin-Score (Trades)</span><b style="color:${disc == null ? 'inherit' : U.scoreColor(disc)}">${disc == null ? '—' : disc}</b></div></div></div>`, { info: 'Anteil der Regeln, die du an den Handelstagen abgehakt hast.' })}
      </div>
      ${U.card('Trading-Aktivität', `${U.heatmap(activity, account)}<div class="legend" style="justify-content:flex-start"><span><i style="background:var(--surface-3)"></i>kein Eintrag</span><span><i style="background:color-mix(in srgb, var(--accent) 30%, var(--surface-3))"></i>Check-in oder Journal</span><span><i style="background:var(--accent)"></i>Gewinntag</span><span><i style="background:var(--loss)"></i>Verlusttag</span></div>`, { info: 'Letzte 26 Wochen. Farbe nach Tagesergebnis, Intensität nach Größe.' })}
      <div class="grid two">
        ${U.card('Disziplin pro Woche', `<div class="chart h220" data-chart="weeks" data-id="prog-weeks"></div>`, { info: 'Durchschnittlicher Disziplin-Score der Trades je Woche.' })}
        ${U.card('Dein Tilt-Profil', tp.withStreak ? `<div class="row" style="gap:20px;margin-bottom:10px"><div><div class="caption">Tage mit 3 Verlusten in Folge</div><div class="score-big">${tp.withStreak}</div></div><div><div class="caption">davon negativ beendet</div><div class="score-big ${tp.losing / tp.withStreak >= 0.6 ? 'neg' : ''}">${tp.losing} <span class="muted small">(${fmt.pct(tp.losing / tp.withStreak)})</span></div></div><div><div class="caption">P&L nach der Serie</div><div class="score-big ${U.cls(tp.afterStreakPnL)}">${fmt.cur(tp.afterStreakPnL, { signed: true })}</div></div></div><p class="small muted">${tp.afterStreakPnL < 0 ? 'Weiterhandeln nach drei Verlusten hat dich bisher Geld gekostet. Ein hartes Tageslimit würde helfen.' : 'Nach Verlustserien hast du dich bisher gefangen. Bleib trotzdem wachsam.'}</p>` : '<div class="muted small">Noch keine Tage mit drei Verlusten in Folge. Gut so.</div>', { info: 'Aus deiner Historie gelernt: Wie enden Tage, an denen du drei Verluste in Folge hattest?' })}
      </div>
      ${rules.length ? U.card('Regeln im Detail', `<div class="tbl-wrap inset"><table class="tbl compact"><thead><tr><th>Regel</th><th class="r">Eingehalten (Tage)</th><th class="r">Gebrochen (Trades)</th><th class="r">Kosten</th></tr></thead><tbody>${rows.map(x => `<tr><td style="white-space:normal">${esc(x.rule.text)}</td><td class="r">${x.n ? `${x.kept} / ${x.n} (${fmt.pct(x.kept / x.n)})` : '—'}</td><td class="r">${x.brokenN}</td><td class="r">${x.brokenN ? U.pnl(x.brokenCost) : '—'}</td></tr>`).join('')}</tbody></table></div>`, { trailing: `<a class="btn sm ghost" href="#/settings">Regeln bearbeiten</a>` }) : ''}`;
    },
  };
})(typeof self !== 'undefined' ? self : this);
