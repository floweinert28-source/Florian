# Spezifikation: Aufbau, Informationsarchitektur und Hierarchie

Gruppe „aufbau“, 80 bestätigte Befunde (`spec-input/aufbau.json`). Grundlage: Code-Stand HEAD `677b630` (13.10.2026), BRIEF.md, web/README.md, Prüfer-Anmerkungen.

**Wichtig vorab**

- Der Fehler hinter komponenten-3 und bereich_shell-8 (Zeitraum und Konto springen zwischen Titelzeile und Kopfreihe, je nach Fenstergeschichte) ist **seit Commit `aa9f1c6` behoben**: `dashboard.js` hat ein `unmount()`, das den Größen-Listener abhängt, und `e2e/leaktest.js` prüft das. Offen ist nur noch die Grundsatzfrage, ob Zeitraum und Konto auf **allen** Seiten in die Titelzeile gehören. Diese Frage steht unter 6 (F1).
- **Wann gilt etwas als „Nutzer fragen“?** (a) Ein Bereich, ein Reiter, ein Navigationspunkt, ein Einstellungsfeld oder eine Bedienmöglichkeit fällt weg. (b) Eine in README oder BRIEF festgelegte Platzierungs- oder Gliederungsregel ändert sich (Titelzeile, Gruppen der Seitenleiste, Prop-Bereiche, Einstellungsbereiche, Ruhepunkt-Ablauf). (c) Ein Prüfer schreibt ausdrücklich „dem Nutzer vorlegen“. **Umgesetzt** wird dagegen, wenn nur doppelte Anzeigen derselben Information wegfallen, sich die Reihenfolge innerhalb einer Seite ändert, ein falsches Ziel korrigiert wird oder eine Hierarchiestufe angeglichen wird. Das deckt BRIEF: „Aufbau darf geändert werden, wenn es klar besser ist. Begründen.“ Die README wird in diesen Fällen nachgezogen (Schritt D2).

---

## 1. Zielzustand

### 1.1 Grundsätze (gelten für alle Schritte)

1. **Eine Information steht pro Bildschirm an genau einer Stelle.** Ein Wert, ein Datum, ein Titel oder eine Aktion erscheint nicht zweimal in Sichtweite. Ausnahme: Kennzahl-Kachel und ausführliche Tabelle derselben Größe auf **verschiedenen** Reitern.
2. **Steuerelemente stehen nur dort, wo sie wirken.** Zeitraum, Konto und „Session starten“ erscheinen nur auf Seiten, deren Inhalt sie verändern. „Trade loggen“ ist der Hauptknopf auf den Seiten der Navigation, nicht auf den Seiten des Konto-Menüs.
3. **Leere Rahmen gibt es nicht.** Ist eine Kopfreihe leer, wird sie nicht gerendert, auch nicht als leerer Streifen mit 40 px Mindesthöhe. Eine Karte nur für einen Erklärsatz wird zu einer Textzeile.
4. **Die Hierarchie folgt der Schachtelung.** Eine untergeordnete Überschrift ist nie größer oder schwerer als die übergeordnete. Eine Beschriftung ist nie schwerer als ihr Wert.
5. **Links führen direkt ans Ziel.** Kein Link auf `#/settings` ohne Unterbereich, wenn ein bestimmter Bereich gemeint ist.

### 1.2 Titelzeile (`.topbar`)

| Breite | Inhalt links | Inhalt rechts |
|---|---|---|
| ab 961 px | Seitentitel `h1` (21px/600, unverändert) | `#tb-tools`: auf dem Dashboard Zeitraum, Konto, Filter (wie heute). **Kein Avatar.** Das Profil erreicht man über die Konto-Karte unten links. |
| bis 960 px | Menüknopf, Seitentitel | Avatar 34 px als Link auf `#/settings/profil`. Die Initialen kommen aus derselben Funktion wie die Konto-Karte (`App.userName()`), also z. B. „FW“ statt „T“. |

Das Start-Skelett folgt dem: `.boot-top .skel.av` ab 961 px ausgeblendet.
Offen (F1): Zeitraum und Konto auf **allen** Seiten ab 961 px in `#tb-tools`.

### 1.3 Kopfreihe (`.page-head`) – Regel und Belegung je Seite

**Aufbau:** links die Steuerung der Seite: Zeitraum und Konto (nur wo sie wirken), Seitennavigation (Prop-Bereiche, Affiliate-Umschalter), Suche (Notebook), Filter (News), Rückweg (Trade-Ansicht). Rechts die Aktionen der Seite, dann „Session starten“, dann ein Trenner, dann „Trade loggen“.
**Leer:** Gibt es links und rechts nichts, liefert `pageHead()` einen Leerstring. **Handy (bis 560 px):** Enthält die Kopfreihe nur den runden „Trade loggen“-Knopf (`.tl`, dort `position: fixed`), ist sie 0 px hoch.

| Seite | Zeitraum | Konto | Session | Trade loggen | links (`ctx.headLeft`) | rechts (`screen.actions`) |
|---|---|---|---|---|---|---|
| Dashboard (eigene Kopfreihe) | Titelzeile | Titelzeile | – | ja | – | Vorlage, Zertifikat (Symbol `award`) |
| TradeLog (Liste) | ja | ja | ja | ja | – | CSV importieren |
| Trade-Ansicht `#/trades/<id>` | – | – | – | ja | „← TradeLog · \<Datum>“ | – |
| Tagesansicht | – | ja | ja | ja (vergangener oder künftiger Tag: Trade auf diesen Tag, 09:00) | – | – |
| Statistiken | ja | ja | – | ja | – | Zertifikat (Symbol `award`) |
| Fortschritt | ja | ja | ja | ja | – | – |
| Notebook | – | – | ja (README:95) | ja | Suche | – |
| News | – | – | – | ja | Filter Wichtigkeit und Währung | – |
| Schatten-Ich | ja | ja | – | – | – | – (unverändert) |
| Mentor | – | ja + Hinweis | – | – | – | – (unverändert) |
| Ruhepunkt | keine Kopfreihe (`ownActions`, unverändert) | | | | | |
| Blind-Replay (versteckt) | – | ja | ja | ja | – | – (unverändert) |
| Prop Firms | – | – | – | ja | Bereichsreiter | „Prop-Konto“ |
| Coupon-Codes | – | – | – | ja | – | – |
| Affiliate (Konto-Menü) | – | – | – | – | Umschalter „Alle Creator · Creator-Ansicht“, in der Creator-Ansicht dazu die Auswahl | Marke „Beispieldaten“ |
| Coach (Konto-Menü) | keine Kopfreihe | | | | | |
| Einstellungen (Konto-Menü) | keine Kopfreihe | | | | | |

Daraus folgt die **Regel für „Session starten“**: nur auf TradeLog, Tagesansicht, Fortschritt und Notebook (dazu Blind-Replay, solange versteckt). **Regel für „Trade loggen“**: auf allen Seiten der Navigation außer Schatten-Ich, Mentor und Ruhepunkt (Nutzerentscheidungen); auf keiner Seite des Konto-Menüs. Taste **N** geht überall.

### 1.4 Wege, Links und „mehr dazu“

- Ziele: „Regeln anlegen“, „Regeln bearbeiten“ und der Regel-Tracker-Link führen nach `#/settings/regeln`. „Konten verwalten“ (Konto-Menü) führt nach `#/settings/konten`. Im Konto-Menü bleibt nur „Einstellungen“ ein Link auf `#/settings`.
- Für „mehr dazu“ gibt es **ein Muster**: einen Link rechts im Kartenkopf (`U.card(..., { trailing })`), Klasse `.more-link`, **13px/500, `--text-2`**, beim Darüberfahren `--text`. Kein Grün, keine Unterstreichung. Beschriftung „Öffnen“ bei Bereichs-Karten, „Alle Trades“ bei „Letzte Trades“. Es gibt **keine** Fußzeilen-Links mehr (`.more-row` entfällt).
- „Mehr anzeigen“ heißt nur das Nachladen in einer Liste: `btn sm ghost`, mittig in `.aff-more`, in Schritten zu 10 (Affiliate, Coach-Journal).
- Konto-Menü, Reihenfolge: Profil · Einstellungen · Benachrichtigungen · Sprache · *Trenner* · Coach · Affiliate · *Trenner* · Design (Hell/Dunkel). `.on` markiert den aktiven Eintrag. Unterbereich `profil` → Profil, `benachrichtigungen` → Benachrichtigungen, `sprache` → Sprache, jeder andere Unterbereich → Einstellungen.
- Tastatur: 1–9 wie bisher belegt. „0“ wirkt nur, wenn Blind-Replay freigeschaltet ist. Hinweis „**1–9** Bereiche“.
- Prop-Kontokarte: Der Wert bei „Nächster Payout“ bzw. „Bestehen“ ist ein Link in den Payout-Planer **dieses** Kontos (Bilanz, Abschnitt aufgeklappt und ins Bild gescrollt).

### 1.5 Überschriften-Treppe (verbindliche Werte)

| Rolle | Element | Wert |
|---|---|---|
| Seitentitel | `.topbar h1` | 21px/600 (bis 960 px: 17px), unverändert |
| Kartentitel | `<h2 class="card-title">` (ui.js `U.card`) | 15px/600, `letter-spacing: normal; text-wrap: wrap` (sieht aus wie heute) |
| Bereichstitel Einstellungen | `.set-head h2` | **18px/600, line-height 24px, letter-spacing 0**; bis 960 px **16px/22px** |
| Untertitel Einstellungen | `.set-head p` | **13px**, `--muted` (Klasse bleibt) |
| Blocktitel Einstellungen | `.set-block h3` | **15px/600**, margin-bottom 10px |
| Optionstitel Einstellungen | `.set-row b`, `.set-body .check b`, `.set-body .row.between > div > b`, `.set-body .avatar-row b` | **14px/500, `--text`** |
| Beschreibung | `.small.muted` | 12px/400 `--muted`, unverändert |
| Coach-Eintrag | `.ce-title` 17px/600 > `.ce-body .ql-editor` h1 **16px**, h2 **15px**, h3 **14.5px**, alle 600, Abstand `10px 0 4px` | |
| Prop-Übersicht | `.prop-h` (15px/600) nur zusammen mit den Filtern (ab 5 Konten). Gruppentitel `.prop-group-title b` **13px/600 `--text-2`** | |
| News-Tageskopf | `.nw-dh` **14px/600** über den Zeilen (13.5px, hohe Wichtigkeit 13.5/600). Kein Zähler | |
| Abschnitts-Eyebrow in Menüs | `.popover .sec` und `.fd-pop .fd-gh` | **11px/600**, Versal, `letter-spacing .06em`, `--muted` |
| Feld-Label | `.field > label` und `.fd-pop .fd-l` | 12px/600 `--muted` (ein Label-Stil) |
| Steuerelemente im Filter-Fenster | `.fd-seg button`, `.fd-tog button`, `.fd-chip`, `.fd-add` | Gewicht **500** |
| Titel schwebender Ebenen | `.fd-pop .sp-head h2`, `.rr-m-title`, `.dp-title` | 14.5px/600, unverändert |
| Kalender-Wochentage | `.cal .wd`, `.ycal-head span` | **12px/500 `--muted`** (Kasten bleibt); Tageszahl `.cal .d .n` **12px/500 `--text-2`** |

### 1.6 Kennzahlen: Beschriftung und Wert

