# Paket 041 · responsiv, prop, konto

Schritte: 6 · Dateien: web/css/app.css, web/js/screens/coach.js, web/js/screens/prop.js
Betroffene Tests laut Spezifikation: web/e2e/coachtest.js:69, :73, :134 (Zellen per textContent/nth-child, Server nötig); web/e2e/headtest.js (Titelzeile Desktop/1000 px); web/e2e/headtest.js:69 (Handy-Kopfreihe); web/e2e/mobiletest.js: neue Prüfung A5 (Schritt responsiv-3.20a); web/e2e/mobiletest.js:17 (runder Knopf right 16); web/e2e/mobiletest.js:41 (padding-bottom 104px); web/e2e/mobiletest.js:51 (Notebook-Liste: Suche, Filter, Session-Knopf in einer Reihe); web/e2e/mobiletest.js:74-76 (Vorlagen-Menü im Bild); web/e2e/proptest.js; web/e2e/rangetest.js (mob)
Baut auf Paketen auf: 2, 31, 38

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## responsiv-3.12b · Prop → Deine Konten: Kernspalten am Handy, Phase in der Unterzeile, Aktionen bleiben

Gruppe responsiv · Cluster prop · Aufwand S · Befunde: bereich_prop-22
Quelle: audit/spec/responsiv.md Z. 518–518 · Dateien: web/js/screens/prop.js
Abhängig von: responsiv-A1

```text
- Z. 233 Konten: `<table class="tbl compact prop-acc-tbl">` → `<table class="tbl compact prop-acc-tbl ph-fit">`; `th` Phase, Start, Gruppe → `class="ph-hide"`, Trades → `class="r ph-hide"`; zugehörige `td` ebenso; Konto-`td` → `<td class="ph-wrap">`; Unterzeile `<div class="sub">${nameOf(PD.MARKETS, a.market, 'Futures')}</div>` → `<div class="sub">${nameOf(PD.MARKETS, a.market, 'Futures')}<span class="ph-only"> · ${nameOf(PHASES, a.phase)}</span></div>`. Status und Aktionen (Bearbeiten, Löschen) bleiben sichtbar.
```

## responsiv-3.12c · Prop → Ausgaben und Payouts: Kernspalten am Handy mit Unterzeile

Gruppe responsiv · Cluster prop · Aufwand M · Befunde: bereich_prop-21, responsiv-6
Quelle: audit/spec/responsiv.md Z. 519–523 · Dateien: web/js/screens/prop.js
Abhängig von: responsiv-A1

```text
- Z. 263 exRows: Datum-`td` → `<td class="ph-hide">`; Typ-`td` → `<td class="ph-wrap">${nameOf(PD.EXPENSE_TYPES, e.type)}<div class="sub ph-only">${fmt.dateFull(e.date)} · ${a ? esc(accName(a)) : esc(e.firm || '—')}</div></td>`; Firma- und Konto-`td` → `class="ph-hide"`; Notiz-`td` `class="muted"` → `class="muted ph-hide"`.
- Z. 264 Ausgaben-Tabelle `class="tbl compact"` → `class="tbl compact ph-fit"`; `th` Datum, Firma, Konto, Notiz → `class="ph-hide"`.
- Z. 267 poRows: Konto-`td` → `<td class="ph-wrap">${a ? esc(accName(a)) : esc(p.firm || '—')}<div class="sub ph-only">${U.pill(nameOf(PAYOUT_STATUS, p.status), kind)} · <span>Beantragt ${fmt.dateFull(p.requestedAt)}</span></div></td>`; Brutto, Split → `class="r ph-hide"`; Beantragt, Erhalten, Status → `class="ph-hide"`. Netto und Aktionsspalte bleiben.
- Z. 268 Payout-Tabelle `class="tbl compact"` → `class="tbl compact ph-fit"`; `th` Brutto, Split → `class="r ph-hide"`, Beantragt, Erhalten, Status → `class="ph-hide"`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pill] „Heute“ in der Tagesansicht wird `U.pill('Heute', 'neutral')` (farbe-C20; BRIEF: Grün nur für Gewinn und „Trade loggen“). Weil die Datumszeile im Inhalt bleibt (siehe ctx.headLeft), setzt farbe-C20 das direkt in day.js:12 um; die Pille mit 'win' aus abstaende-E-day2 entfällt. Die übrigen Pillen sind verträglich: aufbau-C3 „Beispieldaten“ neutral, farbe-C16 „Ausgezahlt“ als .muted-Text, farbe-C17a und kilook-C21 Coach-Pillen neutral (U.pill ohne Art ist neutral), farbe-C22b „Aktiv“, farbe-C26a „geprüft“ und Status. responsiv-3.12c übernimmt die Statusart der Payout-Zeile.

## responsiv-3.14 · Coach-Schülertabelle: Kernspalten am Handy, tb-hide ≤ 1180 px

Gruppe responsiv · Cluster konto · Aufwand S · Befunde: bereich_konto-13
Quelle: audit/spec/responsiv.md Z. 531–535 · Dateien: web/js/screens/coach.js
Abhängig von: responsiv-A1, responsiv-C4

```text
### 3.14 web/js/screens/coach.js (bereich_konto-13)

