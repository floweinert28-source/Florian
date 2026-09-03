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
