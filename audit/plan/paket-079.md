# Paket 079 · wording

Schritte: 1 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 9, 14, 15, 19, 22, 27, 35, 51, 61, 62, 63, 66, 67, 68, 75, 76

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-D1 · Wörterbücher: alle Glossar-Schlüssel aus Z8 in en/es/pt/zh/hi, alte Toast-Schlüssel entfernen, „Session beenden“ nachtragen, Muster-Schlüssel (D1+D2)

Gruppe barrierefreiheit · Cluster wording · Aufwand L · Befunde: bereich_dashboard-40, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-17, barrierefreiheit-31, barrierefreiheit-34, barrierefreiheit-35, barrierefreiheit-36, barrierefreiheit-37, barrierefreiheit-38, barrierefreiheit-39, bereich_einstellungen-20, bereich_einstellungen-21, bereich_statistik-33, wording-1, bereich_shell-14, barrierefreiheit-49, barrierefreiheit-11, bereich_notebook_news-35
Quelle: audit/spec/barrierefreiheit.md Z. 888–895 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/lang/hi.js
Abhängig von: barrierefreiheit-U3a, barrierefreiheit-U6a, barrierefreiheit-H1, barrierefreiheit-H2, barrierefreiheit-P9, barrierefreiheit-P11, barrierefreiheit-P12, barrierefreiheit-P13, barrierefreiheit-P14a, barrierefreiheit-P15, barrierefreiheit-C-widgets-36, barrierefreiheit-C-widgets-115, barrierefreiheit-C-widgets-170-174, barrierefreiheit-C-widgets-222-234, barrierefreiheit-C-widgets-374, barrierefreiheit-C-editor-41-42, barrierefreiheit-C-editor-112, barrierefreiheit-C-editor-118-164, barrierefreiheit-C-trades-49, barrierefreiheit-C-trades-50, barrierefreiheit-C-trades-59, barrierefreiheit-C-trades-77-116, barrierefreiheit-C-stats-15, barrierefreiheit-C-notebook-28-74, barrierefreiheit-C-dashboard-78, barrierefreiheit-C-dash-filter-95-121, barrierefreiheit-C-misc-93-145, barrierefreiheit-C-misc-186-207, barrierefreiheit-C-misc-238-259, barrierefreiheit-C-misc-365, barrierefreiheit-C-prop-233-267, barrierefreiheit-C-mentor-83-111

```text
### Phase D – Wörterbücher

#### `web/js/lang/{en,es,pt,zh,hi}.js`

- **D1:** Alle Schlüssel aus dem Glossar Z8 eintragen. „Einstiegskurs fehlt“ und „Ausstiegskurs fehlt für geschlossenen Trade“ entfernen, „Session beenden“ nachtragen (fehlt heute in en.js).
- **D2:** Muster mit `{0}`, `{1}`, `{2}` als Muster-Schlüssel. Doppelte `{n}` in einem Schlüssel vermeiden; dafür sind die Serien- und Diagramm-Labels über `I18N.t` gebaut.
- Befunde: alle mit neuen Texten (bereich_dashboard-40, barrierefreiheit-12, barrierefreiheit-13, barrierefreiheit-17, barrierefreiheit-31, barrierefreiheit-34, barrierefreiheit-35, barrierefreiheit-36, barrierefreiheit-37, barrierefreiheit-38, barrierefreiheit-39, bereich_einstellungen-20, bereich_einstellungen-21, bereich_statistik-33, wording-1, bereich_shell-14, barrierefreiheit-49, barrierefreiheit-11, bereich_notebook_news-35)

```
