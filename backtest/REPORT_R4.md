# Runde 4 – Bericht fuer Florian

**Kurzfassung:** Nichts gefunden. 8 Familien, ~370.000 getestete Varianten/Zellen auf NQ/ES/YM, 0 Survivor. Kein Setup erreicht >= 60 % Trefferquote bei RR 1:1 mit >= 3 Trades/Woche – weder in Train noch in Test. Alles, was im Train nach Edge aussah, verhaelt sich exakt so, wie es reines Selektionsrauschen bei dieser Anzahl von Tests tun muss.

---

## 1. Ueberblick aller 8 Familien

| # | Familie | Instrumente | Varianten | Kurzergebnis |
|---|---|---|---|---|
| 1 | Bar-Pattern-Mining (3-/4-/5-Kerzen-Muster, 6 Alphabete, 1/5/15 min, Zeitfenster x SL-Def x Richtung) | NQ, ES, YM | 316.486 | Korrelation WR Train vs Test r = 0.00–0.07. Train-Maxima (60.4 % bei N~440, 57 % bei N>=800, 54 % bei N>=3000) sind identisch mit einer Null-Simulation ohne Musterinformation (59.4/56.8/53.5). Top-20-Train-Zellen im Test 48–51 %. Einziger Lead (3 grosse Up-Bars, RTH-Morgen, 3xATR-SL) 57/56 %, 2.2/Wo, nicht auf ES/YM, nicht parameterstabil. |
| 2 | Level-Cluster-Sweeps (20 Level-Typen, Cluster >= 2/3 Levels, Reclaim 1m/5m/15m) | NQ, ES, YM | 1.250 | 48–52 % ueberall, alle Level-Typen, Cluster-Groessen, Body-Filter, Sweep-Geometrien, Uhrzeiten. Kernthese "Cluster > Einzel-Level" ist falsch (+0.2 bis +2.8 pp bei 50 % Basis). Ein scheinbarer Magnet-Effekt (51–53 % vs 46–47 %) war Selektionsbias auf ein Zukunftsereignis und verschwand nach Korrektur. |
| 3 | 15-min-Swing-Liquiditaet (ICT Pools, k=2/3, 4 Entry-Modi, auch 5m/60m-Pools) | NQ, ES, YM | 4.540 | Basis 48–50 % (45 Trades/Wo), Retest-Limit sogar 46 %. Kein ICT-Qualitaetsmerkmal (Pool-Alter, Prominenz, External Range, Doppel-Pool, Displacement, Killzones) hebt WR um > 2–3 pp. Gitter-Maxima 55–57 % im Train fallen im Test auf 42–55 %. Bester Rest: 60m-Pools 55.9/56.7 %, 2.8/Wo. |
| 4 | Sequenz-Muster (Doppel-Sweep, Level-Historie, Drei-Push, Sweep→Displacement→Retest, Failed-Breakout) | NQ, ES, YM | 858 | 43–53 % in Train und Test, netto negativ. Nach Fehl-Reclaim ist ein Level in beide Richtungen wertlos (Fade 46–48 %, Continuation 43–45 %). Einzige Zahl > 60 % entstand durch Look-Ahead (Displacement-Kerze nach Entry) und wurde verworfen. |
| 5 | Regime x Setup (13 Regime-Features x 4 Setups x 46 Sub-Varianten) | NQ, ES, YM | ~27.000 | Setups ohne Regime 49–50 % (VWAP-Fade 44–46 %). Kein Regime-Filter verschiebt die WR systematisch; 2D-Zellen mit 58–64 % Train fallen im Test auf 36–50 %. 0 von 1.026 Zellen replizieren in allen drei Instrumenten. Anfaenglicher 82 %-Kandidat war Look-Ahead (ONH/ONL vor 09:30). |
| 6 | 5-min-/15-min-Ausfuehrung (Signal-Timeframe fuer Sweep+Reclaim, Level-Sweeps, VWAP) | NQ, ES, YM | 9.113 | 1-, 5- und 15-min-Signal gepoolt alle 48–51 %. Signal-Timeframe traegt keine Information. Der bekannte LDR-Vorteil (NQ London) wird durch 5m/15m-Reclaim zerstoert (57 % bzw. 45 %). Bester haeufiger Kandidat NQ London 5m + Bestaetigung 55.2/52.9 %, 3.5/Wo. |
| 7 | Feature-Modell auf allen NQ Sweep+Reclaim-Events (238k Events, 85 Features; LR, Baum, Boosting) | NQ | 97 Modelle (+700 Dezil-Zellen) | Universum 49.7/49.8 % = Muenzwurf. Kein Feature mit > 3.9 pp Dezil-Spread, nichts reproduziert im Test. LR senkt Logloss um 0.2 %, Boosting auf Holdout um 0.02 %. Alle Modell-Tails 57–76 % Train → 46–55 % Test. reclaim_body traegt im Gesamtuniversum 0.8 pp; LDR-Analogon 55.6 → 50.8 → 51.1 %. |
| 8 | ES/YM Session-/PDH-PDL-Sweeps mit 27 Features (Gap, Overnight, Rundlevel, Cross-Asset NQ/ES/YM) | ES, YM | 10.470 | 16 Basis-Setups 47–54 %. Paare mit 58–63 % Train fallen im Test auf ~50 %. Rundlevel, Gap-Fade/Go, Cross-Asset-Status: keine Information. Einziger Rest: schwaches YM-Plateau "tiefer Sweep + schwacher Reclaim-Koerper" 55.0/54.5 % (3.6/Wo) bzw. 59.7/60.6 % (1.4/Wo) – bei ES nicht vorhanden, Richtung gegen NQ-Befund. |

