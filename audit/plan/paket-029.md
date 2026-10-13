# Paket 029 · konto

Schritte: 28 · Dateien: web/css/app.css, web/js/certificate.js, web/js/screens/affiliate.js, web/js/screens/coach.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 affiliate 390 (Ref-Code vollständig sichtbar); e2e/certtest.js:36 ([data-c=prev], .cert-opts .small.muted); e2e/coachtest.js:111, :154, :178; e2e/coachtest.js:127–131; e2e/coachtest.js:131 (.ct-done summary „1 erledigt“); e2e/coachtest.js:150; e2e/coupontest.js:14; web/e2e/affiliatetest.js; web/e2e/affiliatetest.js:15-16; web/e2e/affiliatetest.js:42; web/e2e/affiliatetest.js:42–55; web/e2e/affiliatetest.js:51 (Texte „Offen“/„Ausgezahlt“ bleiben); web/e2e/calmnavtest.js:44; web/e2e/coachtest.js; web/e2e/coachtest.js (Beitritt, Handy ohne Querscrollen); web/e2e/coachtest.js:81, :110 (Klasse is-new bleibt); web/e2e/coupontest.js
Baut auf Paketen auf: 1, 2, 4, 5, 6, 10

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C8b · Affiliate: Namens-Hover neutral mit Unterstrich

Gruppe farbe · Cluster konto · Aufwand S · Befunde: bereich_konto-6
Quelle: audit/spec/farbe.md Z. 415–416 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2678 `.aff-name:hover { color: var(--accent); }` → `.aff-name:hover { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`

```

## farbe-C9 · Coach: Namens-Hover, Symbole, gewählte Option, Häkchen neutral; „Neu“-Rand und -Streifen löschen

Gruppe farbe · Cluster konto · Aufwand S · Befunde: bereich_konto-2, bereich_konto-4, bereich_konto-6
Quelle: audit/spec/farbe.md Z. 417–425 · Dateien: web/css/app.css
Abhängig von: —

```text
**C9 – `web/css/app.css` Coach** — bereich_konto-2, bereich_konto-4, bereich_konto-6
- Z. 2861 `a.coach-name:hover { color: var(--accent); }` → `{ color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`
- Z. 2871 `.coach-entry.is-new { … }` löschen
- Z. 2893 `.coach-join-head .ico svg { …; color: var(--accent); }` → `color: var(--text-2);`
- Z. 2898 `.coach-yes svg { …; color: var(--accent); }` → `color: var(--text-2);` (Z. 2900 `.coach-no svg` bleibt `--faint`)
- Z. 2903 `.coach-radio:has(input:checked) { border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); background: color-mix(in srgb, var(--accent) 6%, var(--surface-2)); }` → `.coach-radio:has(input:checked) { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); border-color: color-mix(in srgb, var(--text) 22%, var(--border-2)); box-shadow: none; }` (eigene Regel, nicht in die gemeinsame Liste; dort würde `:has()` in alten Browsern die ganze Liste ungültig machen)
- Z. 2904 `.coach-radio input { margin-top: 3px; accent-color: var(--accent); }` → `accent-color: var(--text);`
- Z. 2917 `.mn-reply.is-new { box-shadow: inset 2px 0 0 var(--accent); }` löschen

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .coach-join-head .ico svg] Das Ergebnis lautet `.coach-join-head .ico svg { width: 34px; height: 34px; color: var(--faint); }`, dazu die gemeinsame Zentrierregel aus abstaende-D8. Einrichtungs- und Beitrittskarten bekommen eine einheitliche Bauart: Symbol 34 px, --faint, mittig, wie im Mentor-Setup und in den Leerzuständen. Kein Grün, damit ist auch das Ziel von farbe-C9 erfüllt.
- ÄNDERN: Den Punkt zu Z. 2893 (`.coach-join-head .ico svg` → --text-2) streichen, das setzt abstaende-D8. Den Punkt zu Z. 2904 ebenfalls streichen (siehe Anker .coach-radio input). Die Punkte zu Z. 2861, 2871, 2898, 2903 und 2917 bleiben.
- [doppelt: .coach-radio input] Das Ergebnis lautet `.coach-radio input { margin-top: 3px; accent-color: var(--text); }`. Gesetzt wird das von komponenten-C17a, das alle nativen Häkchen und Optionsfelder in einem Zug neutral stellt.
- ÄNDERN: Den Punkt zu Z. 2904 (`accent-color: var(--text)`) streichen, das übernimmt komponenten-C17a.

## farbe-C16 · Affiliate: Balken --profit, „Ausgezahlt“ als ruhiger Text

Gruppe farbe · Cluster konto · Aufwand S · Befunde: farbe_kontrast-20, bereich_konto-8
Quelle: audit/spec/farbe.md Z. 452–455 · Dateien: web/js/screens/affiliate.js
Abhängig von: —

