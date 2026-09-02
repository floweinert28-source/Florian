export const meta = {
  name: 'high-frequency-edge-search',
  description: 'Parallel search for high-frequency (>=3 trades/week) high-winrate (>=60% at RR 1:1) intraday setups on NQ/ES/YM, adversarial verification, synthesis',
  phases: [
    { title: 'Research', detail: '8 hypothesis families, strict holdout' },
    { title: 'Verify', detail: 'one skeptic per surviving candidate' },
    { title: 'Synthesize', detail: 'final ranked table' },
  ],
}

const BASE = (args && args.base) ? args.base : '/Users/flo/Desktop/Florian'
const SP = BASE + '/backtest/research/mac'   // Arbeitsverzeichnis fuer Agenten-Skripte
const D = BASE + '/backtest/data'

const COMMON = `
## Auftrag
Florian (Prop-Firm-Trader, Lucid 50K) will ein Intraday-Setup mit HOHER FREQUENZ und HOHER TREFFERQUOTE bei RR 1:1:
ZIEL: >= 3 Trades/Woche (>= ~750 Trades in 5 Jahren) UND Win-Rate >= 60 % bei TP = SL-Distanz, in TRAIN und TEST. 80 % wenn es existiert.
Ein seltenes Setup (< 3/Woche) ist fuer ihn wertlos, egal wie gut. Wenn deine Familie nichts liefert, ist "nichts gefunden" das korrekte Ergebnis.

## Bisheriger Stand (alles korrekt validiert; NICHT wiederholen)
Sweep/Fade/Reclaim von Session-Ranges zu jeder Uhrzeit: ~50 % bei 1:1. Volumen-Klimax, VWAP-Baender, Extension-Fades, Close-Sweeps,
SMT NQ/ES, News-Bars, Inside-Day/NR7, HTF-FVG (15m-4h), Opening-Range-Varianten, Session-Interaktionen, PDH/PDL-Turtle-Soup,
Konfluenz-Kombis, Impulskerzen-Continuation, Drift-Karte (Uhrzeit/Overnight/Turn-of-Month/Wochentag): alles 45–56 %.
Einziger Fund: NQ "London Down-Day Reclaim" (London-Range 02:00-05:00 Sweep + Reclaim-Close mit Kerzenkoerper >= 75 % nach
Down-Vortag) 69 % bei 1:1, aber nur ~18 Trades/Jahr. Kerzenkoerper >= 0.75 allein: 58 % (312 Trades). Zeigt: Reclaim-Kerzen-Qualitaet traegt Information.
Ein "87 %"-Kandidat war ein Look-Ahead-Bug (TP im Entry-Bar) – so etwas darf nie wieder passieren.

## Daten (lokal, KEIN Download)
- NQ ${D}/nq | ES ${D}/es | YM ${D}/ym (je 1.566 Tage 2021-09-01..2026-08-31, 1-min BID, Dukascopy Cash-CFD)
- Loader mit Volumen: sys.path.insert(0, '${BASE}/backtest/research'); from load_vol import load_days_vol; days = load_days_vol('${D}/nq')
  -> dict date -> (mods, opens, closes, lows, highs, vols); mods = Minute des Tages NEW-YORK-Zeit, chronologisch; ein Tag = NY-Kalendertag.
  Wochenend-/Feiertagsluecken; Sonntag nur ab 18:00; Dukascopy fuellt Feiertage teils mit flachen Bars (High==Low) -> filtern.
- Referenz-Implementierungen (nicht editieren): ${BASE}/backtest/research/round7.py (Feature-Quartil-Analyse), round9.py (build_var: Sweep+Reclaim-Simulation),
  ${BASE}/backtest/strategies_ldr.py (sauberer Strategie-Backtest mit Trade-CSV).

## EISERNE REGELN
1. Kein Look-Ahead: nur abgeschlossene Bars; im Entry-Bar NIE TP werten (SL konservativ ja); Limit-Fills nur durch spaetere Bars; SL vor TP im selben Bar.
2. Kosten je Roundtrip: NQ 0.75 Pkt (20 USD/Pkt), ES 0.4 Pkt (50 USD/Pkt), YM 2.5 Pkt (5 USD/Pkt).
3. TRAIN 2021-09-01..2024-12-31 zum Suchen/Waehlen; TEST 2025-01-01..2026-08-31 nur einmal zum Pruefen. Berichte beide getrennt.
4. Multiple Testing: Bei N=750 ist SD der WR ~1.8 pp. Zaehle, wie viele Varianten du probiert hast, und sag es.
5. Pure Python (kein numpy/pandas). Skripte NUR unter ${SP}/<dein_thema>/ (mkdir -p). Keine anderen Repo-Dateien aendern, kein git (das macht der Abschluss-Agent).
   Speichere pro Kandidat eine Trade-CSV (date, dir, entry_time, entry, sl, tp, result, pnl_usd) und das Skript.
6. Laufzeit: teile lange Laeufe auf, timeouts bis 600000 ms; CPU wird mit anderen Agenten geteilt – rechne effizient (bisect, Listen). python3 muss vorhanden sein (macOS: python3 aus Xcode-CLT reicht).
7. Alle Zeiten NY. Deutsche Zeit = NY + 6 h.

## Rueckgabe (StructuredOutput)
Alle ernsthaft getesteten Hypothesen kurz; jeder Kandidat mit exakten Regeln (nachbaubar ohne Rueckfrage), N, WR train/test, Trades/Woche,
Netto train/test, Jahren positiv, Skript- und CSV-Pfad. survivor = (N >= 750 UND WR_train >= 60 UND WR_test >= 58 bei RR 1:1) ODER
(N >= 300 UND WR_train >= 65 UND WR_test >= 63). Ehrliches Fazit.
`

