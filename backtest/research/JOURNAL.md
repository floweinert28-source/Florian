# Forschungsjournal – Ziel: 80 % WR bei RR 1:1 (Prop-Firm-tauglich, 1–2 Payouts/Monat auf 50K)

## Gelernt bis Runde 2 (NQ/ES, 2021-09 … 2026-08)
- Nach einem Range-Linienbruch laeuft der Preis im Median 7,7 Range-Breiten weiter, bevor die Gegenseite kommt → jeder Fade mit Stop ≤ 1–2 Breiten stirbt an den Verlierern, nicht an der Trefferquote.
- Alle Uhrzeiten ~gleich (47–53 % bei 1:1). Keine Session ist "die Zone".
- Konfluenzen (Trend, Premium/Discount, Doppel-Sweep, Displacement, Timing) verschlechtern Sweep-Reclaim eher (Median t −0,5).
- Hohe WR entsteht nur ueber das RR (Mini-TP) – Fair Value.
- Reale Vorab-Filter: Kompression (Range/ATR < 0,2), Overnight/Range ≥ 3, Montag heben "beide Seiten"-Quote auf 75–85 %, aber nicht die Trade-WR bei 1:1.
- Look-Ahead-Fallen: TP im Entry-Bar, Limit-Fill im Bruch-Bar, "Touch im Fenster" statt echter Kreuzung, Sonntags-Flatbars.

## Runde 3 (neu): Volumen-Klimax, VWAP-Baender, Extension-Fades, Close-Sweeps – Ergebnisse folgen.

## Offene Ideen
- Volumen-Austrocknung vor Reversal; Delta-Proxy (Close-Lage im Bar) am Sweep
- Multi-Tages-Kontext: Inside-Days, NR7, Tag nach Trendtag
- EURUSD/Gold Asian-Range-Fade (Daten ausstehend)
- Zeit-Stop statt Preis-Stop (Trade nach N min schliessen) – veraendert WR-Definition, nur wenn TP 1:1 bleibt

## Runde 3 – Ergebnis (NQ+ES, RR 1:1)
- Volumen-Klimax am Sweep: KEIN Vorteil (NQ 08:12 mit Klimax 46,9 % / ohne 50,2 %; ES 53,5 % vs 50,2 % – Rauschen). Volumen erklaert das Reversal nicht.
- VWAP-Band-Rueckkehr (1,5–3 σ): 47–53 %, alle t < 0. TP am VWAP: 27–45 % (RR-Effekt).
- Extension-Fade (0,75–1,5 ATR vom Open): 44–51 %, negativ.
- Close-Sweeps 14:30–15:30: 47–52 %, negativ.
- Bestes: London-Sweep-Reclaim ohne Klimax 54,4 % (bekannt, t=2). Nichts naeher an 80 %.
Lehre: Auch Volumen/VWAP/Extension aendern nichts an der Kernstruktur "Intraday-Preis ist nahe Martingal bei symmetrischen Barrieren".

## Runde 4 – Ergebnis (NQ+ES, RR 1:1)
- SMT-Divergenz (NQ sweept, ES nicht, oder umgekehrt): 45–52 %, kein Vorteil gegenueber "beide brechen" (46–55 %). ICT-SMT bringt bei 1:1 nichts Messbares.
- News-Bars 08:30/10:00/14:00 (Range >= 3–5x): Continuation 37–49 % (negativ), Fade 41–47 %. Nach News ist der Preis KEIN gutes 1:1-Spiel – weder mit noch gegen.
- Multi-Tages-Kontext (Inside-Day, NR7, 3 Up/Down, Wide-Day) auf 08:12-Fade/-Break: 46–54 %, Train/Test widerspruechlich.
Lehre: Konditionierung auf Kontext (Cross-Asset, News, Vortagesstruktur) verschiebt die 50 % nicht. Naechste Runde: Drift-Quellen (Uhrzeit-Saisonalitaet, Overnight, Turn-of-Month, Post-Big-Day) statt Reversal-Entries.