- Z. 87 statsRow: erste `td` → `<td class="ph-wrap">`; `td` Profit-Faktor, Max. Drawdown, Letzter Eintrag → `class="r ph-hide"`; `td` Ø Gewinn, Ø Verlust → `class="r tb-hide ph-hide"`.
- Z. 113: `<table class="tbl compact coach-tbl">` → `<table class="tbl compact coach-tbl ph-fit">`; `th` entsprechend (`Profit-Faktor`, `Max. Drawdown`, `Letzter Eintrag` → `r ph-hide`; `Ø Gewinn`, `Ø Verlust` → `r tb-hide ph-hide`).

```

## responsiv-A3 · Eingabefelder am Handy 16 px, .input/.select bleiben 42 px

Gruppe responsiv · Cluster responsiv · Aufwand S · Befunde: responsiv-9, typografie-26
Quelle: audit/spec/responsiv.md Z. 238–246 · Dateien: web/css/app.css
Abhängig von: —

```text
**A3 Eingabefelder 16 px** (responsiv-9, typografie-26)
- Im Block `@media (max-width: 560px)` am **Ende des Blocks** (nach Z. 3059, vor der schließenden Klammer) ergänzen:
  ```css
  /* iOS Safari zoomt bei Feldern unter 16px beim Antippen: alle Felder am Handy 16px (Notiztitel ist größer und bleibt) */
  input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]):not(.note-title), select, textarea { font-size: 16px !important; }
  input.input, select.select { line-height: 20px; } /* einzeilige Felder bleiben 42px hoch */
  ```
- web/app.html:5 bleibt unverändert (kein `maximum-scale`).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .note-title] Im Code passen die drei Schritte zusammen:
- K3 baut den Papierkorb-Kopf mit `<h2 class="note-title">` innerhalb von `.nb`. Dort greift `.nb .note-title` (Z. 1014) und nicht die ungebundene Regel, die C2 löscht. `h2` hat über Z. 90 margin 0.
- `.nb .note-title:focus` (Z. 1028) bleibt.
- responsiv-A3 schließt `.note-title` über die Klasse am Titelfeld aus, die Klasse bleibt im Markup.

Einziger Widerspruch ist ein Wert: Die abstaende-Prüfung 14 erwartet „Titel 34 px“, typografie setzt den Notiz-Titel auf 32/600 (≤ 960: 26, ≤ 560: 24). Verbindlich: Der Papierkorb-Titel ist so groß wie der Titel einer offenen Notiz, also 32 px am Desktop.

## responsiv-A4 · Safe Area und Seitenränder: Titelzeile, Inhalt, runder Knopf

Gruppe responsiv · Cluster responsiv · Aufwand S · Befunde: responsiv-16, responsiv-21, responsiv-15, bereich_shell-31
Quelle: audit/spec/responsiv.md Z. 247–253 · Dateien: web/css/app.css
Abhängig von: —