```text
**C16 – `web/js/screens/affiliate.js`** — farbe_kontrast-20, bereich_konto-8
- Z. 47 `fill="var(--accent)"` → `fill="var(--profit)"`
- Z. 67 `<td>${U.pill(paid ? 'Ausgezahlt' : 'Offen', paid ? 'win' : 'neutral')}</td>` → `<td>${paid ? '<span class="muted">Ausgezahlt</span>' : U.pill('Offen', 'neutral')}</td>`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: --text-2] Affiliate-Balken (affiliate.js:47) neutral nach diagramme-K1: `<path class="br" d="${U.vbarPath(x(i) - bw / 2, bw, y(0), m.v > 0 ? Math.min(y(m.v), y(0) - 2) : y(0))}" fill="var(--text-2)" fill-opacity=".45" data-tip="…unverändert…"></path>`, in beiden Ansichten, ohne Hover-Stil. farbe-C16 wollte `fill="var(--profit)"`. Grund: Grün nur für Gewinn/positiv (BRIEF). Die Balken zeigen Beträge ohne Vorzeichen, in der Betreiber-Ansicht sind Provisionen Kosten, Grün wäre dort falsch. Mengenbalken sind app-weit --text-2 .45 (diagramme A-8). Die Zeile „Affiliate-Balken --profit“ in farbe 1.9 gilt damit nicht. Die übrigen --text-2-Stellen dieses Ankers (barrierefreiheit-A2b Fokusrand, diagramme-A1 text.bv, E5 PV.line, E8b Trefferquote-Reihe) nutzen nur das Token und sind verträglich. zustaende-S-C9c ist über die .lang-card-Anker erledigt.
- [konflikt: U.pill] „Heute“ in der Tagesansicht wird `U.pill('Heute', 'neutral')` (farbe-C20; BRIEF: Grün nur für Gewinn und „Trade loggen“). Weil die Datumszeile im Inhalt bleibt (siehe ctx.headLeft), setzt farbe-C20 das direkt in day.js:12 um; die Pille mit 'win' aus abstaende-E-day2 entfällt. Die übrigen Pillen sind verträglich: aufbau-C3 „Beispieldaten“ neutral, farbe-C16 „Ausgezahlt“ als .muted-Text, farbe-C17a und kilook-C21 Coach-Pillen neutral (U.pill ohne Art ist neutral), farbe-C22b „Aktiv“, farbe-C26a „geprüft“ und Status. responsiv-3.12c übernimmt die Statusart der Payout-Zeile.
- [konflikt: --accent] Affiliate-Balken (affiliate.js Z. 47): neutral nach diagramme-K1, also `<path class="br">` mit fill var(--text-2) und fill-opacity .45. Das gilt auch gegen farbe-C16 (--profit). Gründe: Provisionen sind immer ≥ 0, Grün trüge keine Unterscheidung. Die Farbe-Regel selbst sagt „Spalten mit einheitlichem Vorzeichen neutral“, und diagramme A-8 nennt Provisionen ausdrücklich neutral. Fokusring: barrierefreiheit-A2a (--focus = Textfarbe) gilt. Der README-Satz in farbe-D3e wird unter Anker .btn.primary angepasst. Die übrigen Schritte ändern verschiedene Stellen und sind untereinander verträglich. Ihre Einzelkonflikte stehen unter eigenen Ankern (.popover .item[aria-checked], .activity/.tracker/.heat-legend, .dp-day.today/.rr-day.today, .set-tabs/.prop-sub).
- VERBINDLICH (Kreuzprüfung): affiliate.js, nur noch Z. 67: `<td>${U.pill(paid ? 'Ausgezahlt' : 'Offen', paid ? 'win' : 'neutral')}</td>` → `<td>${paid ? '<span class="muted">Ausgezahlt</span>' : U.pill('Offen', 'neutral')}</td>`. Z. 47 (`fill="var(--profit)"`) entfällt. Die Balken setzt diagramme-K1 neutral als `<path class="br">` mit `fill="var(--text-2)" fill-opacity=".45"` in beiden Ansichten. Die Zeile „Affiliate-Balken --profit“ in farbe 1.9 gilt damit nicht mehr.

## farbe-C17a · Coach: Knöpfe ohne primary, Pillen „Neu“/„{n} neu“ neutral, kein .accent, Haken muted, „0“ muted

Gruppe farbe · Cluster konto · Aufwand S · Befunde: bereich_konto-3, bereich_konto-4, bereich_konto-6, komponenten-8, farbe_kontrast-26, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 456–462 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
**C17 – `web/js/screens/coach.js`** — bereich_konto-3, bereich_konto-4, bereich_konto-6, komponenten-8, farbe_kontrast-26, farbe_kontrast-11
- Z. 22 `class="btn primary" href="#/settings/mentor"` → `class="btn"` (navigiert, Regel 1.4)
- Z. 35 `U.pill('Neu', 'win')` → `U.pill('Neu')`
- Z. 48 `<b class="accent">${unread} ungelesen</b>` → `<b>${unread} ungelesen</b>`
- Z. 53 `class="btn sm primary"` („+ Gruppe“) → `class="btn sm"`
- Z. 86 `<span class="accent">${I.check}</span>` → `<span class="muted">${I.check}</span>`
- Z. 87 `U.pill(`${r.new} neu`, 'win')` → `U.pill(`${r.new} neu`)`; `'<span class="faint">0</span>'` → `'<span class="muted">0</span>'`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pill] „Heute“ in der Tagesansicht wird `U.pill('Heute', 'neutral')` (farbe-C20; BRIEF: Grün nur für Gewinn und „Trade loggen“). Weil die Datumszeile im Inhalt bleibt (siehe ctx.headLeft), setzt farbe-C20 das direkt in day.js:12 um; die Pille mit 'win' aus abstaende-E-day2 entfällt. Die übrigen Pillen sind verträglich: aufbau-C3 „Beispieldaten“ neutral, farbe-C16 „Ausgezahlt“ als .muted-Text, farbe-C17a und kilook-C21 Coach-Pillen neutral (U.pill ohne Art ist neutral), farbe-C22b „Aktiv“, farbe-C26a „geprüft“ und Status. responsiv-3.12c übernimmt die Statusart der Payout-Zeile.
- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- ÄNDERN: Die Knopf-Teile an Z. 22 und Z. 53 entfallen (komponenten-S-coach-b). Z. 129/140/148 werden wie in S-coach-b `btn sm`. Pillen „Neu“/„{n} neu“, `.accent` → normal, Haken muted und „0“ muted bleiben.

## typografie-3.2.5e · Kopier-Link im Ticket: .cpn-code.is-link 13/500 ohne Sperrung

Gruppe typografie · Cluster konto · Aufwand S · Befunde: bereich_konto-31
Quelle: audit/spec/typografie.md Z. 363–363 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
| `.cpn-code`, neu nach Z. 2655 | `.cpn-code.is-link { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; letter-spacing: 0; }` | bereich_konto-31 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .cpn-code] .cpn-code bekommt font-weight 600 und letter-spacing .08em (aufbau-C5b). Onest, 14px und der gestrichelte Rahmen bleiben. Das Link-Ticket erhält die Klasse is-link (typografie-3.8r) mit `.cpn-code.is-link { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; letter-spacing: 0; }` (typografie-3.2.5e), das überschreibt die Basis. Begründung: Laut Brief bekommen nur Werte und Hauptknöpfe 700, und der Code ist keins von beiden. .08em wurde mit einer Vorher/Nachher-Aufnahme geprüft (extra/cpn-review-*-1440.png) und wirkt ruhiger. Die Festlegung „Coupon-Code +0.12em (bleibt)“ in Typografie 1.7 ist damit ersetzt: Es gilt .08em. Bei .cpn-off ändert sich nur die Farbe auf --text-2. 13,5 px ist in der Text-Skala verboten, deshalb bleibt die Größe 13 px, und typografie-3.2.3l macht daraus das Token --fs-13.

## typografie-3.8r · Affiliate-Ticket: Link-Ticket bekommt Klasse is-link

Gruppe typografie · Cluster konto · Aufwand S · Befunde: bereich_konto-31
Quelle: audit/spec/typografie.md Z. 443–443 · Dateien: web/js/screens/affiliate.js
Abhängig von: typografie-3.2.5e

```text
| affiliate.js:52 (`ticket`) | `class="cpn-code"` → `class="cpn-code${kind === 'link' ? ' is-link' : ''}"` | bereich_konto-31 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .cpn-code] .cpn-code bekommt font-weight 600 und letter-spacing .08em (aufbau-C5b). Onest, 14px und der gestrichelte Rahmen bleiben. Das Link-Ticket erhält die Klasse is-link (typografie-3.8r) mit `.cpn-code.is-link { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; letter-spacing: 0; }` (typografie-3.2.5e), das überschreibt die Basis. Begründung: Laut Brief bekommen nur Werte und Hauptknöpfe 700, und der Code ist keins von beiden. .08em wurde mit einer Vorher/Nachher-Aufnahme geprüft (extra/cpn-review-*-1440.png) und wirkt ruhiger. Die Festlegung „Coupon-Code +0.12em (bleibt)“ in Typografie 1.7 ist damit ersetzt: Es gilt .08em. Bei .cpn-off ändert sich nur die Farbe auf --text-2. 13,5 px ist in der Text-Skala verboten, deshalb bleibt die Größe 13 px, und typografie-3.2.3l macht daraus das Token --fs-13.

