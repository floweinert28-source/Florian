# Paket 054 · trades_tag, prop, einstellungen

Schritte: 4 · Dateien: web/js/screens/day.js, web/js/screens/misc.js, web/js/screens/prop.js, web/js/screens/trades.js
Betroffene Tests laut Spezifikation: e2e/proptest.js:20, :23, :27
Baut auf Paketen auf: 53

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-S-day-d · „Tagesnotiz anlegen“ im Leerzustand neutral

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: zustaende-14
Quelle: audit/spec/komponenten.md Z. 661–662 · Dateien: web/js/screens/day.js
Abhängig von: komponenten-C11

```text
- Z. 19 „Tagesnotiz anlegen“ (Leerzustand) `btn sm primary` → `btn sm`.

```

## komponenten-S-trades-b · TradeLog-Leerzustand „Trade loggen“ neutral

Gruppe komponenten · Cluster trades_tag · Aufwand S · Befunde: zustaende-14
Quelle: audit/spec/komponenten.md Z. 719–719 · Dateien: web/js/screens/trades.js
Abhängig von: komponenten-C11

```text
- Z. 45 Leerzustand „Trade loggen“ `btn sm primary` → `btn sm`.
```

## komponenten-S-prop-a · Prop: Leerzustand-Aktion btn sm, „Als bestanden markieren“ neutral

Gruppe komponenten · Cluster prop · Aufwand S · Befunde: zustaende-14, komponenten-1
Quelle: audit/spec/komponenten.md Z. 694–696 · Dateien: web/js/screens/prop.js
Abhängig von: komponenten-C11

```text
**S-prop (prop.js)** (hierarchie-28, responsiv-46, zustaende-14, komponenten-1, komponenten-30, bereich_prop-18, komponenten-18)
- Z. 82 Leerzustand `class="btn primary"` → `class="btn sm"`.
- Z. 97 „Als bestanden markieren“ `btn sm primary` → `btn sm`.
```

## komponenten-S-misc-i · Logs: Papierkorb neutral, Leerzustände statt leerer Tabellen, Suche „Verlauf durchsuchen“

Gruppe komponenten · Cluster einstellungen · Aufwand M · Befunde: bereich_einstellungen-40
Quelle: audit/spec/komponenten.md Z. 679–679 · Dateien: web/js/screens/misc.js
Abhängig von: komponenten-C11

```text
- Logs (bereich_einstellungen-40): Z. 255 am Import-Papierkorb `style="color:var(--loss)"` entfernen. Wenn `imps.length === 0`: statt Tabelle `<div class="tbl-wrap"><div class="empty" style="min-height:140px">${I.upload}<b>Noch keine Imports</b><span class="small">CSV-Importe und eingespielte Sicherungen erscheinen hier.</span></div></div>`. Z. 260: wenn `(S.data.logs || []).length === 0` dasselbe Muster mit `${I.clock}`, „Noch kein Verlauf“ und dem bisherigen Untertext; liefern nur Suche/Filter keine Treffer, bleibt die Tabelle und die Leerzeile sagt „Keine Einträge gefunden“. Z. 259 Platzhalter „Typ suchen“ → „Verlauf durchsuchen“.
```
