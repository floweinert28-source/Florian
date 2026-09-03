# Runde 13 – Kurze Haltedauern & Florians Wick-Idee (03.09.2026)

Daten: NQ, ES, YM, Gold, WTI (je 1.566 Tage, 1-min). Train 2021-09…2024-12, Test 2025-01…2026-08.
Kosten: NQ 0,75 Pkt · ES 0,4 · YM 2,5 · Gold 0,35 · WTI 0,03. Skripte: `backtest/research/r5/`.

## 1. Kurze Haltedauern, 2–5 Trades/Tag (NQ)
72 auswertbare Kombinationen (Breakout, Fade, Stretch, Kompression, Range-Expansion × Haltedauer 15/45/120 min × Stop 0,5/1/2 × Bar-Range × 4 Sessions).

| Bestes | Trades/Tag | WR (Train/Test) | Netto |
|---|---|---|---|
| Range-Expansion-Fade, Europa | 2,8 | 49,4 % (48,9/50,3) | –61.717 $ |
| Range-Expansion-Continuation, Vormittag | 2,6 | 49,1 % (48,7/50,1) | –77.507 $ |

Alle übrigen 47–50 %. **Kein Edge.** Methodischer Hinweis: Stops kleiner als eine Bar-Range sind auf 1-min-Daten nicht sauber bewertbar (Reihenfolge innerhalb der Kerze unbekannt) – konservativ als Verlust gewertet.

## 2. Wickless-Zone (Florians Setup)
Kerze ohne oberen Docht → Zone = Kerzen-Hoch → Tap = Short; ohne unteren Docht → Long. Limit am Level, Fill nur durch späteren Bar, Entry-Bar nur SL.

| NQ, 15-min | Trades/Tag | WR (Train/Test) | Netto |
|---|---|---|---|
| exakt kein Docht, US-Session | 0,56 | 53,0 % (53,1/52,9) | +31.372 $ |
| 2 % Docht erlaubt, US-Session | 1,74 | 51,1 % (50,9/51,5) | +27.773 $ |
| 2 % Docht, 11–13 Uhr | 0,66 | 52,8 % (53,2/52,0) | +31.769 $ |
| alle Uhrzeiten | 2,01 | 49,8 % | –62.308 $ |
| 5-min-Kerzen | 1,6–17 | 47,7–48,5 % | negativ |
| ES / YM | 0,3–24 | 48,2–50,5 % | negativ (Ausnahme YM tol0 52,4 %, instabil) |

**Kontrolltest (11–13 Uhr, NQ, gleiche Logik):** Wickless 52,8 % ± 1,7 · Kerzen **mit** Docht 50,3 % ± 0,8 · alle Kerzen 50,3 %.
→ Die Idee schlägt die Kontrolle um +2,5 pp (1,3 σ, nicht signifikant), ist aber besser als der Zufall und auf NQ in beiden Perioden stabil. Toleranz 0–15 % ändert wenig (52,1–52,8 %) → entscheidend ist „kleiner Docht", nicht „kein Docht". ES bestätigt nicht.

## 3. Nebenfund aus der Kontrolle: „Wick-Magnet"
Der Kontrollarm „Tap der **Body-Kante** einer Kerze **mit** Docht, Fade" ergab 46,5 % ± 0,8 (N=3.503) – 4,4 σ unter 50 %. Umgekehrt gehandelt (Richtung Dochtspitze):

| NQ 15-min, RTH, optimistischer Entry (Limit am Level) | Trades/Tag | WR (Train/Test) | Netto |
|---|---|---|---|
| TP = Dochtspitze | 10,6 | 71,2 % (71,6/70,6), BE 70,1 % | +127.073 $ |
| TP = 1R | 5,5 | 51,7 % (52,1/50,7), BE 50 % | +227.418 $ |
| Fade (Gegenrichtung) | 5,5 | 47,9 % | –471.415 $ |

Konsistent über alle Jahre (70–72 %) und Instrumente (ES 70,7 %, YM 70,4 %); Look-Ahead-Kontrolle: 200 Trades unabhängig nachsimuliert, 0 Abweichungen.

**Aber unter realistischer Ausführung bricht es weg:**