## typografie-3.8s · Affiliate-Tabelle: Datumszelle num; Coach-Sichtbarkeitstabelle ohne Änderung (über 3.2.2 Satoshi)

Gruppe typografie · Cluster konto · Aufwand S · Befunde: typografie-12, bereich_konto-34
Quelle: audit/spec/typografie.md Z. 444–446 · Dateien: web/js/screens/affiliate.js, web/js/screens/coach.js
Abhängig von: typografie-3.2.2f

```text
| affiliate.js:67 | `<td class="nowrap">${fmt.dateFull(…)}</td>` → `<td class="nowrap num">…` | typografie-12, bereich_konto-34 |
| coach.js:25 | keine Änderung; die Sichtbarkeits-Tabelle wird durch 3.2.2 Satoshi | bereich_konto-34 |

```

## abstaende-D8 · Einrichten- und Beitrittskarten: .mentor-setup-Polster, Symbole mittig 34 px --faint (Mentor und Coach), .coach-join 680 mittig, .coach-co-what ohne eigene Breite, Einladungshinweis im Dialog volle Zeile

Gruppe abstaende · Cluster konto · Aufwand M · Befunde: bereich_konto-1, zustaende-15, bereich_konto-53, bereich_konto-46
Quelle: audit/spec/abstaende.md Z. 375–375 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D8 | Mentor/Coach-Einrichtung Z. 2340–2341, 2891, 2893, 2953 | Z. 2340 `.mentor-setup { text-align: center; padding: 44px 24px; }` → `padding: var(--sp-10) var(--sp-6)`. Z. 2341 → `.mentor-setup .ico, .coach-join-head .ico { display: flex; justify-content: center; } .mentor-setup .ico svg { width: 34px; height: 34px; color: var(--faint); }`. Z. 2891 `.coach-join { padding: 22px 24px; }` → `.coach-join { width: 100%; max-width: var(--w-single); margin-inline: auto; padding: var(--sp-6); }`. Z. 2893 `.coach-join-head .ico svg { width: 36px; height: 36px; color: var(--accent); }` → `width: 34px; height: 34px; color: var(--faint);`. Z. 2953 `.coach-co-what`: `max-width: 640px; margin: 0 auto;` streichen. Neu: `.modal .coach-invite > .small { flex-basis: 100%; }` | bereich_konto-1, zustaende-15, bereich_konto-53, bereich_konto-46 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .mentor-setup] mentor.js Z. 79 schreibt allein wording-S15.4-15.5 neu, und zwar so: `<div class="mentor-wrap"><section class="card mentor-setup"><span class="ico">${I.chat}</span><h2>Mentor-Chat einrichten</h2><p class="muted">Der Mentor läuft über deinen Journalyst-Server, damit der API-Schlüssel nie im Browser liegt. Trage unter Einstellungen → Server die Adresse und das Zugangstoken ein.</p><a class="btn" href="#/settings/mentor">Server einrichten</a></section></div>`. Die Zeile „Anleitung zum Server: server/README.md im Projekt.“ fällt ersatzlos weg, weil Pfade laut wording W11 nur unter Einstellungen → Server stehen. Damit entfallen auch der Klassenwechsel `small faint → small muted` aus farbe-C21 an dieser Zeile und der einzige Inline-Abstand in mentor.js (`style="margin-top:14px"`), den abstaende-MENTOR ersetzen wollte. Der Knopf wird ein neutrales `.btn`, denn er navigiert nur, und Grün bleibt „Trade loggen“ vorbehalten. Das CSS der Karte aus abstaende-D8 (`padding: var(--sp-10) var(--sp-6)`, Symbol mittig) gilt unverändert. mentortest.js:22 (`.mentor-setup h2`, `.mentor-setup a[href="#/settings/mentor"]`) bleibt grün.
- [konflikt: .mentor-setup .ico svg] Das Ergebnis lautet `.mentor-setup .ico, .coach-join-head .ico { display: flex; justify-content: center; } .mentor-setup .ico svg { width: 34px; height: 34px; color: var(--faint); }` (abstaende-D8). Begründung: Die Einrichtungskarte weist auf eine noch nicht eingerichtete Funktion hin. Sie ist damit dieselbe Bauart wie ein Leerzustand (Symbol 34 px --faint, siehe zustaende Z1 und komponenten LEER). farbe erlaubt --faint ausdrücklich für leere oder inaktive Symbole. Das Ziel von farbe-C6, kein Grün am Symbol, ist damit ebenfalls erfüllt.
- [konflikt: .coach-join-head .ico svg] Das Ergebnis lautet `.coach-join-head .ico svg { width: 34px; height: 34px; color: var(--faint); }`, dazu die gemeinsame Zentrierregel aus abstaende-D8. Einrichtungs- und Beitrittskarten bekommen eine einheitliche Bauart: Symbol 34 px, --faint, mittig, wie im Mentor-Setup und in den Leerzuständen. Kein Grün, damit ist auch das Ziel von farbe-C9 erfüllt.