| Rolle | Klasse | Wert |
|---|---|---|
| Beschriftung direkt über einem Wert | `.kpi-label` (neu) | **13px/500, `--text-2`, line-height 18px**, `display:flex; align-items:center; gap:6px` (für ein Info-Symbol) |
| dasselbe in dichten Rastern | `.kpi-label.sm` bzw. die Klassen der Raster (`.day-card .stats .k`, `.nb .stats-grid .k`, `.strat-stats .k`, `.fw-stats > div > span`) | **12px/500, `--muted`** |
| Kachel-Titel | `.tile .head` | **13px**/500 `--text-2` (Handy 12px, unverändert) |
| Statistik-Kachel-Titel | `.stat-tile .k`, `.stat .k` | 13px/**500** `--text-2` |
| Abschnitts-Eyebrow | `.caption` (11px/600, Versal) | **nur** über Abschnitten (z. B. „Automatische Regeln“, „Dein Tag“, „Nächste wichtige News“), **nie direkt über einem Wert** |
| Kachelwert | `--tile-val` (neu) | **24px** (bis 960 px 22px, bis 560 px 20px), 700, Zahlenschrift, line-height 1.1, letter-spacing -0.02em. Gilt für `.tile .val`, `.stat-tile .v`, Spark-Kachel, Schatten-Ich-Hauptkachel, Prop-Leiste, Payout-Vorschlag |
| Einzelwert in einer Karte | `.prop-balance .val` | 26px, unverändert (kein Teil einer Kachelreihe) |
| Hauptzahl einer Seite | `.big-stat` 44px | nur Fortschritt (Serie, Heutiger Fortschritt, % Regeln) und Serien-Widget |

Ausnahmen, die bleiben: `@container (max-width:164px) .tile .val { 22px }` (sehr schmale Kacheln) und `.coach-gs-tiles .tile .val` 21px (6 Kacheln, nicht belegt).

### 1.7 Doppelungen, die wegfallen

| Wo | heute | Ziel |
|---|---|---|
| TradeLog, Tagesansicht | Status-Pille neben farbigem P&L | Keine Spalte „Status“. Offene Trades: Pille „Offen“ in der P&L-Zelle. Break-even: Betrag in `.neu` (`--text-2`) |
| TradeLog | eigene Spalte „Richtung“ | Abzeichen in `td.dir-cell` neben dem Symbol unter gemeinsamer Überschrift „Symbol“ (README:45–47) |
| Tagesansicht | „Trade loggen“ und „Trade für diesen Tag“ | nur „Trade loggen“ in der Kopfreihe, auf den angezeigten Tag vorbelegt |
| Tagesansicht | „Check-in“ in der Datumszeile und in der Karte | nur in der Karte („Bearbeiten“ bzw. „Check-in machen“/„Check-in nachtragen“) |
| Tagesansicht | Zeitraum „Oktober 2026“ über „Montag, 17. August 2026“ | kein Zeitraum |
| Statistiken | Kurve über allen 9 Reitern | Reiterleiste zuerst. Kurve als Karte „Kumulierter Netto-P&L“ nur in „Übersicht“ |
| Statistiken → Übersicht | „Trade-Erwartungswert“ = „Ø Netto-P&L pro Trade“ | eine Kachel „Erwartungswert“, neue Kachel „Trades“, 16 Kacheln in 4 Themenreihen |
| Statistiken → Übersicht | Karte „Haltedauer“ mit Tageswerten | Karten „Serien“, „Extreme“, „Drawdown & Risiko“ |
| Statistiken → Tage / Zeit | Wochentag-Balken zweimal | nur in „Zeit“ (Ø pro Trade, Summe im Tooltip); „Tage“ zeigt Kennzahl-Leiste und Tabelle |
| Statistiken → Marktphase | „10 von 10 Trades haben eine Marktphase.“ | nur bei Teilabdeckung, als `sub` der ersten Karte |
| Fortschritt | Regeln dreimal | Karte „Aktuelle Regeln“ entfällt |
| Fortschritt | „Keine Daten“ in 44px über „0 von 5 Schritten erledigt“ | „0 / 5“, darunter „Schritte erledigt“ |
| Prop-Karte | „1.946,15 $ fehlen“ und „Gewinn fehlt: 1.946,15 €“ | „Gewinn fehlt“ nur bei Funded-Konten oder ohne Ziel-Balken |
| Prop-Übersicht | „Aktive Konten 2“ (Kachel) und „Aktive Konten (2)“ (Überschrift) | Überschrift nur mit Filtern |
| Prop → Bilanz | Spalten „Firma“ und „Konto“ (Konto enthält Firma) | eine Spalte „Konto“: **Firma** fett + Größe |
| Payout-Planer | Info-Banner = Kartentitel, Warn-Banner = Consistency-Zeile, Karten mit Rahmen im Kasten | keine der beiden Banner, Karten im Planer ohne eigenen Rahmen |
| Friedhof | Karte „Muster“ für einen Satz | ein Satz als Textzeile |
| Affiliate | Kachel „Creator 5“ + Kartentitel + Spaltenkopf | Kachel entfällt |
| Affiliate | zwei Steuerreihen | eine Kopfreihe |
| Dashboard bearbeiten | gestrichelte Kontur + umrandete Leiste mit Namen + Karte | nur Karte, darüber eine flache Leiste ohne Namen |
| Notiz-Kopf | Datum bis zu viermal | Titel nennt das Datum. Der Datumsknopf ist dann nur ein Symbol. Eine Meta-Zeile „Erstellt … · Bearbeitet …“ |
| Notizliste | Tagesnotiz: Datum als Titel und als zweite Zeile | zweite Zeile „3 Trades · +412,00 €“ |
| News | Zähler-Pille „2“ im Tageskopf | entfällt |
| Einstellungen → Profil | rotes „Alles löschen“ als Titel und als Knopf | Titel „Alle Daten löschen“ in `--text`, nur der Knopf rot |
| Einstellungen → Trading | „Geld-blind-Modus“ als Block- und Schaltertitel | Schaltertitel „Beträge ausblenden“ |
| Titelzeile | Avatar oben und Konto-Karte unten (verschiedene Initialen) | ab 961 px nur die Konto-Karte |

### 1.8 Aufbau einzelner Seiten (Reihenfolge)

- **Statistiken:** Kopfreihe → Reiterleiste → Inhalt des Reiters. Übersicht: Karte „Kumulierter Netto-P&L“ (h240, ohne Legende) → 16 Kacheln → „Serien“ · „Extreme“ · „Drawdown & Risiko“. Reihen der Kacheln: Ergebnis (Netto-P&L · Erwartungswert · Ø Tages-Netto-P&L · Profit-Faktor), Treffer (Win-Rate · Ø Tages-Win-Rate · Ø Trade-Gewinn/Verlust · Ø Tages-Gewinn/Verlust), Risiko (Ø geplantes R · Ø realisiertes R · Max. Tages-Drawdown · Ø Tages-Drawdown), Aktivität (Trades · Handelstage · Ø Tagesvolumen · Ø Haltedauer). Die Beschriftungen richten sich nach dem Glossar der Wording-Spezifikation; benennt diese „Win-Rate“ um, gilt ihr Wort. Tage: Kennzahl-Leiste mit 6 Kacheln (`kstrip`, 3 × 2) → Karte „Tage im Detail“ (Tabelle).
- **Tagesansicht:** Datumszeile (‹ › Datum, Pille „Heute“ | Link „Heute“, „Zertifikat“) → Tageskarte → Trades | Check-in + Regeln → Tagesnotiz | Marktphase. Tabelle: Zeit · Symbol (2 Zellen) · Setup · Fehler · Netto-P&L · R · Score.
- **TradeLog:** Kacheln (folgen Suche und Filter) → Reiter → Filter → Tabelle: Eröffnet · Geschlossen · Symbol (2 Zellen) · Setup · Einstieg · Ausstieg · P&L · R · Regeln · Score. „Verpasste Trades“ folgen Zeitraum und Konto.
- **Fortschritt:** Serie · Heutiger Fortschritt · % Regeln → Tages-Checkliste | (Disziplin pro Woche, Tilt-Profil) → Trading-Aktivität → Regeln im Detail.
- **Prop → Bilanz:** unverändert in der Reihenfolge. Der Planer bekommt einen direkten Zugang aus der Kontokarte.
- **Notebook, mittlere Spalte:** Bei eingeklappter Ordnerspalte (Desktop) und bis 960 px steht über dem Spaltenkopf eine Zeile „wo bin ich“: Ausklapp-Chevron bzw. Zurück-Pfeil, Ordnername oder „Suche in allen Ordnern“, aktiver Tag als Chip mit ×. Keine Anzahl.
- **Coach:** keine Kopfreihe. Gruppen- und Journalkopf gleich gebaut: Zurück, Titel, darunter eine Unterzeile. Reine Schüler sehen „Als Schüler“ links. Journal: 10 Einträge, dann „Mehr anzeigen“. Das Schreibfeld öffnet sich erst über „Notiz schreiben“.
- **Einstellungen → Benachrichtigungen:** Die sieben Bereichsschalter stehen eingerückt (50 px) unter dem Hauptschalter. Ist der Hauptschalter aus, bleiben sie sichtbar, aber deaktiviert (Deckkraft .5), damit der Block nicht springt.
- **Ruhepunkt:** „Hilfe und Beratung“ links unten als unterstrichener Link 13px `--text-2`. Telefonnummern im Hilfe-Dialog unterstrichen.

### 1.9 Wortwahl: neue und geänderte Texte

Regeln: (1) Aktionen tragen ein Verb („Tagesnotiz anlegen“, „Gruppe anlegen“). Menü-Öffner dürfen Nomen sein. (2) **anlegen** für neue Datensätze (Glossar inventar-wording 3.1). (3) Ein Begriff pro Sache: **Erwartungswert**, **Regelwerk** (Schatten-Ich), **Regeln** (Checkliste), **Tagesnotiz**, **Check-in**. (4) Jeder neue Text kommt als Schlüssel in alle fünf Sprachdateien.

| Stelle | vorher | nachher |
|---|---|---|
| Statistiken, Kachel | „Trade-Erwartungswert“ + „Ø Netto-P&L pro Trade“ | „Erwartungswert“, Info „Ø Netto-P&L pro Trade: Netto-P&L geteilt durch Anzahl der Trades.“ |
| Statistiken, neue Kachel | – | „Trades“, Info „Abgeschlossene Trades im Zeitraum.“ |
| Statistiken, Karten | „Serien“ (gemischt), „Haltedauer“ | „Serien“, „Extreme“, „Drawdown & Risiko“; Kurvenkarte „Kumulierter Netto-P&L“; Tabelle „Tage im Detail“ |
| Statistiken, Marktphase | „10 von 10 Trades haben eine Marktphase.“ | nur bei Teilabdeckung: sub „Basis: {0} von {1} Trades“ |
| Tagesansicht | „Trade für diesen Tag“ | entfällt; Tooltip am Kopf-Knopf „Trade für {0} loggen“ |
| Tagesansicht, Check-in-Karte | „Check-in nachtragen“ (auch heute) | heute und später: „Check-in machen“; vergangene Tage: „Check-in nachtragen“ |
| Tagesansicht, Tabelle | „Setup“, „Status“ | „Setup · Fehler“; „Status“ entfällt |
| TradeLog, Tabelle | „Einstiegspreis“, „Ausstiegspreis“, „RR“, „Status“, „Richtung“ | „Einstieg“, „Ausstieg“, „R“; Status und Richtung entfallen als eigene Spalten |
| TradeLog, Kachel | „10 Trades“ | bei aktivem Filter „Gefiltert · {0} Trades“ |
| TradeLog, Verpasste | – | „Keine verpassten Trades im Zeitraum“ / „Ändere den Zeitraum oder das Konto.“ |
| Dashboard, Letzte Trades | Fußzeile „Mehr anzeigen“ | Kopf-Link „Alle Trades“; Info „„Alle Trades“ öffnet das TradeLog“ |
| Dashboard, Vorlage | `title="Vorlage"` | `title="Vorlage: {0}"` |
| Dashboard bearbeiten | aria „Verschieben“, „Widget entfernen“ | „{0} verschieben“, „{0} entfernen“ |
| Fortschritt | „Keine Daten“ / „{0} von {1} Schritten erledigt“ | „{0} / {1}“ / „Schritte erledigt“ |
| Fortschritt, Pfeil | – | Tooltip „{0} Prozentpunkte zum Vorzeitraum“ (mit Vorzeichen) |
| Fortschritt, Checkliste leer | „Noch keine Regeln. Lege unter Einstellungen deine Handelsregeln an, …“ | „Noch keine Regeln.“ + Knopf „Regeln anlegen“ |
| Notebook, Hauptknopf in „Alle Notizen“/„Daily Journal“ | „Neue Notiz“ / „Tag loggen“ | „Tagesnotiz öffnen“ (wenn es eine für heute gibt), sonst „Tagesnotiz anlegen“; Tooltip „Tagesnotiz für heute öffnen oder anlegen“ |
| Notebook, Notiz-Kopf | „Erstellt: …“ / „Zuletzt bearbeitet: …“ (zwei Zeilen) | „Erstellt {0}“ + „ · Bearbeitet {0}“ (eine Zeile, zweiter Teil nur bei Abweichung) |
| Notebook, Datumsknopf | Datumstext | Tagesnotiz mit Datum als Titel: nur Symbol, aria/Tooltip „Datum ändern“; Trade-Notiz: „Trade vom {0}“ |
| Notebook, Liste (Tagesnotiz) | „01.10.2026, 22:00“ | „{0} Trades · \<P&L>“ bzw. „Keine Trades“ |
| Notebook, Ortszeile | – | „Alle Notizen“ / Ordnername / „Suche in allen Ordnern“; aria „Zu den Ordnern“, „Tag-Filter aufheben“ |
| Notebook, Filter | Datumsfelder ohne Label | Abschnitt „Zuletzt bearbeitet“, Labels „Von“, „Bis“; Chip „Bearbeitet: … – …“ statt „Zeitraum: …“ |
| Coach | „+ Gruppe“ | „Gruppe anlegen“ |
| Coach, Eintrag | offenes Textfeld | Knopf „Notiz schreiben“; Liste mit „Mehr anzeigen“ |
| Prop-Karte | „Gewinn fehlt: …“ (Challenge) | entfällt bei Ziel-Balken; bleibt nur Gewinn offen: „nur noch das Ziel“ |
| Einstellungen → Trading | Schalter „Geld-blind-Modus“ | Schalter „Beträge ausblenden“ (Blocktitel bleibt „Geld-blind-Modus“) |
| Einstellungen → Trading | – | Hinweis unter „Tagesverlustlimit“: „Für Tilt-Warnungen und die automatischen Regeln im Fortschritt.“ |
| Einstellungen → Regeln | „Deine Handelsregeln. Sie erscheinen …“ | „Deine Regeln zum Abhaken. Sie erscheinen im Trade-Editor, beim Session-Ende, im Fortschritt und im Regel-Tracker. Messbare Grenzen wie „Max. Trades pro Tag“ stellst du im \<a href="#/shadow">Regelwerk des Schatten-Ichs\</a> ein.“ |
| Einstellungen → Profil | `<b class="neg">Alles löschen</b>` | `<b>Alle Daten löschen</b>` (Knopf „Alles löschen“ bleibt) |
| Einstellungen → Profil | „**1–6** Bereiche“ | „**1–9** Bereiche“ |

---

## 2. Konflikte und Entscheidungen

**K1 – Leere Kopfreihe: `ownActions`, CSS `:empty` oder Leerstring?** Vorgeschlagen sind `ownActions: true` (bereich_einstellungen-3, bereich_konto-25), `.page-head:empty { display:none }` (komponenten-3) und `if (!left && !right) return ''` (ki_look-22, responsiv-19, bereich_shell-9). **Entscheidung: Leerstring in `pageHead`.** `ownActions` bedeutet „die Seite rendert eine eigene Kopfreihe“ (Dashboard, Ruhepunkt) und wäre semantisch falsch. `:empty` greift nicht, weil `.dash-head` Leerraum enthält. Der Leerstring löst Einstellungen und Coach mit einer Zeile. Coach behält sein `head`-Objekt.

**K2 – Wo stehen „Session starten“ und „Trade loggen“?** aufbau-6, ki_look-22, responsiv-19, bereich_konto-37 und hierarchie-45 widersprechen sich (Notebook ja/nein, News ja/nein, Trade loggen auf Coupons und News ja/nein). **Entscheidung: Tabelle 1.3.** Notebook behält Session (README:95, Ordner „Session Recap“). News verliert Session: Es ist eine Lese-Seite, gestartet wird auf den Handelsseiten. Coupons und News behalten „Trade loggen“, weil sie Seiten der Navigation sind und `mobiletest.js:39–40` den runden Knopf auf Coupons verlangt. Affiliate und Einstellungen verlieren „Trade loggen“ wie schon Coach, weil sie über das Konto-Menü erreicht werden und keine Handelsseiten sind. Auf den Einstellungen liegt der runde Knopf am Handy außerdem über den Formularfeldern (responsiv-18).

**K3 – Zeitraum und Konto in der Titelzeile auf allen Seiten** (komponenten-3, bereich_shell-8, Ergänzungen aufbau-3/referenz-2). Die Ursache des Springens ist behoben (`aa9f1c6`). Was bleibt, ist eine Grundsatzentscheidung gegen README:62–64, 144 und 221 und gegen `leaktest.js` (erwartet heute `#tb-tools` leer auf Statistik, Schatten-Ich, Prop, TradeLog). **Entscheidung: Nutzer fragen (F1)**, mit Empfehlung Ja. Die Umsetzungsschritte hängen nicht davon ab: `headLeft`-Inhalte bleiben ohnehin in der Kopfreihe.

**K4 – Tagesansicht: welche Trade-Lösung?** hierarchie-7 (Kopf-Knopf auf den Tag vorbelegen, Datumsknopf weg), ki_look-23 (`trade:false`, Knopf in der Seite), bereich_trades_tag-14 (Datumsknopf umbenennen), responsiv-22 (runden Knopf am Handy ausblenden). **Entscheidung: hierarchie-7.** „Trade loggen“ bleibt auf allen Seiten an derselben Stelle, und der runde Handy-Knopf ist derselbe Knopf. Taste N bekommt dieselbe Vorbelegung (app.html). Die Tagesnavigation per `ctx.headLeft` in die Kopfreihe zu setzen (vorschlag_fakten zu aufbau-5) wird **nicht** umgesetzt. Datumstitel und Konto-Filter würden in einer Reihe vermischt, und das hängt an F1.

**K5 – Statistik-Kurve** (aufbau-19, bereich_statistik-5, responsiv-37, Ergänzungen hierarchie-6/referenz-21/referenz-31). **Entscheidung: Variante bereich_statistik-5.** Reiterleiste zuerst, Kurve als betitelte Karte ohne Legende nur in „Übersicht“. `chartData['stats-top']` wird nur für „Übersicht“ berechnet.

**K6 – 15 oder 16 Kacheln?** W-41 (Wording) will auf 15 kürzen, bereich_statistik-3 und aufbau-20 ersetzen die Doppelung durch „Trades“. **Entscheidung: 16 mit „Trades“.** Die Gesamtzahl der Trades fehlt heute ganz, die Raster-Reihen bleiben voll (4 × 4), README „16 Kennzahlen“ sowie `sixtest.js:39` und `tests/core.test.mjs:100` bleiben gültig. Die Beschriftung „Erwartungswert“ deckt sich mit W-41 und dem Dashboard-Widget.

**K7 – Wochentag doppelt.** bereich_statistik-13 gegen aufbau-17 (Reiter zusammenlegen, abgelehnt) und aufbau-18 (Tagestabelle streichen, abgelehnt). **Entscheidung: bereich_statistik-13.** Die Tabelle in „Tage“ bleibt als „Tage im Detail“.

**K8 – Kopfreihe am Handy, wenn nur der runde Knopf übrig ist.** Zwei CSS-Regeln (bereich_konto-37, responsiv-19). **Entscheidung: Regel aus bereich_konto-37** (`:has(> .dh-tools > .tl:only-child)`). Sie ist enger und vom Prüfer live gemessen.

**K9 – Bearbeitungsmodus.** aufbau-33 (Namen leeren, Leiste bleibt) ist eine Teilmenge von ki_look-13 (Kontur weg, Leiste flach, Namen weg, aria mit Namen). **Entscheidung: ki_look-13.** `.w-name` wird durch `.grow` ersetzt, die Leiste bleibt im Fluss (kein Überlagern, aufbau-33-Prüfer).

**K10 – Einstellungs-Überschriften.** typografie-7 (18/600), bereich_einstellungen-10 (20/600), bereich_shell-29 (19/600). **Entscheidung: 18/600, bis 960 px 16px** (bereich_einstellungen-10). Der Abstand zu h1 (21/600) muss sichtbar bleiben. Die Ausweitung auf Dialogtitel (typografie-7) wird zurückgestellt (Abschnitt 5). Schaltertitel bei Geld-blind: typografie-8 („Geldbeträge ausblenden“) gegen komponenten-41 („Beträge ausblenden“). **Entscheidung: „Beträge ausblenden“**, so heißt dieselbe Funktion schon im Zertifikat (README).

**K11 – Filter-Fenster (typografie-18) intern widersprüchlich.** Titel 15px (vorgaben) oder 14.5px (fakten)? Labels 12/600 (vorgaben) oder 12/500 (vorschlag_fakten)? **Entscheidung:** Titel **bleibt 14.5px** (Titelgröße aller schwebenden Ebenen, häufigste Größe im Zensus). Labels 12/600 `--muted` wie `.field > label` (ein Label-Stil). Eyebrows 11/600, dazu `.popover .sec` von 700 auf 600, damit beide Eyebrows gleich sind und 700 nur Werten bleibt.

**K12 – KPI-Beschriftung und Typografie-Gruppe.** typografie-4 gehört zu dieser Gruppe. Führt die Typografie-Spezifikation Größen-Tokens ein, werden die Werte aus 1.6 auf diese Tokens gemappt. Die Werte selbst (13/500 `--text-2`, 12/500 `--muted`) sind hier verbindlich.

**K13 – Coupons.** Code 600/.08em (vorgaben) oder 700 (vorschlag_fakten)? **Entscheidung: 600 und `.08em`.** Der Code ist ein Text zum Kopieren, kein Messwert, und 700 bleibt nach BRIEF Werten und Hauptknöpfen vorbehalten. Rabatt: 13.5px/400 `--text-2` (nicht 14/500, sonst fast gleichrangig mit dem Firmennamen 15/600). Die Änderung wirkt bewusst auch auf das Affiliate-Ticket.

**K14 – Kalender-Tageszahl.** typografie-32 gegen bereich_dashboard-16 (Farbe-Gruppe, Kreis entfernen). Hier nur Größe und Gewicht: `.cal .d .n` **12px/500 `--text-2`**. Kreis und Fläche regelt die Farbe-Spezifikation.

**K15 – Notiz-Kopf.** bereich_notebook_news-7: „Erstellt“ nur im Tooltip (vorschlag_fakten) widerspricht README:121–122. **Entscheidung:** eine Zeile „Erstellt {0}“ + „ · Bearbeitet {0}“ (nur wenn abweichend), wie schon in der geteilten Ansicht (notebook.js:123).

**K16 – News-Filter am Handy.** Labels ausblenden (vorschlag_fakten) oder zeigen (vorgaben)? **Entscheidung: zeigen.** Sonst steht der Chip „Alle“ ohne Bezug hinter „Feiertage“. Die Chips wischen in einer Zeile.

**K17 – Payout-Planer-CSS.** `.pf-body .card` würde auch die Konto-Karten in „Abgeschlossen“ flach machen. **Entscheidung:** Selektor auf `.prop-fold[data-fold="planer"] > .pf-body` begrenzen.

**K18 – Link Karte → Planer.** `href="#/prop/payout"` (vorschlag_fakten) bricht `proptest.js:95`. **Entscheidung:** `href="#/prop/bilanz"`, die Aktion öffnet Fold und Konto und scrollt per `requestAnimationFrame` (nach dem `scrollTo` in `App.render`).

**K19 – Friedhof-Satz.** Neuer kurzer Satz (vorschlag_fakten) bricht `friedhoftest.js:47`. **Entscheidung:** vorhandenen Satz und Klasse `prop-patterns-empty` wörtlich behalten, als `<p class="small muted prop-patterns-empty">`.

**K20 – Fortschritt, Regeln** (bereich_training-10, Ergänzungen hierarchie-21/aufbau-11, bereich_training-5). **Entscheidung:** Karte „Aktuelle Regeln“ entfällt. „Regeln bearbeiten“ wird zweiter Knopf im Kopf der Tages-Checkliste, ohne Stift-Symbol und nur, wenn Regeln existieren. Der Leerzustand der Checkliste bekommt den Knopf „Regeln anlegen“ (Text + `btn sm`, kein grüner `.more-link`). Damit erledigt sich der falsche Link in progress.js:77 durch Entfernen.

**K21 – Prop „Aktive Konten“.** Die Textlogik `f.status ? 'Konten' : 'Aktive Konten'` bleibt (bereich_prop-7-Prüfer). Gruppentitel 13/600 nach der Gewichtsregel (Titel 600), nicht 500 (referenz-42).

**K22 – Prop „Gewinn fehlt“.** Die vorgeschlagene Bedingung `plan.funded` allein ließe bei Challenge-Konten **ohne** Profit-Target-Balken die Information verschwinden. **Entscheidung:** `plan.funded || !ev.target`.

**K23 – Kachelleiste mit 4 Kacheln.** `minmax(170px)` (vorschlag_fakten zu bereich_konto-29) würde auch 5er- und 6er-Leisten umbrechen lassen (5+1 bei 1280 px). **Entscheidung:** gezielte Regeln über `:has()`: genau 4 Kacheln → 4 Spalten, genau 6 Kacheln → 3 Spalten (ab 961 px).

**K24 – Einstellungen → Inhalte.** Den Reiter „Kategorien“ zu streichen entfernt eine Ansicht (F7). **Sofort und ohne Verlust:** Standard-Reiter „Tags“ und Reihenfolge „Tags · Kategorien“. Damit führt der Hinweis im Schatten-Ich (shadow.js:49) auf die bearbeitbare Liste statt in eine Sackgasse.

**K25 – Notebook-Filter.** Ordner und Tag aus dem Filter zu nehmen (bereich_notebook_news-9) entfernt die Möglichkeit, eine Suche auf einen Ordner einzugrenzen (F11). **Sofort:** nur sichtbare Labels und Abschnittstitel für die Datumsfelder.

**K26 – Wortwahl.** „Gruppe erstellen“ (bereich_konto-40) → **„Gruppe anlegen“** (Glossar: anlegen für Datensätze). „Tagesnotiz“ als Knopftext (bereich_notebook_news-6) → **„Tagesnotiz öffnen“ / „Tagesnotiz anlegen“** (Aktionen tragen ein Verb).

**K27 – TradeLog-Sortierung.** Mit den Spalten Status und Richtung entfällt deren Sortierung. Status deckt der Filter „Alle Ergebnisse“ ab. Die Sortierung nach „Symbol“ ordnet innerhalb eines Symbols Long vor Short. Das ist kein Funktionsverlust im Sinn von F-Fragen, nur eine andere Sortierachse.

**K28 – Aufbau-Regeln und Ruhepunkt-Check-in sind Produktentscheidungen.** aufbau-8 (Teile a–c) und aufbau-9 verändern Datenwege und vom Nutzer gelieferte Abläufe (docs/ruhepunkt.html). Umgesetzt wird nur die Klarstellung (aufbau-8 d). Der Rest steht in F3/F4.

---

## 3. Umsetzungsschritte

Reihenfolge: **A** Tokens und Skalen → **B** Komponenten → **C** Einzelstellen → **D** Übersetzungen, README, Tests. Zeilennummern beziehen sich auf HEAD `677b630`; wenn andere Spezifikationen vorher Zeilen verschieben, gelten die genannten Selektoren und Funktionen.

### A – Tokens und Skalen (`web/css/app.css`)

**A1 Token für Kachelwerte** · typografie-6, bereich_prop-30
- `:root` (nach Z. 51 `--page-head-h`): neu `--tile-val: 24px;`
- Im Block `@media (max-width: 960px)` (ab Z. 916): neu `:root { --tile-val: 22px; }`
- Im Block `@media (max-width: 560px)` (ab Z. 2978): neu `:root { --tile-val: 20px; }`

**A2 Kachelwerte auf das Token** · typografie-6
- Z. 540 `.tile .val { …; font-size: 25px; … }` → `font-size: var(--tile-val);`
- Z. 639 `.stat-tile .v { …; font-size: 24px; … }` → `font-size: var(--tile-val);`
- Z. 1735 `.tile.spark-tile .val { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; flex: 0 0 auto; … }` → `.tile.spark-tile .val { flex: 0 0 auto; display: flex; align-items: center; margin: 0; padding: 0; min-height: 0; }` (Schrift erbt von `.tile .val`)
- Löschen: Z. 2397 `.shadow-tiles .tile.shadow-main .val { font-size: 34px; }`, Z. 2446 (Handy 26px), Z. 2684 `.prop-tiles .tile .val { font-size: 24px; }`, Z. 2742 (20px), Z. 936 `.tile .val { font-size: 22px; }`, Z. 3027 `.tile .val { font-size: 21px; }`, Z. 3038 `.stat-tile .v { font-size: 20px; }`
- Bleiben: Z. 533 (Container ≤164px, 22px), Z. 2945 (`.coach-gs-tiles`, 21px), Z. 2700 (`.prop-balance .val`, 26px)

**A3 KPI-Beschriftung** · typografie-4
- Nach Z. 101 neu:
  ```css
  .kpi-label { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; line-height: 18px; color: var(--text-2); }
  .kpi-label.sm { font-size: 12px; color: var(--muted); }
  ```
- Z. 517 `.tile .head { … font-size: 13.5px; … }` → `font-size: 13px;`
- Z. 637 `.stat-tile .k { …; font-size: 13px; color: var(--text-2); }` → zusätzlich `font-weight: 500;`
- Z. 647 `.stat .k { … }` → zusätzlich `font-weight: 500;`
- Z. 793 `.strat-stats .k { font-size: 11px; color: var(--muted); }` → `font-size: 12px; font-weight: 500; color: var(--muted);`
- Z. 910 `.day-card .stats .k { font-size: 11px; … }` → `font-size: 12px; font-weight: 500; color: var(--muted);`
- Z. 1035 `.nb .stats-grid .k { font-size: 11px; … }` → `font-size: 12px; font-weight: 500; color: var(--muted);`
- Z. 1455 `.fw-stats > div > span { font-size: 11.5px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }` → `font-size: 12px; font-weight: 500;` (Rest bleibt). Danach bei 1440 und 1024 px prüfen: Wird „Disziplin-Kosten“ stärker abgeschnitten als heute, dann Z. 1453 `.fw-stats { … gap: 10px; … }` → `gap: 8px;`
- Z. 1463 `.fw-lbl { font-size: 12.5px; color: var(--text-2); font-weight: 600; }` → `font-size: 13px; color: var(--text-2); font-weight: 500;`

**A4 Überschriften-Treppe** · barrierefreiheit-41, typografie-7, typografie-8, hierarchie-33, bereich_konto-20, bereich_notebook_news-44, bereich_prop-7, typografie-18, typografie-32
- Z. 491 `.card-title { display: flex; …; font-size: 15px; }` → am Ende ergänzen `letter-spacing: normal; text-wrap: wrap;` (hebt Z. 90 für das neue `h2` auf)
- Z. 1815 `.set-head h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }` → `.set-head h2 { font-size: 18px; font-weight: 600; line-height: 24px; letter-spacing: 0; }`
- Im 960-Block (ab Z. 916) neu: `.set-head h2 { font-size: 16px; line-height: 22px; }`
- Z. 1816 `.set-head p { margin-top: 4px; font-size: 13.5px; }` → `font-size: 13px;`
- Z. 1818 `.set-block h3 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }` → `font-size: 15px; font-weight: 600; margin-bottom: 10px;`
- Z. 1865 `.set-row b { display: block; margin-bottom: 2px; }` → `display: block; margin-bottom: 2px; font-size: 14px; font-weight: 500; color: var(--text);`, danach neu: `.set-body .check b, .set-body .row.between > div > b, .set-body .avatar-row b { font-size: 14px; font-weight: 500; color: var(--text); }`
- Nach Z. 2876 neu:
  ```css
  .ce-body .ql-editor h1 { font-size: 16px; } .ce-body .ql-editor h2 { font-size: 15px; } .ce-body .ql-editor h3 { font-size: 14.5px; }
  .ce-body .ql-editor :is(h1, h2, h3) { margin: 10px 0 4px; font-weight: 600; }
  ```
- Z. 3084 `.nw-dh { …; font-size: 13px; font-weight: 600; … }` → `font-size: 14px;`
- Z. 2715 `.prop-group-title b { font-family: var(--font-display); font-size: 15px; }` → `.prop-group-title b { font-size: 13px; font-weight: 600; color: var(--text-2); }`
- Z. 341 `.popover .sec { …; font-weight: 700; }` → `font-weight: 600;`
- Z. 1355 `.fd-pop .fd-gh { padding: 9px 2px; font-size: 13px; }` → `.fd-pop .fd-gh { padding: 10px 2px 6px; font-family: var(--font); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }` (Pfeil und Zähler bleiben)
- Z. 1360 `.fd-pop .fd-l { font-size: 11.5px; }` → `.fd-pop .fd-l { font-size: 12px; color: var(--muted); }` (600 erbt aus Z. 1381)
- Z. 1386 `.fd-seg button`, Z. 1388 `.fd-tog button`, Z. 1400 `.fd-chip`, Z. 1407 `.fd-add`: jeweils `font-weight: 600` → `font-weight: 500`
- Z. 703 `.cal .wd { …; font-size: 12.5px; font-weight: 600; color: var(--text-2); … }` → `font-size: 12px; font-weight: 500; color: var(--muted);` (Rand, Radius, Fläche bleiben)
- Z. 708 `.cal .d .n { …; font-size: 11.5px; font-weight: 600; …; color: var(--text-2); }` → `font-size: 12px; font-weight: 500;` (Kreis und Fläche: Farbe-Spezifikation)
- Z. 1685 `.ycal-head span { …; font-size: 12.5px; color: var(--text-2); … }` → `font-size: 12px; font-weight: 500; color: var(--muted);`

### B – Komponenten

**B1 `pageHead` und `newTradeButton`** (`web/js/app.js` Z. 253–262) · bereich_einstellungen-3, responsiv-18, ki_look-22, bereich_konto-25, responsiv-19, bereich_trades_tag-16, hierarchie-7, hierarchie-19
```js
newTradeButton(tip) { return `<button type="button" class="btn accent tl" data-action="new-trade"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.plus}<span>Trade loggen</span></button>`; },
pageHead(screen, ctx) {
  const sh = typeof screen.head === 'function' ? screen.head(ctx) : screen.head;
  const h = Object.assign({ range: true, account: true, session: true, trade: true, note: '', tradeTip: '' }, sh);
  const own = screen.actions ? screen.actions(ctx) : '';
  const left = /* unverändert */;
  const right = `${own}${h.session ? this.sessionControl(true) : ''}${h.trade ? `${own || h.session ? '<span class="dh-sep" aria-hidden="true"></span>' : ''}${this.newTradeButton(h.tradeTip)}` : ''}`;
  if (!left && !right) return ''; /* keine leere Kopfreihe (Einstellungen, Coach) */
  return /* unverändert */;
},
```
Kommentar über `pageHead` ergänzen: „screen.head darf eine Funktion von ctx sein (Trade-Ansicht, Tagesansicht)“. Das Dashboard ruft `App.newTradeButton()` ohne Argument auf und bleibt unverändert.

**B2 Kopfreihe am Handy ohne leeren Streifen** (`web/css/app.css`, Block ab Z. 2978, direkt nach Z. 3002 `.dash-head .dh-sep { display: none; }`) · bereich_konto-37, responsiv-19
```css
.page-head:not(:has(> .dh-context)):has(> .dh-tools > .tl:only-child) { min-height: 0; padding-bottom: 0; }
```

**B3 Avatar nur am Handy, gleiche Initialen** · aufbau-7, bereich_shell-11
- `web/js/app.js`, `userCard` Z. 219–223: Die Namenslogik (`full`, `user`, `name`, `initials`) wird zu einer neuen Methode `userName() { …; return { name, initials, sub }; }` im App-Objekt. `userCard` ruft sie auf.
- `topbar` Z. 264: `const initials = (S.settings.name || 'T')…` → `const { initials } = this.userName();`
- `web/css/app.css` nach Z. 264 neu: `@media (min-width: 961px) { .topbar .avatar, .boot-top .skel.av { display: none; } }`
- Z. 221 Kommentar „richtet sich am rechten Rand der Titelzeile (Avatar) aus“ → „… am rechten Rand der Titelzeile aus“
- Bedingt: Nach dem Ausblenden bei 1100 px Breite messen, ob Zeitraum, Konto und Filter **mit** Beschriftung in `#tb-tools` in eine Reihe passen (`.tb-tools` Höhe ≤ 40 px). Wenn ja, Z. 1332 `@media (min-width: 961px) and (max-width: 1180px)` → `(max-width: 1100px)`. Wenn nein, bleibt 1180.

