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
     Ruhig und knapp: eine große Zahl (richtig eingeschätzt), daneben Start und die letzten 20, darunter Runden als kleine
     Säulen (nur die letzte in Grün) und drei kleine Zahlen; dann zwei schlanke Listen (je Setup, je Gefühl) in einer Farbe.
     Ohne Daten erklärt die Startkarte in drei Schritten, worum es geht */
  const CONF_WORD = { 1: 'Unsicher', 2: 'Eher sicher', 3: 'Sicher' };
  const n1 = (n, one, many) => `${fmt.int(n)} ${n === 1 ? one : many}`;
  const row = (label, rate, sub) => `<div class="rb-row"><span class="rb-l">${esc(label)}</span><span class="rb-track"><i style="width:${Math.round((rate || 0) * 100)}%"></i></span><span class="rb-v">${pct(rate)}</span><span class="rb-n">${sub}</span></div>`;
  function overview(all) {
    const eligible = R.eligible(all); const hist = S.replayHistory(); const stats = R.stats(hist, all); const has = stats.n > 0;
    const start = `<button type="button" class="btn primary rh-start" data-action="replay-start"${eligible.length ? '' : ' disabled'}>${I.play} Session starten</button>`;
    const ready = eligible.length ? `${n1(eligible.length, 'Trade', 'Trades')} bereit` : 'Noch kein Trade mit „Screenshot vor Entry“';
    if (!has) {
      return `<div class="stack replay"><section class="card replay-hero rh-empty"><div class="card-title">Trainiere dein Bauchgefühl</div>
        <ol class="rh-steps"><li><b>1</b>Chart ansehen</li><li><b>2</b>Nehmen oder skippen</li><li><b>3</b>Ergebnis sehen</li></ol>
        <div class="rh-go">${start}<span class="rh-ready">${ready}</span></div></section></div>`;
    }
    const down = stats.recent != null && stats.hitRate - stats.recent >= 0.03, up = stats.recent != null && stats.recent - stats.hitRate >= 0.03;
    const tl = stats.timeline.slice(-20);
    const rounds = tl.length >= 2 ? `<div class="rh-rounds" aria-label="Trefferquote je Runde">${tl.map((x, i) => `<i class="${i === tl.length - 1 ? 'cur' : ''}" style="height:${Math.max(4, Math.round((x.hitRate || 0) * 100))}%" data-tip="Runde ${stats.timeline.length - tl.length + i + 1}: ${pct(x.hitRate)}"></i>`).join('')}</div><div class="rh-rounds-l">Runden</div>` : '';
    const hero = `<section class="card replay-hero"><div class="rh-main">
        <div class="rh-num"><span class="rh-lbl">Richtig eingeschätzt${U.info('Du siehst alte Trades ohne Ergebnis und entscheidest: nehmen oder skippen. Richtig ist, Gewinner zu nehmen und Verlierer zu skippen.')}</span><b class="rh-big">${pct(stats.hitRate)}</b><span class="rh-sub">${fmt.int(stats.correct)} von ${n1(stats.n, 'Trade', 'Trades')}</span></div>
        <div class="rh-trend">${rounds}</div>
        <div class="rh-go">${start}<span class="rh-ready">${ready}</span></div>
      </div><div class="rh-facts">
        <span>Letzte 20 <b class="${down ? 'neg' : up ? 'pos' : ''}">${down ? '↓ ' : up ? '↑ ' : ''}${pct(stats.recent)}</b></span>
        <span>Runden <b>${fmt.int(stats.timeline.length)}</b></span>
        <span>Zum Üben <b>${fmt.int(stats.boxes[1] || 0)}</b>${U.info('Trades, die du zuletzt falsch eingeschätzt hast. Sie kommen öfter wieder, bis du sie dreimal in Folge richtig hast.')}</span>
      </div></section>`;
    const setups = stats.bySetup.slice().sort((a, b) => (b.hitRate || 0) - (a.hitRate || 0) || b.n - a.n).map(s => row(s.setup, s.hitRate, `${s.correct}/${s.n}`)).join('');
    const feel = stats.byConfidence.map(c => row(CONF_WORD[c.confidence], c.n ? c.hitRate : 0, c.n ? `${c.correct}/${c.n}` : '—')).join('');
    return `<div class="stack replay">${hero}<div class="grid two">${U.card('Treffer je Setup', `<div class="replay-bars">${setups}</div>`)}${U.card('Treffer je Gefühl', `<div class="replay-bars">${feel}</div>`, { info: 'Wie oft du richtig lagst, je nachdem wie sicher du dir vor der Entscheidung warst.' })}</div></div>`;
  }

  /* ---------- Session ---------- */
  function newSession(all) {
    const eligible = R.eligible(all); if (!eligible.length) { U.toast('Keine Trades mit „Screenshot vor Entry“', 'err'); return false; }
    const rng = C.mulberry(Date.now() % 100000);
    const picked = R.pick(eligible, S.replayHistory(), N, rng);
    st().session = { id: C.uid(), startedAt: new Date().toISOString(), queue: picked.map(t => t.id), idx: 0, reveal: null, confidence: 2, results: [] };
    return true;
  }
  function startSession(all) { if (newSession(all)) App.rerender(false); }
  function sessionView(all) {
    const s = st(); const ses = s.session; const byId = tradeById(all); const t = byId.get(ses.queue[ses.idx]);
    const total = ses.queue.length;
    if (!t) return summaryView();
    /* Kopf der Karte: Instrument und Zeit links, Kartenzähler, Setup-Schalter und Abbrechen rechts; darunter der Fortschritt über die ganze Breite */
    const meta = `<div class="replay-meta"><span class="sym">${esc(t.symbol)}</span><span class="muted">${fmt.dateTime(t.open)}</span>${s.showSetup && t.setup ? U.chip(t.setup, 'setup') : ''}</div>`;
    const tools = `<div class="rc-tools"><span class="rc-count">Trade ${ses.idx + 1} von ${total}</span><label class="check small"><input type="checkbox" data-change="replay-setup" ${s.showSetup ? 'checked' : ''}> Setup anzeigen</label><button type="button" class="btn ghost sm" data-action="replay-abort">Abbrechen</button></div>`;
    const progress = `<div class="replay-progress">${ses.queue.map((_, i) => `<i class="${i < ses.idx ? (ses.results[i] && ses.results[i].correct ? 'ok' : 'bad') : i === ses.idx ? 'cur' : ''}"></i>`).join('')}</div>`;
    const shot = `<div class="replay-shot"><img data-blob="${esc(t.screenshotPre)}" alt="Chart vor dem Einstieg" data-action="lightbox" data-blob-id="${esc(t.screenshotPre)}"></div>`;
    let body;
    if (!ses.reveal) {
      body = `${shot}<div class="replay-decide">${confMeter(ses.confidence)}
        <div class="rd-btns"><button type="button" class="btn big" data-action="replay-decide" data-value="skip">${I.close} Skippen</button><button type="button" class="btn primary big" data-action="replay-decide" data-value="take">${I.check} Nehmen</button></div></div>`;
    } else {
      const g = ses.reveal; const after = (t.screenshots || []).filter(id => id !== t.screenshotPre);
      const rest = after.length ? `<div class="caption" style="margin-top:16px">So ging es weiter</div><div class="shots">${after.map(id => `<div class="shot"><img data-blob="${id}" alt="Chart nach dem Einstieg" data-action="lightbox" data-blob-id="${id}"></div>`).join('')}</div>` : `<div class="small muted" style="margin-top:12px">Kein weiterer Screenshot zu diesem Trade.</div>`;
      body = `${shot}<div class="replay-result ${g.correct ? 'ok' : 'bad'}"><div class="rr-text"><div class="replay-verdict">${g.correct ? I.check + ' Richtig' : I.close + ' Daneben'}</div><div class="replay-outcome">${g.winner ? 'Gewinner' : 'Verlierer'} · ${g.r != null ? U.rText(g.r) : U.pnl(g.pnl, '', { r: null })}${t.setup ? ` · ${esc(t.setup)}` : ''}</div><div class="small muted rr-choice"><span>Deine Wahl:</span> <b>${g.decision === 'take' ? 'Nehmen' : 'Skippen'}</b> <span>· Gefühl:</span> <b>${CONF_WORD[g.confidence] || CONF_WORD[2]}</b></div></div>
        <button type="button" class="btn primary" data-action="replay-next">${ses.idx + 1 < total ? 'Nächster Trade' : 'Auswertung'} ${I.chevR}</button></div>${rest}`;
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
    /* vom Dashboard-Widget: Session vorbereiten und direkt mit der ersten Karte öffnen */
    'replay-go'() { if (!newSession(App.allTrades())) return; if (location.hash.indexOf('#/replay') === 0) App.rerender(false); else location.hash = '#/replay'; },
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
