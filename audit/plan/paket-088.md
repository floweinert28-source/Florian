# Paket 088 · wording

Schritte: 22 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js, web/js/screens/coach.js, web/js/screens/misc.js, web/js/screens/notebook.js, web/js/screens/progress.js, web/js/screens/prop.js
Betroffene Tests laut Spezifikation: e2e/coachlang.js; e2e/coachlang2.js; e2e/coachtest.js:204–206; e2e/langtest.js; web/e2e/coachlang2.js; web/e2e/langtest.js
Baut auf Paketen auf: 13, 14, 18, 20, 21, 23, 24, 26, 27, 28, 29, 32, 33, 34, 36, 37, 40, 41, 44, 46, 48, 50, 51, 63, 71

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C25 · Fortschritt: Info-Text „desto kräftiger das Feld“

Gruppe farbe · Cluster wording · Aufwand S · Befunde: bereich_training-8
Quelle: audit/spec/farbe.md Z. 510–511 · Dateien: web/js/screens/progress.js
Abhängig von: —

```text
**C25 – `web/js/screens/progress.js` Z. 71:** Info `… Je mehr Trades, desto kräftiger das Grün. …` → `… Je mehr Trades, desto kräftiger das Feld. …` — bereich_training-8

```

## farbe-D1 · Sprachdateien: neue und geänderte Texte in en/es/hi/pt/zh

Gruppe farbe · Cluster wording · Aufwand M · Befunde: bereich_training-3, bereich_notebook_news-17, bereich_trades_tag-29, bereich_konto-4, referenz-7, bereich_einstellungen-18, bereich_einstellungen-17, bereich_einstellungen-37, bereich_training-8, bereich_notebook_news-21, farbe_kontrast-26
Quelle: audit/spec/farbe.md Z. 557–560 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: farbe-A3b, farbe-C17b, farbe-C19b, farbe-C19c, farbe-C22b, farbe-C22c, farbe-C24c, farbe-C25, farbe-C29, farbe-C31b, farbe-C32

```text
### D. Texte, Tests, Dokumentation

**D1 – `web/js/lang/{en,es,hi,pt,zh}.js`:** für jeden Text aus 1.10 den Schlüssel anlegen bzw. den alten ersetzen (geänderte ganze Sätze: misc.js:234, misc.js:145-Hinweis, progress.js:71; neue Wörter: „Effekt“, „Tagesansicht öffnen“, „Verlust vermieden“, „{0} neue Einträge“, „Filter ({0} aktiv)“, „Blau / Gelb“, „Neutral / Rot“, „Designfarben“, „Grau“, „Warnung“, „Info“, „Farbe {0}“; vorhandene Schlüssel „Gewinn“, „Verlust“, „Break-even“, „Aktiv“, „CSV importieren“ prüfen). Englisch zum Beispiel: „Effect“, „Open day view“, „Loss avoided“, „{0} new entries“, „Filter ({0} active)“, „Blue / Yellow“, „Neutral / Red“, „Theme colors“. — betrifft bereich_training-3, bereich_notebook_news-17, bereich_trades_tag-29, bereich_konto-4, referenz-7, bereich_einstellungen-18, bereich_einstellungen-17, bereich_einstellungen-37, bereich_training-8, bereich_notebook_news-21, farbe_kontrast-26

```

## abstaende-K4 · Papierkorb-Liste: 'Gelöscht ' → 'Gelöscht am '

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-25
Quelle: audit/spec/abstaende.md Z. 448–448 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
| K4 | Z. 60 (Liste) | `'Gelöscht ' + fmt.dateTime(n.deletedAt)` → `'Gelöscht am ' + fmt.dateTime(n.deletedAt)` | bereich_notebook_news-25 |
```

## abstaende-M3 · Warnschwellen-Labels kürzen: „Gelb unter (% übrig)“, „Rot unter (% übrig)“

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_prop-33
Quelle: audit/spec/abstaende.md Z. 472–472 · Dateien: web/js/screens/prop.js
Abhängig von: —

```text
| M3 | Z. 240, 241 | Label „Gelb, wenn weniger als … % des Limits übrig“ → „Gelb unter (% übrig)“, „Rot, wenn weniger als … % übrig“ → „Rot unter (% übrig)“ | bereich_prop-33 |
```

## abstaende-Q1 · Sprachschlüssel „{0} Trades im Zeitraum“ und „{0} Trade im Zeitraum“ in en/es/zh/hi/pt

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_training-25
Quelle: audit/spec/abstaende.md Z. 506–510 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-I2

```text
### web/js/lang/*.js (en, es, zh, hi, pt)