| NQ, TP 1R | WR | Netto/Trade |
|---|---|---|
| Limit exakt am Level | 51,7 % | +31,5 $ |
| + 0,5 Pkt Slippage | 51,2 % | +24,8 $ |
| Entry am Schluss des Tap-Bars | 50,8 % | +11,3 $ |
| Kosten ×4 | 51,7 % | –13,5 $ |
| Gold / WTI | 50,6 / 50,9 % | –33 / –23,5 $ |
| ES / YM (pessimistisch) | 50,2 / 50,5 % | –14,0 / –7,2 $ |

Parameter-Instabilität unter pessimistischer Ausführung: Docht > 15 % → +31,1 $/Trade, > 25 % → +2,0 $, > 35 % → +3,4 $, > 50 % → –10,1 $. Long +1,2 $ vs Short –15,5 $ (Marktdrift). Weite Stops mit fernen Zielen (SL 1,5 × Range, TP 2R) zeigen +127 $/Trade bei 46 % WR – das ist Haltedauer plus Aufwärtsdrift, kein Setup-Edge.

## 4. Fazit
- Kurze Haltedauern: kein Edge (47–50 %).
- Florians Wickless-Zone: real besser als die Kontrolle, aber klein (+2,5 pp), NQ-spezifisch, ~0,6–1,7 Trades/Tag. Kein 60 %, kein 80 %.
- Wick-Magnet: die stabilste Struktur der ganzen Untersuchung (Fade an der Body-Kante verliert zuverlässig), aber der handelbare Rest ist nach realistischer Ausführung ~+11 $/Trade auf NQ und negativ auf ES/YM/Gold/WTI.
- Robust und praktisch verwertbar ist nur die **negative** Aussage: Nicht an der Body-Kante einer Docht-Kerze dagegenhandeln (46,5–48 % über 5 Instrumente).

## 5. Umkehr-Test der größten Verlierer (Frage: „Gab es Strategien mit extremem Minus?")
Größte Verluste über 5 Jahre: Impulskerzen-Continuation NQ –1.906.164 $ (36.784 Trades), k=4 –1.001.266 $, Body-Kanten-Fade –332.829 $, Wick-Magnet-Fade –471.415 $, Sweep→Displacement –163.945 $.

**Test, ob der Verlust strukturell oder kostenbedingt ist** – dieselbe Impulskerzen-Logik in beide Richtungen (NQ):

| Richtung | Trades | WR | Breakeven | pro Trade |
|---|---|---|---|---|
| Fade, TP 1R | 28.163 | 50,0 % | 50,0 % | –16,2 $ |
| Continuation, TP 1R | 28.163 | 49,9 % | 50,0 % | –14,8 $ |
| Fade, TP 0,5R | 35.391 | 65,6 % | 66,7 % | –18,5 $ |
| Continuation, TP 0,5R | 35.391 | 66,0 % | 66,7 % | –17,9 $ |

ES und YM identisch (49,7–50,2 %). **Ergebnis: Beide Richtungen liegen auf Breakeven, der gesamte Verlust ist Kosten** (15–25 $/Trade bei 21–29 Trades/Tag). Umkehren bringt nichts, weil Kosten richtungsunabhängig sind.

**Einzige strukturelle Ausnahme:** Body-Kanten-Fade 46,5 % bei Breakeven 50 % (3,5 pp strukturell). Umgekehrt = Wick-Magnet 51,7 % (+1,7 pp) – siehe Abschnitt 3.

**Konsequenz für Prop-Firm-Strategien:** Jeder Ansatz mit hoher Frequenz stirbt an den Kosten, nicht am Markt. Bei 20 Trades/Tag sind allein 300–500 $ Tagesgewinn nötig, um Spread und Kommission zu decken.

### 5b. Warum 26–33 %-Winrates kein umkehrbarer Edge sind (`research/r5/artifact_check.py`)
In früheren Runden tauchten Zellen mit 26–33 % Winrate auf (z. B. Impulskerzen-Fade,
Schwelle 5 × Median, Stop 1 × Bar-Range: N=1.036, 26,5 %, –73.327 $). Naheliegender
Gedanke: umdrehen. Der Test zeigt, dass das nicht geht.

Aufbau: identische Impulskerze, Entry am Open des Folgebars, Barrieren symmetrisch
bei k × typischer Bar-Range (Tagesmedian der 1-min-Ranges), gehalten bis Tagesende.
Bei sauberer Messung müssen FADE-WR und CONT-WR zusammen 100 % ergeben.