```text
**A4 Safe Area und Seitenränder** (responsiv-16, responsiv-21, responsiv-15, bereich_shell-31)
- Z. 212–213 `.topbar { position: sticky; top: env(safe-area-inset-top, 0px); …; padding: 12px var(--gutter); … }` → `top: 0;` und `padding: calc(12px + env(safe-area-inset-top, 0px)) var(--gutter) 12px;` (Rest unverändert).
- Z. 924 (Block ≤ 960 px) `.topbar { padding: 10px 12px; min-height: 60px; gap: 8px; flex-wrap: nowrap; }` → `.topbar { padding: calc(10px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px)); min-height: 60px; gap: 8px; flex-wrap: nowrap; }`; direkt danach neu: `.topbar .menu-btn { margin-left: -9px; } /* 18-px-Glyphe auf der Inhaltskante x=16 */` (nur in diesem Block, der Menüknopf ist auf dem Desktop ebenfalls sichtbar).
- Z. 934 `.content { padding: 16px 16px 60px; --gutter: 16px; }` → `.content { padding: 16px max(16px, env(safe-area-inset-right, 0px)) 60px max(16px, env(safe-area-inset-left, 0px)); --gutter: 16px; }`
- Z. 2998 `.content { padding-bottom: 104px; }` → `.content { padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)); }`
- Z. 3019 `.dash-head .tl { position: fixed; right: 16px; …` → `right: calc(16px + env(safe-area-inset-right, 0px));` (Rest unverändert).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .content] Die beiden Schritte ändern verschiedene Regeln: abstaende-A4 die Grundregel Z. 230, responsiv-A4 den ≤960-Block (Z. 934) und den ≤560-Block (Z. 2998). Bis 960 px bleiben oben 16 px. Damit es eine Abstands-Skala gibt, schreibt responsiv-A4 seine neuen Werte mit den Token aus abstaende-A1: .topbar Z. 212–213 `top: 0; padding: calc(var(--sp-3) + env(safe-area-inset-top, 0px)) var(--gutter) var(--sp-3);`. Z. 924 `.topbar { padding: calc(10px + env(safe-area-inset-top, 0px)) max(var(--sp-4), env(safe-area-inset-right, 0px)) 10px max(var(--sp-4), env(safe-area-inset-left, 0px)); min-height: 60px; gap: 8px; flex-wrap: nowrap; }`; die 10 px bleiben, weil die Titelzeile fest 60 px hoch ist. Z. 934 `.content { padding: var(--sp-4) max(var(--gutter), env(safe-area-inset-right, 0px)) 60px max(var(--gutter), env(safe-area-inset-left, 0px)); --gutter: var(--sp-4); }`. Unverändert bleiben Z. 2998 (`calc(104px + env(safe-area-inset-bottom, 0px))`, Platz für den runden Knopf), `.topbar .menu-btn { margin-left: -9px; }` (negativer Ausgleich ist erlaubt) und Z. 3019 (Anker .dash-head .tl, konflikt-10).
- ÄNDERN: .topbar, .topbar im ≤960-Block und .content im ≤960-Block mit den Token-Werten aus der Entscheidung schreiben (var(--sp-3), var(--sp-4), var(--gutter)). Safe-Area-Logik, 10 px, 60 px, 104 px und −9 px bleiben.

## responsiv-B4 · Menüs am Handy: 16-px-Rand, Menüs der Kopfreihe in voller Breite der .dash-head

Gruppe responsiv · Cluster responsiv · Aufwand S · Befunde: responsiv-24, bereich_dashboard-27
Quelle: audit/spec/responsiv.md Z. 276–285 · Dateien: web/css/app.css
Abhängig von: —

```text
**B4 Menüs am Handy** (responsiv-24, bereich_dashboard-27)
- Z. 3050 `.popover { max-width: calc(100vw - 16px); }` → `.popover { max-width: calc(100vw - 32px); }`, darunter neu:
  ```css
  /* Menüs der Kopfreihe: volle Breite der Kopfreihe (16px Seitenrand), direkt unter ihr */
  .dash-head { position: relative; }
  .dash-head .popwrap { position: static; }
  .dash-head .popover, .dash-head .popover.range-pop { left: 0 !important; right: 0; width: auto; max-width: none; }
  ```
  (`!important` schlägt den Inline-Wert aus `fitPopover`.)

```
