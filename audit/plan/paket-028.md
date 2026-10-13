# Paket 028 · prop

Schritte: 22 · Dateien: web/README.md, web/css/app.css, web/e2e/friedhoftest.js, web/e2e/proptest.js, web/js/screens/prop-friedhof.js, web/js/screens/prop.js
Betroffene Tests laut Spezifikation: web/e2e/friedhoftest.js:122; web/e2e/friedhoftest.js:129; web/e2e/proptest.js:103; web/e2e/proptest.js:103 (Regex „Gewinn fehlt“ → „fehlen“, Schritt responsiv-3.20b); web/e2e/proptest.js:103, :116, :125 (.prop-meta); web/e2e/proptest.js:116; web/e2e/proptest.js:55; web/e2e/proptest.js:56; web/e2e/proptest.js:57; web/e2e/proptest.js:95 (bleibt grün); web/e2e/proptest.js:98
Baut auf Paketen auf: 7

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-C3 · Prop-Karte: Zeilen ohne Umbruch, Wert rechtsbündig

Gruppe responsiv · Cluster prop · Aufwand S · Befunde: bereich_prop-10
Quelle: audit/spec/responsiv.md Z. 392–395 · Dateien: web/css/app.css
Abhängig von: —

```text
**C3 Prop-Karte** (bereich_prop-10)
- Z. 2709 `.prop-meta .kv { padding: 6px 0; flex-wrap: wrap; }` → `.prop-meta .kv { padding: 6px 0; flex-wrap: nowrap; } .prop-meta .kv > span { flex: 0 0 auto; }`
- Z. 2710 `.prop-meta .kv b { text-align: right; }` → `.prop-meta .kv > b { min-width: 0; margin-left: auto; text-align: right; }`

```

## responsiv-3.12a · Prop-Karte: „Bis zum Bestehen“, Betrag ohne Dopplung in Kontowährung (planText)

Gruppe responsiv · Cluster prop · Aufwand S · Befunde: bereich_prop-10
Quelle: audit/spec/responsiv.md Z. 514–517 · Dateien: web/js/screens/prop.js
Abhängig von: responsiv-C3

```text
### 3.12 web/js/screens/prop.js (bereich_prop-21, responsiv-6, bereich_prop-22, bereich_prop-10)

- Z. 75 planText: `if (plan.missingProfit > C.EPS) parts.push(\`Gewinn fehlt: ${fmt.cur(plan.missingProfit)}\`);` → `if (plan.missingProfit > C.EPS && !(ev.target && a.phase !== 'funded')) parts.push(\`${money(a, plan.missingProfit)} fehlen\`); /* mit Ziel-Balken nennt der Balken den Betrag schon */`
- Z. 104 `U.kv(plan.funded ? 'Nächster Payout' : 'Bestehen', …)` → `U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', …)`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.kv] Die sechs Schritte ändern vier verschiedene Aufrufstellen. Sie überschneiden sich nur in prop.js Z. 104 (Kontokarte) und mittelbar in planText. Verbindlich für Z. 104, innerhalb des `${dead ? '' : …}` aus zustaende-S-P1: `${U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan))}`. Die Zeile wird immer gezeigt, denn sie trägt den einzigen Link in den Planer. planText: Der Gewinn-Teil erscheint nur bei `plan.missingProfit > C.EPS && (plan.funded || !ev.target)`; aufbau-C12a und responsiv-3.12a meinen dasselbe. Sind alle Teile leer und fehlt nur noch Gewinn, liefert planText `<span class="muted">nur noch das Ziel</span>`, sonst '—', nie ''. Ein leerer Wert würde Zeile und Link verstecken, und '—' bedeutet laut Zustände Z2 „Wert fehlt“. Wortlaut und Währungsformat des Betrags entscheidet der Anker planText/money (konflikt-9). prop.js Z. 283 (abstaende-M6): eigene Zeile „Heute noch erlaubt“ als Regelgröße in Kontowährung `money(a, cons.allowedToday, { compact: true })` (KI-Look Z5a/Z5c). Damit entfällt der Teil „heute noch … erlaubt“ in kilook-C19c. Die Testanpassung proptest.js:102 prüft die Zeile „Heute noch erlaubt“ und bei verletzter Regel „verletzt“ in „Consistency Rule“, nicht mehr „heute noch“ in der Consistency-Zeile. stats.js tabSummary (aufbau-C14c) und notebook.js statsHTML (diagramme-L1, Zähler nur > 0 gefärbt, passt zu farbe-C30) sind unabhängig. stats.js tabDays: siehe Anker stats.tabDays. Hinweis: responsiv-B7 (.st-cards, dritte Karte bis 1100 px volle Breite) passt zu den drei Karten aus C14c; die dritte Karte ist dann „Drawdown & Risiko“.
- ÜBERNIMMT aufbau-C12a: Bedingung und Rückfall „nur noch das Ziel“ setzt responsiv-3.12a in planText um. Kein eigener Eingriff in Z. 75–76.
- [konflikt: planText] planText(a, ev, plan, skipProfit) folgt wording-S12.4-12.5. Der Gewinnteil erscheint nur ohne skipProfit, als `${money(a, plan.missingProfit)} Gewinn fehlen` (Kontowährung, 2 Nachkommastellen). Dazu „Consistency Rule verletzt“ und die Rückgabe `parts.join(' · ') || (skipProfit ? '' : '—')`. Der Aufrufer folgt wording 12.10: `const pt = planText(a, ev, plan, !!(ev.target && a.phase !== 'funded'));`, die kv-Zeile nur bei pt, Beschriftung `plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen'` (responsiv-3.12a). So steht die Bedingung „Gewinn fehlt nur ohne Ziel-Balken“ (responsiv, aufbau) an einer Stelle, und der Text folgt der Wortwahl (proptest-Regex „Gewinn fehlen“). Ein Link um den Wert (aufbau prop-plan-link) umschließt pt. Den Teil Z. 75 aus kilook-C19b regelt der Anker money.
- [konflikt: money] Alles, was zu einem Prop-Konto gehört, steht in Kontowährung über money(a, …) bzw. U.pnl(…, { currency: a.currency }); darin sind kilook und wording einig. Beträge haben immer 2 Nachkommastellen, prop.js übergibt nirgends { compact: true } (siehe fmt.balance). Die Stop-Größe im Puffer-Tooltip steht in Kontowährung (wording 12.10): `${money(a, b.money)} Puffer${stopSize ? ` / ${money(a, stopSize)} je Stop` : ''}`. Puffer ÷ Stop-Größe wird ohne Umrechnung gerechnet; zwei verschiedene Währungszeichen würden eine Umrechnung vortäuschen. proptest.js:116 folgt wording-S19-prop. Zuständig je Stelle: Z. 50 (Breach) und Z. 68 (fmtMoney) → wording-S12.1-12.3 mit `v => money(a, v)`. Z. 75 → planText. Z. 86–87 → summaryTiles. Z. 102: Text „Kontostand“, U.pnl-Währung und U.count → wording 12.9, Klasse .kpi-label → kilook-C19b. Z. 104 → wording 12.10 plus Beschriftung aus responsiv-3.12a. Z. 194 (Hinweis) → kilook-C19b. Z. 283–284 (Planer) → wording-S12.24-12.26, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))`. Z. 303 (Kommentar) → kilook-C19c.
- VERBINDLICH (Kreuzprüfung): web/js/screens/prop.js, nach wording-S12.4-12.5 (dort kommen der Parameter skipProfit, der Gewinnteil nur bei `!skipProfit && plan.missingProfit > C.EPS` als `${money(a, plan.missingProfit)} Gewinn fehlen` in Kontowährung mit 2 Nachkommastellen ohne compact, und „Consistency Rule verletzt“) und vor aufbau-C12b.
1) planText, Rückgabe (Z. 76) → `return parts.join(' · ') || (plan.missingProfit > C.EPS ? '<span class="muted">nur noch das Ziel</span>' : '—');` statt `(skipProfit ? '' : '—')`. planText liefert nie ''. In Z. 75 keine zweite Inline-Bedingung; „Gewinn nur bei Funded oder ohne Ziel-Balken“ steckt in skipProfit.
2) Kontokarte: vor dem Template `const pt = planText(a, ev, plan, !!(ev.target && !plan.funded));` (falls wording-S12.8-12.12 es schon angelegt hat, übernehmen); Z. 104 → `${U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', pt)}`, immer sichtbar, ohne Bedingung auf pt. aufbau-C12b macht den Wert danach bei `plan.hasCond && active` zum Link .prop-plan-link und behält „Bis zum Bestehen“.
3) Neue Texte in allen fünf Sprachdateien: „Bis zum Bestehen“ (en „To pass“), „nur noch das Ziel“ (en „only the target left“). Den Schlüssel „{0} fehlen“ nicht anlegen. aufbau-C12a greift nicht mehr in Z. 75–76 ein.