**B4 Konto-Menü** (`web/js/app.js` Z. 226–232) · bereich_shell-27
```js
const sp = cur === 'settings' ? (this.state.params[0] || 'profil') : null;
/* Popover-Inhalt: */
link('#/settings/profil', 'account', 'Profil', '', sp === 'profil')
+ link('#/settings', 'settings', 'Einstellungen', '', !!sp && !['profil', 'benachrichtigungen', 'sprache'].includes(sp))
+ link('#/settings/benachrichtigungen', 'bell', 'Benachrichtigungen', '', sp === 'benachrichtigungen')
+ link('#/settings/sprache', 'globe', 'Sprache', '', sp === 'sprache')
+ '<div class="sb-menu-sep"></div>'
+ link('#/coach', 'coach', 'Coach', cdot, cur === 'coach')
+ link('#/affiliate', 'affiliate', 'Affiliate', '', cur === 'affiliate')
+ '<div class="sb-menu-sep"></div>' + /* Zeile „Design“ mit Hell/Dunkel unverändert */
```
Kommentar Z. 216–218 auf die neue Reihenfolge anpassen.

**B5 Konten-Link** (`web/js/app.js` Z. 244, `accountControl`) · aufbau-10, bereich_dashboard-33, bereich_training-5
`<a class="item" href="#/settings">${I.settings} Konten verwalten</a>` → `href="#/settings/konten"`