## abstaende-N1 · Coach-Einrichtung: coach-wrap narrow, Knopf „Zu den Einstellungen“ ohne Symbol

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: zustaende-15, bereich_konto-24
Quelle: audit/spec/abstaende.md Z. 477–481 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12, abstaende-D8

```text
### web/js/screens/coach.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| N1 | Z. 22 | `<div class="coach-wrap">` → `<div class="coach-wrap narrow">`. Im Knopf `${I.settings} Zu den Einstellungen` → `Zu den Einstellungen` | zustaende-15, bereich_konto-24 |
```

## abstaende-N2 · Coach-Übersicht: coach-wrap wide → coach-wrap (volle Breite links)

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-24
Quelle: audit/spec/abstaende.md Z. 482–482 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12

```text
| N2 | Z. 117 | `coach-wrap wide` → `coach-wrap` | bereich_konto-24 |
```

## abstaende-N3 · Coach-Journal: coach-wrap read (Lesespalte 920)

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-24
Quelle: audit/spec/abstaende.md Z. 483–483 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12

```text
| N3 | Z. 156 | `<div class="coach-wrap">` → `<div class="coach-wrap read">` | bereich_konto-24 |
```

## abstaende-N4 · Coach-Beitritts- und Zustandsansichten (Z. 167–187): coach-wrap narrow

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-24, bereich_konto-53
Quelle: audit/spec/abstaende.md Z. 484–484 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12