## aufbau-C12b · Prop-Karte: Wert verlinkt in den Payout-Planer des Kontos

Gruppe aufbau · Cluster prop · Aufwand M · Befunde: bereich_prop-32
Quelle: audit/spec/aufbau.md Z. 561–564 · Dateien: web/js/screens/prop.js, web/css/app.css
Abhängig von: —

```text
- Kontokarte Z. 104: Wert von `U.kv(plan.funded ? 'Nächster Payout' : 'Bestehen', planText(a, ev, plan))` → `plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan)`
- Neue Aktion: `'prop-plan-open'(el) { const s = st(); s.payoutAccount = el.dataset.id; (s.fold || (s.fold = {})).planer = true; s.scrollPlaner = true; location.hash = '#/prop/bilanz'; },`
- `mount` Z. 309 → `mount(main) { const fn = MOUNTS[st().tab]; if (fn) fn(main); const s = st(); if (s.scrollPlaner) { s.scrollPlaner = false; const f = main.querySelector('[data-fold="planer"]'); if (f) requestAnimationFrame(() => window.scrollTo({ top: Math.max(0, f.getBoundingClientRect().top + window.scrollY - document.querySelector('.topbar').offsetHeight - 16) })); } },`
- CSS (`web/css/app.css` nach Z. 2701): `.prop-plan-link { color: inherit; text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 3px; } .prop-plan-link:hover { text-decoration-color: currentColor; }`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.kv] Die sechs Schritte ändern vier verschiedene Aufrufstellen. Sie überschneiden sich nur in prop.js Z. 104 (Kontokarte) und mittelbar in planText. Verbindlich für Z. 104, innerhalb des `${dead ? '' : …}` aus zustaende-S-P1: `${U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan))}`. Die Zeile wird immer gezeigt, denn sie trägt den einzigen Link in den Planer. planText: Der Gewinn-Teil erscheint nur bei `plan.missingProfit > C.EPS && (plan.funded || !ev.target)`; aufbau-C12a und responsiv-3.12a meinen dasselbe. Sind alle Teile leer und fehlt nur noch Gewinn, liefert planText `<span class="muted">nur noch das Ziel</span>`, sonst '—', nie ''. Ein leerer Wert würde Zeile und Link verstecken, und '—' bedeutet laut Zustände Z2 „Wert fehlt“. Wortlaut und Währungsformat des Betrags entscheidet der Anker planText/money (konflikt-9). prop.js Z. 283 (abstaende-M6): eigene Zeile „Heute noch erlaubt“ als Regelgröße in Kontowährung `money(a, cons.allowedToday, { compact: true })` (KI-Look Z5a/Z5c). Damit entfällt der Teil „heute noch … erlaubt“ in kilook-C19c. Die Testanpassung proptest.js:102 prüft die Zeile „Heute noch erlaubt“ und bei verletzter Regel „verletzt“ in „Consistency Rule“, nicht mehr „heute noch“ in der Consistency-Zeile. stats.js tabSummary (aufbau-C14c) und notebook.js statsHTML (diagramme-L1, Zähler nur > 0 gefärbt, passt zu farbe-C30) sind unabhängig. stats.js tabDays: siehe Anker stats.tabDays. Hinweis: responsiv-B7 (.st-cards, dritte Karte bis 1100 px volle Breite) passt zu den drei Karten aus C14c; die dritte Karte ist dann „Drawdown & Risiko“.
- ÄNDERN: Z. 104 erst nach responsiv-3.12a ändern. Die Beschriftung bleibt „Bis zum Bestehen“ (nicht auf „Bestehen“ zurücksetzen), nur der Wert wird zum Link wie in der Entscheidung. Aktion, mount und CSS siehe Anker [data-fold="planer"].
- [doppelt: [data-fold="planer"]] Beide Einstiege (Link auf der Kontokarte, alte Adresse #/prop/payout) nutzen einen Scroll-Mechanismus mit dem Merker `s.scrollPlaner`. Gescrollt wird einmal in mount, umgesetzt von aufbau-C12b: `mount(main) { const fn = MOUNTS[st().tab]; if (fn) fn(main); const s = st(); if (s.scrollPlaner) { s.scrollPlaner = false; const f = main.querySelector('[data-fold="planer"]'); if (f) requestAnimationFrame(() => { const tb = document.querySelector('.topbar'); window.scrollTo({ top: Math.max(0, f.getBoundingClientRect().top + window.scrollY - (tb ? tb.offsetHeight : 0) - 16) }); }); } },`. requestAnimationFrame läuft nach dem scrollTo in App.render (aufbau K18). zustaende-S-P3 setzt in render nur Fold, Merker und replaceState. Ergebnis: Der Planer beginnt 16 px unter der Titelzeile (offsetHeight enthält nach responsiv-A4 auch den Safe-Area-Rand), die Adresse lautet #/prop/bilanz, proptest.js:95 bleibt grün.
- ÄNDERN: mount wie in der Entscheidung, mit Null-Prüfung der Titelzeile. Aktion 'prop-plan-open' und CSS .prop-plan-link bleiben unverändert.

## zustaende-S-P3 · #/prop/payout: Bilanz mit offenem Planer, Adresse auf #/prop/bilanz umschreiben, Planer unter die Titelzeile scrollen

Gruppe zustaende · Cluster prop · Aufwand S · Befunde: bereich_prop-27
Quelle: audit/spec/zustaende.md Z. 731–734 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
**S-P3 `#/prop/payout`** – bereich_prop-27
- Z. 299 `if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; }` → `if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; s.scrollTo = 'planer'; try { history.replaceState(null, '', '#/prop/bilanz'); } catch (e) { } }`
- Z. 309 `mount(main)` am Anfang: `if (st().scrollTo === 'planer') { st().scrollTo = null; requestAnimationFrame(() => { const d = main.querySelector('[data-fold="planer"]'); const tb = main.querySelector('.topbar'); if (d) window.scrollTo({ top: d.getBoundingClientRect().top + window.scrollY - (tb ? tb.offsetHeight : 0) - 16 }); }); }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: [data-fold="planer"]] Beide Einstiege (Link auf der Kontokarte, alte Adresse #/prop/payout) nutzen einen Scroll-Mechanismus mit dem Merker `s.scrollPlaner`. Gescrollt wird einmal in mount, umgesetzt von aufbau-C12b: `mount(main) { const fn = MOUNTS[st().tab]; if (fn) fn(main); const s = st(); if (s.scrollPlaner) { s.scrollPlaner = false; const f = main.querySelector('[data-fold="planer"]'); if (f) requestAnimationFrame(() => { const tb = document.querySelector('.topbar'); window.scrollTo({ top: Math.max(0, f.getBoundingClientRect().top + window.scrollY - (tb ? tb.offsetHeight : 0) - 16) }); }); } },`. requestAnimationFrame läuft nach dem scrollTo in App.render (aufbau K18). zustaende-S-P3 setzt in render nur Fold, Merker und replaceState. Ergebnis: Der Planer beginnt 16 px unter der Titelzeile (offsetHeight enthält nach responsiv-A4 auch den Safe-Area-Rand), die Adresse lautet #/prop/bilanz, proptest.js:95 bleibt grün.
- ÄNDERN: Z. 299: `if (key === 'payout') { key = 'bilanz'; (s.fold || (s.fold = {})).planer = true; s.scrollPlaner = true; try { history.replaceState(null, '', '#/prop/bilanz'); } catch (e) { } }`. Merker heißt scrollPlaner, nicht scrollTo = 'planer'. Der mount-Teil (Z. 309) entfällt, das Scrollen übernimmt aufbau-C12b.

## responsiv-3.20b · proptest: Regex „Gewinn fehlt“ → „fehlen“

Gruppe responsiv · Cluster prop · Aufwand S · Befunde: —
Quelle: audit/spec/responsiv.md Z. 571–571 · Dateien: web/e2e/proptest.js
Abhängig von: responsiv-3.12a

```text
- `proptest.js:103`: Regex `/in \d+ Handelstag|Gewinn fehlt|bereit|Consistency/` → `/in \d+ Handelstag|fehlen|bereit|Consistency/`.
```

## wording-S12.1-12.3 · Prop: Währungssymbol je Konto (curSym/unitLabel), Breach-Banner ohne ISO-Datum mit „überschreitet“, fmtMoney in Kontowährung

Gruppe wording · Cluster prop · Aufwand M · Befunde: bereich_prop-38, bereich_prop-4, bereich_prop-5
Quelle: audit/spec/wording.md Z. 478–484 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
### Schritt 12 · `web/js/screens/prop.js`, `web/js/screens/prop-friedhof.js`, `web/js/screens/coupons.js`

| # | Stelle | vorher → nachher | ids |
|---|---|---|---|
| 12.1 | prop.js:34–35 | `const curSym = () => …fmt.cur(0, { money: true })…` → `const curSym = c => fmt.moneyBlind() ? '' : fmt.cur(0, { money: true, currency: c }).replace(/[\d.,\s ]/g, '');` · `const unitLabel = (text) => { const s = curSym(); … }` → `const unitLabel = (text, c) => { const s = curSym(c); return s ? \`${text} (${s})\` : text; };` | bereich_prop-38 |
| 12.2 | prop.js:50 `detailOf` (dailyLoss) | `` `Tagesverlust ${money(a, b.loss)} erreicht das Limit ${money(a, b.limit)}${b.dayKey ? ` (Handelstag ${esc(b.dayKey)})` : ''}` `` → `` `Tagesverlust ${money(a, b.loss)} ${b.loss > b.limit + C.EPS ? 'überschreitet' : 'erreicht'} das Limit von ${money(a, b.limit)}${b.dayKey && b.at && b.dayKey !== C.dayKey(new Date(b.at)) ? ` · Handelstag ${fmt.dateFull(C.parseDayKey(b.dayKey))}` : ''}` `` | bereich_prop-4 |
| 12.3 | prop.js:68 | `fmtMoney: v => fmt.cur(v)` → `fmtMoney: v => money(a, v)` | bereich_prop-5 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: money] Alles, was zu einem Prop-Konto gehört, steht in Kontowährung über money(a, …) bzw. U.pnl(…, { currency: a.currency }); darin sind kilook und wording einig. Beträge haben immer 2 Nachkommastellen, prop.js übergibt nirgends { compact: true } (siehe fmt.balance). Die Stop-Größe im Puffer-Tooltip steht in Kontowährung (wording 12.10): `${money(a, b.money)} Puffer${stopSize ? ` / ${money(a, stopSize)} je Stop` : ''}`. Puffer ÷ Stop-Größe wird ohne Umrechnung gerechnet; zwei verschiedene Währungszeichen würden eine Umrechnung vortäuschen. proptest.js:116 folgt wording-S19-prop. Zuständig je Stelle: Z. 50 (Breach) und Z. 68 (fmtMoney) → wording-S12.1-12.3 mit `v => money(a, v)`. Z. 75 → planText. Z. 86–87 → summaryTiles. Z. 102: Text „Kontostand“, U.pnl-Währung und U.count → wording 12.9, Klasse .kpi-label → kilook-C19b. Z. 104 → wording 12.10 plus Beschriftung aus responsiv-3.12a. Z. 194 (Hinweis) → kilook-C19b. Z. 283–284 (Planer) → wording-S12.24-12.26, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))`. Z. 303 (Kommentar) → kilook-C19c.

## wording-S12.4-12.5 · Prop: planText mit skipProfit, „{0} Gewinn fehlen“, „Consistency Rule verletzt“; limText/ddText/lockAt in Kontowährung

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-31, bereich_prop-5, bereich_prop-38
Quelle: audit/spec/wording.md Z. 485–486 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.4 | prop.js:71–77 `planText(a, ev, plan, skipProfit)` | vierter Parameter `skipProfit`. Z. 75: Gewinn-Teil `Gewinn fehlt: ${fmt.cur(plan.missingProfit)}` → nur wenn `!skipProfit`: `${money(a, plan.missingProfit)} Gewinn fehlen`; `'Consistency verletzt'` → `'Consistency Rule verletzt'`; „in N Handelstag(en)“ bleibt. Z. 76: `return parts.join(' · ') \|\| '—';` → `return parts.join(' · ') \|\| (skipProfit ? '' : '—');` | wording-31, bereich_prop-5 |
| 12.5 | prop.js:79 `limText` | `r => … fmt.cur(r.value)` → `(r, c) => … fmt.cur(r.value, { currency: c })`; `ddText` reicht die Währung durch; Aufrufer im Preset-Raster übergeben `p.currency`; `lockAt` ebenso | bereich_prop-38 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: planText] planText(a, ev, plan, skipProfit) folgt wording-S12.4-12.5. Der Gewinnteil erscheint nur ohne skipProfit, als `${money(a, plan.missingProfit)} Gewinn fehlen` (Kontowährung, 2 Nachkommastellen). Dazu „Consistency Rule verletzt“ und die Rückgabe `parts.join(' · ') || (skipProfit ? '' : '—')`. Der Aufrufer folgt wording 12.10: `const pt = planText(a, ev, plan, !!(ev.target && a.phase !== 'funded'));`, die kv-Zeile nur bei pt, Beschriftung `plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen'` (responsiv-3.12a). So steht die Bedingung „Gewinn fehlt nur ohne Ziel-Balken“ (responsiv, aufbau) an einer Stelle, und der Text folgt der Wortwahl (proptest-Regex „Gewinn fehlen“). Ein Link um den Wert (aufbau prop-plan-link) umschließt pt. Den Teil Z. 75 aus kilook-C19b regelt der Anker money.