**Summe: ~369.800 Varianten. Survivor: 0.**

---

## 2. Verifizierte Survivor

**Keine.** Kein Kandidat erfuellt die Schwelle (N >= 750 & WR_train >= 60 & WR_test >= 58, oder N >= 300 & 65/63) bei >= 3 Trades/Woche. Die Survivor-Tabelle ist leer.

Zur Dokumentation die besten Nicht-Survivor (alle post-hoc aus Tausenden Varianten, keiner handelbar im Sinne des Auftrags):

| Familie | Kandidat | Instr. | Regeln (Kurz) | N | Tr/Wo | WR Train/Test | Netto Train/Test (USD) | Jahre positiv | Skript / CSV |
|---|---|---|---|---|---|---|---|---|---|
| 1 | up3_bigrange K3 long | NQ | 3 Up-Bars mit Range >= 1.4x ATR20, Entry 09:30–12:00, SL/TP 3x ATR20 | 565 | 2.2 | 57.0 / 56.4 | +17.5k / +29.7k | 5/6 | `research/r4/barpattern/bt_pattern.py` / `cand_nq_up3bigrange_K3_long.csv` |
| 3 | NQ60 Pool-Sweep depth>=0.06 dur>=5 | NQ | 60m-Fraktal-Pool, 1m-Sweep, Reclaim >= 5 min spaeter, Tiefe >= 0.06 ATR10, SL Extrem + 0.02 ATR, 1R | 739 | 2.8 | 55.9 / 56.7 | +19.6k / +19.1k | 5/6 | `research/r4/swing_pools/final.py` / `trades_NQ60_R1_depth06_dur5.csv` |
| 6 | C1 NQ London 5m Reclaim + Bestaetigung | NQ | London-Range 02–05, Sweep ab 05:00, 5m-Reclaim Body >= 0.6, naechste 5m-Kerze bestaetigt, SL Extrem + 0.1W, 1R | 900 | 3.5 | 55.2 / 52.9 | +46.6k / +12.9k | 5/6 | `research/r4/tf5_exec/candidates.py` / `C1_NQ_London_tf5_b0.6_confirm.csv` |
| 8 | YM Deep-Sweep + Weak-Reclaim eng | YM | 8 Zonen gepoolt, Sweep-Tiefe >= 0.05 ATR10, Entry-Bar-Koerper < 0.35, SL Extrem + 0.1W, 1R | 372 | 1.4 | 59.7 / 60.6 | +12.8k / +16.6k | 6/6 | `research/r4/es_ym_features/step5_cands.py` / `cand_YM_pooled_deepsweep_weakbody.csv` |
| 8 | YM Deep-Sweep + Weak-Reclaim breit | YM | wie oben, Tiefe >= 0.03, Koerper < 0.45 | 927 | 3.6 | 55.0 / 54.5 | +10.7k / +18.2k | 6/6 | `research/r4/es_ym_features/step6_plateau.py` / `cand_YM_pooled_sweep03_body045.csv` |
| 7 | LR-Score-Tail SL >= 0.1 ATR | NQ | 85-Feature-LR, logit >= 0.2897, ein offener Trade | 576 | 2.2 | 58.4 / 53.4 | +40.2k / +23.5k | 6/6 | `research/r4/feature_model/model_lr.py` / `trades_lr_NQ_big_3wk.csv` |