```text
| N4 | Z. 167, 168, 169, 171, 184, 186, 187 | `<div class="coach-wrap">` → `<div class="coach-wrap narrow">` | bereich_konto-24, bereich_konto-53 |
```

## abstaende-N5 · Beitrittskarte: Inline margin-top/max-width → Klasse mt-4

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-53
Quelle: audit/spec/abstaende.md Z. 485–485 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-A6, abstaende-D8

```text
| N5 | Z. 196 | `style="margin-top:14px;max-width:420px"` → Klasse `mt-4` (ohne max-width) | bereich_konto-53 |
```

## abstaende-N6 · Co-Coach-Einladungsdialog: { cls: 'wide' } → { cls: 'narrow' }

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-46
Quelle: audit/spec/abstaende.md Z. 486–487 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-D8

```text
| N6 | Z. 265 | `{ cls: 'wide' }` → `{ cls: 'narrow' }` | bereich_konto-46 |

```

## abstaende-O1 · Provisions-Dialog: Untertitel und Feld in .stack (12 px); Zahlenpfeile über globale Regel aus komponenten-16 (anlegen, falls noch nicht vorhanden)

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-47
Quelle: audit/spec/abstaende.md Z. 488–493 · Dateien: web/js/screens/affiliate.js, web/css/app.css
Abhängig von: abstaende-A3

```text
### web/js/screens/affiliate.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| O1 | Z. 92 | `<p class="muted small no-i18n">…</p><div class="field">…</div>` in `<div class="stack">…</div>` fassen (12 px zwischen Untertitel und Feld). Die Zahlenpfeile entfernt die globale Regel aus komponenten-16. Falls sie noch nicht da ist (`grep -n "inner-spin-button" web/css/app.css` findet keine globale `input[type=number]`-Regel), diese Regel aus komponenten-16 jetzt anlegen. | bereich_konto-47 |

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: input[type=number]] Die globale Regel gegen Browser-Pfeile legt allein komponenten-C02 an, nach Z. 294: `input[type=number] { -moz-appearance: textfield; appearance: textfield; }` plus `::-webkit-inner/outer-spin-button { -webkit-appearance: none; margin: 0; }`. abstaende-O1 baut darauf auf und setzt nur den affiliate.js-Teil um, also Untertitel und Feld in `.stack`.
- ÄNDERN: Nur affiliate.js Z. 92 (`.stack`) umsetzen; den app.css-Teil (Zahlenpfeile) weglassen, ihn liefert komponenten-C02.

## komponenten-C17b · Coach-Aufgaben: Nur-Anzeige-Kästchen ohne Rand und Füllung

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-23
Quelle: audit/spec/komponenten.md Z. 317–318 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2932 `.ct-check[aria-checked="true"], .coach-task.done .ct-check.static { … }` → nur `.ct-check[aria-checked="true"] { … }`
- Z. 2933 `.ct-check.static { cursor: default; }` → `.ct-check.static, .ct-check.static:hover { cursor: default; border-color: transparent; background: none; color: var(--text-2); }`
```

## komponenten-C32a · Coach: Haken in „Kurz-Stats“ schrumpft nicht

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-36
Quelle: audit/spec/komponenten.md Z. 459–460 · Dateien: web/css/app.css
Abhängig von: —

```text
**C32 – Coach-Kleinigkeiten** (bereich_konto-36, bereich_konto-50, bereich_konto-22, bereich_konto-45)
- Nach Z. 2900 neu: `.coach-yes, .coach-no { align-items: flex-start; } .coach-yes svg, .coach-no svg { flex: none; margin-top: 2px; }`
```

