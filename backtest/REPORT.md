# Range-Reversal-Forschung – Abschlussbericht (Stand 02.09.2026)

**Daten:** Dukascopy 1-min BID (Cash-Index-CFDs), Sep 2021 – Aug 2026. NQ + ES komplett (je 1.566 Tage), YM 87 %, Gold 42 %, WTI/EURUSD ausstehend.
**Methodik (nach dem Look-Ahead-Bug vom 28.08.):** Entscheidungen nur aus abgeschlossenen Bars; im Entry-Bar wird nie ein TP gewertet; Limit-Fills nur durch spätere Bars; SL vor TP im selben Bar; Kosten NQ 0,75 Pkt / ES 0,4 Pkt / YM 2,5 Pkt; Train 2021-09 … 2024-12, Test 2025-01 … 2026-08; Jahresstabilität; Cross-Instrument-Check.

## 1. Ursprungsfrage
| Frage | Ergebnis |
|---|---|
| Range 08:12–09:12 NY: wie oft werden beide Seiten bis Tagesende gebrochen? | **64,4 %** (1.565 Tage), jedes Jahr 62–70 % – reines Muster, kein Trade-Setup |

## 2. Getestete Strategie-Familien (alle ❌)
| # | Familie | Varianten | Bestes ehrliches Ergebnis | Warum ❌ |
|---|---|---|---|---|
| 1 | Fade an der Linie, TP Gegenseite (RR 0,95 / 1:1 / 2×TP+BE) | 2.500+ Zonen | max. 53 % WR ≈ Rauschen | Münzwurf, nach Kosten negativ |
| 2 | Mini-TP / weiter SL („Midday-Fade") | 400 Kombis | 81,6 % bei 80 % Breakeven | vor Bug-Fix „87 %" – Artefakt; nach Kosten tot |
| 3 | Sweep + Confirmation (MSS, iFVG, OTE, Reclaim) | 96 Kombis | +108R brutto | Train-Periode nach Kosten negativ |
| 4 | HTF-FVG (15m/1h/2h/4h) | ~1.000 | ES 4h-FVG +100 $/Trade, t 1–2 | 2–4 pp über BE, DD 17–35k, Rauschbereich |
| 5 | Session-Interaktionen | 2.360 | 96 formale Survivor | mittlere Erwartung negativ; Spiegelrichtung/ES bestätigen nicht; Top-10-Gewinner = 77–133 % des Gewinns |
| 6 | Opening Range (ORB, Judas, Gap, ON-Sweep) | ~2.400 | Gap-Fade +58k, London-Reclaim +42k | unabhängig nachgebaut: Gewinn = Top-10-Trades bzw. 2025-Regime, Train ≈ 0 |
| 7 | Tagestyp-Filter → Fade an Kompressionstagen (ON/W ≥ 3) | 56 | NQ +44,7k, t 2,2, Train+Test>0 | bricht bei anderer Overnight-Definition zusammen; ES t 0,7; **YM negativ** |
| 8 | „80–90 % nach flachem Sweep" | – | Train 80 % / Test 82–90 % | Tautologie: Gegenseite ist meist schon im 30-min-Fenster geholt – kein Trade übrig |
| 9 | Impulskerzen-Continuation | 24 | alle negativ | tot |
| 10 | PDH/PDL/PDC/Midnight-Open Turtle-Soup | 78 | max t 1,8 | nichts |
| 11 | Mehrfach-Konfluenzen (6 Bausteine, 504 Kombis × NQ/ES) | 1.008 | Median t ≈ –0,5 | Konfluenzen verschlechtern Sweep-Reclaim |
| 12 | Mikrostruktur nach Uhrzeit | 192 | 5-min-Fortsetzung 47–52 % | keine Momentum-/Reversal-Fenster |
| 13 | Limit-Entry in definierter Sweep-Tiefe (0,25/0,5/1 W hinter der Linie) | 216 × NQ/ES | max t 1,5; Median t –0,9 | Familie klar negativ |

## 3. Was real ist (Statistik, kein Trade)
- Beide Range-Seiten werden in ~2/3 der Tage geholt; an Kompressionstagen (Range/ATR < 0,2, Overnight/Range ≥ 3) und montags 75–85 %.
- Sweeps von Session-Levels setzen sich eher fort als umzukehren.
- Nach einem Linienbruch läuft der Preis im Median 7,7 Range-Breiten gegen die Position, bevor die Gegenseite kommt – deshalb stirbt jeder Fade mit engem Stop.

## 4. Fazit
Nach ~12.000 Regelvarianten auf NQ/ES: **kein Setup mit validierbarem Edge**. Hohe Win-Raten sind immer über das RR erkauft (Fair Value), positive 5-Jahres-Summen stammen aus dem 2025-Regime oder wenigen Ausreißer-Tagen.

Skripte: `backtest/` (Kern) und `backtest/research/` (alle Familien). Daten: `backtest/data/`.

## 5. Prop-Firm-ROI (Lucid 50K) – Monte-Carlo nach exakten Regeln
Simulator: `backtest/propfirm/` (Regeln: Eval +3.000 $, MLL 2.000 $ EOD-trailing, Eval-Konsistenz 50 %, Funded ohne Konsistenz, Payout 50 % des Gewinns max 2.000 $, Split 90/10, 5 Payouts; Daily-Variante: Payout jederzeit über 52.100 $, MLL intraday).

| Konfiguration (1 Trade/Tag, Risiko 1.850 $, Fair Value) | Pass-Quote | ≥1 Payout | E[Auszahlung] | ROI (Gebühr 136 $) | ROI (81,60 $) |
|---|---|---|---|---|---|
| Flex, RR 1:1, p=50 % | 38 % | 10 % | 405 $ | +198 % | +405 % |
| Flex, RR 1:0,75, p=57 % | 37 % | 11 % | 413 $ | +204 % | +410 % |
| Flex, RR 1:1,5, p=40 % | 29 % | 6 % | 263 $ | +93 % | +230 % |
| Daily, RR 1:1, p=50 % | 38 % | 17 % | 675 $ | +322 % (~160 $) | – |
| Flex, RR 1:1, p=47 % (Slippage) | 33 % | 7 % | 239 $ | +76 % | +202 % |
| Flex, 2 Trades/Tag à 925 $, p=50 % | 26 % | 5 % | 200 $ | +47 % | – |

Kernaussagen: (1) Ohne jeden Edge ist die Eval eine positiv bewertete Option, weil der Verlust bei der Gebühr gedeckelt ist. (2) Entscheidend ist die Positionsgröße: ein Verlust knapp unter dem MLL (1.850–1.900 $) hebt die Pass-Quote von 22 % (kleine Trades) auf 37 %. (3) Ein Trade pro Tag; jeder zusätzliche Trade kostet Erwartungswert (Kosten + Trailing-Ratsche). (4) 90 % der Evals enden bei 0 – der ROI entsteht über viele Evals. (5) –3 pp Trefferquote (Slippage) halbiert den ROI; ein echter Edge multipliziert ihn.

### 5b. Alle bisherigen Strategien durch die Prop-Linse (Bootstrap echter NQ-Trades, Risiko ~1.850 $, 1 Trade/Tag, Gebühr 136 $)
| Strategie | Flex ROI gesamt / nur Train / nur Test / Fair Value | Daily ROI gesamt / Train / Test / Fair Value |
|---|---|---|
| Zone 08:12–09:12 Fade, TP Gegenseite, SL 1 W | +131 / +62 / +346 / +193 | **+234 / +130 / +455 / +268** |
| Zone 08:12–09:12 Fade, TP Gegenseite, SL 1,5 W | +155 / +99 / +334 / **+211** | +172 / +127 / +307 / +241 |
| London 02–05 Sweep+Reclaim TP 1R | +199 / +110 / +388 / +160 | +210 / +123 / +410 / +168 |
| Zone 05:24–05:39 Fade RR 1:1 | +171 / +90 / +312 / +167 | +175 / +131 / +357 / +185 |
| Midday 11:12 Fade TP 0,25 W / SL 1 W | +167 / +69 / +473 / +216 | +105 / +33 / +341 / +157 |
| Gap ≥0,3 ATR + OR15 Fade → PDC | +167 / +123 / +325 / +95 | +207 / +172 / +341 / +148 |
| OTE 08:12 TP Mitte | +180 / +24 / +785 / +60 | +295 / +108 / +862 / +139 |
| Kompressions-Fade (ON/W ≥ 3) | +481 / +184 / +1153 / +79 | +569 / +280 / +1090 / +117 |
| 06:20 Fade RR 1:0,95 | +31 | +70 |
| OTE 05:24 (SL zu klein, Ø-Risiko 564 $) | +14 | +7 |

„Fair Value" = Tages-P&L um den Mittelwert bereinigt: zeigt den ROI, der allein aus der Trade-Struktur (RR, 1 Trade/Tag, volle Größe) kommt. Die Rangfolge nach Fair Value ist die belastbare: einfache Zonen-Fades mit RR 1:1 bis 1:0,67 bei voller Größe. Der Kompressions-Fade-Spitzenwert ist Sample-Glück (Test 2025/26).
