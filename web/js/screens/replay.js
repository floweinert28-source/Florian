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
     Selbsterklärend: oben, was man hier macht (drei Schritte) und der Start; darunter die Zahlen in Alltagssprache
     (richtig eingeschätzt, letzte 20, Runden, Lernstand statt Karteikasten-Fächern), dann Setup, Gefühl und Verlauf mit je einem Satz Deutung */
  const CONF_WORD = { 1: 'Unsicher', 2: 'Eher sicher', 3: 'Sicher' };
  const n1 = (n, one, many) => `${fmt.int(n)} ${n === 1 ? one : many}`;
  function overview(all) {
    const eligible = R.eligible(all); const hist = S.replayHistory(); const stats = R.stats(hist, all); const has = stats.n > 0;
    const start = `<button type="button" class="btn primary rh-start" data-action="replay-start"${eligible.length ? '' : ' disabled'}>${I.play} Session starten${eligible.length ? ` <span class="rh-n">${n1(Math.min(N, eligible.length), 'Trade', 'Trades')}</span>` : ''}</button>`;
    const steps = `<ol class="rh-steps"><li><b>1</b>Chart vor dem Einstieg ansehen</li><li><b>2</b>Nehmen oder skippen?</li><li><b>3</b>Ergebnis sehen</li></ol>`;
    const avail = eligible.length ? `${n1(eligible.length, 'Trade', 'Trades')} mit „Screenshot vor Entry“ verfügbar` : 'Noch kein Trade mit „Screenshot vor Entry“. Lade ihn in der Trade-Ansicht hoch, dann kannst du hier üben.';
    /* Kennzahlen */
    const kpi = (label, value, foot = '', o = {}) => `<div class="rk${o.cls ? ' ' + o.cls : ''}"><span class="rk-l">${label}${o.info ? U.info(o.info) : ''}</span>${value}${foot ? `<span class="rk-f">${foot}</span>` : ''}</div>`;
    const big = v => `<b class="rk-v">${v}</b>`;
    const trend = stats.recent == null || stats.hitRate == null ? '' : stats.recent - stats.hitRate >= 0.03 ? '<span class="pos">↑ besser als dein Schnitt</span>' : stats.hitRate - stats.recent >= 0.03 ? '<span class="neg">↓ schlechter als dein Schnitt</span>' : 'wie dein Schnitt';
    const bx = stats.boxes, bt = (bx[1] || 0) + (bx[2] || 0) + (bx[3] || 0);
    const seg = (k, cls) => bx[k] ? `<i class="${cls}" style="flex:${bx[k]}"></i>` : '';
    const learn = kpi('Lernstand', `<div class="learn-bar">${bt ? `${seg(1, 'l1')}${seg(2, 'l2')}${seg(3, 'l3')}` : '<i class="l0"></i>'}</div>`, `<span class="replay-learn"><span class="l1"><b>${bx[1] || 0}</b> noch üben</span><span class="l2"><b>${bx[2] || 0}</b> einmal richtig</span><span class="l3"><b>${bx[3] || 0}</b> sitzen</span></span>`, { cls: 'rk-learn', info: 'Falsch eingeschätzte Trades kommen öfter wieder. Ein Trade „sitzt“, wenn du ihn dreimal in Folge richtig eingeschätzt hast.' });
    const kpis = has ? `<div class="rh-kpis">${kpi('Richtig eingeschätzt', big(pct(stats.hitRate)), `${fmt.int(stats.correct)} von ${n1(stats.n, 'Trade', 'Trades')}`)}${kpi('Letzte 20 Trades', big(pct(stats.recent)), trend)}${kpi('Runden gespielt', big(fmt.int(stats.timeline.length)), 'je bis zu 10 Trades')}${learn}</div>` : '';
    const hero = `<section class="card replay-hero"><div class="rh-top"><div class="rh-text"><div class="card-title">Trainiere dein Bauchgefühl</div>
      <div class="rh-sub">Du siehst einen alten Trade ohne Ergebnis und entscheidest: nehmen oder skippen. Richtig ist, Gewinner zu nehmen und Verlierer zu skippen.</div></div>${start}</div>
      ${steps}<div class="rh-avail">${avail}</div>${kpis}</section>`;
    if (!has) return `<div class="stack replay">${hero}</div>`;
    /* Setup */
    const setups = stats.bySetup.map(s => U.barRow(s.setup, s.hitRate || 0, 1, `${pct(s.hitRate)} · ${s.correct} von ${s.n}`)).join('');
    /* bestes Setup (ab drei Trades); bei Gleichstand alle besten nennen */
    const enough = stats.bySetup.filter(s => s.n >= 3); const top = enough.length ? Math.max(...enough.map(s => s.hitRate || 0)) : null;
    const best = top == null ? [] : enough.filter(s => Math.abs((s.hitRate || 0) - top) < 1e-9).map(s => `<b>${esc(s.setup)}</b>`);
    const setupNote = !best.length ? 'Ab drei Trades je Setup siehst du hier, wo du am besten liegst.' : best.length === enough.length && best.length > 1 ? 'Bei allen Setups liegst du gleich oft richtig.' : `Am besten liest du ${best.length > 1 ? `${best.slice(0, -1).join(', ')} und ${best[best.length - 1]}` : best[0]}.`;
    /* Gefühl: Sicherheit in Worten, dazu ein Satz, ob das Gefühl stimmt */
    const conf = stats.byConfidence.map(c => U.barRow(CONF_WORD[c.confidence], c.hitRate || 0, 1, c.n ? `${pct(c.hitRate)} · ${n1(c.n, 'Trade', 'Trades')}` : '—')).join('');
    const lo = stats.byConfidence.find(c => c.confidence === 1), hi = stats.byConfidence.find(c => c.confidence === 3);
    const feel = !lo || !hi || lo.n < 3 || hi.n < 3 ? 'Ab je drei Trades mit „Unsicher“ und „Sicher“ siehst du hier, ob dein Gefühl stimmt.'
      : hi.hitRate - lo.hitRate >= 0.1 ? '<span class="pos">Dein Gefühl passt:</span> Wenn du dir sicher bist, liegst du öfter richtig.'
      : lo.hitRate - hi.hitRate >= 0.1 ? '<span class="neg">Achtung:</span> Wenn du dir sicher bist, liegst du seltener richtig.'
      : 'Ob du dir sicher bist oder nicht, macht bei dir kaum einen Unterschied.';
    /* Verlauf */
    /* Verlauf als Säulen: eine je Runde (höchstens die letzten 12), Wert darüber; grün, wenn mehr als die Hälfte richtig war */
    const tl = stats.timeline; const shown = tl.slice(-12); const off = tl.length - shown.length;
    const tlNote = tl.length >= 2 ? `Runde 1: <b>${pct(tl[0].hitRate)}</b> → Runde ${tl.length}: <b>${pct(tl[tl.length - 1].hitRate)}</b>` : '';
    const timeline = tl.length >= 2 ? `<div class="replay-rounds">${shown.map((x, i) => `<div class="rr-col${(x.hitRate || 0) > 0.5 ? ' good' : (x.hitRate || 0) < 0.5 ? ' bad' : ''}"><span class="rr-v">${pct(x.hitRate)}</span><div class="rr-bar"><i style="height:${Math.max(2, Math.round((x.hitRate || 0) * 100))}%"></i></div><span class="rr-l">${shown.length <= 6 ? 'Runde ' : ''}${off + i + 1}</span></div>`).join('')}</div>` : `<span class="small muted">Ab zwei Runden siehst du hier, ob du besser wirst.</span>`;
    const note = html => `<p class="replay-note">${html}</p>`;
    return `<div class="stack replay">${hero}<div class="grid two">${U.card('Bei welchem Setup liegst du richtig?', `${note(setupNote)}<div class="replay-bars">${setups}</div>`)}${U.card('Passt dein Gefühl?', `${note(feel)}<div class="replay-bars">${conf}</div>`, { info: 'Wie oft du richtig lagst, je nachdem wie sicher du dir vor der Entscheidung warst.' })}</div>${U.card('Wirst du besser?', `${tlNote ? note(tlNote) : ''}${timeline}`, { info: 'Anteil richtig je Runde, älteste links. Grün: mehr als die Hälfte richtig.' })}</div>`;
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