Alle Pfade unter `/tmp/claude-0/-home-user-Florian/154c19e6-740a-5434-82b2-7192601fe205/scratchpad/`. Alle Kandidaten-CSVs wurden per unabhaengiger Re-Simulation aus den 1-min-Rohdaten geprueft (Entry-Bar nur SL, SL vor TP): 0 Abweichungen.

---

## 3. Widerlegte Kandidaten und Grund

| Kandidat | Zahlen | Warum widerlegt |
|---|---|---|
| NQ up3_bigrange K3 long (Fam. 1) | 57.0/56.4 %, 2.2/Wo | Maximum aus 104.138 Zellen; Null-Benchmark liefert bei gleichem N Train-Maxima von 59–60 %. ES 49.8/52.8, YM 44.9/47.4. Nachbarparameter (K2/K4, 5-min, Nachbar-Codes) 51–56 %. SL 3x ATR20 (600–1.600 USD/Kontrakt) fuer 50K-Prop unpraktisch. t = 1.42. |
| NQ/ES/YM Level-Cluster-Basis (Fam. 2) | 48.7–50.3 %, 60–66/Wo | Muenzwurf, Kosten fressen alles: Netto -100k bis -300k je Instrument, 0/6 Jahre positiv. |
| NQ 15m-Reclaim Body >= 0.75 (Fam. 2) | 49.9/51.6 %, netto +43k/+28k | WR ~50 %; Gewinn stammt ausschliesslich aus asymmetrischen 16:00-Exits, nicht aus 1:1-Trefferquote. Beste von ~30 15m-Varianten. |
| Trade Richtung PDC/VWAP/Midnight (Fam. 2) | erst 51–53 vs 46–47 %, dann 49–50 % | Selektionsbias: Referenzlevel nur an Tagen, an denen PDC selbst gesweept wurde (Bedingung auf Zukunft). Nach Korrektur weg. |
| NQ60 Pool-Sweep depth/dur (Fam. 3) | 55.9/56.7 %, 2.8/Wo | Aus 872 Varianten ausgewaehlt; 56 % liegt im Rauschband (SD ~2.2 pp bei N=506). Verfehlt 60 %, 750 Trades und 3/Wo. Netto nur +30 USD/Trade. |
| NQ M15 RTH dur>=15 long (Fam. 3) | 56.3/51.2 % | Klassischer Overfit: Train-Bestwert kollabiert im Test, Test-Netto +2.5k. |
| NQ MSS span<4 prom<0.05 long (Fam. 3) | 54.8/55.1 %, 2.1/Wo | Logisch gegen die ICT-These (unbedeutendste Pools laufen am besten) → Rauschverdacht; < 3/Wo, < 60 %. |
| Sweep→Displacement 60–62 % (Fam. 4) | 60–62 % Train und Test | Look-Ahead: Displacement-Kerze liegt NACH dem Entry-Bar. Sobald abgewartet: 47.8/48.3 % (N=7.116), netto -164k/-120k. |
| NQ Failed-Breakout fb3 nb1 (Fam. 4) | 51.1/52.0 %, 15.4/Wo | Bestes von 837 Slices bei SD ~1.4 pp = Selektion; netto ueber 5 Jahre -18k. |
| Continuation nach Fehl-Reclaim (Fam. 4) | 42.7/43.0 % | Klar negativ in beide Richtungen; Level nach Fehl-Reclaim ist informationslos. |
| ONH/ONL-Sweep 82/78 % (Fam. 5) | 82/78 % → 49 % | Look-Ahead: Overnight-Range bis 09:29 als Level ab 08:00 benutzt. Nach Korrektur 49 %. |
| K1 NQ Momentum im Trend-ueber-VWAP-Regime (Fam. 5) | 53.1/55.5 %, 2.5/Wo | Aus ~27.000 Zellen; 2023/2024 negativ; Test-Netto von wenigen grossen EOD-Gewinnern 2025 getragen. |
| K2 ES Level-Sweep nach ausgereizter Tagesrange (Fam. 5) | 59.3/53.5 %, 0.9/Wo | N=123 im Train, < 1/Wo, NQ-Pendant 57.6 → 51.6 %. |
| MR bei niedriger Vola / Momentum bei hoher Vola (Fam. 5) | 44–54 % | Themen-Hypothese direkt widerlegt, in allen Instrumenten. |
| C1 NQ London 5m + Bestaetigung (Fam. 6) | 55.2/52.9 %, 3.5/Wo | Maximum aus ~780 Ausfuehrungsvarianten (Bias ~+3 pp); erwartetes Rausch-Maximum bei 9.000 Varianten und N~900 ist 56–57 %. |
| C2/C3/C4 YM Asia 5m/1m, NQ London 15m (Fam. 6) | 51.6–55.1 % Train, 48–52 % Test | Signal-Timeframe traegt keine Information; Test-Netto teils negativ. |
| LDR auf 5m/15m (Fam. 6) | tf1 67/78 %, tf5 57/57 %, tf15 45/31 % (N=79/49) | Hoeherer Timeframe zerstoert den Vorteil; ohnehin < 1.3/Wo. |
| LR-Tail SL >= 0.1 ATR (Fam. 7) | 58.4/53.4 % | Innere Validierung (Fit < 2024, Val 2024) hat es angekuendigt: 60.8 → 51.1 %. ~45 Tail-Varianten, SD ~2.6 pp. < 3/Wo nach De-Overlap. |
| Baum d3/d4, Boosting d2 (Fam. 7) | 54–59 % → 49.7–55.9 % | Alle Events auf Test 49.7–51.6 %; Boosting innere Validierung 70.4 → 51.0 %, alle Events 65.6 → 48.5 %. |
| LDR-Analogon im breiten Universum (Fam. 7) | 55.6 → 50.8 → 51.1 % | Die frueheren 69 % (18 Trades/Jahr) reproduzieren sich nicht; reclaim_body >= 0.75 allein 49–50 %. |
| YM Deep-Sweep + Weak-Reclaim eng/breit (Fam. 8) | 59.7/60.6 % (1.4/Wo) bzw. 55.0/54.5 % (3.6/Wo) | Beste Zelle aus ~9.900 Paaren; entweder Frequenz oder WR verfehlt. ES in derselben Region 48–52 / 35–50 %. Filterrichtung (schwacher Koerper) ist das Gegenteil des NQ-Befunds. t = 1.1. |
| YM Asia 03:01–03:38, ES Premarket on_pos/day_pos, ES PDH/PDL sweep&W_atr (Fam. 8) | 57–62 % Train, 58–60 % Test, N=219–252 | Reine Quartil-Kombinationen, < 1/Wo, Test-N 61–70, je zwei Verlustjahre. |
| Gap-Fade/Gap-and-Go, Rundlevel, Cross-Asset (Fam. 8) | 31–57 % / 25–62 % | Train/Test widerspruechlich oder durchweg ~50 %; keine Information. |