## Runde 5 – Drift-Quellen (RR 1:1, TP/SL +/- k ATR)
- Drift-Karte pro 30-min-Fenster: Long-Bias 50–55 %, Short 45–50 % (Bullenmarkt 2021–26). Kein Fenster > 55 %.
- Overnight-Long (15:59 -> 09:30): NQ 52–54 %, ES 54–55 % (t 1–1.6). Bekannter Overnight-Drift, klein.
- Turn-of-Month Long: 54–55 % (t 1.4–1.6).
- Nach grossem Vortag (>= 1 ATR): CONTINUATION 55–57 %, Reversal 43–45 % → Momentum auf Tagesebene, nicht Mean-Reversion.
- Wochentag: Montag Long 58 % (N=232, t 1.2), Freitag Long 57 %, Donnerstag Short 52 %.
Lehre: Echte Drift-Effekte existieren, sind aber 3–8 pp gross und richtungsabhaengig (Regime). Weit weg von 80 %.

## Runde 6 – Drift-Faktoren gestapelt (Long ab 09:30, +/- k ATR)
- Score >= 3 (Mo/Fr/TOM/Vortag-Up/Overnight-Up): NQ 63,5 % (N=115, t 2,6) – aber pro Jahr 33/60/83/67/43/67 %, ES nur 56 %. Kleine Stichprobe, regimeabhaengig.
- Montag Long: NQ 58 % / ES 57 % (t ~1); Jahre 40–80 %.
- Alle Faktoren zusammen: Long-Bias +3–8 pp, kein stabiler Weg zu 80 %.
Lehre: Drift ist real, aber klein und schwankt mit dem Marktregime (2022/2024/2025 schwach). Naechster Schritt: Verlierer-Analyse der besten 1:1-Setups (Features am Entry) -> Filter Train->Test.

## Runde 7 – Verlierer-Analyse (Features am Entry, Quartile Train->Test)
- NQ London Sweep+Reclaim 1R (Basis 52 % Train / 58 % Test): Einzelfeatures mit Out-of-Sample-Bestand: Vortag stark gefallen (prev_trend < -0.5 ATR) 58 % -> 61 %; Reclaim-Kerze Body >= 0.75 57.5 % -> 60 %; Volumen-Ratio 1.3–1.6 57.5 % -> 65 %.
  KOMBI prev_trend<-0.5 & body>=0.75: Train 68.1 % (47) -> Test 69.0 % (29). Erster Kandidat, der bei 1:1 deutlich ueber 60 % liegt und im Test haelt – aber N klein (~15 Trades/Jahr).
- 08:12-Fade/-Reclaim: keine Feature-Kombi haelt im Test (Kombis fallen auf 36–46 %).
- ES London: andere Quartile, Kombi faellt im Test (60 % -> 45 %). Keine Cross-Instrument-Bestaetigung der NQ-Regel (Runde 8 prueft mit identischer Regel).
Lehre: Einzelne Features verschieben 3–8 pp; Kombinationen bringen 15 pp, aber die Stichprobe schrumpft auf ein Niveau, wo Zufall ~10 pp Streuung hat.