## wording-S12.6-12.7 · Prop: Leerzustand „Prop-Konto anlegen“ ohne Firmen-Preset, Kachel „P&L der aktiven Konten“ je Währung

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-35, wording-34, wording-32, bereich_prop-5, wording-36
Quelle: audit/spec/wording.md Z. 487–488 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.6 | prop.js:82 Leerzustand | Text `'Lege ein Konto aus einem Firmen-Preset an und ordne ihm Trades zu. Dann siehst du hier Balance, Puffer, Ampel und den Weg zum Payout.'` → `'Lege ein Prop-Konto an (Firma, Größe, Regeln) und ordne ihm Trades zu. Dann siehst du hier Kontostand, Puffer, Ampel und den Weg zum Payout.'`; Knopf `${I.plus} Konto anlegen` → `${I.plus} Prop-Konto anlegen` (Titel „Noch keine Prop-Konten“ bleibt, proptest.js:20) | wording-35, wording-34, wording-32 |
| 12.7 | prop.js:86–87 Kachel | Summe je Währung: `const byCur = new Map(); for (const a of active) { const c = a.currency \|\| ''; byCur.set(c, (byCur.get(c) \|\| 0) + evalOf(a).ev.pnl); }`; Wert `[...byCur].map(([c, v]) => U.pnl(v, '', c ? { currency: c } : {})).join(' <span class="muted">·</span> ')`; Titel `'P&L aktive Konten'` → `'P&L der aktiven Konten'` | bereich_prop-5, wording-36 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.empty] (1) Check-in-Leerzustände nutzen I.mood: kilook-C13 in day.js:16, kilook-C14 in stats.js:61. kilook-C25 löscht I.sparkle; der Satz „Z. 61 Symbol sparkle bleibt“ in zustaende-S-ST2 gilt deshalb nicht. (2) Den Knopftext im Check-in-Leerzustand der Tagesansicht setzt aufbau-C7c einmal: `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`. Für künftige Tage passt „nachtragen“ nicht. (3) Schatten-Ich-Ranking (diagramme-I1): Ein leerer Hinweis ist nicht erlaubt (zustaende Z1: nie ''), also `U.empty('shield', 'Keine Regel aktiv', 'Schalte oben im Regelwerk mindestens eine Regel ein.')`. Ohne Verstoß gibt es keinen zweiten Leerzustand „Keine Verstöße“, der steht schon in der Nachbarkarte „Regelverstöße“. Es bleibt nur die Zeile „Ohne Verstöße: …“. (4) TradeLog-Liste: `return (list.length ? filters : '') + U.empty('tradelog', …)` mit Titel und Satz nach zustaende-S-T3. wording 9.7 und S-T3 ergänzen sich in derselben Zeile. (5) Regeln im Fortschritt: siehe #/settings/regeln. Verträglich sind aufbau-C15c, wording 9.14, 12.6, 12.30, zustaende-S-DY1 und noTrades aus S-ST2.
- [konflikt: U.tile] (1) Statistik → Tage (aufbau-C14d): Die Kacheln folgen der Farb- und Vorzeichenregel. „Gewinntage / Verlusttage“ wird nur bei > 0 gefärbt (`<span class="${ds.winDays ? 'pos' : ''}">…</span> / <span class="${ds.lossDays ? 'neg' : ''}">…</span>`, farbe-C30). „Ø Gewinntag“ wird `U.pnl(ds.avgWinDay)`, „Ø Verlusttag“ `U.pnl(ds.avgLossDay)`: Ergebnisse tragen ein Vorzeichen (kilook Z5b), avgLossDay ist negativ. Die Karte „P&L nach Wochentag“ entfällt mit aufbau-C14d und damit auch wording 10.3. (2) Statistik → Fehler: Kachel 1 behält das Vorzeichen `fmt.cur(mr.cost, { signed: true })`, die Klasse richtet sich nach dem Vorzeichen (neg/pos/neu). Die Beschriftung wechselt nach wording zwischen „Fehler haben gekostet“ und „Fehler haben eingebracht“. farbe K13 („Disziplin-Kosten überall mit Vorzeichen“, ausdrücklich auch für Statistik → Fehler) und kilook Z5b gehen vor; die Prüfzeile in wording (stats_mistakes.png) lautet dann „mit Minus“. (3) Affiliate: Die Kacheln behalten die Cent, kein moneyK (Begründung unter fmt.balance). Die Begriffe aus wording 13.3–13.7 bleiben, die Kachel „Creator“ entfällt (aufbau-C3). (4) Schatten-Ich, Kachel „Echt“: Fuß mit U.count. (5) Prop-Summe siehe summaryTiles, Monte Carlo siehe fmt.cur. Verträglich sind farbe-C27, wording 12.28, wording-S11.6-11.11 und wording-S15.10-15.15.
- [doppelt: summaryTiles] kilook-C19b setzt die Kachel „P&L je Währung“ einmal um (Code Z. 86–87, red-Zählung in derselben Schleife), mit dem Wording-Text: Titel „P&L der aktiven Konten“, Teile verbunden mit `' <span class="muted">·</span> '`, jeder Teil `U.pnl(v, '', c ? { currency: c } : {})` mit 2 Nachkommastellen, ohne aktive Konten `U.pnl(0)`. abstaende-M1 (section.prop-sec um head, body und none) ist davon unabhängig.
- ÄNDERN: 12.7 setzt kilook-C19b um, Titel und Trenner werden dort übernommen. 12.6 (Leerzustand) bleibt bei wording.