## komponenten-C32b · Coach „1 erledigt“ mit CSS-Chevron statt ▸/▾

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-50
Quelle: audit/spec/komponenten.md Z. 461–461 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2937–2938 (`.ct-done summary::before`, `[open] … ::before`) löschen; neu: `.ct-done summary { display: inline-flex; align-items: center; gap: 5px; }`. Z. 2310 → `.rp-more summary::after, .ct-done summary::after { … }`; Z. 2311 → `.rp-more[open] summary::after, .ct-done[open] summary::after { … }`
```

## komponenten-C32c · Coach-Antwortfelder ohne Größen-Griff, wachsen bis 160 px (CSS)

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-22
Quelle: audit/spec/komponenten.md Z. 462–462 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2879 `.ce-write textarea { … resize: vertical; … }` und Z. 2923 `.mr-write textarea { … resize: vertical; … }` → `resize: none; field-sizing: content; max-height: 160px;` (min-height 44 bzw. 34 bleibt). `.mn-edit` bleibt `resize: vertical`.
```

## komponenten-C32d · Coach-Gruppenmenü einzeilig

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-45
Quelle: audit/spec/komponenten.md Z. 463–464 · Dateien: web/css/app.css
Abhängig von: —

```text
- Neu: `#pop-coachmenu .item { white-space: nowrap; }`

```

## komponenten-C33b · Coupon-Link in --text-2, unten bündig

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-49
Quelle: audit/spec/komponenten.md Z. 471–472 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2657 `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 12.5px; color: var(--muted); text-decoration: none; transition: … }` → `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: auto; padding-top: 6px; font-size: 12.5px; color: var(--text-2); text-decoration: none; transition: color var(--dur-2) var(--ease); }`; Z. 2658 bleibt.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .cpn-link] Das Ergebnis lautet `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: auto; padding-top: var(--sp-1); font-size: var(--fs-12); line-height: var(--lh-12); color: var(--text-2); text-decoration: none; transition: color var(--dur-2) var(--ease); }`. Z. 2658/2659 bleiben. Begründung: 12,5 px ist laut typografie verboten, und der Fußlink ist Hilfstext der Stufe 12. Für das Polster gilt die Skala (abstaende: Abstände nur als var(--sp-n)). Zusammen mit `.cpn { gap: var(--sp-1) }` (abstaende-B28) bleibt der Mindestabstand zur Notiz bei etwa 8 px, wie heute (5 + 4). Die transition bleibt so, wie sie in der Datei steht.
- ÄNDERN: Z. 2657 wie oben schreiben: `font-size: var(--fs-12); line-height: var(--lh-12)` statt `12.5px` und `padding-top: var(--sp-1)` statt `6px`. Die transition nicht anfassen.
- ÜBERNIMMT komponenten-S-coupons: Nur eine Prüfung, das Markup bleibt. Wird mit C33b erledigt; coupontest.js:14 (`.cpn-link[target=_blank][rel=noopener]`) muss grün bleiben.

## komponenten-D3 · certificate.js: Format-Segment ohne .sm, eckige Pfeile, Größenhinweis

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: komponenten-26, komponenten-25, komponenten-18
Quelle: audit/spec/komponenten.md Z. 617–621 · Dateien: web/js/certificate.js
Abhängig von: komponenten-C07, komponenten-C14b, komponenten-C05

```text
**D3 – certificate.js** (komponenten-26, komponenten-25, komponenten-18)
- Z. 73 `<div class="seg sm">` → `<div class="seg">`
- Z. 85: beide `class="btn round sm"` → `class="btn nav"`
- Format-Zeile: Labels ohne `<small>` (`[k, v.label]`), direkt nach dem Segment `<div class="hint">${f.w} × ${f.h} px</div>` (`f` = `FORMATS[o.format]`, die Seitenleiste wird bei jedem Formatwechsel neu gerendert).

```

## komponenten-S-coach-a · Coach: Aktualisieren/Abgleichen/Link erneuern mit I.refresh, „Aufgabe an alle“ mit I.plus

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-10
Quelle: audit/spec/komponenten.md Z. 628–631 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
### 3.6 web/js/screens/*.js

**S-coach (coach.js)** (bereich_konto-10, bereich_konto-5, komponenten-1, bereich_konto-45, bereich_konto-49, bereich_konto-22, bereich_konto-9)
- `I.replay` → `I.refresh` in Z. 47, 115, 157 und 265; Z. 121 „Aufgabe an alle“ `${I.check}` → `${I.plus}`.
```

## komponenten-S-coach-b · Coach: Auslöser und Inline-Absenden neutral

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-5, komponenten-1
Quelle: audit/spec/komponenten.md Z. 632–632 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
- Neutral: Z. 22 `<a class="btn primary" href="#/settings/mentor">` → `<a class="btn" …>`; Z. 53 „+ Gruppe“ `btn sm primary` → `btn sm`; Z. 129 „Speichern“ (Notiz bearbeiten) `btn sm primary` → `btn sm`; Z. 140 „Notiz senden“ `btn sm primary` → `btn sm`; Z. 148 „Aufgabe geben“ `btn sm primary` → `btn sm`. Z. 178, 197, 271 bleiben primary.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.