## Runde 8 – Stress-Test Kandidat "London-Sweep-Reclaim nach Down-Vortag mit starker Reclaim-Kerze" (RR 1:1)
- NQ: Nachbarschaft pt<-0.3..-0.7 x body>=0.7..0.8 durchweg 64–72 % WR, t 2.5–3.2, Train ~ Test, alle Jahre >= 57 % (2023 schwaechstes Jahr). Beste Balance: pt<-0.3 & body>=0.7 (N=119, 64.7 %, Train 65.9 / Test 62.2) bzw. body>=0.75 (N=90, 68.9 %, 67.8 / 71.0).
- Einzelfilter: nur Vortag-Down 58.7 % (N=286), nur Body>=0.75 58.3 % (N=312) – beide Test > Train.
- Gegenprobe Vortag-UP & Body: 55 % → die Richtung des Vortags ist relevant (Mean-Reversion nach Down-Tag im London-Sweep).
- ES: 47–52 % (keine Bestaetigung; nur pt<-0.7 56–62 % bei N<65). YM: Train 55–60 %, Test 33–50 % → faellt durch.
- Andere Zonen (PRE, 08:12, OPEN) mit gleicher Regel: NQ 41–58 %, ES 50–56 %, YM OPEN 61 % (N=80).
Einordnung: Erster 1:1-Kandidat mit >60 % out-of-sample, aber NQ-spezifisch, ~15–25 Trades/Jahr, Test-N nur 24–37 (SE ~8 pp). Multiple-Testing: aus ~150 Feature-Quartilen gewaehlt – die Konsistenz der Nachbarschaft und Jahre ist das Hauptargument, nicht ein einzelner t-Wert.

## Runde 9 – Ausfuehrung, Zeit-Karte, Verlierer des Kandidaten (NQ LDR)
- Puffer 0.1–0.2 W noetig (buf 0 → 50 %): der Stop muss hinter dem Sweep-Extrem Luft haben.
- Wartezeit 60–240 min egal; TP 0.75R 73 % / 1R 65 % / 1.5R 55 % / 2R 44 % → Erwartung ~+0.3R bei jedem RR (echter Drift nach dem Reclaim, kein RR-Artefakt).
- Zonen 01:30/02:30–05:00 gleich gut; 02:00–04:30 schwaecher → die volle London-Range zaehlt.
- Zeit-Karte (gleicher Filter auf 30-min-Zonen): ~50 % ueberall → Effekt ist London-Range-spezifisch, nicht "Kerzenkoerper allgemein".
- Innerhalb des Kandidaten: Body >= 0.83 → 75 % (60) vs 54 % (59); breite Range (W >= 97 Pkt) → 70 %; Long/Short gleich gut.
Fazit: Kandidat 1 = "London Down-Day Reclaim" (NQ). Als Strategie-Skript festgehalten: backtest/strategies_ldr.py.

## Runde 10 – Zweites Setup mit gleicher Methodik (NQ)
- Asia-Range (18:00–02:00) Sweep+Reclaim: Basis 49/46 %, beste Quartile fallen im Test (57→49, 56→39). Nichts.
- Pre-Market 05–08: Basis 47/45 %, alles negativ.
- Open-Range 09:30–10:00: 49/52 %, Kombis 54→42. Nichts.
- PDH/PDL-Sweep ab 09:30: prev_trend −0.5..0.07 58→56 % (N=143/64) einziges haltendes Feature; Kombi 68→44 faellt.
Fazit: Die Methode liefert kein zweites Setup. Der London-Effekt bleibt singulaer.

## YM komplett / Gold 75 % – Cross-Check
- YM: RR-1:1-Zonensuche max 52 %, Mini-TP-Fades Edge <= 0.9 pp, LDR 51.9 % (Test 40 %). YM komplett ohne Edge.
- Gold (75 % der Tage): LDR 51 % → Muster nicht uebertragbar. ES 48 %.
Fazit: LDR ist NQ-spezifisch. Naechste Runde: Frequenz-Varianten des LDR + "London retraced -> NY setzt fort".

## Runde 11 – LDR-Frequenzstufen und "London retraced -> NY setzt fort"
- Stufen (London-Reclaim, TP 1R): Body>=0.75 ohne Vortagsfilter 58.3 % (N=312, Test 60.6 %); Body>=0.75 & jeder Down-Tag 59.6 % (136); Body>=0.75 & Vortag<-0.3 68.9 % (90); Body>=0.83 & Vortag<-0.3 75.0 % (60, Test 84 %); Body>=0.85 & Vortag<-0.3 75.0 % (52, Test 82 %).
  → Trade-off Frequenz vs. Trefferquote: 60 Trades/Jahr bei ~59 % oder 11–18/Jahr bei 69–75 %.