---

## 4. Fazit

**Das Ergebnis ist eindeutig und robust: In Sweep/Reclaim-, Kerzenmuster-, Level-, Regime- und Sequenz-Familien existiert auf 1-min-Daten von NQ/ES/YM kein 1:1-Setup mit >= 60 % und >= 3 Trades/Woche. 80 % schon gar nicht.**

Warum das nicht "noch nicht gefunden", sondern "nicht vorhanden" heisst:

1. **Die Basisrate ist ueberall 49–50 %.** 238k Sweep+Reclaim-Events auf NQ: 49.7/49.8 %. Level-Cluster 15–17k Trades je Instrument: 48.7–50.3 %. Swing-Pools: 48–50 %. Das ist kein leicht verschobener Muenzwurf, das ist ein Muenzwurf.

2. **Multiple Testing erklaert jeden "Fund" vollstaendig.** Bei ~370.000 Varianten und Zellgroessen N = 300–900 liegt die Standardabweichung der WR bei 1.7–2.9 pp. Das erwartete Maximum unter der Nullhypothese bei 100.000 Zellen und N~440 liegt bei ~4 SD ueber 50 % = 59–60 % – exakt was gemessen wurde (60.4 %). Der Null-Benchmark (Familie 1, Muster von zufaellig gepaartem Tag) liefert dieselben Maxima: 59.4/56.8/55.6/53.5 vs real 60.4/57.1/55.5/54.0. Die Korrelation Train/Test ueber alle Zellen ist 0.00–0.07. Ein echter Effekt wuerde sich als Korrelation zeigen; Rauschen zeigt sich als Regression zum Mittel – und genau das passiert bei jeder Top-Liste (Top-20 Train → 48–51 % Test).

