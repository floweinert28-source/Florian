/* Blind-Replay: alte eigene Trades ohne Ergebnis sehen, „Nehmen“ oder „Skippen“ entscheiden, Sicherheit angeben, Auflösung in R.
   Karteikasten: falsch eingeschätzte Trades kommen öfter wieder (Rechenlogik in web/js/replay.js, Daten in Store.data.replay). */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, R = root.Replay;
  const N = 10;
  const st = () => App.state.replay || (App.state.replay = { session: null, showSetup: false });
  const pct = v => v == null ? '—' : fmt.pct(v, 0);
  const tradeById = all => { const m = new Map(); for (const t of all) m.set(t.id, t); return m; };

  /* ---------- Übersicht ----------
     Eine Startkarte (Frage, Start, Kennzahlen), darunter Setup und Sicherheit als Balken, dann der Verlauf; Erklärungen stecken im (i) */
  const ABOUT = 'Du siehst den Chart vor dem Einstieg, Instrument und Uhrzeit, aber nicht das Ergebnis. Entscheide, ob du den Trade nehmen würdest. Richtig heißt: Gewinner genommen oder Verlierer geskippt. Falsch eingeschätzte Trades kommen öfter wieder.';
  function overview(all) {
    const eligible = R.eligible(all); const hist = S.replayHistory(); const stats = R.stats(hist, all);
    const start = `<button type="button" class="btn primary rh-start" data-action="replay-start"${eligible.length ? '' : ' disabled'}>${I.play} Session starten${eligible.length ? ` <span class="rh-n">${Math.min(N, eligible.length)} Karten</span>` : ''}</button>`;
    const kpi = (label, value, extra = '') => `<div class="rk"><span class="rk-l">${label}${extra}</span><b class="rk-v">${value}</b></div>`;
    const boxes = `<div class="rk"><span class="rk-l">Karteikasten${U.info('Fach 1: zuletzt falsch eingeschätzt, kommt am häufigsten. Fach 3: dreimal in Folge richtig.')}</span><span class="replay-boxes"><b>${stats.boxes[1] || 0}</b><i>Fach 1</i><b>${stats.boxes[2] || 0}</b><i>Fach 2</i><b>${stats.boxes[3] || 0}</b><i>Fach 3</i></span></div>`;
    const hero = `<section class="card replay-hero"><div class="rh-top"><div class="rh-text"><div class="card-title">Würdest du ihn wieder nehmen?${U.info(ABOUT)}</div>
      <div class="rh-sub">${eligible.length} Trades mit „Screenshot vor Entry“${eligible.length ? '' : '. Lade bei deinen Trades einen Screenshot vor dem Einstieg hoch, dann erscheinen sie hier.'}</div></div>${start}</div>
      <div class="rh-kpis">${kpi('Trefferquote', pct(stats.hitRate), `<em>${stats.n} Karten</em>`)}${kpi('Letzte 20', pct(stats.recent))}${kpi('Sessions', fmt.int(stats.timeline.length))}${boxes}</div></section>`;
    const setups = stats.bySetup.length ? stats.bySetup.map(s => U.barRow(s.setup, s.hitRate || 0, 1, `${pct(s.hitRate)} · ${s.correct}/${s.n}`)).join('') : `<span class="small muted">Starte eine Session, dann siehst du hier deine Trefferquote je Setup.</span>`;
    const conf = stats.byConfidence.map(c => U.barRow(`Sicherheit ${c.confidence}`, c.hitRate || 0, 1, `${pct(c.hitRate)} · ${c.n}`)).join('') || `<span class="small muted">Noch keine Daten.</span>`;
    if (stats.timeline.length) U.chartData['replay-timeline'] = { values: stats.timeline.map(x => Math.round((x.hitRate || 0) * 100)) };
    const timeline = stats.timeline.length >= 2 ? `<div class="chart h120" data-chart="spark" data-id="replay-timeline"></div>` : `<span class="small muted">Ab zwei Sessions erscheint hier der Verlauf.</span>`;
    return `<div class="stack replay">${hero}<div class="grid two">${U.card('Trefferquote je Setup', `<div class="replay-bars">${setups}</div>`, { info: 'Anteil richtig eingeschätzter Karten je Setup · richtig/gesamt.' })}${U.card('Sicherheit vs. Treffer', `<div class="replay-bars">${conf}</div>`, { info: 'Wie oft du richtig lagst, je nachdem wie sicher du dir warst.' })}</div>${U.card('Verlauf', timeline, { info: 'Trefferquote je Session in Prozent, älteste links.' })}</div>`;
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
    /* Kopf der Karte: Instrument und Zeit links, Kartenzähler, Setup-Schalter und Abbrechen rechts; darunter der Fortschritt über die ganze Breite */
    const meta = `<div class="replay-meta"><span class="sym">${esc(t.symbol)}</span><span class="muted">${fmt.dateTime(t.open)}</span>${s.showSetup && t.setup ? U.chip(t.setup, 'setup') : ''}</div>`;
    const tools = `<div class="rc-tools"><span class="rc-count">Karte ${ses.idx + 1} von ${total}</span><label class="check small"><input type="checkbox" data-change="replay-setup" ${s.showSetup ? 'checked' : ''}> Setup anzeigen</label><button type="button" class="btn ghost sm" data-action="replay-abort">Abbrechen</button></div>`;
    const progress = `<div class="replay-progress">${ses.queue.map((_, i) => `<i class="${i < ses.idx ? (ses.results[i] && ses.results[i].correct ? 'ok' : 'bad') : i === ses.idx ? 'cur' : ''}"></i>`).join('')}</div>`;
    const shot = `<div class="replay-shot"><img data-blob="${esc(t.screenshotPre)}" alt="Chart vor dem Einstieg" data-action="lightbox" data-blob-id="${esc(t.screenshotPre)}"></div>`;
    let body;
    if (!ses.reveal) {
      body = `${shot}<div class="replay-decide">${confMeter(ses.confidence)}
        <div class="rd-btns"><button type="button" class="btn big" data-action="replay-decide" data-value="skip">${I.close} Skippen</button><button type="button" class="btn primary big" data-action="replay-decide" data-value="take">${I.check} Nehmen</button></div></div>`;
    } else {
      const g = ses.reveal; const after = (t.screenshots || []).filter(id => id !== t.screenshotPre);
      const rest = after.length ? `<div class="caption" style="margin-top:16px">So ging es weiter</div><div class="shots">${after.map(id => `<div class="shot"><img data-blob="${id}" alt="Chart nach dem Einstieg" data-action="lightbox" data-blob-id="${id}"></div>`).join('')}</div>` : `<div class="small muted" style="margin-top:12px">Kein weiterer Screenshot zu diesem Trade.</div>`;
      body = `${shot}<div class="replay-result ${g.correct ? 'ok' : 'bad'}"><div class="rr-text"><div class="replay-verdict">${g.correct ? I.check + ' Richtig' : I.close + ' Daneben'}</div><div class="replay-outcome">${g.winner ? 'Gewinner' : 'Verlierer'} · ${g.r != null ? U.rText(g.r) : U.pnl(g.pnl, '', { r: null })}${t.setup ? ` · ${esc(t.setup)}` : ''}</div><div class="small muted">Du hast „${g.decision === 'take' ? 'Nehmen' : 'Skippen'}“ gewählt mit Sicherheit ${g.confidence}.</div></div>
        <button type="button" class="btn primary" data-action="replay-next">${ses.idx + 1 < total ? 'Nächste Karte' : 'Auswertung'} ${I.chevR}</button></div>${rest}`;
    }
    return `<div class="stack replay"><section class="card replay-card"><div class="rc-head">${meta}${tools}</div>${progress}${body}</section></div>`;
  }
  /* Sicherheit als Signal-Anzeige: drei ansteigende Balken, Farbe von Bernstein (unsicher) nach Grün (sicher), daneben das Wort.
     Ein Klick füllt die Balken bis zur gewählten Stufe; nur die Anzeige ändert sich, die Seite wird nicht neu aufgebaut */
  const CONF = [['1', 'Unsicher'], ['2', 'Eher sicher'], ['3', 'Sicher']];
  function confMeter(level) {
    const lv = String(level || 2);
    return `<div class="conf" data-level="${lv}"><span class="conf-q" id="conf-q">Wie sicher bist du?</span><div class="conf-bars" role="radiogroup" aria-labelledby="conf-q">${CONF.map(([k, l]) => `<button type="button" class="conf-bar" role="radio" aria-checked="${k === lv}" aria-label="${k} · ${l}" data-action="replay-conf" data-value="${k}"><i></i></button>`).join('')}</div><span class="conf-word" aria-hidden="true">${CONF.map(([k, l]) => `<b data-l="${k}">${l}</b>`).join('')}</span></div>`;
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
    'replay-conf'(el) {
      const ses = st().session; if (!ses) return; ses.confidence = Number(el.dataset.value) || 2;
      const box = el.closest('.conf'); if (!box) return App.rerender();
      box.dataset.level = String(ses.confidence); box.querySelectorAll('.conf-bar').forEach(b => b.setAttribute('aria-checked', String(b.dataset.value === String(ses.confidence))));
    },
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
    head: { range: false }, /* Replay zieht aus allen Trades des Kontos: der Zeitraum spielt keine Rolle */
    render(ctx) { const s = st(); if (!R) return U.empty('stats', 'Replay nicht geladen', 'Das Modul replay.js fehlt.'); return s.session ? (s.session.idx < s.session.queue.length ? sessionView(ctx.all) : summaryView()) : overview(ctx.all); },
  };
  /* Beim Verlassen der Seite bleibt eine laufende Session erhalten; eine beendete wird verworfen */
  window.addEventListener('hashchange', () => { const s = App.state.replay; if (s && s.session && s.session.idx >= s.session.queue.length && location.hash.indexOf('#/replay') !== 0) s.session = null; });
})(typeof self !== 'undefined' ? self : this);
