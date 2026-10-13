# Paket 038 · responsiv, shell

Schritte: 11 · Dateien: web/README.md, web/css/app.css, web/js/screens/dashboard.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/leaktest.js (nur Prüfung, Akzeptanz 35)
Baut auf Paketen auf: 1, 6, 9, 12, 13, 22, 37

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## aufbau-D2a · README: Konto-Menü, Titelzeile/Avatar, neue Regel „Kopfreihe“

Gruppe aufbau · Cluster shell · Aufwand S · Befunde: bereich_shell-27, aufbau-7, bereich_shell-11, ki_look-22, aufbau-6, bereich_einstellungen-3, responsiv-19, bereich_dashboard-23
Quelle: audit/spec/aufbau.md Z. 685–688 · Dateien: web/README.md
Abhängig von: aufbau-B1, aufbau-B2, aufbau-B3, aufbau-B4, aufbau-B9

```text
**D2 README** (`web/README.md`)
- Z. 60–61 Konto-Menü: „Profil, Einstellungen, Benachrichtigungen, Sprache, dann Coach und Affiliate, dann der Hell/Dunkel-Schalter“
- Z. 62–64: „… oben rechts in der Titelzeile (Platz `#tb-tools`; der Avatar ist ab 961 px ausgeblendet, das Profil erreicht man über die Konto-Karte) …“; Zertifikat-Symbol „Auszeichnung“
- neue Regel nach Z. 64 (eigener Punkt **Kopfreihe**): Tabelle 1.3 in einem Satz: „Session starten“ nur auf TradeLog, Tagesansicht, Fortschritt, Notebook; „Trade loggen“ auf allen Seiten der Navigation außer Schatten-Ich, Mentor und Ruhepunkt, nicht im Konto-Menü (Coach, Affiliate, Einstellungen); leere Kopfreihen werden nicht gerendert; am Handy hat eine Kopfreihe nur mit dem runden Knopf keine Höhe.
```

## aufbau-C9d · News am Handy: Filter in einer wischbaren Zeile, Beschriftungen sichtbar

Gruppe aufbau · Cluster responsiv · Aufwand S · Befunde: bereich_notebook_news-39, responsiv-19
Quelle: audit/spec/aufbau.md Z. 510–517 · Dateien: web/css/app.css
Abhängig von: aufbau-C9a

```text
  Im 560-Block (ab Z. 2978):
  ```css
  .page-head .nw-filters { flex: 1 1 0; min-width: 0; flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
  .page-head .nw-filters::-webkit-scrollbar { display: none; }
  .page-head .nw-fg, .page-head .nw-fg .chips { flex: 0 0 auto; flex-wrap: nowrap; }
  ```
  Die Beschriftungen „Wichtigkeit“ und „Währung“ bleiben sichtbar.

```

## diagramme-C19 · Radar-Schrift: data-vb und Skalierung in fitRadars

Gruppe diagramme · Cluster responsiv · Aufwand S · Befunde: responsiv-11
Quelle: audit/spec/diagramme.md Z. 528–535 · Dateien: web/js/ui.js
Abhängig von: abstaende-C5

```text
**C19 Radar-Schrift** (responsiv-11; nach Abstände/responsiv-10 umsetzen)
- Z. 384: am `<svg class="radar-svg" …>` das Attribut `data-vb="${-pad} 0 ${size + 2 * pad} ${size}"` ergänzen.
- `fitRadars` (Z. 388): am Anfang jeder svg-Schleife, **vor** dem Zeilenumbruch und vor `getBBox`:
  ```js
  const vb0 = svg.dataset.vb; if (vb0) { const w0 = +vb0.split(' ')[2]; svg.setAttribute('viewBox', vb0); svg.style.maxWidth = w0 + 'px'; const rw = svg.getBoundingClientRect().width; const k = rw ? Math.min(Math.max(w0 / rw, 1), 1.4) : 1; svg.querySelectorAll('text').forEach(t => { t.style.fontSize = (11 * k).toFixed(1) + 'px'; }); }
  ```
  Weil die Ausgangs-viewBox jedes Mal zurückgesetzt wird, schaukelt sich die Weitung nicht auf. Kein ResizeObserver.