**B6 `new-trade` mit Tag** (`web/js/app.js` Z. 324) · hierarchie-7
```js
'new-trade'() {
  const k = this.state.route === 'day' && this.state.params[0];
  if (k && k !== C.dayKey(new Date())) { const d = C.parseDayKey(k); if (!isNaN(d)) { d.setHours(9, 0, 0, 0); return this.openTradeEditor(null, { openedAt: d.toISOString() }); } }
  this.openTradeEditor(null);
},
```

**B7 Tastatur** (`web/app.html` Z. 95–96) · aufbau-21, hierarchie-7
`if (map[e.key]) { location.hash = '#/' + map[e.key]; } else if (e.key === 'n' || e.key === 'N') { App.openTradeEditor(null); }` →
`if (map[e.key]) { if (App.on(map[e.key])) location.hash = '#/' + map[e.key]; } else if (e.key === 'n' || e.key === 'N') { App.actions['new-trade'].call(App); }`

**B8 Kartentitel als Überschrift** (`web/js/ui.js` Z. 170, `card`) · barrierefreiheit-41
`<div class="card-title">…</div>` → `<h2 class="card-title">…</h2>` (CSS siehe A4). Die von Hand geschriebenen `div.card-title` (coach.js:101, replay.js:23) bleiben.

**B9 Symbol „award“** (`web/js/ui.js` nach Z. 72 `shield: …`) · bereich_dashboard-23
`award: sv('<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>'),`

**B10 Balken-Tooltip mit Summe** (`web/js/ui.js` Z. 327, `drawers.vbars`) · bereich_statistik-13
`data-tip="<b>…</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${g.s.n} Trades · Win-Rate …"` →
`data-tip="<b>…</b>: ${fmt.cur(v, { signed: true })}${perTrade ? ' pro Trade' : ''}<br>${perTrade ? `Summe ${fmt.cur(g.s.total, { signed: true })} · ` : ''}${g.s.n} Trades · Win-Rate …"`

**B11 Kachelleisten mit 4 und 6 Kacheln** (`web/css/app.css` nach Z. 2604) · bereich_konto-29, bereich_statistik-13
```css
@media (min-width: 961px) {
  .grid.tiles.kstrip:has(> .tile:nth-child(4):last-child) { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .grid.tiles.kstrip:has(> .tile:nth-child(6):last-child) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```
Bis 960 px gilt weiter Z. 2738 (`1fr 1fr`).

**B12 Ein Muster für „mehr dazu“** (`web/css/app.css` Z. 1658–1660) · bereich_dashboard-33
- Z. 1658 `.more-row { … }` löschen (nach C2 unbenutzt; mit `grep -rn more-row web/` prüfen)
- Z. 1659 `.more-link { color: var(--accent); font-weight: 600; font-size: 13px; text-decoration: none; }` → `.more-link { color: var(--text-2); font-weight: 500; font-size: 13px; text-decoration: none; }`
- Z. 1660 `.more-link:hover { text-decoration: underline; }` → `.more-link:hover { color: var(--text); }`

**B13 Bearbeitungsmodus flach** (`web/css/app.css` Z. 1569–1579) · ki_look-13, aufbau-33
- Z. 1569 `.w.editing { outline: 1.5px dashed var(--border-2); outline-offset: 5px; border-radius: var(--radius); }` → `.w.editing { border-radius: var(--radius); }`
- Z. 1574 `.w-bar { …; padding: 4px 6px; margin-bottom: 8px; border-radius: 10px; border: 1px solid var(--border-2); background: var(--surface-2); … }` → `padding: 0; margin-bottom: 6px; border: 0; background: none;` (Rest bleibt)
- Z. 1579 `.w-bar .w-name { … }` löschen
- Drop-Markierung `.over-l`/`.over-r` (Z. 1572–1573) bleibt unverändert.

**B14 Unterschalter eingerückt** (`web/css/app.css` nach Z. 1865) · bereich_einstellungen-33
```css
.set-sub { margin-left: 50px; display: flex; flex-direction: column; gap: 12px; padding-top: 14px; border-top: 1px solid var(--border); }
.set-sub[aria-disabled="true"] { opacity: .5; }
.switch:disabled { cursor: default; }
```

### C – Einzelstellen

#### `web/js/core.js`

**C1 Statistik-Kacheln** (`stats16`, Z. 312–330) · bereich_statistik-3, aufbau-20
Eintrag `expectancy` (Z. 316) löschen. Reihenfolge der `items`:
1. `netPnL`
2. `avgTrade` mit `label: 'Erwartungswert', info: 'Ø Netto-P&L pro Trade: Netto-P&L geteilt durch Anzahl der Trades.'`
3. `avgDay`
4. `pf`
5. `winRate`
6. `dayWinRate`
7. `payoff`
8. `dayPayoff`
9. `plannedR`
10. `realizedR`
11. `maxDayDD`
12. `avgDayDD`
13. neu `{ key: 'trades', label: 'Trades', type: 'int', v: s.n, info: 'Abgeschlossene Trades im Zeitraum.' }`
14. `days`
15. `avgVolume`
16. `hold`

Alle anderen Einträge bleiben wörtlich (Beschriftungen, die die Wording-Spezifikation ändert, gelten dort). `s.tradeExpectancy` (Z. 93) bleibt für das Dashboard-Widget.

#### `web/js/widgets.js`

**C2** · bereich_dashboard-33, aufbau-10, bereich_training-5, typografie-4
- Z. 253 Info von `letzte_trades`: „… „Mehr anzeigen“ öffnet das TradeLog.“ → „… „Alle Trades“ öffnet das TradeLog.“
- Z. 257: `…${table}<div class="more-row"><a class="more-link" href="#/trades">Mehr anzeigen</a></div>`, `{ info: e.info, cls: 'recent-card' }` → `…${table}`, `{ info: e.info, cls: 'recent-card', trailing: more('#/trades', 'Alle Trades') }` (`more` aus Z. 307 wird zur Renderzeit aufgerufen)
- Z. 288 Regel-Tracker: `{ trailing: `<a class="more-link" href="#/progress">Mehr anzeigen</a>` }` streichen (Knopf „Tages-Checkliste“ bleibt). Im Leertext `<a href="#/settings">` → `<a href="#/settings/regeln">`
- Z. 184 `<div class="caption">${label}</div>` → `<div class="kpi-label">${label}</div>`
- Z. 227 `<div class="caption">Dein Score</div>` → `<div class="kpi-label">Dein Score</div>`
- Z. 287 `<div class="caption" style="text-transform:none;letter-spacing:0;font-size:13px;font-weight:600;color:var(--text-2)">Heutiger Score …` → `<div class="kpi-label">Heutiger Score …`

#### `web/js/screens/affiliate.js`

**C3** · hierarchie-45, bereich_konto-37, bereich_konto-29, responsiv-19, aufbau-6, ki_look-22
- Z. 73 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false, trade: false }, /* Konto-Menü-Seite: keine Handelsknöpfe, „Trade loggen“ gibt es auf allen Seiten der Navigation */`
- Neu im Screen-Objekt: `actions: () => U.pill('Beispieldaten', 'neutral'),`
- `render(ctx)` Z. 79–80: `const top = …; return `<div class="aff">${top}…`` → `ctx.headLeft = nav(view) + pick; return `<div class="aff">${view === 'creator' ? creator(d, c) : admin(d)}</div>`;` (kein `data-subnav` an der Navigation, sonst blendet app.css:116–117 falsch ein)
- `admin` Z. 57: `${U.tile('Creator', String(d.creators.length))}` streichen. Kartentitel bleibt „Creator“ ohne Zahl.
- `web/css/app.css`: Z. 2663–2664 (`.aff-top`, `.aff-top .grow`) löschen; Z. 2987 `.aff-top .aff-pick { flex: 1; min-width: 0; }` → `.page-head .aff-pick { flex: 1; min-width: 0; }`

#### `web/js/screens/coach.js`

**C4** · bereich_konto-19, bereich_konto-25, bereich_konto-40
- Z. 10 Startwerte von `st()`: `…, mail: null }` → `…, mail: null, open: {}, jlimit: 10 }`
- `entryHTML` Z. 140: Ist weder `s.open[e.id]` noch `(s.draft[e.id] || '').trim()` gesetzt, statt Textfeld und Senden ausgeben: `<div class="ce-write closed"><button type="button" class="btn sm ghost" data-action="coach-note-open" data-id="${esc(e.id)}">${I.chat} Notiz schreiben</button></div>`. Sonst wie bisher.
- CSS (`web/css/app.css`, bei den `.ce-*`-Regeln um Z. 2874): `.ce-write.closed { justify-content: flex-end; }`
- Neue Aktion: `'coach-note-open'(el) { st().open[el.dataset.id] = true; App.rerender(); requestAnimationFrame(() => { const t = document.querySelector(`textarea[data-input="coach-note-draft"][data-id="${CSS.escape(el.dataset.id)}"]`); if (t) t.focus(); }); },`
- `'coach-note-send'` (Z. 297): nach Erfolg zusätzlich `delete st().open[el.dataset.id];`
- `journal` Z. 155: `j.entries.map(…)` → `j.entries.slice(0, s.jlimit).map(…)`; darunter, wenn `j.entries.length > s.jlimit`: `<div class="aff-more"><button type="button" class="btn sm ghost" data-action="coach-more">Mehr anzeigen</button></div>`. Neue Aktion `'coach-more'() { st().jlimit += 10; App.rerender(); },`. Der Kopf zählt weiter alle Einträge.
- `mount` (Z. 233, nach `const entered = …`): `if (entered && v[0] === 'journal') { s.jlimit = 10; s.open = {}; }`
- Journalkopf Z. 157: `<div class="row">${back(…, 'Gruppe')}<h2 class="coach-title no-i18n">${esc(name)}</h2>${j ? `<span class="small muted">…</span>` : ''}</div>` → `<div class="row">${back(…, 'Gruppe')}<div><h2 class="coach-title no-i18n">${esc(name)}</h2>${j ? `<div class="small muted">…bisheriger Inhalt des span…</div>` : ''}</div></div>`
- `hub` Z. 52–54: beide Karten als Variablen `mentorCard`, `studentCard`. Bei `c.groups.length && !c.own.length && !c.coached.length` → `${studentCard}${mentorCard}`, sonst `${mentorCard}${studentCard}`. Knopf `${I.plus} Gruppe` → `${I.plus} Gruppe anlegen` (Klasse regelt die Komponenten-Spezifikation, bereich_konto-5).
- Z. 218 `head` bleibt (alles `false`), B1 sorgt dafür, dass keine Kopfreihe entsteht.

#### `web/js/screens/coupons.js`

**C5** · bereich_konto-37, responsiv-19, aufbau-6, ki_look-22
Z. 10 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false }, /* „Session starten“ gibt es auf TradeLog, Tagesansicht, Fortschritt und Notebook */`
CSS (`web/css/app.css`) · bereich_konto-48:
- Z. 2648 `.cpn-off { font-size: 13px; color: var(--muted); }` → `.cpn-off { font-size: 13.5px; color: var(--text-2); }`
- Z. 2649 `.cpn-code { … font-weight: 700; … letter-spacing: .12em; … }` → `font-weight: 600; letter-spacing: .08em;`