- NY-Fortsetzung nach Down-Vortag + Premarket-Retrace: Train ~50 %, Test schwankend → nichts. Auch an LDR-Tagen keine Richtung fuer 09:30.
- Spiegel (Up-Vortag, Premarket-Retrace runter -> Long): 56–63 %, N klein, Test schwach.

## Gestufte Groesse (LDR strict/loose) – Prop-Sim
- Direct: strict 600 / loose 300: >=1 Payout 59 %, Ø 0.81 Payouts, ROI +366 %, Median 296 Tage. Groessere Stufen senken die Payout-Quote (Konsistenzregel).
- Flex: strict 1200 / loose 300: >=1 Payout 49 %, Ø 1.45 Payouts, ROI +1214 %, Median 175 Tage – beste Kombination fuer Flex.
- Frequenz-Ziel (1–2 Payouts/Monat) wird von keiner Variante erreicht: LDR liefert ~5 Trades/Monat (lockere Stufe) mit +0.16R bzw. ~1.5/Monat mit +0.4R.

## Runde 12 – Breite Parallel-Suche (Workflow wf_4c9f4368-5bb), Ziel >= 3 Trades/Woche & >= 60 % bei 1:1
Familien: Bar-Pattern-Mining, Level-Cluster-Sweeps, 15-min-Swing-Liquiditaet, Sequenz-Muster (Doppel-Sweep, Failed-Reclaim, 3-Push, Displacement-Retest),
Regime x Setup, 5-min-Signal-Timeframe, Feature-Modell (logistische Regression / Baum), ES/YM mit eigenen Features. Je Survivor ein Skeptiker-Agent. Ergebnisse folgen.

## Runde 12 – Zwischenstand (5/8 Familien fertig, 0 Survivor)

### Level-Cluster-Sweeps: Sweep (echte Kreuzung) eines Tages-Levels bzw. Level-Clusters (>=2 L | Varianten: 1250
- Kandidat: NQ Level-Cluster-Sweep Basis (1m) | NQ | N=15914 (61/Wo) | WR Train 49.1 / Test 49 | Netto -222582 / -180824 | surv=False
- Kandidat: ES Level-Cluster-Sweep Basis (1m) | ES | N=17239 (66/Wo) | WR Train 48.7 / Test 50.1 | Netto -302517 / -113336 | surv=False
- Kandidat: YM Level-Cluster-Sweep Basis (1m) | YM | N=15668 (60/Wo) | WR Train 50.3 / Test 49.2 | Netto -107504 / -103504 | surv=False
- Kandidat: NQ Level-Sweep Reclaim auf 15m-Kerze, Body >= 0.75 (beste HTF-Variante) | NQ | N=3593 (13.8/Wo) | WR Train 49.9 / Test 51.6 | Netto 43450 / 27872 | surv=False
- Fazit: Nichts gefunden. Die Familie 'Level-Cluster-Sweeps' liefert bei RR 1:1 in NQ, ES und YM ueberall 48-52 % - auf 1m-, 5m- und 15m-Reclaims, fuer alle 20 Level-Typen, fuer Cluster-Groessen 1 bis 6, mit und ohne Body-Filter (0.6/0.75/0.9), fuer alle Sweep-Tiefen, Reclaim-Dauern, SL-Distanzen, Uhrzeiten, Wochentage, Richtungen und Vortages-Kontexte. Die Kernhypothese 'Cluster > Einzel-Level' ist falsch: ncl>=2 bringt in NQ +1.3 pp, in ES +0.2 pp, in YM +2.8 pp gegenueber Einzel-Level, alles bei ~50 % Basis. Der einzige Effekt, der zunaechst konsistent ueber drei Instrumente aussah (Trade Richtung PDC/Vortages-VWAP: 51-53 % vs 46-47 %), war ein Selektionsbias (Referenzlevel nur an Tagen, an denen der PDC selbst gesweept wurde = Bedingung auf die Zukunft) und verschwindet bei korrekter Berechnung vollstaendig auf 49-50 %. Typ-Paar- und Stunden-'Gewinner' mit 53-57 % im Train fallen im Test auf 39-51 % - bei ~1.250 getesteten Slices (ca. 420 je Instrument, SD der WR bei N=750 ~1.8 pp, bei N=300 ~2.9 pp) sind solche Ausreisser Rauschen. Look-Ahead-Kontrolle: 4.000 zufaellige Trades unabhaengig nachsimuliert, 0 Abweichungen; 6.6 % der Events beruehren den TP im Entry-Bar und werden korrekt i