const FAMILIES = [
  { key: 'bar_patterns', prompt: `THEMA: Bar-Pattern-Mining. Diskretisiere jede 1-min-Kerze (z.B. Body-Richtung, Body/Range-Klasse, Wick-Verhaeltnis, Range vs Median, Close-Position)
und enumeriere alle 3- und 4-Kerzen-Muster (Hunderte bis Tausende Klassen). Fuer jedes Muster x Zeitfenster (Stunde) x Richtung: Vorwaerts-Ergebnis eines 1:1-Trades
(Entry Open des naechsten Bars, SL/TP = k x ATR(20 Bars) oder Musterrange, bis 16:00). Nur Muster mit >= 400 Vorkommen im TRAIN. Reihenfolge: TRAIN-WR ranken,
Top 20 auf TEST pruefen, Multiple-Testing ausweisen (wie viele Muster getestet). Auch 5-min-Kerzen probieren. NQ zuerst, beste Muster auf ES/YM gegenpruefen.` },
  { key: 'level_clusters', prompt: `THEMA: Level-Cluster-Sweeps. Baue pro Tag die Level-Liste: PDH/PDL/PDC, Wochen-H/L (letzte 5 Tage), Overnight-H/L (18:00-09:30), Asia-H/L (18:00-02:00),
London-H/L (02:00-05:00), Premarket-H/L (05:00-09:30), Midnight-Open, Tages-Open 09:30, Vortages-VWAP, laufender VWAP, runde Zahlen (NQ: 50/100/250; ES: 10/25/50; YM: 100/250).
Definiere Cluster = >= 2 Levels innerhalb 0.1 x ATR10. Teste Sweep (echte Kreuzung) eines Clusters vs Einzel-Level, gefolgt von Reclaim-Close (mit Kerzenkoerper-Filter >= 0.6/0.75),
SL hinter Sweep-Extrem, TP 1R; ganzer Tag 02:00-15:30, mehrere Trades/Tag erlaubt (kein Overlap). Welche Level-Typen/Cluster-Groessen liefern >= 60 %? NQ, ES, YM.` },
  { key: 'swing_liquidity', prompt: `THEMA: 15-min-Swing-Liquiditaet (ICT Liquidity Pools). Baue 15-min-Kerzen aus 1-min, markiere Fraktal-Hochs/Tiefs (k=2 und k=3) als Pools.
Setup: 1-min-Sweep eines Pools (Low < Pool-Low bzw. High > Pool-High) und Reclaim-Close zurueck (Kerzenkoerper-Filter), optional 1-min-MSS als Bestaetigung; SL hinter Sweep-Extrem,
TP 1R. Auch: Pool-Alter (Stunden/Tage), Pool-Groesse, Anzahl der beruehrten Pools, Uhrzeit-Fenster, "Sweep beider Seiten" (Doppel-Pool). Ganzer Tag, mehrere Trades/Tag.
Ziel >= 3/Woche und >= 60 %. NQ, dann ES/YM.` },
  { key: 'sequences', prompt: `THEMA: Sequenz-Muster. (a) Doppel-Sweep: derselbe Level wird innerhalb X Minuten zweimal gesweept – Reversal nach dem zweiten? (b) Erster Reclaim-Trade eines Levels verliert (SL) – der
naechste Sweep/Reclaim desselben Levels? (c) Drei-Push-Muster (3 hoehere Hochs mit abnehmender Range), (d) Sweep -> Displacement-Kerze (Body >= 2x Median) -> Retest der Kerzenmitte als Entry,
(e) Failed-Breakout-Sequenz: Break einer Range-Seite mit Close ausserhalb, dann Close zurueck binnen 3 Bars. Alle mit RR 1:1, ganzer Tag, mehrere Trades/Tag. NQ, ES, YM.` },
  { key: 'regime', prompt: `THEMA: Regime x Setup. Definiere intraday bekannte Regime-Merkmale: realisierte 5-Tage-Vola-Perzentil, Overnight-Range/ATR, erste-30-min-Range/ATR, Trendstaerke (Anteil gleichfarbiger
5-min-Kerzen der letzten 60 min), Abstand zum VWAP in sigma, Tagestyp-Score. Teste, ob einfache Setups (Range-Reclaim, VWAP-Rueckkehr, Level-Sweep, Momentum-Breakout des 5-min-Hochs) in
bestimmten Regimen >= 60 % bei 1:1 erreichen – z.B. Mean-Reversion nur bei niedriger Vola + Range-Tag, Momentum nur bei hoher Vola. Wichtig: Regime muss VOR dem Entry bekannt sein.
Frequenz >= 3/Woche. NQ, ES, YM.` },
  { key: 'five_min_exec', prompt: `THEMA: 5-min-Ausfuehrung. Wiederhole die Kernlogiken (Session-Range-Sweep + Reclaim mit Kerzenkoerper-Filter; Level-Sweep + Reclaim; VWAP-Rueckkehr) mit 5-min-Kerzen fuer
Signal (Reclaim = 5-min-Close zurueck, Body >= 0.6/0.75 der 5-min-Kerze), Ausfuehrung weiter auf 1-min (Entry am 5-min-Close, SL hinter Sweep-Extrem, TP 1R). Vergleiche 1-min vs 5-min vs 15-min
Signal-Timeframe. Alle Session-Ranges (Asia, London, Premarket, Open, 08:12-09:12, Mittag), ganzer Tag. Ziel >= 60 % und >= 3/Woche. NQ, ES, YM.` },
  { key: 'feature_model', prompt: `THEMA: Feature-Modell. Sammle fuer ALLE Sweep+Reclaim-Events (alle Session-Ranges, alle Level-Typen, ganzer Tag, NQ) >= 25 Entry-Features (Sweep-Tiefe/-Dauer, Reclaim-Body,
Wicks, Volumen-Ratio, Range/ATR, Uhrzeit, Wochentag, Vortagstrend, Abstand zu PDH/PDL/VWAP, Overnight-Position, Vola-Perzentil, Anzahl Levels im Sweep, Richtung, ...).
Trainiere auf TRAIN eine logistische Regression (eigene Implementierung, Gradient Descent, L2) und alternativ einen kleinen Entscheidungsbaum (Tiefe 3) fuer P(Win) bei 1:1.
Waehle einen Schwellwert auf TRAIN, der >= 3 Trades/Woche liefert, und pruefe WR auf TEST. Berichte Feature-Gewichte. Kein Leakage (Features nur aus Vergangenheit).` },
  { key: 'es_ym_native', prompt: `THEMA: ES und YM mit eigenen Features. Die NQ-Regel (London Down-Day Reclaim) gilt dort nicht. Suche fuer ES und YM separat: Basis-Setups (London-, Asia-, Premarket-,
Open-Range Sweep+Reclaim; PDH/PDL-Sweep) mit 12+ Entry-Features, Quartil-Analyse auf TRAIN, Kombis auf TEST – wie ${BASE}/backtest/research/round7.py, aber mit ES/YM-typischen Ergaenzungen
(ES: Cash-Open-Gap, Overnight-Range; YM: runde 100er-Level). Zusaetzlich: Cross-Asset-Feature (NQ-Sweep-Status zum Zeitpunkt des ES-Entries). Ziel >= 60 % bei 1:1 und >= 3/Woche.` },
]

