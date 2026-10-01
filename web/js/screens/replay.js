/* Blind-Replay: alte eigene Trades ohne Ergebnis sehen, „Nehmen“ oder „Skippen“ entscheiden, Sicherheit angeben, Auflösung in R.
   Karteikasten: falsch eingeschätzte Trades kommen öfter wieder (Rechenlogik in web/js/replay.js, Daten in Store.data.replay). */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, R = root.Replay;
  const N = 10;
  const st = () => App.state.replay || (App.state.replay = { session: null, showSetup: false });
  const pct = v => v == null ? '—' : fmt.pct(v, 0);
  const tradeById = all => { const m = new Map(); for (const t of all) m.set(t.id, t); return m; };

  /* ---------- Übersicht ---------- */
  function overview(all) {
    const eligible = R.eligible(all); const hist = S.replayHistory(); const stats = R.stats(hist, all);
    const start = eligible.length
      ? `<button type="button" class="btn primary" data-action="replay-start">${I.play} Session starten <span class="muted small">(${Math.min(N, eligible.length)} Karten)</span></button>`
      : `<button type="button" class="btn primary" data-action="replay-start" disabled>Session starten</button>`;
    const intro = U.card('Blind-Replay', `<p class="muted" style="max-width:60ch">Du siehst den Chart vor dem Einstieg, Instrument und Uhrzeit, aber nicht das Ergebnis. Entscheide, ob du den Trade nehmen würdest. Richtig heißt: Gewinner genommen oder Verlierer geskippt. Falsch eingeschätzte Trades kommen öfter wieder.</p>
      <div class="row" style="gap:10px;margin-top:14px;flex-wrap:wrap">${start}<span class="small muted">${eligible.length} Trades mit „Screenshot vor Entry“${eligible.length ? '' : '. Lade bei deinen Trades einen Screenshot vor dem Einstieg hoch, dann erscheinen sie hier.'}</span></div>`);
    const tiles = `<div class="grid tiles">${U.tile('Trefferquote', pct(stats.hitRate), { n: `${stats.n} Karten` })}${U.tile('Letzte 20', pct(stats.recent))}${U.tile('Sessions', fmt.int(stats.timeline.length))}${U.tile('Karteikasten', `<span class="replay-boxes"><b>${stats.boxes[1] || 0}</b><i>Fach 1</i><b>${stats.boxes[2] || 0}</b><i>Fach 2</i><b>${stats.boxes[3] || 0}</b><i>Fach 3</i></span>`, { info: 'Fach 1: zuletzt falsch eingeschätzt, kommt am häufigsten. Fach 3: dreimal in Folge richtig.' })}</div>`;
    const setups = stats.bySetup.length ? `<div class="tbl-wrap inset"><table class="tbl compact"><thead><tr><th>Setup</th><th class="r">Karten</th><th class="r">Richtig</th><th class="r">Quote</th></tr></thead><tbody>${stats.bySetup.map(s => `<tr><td>${esc(s.setup)}</td><td class="r">${s.n}</td><td class="r">${s.correct}</td><td class="r"><b>${pct(s.hitRate)}</b></td></tr>`).join('')}</tbody></table></div>` : U.empty('stats', 'Noch keine Karten', 'Starte eine Session, dann siehst du hier deine Trefferquote je Setup.');
    const conf = stats.byConfidence.map(c => U.barRow(`Sicherheit ${c.confidence}`, c.hitRate || 0, 1, `${pct(c.hitRate)} · ${c.n}`)).join('') || `<span class="small muted">Noch keine Daten.</span>`;
    if (stats.timeline.length) U.chartData['replay-timeline'] = { values: stats.timeline.map(x => Math.round((x.hitRate || 0) * 100)) };
    const timeline = stats.timeline.length >= 2 ? `<div class="chart h120" data-chart="spark" data-id="replay-timeline"></div><div class="small muted" style="margin-top:6px">Trefferquote je Session in Prozent, älteste links.</div>` : `<span class="small muted">Ab zwei Sessions erscheint hier der Verlauf.</span>`;
    return `<div class="stack replay">${intro}${tiles}<div class="grid two">${U.card('Trefferquote je Setup', setups)}${U.card('Sicherheit vs. Treffer', conf, { info: 'Wie oft du richtig lagst, je nachdem wie sicher du dir warst.' })}</div>${U.card('Verlauf', timeline)}</div>`;
  }

  /* ---------- Session ---------- */
  function startSession(all) {
    const eligible = R.eligible(all); if (!eligible.length) return U.toast('Keine Trades mit „Screenshot vor Entry“', 'err');
    const rng = C.mulberry(Date.now() % 100000);
    const picked = R.pick(eligible, S.replayHistory(), N, rng);
    st().session = { id: C.uid(), startedAt: new Date().toISOString(), queue: picked.map(t => t.id), idx: 0, reveal: null, confidence: 2, results: [] };
    App.rerender(false);
  }
  function sessionView(all) {
    const s = st(); const ses = s.session; const byId = tradeById(all); const t = byId.get(ses.queue[ses.idx]);
    const total = ses.queue.length;
    if (!t) return summaryView();
    const head = `<div class="row between replay-head"><div><div class="caption">Karte ${ses.idx + 1} von ${total}</div><div class="replay-progress">${ses.queue.map((_, i) => `<i class="${i < ses.idx ? (ses.results[i] && ses.results[i].correct ? 'ok' : 'bad') : i === ses.idx ? 'cur' : ''}"></i>`).join('')}</div></div>
      <div class="row" style="gap:8px"><label class="check small"><input type="checkbox" data-change="replay-setup" ${s.showSetup ? 'checked' : ''}> Setup anzeigen</label><button type="button" class="btn ghost sm" data-action="replay-abort">Abbrechen</button></div></div>`;
    const meta = `<div class="replay-meta"><span class="sym">${esc(t.symbol)}</span><span class="muted">${fmt.dateTime(t.open)}</span>${s.showSetup && t.setup ? U.chip(t.setup, 'setup') : ''}</div>`;
    const shot = `<div class="replay-shot"><img data-blob="${esc(t.screenshotPre)}" alt="Chart vor dem Einstieg" data-action="lightbox" data-blob-id="${esc(t.screenshotPre)}"></div>`;
    let body;
    if (!ses.reveal) {
      body = `${meta}${shot}<div class="replay-decide"><div class="field"><span class="lbl">Wie sicher bist du?</span>${U.seg([['1', '1 · unsicher'], ['2', '2'], ['3', '3 · sicher']], String(ses.confidence), 'replay-conf')}</div>
        <div class="row" style="gap:10px;flex-wrap:wrap"><button type="button" class="btn primary big" data-action="replay-decide" data-value="take">${I.check} Nehmen</button><button type="button" class="btn big" data-action="replay-decide" data-value="skip">${I.close} Skippen</button></div></div>`;
    } else {
      const g = ses.reveal; const after = (t.screenshots || []).filter(id => id !== t.screenshotPre);
      const rest = after.length ? `<div class="shots">${after.map(id => `<div class="shot"><img data-blob="${id}" alt="Chart nach dem Einstieg" data-action="lightbox" data-blob-id="${id}"></div>`).join('')}</div>` : `<div class="small muted">Kein weiterer Screenshot zu diesem Trade.</div>`;
      body = `${meta}${shot}<div class="replay-result ${g.correct ? 'ok' : 'bad'}"><div class="replay-verdict">${g.correct ? I.check + ' Richtig' : I.close + ' Daneben'}</div><div class="replay-outcome">${g.winner ? 'Gewinner' : 'Verlierer'} · ${g.r != null ? U.rText(g.r) : U.pnl(g.pnl, '', { r: null })}${t.setup ? ` · ${esc(t.setup)}` : ''}</div><div class="small muted">Du hast „${g.decision === 'take' ? 'Nehmen' : 'Skippen'}“ gewählt mit Sicherheit ${g.confidence}.</div></div>
        <div class="caption" style="margin-top:14px">So ging es weiter</div>${rest}
        <div class="row" style="margin-top:16px"><button type="button" class="btn primary" data-action="replay-next">${ses.idx + 1 < total ? 'Nächste Karte' : 'Auswertung'} ${I.chevR}</button></div>`;
    }
    return `<div class="stack replay">${head}<section class="card replay-card">${body}</section></div>`;
  }
  function summaryView() {
    const ses = st().session; const n = ses.results.length; const ok = ses.results.filter(r => r.correct).length;
    return `<div class="stack replay"><section class="card replay-summary"><div class="caption">Session beendet</div><div class="replay-big">${ok} von ${n} richtig</div><div class="muted">${n ? fmt.pct(ok / n, 0) : '—'} Trefferquote in dieser Session.</div>
      <div class="row" style="gap:10px;margin-top:18px;flex-wrap:wrap"><button type="button" class="btn primary" data-action="replay-start">${I.play} Neue Session</button><button type="button" class="btn" data-action="replay-close">Zur Übersicht</button></div></section></div>`;
  }

  Object.assign(App.actions, {
    'replay-start'() { startSession(App.allTrades()); },
    'replay-abort'() { st().session = null; App.rerender(false); },
    'replay-close'() { st().session = null; App.rerender(false); },
    'replay-conf'(el) { const ses = st().session; if (ses) { ses.confidence = Number(el.dataset.value) || 2; App.rerender(); } },
    'replay-setup'(el) { st().showSetup = el.checked; App.rerender(); },
    'replay-decide'(el) {
      const ses = st().session; if (!ses || ses.reveal) return; const t = tradeById(App.allTrades()).get(ses.queue[ses.idx]); if (!t) return;
      const g = R.grade(t, el.dataset.value); const card = { tradeId: t.id, decision: el.dataset.value, confidence: ses.confidence, correct: g.correct, r: g.r, at: new Date().toISOString(), sessionId: ses.id };
      ses.reveal = Object.assign({ decision: el.dataset.value, confidence: ses.confidence }, g); ses.results.push(card);
      S.addReplayCard(card); App.rerender();
    },
    'replay-next'() { const ses = st().session; if (!ses) return; ses.idx += 1; ses.reveal = null; App.rerender(false); },
  });

  App.screens.replay = {
    title: 'Blind-Replay',
    render(ctx) { const s = st(); if (!R) return U.empty('stats', 'Replay nicht geladen', 'Das Modul replay.js fehlt.'); return s.session ? (s.session.idx < s.session.queue.length ? sessionView(ctx.all) : summaryView()) : overview(ctx.all); },
  };
  /* Beim Verlassen der Seite bleibt eine laufende Session erhalten; eine beendete wird verworfen */
  window.addEventListener('hashchange', () => { const s = App.state.replay; if (s && s.session && s.session.idx >= s.session.queue.length && location.hash.indexOf('#/replay') !== 0) s.session = null; });
})(typeof self !== 'undefined' ? self : this);