## wording-S12.8-12.12 · Prop-Karte: „reicht für N Stops“, „Kontostand“, P&L in Kontowährung, Bestehen-Zeile nur wenn nicht leer, Tooltip „je Stop“, Archiv-Untertitel, Verweis „Trade bearbeiten“

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-33, wording-32, bereich_prop-5, zustaende-28, wording-31, wording-37, wording-61
Quelle: audit/spec/wording.md Z. 489–493 · Dateien: web/js/screens/prop.js
Abhängig von: wording-S1.1-1.3, wording-S12.4-12.5

```text
| 12.8 | prop.js:98 Puffer | `` `noch ${b.stops} Stop-Loss${b.stops === 1 ? '' : 'es'}` `` → `` `reicht für ${b.stops} Stop${b.stops === 1 ? '' : 's'}` `` | wording-33 |
| 12.9 | prop.js:102 Karte | Caption `Balance` → `Kontostand`; `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`; `${ev.n} Trades` → `${U.count(ev.n, 'Trade', 'Trades')}` | wording-32, bereich_prop-5, zustaende-28 |
| 12.10 | prop.js:104 Meta | `const pt = planText(a, ev, plan, !!(ev.target && a.phase !== 'funded'));` und die kv-Zeile „Bestehen“/„Nächster Payout“ nur, wenn `pt`; Tooltip `${fmt.cur(stopSize)} je Stop-Loss` → `${money(a, stopSize)} je Stop` | wording-31, bereich_prop-5, wording-33 |
| 12.11 | prop.js:123 | `sub: 'bestanden, geplatzt oder archiviert'` → `sub: 'Bestanden, geplatzt oder archiviert'` | wording-37 |
| 12.12 | prop.js:133 Trades zuordnen | `Ältere Trades ordnest du im Trade-Editor zu.` → `Ältere Trades ordnest du über „Trade bearbeiten“ zu.` | wording-61 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- ÄNDERN: 12.10: Die kv-Zeile „Bis zum Bestehen“/„Nächster Payout“ bekommt keine Bedingung `pt` und ist immer sichtbar, weil sie den Planer-Link trägt. planText liefert nie ''. Der Tooltip „je Stop“ und die übrigen Teile bleiben.
- [konflikt: planText] planText(a, ev, plan, skipProfit) folgt wording-S12.4-12.5. Der Gewinnteil erscheint nur ohne skipProfit, als `${money(a, plan.missingProfit)} Gewinn fehlen` (Kontowährung, 2 Nachkommastellen). Dazu „Consistency Rule verletzt“ und die Rückgabe `parts.join(' · ') || (skipProfit ? '' : '—')`. Der Aufrufer folgt wording 12.10: `const pt = planText(a, ev, plan, !!(ev.target && a.phase !== 'funded'));`, die kv-Zeile nur bei pt, Beschriftung `plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen'` (responsiv-3.12a). So steht die Bedingung „Gewinn fehlt nur ohne Ziel-Balken“ (responsiv, aufbau) an einer Stelle, und der Text folgt der Wortwahl (proptest-Regex „Gewinn fehlen“). Ein Link um den Wert (aufbau prop-plan-link) umschließt pt. Den Teil Z. 75 aus kilook-C19b regelt der Anker money.
- [konflikt: money] Alles, was zu einem Prop-Konto gehört, steht in Kontowährung über money(a, …) bzw. U.pnl(…, { currency: a.currency }); darin sind kilook und wording einig. Beträge haben immer 2 Nachkommastellen, prop.js übergibt nirgends { compact: true } (siehe fmt.balance). Die Stop-Größe im Puffer-Tooltip steht in Kontowährung (wording 12.10): `${money(a, b.money)} Puffer${stopSize ? ` / ${money(a, stopSize)} je Stop` : ''}`. Puffer ÷ Stop-Größe wird ohne Umrechnung gerechnet; zwei verschiedene Währungszeichen würden eine Umrechnung vortäuschen. proptest.js:116 folgt wording-S19-prop. Zuständig je Stelle: Z. 50 (Breach) und Z. 68 (fmtMoney) → wording-S12.1-12.3 mit `v => money(a, v)`. Z. 75 → planText. Z. 86–87 → summaryTiles. Z. 102: Text „Kontostand“, U.pnl-Währung und U.count → wording 12.9, Klasse .kpi-label → kilook-C19b. Z. 104 → wording 12.10 plus Beschriftung aus responsiv-3.12a. Z. 194 (Hinweis) → kilook-C19b. Z. 283–284 (Planer) → wording-S12.24-12.26, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))`. Z. 303 (Kommentar) → kilook-C19c.

## wording-S12.13-12.16 · Prop-Konto-Dialog: Betrag-Option mit Kontowährung, „% des Startkapitals“, „Mindest-Kontostand“, Platzhalter „z. B. 50K“/„z. B. Topstep“, Währungshinweis

Gruppe wording · Cluster prop · Aufwand S · Befunde: bereich_prop-38, wording-32, bereich_prop-53, bereich_prop-5
Quelle: audit/spec/wording.md Z. 494–497 · Dateien: web/js/screens/prop.js
Abhängig von: wording-S12.1-12.3

```text
| 12.13 | prop.js:143 `modeSel` | `[['abs', unitLabel('Betrag')], ['pct', '% der Startbalance']]` → `[['abs', unitLabel('Betrag', o.currency)], ['pct', '% des Startkapitals']]` | bereich_prop-38, wording-32 |
| 12.14 | prop.js:153 | `F('Mindestbalance', …)` → `F('Mindest-Kontostand', …)` | wording-32 |
| 12.15 | prop.js:191 / :216 / :217 | `<label for="pa-name">Konto (z. B. 50K)</label><input … id="pa-name" …>` → `<label for="pa-name">Konto</label><input … id="pa-name" placeholder="z. B. 50K" …>`; ebenso :217 (`pp-name`); :216 Firma bekommt `placeholder="z. B. Topstep"` | bereich_prop-53 |
| 12.16 | prop.js:194 Währungshinweis | `Balance, Limits und Puffer in Kontowährung. Trade-P&L bleibt in der Journal-Währung.` → `Kontostand, P&L, Limits und Puffer in Kontowährung. In Trade-Listen bleibt die Journal-Währung.` | bereich_prop-5, wording-32 |
```

## wording-S12.17-12.20 · Prop-Konto-Dialog: Aktion prop-cur beim Währungswechsel, „Startkapital“, Währung an rulesFields, Stop-Größe-Hinweis

Gruppe wording · Cluster prop · Aufwand M · Befunde: bereich_prop-38, wording-32, wording-33
Quelle: audit/spec/wording.md Z. 498–501 · Dateien: web/js/screens/prop.js
Abhängig von: wording-S12.1-12.3, wording-S12.13-12.16

```text
| 12.17 | prop.js:194/:21x Währungswechsel | `#pa-cur` und `#pp-cur` bekommen `data-change="prop-cur"`. Neue Aktion `'prop-cur'(el) { const f = el.form; ['dl_mode', 'dd_mode', 'pt_mode'].forEach(n => { const o = f.querySelector(\`select[name="${n}"] option[value="abs"]\`); if (o) o.textContent = unitLabel('Betrag', el.value); }); }`; `fillAccountForm` ruft sie nach `set('currency', …)` auf | bereich_prop-38 |
| 12.18 | prop.js:198 | `<label for="pa-sb">Startbalance</label>` → `<label for="pa-sb">Startkapital</label>` | wording-32 |
| 12.19 | prop.js:203 / :225 `rulesFields`-Aufrufe | `{ tz: s.tz }` → `{ tz: s.tz, currency: s.currency }`; `{ fees: s.fees \|\| {}, disabled: ro }` → `{ fees: s.fees \|\| {}, disabled: ro, currency: s.currency }` | bereich_prop-38 |
| 12.20 | prop.js:242 Stop-Größe | Hinweis `Bestimmt „noch X Stop-Losses“.` → `Bestimmt, für wie viele Stops der Puffer reicht.` | wording-33 |
```

## wording-S12.21-12.23 · Prop-Bilanz: Pro Firma ohne ROI bei fehlenden Payouts, Symbolknopf „Als erhalten markieren“, Spalten „Beantragt am“/„Erhalten am“

Gruppe wording · Cluster prop · Aufwand S · Befunde: bereich_prop-24, bereich_prop-20
Quelle: audit/spec/wording.md Z. 502–504 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.21 | prop.js:258 Pro Firma | Unterzeile → `${f.received > C.EPS ? \`${fmt.cur(f.spent)} Ausgaben · ${fmt.cur(f.received)} Payouts · ROI ${f.roi == null ? '—' : fmt.pct(f.roi, 0, true)}\` : \`${fmt.cur(f.spent)} Ausgaben · noch keine Payouts\`}` | bereich_prop-24 |
| 12.22 | prop.js:267 Payout-Zeile | `<button type="button" class="btn xs" data-action="prop-payout-received" data-id="${esc(p.id)}">Erhalten</button> ` → `<button type="button" class="btn ghost icon sm" data-action="prop-payout-received" data-id="${esc(p.id)}" aria-label="Als erhalten markieren" data-tip="Als erhalten markieren">${I.check}</button>` (Leerzeichen danach entfällt) | bereich_prop-20 |
| 12.23 | prop.js:268 und :286 Spaltenköpfe | `<th>Beantragt</th><th>Erhalten</th>` → `<th>Beantragt am</th><th>Erhalten am</th>` | bereich_prop-20 |
```

## wording-S12.24-12.26 · Prop-Planer: „Mindest-Kontostand“, Bedingungen „(mind. …) · erfüllt“, alle Beträge in Kontowährung

Gruppe wording · Cluster prop · Aufwand M · Befunde: wording-32, bereich_prop-31, bereich_prop-5
Quelle: audit/spec/wording.md Z. 505–507 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.24 | prop.js:279 Planer-Banner | `(Mindest-Handelstage, Mindestgewinn oder Mindestbalance)` → `(Mindest-Handelstage, Mindestgewinn oder Mindest-Kontostand)` | wording-32 |
| 12.25 | prop.js:283 Bedingungen | Handelstage: offen → `${n} von ${o.minDays} <span class="warn">· noch ${plan.missingDays}</span>` (unverändert); erfüllt → `${n} <span class="muted">(mind. ${o.minDays})</span> <span class="pos">· erfüllt</span>`; ohne Vorgabe unverändert. Profit Target/Gewinn: `U.pnl(ev.pnl)` → `U.pnl(ev.pnl, '', { currency: a.currency })`, alle `fmt.cur(…)` → `money(a, …)`; erfüllt → `<span class="muted">(mind. ${money(a, o.minProfit)})</span> <span class="pos">· erfüllt</span>`, offen weiter mit „von“. kv `'Mindestbalance'` → `'Mindest-Kontostand'`, `fmt.balance(ev.balance)` → `fmt.balance(ev.balance, { currency: a.currency })`, gleiches Muster „(mind. …)“ wenn erfüllt | bereich_prop-31, bereich_prop-5, wording-32 |
| 12.26 | prop.js:284 Vorschlag | `fmt.cur(plan.suggestion.perDay)`, `fmt.cur(plan.suggestion.total)` → `money(a, …)` | bereich_prop-5 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: money] Alles, was zu einem Prop-Konto gehört, steht in Kontowährung über money(a, …) bzw. U.pnl(…, { currency: a.currency }); darin sind kilook und wording einig. Beträge haben immer 2 Nachkommastellen, prop.js übergibt nirgends { compact: true } (siehe fmt.balance). Die Stop-Größe im Puffer-Tooltip steht in Kontowährung (wording 12.10): `${money(a, b.money)} Puffer${stopSize ? ` / ${money(a, stopSize)} je Stop` : ''}`. Puffer ÷ Stop-Größe wird ohne Umrechnung gerechnet; zwei verschiedene Währungszeichen würden eine Umrechnung vortäuschen. proptest.js:116 folgt wording-S19-prop. Zuständig je Stelle: Z. 50 (Breach) und Z. 68 (fmtMoney) → wording-S12.1-12.3 mit `v => money(a, v)`. Z. 75 → planText. Z. 86–87 → summaryTiles. Z. 102: Text „Kontostand“, U.pnl-Währung und U.count → wording 12.9, Klasse .kpi-label → kilook-C19b. Z. 104 → wording 12.10 plus Beschriftung aus responsiv-3.12a. Z. 194 (Hinweis) → kilook-C19b. Z. 283–284 (Planer) → wording-S12.24-12.26, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))`. Z. 303 (Kommentar) → kilook-C19c.
- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).

