/* Prop Firms, Phase 3: Konto-Friedhof (#/prop/friedhof) und Challenge vs. Funded (#/prop/vergleich).
   Rechenkern: js/propsim.js (graveyard, compare). Registriert beide Tabs über root.PropScreen.register; alle Beträge laufen über fmt.cur / U.pnl (Geld-blind-Modus).
   Es wird nichts erfunden: fehlende Werte stehen als „—“. Datum und Uhrzeit des Breachs stehen in der Zeitzone des Kontos (dort gilt die Regel),
   das Startdatum als lokaler Tag wie im Konten-Tab. Geplatzte Konten ohne Breach-Datensatz, aber mit breachedAt, bekommen einen synthetischen Eintrag (Datum ohne Regel/Trade). */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, PS = root.PropScreen, Sim = root.PropSim;
  if (!PS || !Sim) return;
  const PD = root.PropData || null;
  const { nameOf, PHASES, num } = PS;
  const RULE_LABEL = { dailyLoss: 'Daily Loss', drawdown: 'Max. Drawdown', consistency: 'Consistency', maxContracts: 'Max. Kontrakte/Lots', manual: 'Manuell markiert' };
  const WEEKDAY_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const MIN_TRADES = 5, THRESHOLD = 20;
  const DASH = '<span class="faint">—</span>';
  const call = (name, ...args) => typeof S[name] === 'function' ? (S[name](...args) || []) : [];
  const ruleLabel = r => r == null || r === '' ? DASH : esc(RULE_LABEL[r] || String(r));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const top = vals => { const m = new Map(); for (const v of vals) if (v != null && v !== '') m.set(v, (m.get(v) || 0) + 1); let best = null; for (const [k, c] of m) if (!best || c > best.c) best = { k, c }; return best; };
  /* Uhrzeit in der Zeitzone des Kontos (dort gilt die Regel), sonst lokal */
  function timeIn(at, tz) {
    if (!at) return '—'; const d = new Date(at); if (isNaN(d)) return '—';
    if (tz) { try { return new Intl.DateTimeFormat('de-DE', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(d); } catch (e) { /* ungültige Zeitzone → lokal */ } }
    return fmt.time(d);
  }
  /* Datum in der Zeitzone des Kontos, damit Wochentag, Datum und Uhrzeit zusammenpassen; sonst lokal */
  function dateIn(at, tz) {
    if (!at) return '—'; const d = new Date(at); if (isNaN(d)) return '—';
    if (tz) { try { return new Intl.DateTimeFormat('de-DE', { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' }).format(d); } catch (e) { /* ungültige Zeitzone → lokal */ } }
    return fmt.dateFull(d);
  }
  const marketLabel = m => esc(PD && Array.isArray(PD.MARKETS) ? nameOf(PD.MARKETS, m, 'Futures') : (m === 'forex' ? 'Forex / CFD' : 'Futures'));
  const tradesById = () => new Map(C.deriveAll(call('trades')).map(t => [t.id, t]));
  const kv = (k, v) => `<div class="kv"><span>${esc(k)}</span><b>${v}</b></div>`;

  /* ---------- Friedhof ---------- */
  /* Breach-Datensätze plus synthetische Einträge für geplatzte Konten ohne Datensatz, aber mit breachedAt (Status-Aktion/Konten-Dialog legen keinen an):
     so erscheinen Lebensdauer und Datum trotzdem; Regel und Trade bleiben „—“. */
  function breachesOf(accs) {
    const list = call('propBreaches').filter(Boolean); const has = new Set(list.map(b => String(b.accountId)));
    for (const a of accs) if (a && a.status === 'breached' && a.breachedAt && !has.has(String(a.id)) && !isNaN(new Date(a.breachedAt))) list.push({ accountId: a.id, at: a.breachedAt, rule: null, tradeId: null, synthetic: true });
    return list;
  }
  /* Einzige Stelle, die den Friedhof berechnet (tabFriedhof nutzt sie): { g, byId, accs } */
  function graveyard() {
    const accs = PS.accounts(); const byId = tradesById();
    const g = Sim.graveyard(accs, breachesOf(accs), byId, { tradesOf: a => call('tradesForPropAccount', a.id) });
    return { g, byId, accs };
  }
  function tiles(g) {
    const ids = new Set(g.tombstones.map(t => String(t.accountId)));
    const fees = call('propExpenses').filter(e => e && e.accountId != null && ids.has(String(e.accountId)));
    const feeSum = C.sum(fees.map(e => num(e.amount, 0)));
    const lifes = g.tombstones.map(t => t.lifetimeDays).filter(v => v != null);
    const avgLife = lifes.length ? C.mean(lifes) : null;
    const rule = top(g.tombstones.map(t => t.cause.rule));
    const firms = new Set(g.tombstones.map(t => t.firm)).size;
    return `<div class="grid tiles prop-tiles kstrip prop-grave-tiles">${U.tile('Geplatzte Konten', `${g.n}`, { foot: `bei ${plural(firms, 'Firma', 'Firmen')}`, tint: 'neg' })}${U.tile('Verlorene Gebühren', fees.length ? fmt.cur(feeSum) : '—', { foot: fees.length ? `${plural(fees.length, 'Ausgabe', 'Ausgaben')} der geplatzten Konten` : 'Keine Ausgabe einem geplatzten Konto zugeordnet. In der Bilanz lässt sich jede Ausgabe einem Konto zuweisen.', tint: fees.length ? 'neg' : '', info: 'Summe der Ausgaben (Challenge-Gebühr, Reset, Aktivierung …), die einem geplatzten Konto zugeordnet sind.' })}${U.tile('Ø Lebensdauer', avgLife == null ? '—' : `${fmt.num(avgLife, 0)} Tage`, { foot: !lifes.length ? 'Kein Konto mit Start- und Breach-Datum' : lifes.length < g.n ? `${lifes.length} von ${g.n} mit Start- und Breach-Datum` : 'vom Start bis zum Breach' })}${U.tile('Häufigste Regel', rule ? ruleLabel(rule.k) : '—', { foot: rule ? `${rule.c} von ${g.n} Breaches` : 'Keine Regel hinterlegt' })}</div>`;
  }
  function patternsCard(g) {
    const body = g.patterns.length
      ? `<ul class="prop-patterns">${g.patterns.map(s => `<li>${esc(s)}</li>`).join('')}</ul>`
      : `<p class="muted small prop-patterns-empty">${g.n < 2 ? 'Ab zwei Grabsteinen erscheinen hier Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.' : 'Kein wiederkehrendes Muster: Uhrzeit, Symbol, Setup und Emotionen der Breaches unterscheiden sich.'}</p>`;
    return U.card('Muster', body, { info: 'Ein Satz je Dimension, wenn mindestens zwei und mindestens die Hälfte aller Breaches betroffen sind.', sub: g.n ? `über ${plural(g.n, 'Grabstein', 'Grabsteine')}` : '' });
  }
  /* Grabstein: gewölbter Stein mit eingemeißeltem Rahmen und Riss (das Konto ist geplatzt), oben Name und Lebensdaten (* Start, † Breach),
     in der Mitte die Todesursache und die Notiz als Grabinschrift, unten eine Tafel mit den Fakten; der Stein steht auf einem Sockel mit Grablicht */
  const CRACK = '<svg class="pg-crack" viewBox="0 0 36 64" aria-hidden="true"><path d="M27 0 22 11l5 7-9 12 4 8-8 13 2 13"/><path d="M22 11l-7 3M18 30l-6-2"/></svg>';
  function grave(t, byId, accs) {
    const acc = accs.find(a => a.id === t.accountId) || null; const tz = acc ? acc.tz : null;
    const trade = t.cause.tradeId != null ? byId.get(t.cause.tradeId) || null : null;
    const c = t.cause;
    const when = c.at ? `${c.weekdayIndex != null ? WEEKDAY_LONG[c.weekdayIndex] : (c.weekday || '—')}, ${dateIn(c.at, tz)} · ${timeIn(c.at, tz)} Uhr` : null;
    const tradeHtml = trade
      ? `<div class="prop-grave-trade"><span><span class="sym">${esc(trade.symbol || '—')}</span>${trade.setup ? `<span class="muted small"> · ${esc(trade.setup)}</span>` : ''}</span>${when ? `<span class="muted small">${esc(when)}</span>` : ''}<span>${c.pnl == null ? DASH : U.pnl(c.pnl, '', { r: trade.r })}</span></div>`
      : when ? `<div class="prop-grave-trade"><span class="muted small">kein Trade hinterlegt</span><span class="muted small">${esc(when)}</span></div>` : DASH;
    const chips = [...t.emotions.map(e => U.chip(e, 'emotion')), ...t.mistakes.map(m => U.chip(m, 'mistake'))];
    const streak = t.lossStreakBefore > 0 ? `<span class="${t.lossStreakBefore >= 2 ? 'neg' : ''}">${plural(t.lossStreakBefore, 'Verlusttrade', 'Verlusttrades')} in Folge</span>` : '<span class="muted">keine</span>';
    const link = c.tradeId != null && trade ? `<div class="prop-grave-foot"><a class="btn xs ghost" data-stop href="#/trades/${esc(String(c.tradeId))}">${I.external} Trade öffnen</a></div>` : '';
    const born = t.startedAt ? fmt.dateFull(t.startedAt) : null, died = c.at ? dateIn(c.at, tz) : null;
    const dates = born || died ? `<span class="pg-dates"><span>* ${born || '—'}</span><span>† ${died || '—'}</span></span>` : '';
    const life = t.lifetimeDays == null ? `<span class="muted">Lebensdauer unbekannt (${t.startedAt ? 'kein Breach-Datum' : 'kein Startdatum'})</span>` : `<span class="pg-age">gelebt <b>${plural(t.lifetimeDays, 'Tag', 'Tage')}</b></span>`;
    /* zwei Seiten: vorne nur das Wesentliche (Name, Konto, Phase, Daten, Todesursache), per Klick dreht sich der Stein und zeigt
       hinten kompakt den Rest (Inschrift, Ergebnis, auslösender Trade, Verlustserie, Tags, Link) */
    return `<section class="prop-grave" data-id="${esc(String(t.accountId))}">
      <div class="pg-stone" data-action="pg-flip" title="Umdrehen">
        <div class="pg-inner">
          <div class="pg-face pg-front" aria-hidden="false">${CRACK}
            <span class="pg-rip" aria-hidden="true">R · I · P</span>
            <div class="prop-grave-head"><b>${esc(t.firm)}${t.name ? ` ${esc(t.name)}` : ''}</b><div class="muted small">${t.size > 0 ? fmt.balance(t.size) : '—'}${t.market ? ` · ${marketLabel(t.market)}` : ''}</div><div class="pills">${U.pill(esc(nameOf(PHASES, t.phase)), 'neutral')}</div></div>
            <div class="prop-grave-life">${dates}${life}</div>
            <span class="pg-orn" aria-hidden="true"></span>
            <div class="pg-cause"><span>Todesursache</span><b>${ruleLabel(c.rule)}</b></div>
            <button type="button" class="pg-turn" data-action="pg-flip" aria-label="Umdrehen: Einzelheiten zeigen">${I.replay}<span>Umdrehen</span></button>
          </div>
          <div class="pg-face pg-back" aria-hidden="true">
            <span class="pg-rip" aria-hidden="true">${esc(t.firm)}${t.name ? ` ${esc(t.name)}` : ''}</span>
            ${t.note ? `<p class="pg-epitaph prop-grave-note">„${esc(t.note)}“</p>` : ''}
            <div class="prop-grave-kv">${kv('Ergebnis', t.result == null ? DASH : U.pnl(t.result))}${kv('Auslösender Trade', tradeHtml)}${kv('Verlustserie davor', streak)}${chips.length ? `<div class="pg-chips chips">${chips.join('')}</div>` : ''}</div>
            ${link}
            <button type="button" class="pg-turn" data-action="pg-flip" aria-label="Zurückdrehen">${I.replay}<span>Zurück</span></button>
          </div>
        </div>
      </div>
      <div class="pg-base" aria-hidden="true"><span class="pg-light"></span></div>
    </section>`;
  }
  Object.assign(App.actions, {
    'pg-flip'(el, e) {
      const t = e && e.target; if (t && t.closest('a, .btn') && !t.closest('.pg-turn')) return; /* Trade öffnen & Co. drehen nicht */
      const stone = el.closest('.pg-stone'); if (!stone) return; const on = stone.classList.toggle('flipped');
      stone.querySelector('.pg-front').setAttribute('aria-hidden', String(on)); stone.querySelector('.pg-back').setAttribute('aria-hidden', String(!on));
    },
  });
  function tabFriedhof() {
    const { g, byId, accs } = graveyard();
    if (!g.n) return U.empty('shield', 'Noch kein Konto auf dem Friedhof', 'Gut so. Konten, die du im Cockpit über „Als geplatzt markieren“ beendest, landen hier als Grabstein, mit Ursache, auslösendem Trade und den Mustern dahinter.');
    return `${tiles(g)}${patternsCard(g)}<div class="grid prop-graves">${g.tombstones.map(t => grave(t, byId, accs)).join('')}</div>`;
  }

  /* ---------- Challenge vs. Funded ---------- */
  const GOOD_UP = new Set(['winRate', 'avgR', 'pf']), GOOD_DOWN = new Set(['maxDD']);
  function value(unit, v) {
    if (v == null || (typeof v === 'number' && isNaN(v))) return DASH;
    switch (unit) { case 'pct': return fmt.pct(v, 1); case 'r': return U.rText(v); case 'cur': return fmt.cur(v); case 'dur': return fmt.dur(v); default: return fmt.num(v, 2); }
  }
  function diffCls(r) {
    if (r.diffPct == null || Math.abs(r.diffPct) < 0.5) return 'neu';
    if (GOOD_UP.has(r.key)) return r.diffPct > 0 ? 'pos' : 'neg';
    if (GOOD_DOWN.has(r.key)) return r.diffPct < 0 ? 'pos' : 'neg';
    return 'neu';
  }
  /* Unterschied in %: unter 0,5 % neutral „0 %“ statt „+0 %“/„−0 %“ (Vorzeichen ohne Betrag) */
  const diffText = r => r.diffPct == null ? DASH : Math.abs(r.diffPct) < 0.5 ? fmt.pct(0) : fmt.pct(r.diffPct / 100, 0, true);
  /* Trades je Phase über alle Konten, dedupliziert nach id (ein Trade kann mehreren Konten zugeordnet sein, Copy-Trading) */
  function collect(phases) {
    const m = new Map();
    /* Phase zum Schlusszeitpunkt des Trades (Store.propPhaseAt mit Phasenverlauf), sonst aktuelle Phase */
    const phaseOf = (a, t) => typeof S.propPhaseAt === 'function' ? S.propPhaseAt(a, t.close || t.open) : a.phase;
    for (const a of PS.accounts()) for (const t of call('tradesForPropAccount', a.id)) if (t && !m.has(t.id) && phases.includes(phaseOf(a, t))) m.set(t.id, t);
    return [...m.values()];
  }
  function tabVergleich() {
    const ch = collect(['challenge1', 'challenge2']), fu = collect(['funded']);
    const cmp = Sim.compare(ch, fu, { threshold: THRESHOLD });
    const sample = `<div class="prop-cmp-sample"><span><b>${cmp.n.challenge}</b> Trades in Challenges, <b>${cmp.n.funded}</b> Trades funded${U.info('Geschlossene Trades der Konten nach der Phase, in der sie geschlossen wurden (Phasenwechsel werden mit Datum gespeichert). Unterschied = Funded gegenüber Challenge; Grün und Rot nur bei Kennzahlen mit klarer Richtung (Trefferquote, Ø R, Profit Factor, Max. Drawdown).')}</span></div>`;
    if (cmp.n.challenge < MIN_TRADES || cmp.n.funded < MIN_TRADES) {
      const missing = [cmp.n.challenge < MIN_TRADES ? `auf der Challenge-Seite (${cmp.n.challenge} von ${MIN_TRADES})` : '', cmp.n.funded < MIN_TRADES ? `auf der Funded-Seite (${cmp.n.funded} von ${MIN_TRADES})` : ''].filter(Boolean);
      return sample + U.empty('stats', 'Noch zu wenig Daten für den Vergleich', `Jede Seite braucht mindestens ${MIN_TRADES} geschlossene Trades. Es fehlen Trades ${missing.join(' und ')}. Ordne Trades im Cockpit über „Trades zuordnen“ einem Konto in der passenden Phase zu.`);
    }
    const rows = cmp.rows.map(r => `<tr class="${r.highlight ? 'hl' : ''}" data-key="${esc(r.key)}"><td>${esc(r.label)}${r.highlight ? ' <span class="hl-dot" data-tip="Auffällig" aria-label="auffällig"></span>' : ''}</td><td class="r">${value(r.unit, r.challenge)}</td><td class="r">${value(r.unit, r.funded)}</td><td class="r ${diffCls(r)}">${diffText(r)}</td></tr>`).join('');
    const table = `<div class="tbl-wrap"><table class="tbl prop-cmp"><thead><tr><th>Kennzahl</th><th class="r">Challenge</th><th class="r">Funded</th><th class="r"><span class="long">Unterschied</span><span class="short" title="Unterschied">Diff.</span></th></tr></thead><tbody>${rows}</tbody></table></div>`;
    const hl = cmp.highlights.length ? `<ul class="prop-highlights">${cmp.highlights.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : `<p class="muted small prop-highlights-empty">Keine großen Unterschiede: alle Kennzahlen liegen unter ${THRESHOLD} % Abweichung. Du handelst funded so wie in der Challenge.</p>`;
    return `${sample}${table}${U.card('Auffällig', hl, { info: `Hervorgehoben ab ${THRESHOLD} % Unterschied zwischen Challenge und Funded, nach Größe sortiert.` })}`;
  }

  PS.register('friedhof', 'Friedhof', tabFriedhof);
  PS.register('vergleich', 'Challenge vs. Funded', tabVergleich);
  root.PropFriedhof = { tabFriedhof, tabVergleich, collect, graveyard, breachesOf, dateIn, timeIn, diffText, RULE_LABEL, MIN_TRADES, THRESHOLD };
})(window);
