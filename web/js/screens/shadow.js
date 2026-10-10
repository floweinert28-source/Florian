/* Schatten-Ich: Wie sähe das Konto aus, wenn du deine eigenen Regeln zu 100 % eingehalten hättest? Regelwerk, Kosten im Zeitraum, Verstöße, Ranking (Rechnung: js/shadow.js).
   Zeitraum = der gemeinsame Zeitraum oben in der Kopfreihe (wie auf allen Seiten); gerechnet wird über alle Trades, damit Serien und Pausen über die Grenze hinweg stimmen */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, Sh = root.Shadow;
  const LABEL = {}; for (const r of Sh.RULES) LABEL[r.key] = r.label;
  const st = () => App.state.shadow || (App.state.shadow = {});

  /* ---------- Regeln lesen/schreiben ---------- */
  /* Immer ein frisches, vollständiges Objekt: gespeicherte Regeln über die Defaults gelegt, fehlende Felder ergänzt */
  function rules() { const src = (typeof S.shadowRules === 'function' && S.shadowRules()) || {}; const d = Sh.defaultRules(); for (const k of Object.keys(d)) if (src[k] && typeof src[k] === 'object') Object.assign(d[k], src[k]); return d; }
  function saveRules(r) { if (typeof S.setShadowRules === 'function') S.setShadowRules(r); else { S.data.shadowRules = r; S.save(); } App.rerender(); }
  const evaluate = all => Sh.evaluate(all, rules(), { account: App.account(), rUnit: App.rUnit(all) });

  /* ---------- Zeitraum (nach Schlusszeitpunkt, wie in der Engine) ---------- */
  /* Alles, was die Seite für den gewählten Zeitraum braucht: Summen, Verstöße (nach Datum absteigend), Ranking, Kurve neu ab 0 */
  function periodData(res, all, range) {
    const sel = d => !range.from || (d >= range.from && d <= range.to); const byId = new Map(all.map(t => [t.id, t])); const rowById = new Map(res.trades.map(r => [r.id, r]));
    const violations = res.violations.filter(v => { const t = byId.get(v.tradeId); return sel(t && t.close ? t.close : new Date(v.date)); }).sort((a, b) => new Date(b.date) - new Date(a.date));
    const ranking = res.ranking.map(x => { const v = violations.filter(y => y.rule === x.rule); return { rule: x.rule, label: x.label, n: v.length, cost: C.sum(v.map(y => y.cost)) }; }).sort((a, b) => b.cost - a.cost || b.n - a.n);
    let real = 0, shadow = 0, n = 0; const curve = res.curve.filter(p => sel(p.date)).map(p => { const r = rowById.get(p.id) || { realPnl: 0, shadowPnl: 0 }; real += r.realPnl; shadow += r.shadowPnl; n++; return { date: p.date, real, shadow }; });
    return { sums: { real, shadow, cost: shadow - real, n }, violations, ranking, curve, label: range.label };
  }
  /* Kosten-Darstellung: Betrag ohne Vorzeichen, Farbe und Text sagen, in welche Richtung */
  function costView(cost) { if (cost > C.EPS) return { cls: 'neg', text: fmt.cur(cost), foot: 'Regelbrüche haben dich das gekostet' }; if (cost < -C.EPS) return { cls: 'pos', text: fmt.cur(-cost), foot: 'Regelbrüche haben dir das gebracht' }; return { cls: 'neu', text: fmt.cur(0), foot: 'Alles nach Regeln' }; }
  const curSym = () => fmt.cur(0, { money: true }).replace(/[\d.,\s ]/g, '');

  /* ---------- Regelwerk ---------- */
  /* Eine Regel = eine ruhige Kachel: Name und kurze Erklärung links, Schalter rechts; Werte erscheinen erst, wenn die Regel an ist,
     als kompakte Felder mit Einheit im Feld (3 Trades, 2 R, 08:00 – 17:00) */
  /* kurze Erklärung je Regel, damit man ohne Info-Symbol versteht, was sie tut */
  const DESC = { maxTrades: 'Höchstens so viele Trades an einem Tag.', dailyLoss: 'Ist das Tageslimit erreicht, ist für heute Schluss.', lossStreak: 'Nach so vielen Verlusten hintereinander ist Pause.', maxRisk: 'Kein Trade mit mehr Risiko als festgelegt.', hours: 'Nur innerhalb dieser Uhrzeiten handeln.', setups: 'Nur Setups aus deiner Auswahl sind erlaubt.', cooldown: 'Nach einem Verlust erst eine Pause einlegen.' };
  function ruleRow(def, r, setups) {
    const on = !!r.on;
    const common = f => `data-change="shadow-rule-field" data-rule="${def.key}" data-field="${f.key}" aria-label="${esc(def.label + ': ' + f.label)}"`;
    const field = f => {
      if (f.type === 'unit') return `<select class="select sr-unit" ${common(f)}>${[['r', 'R-Einheit'], ['pct', '% vom Konto'], ['money', fmt.moneyBlind() ? 'Betrag' : `Betrag (${curSym()})`]].map(([k, l]) => `<option value="${k}" ${r.unit === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      if (f.type === 'time') return `<input class="input sr-time" type="time" value="${esc(r[f.key])}" ${common(f)}>`;
      const suffix = def.fields.length === 1 ? f.label : '';
      /* eigene, ruhige Pfeile statt der Browser-Pfeile: ganze Zahlen in 1er-Schritten, R und % in 0,5er, Beträge in 10er */
      const step = f.type === 'int' ? 1 : r.unit === 'money' ? 10 : 0.5;
      return `<label class="sr-num" data-step="${step}"><input class="input" type="number" inputmode="decimal" min="0" step="${f.type === 'int' ? '1' : 'any'}" value="${esc(r[f.key])}" ${common(f)}>${suffix ? `<span class="sr-suf">${esc(suffix)}</span>` : ''}<span class="sr-step"><button type="button" data-action="sr-step" data-dir="1" tabindex="-1" aria-label="Mehr">${I.chev}</button><button type="button" data-action="sr-step" data-dir="-1" tabindex="-1" aria-label="Weniger">${I.chev}</button></span></label>`;
    };
    const plain = def.fields.filter(f => f.type !== 'setups');
    const ctrl = !plain.length ? '' : def.key === 'hours' ? `${field(plain[0])}<span class="sr-dash">–</span>${field(plain[1])}` : plain.map(field).join('');
    let extra = '';
    if (def.fields.some(f => f.type === 'setups')) {
      const list = Array.isArray(r.list) ? r.list : []; const all = [...new Set([...(setups || []), ...list])];
      extra = !all.length ? `<div class="small muted shadow-hint">Noch keine Setups angelegt. Lege sie unter <a href="#/settings/inhalte">Einstellungen → Inhalte</a> an oder vergib sie beim Loggen.</div>`
        : `<div class="chips shadow-chips">${all.map(x => `<button type="button" class="chip sel" aria-pressed="${list.includes(x)}" data-action="shadow-setup-toggle" data-value="${esc(x)}">${esc(x)}</button>`).join('')}</div>${!list.length ? `<div class="small warn shadow-hint">Kein Setup gewählt – so zählt jeder Trade als Verstoß.</div>` : ''}`;
    }
    return `<div class="shadow-rule ${on ? 'on' : ''}"><div class="sr-main"><div class="sr-txt"><span class="sr-label">${esc(def.label)}</span>${DESC[def.key] ? `<span class="sr-desc">${esc(DESC[def.key])}</span>` : ''}</div><button type="button" class="switch" role="switch" aria-checked="${on}" data-action="shadow-rule-toggle" data-rule="${def.key}" aria-label="${esc(def.label)}"></button></div>${on && ctrl ? `<div class="sr-ctrl">${ctrl}</div>` : ''}${on && extra ? `<div class="sr-extra">${extra}</div>` : ''}</div>`;
  }
  function rulesCard(res, r) {
    const setups = (S.data.tags && S.data.tags.setups) || [];
    const notes = res.warnings.map(w => U.banner('warn', '', esc(w)));
    /* Hinweis ohne aktive Regel steht unter den Schaltern: beim ersten Einschalten verschwindet er, ohne dass sich darüber etwas verschiebt */
    if (!res.active) notes.push(U.banner('info', 'Noch keine Regel aktiv', 'Schalte oben mindestens eine Regel ein – dann rechnet dein Schatten-Ich, was Regelbrüche kosten.', { icon: 'sparkle', trailing: `<button type="button" class="btn sm" data-action="shadow-preset">${I.bolt} Vorschlag übernehmen</button>` }));
    if (res.unknownRisk) notes.push(U.banner('info', '', `${res.unknownRisk === 1 ? '1 Trade ohne Stop konnte' : `${res.unknownRisk} Trades ohne Stop konnten`} bei der Risiko-Regel nicht geprüft werden.`));
    return U.card('Mein Regelwerk', `<div class="shadow-rules">${Sh.RULES.map(def => ruleRow(def, r[def.key], setups)).join('')}</div>${notes.length ? `<div class="stack shadow-notes">${notes.join('')}</div>` : ''}`, { info: 'Schalte ein, was für dich gilt. Dein Schatten-Ich hält sich daran – Änderungen gelten sofort.' });
  }

  /* ---------- Verstöße und Ranking ---------- */
  /* Seitenweise wie im TradeLog: 10 je Seite vorgewählt, Seite/Größe bleiben in der Sitzung */
  const pageState = () => { const s = st(); return s.page || (s.page = { size: 10, page: 1 }); };
  function violationsTable(list) {
    if (!list.length) return U.empty('shield', 'Keine Verstöße', 'In diesem Zeitraum hast du dich an deine Regeln gehalten.');
    /* Nur bei der Risiko-Regel bleibt der Trade (verkleinert) im Schatten-Konto; sonst fällt er weg und sein Schatten-Ergebnis ist 0 */
    const row = v => { const taken = v.rule === 'maxRisk'; const costR = v.r == null ? {} : { r: taken ? v.r * (v.scale - 1) : -v.r }; return `<tr class="link" data-action="trade" data-id="${esc(v.tradeId)}"><td>${fmt.dateTime(v.date)}</td><td class="sym">${esc(v.symbol)}</td><td>${esc(v.label)}${v.others.length ? ` <span class="muted small" data-tip="${esc(v.others.map(k => LABEL[k] || k).join(', '))}">+ ${v.others.length} weitere</span>` : ''}</td><td class="r">${U.pnl(v.realPnl, '', { r: v.r })}</td><td class="r">${U.pnl(v.shadowPnl, '', { r: taken ? v.r : null })}</td><td class="r">${U.pnl(v.cost, '', costR)}</td></tr>`; };
    const pg = pageState(); const pages = Math.max(1, Math.ceil(list.length / pg.size)); if (pg.page > pages) pg.page = pages; if (pg.page < 1) pg.page = 1; const from = (pg.page - 1) * pg.size;
    const table = `<table class="tbl compact shadow-tbl"><thead><tr><th>Datum</th><th>Symbol</th><th>Regel</th><th class="r">Echt</th><th class="r">Schatten</th><th class="r">Kosten</th></tr></thead><tbody>${list.slice(from, from + pg.size).map(row).join('')}</tbody></table>`;
    if (list.length <= 10) return `<div class="tbl-wrap inset">${table}</div>`;
    const pager = `<div class="pager"><label class="pg-l"><span>Verstöße pro Seite:</span><select class="select sm" data-change="shadow-page-size" aria-label="Verstöße pro Seite">${[10, 25, 50, 100].map(n => `<option value="${n}" ${pg.size === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label><span class="pg-sep"></span><span class="pg-info">${from + 1} – ${Math.min(list.length, from + pg.size)} von ${list.length} Verstößen</span><span class="grow"></span><label class="pg-l"><select class="select sm" data-change="shadow-page" aria-label="Seite">${Array.from({ length: pages }, (_, i) => `<option value="${i + 1}" ${pg.page === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select><span>von ${pages} Seite${pages === 1 ? '' : 'n'}</span></label><span class="pg-nav"><button type="button" data-action="shadow-page-nav" data-dir="-1" ${pg.page <= 1 ? 'disabled' : ''} aria-label="Vorherige Seite">${I.chevL}</button><button type="button" data-action="shadow-page-nav" data-dir="1" ${pg.page >= pages ? 'disabled' : ''} aria-label="Nächste Seite">${I.chevR}</button></span></div>`;
    return `<div class="tbl-wrap inset paged"><div class="tbl-scroll">${table}</div>${pager}</div>`;
  }
  function rankingRows(ranking) {
    if (!ranking.length) return U.empty('shield', 'Keine Regel aktiv', '');
    const max = Math.max(0, ...ranking.map(x => Math.abs(x.cost)));
    return `<div class="shadow-rank">${ranking.map(x => U.barRow(x.label, x.cost, max, `${U.pnl(-x.cost)} <span class="muted">· ${x.n}×</span>`, x.cost > C.EPS ? 'var(--loss)' : x.cost < -C.EPS ? 'var(--profit)' : 'var(--surface-3)')).join('')}</div>`;
  }

  /* ---------- Aktionen ---------- */
  Object.assign(App.actions, {
    /* Pfeile im Zahlenfeld: Wert um einen Schritt ändern (nie unter 0) und wie beim Tippen speichern */
    'sr-step'(el) {
      const box = el.closest('.sr-num'); const input = box && box.querySelector('input'); if (!input) return;
      const step = Number(box.dataset.step) || 1; const cur = Number(String(input.value).replace(',', '.')) || 0;
      input.value = String(Math.max(0, Math.round((cur + step * Number(el.dataset.dir)) * 100) / 100));
      App.actions['shadow-rule-field'](input);
    },
    'shadow-page-size'(el) { const pg = pageState(); pg.size = Number(el.value) || 10; pg.page = 1; App.rerender(); },
    'shadow-page'(el) { pageState().page = Number(el.value) || 1; App.rerender(); },
    'shadow-page-nav'(el) { const pg = pageState(); pg.page += Number(el.dataset.dir); App.rerender(); },
    'shadow-rule-toggle'(el) { const r = rules(); const k = el.dataset.rule; if (!r[k]) return; r[k].on = !r[k].on; saveRules(r); },
    'shadow-rule-field'(el) { const r = rules(); const k = el.dataset.rule, f = el.dataset.field; const def = Sh.RULES.find(x => x.key === k); const fd = def && def.fields.find(x => x.key === f); if (!fd || !r[k]) return; let v = el.value; if (fd.type === 'int' || fd.type === 'number') { v = String(v).trim() === '' ? '' : Number(String(v).replace(',', '.')); if (v !== '' && !isFinite(v)) return; if (fd.type === 'int' && v !== '') v = Math.floor(v); } r[k][f] = v; saveRules(r); },
    'shadow-setup-toggle'(el) { const r = rules(); const list = Array.isArray(r.setups.list) ? r.setups.list.slice() : []; const v = el.dataset.value; const i = list.indexOf(v); if (i >= 0) list.splice(i, 1); else list.push(v); r.setups.list = list; saveRules(r); },
    /* Einstieg: drei Regeln mit Standardwerten einschalten, die ohne R-Einheit oder Setups auskommen */
    'shadow-preset'() { const r = rules(); for (const k of ['maxTrades', 'lossStreak', 'cooldown']) r[k].on = true; saveRules(r); U.toast('Drei Regeln eingeschaltet', 'ok'); },
  });

  /* ---------- Seite ---------- */
  App.screens.shadow = {
    title: 'Schatten-Ich',
    head: { session: false, trade: false }, /* nur Zeitraum und Konto oben; „Trade loggen“ und „Session starten“ gibt es auf Dashboard und TradeLog */
    mount(main) { /* Enter in einem Zahlenfeld übernimmt den Wert sofort (change feuert erst beim Verlassen) */ main.querySelectorAll('.shadow-rule input').forEach(inp => inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } })); },
    render(ctx) {
      const s = st(); const all = ctx.all; const closed = C.closedOnly(all); const r = rules(); const res = evaluate(all); const range = App.range(); const pd = periodData(res, all, range);
      const head = `<div class="shadow-head"><div class="shadow-intro"><b>Dein Schatten-Ich handelt wie du – nur ohne Regelbrüche.</b><span class="small muted">Was die Abweichung kostet, siehst du hier.</span></div></div>`;
      if (!closed.length) return head + U.empty('stats', 'Noch keine abgeschlossenen Trades', 'Sobald Trades geschlossen sind, zeigt dir dein Schatten-Ich, was Regelbrüche kosten.', `<button type="button" class="btn sm" data-action="new-trade">${I.plus} Trade loggen</button>`) + rulesCard(res, r);
      const cv = res.active ? costView(pd.sums.cost) : null; const p = pd.sums;
      const tiles = `<div class="grid tiles shadow-tiles">
        <div class="tile shadow-main"><div class="head"><span>Disziplin-Kosten${U.info('Schatten-Ich minus echt: Was Regelbrüche im Zeitraum unterm Strich bewirkt haben.')}</span><span class="n">${esc(range.label)}</span></div><div class="body"><div><div class="val ${cv ? cv.cls : ''}">${cv ? cv.text : '—'}</div><div class="foot">${cv ? cv.foot : 'Keine Regel aktiv'}</div></div></div></div>
        ${U.tile('Echt', res.active ? U.pnl(p.real) : '—', { n: `${p.n} Trade${p.n === 1 ? '' : 's'}` })}
        ${U.tile('Schatten-Ich', res.active ? U.pnl(p.shadow) : '—', { foot: 'Mit allen Regeln eingehalten' })}
        ${U.tile('Verstöße', res.active ? String(pd.violations.length) : '—', { foot: res.active && p.n ? `${fmt.pct(pd.violations.length / p.n)} der Trades` : '' })}
      </div>`;
      U.chartData['shadow-curve'] = { points: pd.curve.map(pt => ({ date: pt.date, v: { real: pt.real, shadow: pt.shadow } })), series: [{ key: 'real', label: 'Echt', unit: 'cur', color: 'var(--text-2)' }, { key: 'shadow', label: 'Schatten-Ich', unit: 'cur', color: 'var(--accent)' }], periodLabel: d => fmt.dateTime(d) };
      const chart = U.card('Equity: echt vs. Schatten-Ich', `<div class="legend top"><span><i style="background:var(--text-2)"></i>Echt</span><span><i style="background:var(--accent)"></i>Schatten-Ich</span></div><div class="chart h300" data-chart="lines" data-id="shadow-curve"></div>`, { info: 'Kumuliert über die abgeschlossenen Trades im Zeitraum. Die Schatten-Linie lässt Trades mit Regelbruch weg und verkleinert zu große Risiken.' });

      const detail = res.active ? `<div class="grid shadow-detail start">${U.card('Regelverstöße', violationsTable(pd.violations), { sub: esc(pd.label), info: 'Die erste verletzte Regel zählt als Grund. Klick auf eine Zeile öffnet den Trade.' })}${U.card('Welche Regel kostet am meisten', rankingRows(pd.ranking), { sub: 'Netto-Effekt der Verstöße auf dein Konto' })}</div>` : '';
      return head + tiles + chart + rulesCard(res, r) + detail;
    },
  };
  /* Für die Dashboard-Widgets: dieselbe Rechnung wie auf der Seite (Regelwerk, Konto, R-Einheit) */
  root.ShadowScreen = { rules, evaluate, costView };
})(typeof self !== 'undefined' ? self : this);
