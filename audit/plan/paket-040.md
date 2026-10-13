# Paket 040 · responsiv, shell

Schritte: 11 · Dateien: web/README.md, web/css/app.css, web/js/screens/dashboard.js, web/js/ui.js
Betroffene Tests laut Spezifikation: web/e2e/leaktest.js (nur Prüfung, Akzeptanz 35)
Baut auf Paketen auf: 6, 9, 12, 23, 39

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

## barrierefreiheit-B12d · Filter-Fenster auf Touch 40 px (pointer: coarse)

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: responsiv-25
Quelle: audit/spec/barrierefreiheit.md Z. 380–380 · Dateien: web/css/app.css
Abhängig von: —

```text
| nach Z. 1365 (Filter-Fenster) | Segmente 27,4 px, Umschalter 28 px | `@media (pointer: coarse) { .fd-pop .fd-seg button { padding: 10px 12px; font-size: 13px; } .fd-pop .fd-tog button { height: 40px; font-size: 13px; } .fd-pop .fd-add, .fd-pop .fd-chip { height: 40px; } .fd-pop .fd-pair .input, .fd-pop .fd-pair .fd-unit { height: 40px; } }`. Innenabstand der Wochentag- und Monatsraster (Z. 1394) bleibt. | responsiv-25 |
```

## barrierefreiheit-B12e · .more-link auf Touch 44 px hoch

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: responsiv-29
Quelle: audit/spec/barrierefreiheit.md Z. 381–381 · Dateien: web/css/app.css
Abhängig von: —

```text
| nach Z. 1660 (`.more-link`) | 42 × 19 / 89 × 16 | `@media (pointer: coarse) { .more-link { display: inline-flex; align-items: center; min-height: 44px; padding: 0 10px; margin: -12px -10px; } }` | responsiv-29 |
```

## barrierefreiheit-B12f · Touch: Symbolknöpfe in Tabellen/Listen 40 px, Seitenwähler 44 × 40, .select.sm (Dateiende)

Gruppe barrierefreiheit · Cluster responsiv · Aufwand S · Befunde: responsiv-30
Quelle: audit/spec/barrierefreiheit.md Z. 382–382 · Dateien: web/css/app.css
Abhängig von: —

```text
| Dateiende | Symbolknopf 30 × 30, Seitenwähler 36 × 32, Auswahl 62 × 32 | `@media (pointer: coarse) { .tbl .btn.icon.sm, .set-row .btn.icon.sm { width: 40px; height: 40px; padding: 11px; } .pager .pg-nav button { width: 44px; height: 40px; } .select.sm { padding-top: 10px; padding-bottom: 10px; } }` | responsiv-30 |
```

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
