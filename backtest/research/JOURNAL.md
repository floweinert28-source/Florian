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