| Nr. | Neue bzw. geänderte Schlüssel | Befunde |
|---|---|---|
| Q1 | „{0} Trades im Zeitraum“, „{0} Trade im Zeitraum“ | bereich_training-25 |
```

## abstaende-Q2 · Sprachschlüssel „Bewertung {0} von 5“

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_trades_tag-23
Quelle: audit/spec/abstaende.md Z. 511–511 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-H2

```text
| Q2 | „Bewertung {0} von 5“ | bereich_trades_tag-23 |
```

## abstaende-Q3 · Sprachschlüssel „Gelöscht am {0}“, „Wird am {0} endgültig entfernt“; alte „Gelöscht: {0}“, „Wird endgültig entfernt am {0}“ entfernen

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-25
Quelle: audit/spec/abstaende.md Z. 512–512 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-K3, abstaende-K4

```text
| Q3 | „Gelöscht am {0}“, „Wird am {0} endgültig entfernt“. Alte Schlüssel „Gelöscht: {0}“ und „Wird endgültig entfernt am {0}“ entfernen. | bereich_notebook_news-25 |
```

## abstaende-Q4 · Sprachschlüssel „Gelb unter (% übrig)“, „Rot unter (% übrig)“; alte zwei Schlüssel entfernen

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_prop-33
Quelle: audit/spec/abstaende.md Z. 513–513 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-M3

```text
| Q4 | „Gelb unter (% übrig)“, „Rot unter (% übrig)“. Die alten zwei Schlüssel entfernen. | bereich_prop-33 |
```

## abstaende-Q5 · Sprachschlüssel „Heute noch erlaubt“ und ggf. „bester Tag {0} von max. {1} %“

Gruppe abstaende · Cluster wording · Aufwand S · Befunde: bereich_prop-29
Quelle: audit/spec/abstaende.md Z. 514–515 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: abstaende-M6

```text
| Q5 | „Heute noch erlaubt“, „bester Tag {0} von max. {1} %“ (falls der Wert als Muster übersetzt wird) | bereich_prop-29 |

```

## komponenten-S-coach-c · Coach: Wortwahl „Einladungslink erneuern“ / „Link erneuern“

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_konto-45
Quelle: audit/spec/komponenten.md Z. 633–633 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
- Wortwahl: Z. 115 „Neuen Einladungslink erzeugen“ → „Einladungslink erneuern“; Z. 284 Titel → „Einladungslink erneuern?“, `ok: 'Erneuern'`; Z. 285 Toast → „Einladungslink erneuert“; Z. 265 „Neuen Link erzeugen“ → „Link erneuern“; Z. 349 Toast → „Co-Coach-Link erneuert“.
```

## komponenten-L1a · Übersetzungen: Verpasst-Dialog, „Konto anlegen“, Coach-Einladungslink

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_trades_tag-11, hierarchie-28, bereich_konto-45
Quelle: audit/spec/komponenten.md Z. 727–733 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-S-trades-g, komponenten-S-prop-f, komponenten-S-coach-c

```text
### 3.7 web/js/lang/*.js

**L1 – Übersetzungen** (alle Befunde mit Wortwahl: bereich_trades_tag-11, hierarchie-47, hierarchie-28, bereich_konto-45, bereich_einstellungen-35, bereich_einstellungen-40, bereich_statistik-19, bereich_trades_tag-43, bereich_trades_tag-34, bereich_notebook_news-20, bereich_dashboard-47)
Neue/umbenannte Schlüssel in en, es, zh, hi, pt (englischer Wert zur Orientierung, die anderen Sprachen sinngemäß):
- „Hätte gebracht“ → „Would have made“
- „Konto anlegen“ (falls nicht vorhanden) → „Add account“
- „Einladungslink erneuern“ → „Renew invite link“; „Einladungslink erneuern?“ → „Renew invite link?“; „Erneuern“ → „Renew“; „Link erneuern“ → „Renew link“; „Einladungslink erneuert“ → „Invite link renewed“; „Co-Coach-Link erneuert“ → „Co-coach link renewed“
```

## komponenten-L1b · Übersetzungen: „Profil ergänzen“ (Schlüssel umbenennen), Trading-Labels, Logs

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: hierarchie-47, bereich_einstellungen-35, bereich_einstellungen-40
Quelle: audit/spec/komponenten.md Z. 734–736 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-A2, komponenten-S-misc-e, komponenten-S-misc-i