```

## zustaende-S-D4 · Größen-Listener im Dashboard: bereits erledigt (Commit aa9f1c6), nur prüfen

Gruppe zustaende · Cluster responsiv · Aufwand S · Befunde: responsiv-43, bereich_shell-7
Quelle: audit/spec/zustaende.md Z. 504–506 · Dateien: web/js/screens/dashboard.js
Abhängig von: —

```text
**S-D4 Größen-Listener** – responsiv-43, bereich_shell-7
Bereits erledigt (Commit `aa9f1c6`, dashboard.js:137–138 `unmount()`, App.render ruft es in app.js:78). Keine Änderung. Prüfung in Abschnitt 4.

```

## barrierefreiheit-B12a · Handy: Menüknopf, Avatar, Schubladen-× unsichtbar auf 44 px (::after)

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: responsiv-28
Quelle: audit/spec/barrierefreiheit.md Z. 372–376 · Dateien: web/css/app.css
Abhängig von: —

```text
**B12 Trefferflächen auf Touch und Handy**

| Stelle | vorher | nachher | Befunde |
|---|---|---|---|
| Block `@media (max-width: 960px)` Z. 916–944 | – | `.menu-btn, .topbar .actions .avatar, .brand .sb-toggle { position: relative; } .menu-btn::after, .topbar .actions .avatar::after, .brand .sb-toggle::after { content: ''; position: absolute; } .menu-btn::after { inset: -4px; } .topbar .actions .avatar::after { inset: -5px; border-radius: 999px; } .brand .sb-toggle::after { inset: -7px; }` (je 44 px, sichtbar 36 / 34 / 30) | responsiv-28 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .brand .sb-toggle] Die Trefferfläche des Schubladen-× wird unsichtbar vergrößert (barrierefreiheit-B12a): im ≤960-Block `.brand .sb-toggle { position: relative; } .brand .sb-toggle::after { content: ''; position: absolute; inset: -7px; }`, gesamt 44 px. Sichtbar bleibt der Knopf 30×30, so wie Menüknopf (36) und Avatar (34) ebenfalls nur per ::after auf 44 px wachsen (barrierefreiheit Z5: „Schubladen-× 44“ unsichtbar). responsiv-B2 `.brand .sb-toggle { width: 40px; height: 40px; margin-right: -6px; }` entfällt. Das Ziel ist dasselbe, aber B2 ändert die Optik nur am Handy, und zusammen mit ::after ergäbe es 54 px. Die 7 px liegen im 14-px-Seitenpolster der Leiste, overflow-x: hidden schneidet nichts ab.
- [doppelt: .menu-btn] P6 und 3.3c lösen dieselbe Aufgabe: Fokus beim Öffnen und Schließen der Schublade. Umgesetzt wird sie einmal in renderSidebar über responsiv-3.3c, in der Fassung des Ankers App.renderSidebar; das Ziel beim Öffnen (.sb-toggle) kommt aus P6. Die Aktionen sidebar() und scrim() sowie der Handy-Zweig von 'sb-toggle' bleiben unverändert. Eine Methode closeSidebar() gibt es nicht. Verträglich sind P8 (aria-controls="sidebar" am Menüknopf), B12a (unsichtbare 44-px-Fläche per ::after im ≤960-Block) und C10 (Selektoren .topbar .menu-btn). Es gibt nur einen .menu-btn, document.querySelector('.menu-btn') trifft also weiter den Knopf der Titelzeile.

## barrierefreiheit-B12d · Filter-Fenster auf Touch 40 px (pointer: coarse)

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: responsiv-25
Quelle: audit/spec/barrierefreiheit.md Z. 380–380 · Dateien: web/css/app.css
Abhängig von: —