### Bar-Pattern-Mining: Diskretisierung jeder 1-/5-/15-min-Kerze (5 Alphabete: Richtung x Body | Varianten: 316486
- Kandidat: NQ Drei-grosse-Up-Bars RTH-Morgen Continuation (up3_bigrange K3 long) - KEIN Sur | NQ | N=565 (2.2/Wo) | WR Train 57 / Test 56.4 | Netto 17502 / 29670 | surv=False
- Fazit: Nichts gefunden. Bar-Pattern-Mining traegt fuer 1:1-Trades praktisch keine persistente Information: ueber 316.486 getestete Zellen (NQ/ES/YM 1-min, NQ 5-/15-min, sechs Alphabete, benannte Familien) liegt die Korrelation zwischen Train- und Test-WR bei 0.00-0.07, die Top-20-Train-Zellen erreichen im Test durchweg 48-51%, und die beobachteten Train-Maxima (60.4% bei N~440, 57% bei N>=800, 55.5% bei N>=1500, 54% bei N>=3000) sind praktisch identisch mit denen einer sauberen Null-Simulation ohne Muster-Information (59.4/56.8/55.6/53.5). Der einzige Lead (drei grosse Up-Bars nach 09:30, Long mit 3xATR, 57/56%, 2.2/Woche) verfehlt Frequenz- und Trefferziel, ist auf ES/YM nicht vorhanden und parameterinstabil. Ein Muster mit >=60% bei >=3 Trades/Woche existiert in dieser Familie nicht; 80% schon gar nicht. Alle Ergebnisse ohne Look-Ahead (Entry-Bar nur SL, Ergebnis-Arrays gegen unabhaengige Brute-Force-Simulation verifiziert: 0 Abweichungen bei 8.994 Stichproben); TEST wurde nur fuer die per Train gerankten Listen ausgewertet.

### 15-min-Swing-Liquiditaet (ICT Liquidity Pools): Fraktal-Hochs/Tiefs k=2/k=3 aus 15-min-Bar | Varianten: 4540
- Kandidat: NQ60 Pool-Sweep Reclaim depth>=0.06 dur>=5 | NQ | N=739 (2.8/Wo) | WR Train 55.9 / Test 56.7 | Netto 19596 / 19060 | surv=False
- Kandidat: NQ R1 05:00-09:30 Reclaim-Range>=0.04 ATR | NQ | N=684 (2.6/Wo) | WR Train 54.7 / Test 52.3 | Netto 10781 / 3977 | surv=False
- Kandidat: NQ M15 RTH dur>=15 long | NQ | N=613 (2.4/Wo) | WR Train 56.3 / Test 51.2 | Netto 48978 / 2565 | surv=False
- Kandidat: NQ MSS span<4 prom<0.05 long | NQ | N=546 (2.1/Wo) | WR Train 54.8 / Test 55.1 | Netto 14396 / 15107 | surv=False
- Fazit: Nichts gefunden. Sweeps von 15-min-Swing-Pools (ICT Liquidity Pools) mit 1-min-Reclaim liefern bei RR 1:1 in NQ, ES und YM durchgehend 48-50 % (45 Trades/Woche), unabhaengig von Entry-Modus (1-min-Reclaim, 15-min-Reclaim, MSS-Bestaetigung, Retest-Limit), Buffer und Zeitstopp; der Retest-Limit-Entry ist mit 46 % sogar schlechter. Keines der ICT-Qualitaetsmerkmale (Pool-Alter in Stunden/Tagen, Prominenz, External-Range-Span, k=3, Anzahl gesweepter Pools, Doppelseiten-Sweep, Displacement-Reclaim, Killzones) hebt die Trefferquote um mehr als 2-3 pp; nach ~4.500 Varianten liegen alle TRAIN-Maxima (55-57 % bei N~300-500) exakt im Rausch-Band und fallen im TEST auf 42-55 %. Einziger halbwegs konsistenter Kandidat: 60-min-Pools, Sweep-Tiefe >= 0.06 ATR, Reclaim >= 5 min nach Sweep (TR 55.9 / TE 56.7 %, 2.8/Woche, N=739) - verfehlt 60 % und 750 Trades und ist nach der Anzahl der Versuche nicht als echtes Signal belastbar. Die frueher gefundene Information in der Reclaim-Kerzenqualitaet (London-Range) reproduziert sich bei Swing-Pools nicht (body >= 0.75: 49.8 %). Fuer Florians Ziel (>= 3/Woche und >= 60 % bei 1:1) liefert diese Familie nichts.