```text
- Schlüssel „Profil vervollständigen“ umbenennen in „Profil ergänzen“ (en „Complete profile“, es/pt „Completar perfil“, hi/zh Wert unverändert)
- „Tagesverlustlimit“ → „Daily loss limit“; „Ruin-Schwelle (Drawdown)“ → „Ruin threshold (drawdown)“
- „Verlauf durchsuchen“ → „Search history“; „Keine Einträge gefunden“ → „No entries found“; „Noch kein Verlauf“ → „No history yet“ (falls fehlt); „CSV-Importe und eingespielte Sicherungen erscheinen hier.“ → „CSV imports and restored backups appear here.“
```

## komponenten-L1c · Übersetzungen: „Alle Handelstage“, „Netto“, Seitenwahl-Schlüssel ohne Leerzeichen

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_statistik-19, bereich_trades_tag-43, bereich_trades_tag-34
Quelle: audit/spec/komponenten.md Z. 737–738 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-S-stats-b, komponenten-S-trades-d, komponenten-S-trades-c, komponenten-S-shadow

```text
- „Alle Handelstage“ → „All trading days“; „Netto“ → „Net“
- Schlüssel „{0} – {1} von {2} Trades“ → „{0}–{1} von {2} Trades“ (en „{0}–{1} of {2} trades“), „{0} – {1} von {2} Verstößen“ → „{0}–{1} von {2} Verstößen“ (Zielwerte ebenfalls ohne Leerzeichen um den Strich)
```

## komponenten-L1d · Übersetzungen: Tag-Suche, Vorlagen-Menü; Ruhepunkt/Teilen nur bei vorhandenen Einträgen

Gruppe komponenten · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-20, bereich_dashboard-47
Quelle: audit/spec/komponenten.md Z. 739–742 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/zh.js, web/js/lang/hi.js, web/js/lang/pt.js
Abhängig von: komponenten-S-notebook-c, komponenten-S-dashboard-a

```text
- „Tags suchen“ → „Search tags“; „„{0}“ als Tag anlegen“ → „Create tag “{0}”“ (nur, weil „Neuen Tag anlegen“ dort schon übersetzt ist)
- „Bearbeiten“, „Als Standard festlegen“ (falls fehlen) → „Edit“, „Set as default“
- Ruhepunkt- und Teilen-Texte nur, wenn der Bereich dort Einträge hat (heute nicht).

```

## aufbau-C8b · Trading: Schalter „Beträge ausblenden“, Hinweis unter Tagesverlustlimit

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: typografie-8, aufbau-8
Quelle: audit/spec/aufbau.md Z. 489–490 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- `trading()` Z. 197: `switchRow('Geld-blind-Modus', …)` → `switchRow('Beträge ausblenden', …)`; `<h3>Geld-blind-Modus</h3>` bleibt.
- `trading()` Z. 199, Feld `se-loss`: nach dem `<input … id="se-loss" …>` ergänzen: `<span class="hint">Für Tilt-Warnungen und die automatischen Regeln im Fortschritt.</span>`
```

## aufbau-C8e · Regeln: neuer Untertitel mit Link aufs Regelwerk

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: aufbau-8
Quelle: audit/spec/aufbau.md Z. 495–495 · Dateien: web/js/screens/misc.js
Abhängig von: —

```text
- `regeln()` Z. 207 Untertitel → Text aus 1.9 (der `<a href="#/shadow">` wird von `head()` als HTML ausgegeben)
```

## aufbau-D1a · Sprachdateien: Schlüssel Statistiken

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_statistik-3, aufbau-20, bereich_statistik-5, bereich_statistik-12, bereich_statistik-13, bereich_statistik-43
Quelle: audit/spec/aufbau.md Z. 637–650 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C1, aufbau-C14b, aufbau-C14c, aufbau-C14d, aufbau-C14f

```text
### D – Übersetzungen, README, Tests

**D1 Sprachdateien** (`web/js/lang/{en,es,hi,pt,zh}.js`, Format `"deutsch": "Übersetzung"`). Neue Schlüssel mit englischer Vorgabe; die anderen vier Sprachen werden sinngemäß übersetzt:

