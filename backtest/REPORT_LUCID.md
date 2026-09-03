# Lucid Trading 50K: Wie viele $2.000-Payouts vor dem Breach?

Sechs Phasen, Code in `backtest/lucid/`. Kernaussage vorweg: Die Antwort kommt
**nicht** aus einer Strategie, sondern aus der Kontogeometrie. Keine der
getesteten Strategien überlebt die Multiple-Testing-Korrektur.

---

## Phase 0 — Regelabgleich

`support.lucidtrading.com` antwortet auf automatisierte Abrufe mit 403. Geprüft
wurde gegen mehrere unabhängige Sekundärquellen (Stand 2026).

**Bestätigt:** MLL 2.000 $ · Profit Goal 3.000 $ · Flex funded ohne Consistency ·
Direct 20 % Consistency · Direct DLL 1.200 $ Soft Breach · LucidScale 60 % ·
Direct Goals 3.000/2.500 $ · Direct Caps 2.000 $ (1–3) und 2.500 $ (4–5) ·
Flex Scaling 2/3/4 Minis bei 0/1.000/2.000 $ Profit, beidseitig ·
Deckel 4 Minis / 40 Micros · 5 Payouts · 90/10 · Flex 136 $ · Direct 520 $.

**Abweichungen:**
1. Direct zahlt über 5 Zyklen maximal **11.000 $**, nicht 10.000 $ (Payouts 4 und 5 dürfen 2.500 $).
2. **Initial Trail Balance 52.100 $ und Lock bei 50.100 $ konnten nicht bestätigt werden.** Das ist die tragende Annahme der ganzen Rechnung — der Puffer im Steady State hängt exakt daran. Muss im Dashboard verifiziert werden.
3. 2026 wurden 50K- und 150K-Preise angepasst, 150K-MLL auf 5.000 $ erhöht, ein 100K-Direct-Tier ergänzt. Lucid dreht aktiv an den Zahlen.
4. Eine Quelle formuliert den Flex-Cap als 50 % des *Kontostands* statt des *Profits*. Bei 4.000 $ Profit identisch, sonst nicht.

**Datenlage:** Dukascopy 1-min, Sep 2021 – Aug 2026, 1.301 Handelstage, NQ/ES/YM/Gold/WTI.
Cash-Index-CFD, keine echten Futures, keine Ticks. EURUSD lädt noch.

---

## Phase 1 — Simulator (`lucid/sim.py`, `lucid/test_sim.py`)

Tagweise Zustandsmaschine. **57 Unit-Tests, alle grün.** Abgedeckt:

| Mechanik | Tests |
|---|---|
| MLL trailt dem EOD-Hoch, lockt bei exakt 52.100 auf 50.100, danach für immer | 8 |
| Intraday-Dip breacht nicht, EOD-Close darunter schon, Gegentest schaltbar | 5 |
| Flex-Scaling 2/3/4 Minis, in beide Richtungen, Rücksetzer gezählt | 8 |
| Flex-Payout: 5×150-Zähler, 50 %-Regel, Cap, MLL-Reset, 90 % netto | 11 |
| Direct: Goals 3.000/2.500, 20 % Consistency exakt an der Grenze, Caps 4/5, DLL-Sperre, LucidScale steigt und sinkt nie | 17 |
| Steady State: Puffer 1.900 $ nach dem Payout | 4 |
| 5-Payout-Limit, Handel nach Breach wirft | 4 |

**Validierung gegen die analytische Lösung** (`lucid/diag.py`): Steady-State-Zyklus
52.000 → 54.000 gegen Barriere 50.100, driftloser Walk in Schritten von 280 $.
Analytisch 48,7 %, reiner Walk 49,7 %, Simulator 49,7 %. Übereinstimmung.