const CANDIDATE_SCHEMA = {
  type: 'object',
  properties: {
    family: { type: 'string' },
    variants_tested: { type: 'integer' },
    hypotheses_tested: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, result_summary: { type: 'string' } }, required: ['name', 'result_summary'] } },
    candidates: { type: 'array', items: { type: 'object', properties: {
      name: { type: 'string' }, instrument: { type: 'string' },
      rules: { type: 'string' }, trades: { type: 'integer' }, trades_per_week: { type: 'number' },
      winrate_train_pct: { type: 'number' }, winrate_test_pct: { type: 'number' }, avg_rr: { type: 'number' },
      net_usd_train: { type: 'number' }, net_usd_test: { type: 'number' }, years_positive: { type: 'string' },
      survivor: { type: 'boolean' }, script_path: { type: 'string' }, trades_csv: { type: 'string' }, caveats: { type: 'string' },
    }, required: ['name', 'instrument', 'rules', 'trades', 'trades_per_week', 'winrate_train_pct', 'winrate_test_pct',
                  'net_usd_train', 'net_usd_test', 'survivor', 'script_path', 'trades_csv'] } },
    honest_conclusion: { type: 'string' },
  },
  required: ['family', 'variants_tested', 'hypotheses_tested', 'candidates', 'honest_conclusion'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' }, issues_found: { type: 'array', items: { type: 'string' } },
    spot_checks: { type: 'string' }, recomputed_wr_train: { type: 'number' }, recomputed_wr_test: { type: 'number' },
    neighborhood_stable: { type: 'boolean' }, reasoning: { type: 'string' },
  },
  required: ['refuted', 'issues_found', 'spot_checks', 'reasoning'],
}