## wording-S12.27 · Prop-Kopfreihe: Knopf „Prop-Konto anlegen“ mit aria-label

Gruppe wording · Cluster prop · Aufwand S · Befunde: wording-34
Quelle: audit/spec/wording.md Z. 508–508 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| 12.27 | prop.js:294 Kopfreihe | `<button type="button" class="btn" data-action="prop-account-new">${I.plus}<span class="hide-m">Prop-Konto</span></button>` → `<button type="button" class="btn" data-action="prop-account-new" aria-label="Prop-Konto anlegen">${I.plus}<span class="hide-m">Prop-Konto anlegen</span></button>` | wording-34 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .hide-m] Endzustand des Prop-Kopfknopfs (prop.js:294): `<button type="button" class="btn" data-action="prop-account-new">${I.plus}<span>Prop-Konto anlegen</span></button>`. Der Text steht auf allen Breiten, ohne hide-m oder vh-m und ohne aria-label. Grund für den Wortlaut: Das Wording-Glossar ist für Texte maßgeblich („Prop-Konto“ immer mit Präfix, Knopf = Objekt + Verb, „anlegen“ für neue Datensätze) und hat Vorrang vor „Konto anlegen“ aus Komponenten. Er ist derselbe wie im Leerzustand (prop.js:82) und in widgets.js:354. Grund für die Form: Barrierefreiheit und Komponenten wollen den Text auf allen Breiten sichtbar haben. Damit ist das aria-label überflüssig (Barrierefreiheit Z8: aria-label nur ohne sichtbaren Text). In Wording 4.2 entfällt die Pflichtprüfung `aria-label="Prop-Konto anlegen"` ≥ 1, die Prüfung `Prop-Konto anlegen` ≥ 3 bleibt. Die übrigen hide-m-Schritte (B1, Coach, Notebook „Teilen“) sind verträglich, B1 muss aber zuerst die Klasse .vh-m anlegen.
- ÄNDERN: Ergebnis ohne aria-label und ohne class="hide-m": `<button type="button" class="btn" data-action="prop-account-new">${I.plus}<span>Prop-Konto anlegen</span></button>`. In 4.2 die Zeile `p "aria-label=\"Prop-Konto anlegen\"" 1` streichen.
- ÜBERNIMMT barrierefreiheit-C-prop-294: wording-S12.27 entfernt hide-m mit. Der Wortlaut ist „Prop-Konto anlegen“.
- ÜBERNIMMT komponenten-S-prop-f: Text „Prop-Konto anlegen“ statt „Konto anlegen“. wording-S12.27 setzt ihn um, zusammen mit dem Entfernen von hide-m.