| Barriere (× Bar-Range) | FADE WR | CONT WR | Summe | beide im selben Bar |
|---|---|---|---|---|
| 0,5 | 26,0 % | 23,9 % | 49,9 % | 50,1 % |
| 1,0 | 40,6 % | 39,0 % | 79,6 % | 20,4 % |
| 2,0 | 48,3 % | 48,5 % | 96,7 % | 3,2 % |
| 3,0 | 49,2 % | 49,8 % | 98,9 % | 0,9 % |
| 5,0 | 49,3 % | 49,8 % | 99,1 % | 0,1 % |
| 8,0 | 48,3 % | 48,8 % | 97,1 % | 0,1 % |

Bei Stops unter 1 × Bar-Range liegen 20–50 % aller Trades mit TP **und** SL im selben
1-min-Bar. Die konservative Regel (SL vor TP) bucht diese Fälle in **beiden** Richtungen
als Verlust, also verlieren Fade und Continuation gleichzeitig. Ab 2–5 × Bar-Range
addieren sich beide Richtungen auf 97–99 % und liegen beide bei ~49 %.

**Folge:** Die 26–33 %-Zellen sind Messartefakte enger Stops, kein Edge. Ein Umkehren
liefert wieder ~33 %, nicht 67 %.

### 5c. Umkehr der schlechtesten Zellen mit sauberen Barrieren (`research/r5/worst_and_invert.py`)
72 Zellen (Fade/Continuation × 4 Tagesfenster × 3 Impulsschwellen × 3 Barrierenweiten,
Barrieren als Vielfache der Impulskerzen-Range, N ≥ 600). Die fünf schlechtesten und
ihre exakte Gegenrichtung:

| Zelle | N | WR (Train/Test) | Netto | invertiert WR | invertiert Netto |
|---|---|---|---|---|---|
| Fade, Schwelle 5,0, k 2,0, EU | 901 | 47,9 % (49,5/44,7) | –76.347 $ | 51,7 % | +47.577 $ |
| Fade, Schwelle 5,0, k 3,0, EU | 889 | 48,1 % (49,3/45,7) | –83.344 $ | 51,6 % | +55.872 $ |
| Cont., Schwelle 2,0, k 1,0, EU | 13.562 | 48,8 % (49,1/48,3) | –244.373 $ | 50,7 % | –198.777 $ |
| Fade, Schwelle 2,0, k 3,0, MORN | 7.655 | 48,9 % (48,8/49,1) | –308.303 $ | 51,1 % | +78.653 $ |
| Cont., Schwelle 2,0, k 3,0, EU | 8.175 | 49,0 % (49,3/48,3) | –109.181 $ | 50,9 % | –143.033 $ |

Mit sauberen Barrieren liegt die schlechteste von 72 Zellen bei 47,9 %, nicht bei 26 %.
Die Inversion landet bei 50,7–51,7 % – das ist genau die Spiegelung der Kosten (~1 pp
bei 0,75 Punkten NQ), kein struktureller Vorteil. Zwei der fünf Inversionen bleiben
trotzdem negativ. Außerdem sind die fünf Zellen aus 72 als Extremwerte ausgewählt, ihre
Inversion ist per Konstruktion nahe am Optimum.

**Gesamtfazit zur Umkehr-Frage:** Es gibt in fünf Jahren und ~380.000 getesteten
Varianten genau eine strukturelle, richtungsabhängige Asymmetrie – den Body-Kanten-Fade
(46,5 % bei Breakeven 50 %). Alles andere, was stark negativ aussieht, ist entweder
Kosten (richtungsunabhängig) oder ein Messartefakt zu enger Stops.

## 6. Korrektur: Rückkehr zum VWAP mit echtem RR 1:1 (`research/r5/vwap_return_1to1.py`)
**Fehler in Runde 3:** Dort war „TP am VWAP" mit dem engen Stop am Sweep-Extrem
kombiniert. Der Weg zum VWAP ist aber weit, der Stop war eng – faktisch RR 1:2 bis
1:3. Die damals notierten 27–45 % waren also der RR-Effekt, nicht die Strategie.

**Korrekte Rechnung:** TP = VWAP (Wert zum Entry eingefroren), SL exakt spiegelbildlich
im gleichen Abstand → RR 1:1, Breakeven 50 %. 120 Varianten je Instrument
(VWAP-Anker Session/RTH × Trigger Reclaim/Touch × Band 1,0–3,0 σ × Start 10:00/10:30/11:00
× ein Trade pro Tag / mehrfach), Auswertung bis 16:00 NY, Entry zum Close → Bewertung
ab Folgebar, SL vor TP im selben Bar.

