# VIC Model — Vollständige Analyse der Trade-Dokumentation

Stand: 01.09.2026. Grundlage: 37 dokumentierte Winner (Trade 1–37), 24 dokumentierte
Loss-Tage (Loss 1–24), zusammen über 70 Einzeltrades auf NQ, ES, YM (Ausführung MNQ/MES),
Zeitraum der Handelstage 12.05.2026 bis 24.08.2026. Alle Uhrzeiten in diesem Dokument
sind CEST (UTC+2), so wie auf den Charts. 15:30 CEST = 9:30 ET = NY Open.

Hinweis zur Genauigkeit: Die Trades 1–35 wurden beim Empfang Bild für Bild ausgewertet
(wörtliche Notizen, Entry/Exit-Zeiten und -Preise, markierte Level, Panelzustände) und
diese Aufzeichnungen sind die Quelle hier. Die Losses 1–24 und Trades 36–37 lagen bei
der Analyse vollständig als Bilder vor. Datumsangaben stammen aus den Screenshot-Headern;
wo die Chart-Achse einen früheren Handelstag zeigt (z. B. Loss 3: Screenshot 10.08.,
Handelstag laut Achse derselbe; Loss 20: Screenshot 06.06., Handelstag 05.06.), ist der
Handelstag angegeben. Einige Winner-Batches (T9–T14, alle Screenshots vom 20.07.) sind
vermutlich nachträglich journalisierte Trades früherer Tage — die Handelstage dort sind
mit dieser Unsicherheit zu lesen.

---

## 1. Werkzeuge und Darstellung

**Indikator „VIC - Model"** (eigenes TradingView-Skript, ab Trade 5 im Chart-Titel):
- Drei Session-VWAPs. Zuordnung nach Deckkraft (vom Nutzer bestätigt):
  - **deckend dunkelrot = NY VWAP** (startet 15:30 CEST)
  - **leicht transparent = Overnight VWAP**
  - **fast farblos = PD NY VWAP** (NY VWAP von gestern, weiterlaufend)