#### `web/js/screens/dashboard.js`

**C6** · bereich_dashboard-23, ki_look-13, aufbau-33
- Z. 125 Vorlagen-Knopf: `title="Vorlage"` → `title="Vorlage: ${esc(tpl.name)}"` (Position und Form bleiben, README:64)
- Z. 125 Zertifikat-Knopf: `${I.shield}` → `${I.award}`
- `wrap` Z. 41: `<span class="w-name">${esc(e.name || inst.typ)}</span>` → `<span class="grow" aria-hidden="true"></span>`; am Griff `aria-label="Verschieben"` → `aria-label="${esc(e.name || inst.typ)} verschieben"`; am × `aria-label="Widget entfernen"` → `aria-label="${esc(e.name || inst.typ)} entfernen"`

#### `web/js/screens/day.js`

**C7** · aufbau-5, responsiv-22, hierarchie-19, hierarchie-7, hierarchie-15, hierarchie-16, bereich_trades_tag-18, aufbau-10, bereich_training-5, bereich_dashboard-23
- `App.screens.day` nach `title` neu:
  ```js
  /* der Tag kommt aus der Adresse; der Zeitraum wirkt hier nicht (ctx.all). „Trade loggen“ legt an anderen Tagen den Trade auf diesen Tag */
  head: ctx => { const k = ctx.params[0]; const d = k ? C.parseDayKey(k) : null; return { range: false, tradeTip: k && k !== C.dayKey(new Date()) && !isNaN(d) ? `Trade für ${fmt.dateFull(d)} loggen` : '' }; },
  ```
- Z. 12 `nav`: den Knopf `data-action="check-in"` (`Check-in` / `Check-in bearbeiten`) und den Knopf `data-action="new-trade-day"` (`Trade für diesen Tag`) entfernen. `${I.shield} Zertifikat` → `${I.award} Zertifikat`.
- Z. 15 Tabelle: Kopf `<th>Zeit</th><th colspan="2">Symbol</th><th>Setup</th><th>Status</th><th class="r">Netto-P&L</th>…` → `<th>Zeit</th><th colspan="2">Symbol</th><th>Setup · Fehler</th><th class="r">Netto-P&L</th><th class="r">R</th><th class="r">Score</th>`. Zelle `<td>${U.statusPill(t.status)}</td>` entfernen. P&L-Zelle `${t.closed ? U.pnl(t.pnl, '', { r: t.r }) : '—'}` → `${!t.closed ? U.statusPill('open') : t.status === 'be' ? `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>` : U.pnl(t.pnl, '', { r: t.r })}`
- Z. 16 Leerzustand der Check-in-Karte: Knopftext `Check-in nachtragen` → `${key < C.dayKey(new Date()) ? 'Check-in nachtragen' : 'Check-in machen'}`
- Z. 18 `<a class="btn sm" href="#/settings">Regeln anlegen</a>` → `href="#/settings/regeln"`
- Z. 24 Aktion `'new-trade-day'` löschen (kein Test nutzt sie)
- Danach bei 1440 px prüfen: Tabelle ohne waagerechtes Scrollen (R und Score sichtbar). Sonst `style="min-width:560px"` → `min-width:520px`.

#### `web/js/screens/misc.js` (Einstellungen)

**C8** · bereich_einstellungen-3, responsiv-18, ki_look-22, aufbau-6, hierarchie-19, typografie-8, hierarchie-33, bereich_einstellungen-33, bereich_einstellungen-5, aufbau-8, aufbau-21, bereich_einstellungen-36
- `App.screens.settings` nach Z. 18 `title`: `head: { range: false, account: false, session: false, trade: false }, /* Einstellungen sind keine Journal-Ansicht: keine Kopfreihe */`
- `trading()` Z. 197: `switchRow('Geld-blind-Modus', …)` → `switchRow('Beträge ausblenden', …)`; `<h3>Geld-blind-Modus</h3>` bleibt.
- `trading()` Z. 199, Feld `se-loss`: nach dem `<input … id="se-loss" …>` ergänzen: `<span class="hint">Für Tilt-Warnungen und die automatischen Regeln im Fortschritt.</span>`
- `profil()` Z. 68 `<b class="neg">Alles löschen</b>` → `<b>Alle Daten löschen</b>`
- `profil()` Z. 69 `<b>1–6</b> Bereiche` → `<b>1–9</b> Bereiche`
- `timezones()` Z. 41: vor dem `return list;` → `const sys = Intl.DateTimeFormat().resolvedOptions().timeZone; if (sys && !list.includes(sys)) list = [sys, ...list];` (wie prop.js:147). `profil()` Z. 54: `const zones = timezones(); if (tz && !zones.includes(tz)) zones.unshift(tz);` und `zones.map(…)` statt `timezones().map(…)`
- Benachrichtigungen Z. 176: `${nd.on ? App.NAV_DOT_AREAS.map(…).join('') : ''}` → `<div class="set-sub"${nd.on ? '' : ' aria-disabled="true"'}>${App.NAV_DOT_AREAS.map(([k, label, desc]) => switchRow(label, desc, 'navdot-toggle', nd[k] !== false, `data-key="${k}"${nd.on ? '' : ' disabled'}`)).join('')}</div>`
- `regeln()` Z. 207 Untertitel → Text aus 1.9 (der `<a href="#/shadow">` wird von `head()` als HTML ausgegeben)
- `ui()` Z. 13 `contentTab: 'kategorien'` → `contentTab: 'tags'`; `inhalte()` Z. 231 Reiterfolge `[['kategorien', 'Kategorien'], ['tags', 'Tags']]` → `[['tags', 'Tags'], ['kategorien', 'Kategorien']]`

#### `web/js/screens/news.js`

**C9** · bereich_notebook_news-39, bereich_notebook_news-44, aufbau-6, ki_look-22, responsiv-19
- Z. 65 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false },`
- Z. 67 `render()` → `render(ctx)`
- Vor dem `return` (Z. 99): `ctx.headLeft = ok && !s.events ? '' : filters;` (keine Filter beim Laden oder im Fehlerzustand)
- Z. 88 `body = `${hero}${filters}${…}`` → `body = `${hero}${…}``
- Z. 81 `<span class="nw-n">${g.items.length}</span>` streichen; `web/css/app.css` Regel `.nw-n` löschen
- CSS (`web/css/app.css`, nach Z. 1340):
  ```css
  .page-head .dh-context:has(> .nw-filters) { flex: 1 1 0; min-width: 0; }
  ```
  Im 560-Block (ab Z. 2978):
  ```css
  .page-head .nw-filters { flex: 1 1 0; min-width: 0; flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; }
  .page-head .nw-filters::-webkit-scrollbar { display: none; }
  .page-head .nw-fg, .page-head .nw-fg .chips { flex: 0 0 auto; flex-wrap: nowrap; }
  ```
  Die Beschriftungen „Wichtigkeit“ und „Währung“ bleiben sichtbar.

#### `web/js/screens/notebook.js`

**C10** · bereich_notebook_news-10, bereich_notebook_news-6, bereich_notebook_news-7, bereich_notebook_news-8, bereich_notebook_news-9 (nur Labels)
- `render`, mittlere Spalte Z. 61: Vor `<div class="col-head">` (nicht im Papierkorb) einfügen:
  ```js
  const where = nb.q ? 'Suche in allen Ordnern' : nb.folder === 'all' ? 'Alle Notizen' : (S.getFolder(nb.folder) || {}).name || '';
  const tagName = nb.tag ? (S.noteTags().find(t => t.id === nb.tag) || {}).name || '' : '';
  const whereRow = nb.folder === 'trash' ? '' : `<div class="nb-where">${!nb.leftOpen ? `<button type="button" class="btn ghost icon sm" data-action="nb-left-toggle" aria-label="Ordner anzeigen" data-tip="Ordner anzeigen">${I.chevR}</button>` : ''}<button type="button" class="btn ghost icon sm back" data-action="nb-view" data-value="folders" aria-label="Zu den Ordnern">${I.back}</button><span class="grow">${esc(where)}</span>${nb.tag ? `<button type="button" class="chip" data-action="nb-tag" data-id="${esc(nb.tag)}" aria-label="Tag-Filter aufheben"># ${esc(tagName)} ${I.close}</button>` : ''}</div>`;
  ```
  Im bisherigen `.col-head` den Chevron-Knopf (`!nb.leftOpen ? …chevR…`) und den Zurück-Knopf (`… back … data-value="folders"`) entfernen, **außer** im Papierkorb (dort bleibt der Zurück-Knopf im Kopf).
  CSS (`web/css/app.css`, bei den `.nb`-Regeln um Z. 1060):
  ```css
  .nb .nb-where { display: none; align-items: center; gap: 6px; padding: 10px 12px 0; font-size: 13.5px; font-weight: 600; color: var(--text); min-width: 0; }
  .nb .nb-where .grow { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nb.no-left .nb-where { display: flex; }
  @media (max-width: 960px) { .nb .nb-where { display: flex; } }
  ```
- Hauptknopf Z. 61: `${isDaily ? 'Tag loggen' : 'Neue Notiz'}` → `const dayBtn = nb.folder === 'all' || isDaily; const hasToday = !!S.dayNote(C.dayKey(new Date()));` und Text `${dayBtn ? (hasToday ? 'Tagesnotiz öffnen' : 'Tagesnotiz anlegen') : 'Neue Notiz'}`, bei `dayBtn` zusätzlich `data-tip="Tagesnotiz für heute öffnen oder anlegen"`. Leertext Z. 63 und Knopf in der rechten Spalte Z. 66 nach derselben Regel.
- Aktion `'nb-new'` Z. 136: Der Zweig `if (folderId === 'daily') { const key = …; n = S.dayNote(key) ? S.addNote({…}) : S.dayNote(key, true); }` → `if (folderId === 'daily') n = S.dayNote(C.dayKey(new Date()), true);` (öffnet die vorhandene Tagesnotiz, legt keine Doublette an)
- Notiz-Kopf Z. 76: `<div>Erstellt: ${fmt.dateTime(cur.createdAt)}</div><div id="nb-updated">Zuletzt bearbeitet: ${…}</div>` → `const c = fmt.dateTime(cur.createdAt), u = fmt.dateTime(cur.updatedAt || cur.createdAt);` und `<div><span>Erstellt ${c}</span><span id="nb-updated"${u === c ? ' hidden' : ''}> · Bearbeitet ${u}</span></div>` (P&L-Zeile darunter bleibt)
- `flush()` Z. 101: `u.textContent = 'Zuletzt bearbeitet: ' + fmt.dateTime(n.updatedAt);` → `u.hidden = false; u.textContent = ' · Bearbeitet ' + fmt.dateTime(n.updatedAt);`
- Datumsknopf Z. 73: Bei `cur.type === 'day' && cur.title === S.dayTitle(dateKey)` → `<button type="button" class="datebtn" data-pop="nbdate" aria-label="Datum ändern" data-tip="Datum ändern">${I.calendar}${I.chev}</button>`. Bei `cur.type === 'trade'` → Text `Trade vom ${esc(S.dayTitle(dateKey))}`. Sonst unverändert. Die Klasse `.datebtn` bleibt (mobiletest.js:53).
- Notizliste Z. 60: vor `notes.map` `const byDay = new Map(); for (const t of App.allTrades()) (byDay.get(t.dayKey) || byDay.set(t.dayKey, []).get(t.dayKey)).push(t);`. Für `n.type === 'day' && !n.deletedAt` statt `<div class="d" data-nb-date="${n.id}">…</div>` ausgeben: `const ts = byDay.get(n.dateKey) || []; const cl = ts.filter(t => t.closed);` → `<div class="d">${ts.length ? `${ts.length} Trade${ts.length === 1 ? '' : 's'}${cl.length ? ` · ${U.pnl(C.sum(cl.map(t => t.pnl)))}` : ''}` : 'Keine Trades'}</div>` (**ohne** `data-nb-date`, sonst überschreiben `flush()` und `'nb-title'` die Zeile). Freie, Trade- und gelöschte Notizen bleiben unverändert.
- Filter-Fenster Z. 47 (nur Labels, F11 offen): `<div class="row" style="gap:6px"><input … name="from" … aria-label="Von"><input … name="to" … aria-label="Bis"></div>` → `<div class="sec">Zuletzt bearbeitet</div><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="field grow"><label class="lbl" for="nbf-from">Von</label><input class="input" type="date" id="nbf-from" name="from" data-dp-group="nbrange" value="${esc(f.from || '')}"></div><div class="field grow"><label class="lbl" for="nbf-to">Bis</label><input class="input" type="date" id="nbf-to" name="to" data-dp-group="nbrange" value="${esc(f.to || '')}"></div></div>`. In `activeFilters` (Z. 45) `Zeitraum: ` → `Bearbeitet: `.

#### `web/js/screens/progress.js`

**C11** · bereich_training-10, bereich_training-5, bereich_training-11, hierarchie-20, bereich_training-22, aufbau-10
- Z. 20 `const arrow = (dir) => …` → `const arrow = (dir, tip) => dir > 0 ? `<span class="trend up" aria-label="steigend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowUp}</span>` : dir < 0 ? `<span class="trend down" aria-label="fallend"${tip ? ` data-tip="${esc(tip)}"` : ''}>${I.arrowDown}</span>` : '';`
- Z. 59 `const rateDir = …` → `const delta = cur.rate != null && prev && prev.rate != null ? Math.round((cur.rate - prev.rate) * 100) : 0; const rateDir = Math.sign(delta);` (ohne Vorzeitraum kein Pfeil)
- Z. 68 Heutiger Fortschritt: `<div class="big-stat"><span>${doneN ? pct + ' %' : 'Keine Daten'}</span>${arrow(doneN >= 4 ? 1 : 0)}</div><div class="small muted">${doneN} von ${items.length} Schritten erledigt</div>` → `<div class="big-stat"><span>${doneN} / ${items.length}</span></div><div class="small muted">Schritte erledigt</div>`; `pct` (Z. 58) löschen
- Z. 69: `${arrow(rateDir)}` → `${arrow(rateDir, `${delta > 0 ? '+' : ''}${delta} Prozentpunkte zum Vorzeitraum`)}`
- Z. 73 Leerzustand der Checkliste: `<div class="dashed">Noch keine Regeln. Lege unter Einstellungen …</div>` → `<div class="dashed row between"><span>Noch keine Regeln.</span><a class="btn sm" href="#/settings/regeln">Regeln anlegen</a></div>`
- Z. 75 `trailing` der Tages-Checkliste: `<a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>` → `${rules.length ? '<a class="btn sm" href="#/settings/regeln">Regeln bearbeiten</a>' : ''}<a class="btn sm" href="#/day/${todayKey}">Tag ansehen</a>`
- Z. 77 Karte „Aktuelle Regeln“ ersatzlos löschen. `.prog-side` enthält danach „Disziplin pro Woche“ und „Dein Tilt-Profil“ (`cls: 'fill'` bleibt)
- Reihenfolge: Den Block `${U.card('Trading-Aktivität', …)}` (Z. 71, samt `trailing`) hinter das schließende `</div>` von `.grid.two.prog-split` und vor `Regeln im Detail` (Z. 82) setzen
- Kommentare Z. 1 und Z. 65 anpassen („rechts Disziplin und Tilt-Profil“, „darunter Trading-Aktivität und Regeln im Detail“)
- `web/css/app.css` Z. 1273–1274 (`.rules-list`, `.rules-list li::marker`) löschen

#### `web/js/screens/prop.js`

**C12** · hierarchie-4, bereich_prop-7, bereich_prop-19, bereich_prop-28, bereich_prop-30, bereich_prop-32, aufbau-6, ki_look-22
- `planText` Z. 75: `if (plan.missingProfit > C.EPS) parts.push(…)` → `if (plan.missingProfit > C.EPS && (plan.funded || !ev.target)) parts.push(…)`; Rückgabe `return parts.join(' · ') || '—';` → `return parts.join(' · ') || (plan.missingProfit > C.EPS ? '<span class="muted">nur noch das Ziel</span>' : '—');`
- Kontokarte Z. 104: Wert von `U.kv(plan.funded ? 'Nächster Payout' : 'Bestehen', planText(a, ev, plan))` → `plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan)`
- Neue Aktion: `'prop-plan-open'(el) { const s = st(); s.payoutAccount = el.dataset.id; (s.fold || (s.fold = {})).planer = true; s.scrollPlaner = true; location.hash = '#/prop/bilanz'; },`
- `mount` Z. 309 → `mount(main) { const fn = MOUNTS[st().tab]; if (fn) fn(main); const s = st(); if (s.scrollPlaner) { s.scrollPlaner = false; const f = main.querySelector('[data-fold="planer"]'); if (f) requestAnimationFrame(() => window.scrollTo({ top: Math.max(0, f.getBoundingClientRect().top + window.scrollY - document.querySelector('.topbar').offsetHeight - 16) })); } },`
- CSS (`web/css/app.css` nach Z. 2701): `.prop-plan-link { color: inherit; text-decoration: underline; text-decoration-color: var(--border-2); text-underline-offset: 3px; } .prop-plan-link:hover { text-decoration-color: currentColor; }`
- Übersicht Z. 122: `const head = `<div class="prop-toolbar"><div class="prop-h">…</div>${filters}</div>`;` → `const head = filters ? `<div class="prop-toolbar"><div class="prop-h">${f.status ? 'Konten' : 'Aktive Konten'} <span class="pf-n">${main.length}</span></div>${filters}</div>` : '';`
- Bilanz Z. 263 `exRows`: die Zellen `<td>${esc(e.firm || (a ? a.firm : '') || '—')}</td><td>${a ? esc(accName(a)) : '—'}</td>` → eine Zelle `<td>${a ? `<b>${esc(a.firm || 'Eigene Firma')}</b> ${esc(sizeName(a))}` : esc(e.firm || '—')}</td>`. Z. 264 Kopf: `<th>Firma</th>` streichen (Datum · Typ · Konto · Betrag · Notiz)
- `poRows` (Z. 267): erste Zelle `${a ? esc(accName(a)) : esc(p.firm || '—')}` → `${a ? `<b>${esc(a.firm || 'Eigene Firma')}</b> ${esc(sizeName(a))}` : esc(p.firm || '—')}`
- `payoutPlanner` Z. 279: letzter Zweig von `intro` `: plan.funded ? '' : U.banner('info', '', `Dieses Konto ist in der …`)` → `: ''`. Z. 280 `const warn = …` löschen, in Z. 287 `${sel}${intro}${warn}<div class="grid two">` → `${sel}${intro}<div class="grid two">`
- Z. 284 Vorschlag: `<div class="big-stat"><span>${fmt.cur(plan.suggestion.perDay)}</span></div>` → `<div class="prop-sugg-val">${fmt.cur(plan.suggestion.perDay)}</div>`; CSS: `.prop-sugg-val { font-family: var(--font-num); font-size: var(--tile-val); font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; margin: 2px 0 6px; }`
- CSS Planer (`web/css/app.css` nach Z. 2627):
  ```css
  .prop-fold[data-fold="planer"] > .pf-body .card { background: none; border: 0; box-shadow: none; padding: 0; }
  .prop-fold[data-fold="planer"] > .pf-body > .grid.two + .card { border-top: 1px solid var(--border); padding-top: 16px; }
  ```
- Z. 293 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false },`