```text
| nach Z. 1365 (Filter-Fenster) | Segmente 27,4 px, Umschalter 28 px | `@media (pointer: coarse) { .fd-pop .fd-seg button { padding: 10px 12px; font-size: 13px; } .fd-pop .fd-tog button { height: 40px; font-size: 13px; } .fd-pop .fd-add, .fd-pop .fd-chip { height: 40px; } .fd-pop .fd-pair .input, .fd-pop .fd-pair .fd-unit { height: 40px; } }`. Innenabstand der Wochentag- und Monatsraster (Z. 1394) bleibt. | responsiv-25 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: .fd-pop .fd-tog button] Beide bleiben. 3.2.3g setzt in der Grundregel Z. 1363 `font-size: 12px` → `font-size: var(--fs-12); line-height: var(--lh-12)`. B12d ergänzt den Touch-Block `@media (pointer: coarse)` danach im Quelltext (nach Z. 1365) und setzt die Schrift dort ebenfalls als Token: `.fd-pop .fd-tog button { height: 40px; font-size: var(--fs-13); line-height: var(--lh-13); }`. Grund: Sonst gilt auf Touch 13 px mit der 16-px-Zeilenhöhe aus der Grundregel, und 13px stünde als Rohwert außerhalb der Skala. Die Höhe 40 px bleibt.
- ÄNDERN: Im neuen `@media (pointer: coarse)`-Block nach Z. 1365 bei `.fd-pop .fd-seg button` und `.fd-pop .fd-tog button` jeweils `font-size: 13px` → `font-size: var(--fs-13); line-height: var(--lh-13)`. Der Block muss im Quelltext nach den Grundregeln Z. 1362–1364 stehen. Höhen und Innenabstände bleiben wie spezifiziert.
- [reihenfolge: .fd-pop .fd-seg button] Wie bei `.fd-pop .fd-tog button`. Grundregel Z. 1362: `font-size: var(--fs-12); line-height: var(--lh-12)` (3.2.3g). Touch-Block von B12d: `.fd-pop .fd-seg button { padding: 10px 12px; font-size: var(--fs-13); line-height: var(--lh-13); }`, im Quelltext nach den Grundregeln.
- ÄNDERN: Im neuen `@media (pointer: coarse)`-Block nach Z. 1365 bei `.fd-pop .fd-seg button` und `.fd-pop .fd-tog button` jeweils `font-size: 13px` → `font-size: var(--fs-13); line-height: var(--lh-13)`. Der Block muss im Quelltext nach den Grundregeln Z. 1362–1364 stehen. Höhen und Innenabstände bleiben wie spezifiziert.

## barrierefreiheit-B12e · .more-link auf Touch 44 px hoch

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: responsiv-29
Quelle: audit/spec/barrierefreiheit.md Z. 381–381 · Dateien: web/css/app.css
Abhängig von: —

```text
| nach Z. 1660 (`.more-link`) | 42 × 19 / 89 × 16 | `@media (pointer: coarse) { .more-link { display: inline-flex; align-items: center; min-height: 44px; padding: 0 10px; margin: -12px -10px; } }` | responsiv-29 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .more-link] CSS (aufbau-B12 übernimmt): .more-link { color: var(--text-2); font-weight: 500; font-size: var(--fs-13); line-height: var(--lh-13); text-decoration: none; } .more-link:hover { color: var(--text); }. Ohne Unterstrich beim Hover, wie in der aufbau-Regel („kein Grün, kein Unterstrich“): ruhiger, und gleich wie die übrigen Kopf-Bedienelemente. .more-row wird gelöscht. Touch-Höhe 44 px aus barrierefreiheit-B12e danach, unverändert. Letzte Trades (widgets.js:253/257): Der Link steht im Kartenkopf (aufbau-C2a, U.card trailing), nicht in einer Fußzeile, und heißt „Zum TradeLog“. Das ist laut wording W5 der feste Name für „Navigation aus Widget“ und sagt das Ziel; „Alle Trades“ und „Mehr anzeigen“ fallen weg, denn „Mehr anzeigen“ heißt laut aufbau nur Nachladen. Der Link erscheint nur mit Zeilen (wording W13, zustaende): { info: e.info, cls: 'recent-card', trailing: rows.length ? more('#/trades', 'Zum TradeLog') : '' }. Info-Satz: „Die zuletzt geschlossenen Trades des Kontos und alle noch offenen Positionen. So viele Zeilen, wie in die Karte passen; „Zum TradeLog“ öffnet die ganze Liste.“ Regel-Tracker: trailing ersatzlos streichen (aufbau-C2a = wording 6.15, aufbau übernimmt). Der Leertext-Link geht auf #/settings/regeln.

## barrierefreiheit-B12f · Touch: Symbolknöpfe in Tabellen/Listen 40 px, Seitenwähler 44 × 40, .select.sm (Dateiende)

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: responsiv-30
Quelle: audit/spec/barrierefreiheit.md Z. 382–382 · Dateien: web/css/app.css
Abhängig von: —

