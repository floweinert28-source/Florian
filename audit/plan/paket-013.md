# Paket 013 · dashboard

Schritte: 18 · Dateien: web/README.md, web/css/app.css, web/js/screens/dashboard.js, web/js/widgets.js
Betroffene Tests laut Spezifikation: e2e/dashtest.js:123 (erwartet 4 Einträge im ···-Menü, danach 5 bei Nicht-Standard-Vorlage; nicht in E1 genannt); e2e/dashtest.js:22, :102 (#pop-tpl [data-action=dash-tpl-edit], erster Treffer); e2e/dashtest.js:72; e2e/dashtest.js:82; web/e2e/dashtest.js:67 (bleibt grün); web/e2e/dashtest.js:72 (bleibt grün)
Baut auf Paketen auf: 5, 12

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-C26c · Kalender-Titel als Klasse .cal-title; Handy-Regel und Tagesbetrag 800 bleiben (N2)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45, ki_look-11
Quelle: audit/spec/komponenten.md Z. 419–421 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 732 (`.cal-nav`) neu: `.cal-nav .cal-title { font-size: 15px; min-width: 140px; text-align: center; }`
- Handy-Regel Z. 940 bleibt; Z. 721 (`.cal .d .p` 800) bleibt bis N2.

```

## komponenten-C28 · Kennzahl-Auswahl im Report-Widget ohne Farbstreifen (CSS)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-35
Quelle: audit/spec/komponenten.md Z. 428–431 · Dateien: web/css/app.css
Abhängig von: —

```text
**C28 – Kennzahl-Auswahl im Report-Widget** (ki_look-35)
- Z. 1704 `.rep-sel { … border-left-width: 4px; … font-weight: 600; … }` → `border-left-width` streichen, `font-weight: 500`.
- Z. 1707 `.rep-sel.on { border-color: var(--accent); }` → `.rep-sel.on { border-color: var(--text-2); background: var(--surface-3); }`

```

## komponenten-C36 · Klassen statt Inline-Stil für Widgets und Tagesansicht (CSS)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45, bereich_trades_tag-38
Quelle: audit/spec/komponenten.md Z. 489–504 · Dateien: web/css/app.css
Abhängig von: —

```text
#### C. Einzelstellen

**C36 – Klassen statt Inline-Stil** (bereich_dashboard-45, bereich_trades_tag-38)
Neu (bei den jeweiligen Widget-Regeln):
```css
.score-row { gap: 16px; margin-top: 8px; align-items: center; }
.score-row .score-scale { margin: 0 8px 14px; }
.chal-head { margin-bottom: 6px; }
.chal-head .big-stat { font-size: 30px; margin: 0; }
.chal-foot { margin-top: 8px; }
.tracker-cap { font-size: 13px; font-weight: 500; color: var(--text-2); }
.tracker-score { gap: 12px; flex-wrap: nowrap; }
.dash-empty { text-align: center; padding: 32px; }
.day-title { font-size: 20px; margin-left: 6px; }
```

```

## komponenten-W1 · Kalender-Navigation: .btn.nav und .cal-title

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-25, bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 580–584 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C07, komponenten-C26c

```text
### 3.4 web/js/widgets.js

**W1 – Kalender-Navigation** (komponenten-25, bereich_dashboard-45)
Z. 121 `calNav`: beide `class="btn round"` → `class="btn nav"`; `<h3 style="font-size:15px;min-width:140px;text-align:center">` → `<h3 class="cal-title">`.

```

## komponenten-W2 · Report-Auswahl ohne Farbstreifen, „Kennzahl“ neutral

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-35, komponenten-1
Quelle: audit/spec/komponenten.md Z. 585–587 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C28

```text
**W2 – Report-Auswahl ohne Farbstreifen** (ki_look-35, komponenten-1)
Z. 223: am Knopf `.rep-sel` das Attribut `style="border-left-color:${esc(r.color)}"` entfernen. Am Knopf „Kennzahl“ (`class="btn primary sm …" data-action="dash-rep-pick" data-i="new"`) `primary` streichen.

```

## komponenten-W3 · Score-Reihe mit Klassen statt Inline-Stil

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 588–590 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C36

```text
**W3 – Score-Reihe** (bereich_dashboard-45)
Z. 227: `<div class="row" style="gap:16px;margin-top:8px;align-items:center">` → `<div class="row score-row">`; an `.score-scale` `style="margin:0 8px 14px;--p:${sc.overall}"` → `style="--p:${sc.overall}"`.

```

## komponenten-W4 · Umschalter „Letzte Trades / Offene Positionen“ als Unterstrich (.subtabs)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-27, referenz-23
Quelle: audit/spec/komponenten.md Z. 591–593 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C19, komponenten-C20

```text
**W4 – Karten-Umschalter als Unterstrich** (komponenten-27, referenz-23)
Z. 257: `<div class="tabs sm" style="margin-bottom:12px">` → `<div class="subtabs" style="margin-bottom:12px">`

```

## komponenten-W5 · Challenge-Widget mit Klassen statt Inline-Stil

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 594–596 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C36

```text
**W5 – Challenge** (bereich_dashboard-45)
Z. 273: `<div class="row between" style="margin-bottom:6px">` → `<div class="row between chal-head">`; `<div class="big-stat" style="font-size:30px;margin:0">` → `<div class="big-stat">`; beide `<div class="small muted" style="margin-top:8px">` → `<div class="small muted chal-foot">`.

```

## komponenten-W6 · Regel-Tracker mit Klassen, Knopf als btn sm

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45, komponenten-12
Quelle: audit/spec/komponenten.md Z. 597–599 · Dateien: web/js/widgets.js
Abhängig von: komponenten-C36, komponenten-C09

```text
**W6 – Regel-Tracker** (bereich_dashboard-45, komponenten-12)
Z. 287: `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">` → `<div class="tracker-cap">`; `<div class="row" style="gap:12px;flex-wrap:nowrap">` → `<div class="row tracker-score">`; `<a class="btn" href="#/progress">` → `<a class="btn sm" href="#/progress">`. Breite `style="width:…%"` bleibt.

```

## komponenten-W7 · Auslöser in Feature-Widgets neutral (Schatten-Ich, Prop, Ruhepunkt, Mentor)

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 600–602 · Dateien: web/js/widgets.js
Abhängig von: —

```text
**W7 – Auslöser in Feature-Widgets neutral** (komponenten-1; deckt sich mit Gruppe Farbe bereich_dashboard-1, nur einmal umsetzen)
Z. 334 und Z. 354 `class="btn sm primary"` → `class="btn sm"`; Z. 365 `class="btn sm${key === 'vor' ? ' primary' : ''}"` → `class="btn sm"`; Z. 373 `class="btn sm primary"` → `class="btn sm"`; Z. 374 (Mentor-Widget, Inline-Formular) `class="btn primary"` → `class="btn"`.

```

## komponenten-S-dashboard-a · Vorlagen-Menü: Stift ins Untermenü („Bearbeiten“), „Als Standard festlegen“ nur bei Nicht-Standard

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-47
Quelle: audit/spec/komponenten.md Z. 649–651 · Dateien: web/js/screens/dashboard.js
Abhängig von: komponenten-C23

```text
**S-dashboard (dashboard.js)** (bereich_dashboard-47, komponenten-18, bereich_dashboard-45, komponenten-1)
- Z. 32: in `.tpl-row` den Knopf `data-action="dash-tpl-edit" … title="Bearbeiten"` (Stift) entfernen.
- Z. 33 (Untermenü) als ersten Eintrag einfügen: `<button type="button" class="item" data-action="dash-tpl-edit" data-id="${t.id}">${I.edit}<span>Bearbeiten</span></button>`. Den Eintrag `data-action="dash-tpl-default"` nur bei `!t.isDefault` ausgeben, Text immer „Als Standard festlegen“ (kein `disabled`, kein „Ist Standard“). Der obere Eintrag „Diese Vorlage bearbeiten“ (Z. 31) bleibt (e2e klickt `#pop-tpl [data-action="dash-tpl-edit"]`, erster Treffer).
```

## komponenten-S-dashboard-b · Leere Widget-Fläche als .dash-empty

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-45
Quelle: audit/spec/komponenten.md Z. 652–652 · Dateien: web/js/screens/dashboard.js
Abhängig von: komponenten-C36

```text
- Z. 53 `<div class="dashed" style="text-align:center;padding:30px">` → `<div class="dashed dash-empty">`
```

## komponenten-S-dashboard-c · „Beispieldaten laden“ neutral

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-1
Quelle: audit/spec/komponenten.md Z. 653–653 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
- Z. 130 „Beispieldaten laden“ `btn sm primary` → `btn sm`
```

## komponenten-S-dashboard-d · Dialog-Beschriftungen (Challenge, Neue Vorlage) als .lbl; Bibliothek/Bearbeitungsleiste bleiben primary

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: komponenten-18
Quelle: audit/spec/komponenten.md Z. 654–656 · Dateien: web/js/screens/dashboard.js
Abhängig von: komponenten-C05

```text
- Z. 184 (Challenge-Dialog, viermal) und Z. 195 („Neue Vorlage“, „Name“): `<label class="field"><span>` → `<label class="field"><span class="lbl">`
- Z. 63 (`sp-add … primary`) und Z. 119 (Bearbeitungsleiste) bleiben.

```

## komponenten-R1d · README: Kalender – „heute“ einziger gefüllter Kreis, Wochentage ohne Kästen

Gruppe komponenten · Cluster dashboard · Aufwand S · Befunde: ki_look-11
Quelle: audit/spec/komponenten.md Z. 749–749 · Dateien: web/README.md
Abhängig von: komponenten-C26a

```text
- Z. 190: ergänzen „Heute ist der einzige gefüllte Kreis (Textfarbe), Wochentage ohne Kästen.“
```

## aufbau-A4g · Kalender-Wochentage und Tageszahl 12px/500

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: typografie-32
Quelle: audit/spec/aufbau.md Z. 296–299 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 703 `.cal .wd { …; font-size: 12.5px; font-weight: 600; color: var(--text-2); … }` → `font-size: 12px; font-weight: 500; color: var(--muted);` (Rand, Radius, Fläche bleiben)
- Z. 708 `.cal .d .n { …; font-size: 11.5px; font-weight: 600; …; color: var(--text-2); }` → `font-size: 12px; font-weight: 500;` (Kreis und Fläche: Farbe-Spezifikation)
- Z. 1685 `.ycal-head span { …; font-size: 12.5px; color: var(--text-2); … }` → `font-size: 12px; font-weight: 500; color: var(--muted);`

```

## aufbau-B13 · Bearbeitungsmodus flach: keine Kontur, Leiste ohne Rahmen, .w-name weg

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: ki_look-13, aufbau-33
Quelle: audit/spec/aufbau.md Z. 384–389 · Dateien: web/css/app.css
Abhängig von: —

```text
**B13 Bearbeitungsmodus flach** (`web/css/app.css` Z. 1569–1579) · ki_look-13, aufbau-33
- Z. 1569 `.w.editing { outline: 1.5px dashed var(--border-2); outline-offset: 5px; border-radius: var(--radius); }` → `.w.editing { border-radius: var(--radius); }`
- Z. 1574 `.w-bar { …; padding: 4px 6px; margin-bottom: 8px; border-radius: 10px; border: 1px solid var(--border-2); background: var(--surface-2); … }` → `padding: 0; margin-bottom: 6px; border: 0; background: none;` (Rest bleibt)
- Z. 1579 `.w-bar .w-name { … }` löschen
- Drop-Markierung `.over-l`/`.over-r` (Z. 1572–1573) bleibt unverändert.

```

## aufbau-C2a · Widgets: „Alle Trades“ als Kopf-Link, Regel-Tracker ohne Fußlink, Regeln-Link korrigiert

Gruppe aufbau · Cluster dashboard · Aufwand S · Befunde: bereich_dashboard-33, aufbau-10, bereich_training-5
Quelle: audit/spec/aufbau.md Z. 422–427 · Dateien: web/js/widgets.js
Abhängig von: —

```text
#### `web/js/widgets.js`

**C2** · bereich_dashboard-33, aufbau-10, bereich_training-5, typografie-4
- Z. 253 Info von `letzte_trades`: „… „Mehr anzeigen“ öffnet das TradeLog.“ → „… „Alle Trades“ öffnet das TradeLog.“
- Z. 257: `…${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>`, `{ info: e.info, cls: 'recent-card' }` → `…${table}`, `{ info: e.info, cls: 'recent-card', trailing: more('#/trades', 'Alle Trades') }` (`more` aus Z. 307 wird zur Renderzeit aufgerufen)
- Z. 288 Regel-Tracker: `{ trailing: `<a class="more-link" href="#/progress">Mehr anzeigen</a>` }` streichen (Knopf „Tages-Checkliste“ bleibt). Im Leertext `<a href="#/settings">` → `<a href="#/settings/regeln">`
```