| Deutsch | Englisch |
|---|---|
| Erwartungswert | Expectancy |
| Ø Netto-P&L pro Trade: Netto-P&L geteilt durch Anzahl der Trades. | Avg net P&L per trade: net P&L divided by the number of trades. |
| Trades | Trades |
| Abgeschlossene Trades im Zeitraum. | Closed trades in the period. |
| Extreme | Extremes |
| Kumulierter Netto-P&L | Cumulative net P&L |
| Tage im Detail | Days in detail |
| Basis: {0} von {1} Trades | Based on {0} of {1} trades |
```

## aufbau-D1b · Sprachdateien: Schlüssel Tagesansicht und TradeLog

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: hierarchie-7, hierarchie-15, hierarchie-16, bereich_trades_tag-18, bereich_trades_tag-33, bereich_trades_tag-27
Quelle: audit/spec/aufbau.md Z. 651–657 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C7a, aufbau-C7c, aufbau-C15a, aufbau-C15b, aufbau-C15c

```text
| Trade für {0} loggen | Log trade for {0} |
| Check-in machen | Do check-in |
| Setup · Fehler | Setup · Mistakes |
| Einstieg / Ausstieg / R | Entry / Exit / R (vorhandene Schlüssel prüfen) |
| Gefiltert · {0} Trades | Filtered · {0} trades |
| Keine verpassten Trades im Zeitraum | No missed trades in this period |
| Ändere den Zeitraum oder das Konto. | Change the period or the account. |
```

## aufbau-D1c · Sprachdateien: Schlüssel Dashboard

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_dashboard-33, bereich_dashboard-23, ki_look-13
Quelle: audit/spec/aufbau.md Z. 658–662 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C2a, aufbau-C6a, aufbau-C6b

```text
| Alle Trades | All trades |
| „Alle Trades“ öffnet das TradeLog (geänderter Info-Text, ganzer Satz) | … “All trades” opens the TradeLog. |
| Vorlage: {0} | Template: {0} |
| {0} verschieben | Move {0} |
| {0} entfernen | Remove {0} |
```

## aufbau-D1d · Sprachdateien: Schlüssel Fortschritt

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: hierarchie-20, bereich_training-22, bereich_training-5
Quelle: audit/spec/aufbau.md Z. 663–665 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C11a, aufbau-C11b

```text
| Schritte erledigt | steps done |
| {0} Prozentpunkte zum Vorzeitraum | {0} percentage points vs. previous period |
| Noch keine Regeln. | No rules yet. |
```

## aufbau-D1e · Sprachdateien: Schlüssel Notebook

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_notebook_news-6, bereich_notebook_news-7, bereich_notebook_news-10, bereich_notebook_news-9
Quelle: audit/spec/aufbau.md Z. 666–675 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C10a, aufbau-C10b, aufbau-C10c, aufbau-C10e

```text
| Tagesnotiz öffnen | Open daily note |
| Tagesnotiz für heute öffnen oder anlegen | Open or create today’s daily note |
| Erstellt {0} | Created {0} |
| · Bearbeitet {0} | · Edited {0} |
| Trade vom {0} | Trade from {0} |
| Datum ändern | Change date |
| Suche in allen Ordnern | Search in all folders |
| Zu den Ordnern | To folders |
| Tag-Filter aufheben | Clear tag filter |
| Bearbeitet: {0} – {1} | Edited: {0} – {1} |
```

## aufbau-D1f · Sprachdateien: Schlüssel Coach, Prop, Einstellungen; alte Schlüssel dürfen bleiben

Gruppe aufbau · Cluster wording · Aufwand S · Befunde: bereich_konto-40, hierarchie-4, typografie-8, aufbau-8, hierarchie-33
Quelle: audit/spec/aufbau.md Z. 676–684 · Dateien: web/js/lang/en.js, web/js/lang/es.js, web/js/lang/hi.js, web/js/lang/pt.js, web/js/lang/zh.js
Abhängig von: aufbau-C4c, aufbau-C12a, aufbau-C8b, aufbau-C8c, aufbau-C8e

```text
| Gruppe anlegen | Create group |
| nur noch das Ziel | only the target left |
| Beträge ausblenden | Hide amounts |
| Für Tilt-Warnungen und die automatischen Regeln im Fortschritt. | Used for tilt warnings and the automatic rules in Progress. |
| neuer Regeln-Untertitel (1.9) | Your rules to check off. They appear in the trade editor, at session end, in Progress and in the rule tracker. Set measurable limits like “Max trades per day” in the Shadow Self ruleset. |
| Alle Daten löschen | Delete all data |

Nicht mehr gebrauchte Schlüssel („Trade-Erwartungswert“, „{0} von {1} Schritten erledigt“, „Trade für diesen Tag“, „Tag loggen“) dürfen bleiben.

```