**Gefundener Fehler im eigenen Versuchsaufbau:** Der erste Coinflip-Pool wurde per
Zufallsziehung erzeugt und wich bei N=600 um bis zu 3,3 Prozentpunkte von der
angeforderten Quote ab (52 % angefordert → 55,3 % realisiert). Weil das System
extrem empfindlich auf die Trefferquote reagiert, verfälschte das alle
Null-Modell-Zahlen um den Faktor 4. Behoben: die Gewinnzahl wird jetzt exakt
gesetzt und nur die Reihenfolge gemischt.

---

## Phase 2 — Hypothesen

**Vor dem Backtest verworfen** (keine überzeugende Antwort auf „wer verliert und warum weiter"):
Opening-Range-Breakout und Turtle Soup (zu bekannt, bereits über 9.113 Varianten bei 48–51 %) ·
SMT-Divergenz NQ/ES (keine Gegenpartei-Story) · Volumen-Klimax (getestet, 47–53 %) ·
Time-of-Day-Drift (real, aber kostengefressen) · Economic-Calendar (keine Daten) ·
Round-Number-Fade (nur auf Gold und WTI, nicht auf drei Indizes → verdächtig) ·
Prior-Day-High/Low (Parameterreaktion ist ein Hump statt eines Plateaus).

**Getestet:**

| # | Hypothese | Ineffizienz | Gegenpartei |
|---|---|---|---|
| H1 | Gap-Continuation | Über Nacht akkumulierte Information wird bei Eröffnung nicht sofort eingepreist; MOO- und Rebalancing-Flow arbeitet sich über Minuten ab | Retail-Trader mit „Gaps werden immer geschlossen"; Market Maker, die die Eröffnungsauktion glätten müssen |
| H2 | VWAP-3σ-Reclaim | Extreme Abweichung zieht Rebalancing-Flow von VWAP-Benchmark-Ausführern an | Algo-Ausführer mit VWAP-Mandat, die per Konstruktion gegen die Abweichung handeln müssen — Mandat, nicht Gewinnmotiv |
| H13 | Payout-Policy | Der Request lockt die MLL sofort auf 50.100 — ein früher Payout zerstört den Puffer | Kontomechanik, kein Markt |
| H14 | Puffer-proportionale Größe | Ruin-Wahrscheinlichkeit nahe der Barriere senken | Kontomechanik |
| H15 | Flex-Scaling-Feedback | Drawdown → kleinere Size → langsamere Erholung → mehr Zeit an der Barriere | Kontomechanik |
| H16 | Kontotyp Flex vs Direct | — | — |

**Testbudget festgelegt:** 42 Parameterkombinationen in Phase 3 (2 Instrumente ×
[3 Gap-Schwellen × 4 Barrieren + 3 Sigma × 3 Startzeiten]).

---

## Phase 3 — Train/Validation (`lucid/phase3.py`)

Split vor dem ersten Backtest: Train 2021-09 – 2023-12 · Validation 2024 · Holdout ab 2025-01.

Von 42 Zellen sind **3 in beiden Perioden positiv**:

| Kandidat | Train Sharpe | Validation Sharpe |
|---|---|---|
| NQ VWAP 3,0 σ ab 11:00 | +0,69 (N=170) | +0,50 (N=68) |
| NQ VWAP 3,0 σ ab 11:30 | +0,73 (N=134) | +0,30 (N=51) |
| NQ VWAP 2,5 σ ab 11:30 | +0,05 (N=301) | +1,27 (N=122) |

H1 Gap fällt durch: NQ g=0,3/k=4 hat Train +0,81, Validation −1,18. ES hat Train
durchweg negativ und Validation stark positiv — der Effekt liegt komplett in 2024.

### Multiple-Testing-Korrektur (`lucid/phase3b.py`)

Deflated Sharpe Ratio nach Bailey/López de Prado über den besten Kandidaten
(beobachteter Sharpe konservativ = min(Train, Val) = +0,50, n_obs = 206 Handelstage,
Varianz der Sharpes über die Versuche = 2,77):

| Versuche N | E[max Sharpe] unter H0 | DSR |
|---|---|---|
| 42 (nur Phase 3) | 3,68 | 0,000 |
| 640 (+ die Gitter, aus denen die Hypothesen kamen) | 5,20 | 0,000 |
| 2.900 (+ Verlierer-Jagd über 5 Instrumente) | 5,90 | 0,000 |
| 380.000 (die gesamte Suche dieser Sitzung) | 7,78 | 0,000 |

Die Korrektur wird gar nicht gebraucht: Ein annualisierter Sharpe von 0,50 über
206 Tage hat einen **t-Wert von 0,45**. Der Kandidat ist schon roh nicht signifikant.

---

## Phase 4 — Holdout (`lucid/phase4.py`, `lucid/phase4b.py`)

**Vorbehalt:** Der Zeitraum ab 2025-01 diente in früheren Runden dieser Sitzung
bereits als Test-Hälfte und wurde dort rund 30 Mal angesehen. Er ist kein
unberührtes Holdout mehr. Wirklich unberührt wäre nur EURUSD (lädt noch).

### Das Null-Modell ist die eigentliche Antwort

NQ-Micros, 1 Trade/Tag, RR 1:1, exakt 50 % Trefferquote, Stop 20 Punkte, 5.000 Läufe:

| Payouts | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Flex, 600 $, „erst voll" | **83,4 %** | 9,3 % | 3,7 % | 1,7 % | 1,1 % | 0,9 % |
| Flex, 600 $, „so früh wie möglich" | 55,7 % | 28,3 % | 9,2 % | 3,6 % | 1,7 % | 1,5 % |
| Direct, 600 $ | 76,4 % | 18,1 % | 3,4 % | 1,3 % | 0,4 % | 0,4 % |

Bedingte Übergänge Flex 600 $ „erst voll": 0→1 **17 %** · 1→2 44 % · 2→3 50 % ·
3→4 54 % · 4→5 44 %. Median 22 Tage bis Payout 1, 82 Tage bis Payout 5.

**Der erste Payout ist die eigentliche Hürde.** Danach ist es ungefähr ein
Münzwurf pro Zyklus. Das deckt sich exakt mit der Geometrie: Von 50.000 aus
brauchst du +4.000 gegen eine *mitlaufende* Barriere von 2.000 → 17–20 %.
Im Steady State stehst du bei 52.000 mit 1.900 Puffer und brauchst +2.000 →
1.900/3.900 = **48,7 % je Zyklus**.

**Erwartete Kette:** Wer den ersten Payout schafft, holt im Erwartungswert noch
etwa einen weiteren. Über alles gerechnet sind es 0,2 Payouts pro gekauftem Konto.

### Die Strategien im Holdout

| Strategie | N | WR | P(5 Payouts) | EV je Konto |
|---|---|---|---|---|
| Null-Modell 50 % | — | 50,0 % | 0,9 % | +412 $ |
| H1 Gap NQ | 146 | 55,5 % | 7,4 % | +1.553 $ |
| H1 Gap ES | 142 | 55,6 % | 3,3 % | +958 $ |
| H2 VWAP NQ | 85 | 60,0 % | 42,8 % | +4.739 $ |
| H2 VWAP ES | 98 | 56,1 % | 17,1 % | +2.554 $ |

Sieht gut aus — ist aber eine Punktschätzung auf 85 bis 146 Trades.

### Unsicherheit der Trefferquote durchgerechnet (Phase 4b)

Je Monte-Carlo-Lauf wird zuerst die wahre Quote aus ihrer Posterior gezogen
(Beta(Gewinne+1, Verluste+1)), dann simuliert:

| Strategie | 95 %-Intervall der wahren Trefferquote |
|---|---|
| H1 Gap NQ | 47,5 % – 63,4 % |
| H1 Gap ES | 47,2 % – 63,3 % |
| H2 VWAP NQ | 49,5 % – 69,4 % |
| H2 VWAP ES | 46,3 % – 65,6 % |

**In jedem einzelnen Fall liegt die Untergrenze bei oder unter 50 %.** Keine der
Strategien lässt sich vom Null-Modell unterscheiden. Und die Beta-Posterior
erfasst nur den Stichprobenfehler — der Selektionsbias verschiebt die wahre Quote
systematisch nach unten.

---

## Phase 5 — Ergebnis

### Flex vs Direct

| | LucidFlex | LucidDirect |
|---|---|---|
| Preis | 136 $ | 520 $ |
| EV bei 50 % WR | **+412 bis +607 $** | +24 bis +80 $ |
| EV bei 54 % WR | +1.159 $ | +703 $ |
| Erste Hürde | 4.000 $ Profit | 3.000 $ Profit, aber 20 % Consistency |
| Bremse | Scaling-Tier fällt bei Drawdown | Consistency blockiert Payouts |

**Flex gewinnt klar** — allein wegen des Preises. Bei 50 % Trefferquote ist Direct
bei 300 $ Risiko sogar negativ (−156 $), Flex nie.

Der Flex-Scaling-Loop kostet messbar: im Mittel 2,8 bis 9,9 Tier-Rücksetzer pro
Kontoleben bei der „erst voll"-Policy. Jeder Rücksetzer halbiert die
Erholungsgeschwindigkeit an genau der Stelle, an der man sie braucht.

Die Direct-Consistency blockiert bei niedriger Trefferquote fast nie (0,0–1,4
Blockaden), bei hoher Trefferquote massiv (bis 84 Blockaden pro Kontoleben) —
weil dann einzelne große Gewinntage die 20 % sprengen.

### Positionsgröße

Puffer-proportionales Risiko (Risiko = 35 % des Abstands zum Breach-Level) ist in
**jeder einzelnen Zelle schlechter** als festes Risiko:

| | fest | puffer-proportional |
|---|---|---|
| Flex 600 $, 50 % WR, EV | +437 $ | +263 $ |
| Flex 900 $, 50 % WR, EV | +574 $ | +253 $ |
| Direct 600 $, 50 % WR, EV | +80 $ | −108 $ |

Grund: Das Ziel ist in Dollar fixiert. Wer nahe der Barriere kleiner handelt,
erreicht die 54.000 nicht mehr — er verlängert nur das Sterben.

**Optimal:** festes Risiko, 600 bis 900 $, also 1,5 bis 2,25 × mehr als die
klassische 1-%-Regel. Die gekappte Verlustseite belohnt Aggressivität.

### Payout-Policy

Zwei verschiedene Ziele, zwei verschiedene Antworten:

- **Maximaler Dollar-EV:** so früh wie möglich auszahlen (+536 $ vs +437 $ bei 50 % WR). Man nimmt die kleinen Beträge mit, bevor das Konto stirbt.
- **Maximale Payout-Anzahl:** erst auf 54.000, dann volle 2.000 $. Bei 54 % WR liefert „erst voll" +1.159 $ gegen +926 $ für „so früh wie möglich".

Ab etwa 53 % Trefferquote dreht sich das Vorzeichen.

### Was die Strategie am wahrscheinlichsten killt

1. **Der erste Zyklus.** Von 50.000 auf 54.000 gegen eine mitlaufende 2.000er-Barriere: 17–20 % Erfolgsquote bei NullEdge. Vier von fünf Konten sterben, bevor je ein Dollar fließt.
2. **Die Empfindlichkeit gegenüber der Trefferquote.** 50 % → 49 % Zyklusüberleben. 55 % → 72 %. 59 % → 88 %. Drei Prozentpunkte Schätzfehler ändern P(5 Payouts) um eine Größenordnung. Und drei Prozentpunkte sind bei N=100 genau ein halbes Sigma.
3. **Kosten.** Bei 20 Punkten Stop auf NQ-Micros sind 1,70 $ Round Turn je Micro rund 4 % des Risikos. Bei mehr Trades pro Tag skaliert das linear und frisst jeden gefundenen Vorsprung.
4. **Der Flex-Scaling-Loop** nach jedem größeren Drawdown.

---

## Abbruchkriterium: erreicht

**Keine robuste Strategie gefunden.** Der beste Kandidat (NQ VWAP 3 σ ab 11:00) hat
einen rohen t-Wert von 0,45, eine Deflated Sharpe Ratio von 0,000 bei jeder
ehrlichen Versuchszahl, und sein 95 %-Intervall für die wahre Trefferquote
schließt 50 % ein. Er ist von einem Münzwurf nicht unterscheidbar.

**Was trotzdem gilt und das eigentliche Ergebnis ist:** Die Kontostruktur hat für
sich genommen einen positiven Erwartungswert, weil die Verlustseite bei 136 $
gekappt ist. Ein LucidFlex-Konto mit einer Nullstrategie und 600–900 $ festem
Risiko liefert **+412 bis +607 $ Erwartungswert pro gekauftem Konto** — nicht
weil man Geld verdient, sondern weil man eine billige Option kauft.

Die Antwort auf die Ausgangsfrage lautet damit: **Median 0 Payouts. Wer den ersten
schafft, holt im Erwartungswert noch etwa einen weiteren. P(alle fünf) liegt ohne
Edge bei rund 1 %.**

---

## Phase 6 — Sauberer Out-of-Sample-Test auf EURUSD (`lucid/phase6_eurusd.py`)

EURUSD wurde in dieser gesamten Untersuchung nie angefasst: kein Scan, kein
Gitter, kein Blick. Damit ist es der einzige echte Out-of-Sample-Test, der
uebrig bleibt. Getestet wurden die beiden Kandidaten mit **festen** Parametern
aus Phase 3 und 4 — keine Anpassung, keine Auswahl, zwei Vorhersagen.
1.301 Handelstage.

| Kandidat | N | Trefferquote | 95 %-Intervall | z gegen 50 % |
|---|---|---|---|---|
| H1 Gap-Continuation, g=0,3, k=4 | 641 | 50,7 % | 46,8 – 54,6 % | +0,36 |
| H2 VWAP-Reclaim, 3,0 σ ab 11:00 | 166 | 52,4 % | 44,8 – 59,9 % | +0,62 |

**Beide Vorhersagen bestaetigen sich nicht.** Die Intervalle schliessen 50 %
bequem ein, und beide Zellen liegen auf oder unter dem Median des Instruments
selbst (volles Gitter ueber 21 Zellen: Median 51,9 %, Mittel 51,6 %,
Spanne 48,8 – 54,2 %). Die Kandidaten sind auf ungesehenen Daten nicht einmal
ueberdurchschnittliche Zellen.

Die hoechste Einzelzelle ist Gap g=0,2/k=2 mit 54,2 % (z=+2,46). Bei 21 Zellen
liegt der erwartete Maximal-z-Wert aus reinem Rauschen bei rund 2,1 — und es ist
ausgerechnet die engste Barriere, wo der Anteil intrabar-unentscheidbarer Faelle
am groessten ist. Kein Fund.

**Damit ist das Abbruchkriterium endgueltig erfuellt.** Der einzige unabhaengige
Test, den dieses Projekt noch hatte, faellt negativ aus.

---

### Grenzen dieser Rechnung

- Trail-Balance 52.100 und Lock 50.100 sind unbestätigt und tragen das Ergebnis.
- „Intraday breacht nicht" ist als schaltbare Annahme implementiert, aber nicht verifiziert. Bei aktivem Intraday-Breach fallen alle Zahlen deutlich.
- Cash-Index-CFD statt echter Futures, keine Ticks.
- Das Holdout ist durch frühere Runden kontaminiert.
- Das Modell nimmt an, dass Lucid tatsächlich auszahlt. Zahlungsausfall- und Regeländerungsrisiko sind nicht bepreist.