- Beschriftungen im Chart: „NY", „VWAP" (= Overnight), „PD".
- **Dashboard** oben rechts: Matrix Ticker × (NY VWAP, Overnight VWAP, PD NY VWAP)
  mit grünen/roten Punkten (Preis über/unter dem jeweiligen VWAP) plus Trend-Zeile
  („Strong Up" / „Strong Down" / „Neutral"). Spaltenreihenfolge anfangs NQ, ES, YM;
  ab ~Anfang Juli ES, NQ, YM — der Indikator wurde zwischendurch geändert.
- Bekannter Bug: „Error on bar 10650: The requested historical offset (301) is beyond
  the historical buffer's limit (300)" (Loss 21) — das Skript greift >300 Bars zurück,
  an solchen Tagen fällt das Panel aus.
- Rechte Preisskala führt zusätzlich pVAH / pPOC / pVAL (Previous Day Value Area),
  Session-Level (Asia, Lndn, NYAM/NYPM High/Low), teils „4h"- und „Daily FVG"-Marken.

**Weitere Werkzeuge:** ICT Killzones & Pivots [TFO] (Session-Boxen: Asia blau,
London rot, NY AM grün — sichtbar ab Trade 23), Bookmap (Orderflow/Heatmap, als
TP-Begründung in Trade 6 und als Long-Ausschluss in Trade 9), Nebenfenster mit
MNQ/MES-Charts (ab Loss 16 sichtbar — Signale werden auf NQ gelesen, ausgeführt
wird auf Micros).

---

## 2. Glossar (alle verwendeten Begriffe)

| Begriff | Bedeutung im Modell | Quelle |
|---|---|---|
| FVG | Fair Value Gap; verwendet auf 30s, 1m, 5m, 15m, 30m, 1h, 4h, Daily | durchgehend |
| IFVG | Inverse FVG — Haupttrigger; zählt erst ab 1m (30s zu schwach), braucht Close | T29, L4 |
| unfilled | FVG nur gültig solange nicht getappt | L4, T24, T29 |
| CISD | Change in State of Delivery — Ersatztrigger wenn kein IFVG da | T14, T23, T27, L17 |
| OB | Order Block (1h), als TP-Anker | T14, L14 |
| BPR Gap | Balanced Price Range Gap, Reaktionszone | T30 |
| PO3 | Power of Three; 15:30 ist die Manipulation | T30 |
| ITH / ITL / IT Structure | Intermediate Term High/Low/Struktur | T16, T18, T28, L1, L23 |
| LRL | Liquidity Resting Level (Liquiditätspool) | T16, L3, L4, L6 |
| DOL | Draw on Liquidity = Zielmagnet; Qualitätsregeln s. §8 | T18, L15, L23 |
| BSL | Buyside Liquidity | T18 |
| staked Highs/Lows | gestapelte Hochs/Tiefs als Liquidität | T18, L4 |
| $$$ | Liquiditätsmarkierung im Chart | T8, T23, T26, L23 |
| V-shape recovery | schnelle V-Erholung als Momentum-Beleg | T10, T11, T13, T18, L14, L20 |
| protected High/Low | abgesichertes Hoch/Tief; als TP schlecht („zu protected") | T2, T30, T31, L23 |
| premium / discount | Lage in der Range; „zu sehr im premium" = kein Long | T8, T9, T19 |
| HTF Inversion | Invertierung eines HTF-FVG im Trading Leg | T18 |
| Basehits | bewusst kleine Ziele (nach Verlust / bei Unklarheit) | T30 |
| resweep | erneutes Abholen eines bereits gesweepten Levels | T18, L23 |
| SMT | Divergenz zwischen ES und NQ bei Session-Sweeps | L3 |
| EQHs | Equal Highs (mit London High) | L3 |
| reclaim VIC entry | Entry-Variante nach Rückeroberung — **nicht definiert, offen** | L7 |
| Mid Range Trade | Trade innerhalb der Range vor dem OR-Break — verboten (§5) | T24, L8 |

---

## 3. Katalog der Winner (Trade 1–37)

Spalten: Datum (Screenshot/Handelstag), Instrument, Richtung, Setup laut Notiz,
Entry-Zeit, Entry→Exit, Distanz.

| # | Datum | Instr. | Seite | Setup | Zeit | Entry→Exit | Punkte |
|---|---|---|---|---|---|---|---|
| 1 | 22.08. | ES | Long | Double Break (IFVG-Close, London POC) | — | ~7.683-Region | — |
| 2 | — | NQ | Short | früher Entry, wollte VWAP-Tap | 15:40 | 29.400→29.300 | 100 |
| 3 | — | MES | Long | Double Break, volles VWAP-Alignment | 15:55 | 7.737→7.750 | 13 |
| 4 | — | NQ | Short | VIC, IFVG, TP 50% 4h-Wick, 1:1 | 16:05 | 29.638→29.581 | 57 |
| 5 | 06.08. | ES | Short | Double Break nach Asia-Sweep | 16:30 | 7.755→7.740 | 15 |
| 6 | 31.07. | NQ | Short | VIC, Momentum-IFVG-Close, TP per Bookmap | 16:05 | 27.790→27.630 | 160 |
| 7 | 22.07. | NQ+ES | Long | VIC (NY VWAP außerh. OR ⇒ kein DB) | 16:50 | 29.214→29.277 | 63 |
| 8 | 21.07. | NQ+ES | Long | IFVG DB, Overnight-Tap, 4h-FVG-Fill | 16:20 | 29.152→29.246 | 94 |
| 9 | 20.07.* | NQ | Short | DB gegen HTF (zu premium) | 15:50 | 29.190→29.030 | 160 |
| 10 | 20.07.* | NQ | Long | IFVG B&R, V-shape, 5m+15m FVG | 17:05 | 28.723→28.897 | 174 |
| 11 | 20.07.* | ES | Long | IFVG, NY Break, V-shape; Exit = PD VAH | 16:20 | 7.578→7.596 | 18 |
| 12 | 20.07.* | NQ | Short | VIC; manuell zu früh raus (Fehler) | 16:00 | 29.600→29.518 | 82 |
| 13 | 20.07.* | NQ | Long | DB (Momentum durch NY VWAP ⇒ DB, nicht VIC) | 16:25 | 29.710→29.870 | 160 |
| 14 | 20.07.* | ES | Long | B&R ohne IFVG, mit CISD; 5m-FVG-Continuation | 16:00 | 7.568→7.584 | 16 |
| 15 | 01.07. | NQ | Long | B&R, NY VWAP außerh. OR; SL unter ON-VWAP+Swing-Low; TP 4h unfilled | 17:00 | 30.334→30.472 | 138 |
| 16 | 29.06. | ES | Short | IFVG DB (kein HTF-FVG seit NY open ⇒ DB) | 15:55 | 7.467→7.444 | 23 |
| 17 | 26.06. | NQ | Long | B&R IFVG; TP = PD VWAP + 1h-Body (Wick gemieden) | 17:15 | 29.493→29.611 | 118 |
| 18 | 24.06. | NQ+ES | beide | DB-Fail→Rebreak (gebacktestet); schwacher OR-Break wird resweept | — | 29.714→29.893 | 179 |
| 19 | 22.06. | ES | Short | IFVG DB gegen HTF (overextended); cleaner Close nötig | 16:15 | 7.586→7.571 | 15 |
| 20 | 19.06. | ES | Long | DB IFVG, HTF mixed; bis 22:00 gehalten (Planverstoß) | 16:00 | 7.552→7.577 | 25 |
| 21 | 17.06. | NQ | Short | DB IFVG aus 30m-FVG; TP Asia Low; 2. Entry SL zu eng | — | 30.524→30.330 | 194 |
| 22 | 15.06. | NQ | Long | Break&Pullback IFVG; News bullish; 100pt-TP, getrailt | 16:00 | 30.726→30.818 | 92 |
| 23 | 14.06. | NQ | Long | DB CISD ohne IFVG; ON-VWAP über Preis ⇒ „B+ Setup" | 15:55 | 29.354→29.500 | 146 |
| 24 | 08.06. | NQ | Long | 1. Mid Range (schlecht), 2. „A+": DB IFVG über allen VWAPs, 1h unfilled getappt | — | 29.463→29.635 | 171 |
| 25 | 04.06. | NQ | Short | IFVG, Break→Retrace zu NY VWAP, 5m FVG | 15:55 | 30.252→30.186 | 66 |
| 26 | 28.05. | NQ | Short | IFVG unter allen VWAPs; SL über letztem Hoch+VWAP | 16:00 | 30.016→29.936 | 80 |
| 27 | 28.05. | NQ | Long | CISD ohne IFVG, OR-Break, 30m-FVGs; Muster-SL | 16:00 | 30.011→30.112 | 100 |
| 28 | 21.05. | ES | Long | IFVG DB; Alignment bewusst ignoriert (riskant) | 15:50 | 7.417→7.429 | 12 |
| 29 | 20.05. | NQ | Long | 1m-IFVG nach 1h-FVG-Tap (30s-IFVG verworfen) | 16:15 | 29.126→29.233 | 107 |
| 30 | 19.05. | NQ | Short | 1. Trade Loss (Mid Range, SL zu eng), 2. NY-VWAP-Retest IFVG, Basehits | 17:20 | 28.806→28.745 | 61 |
| 31 | 16.05. | ES | Long | IFVG, NY-Break nach ON-Tap; 1:1 wegen ATH | 16:05 | 7.496→7.507 | 11 |
| 32 | 16.05. | NQ | Long | DB ausgelassen (nicht über allen VWAPs), IFVG genommen | 16:45 | 29.260→29.306 | 46 |
| 33 | 16.05. | NQ | Long | Volle Sequenz: Break→PD-NY-Tap→DB/V-shape→IFVG | 17:20 | 29.383→29.434 | 51 |
| 34 | 16.05. | ES | Long | 15m-FVG-Tap+ITL-Sweep ohne IFVG; Freitags-Exit | 17:25 | 7.412→7.422 | 10 |
| 35 | 16.05. | NQ | Long | DB IFVG + NY-VWAP-Break; ATH-Level 28.814 | 15:50 | 28.750→28.802 | 51 |
| 36 | 16.05. | NQ | Long | 1. Entry ohne IFVG, 2. mit IFVG nach Break | ~16:15 | 28.457→28.521 | 64 |
| 37 | 24.08. | ES | Short | DB gegen eigene Regel; „in ES ist VIC zu schwach"; früher Exit | ~16:00 | ~7.665→~7.672 BE/früh | — |

\* Screenshot-Datum; tatsächlicher Handelstag möglicherweise früher (Journaling-Batch).

**Kennzahlen daraus:**
- NQ-Gewinnerstrecken: 46–194 Punkte, Median ≈ **95 Punkte**. ES: 10–25 Punkte, Median ≈ 15.
- Haltezeiten: überwiegend **10–50 Minuten**; Ausreißer T14 (~85 min) und T20 (6 h, ausdrücklich gegen den Plan).
- Entry-Zeiten aller Winner: **15:40–17:25 CEST**, Häufung 15:50–16:30. Kein einziger Winner-Entry nach 17:25.
- 16.05.2026 war der dichteste Tag: 6 dokumentierte Winner (T31–T36).

---

## 4. Die drei VWAPs: Regeln

1. **Beste Trades, wenn alle 3 VWAPs unter oder über dem Preis sind** (T23 wörtlich;
   bestätigt in T3, 8, 13, 15, 22, 24, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36).
   In T32 zum ersten Mal als aktives Veto: Double Break ausgelassen, weil noch nicht
   über allen dreien; erst der spätere IFVG-Entry wurde genommen.
2. **Kein Entry zwischen den VWAPs.** „Nächstes mal nur Trades die klar über oder
   unter allen 3 Vwaps sind" (L19, nach −360$). Preis zwischen den Linien = Chop.
3. **Ordnungs-Hypothese (unbestätigt):** Für Longs soll NY VWAP der oberste sein.
   L16 verlor ein ansonsten regelkonformes B&R-Setup — einzige gefundene Abweichung:
   „NY Vwap war nicht an höchster stelle sondern unter Overnight Vwap." L24 nennt es
   „nicht gemeinsam im Takt". → Muss an den 37 Winnern gegengeprüft werden.
4. Alignment bewusst ignorieren ging in T28 gut („hab nicht wirklich auf VWAP
   allignement geschaut") — als Ausnahme dokumentiert, nicht als Widerlegung: der TP
   wurde dafür bewusst verkürzt, weil die VWAPs über dem Einstieg lagen.
5. **VWAP-Interaktion ist Pflichtteil des Modells.** „Es war mehr rein ICT als wares
   Vwap Trading. wir hatten weder NY VWap tap noch Break von irgenwas" (L15, Trade B)
   — FVG+IFVG ohne VWAP-Bezug ist kein VIC-Trade.
6. **NY VWAP muss im Continuation-FVG liegen:** „5m FVG war da aber NY Vwap war nicht
   drinne. Also kein Trade für uns." (L3).

---

## 5. Die Setups und die Auswahlregel

### 5.1 Continuation („VIC Model" im engeren Sinn / Break and Retest / Break and Pullback)
Ablauf: gerichteter Push → Retrace in einen **unfilled 5m- oder 15m-FVG, in dem der
NY VWAP liegt** → IFVG (min. 1m, mit Close) bzw. CISD → Einstieg in Trendrichtung.
Merkmale aus den Winnern: V-shape recovery, Halten von Overnight/PD VWAP, Sweep von
Session-Lows/Highs vor dem Entry (T7, 10, 11, 14, 15, 17, 22, 25, 29, 30, 31).

### 5.2 Double Break
Ablauf: Opening-Range-Break mit **starkem Momentum vor dem Break** und **cleanem
Close** (T19 wörtlich: „Der Close war auch clean was wichtig ist bei Double Breaks"),
idealerweise mit IFVG; Ziel schnell (oft gegenüberliegende OR-Seite).
Gebacktestete Zusatzregeln (T18): (a) DB-Fail → neues Low/High → starker Rebreak =
weiterhin gültig; (b) OR-Break um nur wenige Punkte wird oft resweept.

### 5.3 Die Auswahlregel (sechsmal unabhängig formuliert: T7, T13, T16, T17, L2, L3, L12)
> **Gibt es seit NY Open einen unfilled 5m/15m-FVG (mit NY VWAP darin) ⇒ Continuation/VIC.
> Gibt es keinen ⇒ IMMER Double Break.**

Ergänzungen:
- Starkes Momentum **durch** den NY VWAP spricht für DB und gegen VIC (T13: „Das ist
  etwas was wir beim VIC Model nicht sehen wollen").
- NY VWAP **außerhalb der Opening Range** ⇒ DB low probability, B&R stark (T7, T15).
- Sind die Continuation-Bedingungen der Gegenrichtung erfüllt (HTF-Bias + unter allen
  VWAPs + OR-Low gebrochen + saubere Entries nach NY-VWAP-Tap), dann ist der
  Gegen-Double-Break **kein** Ersatz (L20 — genommener DB-Long verlor, markierter
  Continuation-Short traf).
- L2 als Loss-Beleg: „Wenn wir 15m und 5m FVGs haben mit NY VWap, DANN NEHMEN WIR
  KEINEN DOUBLE BREAK SONDERN VIC MODEL" — Regel war vorher formuliert, wurde
  gebrochen, Max-Loss.

### 5.4 Verbotene / undefinierte Varianten
- **Mid Range Trades: verboten.** T24: „Nächstes mal erst auf Opening Range break
  warten und nicht mehr Midrange Trades nehmen." Trotzdem danach wieder genommen
  (T30 Trade 1 = Loss, L8) — beide Male verloren.
- **Reentry-Variante** (L18, sauber beschrieben): alle VWAPs gebrochen + klare
  Seller-Stärke + VWAP-Retrace + IFVG.
- **„reclaim VIC Model entry"** (L7): einmal erwähnt, nie definiert. Offen.

---

## 6. Entry-Trigger-Sequenz (mechanisch)

Aus T33 (vier beschriftete Schritte), T35, L19, L22, T24:
1. **Opening-Range-Break abwarten.** Vorher kein Entry — keine Ausnahme. (T24, L11
   „Trade bevor Break und überhaupt klarer Range", L19 „immer warten auf opening
   Range break. Alles andere ist eher gamble als klare Struktur.")
2. Retrace / Tap an einen der VWAPs (welcher, hängt vom Setup ab).
3. **IFVG bildet sich und schließt** (min. 1m; 30s verworfen T29; „schwacher Break-
   Close" macht ihn ungültig L4; FVG muss unfilled sein L4).
4. **NY-VWAP-Break als Bestätigung.** IFVG ohne VWAP-Break = warten (L22 wörtlich:
   „IFVG aber ohne Vwap Break. Warte auf VWAP Break für klare confirmation").
   Auch L19: „Wir hätten einfach warten können bis wir über NY Vwap brechen."
5. Zweiter Entry nach Break ist die stärkere Variante desselben Moves (T36: 1. ohne
   IFVG, 2. mit IFVG; T24: 1. Mid Range schlecht, 2. A+).

**Signal-Chart ist NQ, Ausführung MNQ.** „Nächstes mal nur auf NQ CHart schauen und
dann MNQ traden, denn es wäre eigentlich nie zu einem Trade gekommen hätten wir das
gemacht" (L22). Vorstufe L3: „wir nehmen es nicht wenn NQ es nicht zeigt."
Cross-Market-Veto: ES-Trade nicht nehmen, wenn NQ klar dagegen steht (L8);
SMT (ES sweept London, NQ nicht) als Bias-Argument (L3).

---

## 7. Bias- und Kontextregeln

- **HTF-Definition ist mechanisch: HHs+HLs = bullish, LHs+LLs = bearish** (T11, 17,
  22, 27, 28, 29, 31, 33, L6, L17, L24). „Bias" ohne diese Struktur zählt nicht
  (L4: „HTF war Bullish aber die Struktur davon war sehr schwach bullish").
- **Offener Konflikt: welcher Timeframe ist „HTF"?** L21: 15m machte Lower Low,
  1h weiter HH/HL — beide Lesarten möglich, Trade verlor. Braucht feste Hierarchie.
- **Gegen-HTF-Trades sind erlaubt, aber nur mit Overextension-Begründung** (T9, T19:
  „zu sehr im premium", lange kein Pullback zum Overnight VWAP, Bookmap ohne Orders
  darüber) — und dann **schnelle TPs** (L18: „HTF war Bearish deshalb hätten wir
  schnelle TPs nehmen sollen").
- **Bias-Flip erst nach bestätigtem Pullback:** Nach High-Sweep nicht sofort bullish
  drehen; „nach jedem neuen High kommt auch ein Pullback und darauf habe ich nicht
  geschaut" (L9).
- **Erschöpfung:** Nach ~1000-NQ-Punkte-Moves (bzw. sehr großen ES-Moves — die
  ES-Notiz „1000pkt" in L14 ist als grober Ausdruck zu lesen, der Move dort waren
  ~100 ES-Punkte) ist die Fortsetzung in gleicher Größe unwahrscheinlich; danach eher
  Chop als Linie (L14, L18, L19). Konsequenz: frühere TPs (OB High), keine Longs
  direkt nach Dump.
- **ATH-Conditions:** Shorts unwahrscheinlicher (L22); mangels Ziele 1:1 RR (T31).
- **Beide OR-Seiten bereits abgeholt ⇒ kein A+** (L22). Range vor NY Open größer als
  die gesamte Opening Range ⇒ Longs unwahrscheinlicher (L17). Starker London-Dump
  drückt Long-Wahrscheinlichkeit (L10).
- **Kalender:** Freitag = schlechte Price Action (T34-Exit; Loss-Tage 05.06., 26.06.,
  24.07. waren Freitage; L5 wörtlich „am Freitag einfach mal ruhig sein"). Bank
  Holiday am Folgetag = unklare Struktur (T20). **News:** T22 nutzt bullishe News als
  Confluence; L9 verlor 2 Accounts durch Trump-News gegen die Position — es gibt
  keinen News-Filter, und das war der teuerste Einzelfehler der Sammlung.
- **„No trading Day"** (L11): unklare Range + kein Break + HTF dagegen ⇒ gar nicht
  handeln. Kriterien bisher nur negativ definiert.

---

## 8. Stop-Loss-Regeln

Kernprinzip (dreimal bei Winnern, mehrfach bei Losses):
> **Der Stop sitzt hinter dem Punkt, dessen Bruch die Richtungsthese widerlegt.**
- T26: über dem letzten Hoch — „wenn wir wirklich bearish sind will ich nicht nochmal
  ein HH sehen".
- T27: unter dem Low, das den 30m-FVG getappt hat, und dem Low, das die Range brach.
- T15 / L24: **über/unter Swing High/Low UND jenseits des Overnight VWAP** — beide
  Bedingungen zusammen.
- L1: mindestens am **5m ITH/ITL**.
- L10 (Umkehrung): „wenn wir wirklich Bullish wären, hätten wir nicht nochmal ein
  Lower Low gebildet" — dort gehört der Stop hin, nicht weiter weg.

Verbote:
- **SL nie direkt auf einem VWAP-Level** (L24: „SL war viel zu klein und direkt auf
  VWAP level") — Magnetlevel werden angelaufen.
- **SL nie nachträglich verschieben** (L12: 300$→900$), **nie Kontrakte nachlegen**
  (L12), **nie manuell schließen statt SL** (L7: „feste SLs drin haben die dein
  Trade invalidieren"; T12 derselbe Fehler bei einem Winner-Setup).
- Fehlerbild in Zahlen: „SL zu eng" in T21, T30-1, L1, L13, L19, L23-2/3, L24-1;
  „SL zu weit (Confidence/negatives RR)" in L10, L21-2. Beides dieselbe Ursache:
  Stop nicht am Invalidierungspunkt.

---

## 9. Take-Profit-Regeln

Katalog aller dokumentierten TP-Anker:
- Gegenüberliegende **Opening-Range-Seite** (Standard beim Double Break; T18, L22).
- **Session-Level:** Asia Low (T21), NY Open High (L23 — bewusst statt „zu protected"
  ITH), NYAM/NYPM-Level als DOLs.
- **Value-Level:** PD VAH (T11 exakt), PD VWAP (T17).
- **HTF-Anker:** 50% eines langen 4h-Wicks (T4), 4h unfilled FVG (T15), 1h-Kerzen-
  **Body** statt Wick-Extrem (T17, L13, L15 — „open Candle Bodys" sind starke DOLs,
  lange Wicks schlechte), OB High (L14), letztes Low bei Overextension (L15).
- **Bookmap-Orders** als Ziel (T6).
- **Fester 100-Punkte-TP + Trailing** (T22, Einzelfall).
- **Basehits** nach Verlust oder bei Unklarheit (T30); **schnelle TPs bei
  Gegen-HTF-Trades** (T26, T28, L18) und generell bei Overextension.
- **Kerzen-Exit:** an einem High-Resistance-Hoch signalisiert eine (Umkehr-)Kerze
  den Pullback → raus (T34). Schwäche der Käufer sehen → früher raus (L14, dort
  als richtig bewertet).
- DOL-Qualität (L15): **1h Candle Body Open = starker DOL; langes Wick-Ende =
  schlechter DOL; „protected" Level = schlechter TP** (L23). Bei unklarem DOL nicht
  lange laufen lassen.

---

## 10. Risiko und Ausführung — die teuerste Kategorie

Soll-Werte aus den Notizen: **300$ Risiko pro Trade** (L12), Größe **aus der
Stop-Distanz in Punkten abgeleitet, nicht fix „2 MNQs"** (L17).

Tatsächlich dokumentierte Verstöße:
| Loss | Verstoß | Schaden |
|---|---|---|
| L5 | NQ statt MNQ erwischt (10× Größe), oversized, außerhalb der Zeit | „fast alle Accounts geblowt" |
| L7 | Position zu groß → manuell geschlossen → Trade lief zum TP | Winner zu Loss gemacht |
| L9 | volle Größe in Trump-News | 2 Accounts weg |
| L12 | +1 Kontrakt, SL verschoben | 3× Soll-Risiko (900$), Buffer weg |
| L16 | Account bei +1,7k, viel zu groß eingestiegen | ganzer Account weg |
| L21 | ES-Trade ohne klares RR | >3.200$ auf einen Trade |
| L18/L23 | Weitertraden nach +300$ / nach 1. Loss | Gewinn verspielt / Loss verdoppelt |

**Positionsgröße/Disziplin ist damit die häufigste und teuerste Verlustursache der
gesamten Sammlung — vor jedem Setup-Fehler.** Selbstformulierte Gegenregeln:
fester Tagesschluss nach erstem Loss (L23) bzw. nach ~+300$ (L18), Freitag ruhig
(L5), „lernen zu verlieren" (L21), nach dem ersten Ergebnis den Chart zumachen (L23).

---

## 11. Zeit-Analyse

- **NY Open 15:30 CEST ist der Anker.** PO3-Manipulation = 15:30 (T30). Breaks werden
  fast ausschließlich 15:30–16:00 markiert. 16:00 CEST (= 10:00 ET) ist sekundärer
  Trigger („10:00 am open" T17, „10:00 Sweep" T21).
- **Winner-Entries: 15:40–17:25, Häufung 15:50–16:30.** Nach 17:25 existiert kein
  dokumentierter Winner-Entry.
- **Losses nach 17:00 sind fast immer Zweit-/Rache-Trades:** L2 (17:15–17:30 FOMO-
  Longs), L5 (~17:10 „außerhalb unserer Zeit"), L23 (17:30–18:15, Loss verdoppelt),
  L19 (20:45–21:35, „weit über unserer Trading Zeit was unsere Winrate deutlich
  niedriger macht").
- Faktisches Zeitfenster des Modells: **Entries 15:30–~17:00, Management bis ~17:30,
  danach nichts mehr.** T20 (Halten bis 22:00) war ausdrücklich ein Planverstoß.
- Journaling passiert nachts (Screenshots 00:23–03:46 bei L22/L24, 02:55 bei T36).

---

## 12. Kerzen- und Momentum-Merkmale

Aus den Notizen und den sichtbaren Charts:
- **Vor einem Double Break:** große gerichtete Momentum-Kerze(n), dann Break-Kerze
  mit **cleanem Close** jenseits des Levels. „Schwache langsame price action" vor dem
  Break macht den DB ungültig (L8); „Break sehr schwach" (T37/ES), „Kleiner ‚Break'"
  vs. „Richtiger Break" (L24), „IFVG schwacher break close" (L4) — der Close trägt
  die Beweislast, nicht der Docht.
- **Beim Continuation:** V-shape recovery in/aus dem HTF-FVG, Halten der VWAPs als
  Serie („Vwap gehalten" ×3 in L1-5m — dort als Long-Beleg gegen den genommenen
  Short), IFVG-Kerze schließt über/unter dem NY VWAP.
- **Schwacher OR-Break um wenige Punkte** → Low/High wird häufig noch einmal
  gebrochen oder gesweept (T18, gebacktestet).
- **Lange Wicks an HTF-Kerzen:** Reaktionszonen — als TP-Extrem meiden (T17),
  als DOL schlecht (L15), als Kontraindikation gegen „ganz unten" (L15 4h-Wick
  = stärkere Buyers im Moment).
- **High-Resistance-Hoch + Umkehrkerze = Exit-Signal** (T34).
- Wiederkehrende Sequenz der A+-Trades (T24, T33, T35, T36): Break → VWAP-Tap mit
  Reaktion → (Double Break oder V-shape) → IFVG-Close → NY-VWAP-Break → Lauf zum
  nächsten Level. Die schwächeren Einstiege desselben Moves lagen immer **vor**
  einem dieser Bestätigungsschritte.

---

## 13. Was trennt Winner von Losses (Bestandsaufnahme)

Zerlegung der 24 Loss-Tage nach primärer Ursache (mehrere Trades pro Tag möglich):
- **Reine Ausführung/Risiko trotz gültigem oder brauchbarem Setup:**
  L1 (SL-Ort), L7 (manueller Close), L9 (News/Size), L12 (Size/SL-Move), L14 (früher
  Exit — vertretbar), L15-A (DOL/TP-Wahl), L21-2 (Size/RR), L23-1 (gültiger Trade,
  SL korrekt — normaler Verlust), L24-1 (SL auf VWAP). ≈ 9 Fälle.
- **Setup-Disziplin gebrochen (Regel existierte schon):** L2 (DB statt VIC), L5
  (kein Setup, Freitag, Zeit), L8 (DB gegen VIC + Mid Range), L11 (vor Break), L13
  (Reverse statt DB halten), L17 (Mid-Range-Verwandtes + Size), L18 (FOMO nach +300),
  L19 (Entry zwischen VWAPs, vor NY-Break), L20 (Gefühl statt Plan), L22 (MNQ-Signal
  statt NQ), L23-2/3 (Revenge), L24-2 (FOMO). ≈ 12 Fälle.
- **Kontext falsch gelesen:** L4 (getappter FVG, schwacher Close), L6 (guter Trigger
  gegen HTF und unter allen Leveln), L10 (HTF-Fehllesung V-shape vs. bearish), L16
  (einziger ungeklärter — Ordnungs-Hypothese), L21-1 (1h/15m-Konflikt). ≈ 5 Fälle.

Bei den Winnern steht dem gegenüber: 30+ von 37 mit VWAP-Alignment, alle im
Zeitfenster, fast alle mit OR-Break + IFVG/CISD + VWAP-Interaktion. Die Merkmale, die
in den Losses fehlen, sind fast immer dieselben vier: Alignment, OR-Break zuerst,
NY-VWAP-Bestätigung, Stop am Invalidierungspunkt.

**Wichtig für jede spätere Statistik:** Die Sammlung ist ein kuratiertes Journal,
kein vollständiger Track Record. Winner und Losses sind getrennt eingereicht, zwei
markierte Winner wurden nicht genommen (L20, L22), T12/T37 sind halbe Ausführungen.
Winrate-Aussagen lassen sich daraus nicht ableiten — Regeln schon.

---

## 14. Widersprüche und offene Punkte (müssen vor dem Bau geklärt werden)

1. **HTF-Hierarchie:** 15m vs. 1h können widersprechen (L21). Welcher gewinnt, und
   ab wann gilt eine Struktur als gebrochen (Close? Wick? wie viele Punkte)?
2. **Opening Range:** exakte Definition fehlt (15:30–16:00? High/Low welcher
   Kerzen?). Alles hängt an ihr.
3. **VWAP-Ordnungs-Hypothese** (NY oben für Longs, L16/L24): an den 37 Winnern
   gegenprüfen — dafür brauche ich die Panelzustände, die dokumentiert sind.
4. **„reclaim VIC entry"** (L7) und **Mid Range** (offiziell verboten, faktisch
   wieder genommen): Status klären — Mid Range komplett raus?
5. **Panel-„Trend"-Logik:** Wie berechnet der Indikator Strong Up/Down/Neutral?
   (Für den Bot muss ich das nachbauen.)
6. **„protected"**: operational nur teilweise definiert (nächstes LH im Trend T2;
   PO3-Manipulation macht High protected T30). Vollständige Definition nötig.
7. **Bookmap-Bestandteile** (T6, T9): im Bot nicht verfügbar — Ersatz oder weglassen?
8. **1000-Punkte-Schwelle** der Erschöpfungsregel: NQ-Wert klar, ES-Äquivalent
   (~100 Punkte?) festlegen.
9. **News-Filter:** existiert nicht, kostete am meisten (L9). Kalender-Blackout
   (CPI/FOMC/NFP + Breaking-News-Fenster) definieren.
10. **Freitags-Regel:** ganz aussetzen oder reduzierte Größe?

---

## 15. Kompakteste Fassung des Regelwerks (Stand der Dokumentation)

1. Handle nur 15:30–~17:00 CEST, Einstiege nach dem Opening-Range-Break, nie davor.
2. Bestimme den Bias mechanisch (HH/HL vs. LH/LL auf 15m, Konfliktregel offen).
3. Alle 3 VWAPs auf einer Seite des Preises — sonst kein Trade.
4. Unfilled 5m/15m-FVG mit NY VWAP darin seit NY Open? → Continuation. Keiner? → Double Break. Niemals das jeweils andere.
5. Trigger-Reihenfolge: Break → VWAP-Tap → IFVG-Close (≥1m, FVG unfilled) → NY-VWAP-Break. Jeder fehlende Schritt = warten.
6. Momentum-Prüfung: starke Kerzen und cleaner Close vor/beim Break; schwacher Break = ungültig (bzw. Resweep erwarten).
7. SL an den Invalidierungspunkt (Swing + jenseits Overnight VWAP, min. 5m ITH/ITL), nie auf einen VWAP, nie anfassen.
8. TP an das nächste unprotected Level (OR-Gegenseite, Session-Level, 1h-Body, Value-Level); gegen HTF oder nach Erschöpfung: kurz.
9. Größe aus Stop-Distanz bei 300$ Risiko; Signal NQ, Ausführung MNQ; ein Ergebnis pro Tag (Loss ODER ~+300$), dann Schluss.
10. Kein Trade bei: News-Fenster, Freitag (mindestens reduziert), beide OR-Seiten abgeholt, Preis zwischen VWAPs, „No trading Day"-Bedingungen, direkt nach 1000-Punkte-Move in Gegenrichtung.

---

## Anhang A: Katalog der Losses (Loss 1–24)

Spalten: Handelstag (rekonstruiert aus Chart-Achse), Instrument, genommene Richtung,
was schiefging (Kurzform), Kernzitat.

| # | Tag | Instr. | Seite | Ursache | Kern der Notiz |
|---|---|---|---|---|---|
| 1 | Mi 12.08. | NQ | Short | SL zu eng + gegen HTF | „SL … hätte minimum beim 5m ith sein sollen"; „HTF war absolut Bullish"; 5m: VWAPs hielten bullish |
| 2 | Di 11.08. | ES | Long | DB statt VIC, dann FOMO | „…DANN NEHMEN WIR KEINEN DOUBLE BREAK SONDERN VIC MODEL – und ich hab es trotzdem nicht getan"; „FOMO Trade, MAx Loss gehittet" |
| 3 | Mo 10.08. | NQ | Long | zu früh, Signal nur auf MNQ | „Entry war nur auf MNQ … wir nehmen es nicht wenn NQ es nicht zeigt"; „B&R nur mit FVGs, DB ohne 5m/15m FVGs" |
| 4 | Mi 05.08. | NQ | Long | getappter FVG, schwacher Close, keine Geduld | „5m FVG nicht valid weil wir es schon getapped haben"; „IFVG schwacher break close"; „Wollte unbedingt in Longs" |
| 5 | Fr 24.07. | NQ | Long | kein Setup, oversized, NQ statt MNQ, Freitag, Zeit | „kein Target … oversized und außerhalb unserer Zeit … fast alle Accounts geblowt … am Freitag einfach mal ruhig sein" |
| 6 | Do 23.07. | NQ | Long | guter Trigger gegen HTF + unter allen Leveln | „Guter Trade, aber gegen HTF bias und unter VAL, POC, VAH und allen Vwaps außer NY" |
| 7 | ~16.07. | NQ | Short | Größe→manueller Close, Trade lief zum TP | „Nicht mehr manuell closen sondern feste SLs die den Trade invalidieren" |
| 8 | ~15.07. | ES+NQ | Long | DB gegen VIC, Mid Range, NQ zu bearish | „VIC Model war sehr viel cleaner … schwache langsame price action" vor dem DB; „Mid Range Trade" |
| 9 | Fr 10.07. | NQ | Long | gültiges Setup, Trump-News dagegen | „Idee war richtig. Timing war blöd, wegen Trump news"; 2 Accounts weg |
| 10 | Mi 08.07. | NQ | Long | HTF-Fehllesung, SL aus Confidence zu weit | „SL viel zu weit … wenn wir wirklich Bullish wären, hätten wir nicht nochmal ein Lower Low gebildet" |
| 11 | Di 07.07. | NQ | Long | vor Break, gegen HTF, No-Trading-Day | „Trade bevor Break und überhaupt klarer Range … Wäre eigentlich ein No trading Day" |
| 12 | Do 02.07. | NQ | Long | Continuation ohne HTF-FVG, +Kontrakt, SL bewegt | „Seit 15:30 kein FVG in 5m/15m Chart. ALSO KEIN CONTINUATION SETUP"; 300$→900$ |
| 13 | Mi 01.07. | NQ | Short→Long→Short | Position reversed, SL zu eng, Mentor statt Backtest | „Hätte einfach im Double Break bleiben müssen und den Daten vertrauen" |
| 14 | Fr 26.06. | ES | Long | nach Riesen-Dump Fortsetzung erwartet | „nach so einem starken Move ist es unwahrscheinlich dass wir direkt wieder … aufwärts gehen"; −50$, als richtig gemanagt bewertet |
| 15 | Di 23.06. | NQ | Short + Long | A: DOL unklar, zu lange gehalten; B: „rein ICT", kein VWAP-Bezug | „Lange Wick candles sind eher schlechte DOLs"; „weder NY VWap tap noch Break von irgendwas" |
| 16 | Di 16.06. | NQ | Long | regelkonform verloren — Ordnungs-Hypothese; Account bei +1,7k geblasen | „Vielleicht weil NY Vwap nicht an höchster Stelle war sondern unter Overnight Vwap" |
| 17 | Do 11.06. | NQ | Long | Sizing fix statt punktbasiert; Range > OR; HTF-FVG dagegen | „nicht auf die Points geschaut sondern einfach standard auf 2 MNQs" |
| 18 | Mi 10.06. | NQ | Long | nach +300$ weitergetradet, FOMO-Reihe | „FOMO Long weil mir die 300$ nicht genug waren"; Gegen-HTF ⇒ schnelle TPs |
| 19 | Di 09.06. | NQ | Short + Long | Entry zwischen VWAPs, vor NY-Break; 2. Trade 20:45 weit außerhalb Zeit | „nur Trades klar über oder unter allen 3 Vwaps … immer warten auf opening Range break" |
| 20 | Fr 05.06. | NQ | Long | Gefühl statt Plan; richtiger Short lag daneben | „wir waren absolut nicht Long und haben mehr auf unser Gefühl gehört"; markierter Winner = Continuation-Short |
| 21 | Mi 03.06. | NQ+ES | Long | 1h/15m-Konflikt; ES-Trade 3.200$ | „SL viel zu weit, negatives RR … lernen zu verlieren"; Winner = Trade in die blaue Box |
| 22 | Mo 01.06. | NQ+ES | Short | Signal nur auf MNQ, beide OR-Seiten abgeholt, ATH | „Nächstes mal nur auf NQ Chart schauen und dann MNQ traden"; Winner = DB mit NY-VWAP-Break (nicht genommen) |
| 23 | Mo 18.05. | NQ | Long, dann Revenge | 1. Trade gültig (SL unter Sweep-Low, TP NY Open High) = normaler Loss; danach Loss verdoppelt | „anstatt nach dem 1. Loss einfach auszumachen … LOSS verdoppelt" |
| 24 | Di 12.05. | NQ | Short + Long | SL direkt auf VWAP; FOMO-Gegentrade ohne Takt | „SL … direkt auf VWAP level"; „So hätte der Trade aussehen sollen: SL über Swing High und über Overnight VWAP" |

Muster über die Tabelle:
- **4 der 24 Loss-Tage waren Freitage** (05.06., 26.06., 10.07., 24.07.) — bei nur ~1/5
  der Handelstage. Die Freitags-Regel hat empirische Grundlage im eigenen Journal.
- **Kein einziger Loss entstand durch einen regelkonformen Double Break mit allen
  Bestätigungen.** Die zwei „regelkonform verloren"-Fälle (L16, L23-1) sind normale
  Verluste — L16 mit der offenen Ordnungs-Frage, L23-1 schlicht Gegenseite.
- In **mindestens 5 Loss-Tagen** stand der richtige Trade sichtbar daneben und wurde
  markiert, aber nicht genommen (L2, L8, L20, L22, L24).