### Sequenz-Muster auf Sweep/Reclaim-Ereignissen (Doppel-Sweep, Level-Historie, Drei-Push, Swe | Varianten: 858
- Kandidat: NQ Failed-Breakout Session-Level, genau 1 Close jenseits, Rueckkehr <= 3 Bars (b | NQ | N=4011 (15.4/Wo) | WR Train 51.1 / Test 52 | Netto -19774 / 2005 | surv=False
- Kandidat: NQ Sweep -> Displacement-Kerze -> Market-Bestaetigung (d-M), eine Position gleic | NQ | N=7116 (27.3/Wo) | WR Train 47.8 / Test 48.3 | Netto -163945 / -120298 | surv=False
- Kandidat: NQ Continuation nach Fehl-Reclaim (b-inv), eine Position gleichzeitig (KEIN Surv | NQ | N=5590 (21.5/Wo) | WR Train 42.7 / Test 43 | Netto -163891 / -7338 | surv=False
- Fazit: Nichts gefunden. Alle fuenf Sequenz-Familien (Doppel-Sweep, Level-Historie, Drei-Push, Sweep->Displacement->Retest, Failed-Breakout) liegen auf NQ, ES und YM bei RR 1:1 in TRAIN und TEST zwischen 43 und 53 %, mit Netto-Verlusten nach Kosten; kein einziges Slice mit N >= 300 erreicht 55 % in beiden Perioden. Insgesamt 858 Slice-Auswertungen (3 Instrumente x 3 Level-Sets x Pattern-Varianten plus 5-min- und Drei-Push-Varianten); bei dieser Anzahl sind die wenigen 55-57 %-Testwerte (alle < 500 Trades, train < 51 %) erwartbares Rauschen. Zwei Nebenbefunde: (1) Ein Level, dessen erster Reclaim-Trade verloren hat, ist danach in beide Richtungen wertlos (Fade 46-48 %, Continuation 43-45 %). (2) Die einzige Zahl > 60 % im gesamten Lauf (60-62 % train und test, alle Instrumente) entsteht ausschliesslich, wenn die Displacement-Kerze NACH dem Entry-Bar zur Auswahl benutzt wird - ein Look-Ahead, der bewusst als Diagnose markiert und verworfen wurde; sobald man die Kerze abwartet oder per Limit retestet, bleiben 46-49 %. Die Reclaim-Kerzen-Qualitaet (Body >= 0.75) hilft in der Breite nicht (49-50 %); der fruehere 69 %-Fund bleibt ein Spezialfall (Down-Vortag + London-Zone) ohne Skalierung auf Se

### Regime x Setup: Tages-/Intraday-Regime (5-Tage-Vola-Perzentil, Overnight-Range/ATR, 30-min | Varianten: 27000
- Kandidat: K1 NQ Momentum-Breakout im Trend-ueber-VWAP-Regime | NQ | N=654 (2.51/Wo) | WR Train 53.1 / Test 55.5 | Netto 8890 / 53320 | surv=False
- Kandidat: K2 ES Level-Sweep+Reclaim nach ausgereizter Tagesrange | ES | N=224 (0.86/Wo) | WR Train 59.3 / Test 53.5 | Netto 5875 / 597 | surv=False
- Fazit: Nichts gefunden. Ueber ~27.000 Regime-Zellen (13 Regime-Features einzeln und paarweise, 46 Setup-Varianten, 3 Instrumente, Train-Auswahl mit Test-Pruefung, plus Cross-Instrument-Replikation) erreicht kein Setup in irgendeinem vor dem Entry bekannten Regime dauerhaft >=58 % bei RR 1:1 mit >=3 Trades/Woche. Die vier Setup-Familien liegen ohne Regime bei 49-50 % (VWAP-Fade sogar 44-46 %); Regime-Filter (Vola-Perzentil, Overnight-/OR-Range, Gap, Vortags-Tagestyp, Trendstaerke, VWAP-Sigma, Tagesrange-bis-Entry, Uhrzeit) verschieben die Trefferquote in keinem Fall systematisch. Die intuitiven Hypothesen (Mean Reversion bei niedriger Vola/Range-Tag, Momentum bei hoher Vola/Trend) sind widerlegt (44-54 %). Alle Train-Spitzen von 58-64 % stammen aus Zellen mit N=300-400 (SD ~2.7 pp bei 4.300 Zellen) und fallen im Test auf 40-50 %; 0 von 1.026 Zellen replizieren ueber NQ/ES/YM. Ein anfaenglicher 82 %-Kandidat war ein Look-Ahead (Overnight-High vor 09:30 als Level) und wurde entfernt. Regime-Konditionierung einfacher Setups ist fuer Florians Ziel (>=3/Woche, >=60 % bei 1:1) keine tragfaehige Richtung.

## Gold komplett (1.566 Tage) – Suite
- LDR-Muster: 48.8 % (Test 43 %) → nicht uebertragbar. RR-1:1-Zonensuche: max 52.6 % (Rauschen). Mini-TP-Fades: Edge <= 2.3 pp, Jahre 1–4/6. Gold ohne Edge in dieser Setup-Familie.

## Runde 12 – Abschluss (8 Familien, ~370.000 Varianten, 0 Survivor). Vollbericht: backtest/REPORT_R4.md
- 5-/15-min-Signal-Timeframe: 48–51 % gepoolt; zerstoert sogar den LDR-Vorteil (5m 57 %, 15m 45 %).
- Feature-Modell (238k Events, 85 Features, LR/Baum/Boosting): Universum 49.7/49.8 %; kein Feature > 3.9 pp Dezil-Spread; Modell-Tails 57–76 % Train → 46–55 % Test.
- ES/YM eigene Features (10.470 Varianten): Basis 47–54 %; Paare 58–63 % Train → ~50 % Test. Einziger Rest: YM "tiefer Sweep + schwacher Reclaim-Koerper" 55/54.5 % (3.6/Wo) bzw. 59.7/60.6 % (1.4/Wo, N=372, 6/6 Jahre) – gegenlaeufig zum NQ-Befund, bei ES nicht vorhanden.
Fazit: Kein Setup mit >= 3 Trades/Woche und >= 60 % bei 1:1 auf NQ/ES/YM.

## WTI komplett (1.566 Tage) – Suite
- RR-1:1-Zonensuche max 52.3 %; Mini-TP-Fades Edge <= 1.2 pp (Jahre 1–5/6); LDR 50.9 % (Test 46 %). WTI ohne Edge in dieser Familie.