## wording-S12.28-12.29 · Friedhof: Lebensdauer über U.count, Grabstein-Unterzeile ohne Geldbetrag („100K“ nur ohne Namen)

Gruppe wording · Cluster prop · Aufwand S · Befunde: zustaende-28, bereich_prop-46
Quelle: audit/spec/wording.md Z. 509–510 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: wording-S1.1-1.3

```text
| 12.28 | prop-friedhof.js:56 | `` `${fmt.num(avgLife, 0)} Tage` `` → `U.count(Math.round(avgLife), 'Tag', 'Tage')` | zustaende-28 |
| 12.29 | prop-friedhof.js:136 Grabstein | `${t.size > 0 ? fmt.balance(t.size) : '—'}${t.market ? \` · ${marketLabel(t.market)}\` : ''}` → `${[!t.name && t.size > 0 ? \`${fmt.int(t.size / 1000)}K\` : '', t.market ? marketLabel(t.market) : ''].filter(Boolean).join(' · ') \|\| '—'}` | bereich_prop-46 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.tile] (1) Statistik → Tage (aufbau-C14d): Die Kacheln folgen der Farb- und Vorzeichenregel. „Gewinntage / Verlusttage“ wird nur bei > 0 gefärbt (`<span class="${ds.winDays ? 'pos' : ''}">…</span> / <span class="${ds.lossDays ? 'neg' : ''}">…</span>`, farbe-C30). „Ø Gewinntag“ wird `U.pnl(ds.avgWinDay)`, „Ø Verlusttag“ `U.pnl(ds.avgLossDay)`: Ergebnisse tragen ein Vorzeichen (kilook Z5b), avgLossDay ist negativ. Die Karte „P&L nach Wochentag“ entfällt mit aufbau-C14d und damit auch wording 10.3. (2) Statistik → Fehler: Kachel 1 behält das Vorzeichen `fmt.cur(mr.cost, { signed: true })`, die Klasse richtet sich nach dem Vorzeichen (neg/pos/neu). Die Beschriftung wechselt nach wording zwischen „Fehler haben gekostet“ und „Fehler haben eingebracht“. farbe K13 („Disziplin-Kosten überall mit Vorzeichen“, ausdrücklich auch für Statistik → Fehler) und kilook Z5b gehen vor; die Prüfzeile in wording (stats_mistakes.png) lautet dann „mit Minus“. (3) Affiliate: Die Kacheln behalten die Cent, kein moneyK (Begründung unter fmt.balance). Die Begriffe aus wording 13.3–13.7 bleiben, die Kachel „Creator“ entfällt (aufbau-C3). (4) Schatten-Ich, Kachel „Echt“: Fuß mit U.count. (5) Prop-Summe siehe summaryTiles, Monte Carlo siehe fmt.cur. Verträglich sind farbe-C27, wording 12.28, wording-S11.6-11.11 und wording-S15.10-15.15.
- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).