## komponenten-S-coach-d · Coach: „Im Notebook ansehen“ als .tlink

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-49
Quelle: audit/spec/komponenten.md Z. 634–634 · Dateien: web/js/screens/coach.js
Abhängig von: komponenten-C33a

```text
- Z. 48 `<a href="#/notebook">Im Notebook ansehen</a>` → `<a class="tlink" href="#/notebook">Im Notebook ansehen</a>`
```

## komponenten-S-coach-e · Coach: Antwortfelder wachsen (Fallback ohne field-sizing); .input.sm und Zählung bleiben

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-22, bereich_konto-9
Quelle: audit/spec/komponenten.md Z. 635–638 · Dateien: web/js/screens/coach.js
Abhängig von: komponenten-C32c, komponenten-C03

```text
- Z. 296 (`coach-note-draft`) und Z. 313 (`coach-reply-draft`) als erste Anweisung: `if (!(window.CSS && CSS.supports('field-sizing', 'content'))) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight + 2, 160) + 'px'; }`
- Die 5 Felder `class="input sm"` (Z. 77, 109, 148 zweimal, 263) bleiben, sie bekommen ihre Höhe aus C03.
- Z. 66 bleibt (Zählung „1 erledigt“/„n erledigt“).

```

## aufbau-A4c · Coach-Eintrag: Editor-Überschriften kleiner als .ce-title

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: bereich_konto-20
Quelle: audit/spec/aufbau.md Z. 285–289 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 2876 neu:
  ```css
  .ce-body .ql-editor h1 { font-size: 16px; } .ce-body .ql-editor h2 { font-size: 15px; } .ce-body .ql-editor h3 { font-size: 14.5px; }
  .ce-body .ql-editor :is(h1, h2, h3) { margin: 10px 0 4px; font-weight: 600; }
  ```
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .ce-title] .ce-title wird 18/600 (typografie-3.2.3t: var(--fs-18)/var(--lh-18)), der Eintragstext .ce-body 14 px (typografie 14.5 → 14). Die Editor-Überschriften im Coach-Eintrag kommen nur aus der Skala: h1 var(--fs-15), h2 und h3 var(--fs-14), alle 600 in --text. Abstand var(--sp-2) davor und var(--sp-1) danach, die erste Überschrift ohne Abstand oben. Die Zeilenhöhe 1.25 kommt aus der Editor-Regel der Typografie (kein --lh-N). Grund: 16 px liegt nicht in der Skala, 14.5 px ist verboten. Die Überschriften bleiben trotzdem kleiner als der Eintragstitel (aufbau Grundsatz 4). Der Abstand entspricht der Tagesnotiz-Vorschau .nv-h (8 px davor, zustaende-S-C18). Die Regeln stehen nach Z. 2876, also hinter zustaende-S-C17 (`.ql-snow .ql-editor h1–h3`, gleiche Spezifität 0,2,1, .ce-body trägt ql-snow), und gewinnen dadurch.
- ÄNDERN: Statt 16/15/14.5 px nach Z. 2876 einfügen: `.ce-body .ql-editor h1 { font-size: var(--fs-15); } .ce-body .ql-editor h2, .ce-body .ql-editor h3 { font-size: var(--fs-14); } .ce-body .ql-editor :is(h1, h2, h3) { margin: var(--sp-2) 0 var(--sp-1); font-weight: 600; color: var(--text); } .ce-body .ql-editor > :is(h1, h2, h3):first-child { margin-top: 0; }`. Keine eigene line-height.

## aufbau-C3 · Affiliate: Steuerung in die Kopfreihe, Marke „Beispieldaten“, ohne Trade/Session, Kachel „Creator“ weg

Gruppe aufbau · Cluster konto · Aufwand M · Befunde: hierarchie-45, bereich_konto-37, bereich_konto-29, responsiv-19, aufbau-6, ki_look-22
Quelle: audit/spec/aufbau.md Z. 432–440 · Dateien: web/js/screens/affiliate.js, web/css/app.css
Abhängig von: aufbau-B11