#### `web/js/screens/prop-friedhof.js`

**C13** · ki_look-41
- Z. 172 `${tiles(g)}${patternsCard(g)}<div class="grid prop-graves">` → `${tiles(g)}${g.n < 2 ? '<p class="small muted prop-patterns-empty">Ab zwei Grabsteinen erscheinen hier Muster: Uhrzeit, Wochentag, Symbol, Setup, Verlustserie oder Emotion, wenn sie sich wiederholen.</p>' : patternsCard(g)}<div class="grid prop-graves">`
- `patternsCard` Z. 61: `${g.n < 2 ? 'Ab zwei …' : 'Kein wiederkehrendes Muster …'}` → nur `'Kein wiederkehrendes Muster: Uhrzeit, Symbol, Setup und Emotionen der Breaches unterscheiden sich.'`

#### `web/js/screens/stats.js`

**C14** · aufbau-19, bereich_statistik-5, responsiv-37, bereich_statistik-12, bereich_statistik-13, bereich_statistik-43, aufbau-6, ki_look-22, bereich_dashboard-23, typografie-4
- `App.screens.stats` nach Z. 8 `title`: `head: { session: false },`
- Z. 9 `actions`: `${I.shield}` → `${I.award}`
- `render` Z. 12–17:
  ```js
  const days = C.dailyAggregation(list);
  if (tab === 'summary') { const chartDays = fillDays(days, App.range()); U.chartData['stats-top'] = { days: chartDays, bars: false, dots: chartDays.length <= 45 }; }
  const tabs = /* unverändert */;
  const body = /* unverändert */;
  return tabs + body;
  ```
  `const top = U.card('', …legend…)` löschen.
- `tabSummary` Z. 26: nach der Leer-Prüfung als erstes `${U.card('Kumulierter Netto-P&L', '<div class="chart h240" data-chart="pnl" data-id="stats-top"></div>')}`, dann die Kacheln. Die drei Karten:
  - `U.card('Serien', U.kv('Aktuelle Serie', …) + U.kv('Längste Gewinnserie', sk.maxWin) + U.kv('Längste Verlustserie', sk.maxLoss))`
  - `U.card('Extreme', U.kv('Größter Gewinn', …) + U.kv('Größter Verlust', …) + U.kv('Bester Tag', …) + U.kv('Schlechtester Tag', …))` (Markup und `pos`/`neg` aus den bisherigen Zeilen)
  - `U.card('Drawdown & Risiko', …)` unverändert
  - Karte `'Haltedauer'` (Ø Gewinner, Ø Verlierer, Ø gesamt, Trades pro Tag) ersatzlos entfernen
- `tabDays` Z. 30–32: `idw` und `U.chartData['stats-wd']` entfernen. `<div class="grid two">${U.card('P&L nach Wochentag', …)}${U.card('Tage im Überblick', …)}</div>` →
  ```js
  `<div class="grid tiles kstrip">${U.tile('Handelstage', fmt.int(ds.days))}${U.tile('Gewinntage / Verlusttage', `<span class="pos">${ds.winDays}</span> / <span class="neg">${ds.lossDays}</span>`)}${U.tile('Ø Gewinntag', `<span class="pos">${fmt.cur(ds.avgWinDay)}</span>`)}${U.tile('Ø Verlusttag', `<span class="neg">${fmt.cur(ds.avgLossDay)}</span>`)}${U.tile('Tages-Profit-Faktor', fmt.factor(ds.dayPF))}${U.tile('Ø Trades pro Tag', fmt.num(ds.avgTrades, 1))}</div>`
  ```
  Tabelle `<div class="tbl-wrap">…</div>` → `U.card('Tage im Detail', '<div class="tbl-wrap inset">…</div>')`
- `tabTime` Z. 45: `<div class="caption">Gewinner</div>` / `<div class="caption">Verlierer</div>` → `<div class="kpi-label">…</div>`
- `tabRegime` Z. 58: `<div class="muted small">${ra.coverage} von ${closed.length} Trades haben eine Marktphase.</div>` löschen. Erste Karte: `U.card('Ø pro Trade je Marktphase', …, ra.coverage < closed.length ? { sub: `Basis: ${ra.coverage} von ${closed.length} Trades` } : {})`. Zustand (Z. 67) und Monte Carlo (Z. 79) bleiben.

#### `web/js/screens/trades.js`

**C15** · bereich_trades_tag-18, bereich_trades_tag-33, bereich_trades_tag-27, bereich_trades_tag-16, typografie-4
- Z. 7 `COLS` → `[['openedAt', 'Eröffnet'], ['close', 'Geschlossen'], ['symbol', 'Symbol', '', 2], ['setup', 'Setup'], ['entryPrice', 'Einstieg', 'r'], ['exitPrice', 'Ausstieg', 'r'], ['pnl', 'P&L', 'r'], ['r', 'R', 'r'], ['rules', 'Regeln', 'r'], ['score', 'Score', 'r']]`
- Z. 46 `th`: `COLS.map(([k, l, al]) => `<th class="sortable ${al || ''}" …>`)` → `COLS.map(([k, l, al, span]) => `<th ${span ? `colspan="${span}" ` : ''}class="sortable ${al || ''}" …>`)`
- `sorted` Z. 14: im `val`-Ausdruck vor `t[key] == null` ergänzen: `key === 'symbol' ? `${t.symbol}|${t.direction > 0 ? 'L' : 'S'}` : `; den Zweig `key === 'status' ? …` löschen
- Z. 49 Zellen in dieser Reihenfolge: Eröffnet | Geschlossen (unverändert) | `<td class="sym">${esc(t.symbol)}</td><td class="dir-cell">${U.badge(t.direction)}</td>` | Setup | Einstieg | Ausstieg | P&L | R | Regeln | Score. `<td>${U.statusPill(t.status)}</td>` und `<td>${U.badge(t.direction)}</td>` entfallen. P&L-Zelle: `${!t.closed ? U.statusPill('open') : t.status === 'be' ? `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>` : U.pnl(t.pnl, '', { r: t.r })}`. R-Zelle bei `t.status === 'be'`: `<span class="neu">${t.r != null ? fmt.r(t.r) : '—'}</span>`, sonst `U.rText(t.r)`
- `render` Z. 23–26: nach `const list = ctx.inRange;` → `const shown = view === 'trades' ? filtered(list) : list; const s = C.summary(shown);`; Z. 24 `W.data(ctx, App)` → `W.data(Object.assign({}, ctx, { inRange: shown }), App)`; Netto-Kachel `${s.n} Trades` → `${shown.length < list.length ? `Gefiltert · ${s.n} Trades` : `${s.n} Trades`}`
- `renderMissed` Z. 57:
  ```js
  const r = App.range(); const acc = S.settings.accountId; const all = S.data.missed;
  const m = all.filter(x => (!r.from || (x.date >= C.dayKey(r.from) && x.date <= C.dayKey(r.to))) && (!x.accountId || !acc || acc === 'all' || x.accountId === acc)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (!m.length) return all.length ? U.empty('eye', 'Keine verpassten Trades im Zeitraum', 'Ändere den Zeitraum oder das Konto.') : U.empty('eye', 'Keine verpassten Trades notiert', 'Setups, die du gesehen, aber nicht gehandelt hast. So erkennst du, ob Zögern dich Geld kostet.');
  ```
  Z. 59: `<div class="caption">Entgangen</div>`, `<div class="caption">Wären Gewinner gewesen</div>` → `class="kpi-label"`
- `'save-missed'` (Z. 112): ins gespeicherte Objekt `accountId: S.defaultAccountId()` aufnehmen
- `App.screens.trades` neu: `head: ctx => ctx.params[0] ? { range: false, account: false, session: false } : {},`
- `renderDetail` Z. 66: Die Zeile `<div class="row"><a class="btn ghost sm" href="#/trades">${I.back} TradeLog</a><span class="muted small">·</span><a … href="#/day/${t.dayKey}">${I.day} ${fmt.dateFull(t.open)}</a></div>` aus `head` entfernen. Stattdessen `ctx.headLeft = `<a class="btn ghost sm" href="#/trades">${I.back} TradeLog</a><span class="muted small">·</span><a class="btn ghost sm" href="#/day/${t.dayKey}">${I.day} ${fmt.dateFull(t.open)}</a>`;` setzen (render läuft vor pageHead, app.js:90)

#### Restliche Einzelstellen in `web/css/app.css`

**C16 Ruhepunkt-Fuß** · bereich_training-50
- Z. 2316 `.rp-foot { …; justify-content: flex-end; … }` → `justify-content: flex-start;` (am Handy bleibt Z. 2334 zentriert)
- Z. 2317 → `.rp-foot .rp-btn.rp-quiet { font-size: 13px; color: var(--text-2); text-decoration: underline; text-underline-offset: 3px; padding-left: 0; }`
- Z. 2318 → `.rp-foot .rp-btn.rp-quiet:hover { color: var(--text); }`
- Z. 2322 `.rp-dlg a { color: var(--text); font-weight: 700; }` → `.rp-dlg a { color: var(--text); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }`

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
| Trade für {0} loggen | Log trade for {0} |
| Check-in machen | Do check-in |
| Setup · Fehler | Setup · Mistakes |
| Einstieg / Ausstieg / R | Entry / Exit / R (vorhandene Schlüssel prüfen) |
| Gefiltert · {0} Trades | Filtered · {0} trades |
| Keine verpassten Trades im Zeitraum | No missed trades in this period |
| Ändere den Zeitraum oder das Konto. | Change the period or the account. |
| Alle Trades | All trades |
| „Alle Trades“ öffnet das TradeLog (geänderter Info-Text, ganzer Satz) | … “All trades” opens the TradeLog. |
| Vorlage: {0} | Template: {0} |
| {0} verschieben | Move {0} |
| {0} entfernen | Remove {0} |
| Schritte erledigt | steps done |
| {0} Prozentpunkte zum Vorzeitraum | {0} percentage points vs. previous period |
| Noch keine Regeln. | No rules yet. |
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
| Gruppe anlegen | Create group |
| nur noch das Ziel | only the target left |
| Beträge ausblenden | Hide amounts |
| Für Tilt-Warnungen und die automatischen Regeln im Fortschritt. | Used for tilt warnings and the automatic rules in Progress. |
| neuer Regeln-Untertitel (1.9) | Your rules to check off. They appear in the trade editor, at session end, in Progress and in the rule tracker. Set measurable limits like “Max trades per day” in the Shadow Self ruleset. |
| Alle Daten löschen | Delete all data |

Nicht mehr gebrauchte Schlüssel („Trade-Erwartungswert“, „{0} von {1} Schritten erledigt“, „Trade für diesen Tag“, „Tag loggen“) dürfen bleiben.