## wording-S19-prop · Tests anpassen: proptest, friedhoftest

Gruppe wording · Cluster prop · Aufwand S · Befunde: bereich_prop-5, wording-33, wording-31, bereich_prop-46
Quelle: audit/spec/wording.md Z. 630–635 · Dateien: web/e2e/proptest.js, web/e2e/friedhoftest.js
Abhängig von: wording-S12.4-12.5, wording-S12.8-12.12, wording-S12.28-12.29

```text
| e2e/proptest.js:56 | `card.pnl.includes('€')` → `card.pnl.includes('$')`; `/noch \d+ Stop-Loss/` → `/reicht für \d+ Stop/`; `card.meta.includes('Bestehen')` → `card.meta.includes('Puffer') && !/Gewinn fehlt/.test(card.meta)`; Kommentar Z. 55 anpassen | bereich_prop-5, wording-33, wording-31 |
| e2e/proptest.js:57 | `` `noch ${ev.buffer.stops} Stop-Loss` `` → `` `reicht für ${ev.buffer.stops} Stop` `` | wording-33 |
| e2e/proptest.js:103 | `/in \d+ Handelstag\|Gewinn fehlt\|bereit\|Consistency/` → `/in \d+ Handelstag\|Gewinn fehlen\|bereit\|Consistency/` | wording-31 |
| e2e/proptest.js:116 | `'/ 150,00 € je Stop-Loss'` → Erwartung über `UI.fmt.cur(150, { currency: acc.currency })` + `' je Stop'` | bereich_prop-5, wording-33 |
| e2e/friedhoftest.js:122 | „Fix 3“: für das Konto ohne Größe und Namen genau `'Futures'` (bzw. Marktname) erwarten, nicht `startsWith('—')` | bereich_prop-46 |
| e2e/friedhoftest.js:129 | „Fix 4“: nur noch prüfen, dass im Geld-blind-Modus weder R-Wert noch €/$ in der Unterzeile steht (nicht `includes('ausgeblendet')`) | bereich_prop-46 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: money] Alles, was zu einem Prop-Konto gehört, steht in Kontowährung über money(a, …) bzw. U.pnl(…, { currency: a.currency }); darin sind kilook und wording einig. Beträge haben immer 2 Nachkommastellen, prop.js übergibt nirgends { compact: true } (siehe fmt.balance). Die Stop-Größe im Puffer-Tooltip steht in Kontowährung (wording 12.10): `${money(a, b.money)} Puffer${stopSize ? ` / ${money(a, stopSize)} je Stop` : ''}`. Puffer ÷ Stop-Größe wird ohne Umrechnung gerechnet; zwei verschiedene Währungszeichen würden eine Umrechnung vortäuschen. proptest.js:116 folgt wording-S19-prop. Zuständig je Stelle: Z. 50 (Breach) und Z. 68 (fmtMoney) → wording-S12.1-12.3 mit `v => money(a, v)`. Z. 75 → planText. Z. 86–87 → summaryTiles. Z. 102: Text „Kontostand“, U.pnl-Währung und U.count → wording 12.9, Klasse .kpi-label → kilook-C19b. Z. 104 → wording 12.10 plus Beschriftung aus responsiv-3.12a. Z. 194 (Hinweis) → kilook-C19b. Z. 283–284 (Planer) → wording-S12.24-12.26, einschließlich der Auszahlung `money(a, ev.pnl * num(a.profitSplit, 0))`. Z. 303 (Kommentar) → kilook-C19c.
- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).

## bewegung-C6cd · Tote Übergänge im Prop-Bereich streichen (.prop-sub a::after, .prop-bar .track i)

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: bewegung-40
Quelle: audit/spec/bewegung.md Z. 269–271 · Dateien: web/css/app.css
Abhängig von: —

```text
- c) Z. 2597 `.prop-sub a::after { …; transform: scaleX(0); transition: transform var(--dur-2) var(--ease); }` → nur `transition: …;` streichen. Entfällt, wenn aufbau-16 `.prop-sub` löscht (K19).
- d) Z. 2708 `.prop-bar .track i { …; transition: width var(--dur-3) var(--ease); }` → `transition: …;` streichen.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-sub a::after] komponenten-C20 setzt als einziger Schritt die gemeinsame Unterstrich-Fassung für .subtabs, .set-tabs und .prop-sub (Schrift und Linie --text, Gewicht 500, deckt farbe-B21 und zustaende-S-C9b ab). Abweichend von C20 gilt: (1) Die Linie ::after bekommt keine transition. Alle drei Leisten bauen beim Klick neu auf (content-tab, log-tab und recent-tab rufen rerender, .prop-sub navigiert; README Z. 357: die Leiste steht still), der Übergang würde also nie laufen (bewegung D3/K19). scaleX(0) und scaleX(1) bleiben. (2) Gewählt wird an Links über `.prop-sub a[aria-current="page"]` angezeigt, weil aria-pressed an <a> wegfällt (barrierefreiheit Z4 und C-prop-304-305). (3) Schrift var(--fs-14)/var(--lh-14) statt 13.5px (Typografie: Reiter 14). (4) Fokus `outline: 2px solid var(--focus); outline-offset: -2px` statt --accent (barrierefreiheit Z1; die Leiste hat overflow-x: auto). Die Antwort auf aufbau-16 (F2) muss nicht abgewartet werden. Bei Ja streicht aufbau die .prop-sub-Selektoren aus diesen Regeln.
- ÄNDERN: Nur Teil d) umsetzen (Z. 2708 `.prop-bar .track i`: transition streichen). Teil c) erledigt komponenten-C20, dort hat ::after keine transition.