```text
| Dateiende | Symbolknopf 30 × 30, Seitenwähler 36 × 32, Auswahl 62 × 32 | `@media (pointer: coarse) { .tbl .btn.icon.sm, .set-row .btn.icon.sm { width: 40px; height: 40px; padding: 11px; } .pager .pg-nav button { width: 44px; height: 40px; } .select.sm { padding-top: 10px; padding-bottom: 10px; } }` | responsiv-30 |
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .select.sm] Ergebnis `.select.sm { padding: 7px 28px 7px 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; width: auto; }`. Das ergibt genau 34 px (18 + 14 + 2), die sm-Stufe. Auf Touch bleibt `@media (pointer: coarse) { .select.sm { padding-top: 10px; padding-bottom: 10px; } }`, das ergibt 40 px. Die neue `.input.sm` aus komponenten-C03 nutzt ebenfalls die Skala statt 12.5 px: `.input.sm { height: 34px; padding: 0 10px; font-size: var(--fs-13); line-height: var(--lh-13); border-radius: 9px; }`. Grund: 12.5 px ist in der Typografie-Skala verboten, sm-Felder = 13 wie .btn.sm.

## barrierefreiheit-B12g · Provisionssatz .aff-pct am Handy ≈ 33 px hoch mit Stift

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: bereich_konto-32
Quelle: audit/spec/barrierefreiheit.md Z. 383–384 · Dateien: web/css/app.css
Abhängig von: —

```text
| Z. 2996–2997 (Handy) | `.aff-pct { gap: 0; margin: 0; padding: 0; } .aff-pct svg { display: none; }` | `.aff-pct { gap: 3px; padding: 8px 4px; margin: -8px -4px; } .aff-pct svg { width: 11px; height: 11px; }` | bereich_konto-32 |

```

## barrierefreiheit-B14 · Kalender am Handy: Kurzbetrag 10,5/700 Onest, Tageszahl 11 px im 20-px-Kreis

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: typografie-27
Quelle: audit/spec/barrierefreiheit.md Z. 390–396 · Dateien: web/css/app.css
Abhängig von: —

```text
**B14 Kalender am Handy**
- Z. 1800 (Zahlenschrift-Liste): `.cal .p` → `.cal .p, .cal .pm`
- Z. 940: `.cal .d .n { width: 18px; height: 18px; font-size: 10px; top: 3px; right: 3px; }` → `width: 20px; height: 20px; font-size: 11px;` (top und right bleiben)
- Z. 3042: `… font-weight: 700; font-size: 9.5px; letter-spacing: -.03em; …` → `font-weight: 700; font-size: 10.5px; letter-spacing: -.02em;` (Rest bleibt)
- Z. 3044: unverändert (12,5 / 700, jetzt in Onest über die Liste)
- Befunde: typografie-27

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .cal .d .pm] Kurzbetrag am Handy (Z. 3042): `font-weight: 700; font-size: 10.5px; letter-spacing: -.02em;` in Onest (über die Sammelregel), der Rest der Regel bleibt (barrierefreiheit-B14). Gemessen bei 390 px in Onest 700: Das Feld ist 39,7 px breit. „+12,3k€“ braucht bei 10,5/−.02em 37,5 px, bei 11/−.01em 40,2 px und würde abgeschnitten (overflow hidden); „−486€“ 34,0 bzw. 35,5 px. 10,5 ist damit die größte Stufe ohne Abschneiden und liegt deutlich über heute 9,5. Sie kommt als dokumentierte Ausnahme in die Typografie-Ausnahmenliste (wie --fs-10 für Container-Notstufen). Die Onest-Liste schreibt einmal typografie-3.2.2f (enthält .cal .d .pm und .cal .w .pm). Die Container-Stufe ≤77 px (Z. 2976, 12.5 → 12) bleibt bei typografie-3.2.3f.
- ÄNDERN: Es bleibt nur Z. 3042 (10.5px/700/−.02em). Entfallen: Z. 1800 (Onest-Liste → typografie-3.2.2f), Z. 940 (20×20, 11 px → typografie-3.2.3b, gleiche Werte), „Z. 3044 unverändert“ (der Wochenbetrag geht mit typografie-3.2.3f auf 12 px, Onest über 3.2.2f).
- [konflikt: .cal .w .pm] Wochenbetrag am Handy (Z. 3044): `display: block; font-weight: 700; font-size: var(--fs-12); line-height: var(--lh-12);` in Onest (typografie-3.2.3f: 12.5 → 12, Onest über 3.2.2f). Barrierefreiheit wollte 12,5 nur gegen eine Verkleinerung auf 11 verteidigen. 12 ist eine Skalenstufe, liegt nur 0,5 px darunter und passt sicher in die Wochenspalte.
- ÄNDERN: Es bleibt nur Z. 3042 (10.5px/700/−.02em). Entfallen: Z. 1800 (Onest-Liste → typografie-3.2.2f), Z. 940 (20×20, 11 px → typografie-3.2.3b, gleiche Werte), „Z. 3044 unverändert“ (der Wochenbetrag geht mit typografie-3.2.3f auf 12 px, Onest über 3.2.2f).
- [konflikt: .cal .d .n] Desktop (Z. 708), Endstand für alle Tage: `.cal .d .n { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 999px; display: grid; place-items: center; font-size: var(--fs-12); line-height: var(--lh-12); font-weight: 500; background: none; color: var(--text-2); }`; komponenten-C26a schreibt die Regel. Bei der Farbe gilt --text-2 (Farbe und Aufbau). Die Variante „--muted, nur an Handelstagen --text-2“ (Komponenten) entfällt. Grund: Tageszahlen sind Inhalt; --muted ist laut Farbe-Spezifikation Hinweisen, Platzhaltern und Achsen vorbehalten, und es ist eine Regel weniger. ≤960 (Z. 940): `width: 20px; height: 20px; font-size: var(--fs-11); line-height: var(--lh-11);`, top/right 3px bleiben; das schreibt typografie-3.2.3b (Barrierefreiheit hat dieselben Werte). Heute-Kreis und Mini-Kalender entscheiden die Anker .cal .d.today .n und .cal.mini .d.today .n.
- ÄNDERN: Es bleibt nur Z. 3042 (10.5px/700/−.02em). Entfallen: Z. 1800 (Onest-Liste → typografie-3.2.2f), Z. 940 (20×20, 11 px → typografie-3.2.3b, gleiche Werte), „Z. 3044 unverändert“ (der Wochenbetrag geht mit typografie-3.2.3f auf 12 px, Onest über 3.2.2f).