**D2 README** (`web/README.md`)
- Z. 60–61 Konto-Menü: „Profil, Einstellungen, Benachrichtigungen, Sprache, dann Coach und Affiliate, dann der Hell/Dunkel-Schalter“
- Z. 62–64: „… oben rechts in der Titelzeile (Platz `#tb-tools`; der Avatar ist ab 961 px ausgeblendet, das Profil erreicht man über die Konto-Karte) …“; Zertifikat-Symbol „Auszeichnung“
- neue Regel nach Z. 64 (eigener Punkt **Kopfreihe**): Tabelle 1.3 in einem Satz: „Session starten“ nur auf TradeLog, Tagesansicht, Fortschritt, Notebook; „Trade loggen“ auf allen Seiten der Navigation außer Schatten-Ich, Mentor und Ruhepunkt, nicht im Konto-Menü (Coach, Affiliate, Einstellungen); leere Kopfreihen werden nicht gerendert; am Handy hat eine Kopfreihe nur mit dem runden Knopf keine Höhe.
- TradeLog (Z. 84 ff.): Spaltenfolge, „Kacheln folgen Suche und Filter“, „Verpasste Trades folgen Zeitraum und Konto“
- Z. 108 Tagesansicht: „Kopfreihe ohne Zeitraum; „Trade loggen“ legt an anderen Tagen den Trade auf diesen Tag (09:00), auch mit Taste N“
- Z. 109 Statistiken: „Reiterleiste oben; die Kurve „Kumulierter Netto-P&L“ nur in der Übersicht; 16 Kennzahlen in vier Themenreihen“
- News-Punkt: „Filter in der Kopfreihe, kein Session-Knopf“
- Z. 135 Fortschritt: „links die Tages-Checkliste, rechts untereinander Disziplin pro Woche und Tilt-Profil, zusammen so hoch wie die Checkliste (das Tilt-Profil füllt den Rest); darunter Trading-Aktivität und Regeln im Detail“
- Einstellungen (Z. 171): „ohne Kopfreihe (Zeitraum, Konto, Session und Trade loggen wirken hier nicht)“; Inhalte „Tags und Kategorien“
- Z. 260 Prop: „Payout-Planer (Consistency als Zeile in den Bedingungen); der Wert „Nächster Payout“/„Bestehen“ in der Kontokarte öffnet den Planer dieses Kontos“
- Z. 264 Coupon-Codes: „Kopfreihe nur mit „Trade loggen““
- Affiliate (Z. 267 ff.): „Kopfreihe: links Umschalter (Creator-Ansicht dazu die Auswahl), rechts die Marke „Beispieldaten“; kein Trade loggen, keine Session. Kennzahlen Kunden, Umsatz, Provisionen, Offen“
- Coach: „ohne Kopfreihe; Journal zeigt 10 Einträge, dann „Mehr anzeigen“; Notiz über „Notiz schreiben““
- Z. 318: „**N** Trade loggen, **1–9** Bereiche (0 = Blind-Replay, nur wenn freigeschaltet)“
- Z. 339 Skelett: „mit Werkzeugen und Avatar“ → „mit Werkzeugen (Avatar nur am Handy)“

**D3 Tests anpassen** (`web/e2e/`)
- `affiliatetest.js:15–16`: `.aff-top .pill` → `.page-head .pill`, `.aff-top .prop-tabs a` → `.page-head .prop-tabs a`; erwartete Kennzahlen `Creator,Kunden,Umsatz,Provisionen,Offen` → `Kunden,Umsatz,Provisionen,Offen`, Indizes `tiles[0..3]` neu, Vergleich mit `exp.creators` entfällt
- `calmnavtest.js:40`: still-Liste `['.tabs[data-subnav]', '.content > .card', '.page-head']` → `['.tabs[data-subnav]', '.page-head']`, Name ohne „Diagramm oben“; Z. 47–48 Scroll auf Reiter−300 → `scrollTo(0, 80)` auf `#/stats/summary`
- `calmnavtest.js:44`: `inPage('#/affiliate', '.page-head a[href="#/affiliate/creator"]', ['.page-head'], ['.content > :not(.page-head)'])`
- `chartanimtest.js:35`: Meldungstext an „Kurve in der Übersicht“ anpassen
- `coachtest.js:80–81`: `entries.length === Math.min(snap.entries, 10)`; Z. 83, 154, 178: vor dem Füllen `[data-action=coach-note-open]` am Eintrag klicken
- `headtest.js:11` und `sixtest.js:11`: Bezug `.topbar .avatar` → rechter Rand von `.topbar .actions` (`r.right <= actionsRight + 1`) und vertikale Mitte von `.topbar h1`
- `navdottest.js:37`: bei Hauptschalter aus 8 `[data-action=navdot-toggle]`, davon 7 `disabled`, keine `.nav-dot` in `#sidebar`
- `proptest.js:98`: „Weg zum Bestehen“ → „Bedingungen zum Bestehen“; `proptest.js:102`: statt `plan.consistencyWarning` im Text `verletzt` bzw. `heute noch` in der Zeile „Consistency Rule“ prüfen
- `sampletest.js:39–40`: geschlossene Zeilen über `td.r .pos, td.r .neg, td.r .neu` statt `.pill.win/.loss/.be`; offene über `.pill.open`
- `settest.js:36`: zuerst `[data-action="content-tab"][data-value="kategorien"]` klicken, dann 3 Zeilen prüfen; Z. 37 klickt danach „tags“ (bleibt)
- `dashtest.js:67` bleibt grün (`.recent-card .more-link` mit `href="#/trades"`); Z. 72 bleibt
- neu `leaktest.js` bleibt unverändert (nur F1 würde ihn ändern)

---

## 4. Akzeptanzkriterien

**4.1 grep (im Ordner `web/`)**

| Prüfung | erwartet |
|---|---|
| `grep -rn 'href="#/settings"' js/` | 0 Treffer |
| `grep -rn "new-trade-day\|Trade für diesen Tag" js/` | 0 |
| `grep -n "Trade-Erwartungswert\|key: 'expectancy'" js/core.js` | 0 |
| `grep -rnE "more-row\|w-name\|rules-list\|aff-top\|class=\"nw-n\"\|\.nw-n \{" js/ css/` | 0 |
| `grep -rn 'class="caption"' js/` | nur progress.js (2: „Automatische Regeln“, „Dein Tag“), trades.js (Karte „Tags & Notizen“), news.js („Nächste wichtige News“), voice.js (1), replay.js (2) = 7 |
| `grep -n "I.shield" js/screens/dashboard.js js/screens/day.js js/screens/stats.js` | 0 |
| `grep -n "Zuletzt bearbeitet: " js/screens/notebook.js` | 0 |
| `grep -nE "font-size: (25\|28\|34)px" css/app.css` | kein Treffer in `.tile .val`, `.spark-tile .val`, `.shadow-main .val` |
| `grep -n "outline: 1.5px dashed" css/app.css` | 0 |
| `grep -n "head:" js/screens/misc.js` | 1 |
| `grep -c "coach-note-open" js/screens/coach.js` | ≥ 2 (Knopf und Aktion) |

**4.2 DOM-Prüfungen (Playwright, dark, 1440 × 900, Beispieldaten)**

- Kopfreihe nach Tabelle 1.3: `#content > .page-head` fehlt auf `#/settings/*` und `#/coach`. `[data-action=start-session]` gibt es nur auf `#/trades`, `#/day`, `#/progress`, `#/notebook`. `.page-head .tl` fehlt auf `#/settings/*`, `#/affiliate`, `#/coach`, `#/shadow`, `#/mentor`. Auf allen anderen Seiten der Navigation ist es vorhanden.
- `#/coach`: `.coach-wrap` beginnt bei y ≤ 100 (heute 152).
- `#/day/<gestern>`: `#content .btn.accent` zählt 1. Klick auf `.tl` öffnet den Dialog mit Datum gestern, 09:00. Taste N tut dasselbe. `#content [data-pop=range]` fehlt. Spaltenköpfe: `Zeit, Symbol, Setup · Fehler, Netto-P&L, R, Score`. Tabelle ohne waagerechtes Scrollen (`scrollWidth <= clientWidth`).
- `#/day/<heute ohne Check-in>`: genau ein `[data-action=check-in]`, Text „Check-in machen“.
- `#/stats/<alle 9 Reiter>`: Das erste Element nach `.page-head` in `#content` ist `.tabs[data-subnav]`. `[data-id=stats-top]` gibt es nur auf `summary`. `.stat-tile` zählt 16. Die ersten vier `.stat-tile .k`: Netto-P&L, Erwartungswert, Ø Tages-Netto-P&L, Profit-Faktor. Keine Kartentitel „Haltedauer“ in `summary`, kein „P&L nach Wochentag“ in `days`.
- `#/stats/regime` mit voller Abdeckung: kein Text „haben eine Marktphase“.
- `#/trades`: Kopfzeilentexte `Eröffnet, Geschlossen, Symbol, Setup, Einstieg, Ausstieg, P&L, R, Regeln, Score`. Suche „NQ“: `.spark-tile .n` beginnt mit „Gefiltert“, der Netto-Wert entspricht der Summe der sichtbaren geschlossenen Trades.
- `#/trades`, Reiter Verpasste Trades, Zeitraum „Dieser Monat“: alle Datumszellen im laufenden Monat.
- `#/trades/<id>`: `.page-head .dh-context a[href="#/trades"]` vorhanden, kein `[data-pop=range]`.
- `#/settings/profil`: `.set-head h2` 18px/600, `.set-block h3` 15px/600, `.set-row b` 14px/500. Kein `b.neg`. Zeitzonenfeld zeigt bei UTC-Browser „UTC“.
- `#/settings/benachrichtigungen`: Hauptschalter aus → Blockhöhe ändert sich um höchstens 1 px. 7 Schalter mit `disabled`.
- `#/settings/inhalte`: zuerst die Tags-Tabelle (≥ 20 Zeilen).
- `#/progress`: Kartentitel in DOM-Reihenfolge = Aktuelle Serie, Heutiger Fortschritt, % Regeln eingehalten, Tages-Checkliste, Disziplin pro Woche, Dein Tilt-Profil, Trading-Aktivität, Regeln im Detail. Kein „Aktuelle Regeln“, kein „Keine Daten“. Bei 1440 × 900 beginnt die Tages-Checkliste bei y < 900.
- `#/prop`: kein `.prop-h` bei weniger als 5 Konten. `.prop-group-title b` 13px/600. Auf Challenge-Karten mit Ziel-Balken kein „Gewinn fehlt“. Klick auf `.prop-plan-link` → `#/prop/bilanz`, `[data-fold=planer][open]`, Planer-Konto = Kartenkonto, Oberkante des Folds zwischen 72 und 200 px.
- `#/prop/bilanz`: Ausgaben-Kopf `Datum, Typ, Konto, Betrag, Notiz`. Im Planer kein `.banner.info` für unfertige Challenges, kein `.banner.warn`. `.prop-sugg-val` 24px. Konto-Karten in „Abgeschlossen“ behalten ihren Rahmen.
- `#/prop/friedhof` mit einem Grabstein: keine Karte „Muster“, `p.prop-patterns-empty` vorhanden.
- `#/affiliate`: `.page-head .prop-tabs`, `.page-head .pill` vorhanden. `.kstrip .tile` zählt 4. Bei 1024 px haben alle 4 Kacheln dieselbe Oberkante.
- `#/stats/days` bei 1440: 6 Kacheln in 2 Reihen zu 3.
- `#/news`: `.page-head .nw-filters` vorhanden, `.nw-list` enthält keine `.nw-filters`. Kein `.nw-n`. `.nw-dh` 14px.
- Dashboard bearbeiten: `.w.editing` mit `outline-style: none`, `.w-bar` mit `border-top-width: 0px`. Kein `.w-name`. Griff-aria „Netto P&L verschieben“.
- Dashboard: Vorlagen-Knopf `title` = „Vorlage: Standard“. Überschriften-Scan: H1, dann nur H2 (kein Sprung H1 → H3).
- Titelzeile 1440: `.topbar .avatar` mit `display: none`. Bei 390: sichtbar, Text = Initialen von `.sb-av`.
- Konto-Menü: Reihenfolge `Profil, Einstellungen, Benachrichtigungen, Sprache, Coach, Affiliate`. Auf `#/settings/design` ist „Einstellungen“ markiert (`.item.on`).
- Taste „0“ bei ausgeschaltetem Replay: `location.hash` bleibt unverändert.
- Notebook „Alle Notizen“ mit vorhandener Tagesnotiz von heute: Knopf heißt „Tagesnotiz öffnen“. Zwei Klicks → Anzahl der Notizen unverändert. Tagesnotiz offen: `.datebtn` ohne Text, `aria-label="Datum ändern"`, eine Meta-Zeile.
- Coach-Journal (Mentor, 28 Einträge): 10 `.coach-entry`, 0 `textarea` bis zum Klick auf „Notiz schreiben“, Seitenhöhe < 4000 px.

**4.3 Handy (390 × 844)**

- `#/coupons`: `.page-head` mit Höhe 0, `.tl` mit `position: fixed`, erste Kachel bei y ≤ 100.
- `#/news`: Filter in einer Zeile (Höhe ≤ 44 px), seitlich wischbar, Beschriftungen sichtbar.
- `#/settings/profil`: kein runder Knopf, kein `.page-head`.
- `#/day`: Datumszeile höchstens zwei Reihen, kein zweiter grüner Knopf über dem runden Knopf.
- `mobiletest.js` grün (kein seitlicher Überlauf auf allen Routen).

**4.4 Zensus** (`census.json` neu erzeugen, dark 1440)
- global `fontSize["25px"]` = 0, `["28px"]` = 0, `["34px"]` = 0. Seite `prop_bilanz`: 44px = 0.
- `settings_profil`: kein h2 24px/700, kein `b` 14px/700, kein `b` 13px/700.
- `dashboard`: `div.wd` 12px/500.

**4.5 Screenshot-Prüfpunkte** (dark und light, 1440 und 390): `trades.png` (keine Status- und Richtungsspalte, Abzeichen neben Symbol), `day_mit_trades.png` (ein grüner Knopf, kein Zeitraum), `stats.png` und `stats_mc.png` (Reiter direkt unter der Kopfreihe), `progress.png` (Checkliste über der Heatmap), `settings_profil.png` (keine Kopfreihe, Treppe 21 > 18 > 15 > 14), `affiliate.png` (eine Steuerreihe), `prop.png` (keine doppelte Überschrift), `dashboard_bearbeiten.png` (keine gestrichelte Kontur, kein doppelter Name), `coach.png` (kein Leerstreifen), `notebook_notiz.png` (Datum einmal).

**4.6 Tests**
- `web/e2e/runall.sh` vollständig grün nach D3, dazu `node --test web/tests/` (core.test.mjs: stats16 hat 16 Einträge, Key `days` vorhanden).
- i18n: Jeder deutsche Text aus D1 steht als Schlüssel in allen fünf Dateien (`for f in web/js/lang/*.js; do grep -cF '"Erwartungswert"' $f; done` usw.). In Englisch zeigt `#/stats` „Expectancy“, `#/day/<gestern>` den Tooltip „Log trade for …“.

---

## 5. Zurückgestellt