3. **Innere Validierung schlaegt immer an, bevor Test es tut.** Jedes Modell aus Familie 7, das im Train 57–76 % zeigte, fiel schon auf dem 2024-Holdout auf 46–56 %. Das Muster "Fit → Val → Test = 65.7 → 56.5 → 49.2 %" ist die Signatur von Overfitting, nicht von Edge.

4. **Nichts repliziert ueber Instrumente.** 0 von 1.026 Regime-Zellen in NQ, ES und YM gleichzeitig; der beste NQ-Bar-Pattern-Lead ist auf YM sogar short-lastig; das YM-Plateau existiert bei ES nicht und widerspricht in der Richtung dem NQ-Befund. Echte Marktstruktur waere instrumentuebergreifend sichtbar.

5. **Die einzigen Zahlen > 60 % waren Look-Ahead.** Drei Faelle gefunden und entfernt: ONH/ONL vor 09:30 (82 %), Displacement-Kerze nach Entry (60–62 %), Magnet-Bedingung auf gesweeptem PDC (53 %). Das erklaert auch, wie fruehere 80 %+-Artefakte entstehen: Sobald irgendeine Information von nach dem Entry in die Auswahl leakt, springt die WR auf 60–80 %.

6. **Der fruehere 69 %-LDR-Fund (London Down-Day Reclaim, 18 Trades/Jahr) ist nach dieser Runde als Rauschen einzustufen.** Er reproduziert sich weder im breiten Universum (51 %), noch auf ES/YM, noch auf 5m/15m, und reclaim_body >= 0.75 allein hat 0.8 pp Spread. Bei N=89 ist 69 % nichts.

7. **Kosten machen selbst kleine echte Effekte unhandelbar.** Median-SL bei Sweep+Reclaim ist 13 NQ-Punkte; 0.75 Pkt Roundtrip sind ~6 % von R, Break-even ~53 %. Ein hypothetischer 52–54 %-Effekt waere netto null.