| Instrument | Median-WR über 120 Varianten | beste Zelle |
|---|---|---|
| NQ | 49,0 % | 55,7 % (N=413) |
| ES | 48,6 % | 52,2 % |
| YM | 49,6 % | 52,8 % |
| Gold | 48,5 % | – |
| WTI | 49,5 % | – |

Damit ist der alte 27–45 %-Eintrag erledigt: Die Strategie ist bei 1:1 **nicht** kaputt,
sie ist neutral.

### 6a. Der auffällige NQ-Bereich (`research/r5/vwap_verify.py`)
Auf NQ liegt ein zusammenhängendes Plateau bei Band ≥ 3 σ (Session-VWAP, Reclaim-Entry):

| σ \ Start | 10:30 | 10:45 | 11:00 | 11:15 | 11:30 |
|---|---|---|---|---|---|
| 2,50 | 50,2 % | 50,2 % | 51,1 % | 51,3 % | 51,8 % |
| 2,75 | 50,1 % | 51,3 % | 51,3 % | 52,0 % | 52,5 % |
| **3,00** | **54,0 %** | **55,6 %** | **55,7 %** | **55,7 %** | **54,0 %** |
| 3,25 | 53,5 % | 55,0 % | 55,3 % | 54,7 % | 53,8 % |
| 3,50 | 54,4 % | 54,1 % | 55,4 % | 56,4 % | 55,0 % |

Kein Einzelspike, sondern ein monotoner Übergang: unter 3 σ rund 50–52 %, ab 3 σ
durchgehend 53–56 %. Basiszelle (3,0 σ, ab 11:00, mehrfach): N=413, 55,7 %, +37.469 $,
+90,7 $/Trade, ~0,3 Trades pro Handelstag.

**Robustheit:**

| Test | N | WR | pro Trade |
|---|---|---|---|
| Basis | 413 | 55,7 % | +90,7 $ |
| Entry am Bandlevel statt Close (pessimistisch) | 627 | 53,3 % | +33,7 $ |
| max 1 Trade/Tag | 280 | 54,6 % | +44,8 $ |
| Kosten ×2 | 413 | 55,7 % | +75,7 $ |
| Kosten ×4 | 413 | 55,7 % | +45,7 $ |
| RTH-Anker statt Session-Anker | 302 | 51,3 % | –4,0 $ |

Kein Kostenartefakt. Der Session-Anker ist entscheidend, der RTH-Anker zerstört den Effekt.
Richtung: Long 58,8 % (N=243) vs Short 51,2 % (N=170) – ein Teil davon ist Aufwärtsdrift.

**Jahre:** 2021 42,4 % (N=33) · 2022 54,9 % · 2023 58,0 % · 2024 50,6 % · 2025 63,0 % · 2026 60,9 %.
Zwei schwache Jahre von sechs.

### 6b. Cross-Instrument – und damit erledigt
Dieselben Parameter (Session-VWAP, 3,0 σ, ab 11:00, Reclaim, mehrfach):

| Instrument | N | WR (Train/Test) | Netto |
|---|---|---|---|
| NQ | 413 | 55,7 % (53,4/62,5) | +37.469 $ |
| ES | 458 | 48,3 % (46,6/52,9) | –12.359 $ |
| YM | 273 | 50,9 % (49,5/55,1) | –10.129 $ |
| Gold | 288 | 46,5 % (46,7/46,2) | –10.548 $ |
| WTI | 278 | 48,9 % (47,1/54,3) | –5.391 $ |

ES, der mit NQ am stärksten korrelierte Index, liegt 7,4 pp darunter. Kein einziges
weiteres Instrument bestätigt. 55,7 % bei N=413 sind 2,3 σ über 50 %, ausgewählt aus
120 Varianten je Instrument – dafür wären ~3 σ nötig.

**Fazit:** Die Korrektur war berechtigt und der alte 27–45 %-Wert ist falsch gewesen.
Die richtig gerechnete Strategie liegt bei 48,5–49,6 % über fünf Instrumente. Das NQ-Plateau
bei 3 σ ist der sauberste Einzelfund der Untersuchung (kohärente Parameterregion,
kostenrobust, in beiden Perioden positiv), aber ohne Cross-Instrument-Bestätigung
und mit 0,3 Trades/Tag nicht als Prop-Firm-Strategie tragfähig.