```text
#### `web/js/screens/affiliate.js`

**C3** · hierarchie-45, bereich_konto-37, bereich_konto-29, responsiv-19, aufbau-6, ki_look-22
- Z. 73 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false, trade: false }, /* Konto-Menü-Seite: keine Handelsknöpfe, „Trade loggen“ gibt es auf allen Seiten der Navigation */`
- Neu im Screen-Objekt: `actions: () => U.pill('Beispieldaten', 'neutral'),`
- `render(ctx)` Z. 79–80: `const top = …; return `<div class="aff">${top}…`` → `ctx.headLeft = nav(view) + pick; return `<div class="aff">${view === 'creator' ? creator(d, c) : admin(d)}</div>`;` (kein `data-subnav` an der Navigation, sonst blendet app.css:116–117 falsch ein)
- `admin` Z. 57: `${U.tile('Creator', String(d.creators.length))}` streichen. Kartentitel bleibt „Creator“ ohne Zahl.
- `web/css/app.css`: Z. 2663–2664 (`.aff-top`, `.aff-top .grow`) löschen; Z. 2987 `.aff-top .aff-pick { flex: 1; min-width: 0; }` → `.page-head .aff-pick { flex: 1; min-width: 0; }`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.tile] (1) Statistik → Tage (aufbau-C14d): Die Kacheln folgen der Farb- und Vorzeichenregel. „Gewinntage / Verlusttage“ wird nur bei > 0 gefärbt (`<span class="${ds.winDays ? 'pos' : ''}">…</span> / <span class="${ds.lossDays ? 'neg' : ''}">…</span>`, farbe-C30). „Ø Gewinntag“ wird `U.pnl(ds.avgWinDay)`, „Ø Verlusttag“ `U.pnl(ds.avgLossDay)`: Ergebnisse tragen ein Vorzeichen (kilook Z5b), avgLossDay ist negativ. Die Karte „P&L nach Wochentag“ entfällt mit aufbau-C14d und damit auch wording 10.3. (2) Statistik → Fehler: Kachel 1 behält das Vorzeichen `fmt.cur(mr.cost, { signed: true })`, die Klasse richtet sich nach dem Vorzeichen (neg/pos/neu). Die Beschriftung wechselt nach wording zwischen „Fehler haben gekostet“ und „Fehler haben eingebracht“. farbe K13 („Disziplin-Kosten überall mit Vorzeichen“, ausdrücklich auch für Statistik → Fehler) und kilook Z5b gehen vor; die Prüfzeile in wording (stats_mistakes.png) lautet dann „mit Minus“. (3) Affiliate: Die Kacheln behalten die Cent, kein moneyK (Begründung unter fmt.balance). Die Begriffe aus wording 13.3–13.7 bleiben, die Kachel „Creator“ entfällt (aufbau-C3). (4) Schatten-Ich, Kachel „Echt“: Fuß mit U.count. (5) Prop-Summe siehe summaryTiles, Monte Carlo siehe fmt.cur. Verträglich sind farbe-C27, wording 12.28, wording-S11.6-11.11 und wording-S15.10-15.15.
- [konflikt: ctx.headLeft] Tagesansicht: Die Datumszeile bleibt im Inhalt, ohne ctx.headLeft. aufbau K4 hat genau diese Variante verworfen, weil Datumstitel und Konto-Filter in einer Reihe vermischt würden, und sie hängt an F1 (komponenten-3/bereich_shell-8). Die Knöpfe „Check-in“ und „Trade für diesen Tag“ entfallen mit aufbau-C7b, „Zertifikat“ bleibt dort mit I.award, die Pille „Heute“ ist neutral (farbe-C20). Von abstaende-E-day2 bleibt nur der Inline-Stil des Datumstitels als Klasse: `<h2 class="day-title">` mit `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }` (h2-Rolle 18/600, einzige Definition; .day-title in komponenten-C36 entfällt). Trade-Ansicht: Links steht der Rückweg per ctx.headLeft (aufbau-C15d). Die Seitenaktionen aus wording 9.11 kommen nicht in die Rückweg-Zeile, sondern als `actions(ctx)` rechts in die Kopfreihe; die Aufbau-Regel lautet „rechts Seitenaktionen → .dh-sep → Trade loggen“. Bei ctx.params[0]: Notiz-Knopf (`btn`, „Notiz öffnen“ bzw. „Notiz im Notebook“), `btn danger` „Löschen“, `btn` „Trade bearbeiten“ (Seitenebene = btn, nicht primary); ohne Trade-Datensatz ''. Ohne Parameter bleibt „CSV importieren“. pageHead (aufbau-B1), News (aufbau-C9a) und Affiliate (aufbau-C3) bleiben unverändert.
- [konflikt: U.pill] „Heute“ in der Tagesansicht wird `U.pill('Heute', 'neutral')` (farbe-C20; BRIEF: Grün nur für Gewinn und „Trade loggen“). Weil die Datumszeile im Inhalt bleibt (siehe ctx.headLeft), setzt farbe-C20 das direkt in day.js:12 um; die Pille mit 'win' aus abstaende-E-day2 entfällt. Die übrigen Pillen sind verträglich: aufbau-C3 „Beispieldaten“ neutral, farbe-C16 „Ausgezahlt“ als .muted-Text, farbe-C17a und kilook-C21 Coach-Pillen neutral (U.pill ohne Art ist neutral), farbe-C22b „Aktiv“, farbe-C26a „geprüft“ und Status. responsiv-3.12c übernimmt die Statusart der Payout-Zeile.
