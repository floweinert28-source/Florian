/* Prop Firms: Konto-Friedhof (#/prop/friedhof).
   Rechenkern: js/propsim.js (graveyard). Registriert den Tab über root.PropScreen.register; alle Beträge laufen über fmt.cur / U.pnl (Geld-blind-Modus).
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
  /* Blumenstrauß am Sockel: drei Blüten (hell, gold, rot) mit grünen Stielen und Blättern, dazu zwei Grashalme */
  /* Stein als SVG mit echter Beleuchtung: die Form wird mit Rauschen verbogen (raue, leicht abgeschlagene Kanten), die geweichte
     Alpha-Kante plus feines Korn und gröbere Poren ergeben eine Höhenkarte, die von oben links beleuchtet wird; dazu Flecken,
     Körner und unten etwas Schmutz. Die Schrifttafel ist vertieft (Innenschatten oben links, Lichtkante unten rechts).
     Breite folgt der Karte: Kuppel und Tafelkopf sind verschachtelte SVGs (nur waagrecht gestreckt), die Rechtecke haben CSS-Breite
     und -Höhe per calc(); das Rauschen liegt im äußeren Koordinatensystem und wird nicht gestreckt. Unten wird der Stein dunkler
     (Verlauf in der Füllung, kein eigener Overlay, damit am Rand nichts übersteht). Gleiche ids in jeder Seite, gleicher Inhalt */
  const ROCK_TOP = 'M4 140V90A62 27 0 0 0 66 63A84 60 0 0 1 234 63A62 27 0 0 0 296 90V140Z';
  const PANEL_TOP = 'M21 165V97A49 21 0 0 0 70 76A80 56 0 0 1 230 76A49 21 0 0 0 279 97V165Z';
  const ROCK = `<svg class="pg-rock" aria-hidden="true" focusable="false"><defs>
    <filter id="pgs-rock" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="7" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.4" xChannelSelector="R" yChannelSelector="B" result="shape"/>
      <feGaussianBlur in="shape" stdDeviation="3.2" result="edge"/>
      <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3" result="grain"/>
      <feTurbulence type="fractalNoise" baseFrequency=".07" numOctaves="4" seed="11" result="pits"/>
      <feComposite in="edge" in2="grain" operator="arithmetic" k2=".72" k3=".2" result="h1"/>
      <feComposite in="h1" in2="pits" operator="arithmetic" k2="1" k3=".24" k4="-.18" result="height"/>
      <feDiffuseLighting in="height" surfaceScale="2.4" diffuseConstant="1.3" lighting-color="#fff" result="light"><feDistantLight azimuth="235" elevation="40"/></feDiffuseLighting>
      <feComposite in="shape" in2="light" operator="arithmetic" k1="1.12" result="lit"/>
      <feTurbulence type="fractalNoise" baseFrequency=".012 .045" numOctaves="3" seed="19" result="stain"/>
      <feColorMatrix in="stain" type="matrix" values=".55 0 0 0 .66  .55 0 0 0 .66  .55 0 0 0 .64  0 0 0 0 1" result="stainG"/>
      <feComposite in="lit" in2="stainG" operator="arithmetic" k1="1" result="aged"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="1" seed="23" result="sp"/>
      <feComponentTransfer in="sp" result="specks"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 .35 .6"/></feComponentTransfer>
      <feFlood flood-color="#e8e4da" flood-opacity=".5"/><feComposite in2="specks" operator="in" result="flecks"/>
      <feMerge result="all"><feMergeNode in="aged"/><feMergeNode in="flecks"/></feMerge>
      <feComposite in="all" in2="shape" operator="in"/>
    </filter>
    <filter id="pgs-panel" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="7" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="2" xChannelSelector="R" yChannelSelector="B" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 -.2" result="grainA"/>
      <feComposite in="grainA" in2="shape" operator="in" result="grainIn"/>
      <feTurbulence type="fractalNoise" baseFrequency=".02 .06" numOctaves="3" seed="29" result="mot"/>
      <feColorMatrix in="mot" type="matrix" values=".4 0 0 0 .8  .4 0 0 0 .8  .4 0 0 0 .78  0 0 0 0 1" result="motG"/>
      <feComposite in="shape" in2="motG" operator="arithmetic" k1="1" result="toned"/>
      <feMerge result="tex"><feMergeNode in="toned"/><feMergeNode in="grainIn"/></feMerge>
      <feComponentTransfer in="shape" result="inv"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
      <feGaussianBlur in="inv" stdDeviation="3.2" result="invB"/>
      <feOffset in="invB" dx="1.6" dy="3.6" result="invO"/>
      <feFlood flood-color="#000" flood-opacity=".8"/><feComposite in2="invO" operator="in"/><feComposite in2="shape" operator="in" result="shadow"/>
      <feOffset in="inv" dx="-.9" dy="-1.4" result="invH"/><feGaussianBlur in="invH" stdDeviation=".7" result="invHB"/>
      <feFlood flood-color="#fff" flood-opacity=".16"/><feComposite in2="invHB" operator="in"/><feComposite in2="shape" operator="in" result="hl"/>
      <feMerge><feMergeNode in="tex"/><feMergeNode in="shadow"/><feMergeNode in="hl"/></feMerge>
    </filter>
    <linearGradient id="pgs-tone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="tn-a"/><stop offset=".5" class="tn-a"/><stop offset="1" class="tn-b"/></linearGradient>
  </defs><g class="rock" filter="url(#pgs-rock)"><svg class="rk-top" viewBox="0 0 300 140" preserveAspectRatio="none" width="100%" height="140"><path d="${ROCK_TOP}"/></svg><rect x="4" y="130" class="rk-body"/></g><g class="panel" filter="url(#pgs-panel)"><svg viewBox="0 0 300 165" preserveAspectRatio="none" width="100%" height="165"><path d="${PANEL_TOP}"/></svg><rect x="21" y="155" class="pn-body"/></g></svg>`;
  /* Sockel: zwei Steinplatten mit demselben Licht, weniger verbogen */
  const SLAB = `<svg class="pg-slab" viewBox="0 0 348 27" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs>
    <filter id="pgs-slab" x="-3%" y="-30%" width="106%" height="160%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="13" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.2" xChannelSelector="R" yChannelSelector="B" result="shape"/>
      <feGaussianBlur in="shape" stdDeviation="1.6" result="edge"/>
      <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="4" result="grain"/>
      <feComposite in="edge" in2="grain" operator="arithmetic" k2=".8" k3=".22" k4="-.08" result="height"/>
      <feDiffuseLighting in="height" surfaceScale="2" diffuseConstant="1.25" lighting-color="#fff" result="light"><feDistantLight azimuth="250" elevation="42"/></feDiffuseLighting>
      <feComposite in="shape" in2="light" operator="arithmetic" k1="1.08"/><feComposite in2="shape" operator="in"/>
    </filter></defs><g class="slab" filter="url(#pgs-slab)"><rect x="1" y="11" width="346" height="15"/><rect x="6" y="1" width="336" height="11.5"/></g></svg>`;
  /* Kerzenhaufen am Sockel: jede Kerze ist eine zusammenhängende Wachsform (Körper, geschmolzener Rand, Läufe an den Kanten,
     Pfütze) mit einem Verlauf vom leuchtenden Rand nach unten; ein Lichtfilter verbiegt die Form leicht und gibt ihr Rundung
     und Glanz. Läufe auf der Vorderseite liegen als eigene, ebenso beleuchtete Wachsbahnen darauf. Darüber flüssiges Wachs im
     Krater, Docht, weiche Flamme und Lichthof. Hinten die hohen, vorn die kurzen */
  const CANDLE_DEFS = '<defs><filter id="pgc-wax3d" x="-40%" y="-15%" width="180%" height="130%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".11" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="g"/><feGaussianBlur in="g" stdDeviation="2.4" result="b"/><feDiffuseLighting in="b" surfaceScale="1.5" diffuseConstant="1.08" lighting-color="#fff" result="d"><feDistantLight azimuth="250" elevation="58"/></feDiffuseLighting><feSpecularLighting in="b" surfaceScale="1.5" specularConstant=".28" specularExponent="9" lighting-color="#fff3dc" result="s"><feDistantLight azimuth="250" elevation="58"/></feSpecularLighting><feComposite in="g" in2="d" operator="arithmetic" k1="1.06" result="lit"/><feComposite in="s" in2="g" operator="in" result="si"/><feComposite in="lit" in2="si" operator="arithmetic" k2="1" k3=".5" result="o"/><feComposite in="o" in2="g" operator="in"/></filter><filter id="pgc-drip3d" x="-80%" y="-10%" width="260%" height="125%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".16" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale=".8" xChannelSelector="R" yChannelSelector="G" result="g"/><feGaussianBlur in="g" stdDeviation="1.1" result="b"/><feDiffuseLighting in="b" surfaceScale="1.4" diffuseConstant="1.12" lighting-color="#fff" result="d"><feDistantLight azimuth="250" elevation="58"/></feDiffuseLighting><feSpecularLighting in="b" surfaceScale="1.4" specularConstant=".5" specularExponent="14" lighting-color="#fff6e6" result="s"><feDistantLight azimuth="250" elevation="58"/></feSpecularLighting><feComposite in="g" in2="d" operator="arithmetic" k1="1.12" result="lit"/><feComposite in="s" in2="g" operator="in" result="si"/><feComposite in="lit" in2="si" operator="arithmetic" k2="1" k3=".7" result="o"/><feComposite in="o" in2="g" operator="in" result="drip"/><feGaussianBlur in="g" stdDeviation=".8" result="sb"/><feOffset in="sb" dx=".9" dy=".6" result="so"/><feFlood flood-color="#3a2510" flood-opacity=".38"/><feComposite in2="so" operator="in" result="shadow"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="drip"/></feMerge></filter><filter id="pgc-soft" x="-60%" y="-30%" width="220%" height="160%"><feGaussianBlur stdDeviation=".45"/></filter><linearGradient id="pgc-cyl" x1="0" x2="1"><stop offset="0" stop-color="#5a3a16" stop-opacity=".22"/><stop offset=".22" stop-color="#fff8ea" stop-opacity=".16"/><stop offset=".42" stop-color="#fff8ea" stop-opacity="0"/><stop offset=".7" stop-color="#5a3a16" stop-opacity=".1"/><stop offset="1" stop-color="#4a2d10" stop-opacity=".5"/></linearGradient><radialGradient id="pgc-pool"><stop offset="0" stop-color="#fff8dc"/><stop offset=".5" stop-color="#ffd98a"/><stop offset="1" stop-color="#d9a35a"/></radialGradient><radialGradient id="pgc-halo"><stop offset="0" stop-color="#ffc36e" stop-opacity=".55"/><stop offset=".4" stop-color="#ff9d42" stop-opacity=".16"/><stop offset="1" stop-color="#ff9d42" stop-opacity="0"/></radialGradient><linearGradient id="pgc-flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#fff3c4"/><stop offset=".55" stop-color="#ffc45c"/><stop offset=".85" stop-color="#ff8a24" stop-opacity=".85"/><stop offset="1" stop-color="#ff6a10" stop-opacity="0"/></linearGradient></defs>';
  const candle = ([x, h, w, d, drips], i, cid) => {
    const B = 78, t = B - h, cx = x + w / 2, ft = t - 15, n = v => Math.round(v * 10) / 10, m = i % 2 ? -1 : 1; /* m: welche Seite höher stehen bleibt */
    const gid = `pgc-${cid}${i}`;
    const grad = `<radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${n(cx)}" cy="${n(t - 1)}" r="${n(h * 1.1 + 6)}"><stop offset="0" stop-color="#fff3d4"/><stop offset=".07" stop-color="#ffd896"/><stop offset=".2" stop-color="#f2dbb0"/><stop offset=".5" stop-color="#e6cfa4"/><stop offset=".8" stop-color="#cdb185"/><stop offset="1" stop-color="#a5845a"/></radialGradient>`;
    const lipL = t + (m > 0 ? 5 : .4), lipR = t + (m > 0 ? .4 : 5);
    const isEdgeL = ([o]) => o < .5, isEdgeR = ([o, , dw]) => o + dw > w - .5;
    /* Ausbuchtung der Kante durch Kantenläufe: oben weich aus dem Rand heraus, eng anliegend, nach unten etwas dicker, unten ein runder Tropfen */
    const sm = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
    const bulge = (list, y0) => y => list.reduce((p, [, len, dw]) => { const e = y0 + len, br = dw * .62, bc = e - br * .25; if (y < y0 - .5 || y > bc + br) return p; const s = Math.min(1, Math.max(0, (y - y0) / len)); let q = dw * (.16 + .2 * s) * sm((y - y0 + .6) / 2.6); const dy = (y - bc) / br; if (Math.abs(dy) < 1) q = Math.max(q, dw * .42 * Math.sqrt(1 - dy * dy)); if (y > bc) q = Math.min(q, dw * .42 * Math.sqrt(Math.max(0, 1 - dy * dy))); return Math.max(p, q); }, 0);
    const bL = bulge(drips.filter(isEdgeL), lipL), bR = bulge(drips.filter(isEdgeR), lipR);
    const side = (y1, y2, f) => { const pts = []; const step = y2 > y1 ? .7 : -.7; for (let y = y1; step > 0 ? y < y2 : y > y2; y += step) pts.push(f(y)); pts.push(f(y2)); return pts.join('L'); };
    const body = `M${side(B, lipL + 1.4, y => `${n(x - bL(y))} ${n(y)}`)}Q${n(x - bL(lipL))} ${n(lipL - .2)} ${n(x + 1.3)} ${n(lipL - .9)}C${n(x + w * .16)} ${n(lipL - 2.1)} ${n(x + w * .3)} ${n(t + 4.4)} ${n(cx)} ${n(t + 4)}S${n(x + w * .84)} ${n(lipR - 2.1)} ${n(x + w - 1.3)} ${n(lipR - .9)}Q${n(x + w + bR(lipR))} ${n(lipR - .2)} ${n(x + w + bR(lipR + 1.4))} ${n(lipR + 1.4)}L${side(lipR + 1.4, B, y => `${n(x + w + bR(y))} ${n(y)}`)}Z`;
    /* Höhe des Vorderrands an einer Stelle (für den Beginn der Läufe): links lipL, Mitte t+4, rechts lipR, weich dazwischen */
    const rimY = px => { const u = (px - x) / w; return u <= .5 ? lipL + (t + 4 - lipL) * sm(u * 2) : t + 4 + (lipR - t - 4) * sm((u - .5) * 2); };
    const pool = `M${n(x - w * .45)} ${B + .4}c${n(w * .25)} -2.8 ${n(w * .65)} -3.4 ${n(w * .95)} -2.8s${n(w * .7)} -1 ${n(w * 1.1)} .1c${n(w * .3)} .8 ${n(w * .4)} 1.8 ${n(w * .3)} 2.7z`;
    const drip = ([o, len, dw]) => { const x0 = x + o, y0 = rimY(Math.min(x + w, Math.max(x, x0 + dw / 2))) + .3, e = y0 + len, br = dw * .58; return `<path d="M${n(x0 + dw * .2)} ${n(y0)}Q${n(x0 + dw * .5)} ${n(y0 - 1.1)} ${n(x0 + dw * .8)} ${n(y0)}C${n(x0 + dw * .82)} ${n(y0 + len * .35)} ${n(x0 + dw * .95)} ${n(y0 + len * .6)} ${n(x0 + dw * .9)} ${n(e - br * .2)}A${n(br)} ${n(br)} 0 1 1 ${n(x0 + dw * .1)} ${n(e - br * .2)}C${n(x0 + dw * .06)} ${n(y0 + len * .6)} ${n(x0 + dw * .2)} ${n(y0 + len * .35)} ${n(x0 + dw * .2)} ${n(y0)}Z"/>`; };
    const front = drips.filter(dr => !isEdgeL(dr) && !isEdgeR(dr));
    /* sichtbare Bahn des Kantenlaufs auf der Vorderseite: schmal, eng an der Kante */
    const hug = [...drips.filter(isEdgeL).map(([, len, dw]) => [-.15, len, dw * .62]), ...drips.filter(isEdgeR).map(([, len, dw]) => [w - dw * .62 + .15, len, dw * .62])];
    const runs = [...front, ...hug];
    const halo = `<circle class="halo" style="--d:${d}s" cx="${n(cx)}" cy="${n(ft + 9)}" r="${n(13 + w * .4)}"/>`;
    const wax = `<g class="candle"><g class="body" filter="url(#pgc-wax3d)" fill="url(#${gid})"><path d="${pool}"/><path d="${body}"/><path d="${body}" fill="url(#pgc-cyl)"/></g>${runs.length ? `<g class="runs" filter="url(#pgc-drip3d)"><g fill="url(#${gid})">${runs.map(drip).join('')}</g><g class="runs-hi">${runs.map(drip).join('')}</g></g>` : ''}<ellipse class="crater" cx="${n(cx)}" cy="${n(t + 4.2)}" rx="${n(w * .34)}" ry="1.6" fill="url(#pgc-pool)"/><path class="lip" d="M${n(cx - w * .32)} ${n(t + 4.6)}q${n(w * .32)} 1.6 ${n(w * .64)} 0"/><path class="wick" d="M${n(cx)} ${n(t + 3.8)}q${.6 * m} -2.4 ${-.4 * m} -4.4"/><g class="flame" style="--d:${d}s" filter="url(#pgc-soft)"><path class="fo" d="M${n(cx)} ${n(ft)}c2.1 4.6 3.2 8.3 3.2 10.9a3.2 3.2 0 0 1-6.4 0c0-2.6 1.1-6.3 3.2-10.9z" fill="url(#pgc-flame)"/><path class="fi" d="M${n(cx)} ${n(ft + 6.4)}c.9 2 1.4 3.5 1.4 4.6a1.4 1.4 0 0 1-2.8 0c0-1.1.5-2.6 1.4-4.6z"/><ellipse class="fb" cx="${n(cx)}" cy="${n(t - .5)}" rx="1.4" ry=".9"/></g></g>`;
    return { grad, halo, wax };
  };
  const cluster = (cls, vw, list) => { const c = list.map((x, i) => candle(x, i, cls[0])); return `<svg class="pg-candles ${cls}" viewBox="0 0 ${vw} 80" aria-hidden="true" focusable="false">${CANDLE_DEFS}<defs>${c.map(x => x.grad).join('')}</defs><g class="halos">${c.map(x => x.halo).join('')}</g>${c.map(x => x.wax).join('')}</svg>`; };
  /* [x, Höhe, Breite, Flacker-Versatz, Wachsläufe [Abstand vom linken Rand, Länge, Breite]] – erst die hintere Reihe (hoch), dann die vordere (kurz) */
  const CANDLES_R = cluster('right', 100, [
    [4, 48, 13, -0.4, [[-1.2, 17, 3.2], [6, 31, 2.8], [10.8, 11, 2.8]]], [26, 62, 14, -1.3, [[-1.2, 36, 3.4], [4.6, 14, 2.8], [9.8, 46, 3.2]]], [50, 44, 12, -0.9, [[-.8, 22, 3], [8.8, 13, 3]]], [72, 56, 13, -2.1, [[-1, 11, 2.8], [4.5, 37, 3.2], [10.2, 24, 2.8]]],
    [14, 26, 14, -1.7, [[-1, 12, 3], [9.6, 17, 3.2]]], [40, 18, 13, -0.6, [[1.5, 9, 2.8], [9.5, 12, 3]]], [60, 30, 14, -2.6, [[-1, 20, 3.2], [6.2, 8, 2.8], [11, 15, 2.8]]], [84, 16, 12, -1.1, [[1, 8, 2.8], [8.6, 11, 2.8]]],
  ]);
  const CANDLES_L = cluster('left', 60, [
    [3, 54, 14, -0.8, [[-1.2, 26, 3.2], [5.6, 38, 2.8], [11, 14, 2.8]]], [30, 40, 13, -1.9, [[-.8, 15, 3], [7.6, 27, 3.2]]],
    [14, 24, 14, -2.4, [[-1, 14, 3], [9.8, 10, 2.8]]], [40, 15, 12, -0.3, [[1.2, 9, 2.8], [8.4, 7, 2.8]]],
  ]);
  const CRACK = '<svg class="pg-crack" viewBox="0 0 36 64" aria-hidden="true"><path d="M27 0 22 11l5 7-9 12 4 8-8 13 2 13"/><path d="M22 11l-7 3M18 30l-6-2"/></svg>';
  function grave(t, byId, accs) {
    const acc = accs.find(a => a.id === t.accountId) || null; const tz = acc ? acc.tz : null;
    const trade = t.cause.tradeId != null ? byId.get(t.cause.tradeId) || null : null;
    const c = t.cause;
    const when = c.at ? `${c.weekdayIndex != null ? WEEKDAY_LONG[c.weekdayIndex] : (c.weekday || '—')}, ${dateIn(c.at, tz)} · ${timeIn(c.at, tz)} Uhr` : null;
    const tradeHtml = trade
      ? `<div class="prop-grave-trade"><span><span class="sym">${esc(trade.symbol || '—')}</span>${trade.setup ? `<span class="muted small"> · ${esc(trade.setup)}</span>` : ''}</span>${when ? `<span class="muted small">${esc(when)}</span>` : ''}<span>${c.pnl == null ? DASH : U.pnl(c.pnl, '', { r: trade.r })}</span></div>`
      : when ? `<div class="prop-grave-trade"><span class="muted small">kein Trade hinterlegt</span><span class="muted small">${esc(when)}</span></div>` : DASH;
    const whenShort = c.at ? `${c.weekdayIndex != null ? WEEKDAY_LONG[c.weekdayIndex].slice(0, 2) + '.' : (c.weekday || '')} ${dateIn(c.at, tz)} · ${timeIn(c.at, tz)}`.trim() : null;
    const streak = t.lossStreakBefore > 0 ? `<span class="${t.lossStreakBefore >= 2 ? 'neg' : ''}">${plural(t.lossStreakBefore, 'Verlusttrade', 'Verlusttrades')}</span>` : '<span class="muted">keine</span>';
    const link = c.tradeId != null && trade ? `<div class="prop-grave-foot"><a class="btn xs ghost" data-stop href="#/trades/${esc(String(c.tradeId))}">${I.external} Trade öffnen</a></div>` : '';
    const born = t.startedAt ? fmt.dateFull(t.startedAt) : null, died = c.at ? dateIn(c.at, tz) : null;
    const dates = born || died ? `<span class="pg-dates"><span>* ${born || '—'}</span><span>† ${died || '—'}</span></span>` : '';
    const life = t.lifetimeDays == null ? `<span class="muted">Lebensdauer unbekannt (${t.startedAt ? 'kein Breach-Datum' : 'kein Startdatum'})</span>` : `<span class="pg-age">gelebt <b>${plural(t.lifetimeDays, 'Tag', 'Tage')}</b></span>`;
    /* zwei Seiten: vorne nur das Wesentliche (Name, Konto, Phase, Daten, Todesursache), per Klick dreht sich der Stein und zeigt
       hinten kompakt den Rest (Inschrift, Ergebnis, auslösender Trade, Verlustserie, Tags, Link) */
    return `<section class="prop-grave" data-id="${esc(String(t.accountId))}">
      <div class="pg-stone" data-action="pg-flip" title="Umdrehen">
        <div class="pg-inner">
          <div class="pg-face pg-front" aria-hidden="false">${ROCK}${CRACK}
            <span class="pg-rip" aria-hidden="true">R · I · P</span>
            <div class="prop-grave-head"><b>${esc(t.firm)}${t.name ? ` ${esc(t.name)}` : ''}</b><div class="muted small">${t.size > 0 ? fmt.balance(t.size) : '—'}${t.market ? ` · ${marketLabel(t.market)}` : ''}</div><div class="pills">${U.pill(esc(nameOf(PHASES, t.phase)), 'neutral')}</div></div>
            <div class="prop-grave-life">${dates}${life}</div>
            <span class="pg-orn" aria-hidden="true"></span>
            <div class="pg-cause"><span>Todesursache</span><b>${ruleLabel(c.rule)}</b></div>
            <button type="button" class="pg-turn" data-action="pg-flip" aria-label="Umdrehen: Einzelheiten zeigen">${I.replay}<span>Umdrehen</span></button>
          </div>
          <div class="pg-face pg-back" aria-hidden="true">${ROCK}
            <span class="pg-rip" aria-hidden="true">${esc(t.firm)}${t.name ? ` ${esc(t.name)}` : ''}</span>
            ${t.note ? `<p class="pg-epitaph prop-grave-note">„${esc(t.note)}“</p>` : ''}
            <dl class="pg-facts">
              <dt>Ergebnis</dt><dd>${t.result == null ? DASH : U.pnl(t.result)}</dd>
              <dt>Trade</dt><dd>${trade ? `<b class="sym">${esc(trade.symbol || '—')}</b>${trade.setup ? ` · ${esc(trade.setup)}` : ''}` : '<span class="muted">kein Trade hinterlegt</span>'}</dd>
              ${whenShort ? `<dt>Wann</dt><dd>${esc(whenShort)}</dd>` : ''}
              ${trade ? `<dt>Trade-P&L</dt><dd>${c.pnl == null ? DASH : U.pnl(c.pnl, '', { r: trade.r })}</dd>` : ''}
              <dt>Serie davor</dt><dd>${streak}</dd>
              ${t.emotions.length ? `<dt>Emotion</dt><dd class="pg-tags">${t.emotions.map(e => U.chip(e, 'emotion')).join('')}</dd>` : ''}
              ${t.mistakes.length ? `<dt>Fehler</dt><dd class="pg-tags">${t.mistakes.map(m => U.chip(m, 'mistake')).join('')}</dd>` : ''}
            </dl>
            ${link}
            <button type="button" class="pg-turn" data-action="pg-flip" aria-label="Zurückdrehen">${I.replay}<span>Zurück</span></button>
          </div>
        </div>
      </div>
      <div class="pg-base" aria-hidden="true">${SLAB}<span class="pg-glow"></span>${CANDLES_L}${CANDLES_R}</div>
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

  PS.register('friedhof', 'Friedhof', tabFriedhof);
  root.PropFriedhof = { tabFriedhof, graveyard, breachesOf, dateIn, timeIn, RULE_LABEL };
})(window);