## responsiv-A1 · Handy-Hilfsklassen ph-only/ph-hide und Kernspalten-Grundregeln für .tbl.ph-fit (inkl. Vorspann Abschnitt 3)

Gruppe responsiv · Cluster responsiv · Aufwand S · Befunde: bereich_prop-21, responsiv-6, bereich_prop-22, responsiv-4, responsiv-7, bereich_trades_tag-5, responsiv-5, bereich_statistik-20, bereich_training-24, responsiv-8, bereich_training-27, bereich_konto-13, bereich_notebook_news-11, bereich_training-38
Quelle: audit/spec/responsiv.md Z. 200–226 · Dateien: web/css/app.css
Abhängig von: —

```text
## 3. Umsetzungsschritte

Reihenfolge: zuerst Skalen und Hilfsklassen, dann Komponenten, dann Einzelstellen. Zeilen gelten für den Stand vor der Umsetzung; nach Verschiebungen per Selektor suchen.

### 3.1 web/css/app.css

#### A – Skalen und Hilfsklassen

**A1 Handy-Hilfsklassen** (bereich_prop-21, responsiv-6, bereich_prop-22, responsiv-4, responsiv-7, bereich_trades_tag-5, responsiv-5, bereich_statistik-20, bereich_training-24, responsiv-8, bereich_training-27, bereich_konto-13, bereich_notebook_news-11, bereich_training-38)
- Nach Z. 1330 (`.vh { … }`) global ergänzen:
  `.ph-only { display: none; }`
  `.popover .item.ph-only { display: none; }`
- Im Block `@media (max-width: 560px)` (Z. 2978 ff.) direkt nach Z. 2997 ergänzen:
  ```css
  /* Handy: Hilfsklassen und Tabellen mit Kernspalten (kein seitliches Scrollen) */
  .ph-hide { display: none !important; }
  .ph-only { display: revert; }
  .popover .item.ph-only { display: flex; }
  .tbl.ph-fit { min-width: 0; }
  .tbl.ph-fit th, .tbl.ph-fit td { padding-left: 8px; padding-right: 8px; }
  .tbl.ph-fit td.ph-wrap { white-space: normal; }
  .tbl.ph-fit .sub.ph-only { display: block; margin-top: 2px; white-space: normal; }
  .tbl.ph-fit .badge, .tbl.ph-fit td.dir-cell .badge { min-width: 0; padding: 0 3px; gap: 0; }
  .tbl.ph-fit .badge .bl { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  ```
  Hinweis: Z. 3056 (`.tbl th, .tbl td { padding: 9px 10px; … }`) bleibt für Tabellen ohne `ph-fit`.

```