| Befund (Teil) | Grund |
|---|---|
| hierarchie-4: P&L und „Gewinn fehlt“ in der Kontowährung statt in der Journal-Währung | Bestehende Entscheidung (Hinweis im Konto-Dialog prop.js:194, `proptest.js:55–56`). Umgesetzt wird nur das Entfernen des doppelten Betrags. |
| typografie-7: dieselbe Stufe (18/600) für `.modal-head h2`, `.sp-head h2`, `.coach-title`, `.mentor-setup h2`, `.coach-join-head h2` und den Datumstitel der Tagesansicht | Betrifft Dialoge der ganzen App. Gehört in die Typografie-Spezifikation (Prüfer: „gehört nicht in diesen Stapel“). |
| hierarchie-19: Untertitel „Letzte 12 Monate“ an der Aktivitäts-Heatmap | Befund faktisch falsch (52 Wochen, verschiebbar). Die Info erklärt es schon. Nur der Einstellungs-Teil wird umgesetzt. |
| ki_look-22, responsiv-19: „Trade loggen“ auch auf Coupons und News entfernen | Hauptknopf auf Seiten der Navigation bleibt (K2). `mobiletest.js:39–40`. |
| aufbau-6: Session-Knopf auch im Notebook entfernen | README:95 legt ihn fest; Ordner „Session Recap“. |
| bereich_dashboard-23: aktive Vorlage als Textknopf links in der Kopfreihe | README:64 („Vorlage und Zertifikat als Symbole“). Ersatz: Tooltip mit Vorlagennamen. |
| aufbau-21: Tastenbelegung 1–0 nach Reihenfolge der Seitenleiste | Bricht `rptest.js:10`, `mentortest.js:21`, README:215 („Taste 9“). Ruhepunkt verlöre seine Taste. |
| bereich_shell-27: „Design“ → „Erscheinungsbild“ im Konto-Menü | Der Einstellungsbereich heißt „Design“. Das lange Wort passt nicht neben den Schalter. |
| bereich_konto-40: „Verlassen“ in ein „…“-Menü | Bricht `coachtest.js:194`. Geisterknopf mit Bestätigung ist angemessen. |
| bereich_konto-29: Anzahl im Kartentitel („Creator · 5“) | Ändert den i18n-Schlüssel. Die Zeilen sind sichtbar. |
| bereich_statistik-12: Karte „Haltedauer Gewinner vs. Verlierer“ im Reiter Zeit auf `U.kv` umbauen | `.kpi-label` + `.score-big` ist ein bestehendes Muster. Zwei Zeilen neben einem 240-px-Diagramm ließen mehr Leerraum. |
| bereich_statistik-43: Zustand-Satz in die Karten, Monte-Carlo-Zeile in die Karte „Beispielpfade“ | Der Zustand-Satz gilt für alle drei Karten. „Neu simulieren“ würfelt Kacheln und beide Diagramme neu und gehört in die Werkzeugzeile darüber. |
| bereich_notebook_news-6: Auswahlmenü (Tagesnotiz/freie Notiz) in „Alle Notizen“ | Bricht `figtest.js:5`, `figdel.js:5`, `scrolltest.js:30`. Ersatz: ehrliche Beschriftung. |
| bereich_notebook_news-7: „Erstellt“ nur im Tooltip | README:121–122 verlangt beide Zeiten sichtbar (K15). |
| aufbau-33: Werkzeugleiste über den Kartenkopf legen | Verdeckt Kopfsteuerungen (Report, Jahreskalender, „Öffnen“), am Handy noch enger. |
| responsiv-22: runden Knopf auf der Tagesansicht ausblenden, Zertifikat nur als Symbol | Durch hierarchie-7 überflüssig (ein Knopf, auf den Tag vorbelegt). |
| typografie-18: Titel des Filter-Fensters 15px | 14.5px ist die Titelgröße aller schwebenden Ebenen (K11). |
| hierarchie-16: eigene Spalte „Fehler“ | Die Tabelle läuft bei 1440 px schon über. Ersatz: Kopf „Setup · Fehler“. |
| typografie-6: `.prop-balance .val` (26px) und `.coach-gs-tiles .tile .val` (21px) auf das Token | Einzelwert in einer Karte bzw. nicht belegte Kachelreihe. Keine Kachelreihe mit gleicher Rolle daneben. |
| aufbau-14: Neugruppierung der Seitenleiste (News unter „Übersicht“, Gruppe „Analyse“) | News im Journal ist Nutzerentscheidung (README:112). Eine fünfte Gruppe kostet ~40 px, bei 1366 × 768 läuft die Leiste schon über. Bricht `mentortest.js:20`, `rptest.js:9`. Nur die Umbenennung geht als Frage an den Nutzer (F10). |
| aufbau-8, Teile a–c (Regelquellen zusammenlegen) | Produktentscheidung, siehe F4. Umgesetzt ist nur die Klarstellung. |
| bereich_einstellungen-36: Reiter „Kategorien“ streichen | Siehe F7. Umgesetzt ist nur der Standard-Reiter „Tags“. |
| bereich_notebook_news-9: Ordner und Tag aus dem Filter-Fenster | Siehe F11. Umgesetzt sind nur die Labels. |

---

## 6. Nutzer fragen

**F1 · komponenten-3, bereich_shell-8 · Zeitraum und Konto auf allen Seiten oben rechts?**
Frage: Auf dem Dashboard stehen Zeitraum, Konto und Filter oben rechts in der Titelzeile, auf TradeLog, Statistiken, Fortschritt, Schatten-Ich und Tagesansicht links in der Reihe darunter. Sollen sie ab 961 px überall oben rechts stehen? Am Handy bleiben sie in der Kopfreihe.
Empfehlung: **Ja.** Du hast die Titelzeile für das Dashboard bewusst gewählt. Mit der Regel gilt sie überall, die wichtigsten Filter springen beim Seitenwechsel nicht mehr und bleiben beim Scrollen sichtbar. Die Kopfreihe gehört dann nur der Seite selbst (Reiter, Suche, Rückweg, Aktionen).
Bei Ja: `pageHead` gibt Zeitraum und Konto als `<div class="row dh-context dh-global">` getrennt von `headLeft` und Hinweis aus. Neue Methode `App.placeGlobal(main)` verschiebt `.dh-global` nach `translateNow` in `#tb-tools` (≥ 961 px) bzw. zurück. Ein Listener in `App.bind`. `placeContext` und `unmount` in dashboard.js entfallen, die Dashboard-Zeile bekommt `dh-global`. Leere Kopfreihe nach dem Verschieben → nicht rendern (B1-Regel). Mentor behält Konto und Hinweis in der Kopfreihe (README:144). Tests: `leaktest.js` (erwartet dann `#tb-tools` gefüllt auf TradeLog/Statistik/Schatten-Ich, leer auf Prop), `sixtest.js:34`, `shadowtest.js:16`, `motiontest.js:30/36/38`, `headtest.js` (Größenwechsel 1440 → 800 → 1440 auf #/trades). README:62–65, 144, 221.

**F2 · aufbau-16 · Prop Firms: vier Bereiche in einer Leiste statt „Auswertung“ mit Unterreitern?**
Frage: Heute: Übersicht · Auswertung · Konten, und „Auswertung“ öffnet eine zweite Leiste mit Bilanz und Friedhof. Soll daraus eine Leiste werden: Übersicht · Bilanz · Friedhof · Konten?
Empfehlung: **Ja.** „Auswertung“ trug früher auch Simulation und Vergleich, die sind entfallen. Heute kostet die Ebene eine zweite Leiste in anderem Stil und einen Klick mehr für nur zwei Ansichten. Vier Segmente passen auch bei 390 px.
Bei Ja: prop.js:12 `AREAS = [['cockpit','Übersicht'],['bilanz','Bilanz'],['friedhof','Friedhof'],['konten','Konten']]`, Z. 13–14 löschen, `areaOf = k => k`, `subsOf = area => TABS.filter(t => t[0] === area)`, Z. 300 alte Adressen → `key = 'bilanz'`, Unterleiste (Z. 305) löschen, `return VIEWS[key](ctx)`. CSS `.prop-sub` (2593–2598, Teil von 2592) löschen. Tests `proptest.js:19, 95`, `friedhoftest.js:19–21`, `sampletest.js:81`. README:241–245.

**F3 · aufbau-9 · Ruhepunkt-Check-in als Check-in des Tages zählen?**
Frage: Wer morgens die Ruhepunkt-Routine macht, gibt Schlaf, Stress und Stimmung auf einer 1–10-Skala an. Die Tagesansicht zeigt danach trotzdem „Kein Check-in“, und der Hinweis-Punkt bleibt. Soll Schritt 2 im Ruhepunkt dieselben Skalen wie der Check-in nutzen (Schlaf in Stunden, Stress und Stimmung 1–5) und als Check-in des Tages gespeichert werden?
Empfehlung: **Ja**, das ist die tägliche Kernroutine, heute verlangt sie doppelte Arbeit. Es ändert aber Texte und Abläufe aus deiner Vorlage `docs/ruhepunkt.html`.
Bei Ja: Umsetzung nach dem Vorschlag von aufbau-9: `slider` mit `opts {min,max,step,unit}`, Vorbelegung aus dem heutigen Check-in, Schreiben beim „Weiter“ aus Schritt 2 (nur die drei Werte), neue Ampel-Schwellen, `mentor.js:42` auf „Schlaf X h, Stress X/5, Stimmung X/5“, `rptest.js` erweitern, README:141.

**F4 · aufbau-8 · Handelsregeln aus vier Quellen zusammenführen?**
Frage: Regeln gibt es als Checkliste (Einstellungen → Regeln), als messbares Regelwerk (Schatten-Ich), als feste „Automatische Regeln“ im Fortschritt und als Tageswerte im Ruhepunkt. Sollen die messbaren Grenzen aus einer Quelle kommen?
Empfehlung: **Teilweise.** Ja: Der Ruhepunkt-Schritt „Deine Regeln für heute“ wird mit den Werten des Schatten-Ich-Regelwerks vorbelegt (max. Tagesverlust, max. Trades), Änderungen gelten nur für den Tag. Nein: Die „Automatischen Regeln“ und das Tagesverlustlimit in Trading bleiben, weil sie die Tilt-Warnungen speisen und es Revenge, Größenerhöhung und Schnellfeuer im Regelwerk nicht gibt. Die Klarstellung in Einstellungen → Regeln und → Trading ist schon umgesetzt (C8).

**F5 · aufbau-25 · Neuer Einstellungsbereich „Sicherheit und Daten“?**
Frage: Unter „Profil“ stehen heute auch Privatsphäre, Zwei-Faktor, Sicherung, Beispieldaten und „Alles löschen“. Die Seite ist 1725 px lang. Sollen diese drei Blöcke in einen eigenen Bereich „Sicherheit und Daten“ direkt nach Profil?
Empfehlung: **Ja.** „Alles löschen“ gehört nicht auf die Seite, die das Konto-Menü als „Profil“ öffnet. Der Schalter „Christlicher Impuls“ bleibt im Profil (Text misc.js:161 bleibt gültig). Symbol `download`.
Bei Ja: `SECTIONS` + `['daten', 'Sicherheit und Daten', 'download']` nach `profil`, `daten` in die Zuordnung misc.js:22, neue Funktion `daten()` mit den Blöcken aus Z. 60, 62, 63–69. Tests `sampletest.js:117–127`, `settest2.js:16`, `settest.js:8` (Anzahl +1). README:23, 171.

**F6 · bereich_einstellungen-7 · Bereich „Abo“ streichen?**
Frage: Der Navigationspunkt „Abo“ zeigt nur „Es gibt derzeit kein Abo“. Soll er weg, bis es ein Abo gibt?
Empfehlung: **Ja**, ohne Ersatztext. `#/settings/abo` fällt auf Profil zurück.
Bei Ja: misc.js:7 Eintrag streichen, misc.js:22 `abo` aus der Zuordnung (sonst ReferenceError), Funktion `abo()` löschen. `settest.js:8` (12 → 11), `:10`. README:171.

**F7 · bereich_einstellungen-36 · Reiter „Kategorien“ unter Inhalte streichen?**
Frage: Der Reiter zeigt eine feste, nicht bearbeitbare Tabelle mit drei Zeilen. Sollen die drei Kategorien stattdessen als Filter-Chips über der Tag-Liste stehen (Alle · Setups 12 · Fehler 8 · Emotionen 6)?
Empfehlung: **Ja.** Eine Ebene weniger, die Pflege passiert ohnehin bei den Tags. Die Summe der Verwendungen je Kategorie entfällt, die Werte je Tag bleiben. Chips ohne Farbpunkt (Setup-Punkt wäre grün), Gewählt-Zustand flach (app.css:3125).
Bei Ja: Umsetzung nach dem Vorschlag von bereich_einstellungen-36 (Aktion `tag-filter` liest `el.value`). Tests `settest.js:36–37`, `settest2.js:50`.

**F8 · bereich_einstellungen-6 · „Was handelst du?“ streichen?**
Frage: Die Auswahl (Aktien, Forex, Futures …) wird gespeichert, aber nirgends verwendet. Soll der Block weg, bis er eine Funktion hat?
Empfehlung: **Ja.** Der gespeicherte Wert bleibt (keine Migration). Kommt später eine Funktion dazu (z. B. Symbolvorschläge), kehrt er als „Märkte“ zurück.
Bei Ja: misc.js:193 Block, :11 `INSTRUMENTS`, `ins` in :191, Aktion `'instrument-toggle'` (:332) löschen; `settest.js:21–23`.

**F9 · bereich_einstellungen-5 · Adresse, Bio und Zeitzone im Profil?**
Frage: Diese drei Felder wirken nirgends in der App. Sollen sie raus? (Der Fehler „Africa/Abidjan“ bei UTC ist schon behoben, C8.)
Empfehlung: **Adresse und Bio streichen, Zeitzone behalten.** Für Adresse und Bio gibt es keinen Ort, an dem sie erscheinen. Die Zeitzone ist jetzt korrekt vorbelegt und kostet eine Zeile.
Bei Ja: misc.js:53 (`pf-addr`) und :55 (`pf-bio`) entfernen. `navdottest.js:49` (prüft `#pf-bio`), `settest2.js:9–10` anpassen.

**F10 · aufbau-14 · Gruppe „Konten“ in der Seitenleiste umbenennen?**
Frage: Die Gruppe mit Prop Firms und Coupon-Codes heißt „Konten“, ebenso wie Einstellungen → Konten (Journal-Konten) und der Prop-Bereich „Konten“. Soll die Gruppe „Prop Trading“ heißen? Gruppen und Reihenfolge bleiben.
Empfehlung: **Ja**, nur der Name. app.js:17, Schlüssel „Prop Trading“ in den Sprachdateien, `rptest.js:9`, README:264.

**F11 · bereich_notebook_news-9 · Notebook-Filter nur noch nach Bearbeitungsdatum?**
Frage: Das Filter-Fenster bietet „Ordner“ und „Tag“ mit eigenem Zustand, obwohl die linke Spalte dieselben Filter hat. Zusammen ergeben sie leicht eine leere Liste (links „Ideen“, im Filter „Strategie“). Sollen Ordner und Tag aus dem Fenster raus? Dann lässt sich eine Suche nicht mehr auf einen Ordner eingrenzen.
Empfehlung: **Ja.** Zwei Orte für denselben Filter sind die größere Fehlerquelle. Die Suche läuft bewusst über alle Ordner (Hinweis „Suche über alle Ordner“).
Bei Ja: notebook.js:6 und :133 `filter: { from: '', to: '' }`, :132 nur `from`/`to`, :13 löschen, :14 `const tag = nb.tag;`, :45 nur der Datumschip, Tooltip des Knopfs „Nach Bearbeitungsdatum filtern“. `dptest.js:104` bleibt grün (Name und `data-dp-group` bleiben).