Direkt gesagt: Das Ziel "60 % bei 1:1 und 3+ Trades/Woche" ist mit Price-Action-Entry-Regeln auf 1-min-Bars in diesen Indizes nicht erreichbar. Weitere Runden in diesen Familien wuerden weitere 55–57 %-Zufallsmaxima produzieren und nichts anderes.

---

## 5. Naechste Schritte

1. **Suche in diesen Familien abschliessen.** Bar-Pattern, Level-Sweeps, ICT-Pools, Sequenzen, Regime-Filter, Signal-Timeframe, Entry-Feature-Modelle – alle erschoepfend getestet. Nicht wieder anfassen, keine "nur noch diese eine Variante".

2. **Ziel-Definition aendern oder Projekt beenden.** 60 % bei 1:1 ist ein Erwartungswert von +0.2 R/Trade vor Kosten – das ist fuer liquide Indizes-Futures auf 1-min unrealistisch hoch. Realistische Alternativen: (a) Ziel als Erwartungswert formulieren (z. B. >= +0.08 R/Trade netto, Sharpe > 1 auf Tagesbasis), nicht als Trefferquote; (b) RR >= 2:1 mit 40–45 % WR zulassen. Wenn 60 %/1:1 bleibt, ist "kein Setup" das Endergebnis.

3. **Falls weitergesucht wird: Exit-Struktur statt Entry-Features.** Mehrfach tauchte auf, dass Netto bei ~50 % WR positiv war (NQ 15m Body>=0.75: +43k/+28k; C4; K1; YM-Plateau 6/6 Jahre) – der Gewinn kam aus asymmetrischen 16:00-Exits. Das ist ebenfalls post-hoc, aber eine andere Dimension, die noch nicht systematisch getestet ist: Zeitstopps, Trailing, Teil-TP, Runner bis EOD, RR 1.5–3. Vorab **maximal 3 Hypothesen** festlegen und schriftlich fixieren, bevor Code laeuft.

4. **Ein einziger Out-of-Sample-Test fuer das YM-Plateau, dann Schluss.** Fixe Parameter (Tiefe >= 0.03 ATR10, Koerper < 0.45, alle 8 Zonen), Erwartung 54–55 %, Ergebnis nur auf Daten ab dem Ende der jetzigen Test-Periode (Walk-Forward). Bestaetigung waere >= 54 % bei N >= 150; alles darunter beendet den Kandidaten. Keine Parameteraenderung erlaubt.

5. **Look-Ahead-Checkliste als Pflichtschritt vor jeder Auswertung:** (a) Jedes Level/Feature hat einen Zeitstempel "ab wann bekannt"; (b) Entry-Bar nur SL; (c) Bedingungen nie auf Ereignisse nach dem Entry (auch nicht indirekt ueber "Tag, an dem X passiert ist"); (d) Null-Benchmark mit entkoppelten Ergebnissen fuer jede neue Familie mitlaufen lassen; (e) Innere Validierung (Fit < 2024, Val 2024) vor jedem Test-Blick.

6. **Andere Datendimensionen, falls es weitergeht:** Alles bisher ist reine OHLC-Preisstruktur. Was nicht getestet wurde: Orderflow/Delta/Footprint, Volumenprofil-Level (POC/VAH/VAL), Termin-Kalender (FOMC/CPI/NFP als Regime), Tick-Level-Cross-Asset (Lead-Lag < 1 min), Mehrtages-Haltedauer. Ob dafuer Daten vorliegen, ist die erste Frage – ohne neue Information gibt es keinen Grund, ein anderes Ergebnis zu erwarten.

7. **Den 69 %-LDR-Fund aus dem Setup-Inventar streichen.** 18 Trades/Jahr, nicht reproduzierbar, Kerzenqualitaet ohne Information im breiten Universum. Nicht handeln.