## bewegung-C10a · Grabstein-Drehung .pg-inner auf --ease (.75s bleibt)

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: bewegung-33
Quelle: audit/spec/bewegung.md Z. 303–304 · Dateien: web/css/app.css
Abhängig von: —

```text
**C10 Grabstein und Kerzen** (bewegung-33, bereich_prop-50, bewegung-6)
- Z. 2773 `.pg-inner { … transition: transform .75s cubic-bezier(.3, .7, .2, 1); }` → `transition: transform .75s var(--ease);` (.75s bleibt, Ausnahme T1)
```

## bewegung-C10b · Kerzen (CSS): Flammen und Lichthöfe pausieren über .pg-base.off

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: bereich_prop-50, bewegung-6
Quelle: audit/spec/bewegung.md Z. 305–306 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 2832 neu: `.pg-base.off .pg-candles .flame, .pg-base.off .pg-candles .halo { animation-play-state: paused; } /* außerhalb des Fensters ruhen die Flammen */`

```

## bewegung-3.9a · Friedhof: Kerzen-Definitionen einmal pro Seite (cluster als Objekt, .pg-defs in tabFriedhof)

Gruppe bewegung · Cluster prop · Aufwand M · Befunde: bereich_prop-50, bewegung-6
Quelle: audit/spec/bewegung.md Z. 333–337 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: —

```text
### 3.9 `web/js/screens/prop-friedhof.js` (bereich_prop-50, bewegung-6)
- **`cluster` Z. 105**: Rückgabe von String auf Objekt umstellen, ohne Definitionen im SVG:
  `const cluster = (cls, vw, list) => { const c = list.map((x, i) => candle(x, i, cls[0], vw)); return { svg: \`<svg class="pg-candles ${cls}" viewBox="0 0 ${vw} 80" aria-hidden="true" focusable="false"><g class="halos">${c.map(x => x.halo).join('')}</g>${c.map(x => x.wax).join('')}</svg>\`, defs: c.map(x => x.grad).join('') }; };`
- **Z. 159** `${CANDLES_L}${CANDLES_R}` → `${CANDLES_L.svg}${CANDLES_R.svg}`
- **`tabFriedhof` Z. 172** vor `<div class="grid prop-graves">` einmal einfügen: `<svg class="pg-defs" data-no-reveal width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">${CANDLE_DEFS}<defs>${CANDLES_L.defs}${CANDLES_R.defs}</defs></svg>`. Wichtig: nicht `display:none`, sonst greifen die Verläufe nicht.
```

## bewegung-3.9b · Friedhof: IntersectionObserver setzt .off an .pg-base (mount/unmount)

Gruppe bewegung · Cluster prop · Aufwand M · Befunde: bereich_prop-50, bewegung-6
Quelle: audit/spec/bewegung.md Z. 338–339 · Dateien: web/js/screens/prop-friedhof.js
Abhängig von: bewegung-C10b

```text
- **Z. 175** `PS.register('friedhof', 'Friedhof', tabFriedhof);` → `let io = null; PS.register('friedhof', 'Friedhof', tabFriedhof, { mount(main) { if (io) io.disconnect(); io = null; if (!('IntersectionObserver' in window)) return; io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting))); main.querySelectorAll('.pg-base').forEach(b => io.observe(b)); }, unmount() { if (io) { io.disconnect(); io = null; } } });` (`let io` gehört auf Modulebene über die Zeile).

```

## bewegung-3.12d · README Z. 260 (Friedhof): Flammen ruhen, solange der Sockel nicht im Bild ist

Gruppe bewegung · Cluster prop · Aufwand S · Befunde: —
Quelle: audit/spec/bewegung.md Z. 353–354 · Dateien: web/README.md
Abhängig von: bewegung-C10b, bewegung-3.9b

```text
- **Z. 260** (Friedhof) nach „weicher Flamme und Lichthof“ ergänzen: „(Flammen ruhen, solange der Sockel nicht im Bild ist)“.

```