phase('Research')
log(`Starte ${FAMILIES.length} Forschungsagenten (Ziel: >=3 Trades/Woche, >=60 % bei 1:1)`)
const results = await pipeline(
  FAMILIES,
  f => agent(`${COMMON}\n\n${f.prompt}\n\nArbeite breit und effizient; halte jede Regel exakt ein; berichte strukturiert.`,
             { label: `research:${f.key}`, phase: 'Research', schema: CANDIDATE_SCHEMA, effort: 'high' }),
  async (res, f) => {
    if (!res) return { family: f.key, candidates: [], hypotheses_tested: [], variants_tested: 0, honest_conclusion: 'agent failed' }
    const survivors = (res.candidates || []).filter(c => c.survivor).slice(0, 2)
    log(`${f.key}: ${res.variants_tested} Varianten, ${(res.candidates || []).length} Kandidaten, ${survivors.length} Survivor`)
    const verified = await parallel(survivors.map(c => () => agent(
      `${COMMON}\n\nDU BIST SKEPTIKER. Widerlege diesen Kandidaten (im Zweifel refuted=true).\nKANDIDAT: ${c.name} (${c.instrument})\nREGELN: ${c.rules}\n` +
      `BERICHTET: N=${c.trades}, ${c.trades_per_week}/Woche, WR Train ${c.winrate_train_pct} / Test ${c.winrate_test_pct}, Netto Train ${c.net_usd_train} / Test ${c.net_usd_test}.\n` +
      `SKRIPT: ${c.script_path}\nCSV: ${c.trades_csv}\n\nPruefe: (1) Look-Ahead und Fill-Logik Zeile fuer Zeile + 5 Trades Minute fuer Minute gegen Rohdaten, ` +
      `(2) unabhaengiger Nachbau aus den Regeln in eigenem Code (nicht kopieren) -> WR Train/Test, (3) Nachbarschaft (Parameter +/-20 %, Split-Grenze 2024-06-30), ` +
      `(4) Multiple-Testing-Einordnung. Skripte unter ${SP}/verify_${f.key}/.`,
      { label: `verify:${f.key}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' })
      .then(v => ({ candidate: c, verdict: v, survives: !!v && !v.refuted }))))
    return { ...res, verified: verified.filter(Boolean) }
  },
)

phase('Synthesize')
const all = results.filter(Boolean)
const survivors = all.flatMap(r => (r.verified || []).filter(v => v.survives).map(v => ({ family: r.family, ...v })))
const refuted = all.flatMap(r => (r.verified || []).filter(v => !v.survives).map(v => ({ family: r.family, ...v })))
log(`Verifikation: ${survivors.length} ueberlebt, ${refuted.length} widerlegt`)
const synthesis = await agent(
  `Schreibe fuer Florian (deutsch, direkt, ehrlich) den Bericht dieser Runde als Markdown: (1) Tabelle aller 8 Familien mit Varianten-Anzahl und Kurzergebnis, ` +
  `(2) Tabelle der verifizierten Survivor (Regeln, N, Trades/Woche, WR Train/Test, Netto, Jahre, Skript/CSV), (3) widerlegte Kandidaten mit Grund, ` +
  `(4) Fazit inkl. Multiple-Testing, (5) konkrete naechste Schritte. Wenn keine Survivor: klar sagen.\n\nROHDATEN:\n` +
  JSON.stringify({ families: all.map(r => ({ family: r.family, variants: r.variants_tested, hypotheses: r.hypotheses_tested, candidates: r.candidates, conclusion: r.honest_conclusion })), survivors, refuted }, null, 1).slice(0, 150000),
  { label: 'synthesis', phase: 'Synthesize', effort: 'high' })
await agent(`Schreibe folgenden Markdown-Bericht nach ${BASE}/backtest/REPORT_R4_MAC.md (ueberschreiben), fuege dann ${BASE}/backtest/REPORT_R4_MAC.md und ${SP} (alle Skripte/CSVs, KEINE .pkl-Caches) mit git add hinzu, committe mit der Nachricht 'Runde 12 (Mac): Ergebnisse der breiten Suche' und pushe mit git push (Branch claude/backtest-range-reversals-aaiz2g). Bei Push-Fehler: einmal git pull --rebase und erneut pushen.\n\nBERICHT:\n${synthesis}`, { label: 'commit', phase: 'Synthesize', effort: 'low' })
return { report: synthesis, n_survivors: survivors.length, n_refuted: refuted.length,
         families: all.map(r => ({ family: r.family, variants: r.variants_tested, n_candidates: (r.candidates || []).length, conclusion: r.honest_conclusion })) }
