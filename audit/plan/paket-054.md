# Paket 054 · trades_tag, tokens, prop

Schritte: 4 · Dateien: web/css/app.css, web/js/screens/day.js, web/js/screens/prop.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 shadow/leer_shadow/leer_progress (Intro und Leer-Titel 15/600); e2e/proptest.js:20, :23, :27
Baut auf Paketen auf: 1, 53

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## typografie-3.2.3s · --fs-15: übrige 15-px-Regeln auf das Token (dazu 600 bei .empty b, .rp-sub, .shadow-intro b, .prop-title b, .prop-group-title b)

Gruppe typografie · Cluster tokens · Aufwand M · Befunde: typografie-3
Quelle: audit/spec/typografie.md Z. 271–272 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
- schon 15 → Token: 491 `.card-title`, 677 `.empty b` (dazu 600), 890, 907, 1374, 1502, 2209 `.rp-sub` (700 → 600), 2395 `.shadow-intro b` (dazu 600), 2530, 2537, 2576, 2607, 2621, 2647, 2692 (dazu 600), 2715 (dazu 600), 3075

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .replay-decide .btn.big] komponenten-C09 gilt: Der Knopf nutzt die Standardstufe .btn (14px/500, Höhe md), die Regel lautet `.replay-decide .btn.big { min-width: 132px; justify-content: center; }`. Die 15-px-Angabe, die typografie-3.2.3s in ein Token umwandeln würde, entfällt ganz. Grund: eine Bauart je Rolle. Blind-Replay bleibt hinter dem Feature-Flag.
- ÄNDERN: Z. 2530 (.replay-decide .btn.big) aus der Liste „schon 15 → Token“ streichen.
- [konflikt: .voice-actions .btn.big] komponenten-C09 gilt: Die Regel `.voice-actions .btn.big` wird gelöscht, „Aufnahme starten“ wird ein normaler .btn.primary der Stufe md. Damit gibt es nichts mehr in ein Token umzuwandeln.
- ÄNDERN: Z. 2576 (.voice-actions .btn.big) aus der Liste „schon 15 → Token“ streichen.
- [konflikt: .prop-group-title b] `.prop-group-title b { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 600; color: var(--text-2); }`: aufbau-A4e mit Typografie-Token, `font-family: var(--font-display)` entfällt. Grund: Der Gruppentitel steht unter „Aktive Konten“ (.prop-h 15/600) und über Karten, deren Titel ebenfalls 15/600 sind (.prop-title b). Eine Unterüberschrift darf nicht gleich groß sein wie die übergeordnete (aufbau Grundsatz 4 und K21; die aufbau-Prüfung Z. 751 erwartet 13px/600). 13/600 ist eine Stufe der Text-Skala, das Gewicht 600 deckt auch typografie-3.2.4f ab.
- ÄNDERN: Z. 2715 (.prop-group-title b) aus „schon 15 → Token (dazu 600)“ streichen.
- [doppelt: .empty b] Endzustand: `.empty > b { color: var(--text); font-size: var(--fs-15); line-height: var(--lh-15); font-weight: 600; }`. komponenten-C11 setzt den Kind-Selektor (`.empty > b`, `.empty > svg`). typografie-3.2.3s setzt Token und 600 in einem Zug. typografie-3.2.4h und der Z.-677-Teil von zustaende-S-C4 wären dieselbe 600.
- ÜBERNIMMT typografie-3.2.4h: 600 an .empty > b setzt 3.2.3s zusammen mit dem Token.
- [konflikt: .tile .nodata] typografie-3.2.3s gibt `.tile .nodata` font-size var(--fs-15) und line-height var(--lh-15); --lh-15 ist das einheitenlose Verhältnis 20/15. `.tile .nodata.dash` aus zustaende-S-C4 erbt die Wertgröße (font-size: inherit, 24 px) und bekäme damit eine 32-px-Zeile statt 26,4. Kacheln mit „—“ würden höher als ihre Nachbarn, entgegen „Werte je Reihe ±1 px“. Deshalb erbt .nodata.dash auch die Zeilenhöhe.

## komponenten-S-day-d · „Tagesnotiz anlegen“ im Leerzustand neutral

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: zustaende-14
Quelle: audit/spec/komponenten.md Z. 661–662 · Dateien: web/js/screens/day.js
Abhängig von: komponenten-C11

```text
- Z. 19 „Tagesnotiz anlegen“ (Leerzustand) `btn sm primary` → `btn sm`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.

## komponenten-S-trades-b · TradeLog-Leerzustand „Trade loggen“ neutral

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: zustaende-14
Quelle: audit/spec/komponenten.md Z. 719–719 · Dateien: web/js/screens/trades.js
Abhängig von: komponenten-C11

```text
- Z. 45 Leerzustand „Trade loggen“ `btn sm primary` → `btn sm`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- [konflikt: .btn.accent] .btn.accent steht nur noch für „Trade loggen“ (App.newTradeButton `.btn.accent.tl` und der runde Handy-Knopf). Aktiver Dashboard-Filter: Klasse `is-on`. So steht es in zustaende-S-D2/-S-C7, kollisionsfrei und im gemeinsamen Ausgewählt-Stil. farbe-C19b/-B25 nennen denselben Zustand `.dh-context .btn.is-set`; das entfällt. Das aria-label „Filter ({0} aktiv)“ aus farbe-C19b bleibt. TradeLog-Leerzustand „Trade loggen“: neutral `btn sm` (komponenten-S-trades-b). Gründe: Die Kopfreihe trägt „Trade loggen“ schon, die Farbe-Spezifikation selbst verlangt „1 je Ansicht“, BRIEF spricht von dem einen Hauptknopf, und Leerzustand-Aktionen sind btn sm. „Trade für diesen Tag“ entfällt (wording-S8.1-8.2). Damit ist jedes .btn.accent ein Hauptknopf: `.btn.accent` font-weight 600 → 700 direkt, ohne eigene Regel `.btn.accent.tl`; die wäre eine wirkungslose Doppelregel. Der aktive Filter (is-on) bleibt 500 wie jeder Knopf, also nicht fetter.
- [konflikt: .empty] Leerzustände entstehen nur über U.empty bzw. U.chartEmpty, ohne Inline-Stile; das ist die Komponenten-Regel und Leerzustand A der Gruppe Zustände. Im Reiter Verlauf (Importe/Änderungen) zeigt ein leerer Reiter deshalb U.empty wie der TradeLog (min-height 180 aus .empty). Ein handgeschriebenes `.empty` mit `min-height:140px` in einer `.tbl-wrap`-Hülle entfällt. Der Knopf in komponenten-S-trades-b ist neutral (siehe .btn.accent). zustaende-S-C4 ergänzt nur Stile und ist verträglich.

## komponenten-S-prop-a · Prop: Leerzustand-Aktion btn sm, „Als bestanden markieren“ neutral

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: zustaende-14, komponenten-1
Quelle: audit/spec/komponenten.md Z. 694–696 · Dateien: web/js/screens/prop.js
Abhängig von: komponenten-C11

```text
**S-prop (prop.js)** (hierarchie-28, responsiv-46, zustaende-14, komponenten-1, komponenten-30, bereich_prop-18, komponenten-18)
- Z. 82 Leerzustand `class="btn primary"` → `class="btn sm"`.
- Z. 97 „Als bestanden markieren“ `btn sm primary` → `btn sm`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
